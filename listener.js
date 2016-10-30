/**
 * Created by Striker on 2016/9/24.
 */

(()=> {
    let Temp = require('./render.js').Temp;
    let Render = require('./render.js').Render;
    let Db = require('./db.js').Db;

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
                        let newTodoCont = Common.$newTodoInput.val();
                        if (newTodoCont !== "") {
                            let targData = $.extend(true, {}, Conf.newTodoItemForm(), {cont: newTodoCont});
                            Db.addDatas(targData, (e)=> {
                                let dataInd = e.target.result;
                                Db.getDataByKey(dataInd, (data)=> {
                                    Render.aNewTodoItem(data);
                                    Fn.initCommonDom(null, Common);
                                    Common.$newTodoInput.val(null);
                                });
                            });
                        }
                    },
                    [Filter.todoItem](e){
                        //let $this = $(e.target);
                        //$this.siblings().find(Filter.todoItemBtnGroup).removeClass('show').hide();
                        //$this.find(Filter.todoItemBtnGroup).toggleClass('show');
                    },
                    [Filter.todoItemBtnGroup](e){
                        e.stopPropagation();
                    },
                    [Filter.finishItemBtn](e){
                        fn.updateTodoItemWithEvent(e, {
                            status: "finished"
                        });
                    },
                    [Filter.deleteItemBtn](e){
                        let it = fn.getTodoItemWithEvent(e);
                        Db.deleteDataByKey(it.itemId);
                        Render.updateTodoItem(it.$thisItem, {});
                    },
                    [Filter.modifyItemBtn](e){
                        let it = fn.getTodoItemWithEvent(e);
                        it.$thisItem.html(Temp.inputGroup({value: it.itemText, btnHtml: Temp.todoBtns()['save']}));
                        let $thisInput = it.$thisItem.find(Filter.todoItemInput);
                        $thisInput.focus().val($thisInput.val()); // 把光标移到代编辑内容尾部
                    },
                    [Filter.itemModifyDoneBtn](e){
                        let it = fn.getTodoItemWithEvent(e);
                        fn.updateTodoItemWithEvent(e, {
                            cont: it.itemInputText
                        });
                    },
                    [Filter.filterBtn](e){
                        let $this = $(this);
                        let filterMap = {all: "all", finished: 'finished', unfinished: 'unfinished'};
                        let filterKey;
                        $.map(filterMap, (item, key)=> {
                            if ($this.hasClass('filter-' + item)) {
                                filterKey = key;
                            }
                        });
                        if (typeof filterMap === 'undefined') return;
                        Common.$todolistContainer.html('');
                        if (filterKey === 'all') {
                            Render.allTodoDataFromStore();
                        } else {
                            Db.getDatasByIndex({
                                IDBKeyRange: IDBKeyRange.only(filterKey), eachCallback: (cursor)=> {
                                    // debugger
                                    let data = cursor.value;
                                    console.log(data);
                                    Render.aNewTodoItem(data);
                                }
                            });
                        }
                    },
                    [Filter.unfinishItemBtn](e){
                        fn.updateTodoItemWithEvent(e, {
                            status: "unfinished"
                        })
                    },
                    [Filter.tagsBtn](e){
                        var $this = $(this),
                            $thisTodo = $this.parents(Filter.todoItem);
                        if ($thisTodo.find(Common.$tagBoxContainer).length > 0) {
                            Common.$tagBoxContainer.remove();
                        } else {
                            var $thisBtnGroup = $thisTodo.find(Filter.todoItemBtnGroup);
                            $thisBtnGroup.append(Common.$tagBoxContainer);
                            Render.tagsBox($thisTodo.data('tags'));
                        }
                    },
                    [Filter.myTag](e){

                    },
                    [Filter.otherTag](e){
                        var $this = $(this),
                            $thisTodo = $this.parents(Filter.todoItem),
                            thisVal = $this.data('val'),
                            thisTodoTags = $thisTodo.data('tags');
                        thisTodoTags.push(thisVal);
                        fn.updateTodoItemWithEvent(e, {tags: thisTodoTags}); // 更新數據庫&&重繪待辦
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
                    [Filter.tagFilterContainr](e){
                        $(this).toggleClass('open');
                    },
                    [Filter.tagMenuItem](e){
                        var $this = $(this),
                            thisVal = $this.val();
                        Db.getDatasByIndex({})
                    }
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
                                // $this.find(Filter.todoItemBtnGroup).removeClass('show').hide();
                                // if ($this.find(Common.$tagBoxContainer).length > 0) {
                                //     Common.$tagBoxContainer.remove();
                                // }
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
                                it.$thisItem.find(Filter.itemModifyDoneBtn).click();
                                break;
                            case 27: // esc
                                Db.getDataByKey(it.itemId, (data)=> {
                                    Render.updateTodoItem(it.$thisItem, data);
                                });
                                break;
                        }
                    },
                    [Filter.newTagInput](e){
                        var $this = $(this), tagList = Common.tagList;
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
                                    tagList.push(val);
                                    var $tag = $(Temp.tag({cont: val, className: 'otherTag'}));
                                    $this.before($tag);
                                    $tag.click();
                                    Db.updateDataByPrimaryKey({
                                        key: Common.mainStatusData.id,
                                        valObj: Common.mainStatusData,
                                        storeName: Conf.statusStoreName
                                    });
                                    Render.tagMenuItem({tags: Common.tagList});
                                }
                                break;
                        }
                    }
                },
                "blur": {

                    // 当修改代办项的输入框失去焦点时，默认用修改后的内容替换原内容，并隐藏编辑框
                    [Filter.todoItemInput](e){
                        let it = fn.getTodoItemWithEvent(e);
                        it.$thisItem.find(Filter.itemModifyDoneBtn).click();

                        // 待办项编辑选项失去焦点时，自动给新建待办项输入框加上焦点
                        Common.$newTodoInput.focus();
                    },

                    [Filter.newTagInput](e){
                        // var $this = $(this);
                        // $this.replaceWith(Temp.todoBtns()['newTag']);
                    },

                    // 在所有元素都失去焦点的情况下
                    //[Filter.body](e){
                    //
                    //}
                },
            }
        },

        // 窗口监听事件映射，和上面的事件映射函数一样，因为窗口的事件监听不能用字符串作为筛选器，
        // 所以单独做一个映射，被startWinListener注册为 标准的jq事件监听
        winListenerMap() {
            return {
                "beforeunload"(e){
                    //alert('您输入的内容尚未保存，确定离开此页面吗？');
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
        updateTodoItemWithEvent(event, valObj){
            let it = fn.getTodoItemWithEvent(event);
            Db.updateDataByPrimaryKey({key: it.itemId, valObj: valObj});
            Db.getDataByPrimaryKey({
                key: it.itemId, callback: (data)=> {
                    if (typeof data !== "undefined") {
                        Render.updateTodoItem(it.$thisItem, data);
                    }
                }
            });
        }
    };

    Fn.initCommonDom(Filter, Common);

    window.Listener = fn;
    exports.Listener = fn;
})();