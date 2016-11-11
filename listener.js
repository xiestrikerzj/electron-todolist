/**
 * Created by Striker on 2016/9/24.
 */

;(()=> {
    window.co = require('co');
    window.file = require('./file.js').file;
    window.Db = require('./db.js').Db;

    setTimeout(function () {

    }, 200);

    let fn = {
        startListener(listenerMap){
            $.each(listenerMap, (event, filters)=> {
                $.each(filters, (filter, handler)=> {
                    params = [].concat(event, filter, handler);
                    Common.$body.on.apply(Common.$body, params);
                })
            });
        },

        startWinListener(listenerMap = fn.winListenerMap()){
            $.each(listenerMap, (event, handler)=> {
                $(window).on(event, handler);
            })
        },

        // 监听事件映射方法，返回一个对象用于映射事件名、元素筛选器和处理函数，
        // 该对象包含的所有映射关系将在startListener方法中被统一注册成标准的jq事件监听
        listenerMap() {
            return {
                "click": { // 事件名，下同
                    [Filter.newTodoBtn](){ // 元素筛选器和处理函数，下同
                        let newTodoCont = Common.$newTodoInput.val(), status;

                        if (newTodoCont !== "") {
                            let contList = newTodoCont.split(/\n/).reverse(), // 批量导入时最新的todo项在最上面
                                dataList = [];
                            $.each(contList, (ind, cont)=> {

                                // 如果内容中包含‘done’字样，则新待办项的默认状态为已完成
                                if (cont.includes('done')) {
                                    status = 'finished';
                                    cont = cont.replace('done', '');
                                } else {
                                    status = undefined;
                                }
                                cont !== '' && dataList.push($.extend(true, {}, Conf.newTodoItemForm(), {
                                    cont: cont,
                                    status: status
                                }));
                            });
                            co(function*() {
                                yield Db.addDatas({datas: dataList});
                                Render.refreshTodoList();
                                Fn.initCommonDom(null, Common);
                                Common.$newTodoInput.val(null);
                                Common.$newTodoInput.trigger('input');
                            }).catch(e=> {
                                l(e);
                            });
                        }
                    },
                    [Filter.todoItem](e){
                        let $this = $(this), $thisCont = $this.find(Filter.todoCont);
                        $this.css({'height': 'auto'});
                        $thisCont.css({
                            'overflow': 'inherit',
                            'white-space': 'initial',
                        });
                    },
                    [Filter.todoCont](e){
                    },
                    [Filter.todoDateTime](e){
                        let $this = $(this), thisDate = $this.data('time'),
                            $thisDateTodos = $(`${Filter.todoItem}[data-time="${JSON.stringify(thisDate)}"]`);
                        $thisDateTodos.toggle();
                    },
                    [Filter.todoItemBtnGroup](e){
                        e.stopPropagation();
                    },
                    [Filter.finishItemBtn](e){
                        fn.updateTodoItemWithEvent({
                            event: e, valObj: {
                                status: "finished"
                            }
                        });
                    },
                    [Filter.deleteItemBtn](e){
                        fn.updateTodoItemWithEvent({
                            event: e, valObj: {
                                status: "deleted"
                            }, callback: (data)=> {
                                Render.refreshTodoList();
                            }
                        });
                    },
                    [Filter.modifyItemBtn](e){
                        let it = fn.getTodoItemWithEvent(e);
                        it.$thisItem.html(Temp.inputGroup({
                            value: it.itemText,
                            btnHtml: Temp.todoBtns()['save'],
                            css: "margin:-7px 0 -7px -14px;"
                        }));
                        let $thisInput = it.$thisItem.find(Filter.todoItemInput);
                        $thisInput.focus().get(0).selectionStart = $thisInput.val().length; // 把光标移到代编辑内容尾部
                        //$thisInput.focus().val($thisInput.val()); // 把光标移到代编辑内容尾部
                        $(Filter.textarea).trigger('input'); // 触发textarea的input事件，重新设置textarea高度
                    },
                    [Filter.itemModifyDoneBtn](e){
                        let it = fn.getTodoItemWithEvent(e);
                        fn.updateTodoItemWithEvent({
                            event: e, valObj: {
                                cont: it.itemInputText,
                                updateTime: (new Date()).getTime()
                            }
                        });
                    },
                    [Filter.filterBtn](e){
                        let $this = $(this);
                        let filterKey = $this.data('val');
                        // filterkey !== 'deleted' && $this.addClass('btn-primary').siblings().removeClass('btn-primary');
                        $(Filter.filterBtn).removeClass('btn-primary');
                        $this.addClass('btn-primary');

                        // 更新搜索状态和搜索按钮样式
                        Db.updateDataByIndex({
                            valObj: {statusFilter: filterKey}, callback: (data)=> {
                                Db.getTodoDatas({status: data.statusFilter, tags: data.tagsFilter});
                            }
                        });
                    },
                    [Filter.unfinishItemBtn](e){
                        fn.updateTodoItemWithEvent({
                            event: e, valObj: {
                                status: "unfinished"
                            }
                        })
                    },
                    [Filter.tagsBtn](e){
                        var $this = $(this),
                            $thisTodo = $this.parents(Filter.todoItem);
                        var $thisBtnGroup = $thisTodo.find(Filter.todoItemBtnGroup);
                        Render.tagsBox({
                            tags: $thisTodo.data('tags'),
                            $container: $thisBtnGroup.find(Filter.tagsBox)
                        });
                    },
                    [Filter.myTag](e){
                        var $this = $(this),
                            $thisTodo = $this.parents(Filter.todoItem),
                            thisVal = String($this.data('val')),
                            thisTodoTags = $thisTodo.data('tags'),
                            thisValInd = thisTodoTags.indexOf(thisVal);
                        thisTodoTags.splice(thisValInd, 1);
                        (thisTodoTags.length === 0) && thisTodoTags.push(Conf.noTagTxt); // 如果删除标签后待办项没标签了，补上“无标签”标签
                        fn.updateTodoItemWithEvent({event: e, valObj: {tags: thisTodoTags}}); // 更新數據庫&&重繪待辦
                    },
                    [Filter.otherTag](e){
                        var $this = $(this),
                            $thisTodo = $this.parents(Filter.todoItem),
                            thisVal = String($this.data('val')),
                            thisTodoTags = $thisTodo.data('tags');
                        thisTodoTags.push(thisVal);
                        thisTodoTags.includes(Conf.noTagTxt) && thisTodoTags.splice(thisTodoTags.indexOf(Conf.noTagTxt), 1); // 如果待办项没标签，加上标签后去掉“无标签”标签
                        fn.updateTodoItemWithEvent({event: e, valObj: {tags: thisTodoTags}}); // 更新數據庫&&重繪待辦
                    },
                    [Filter.newTagBtn](e){
                        var $this = $(this);
                        var $thisInput = $(Temp.inputGroup({
                            className: 'newTagInput',
                            placeholder: "回车新建标签",
                            css: "margin: 0 auto; height: 30px;"
                        }));
                        $this.replaceWith($thisInput);
                        $thisInput.focus();
                    },
                    [Filter.tagFilterContainer](e){
                        $(this).toggleClass('open');
                    },
                    [Filter.tagMenuItem](e){
                        let $this = $(this),
                            thisVal = String($this.data('val')),
                            tagsFilter;
                        co(function*() {
                            let data = yield Db.getDataByIndex({})

                            if (data.tagsFilterWay === 'multi') {
                                tagsFilter = data.tagsFilter;
                                if (tagsFilter.includes(thisVal) && tagsFilter.length > 1) {
                                    tagsFilter.splice(tagsFilter.indexOf(thisVal), 1);
                                } else if (!tagsFilter.includes(thisVal)) {
                                    tagsFilter.push(thisVal);
                                }
                            } else {
                                tagsFilter = [thisVal];
                            }

                            Common.$tagFilterInput.val(`标签:${tagsFilter.join(',')}`); // 输入框显示为点击的按钮文案

                            // 更新搜索状态和搜索按钮样式
                            Db.updateDataByIndex({
                                valObj: {tagsFilter: tagsFilter}, callback: (appStatus)=> {
                                    Db.getTodoDatas({status: appStatus.statusFilter, tags: appStatus.tagsFilter});

                                    // 渲染标签筛选菜单项
                                    Render.tagMenuItem({tags: appStatus.tags, actTags: appStatus.tagsFilter});
                                }
                            });
                        });
                    },
                    [Filter.tagFilterWayBtn](e){
                        let $this = $(this),
                            thisVal = $this.data('val') || 'single';
                        if (thisVal === 'all') {
                            Common.$tagFilterInput.val('标签:所有标签');
                            Db.updateDataByIndex({
                                valObj: {tagsFilter: []},
                                callback: (data)=> {
                                    Render.tagMenuItem({tags: data.tags, actTags: data.tags});
                                    Db.getTodoDatas({status: data.statusFilter, tags: data.tagsFilter});
                                }
                            });
                        } else {
                            Render.tagFilterWayBtns({hideBtn: thisVal});
                            Db.updateDataByIndex({valObj: {tagsFilterWay: thisVal}});
                        }
                    },
                },
                "dblclick": {
                    [Filter.todoItemBtnGroup](e){
                        e.stopPropagation();
                    },
                    [Filter.todoItem] (e){
                        let $this = $(this);
                        $this.find(Filter.modifyItemBtn).click();
                    }
                },
                "mouseenter mouseleave": {
                    [Filter.todoItem] (e){
                        let $this = $(this);
                        switch (e.type) {
                            case "mouseenter":
                                $this.find(Filter.todoItemBtnGroup).addClass('show').show();
                                $this.siblings().find(Filter.todoItemBtnGroup).removeClass('show').hide();
                                break;
                            case "mouseleave":
                                $this.find(Filter.todoCont).css({
                                    'overflow': 'hidden',
                                    'white-space': 'nowrap',
                                });
                                break;
                        }
                    },
                },
                "keypress": {
                    [Filter.newTodoInput](e){
                        switch (e.keyCode) {
                            case 13: // enter
                                Common.$newTodoBtn.click();
                                break;
                            case 27: // esc
                                Common.$newTodoInput.val("");
                                break;
                        }
                    },
                    [Filter.todoItemInput](e){
                        let it = fn.getTodoItemWithEvent(e);
                        switch (e.keyCode) {
                            case 13: // enter
                                //it.$thisItem.find(Filter.itemModifyDoneBtn).click();
                                break;
                            case 27: // esc
                                Db.getDataByKey(it.itemId, (data)=> {
                                    Render.updateTodoItem(it.$thisItem, data);
                                });
                                break;
                        }
                    },
                    [Filter.newTagInput](e){
                        co(function*() {
                            let data = yield Db.getDataByIndex({});
                            var $this = $(this), tagList = data.tags;
                            switch (e.keyCode) {
                                case 13: // enter
                                    var val = $this.val();
                                    if (tagList.includes(val)) {
                                        alert('该标签已存在');
                                    } else if (val.length === 0) {
                                        alert('请输入标签名');
                                    } else if (val.length > 6) {
                                        alert('标签太长');
                                    } else {
                                        tagList.push(String(val));
                                        //tagList.includes(Conf.noTagTxt) && tagList.splice(tagList.indexOf(Conf.noTagTxt), 1); // 如果待办项没标签，加上标签后去掉“无标签”标签
                                        var $tag = $(Temp.tag({cont: val, className: 'otherTag'}));
                                        $this.before($tag);
                                        $tag.click();
                                        Db.updateDataByIndex({
                                            valObj: {tags: tagList}
                                        });
                                        Render.tagMenuItem({tags: tagList, actTags: data.tagsFilter});
                                    }
                                    break;
                            }
                        });
                    },

                    // textarea静止回车换行
                    [Filter.textarea](e){
                        if (e.keyCode === 13) {
                            if (window.event)
                                window.event.returnValue = false;
                            else
                                e.preventDefault();//for firefox
                        }
                    },
                },
                "keydown": {},
                "focus": {
                    [Filter.tagFilterInput](e){
                        Common.$tagFilterDropdownBtn.click();
                    }
                },
                "blur": {

                    // 当修改代办项的输入框失去焦点时，默认用修改后的内容替换原内容，并隐藏编辑框
                    [Filter.todoItemInput](e){
                        let it = fn.getTodoItemWithEvent(e);
                        //it.$thisItem.find(Filter.itemModifyDoneBtn).click();

                        // 待办项编辑选项失去焦点时，自动给新建待办项输入框加上焦点
                        Common.$newTodoInput.focus();
                    },

                    [Filter.newTagInput](e){
                        var $this = $(this);
                        $this.replaceWith(Temp.todoBtns()['newTag']);
                    },

                    // 在所有元素都失去焦点的情况下
                    //[Filter.body](e){
                    //
                    //}
                },
                "input": {
                    [Filter.textarea](e){
                        let $this = $(this);
                        $this.css('height', '34px').css('height', `${$this.prop('scrollHeight')}px`);
                    }
                }
            }
        },

        // 窗口监听事件映射，和上面的事件映射函数一样，因为窗口的事件监听不能用字符串作为筛选器
        // 所以单独做一个映射，被startWinListener注册为 标准的jq事件监听
        winListenerMap() {
            return {
                "beforeunload"(e){
                    File.exportDataToBakFile();
                },
                scroll(e){
                    $(Filter.scrollbarThumbStyle).html(`
                        ::-webkit-scrollbar-thumb {
                        background: #7d7d7d;
                        }`);
                    clearTimeout(Common.scrollTimer);
                    Common.scrollTimer = setTimeout(()=> {
                        $(Filter.scrollbarThumbStyle).html(`
                        ::-webkit-scrollbar-thumb {
                        background: white;
                        }`)
                    }, 500);
                },
                scrollstop(e){
                    debugger
                }
            }
        },

        getTodoItemWithEvent(event){
            let $this = $(event.target);
            let $thisItem = $this.parents(Filter.todoItem) || $this;
            return {
                $this: $this
                , $thisItem: $thisItem
                , itemId: $thisItem.data('id')
                , itemText: $thisItem.data('cont')
                , itemInputText: $thisItem.find(Filter.todoItemInput).val()
            }
        },

        // 更新數據庫&&重繪待辦
        updateTodoItemWithEvent({event, valObj, callback, isDeepExtend = false}){
            let it = fn.getTodoItemWithEvent(event);
            Db.updateDataByPrimaryKey({
                key: it.itemId,
                valObj: $.extend(valObj, {updateTime: (new Date()).getTime()}),
                isDeepExtend: isDeepExtend,
                callback: (data)=> {
                    if (typeof data !== "undefined") {
                        Render.updateTodoItem(it.$thisItem, data);
                        callback && callback(data);
                    }
                }
            });
        }
    };

    // Fn.initCommonDom(Filter, Common);

    window.Listener = fn;
    exports.Listener = fn;
})();