/**
 * Created by Striker on 2016/9/24.
 */

(()=> {
    let Conf = require('./common.js').BaseConf;
    let Filter = Conf.filter;
    let BaseFn = require('./common.js').BaseFn;
    let Common = require('./common.js').BaseCommon;
    let Temp = require('./render.js').Temp;
    let Render = require('./render.js').Render;
    let Db = require('./db.js').Db;

    let Fn = {
        startListener(listenerMap){
            $.each(listenerMap, (event, filters)=> {
                $.each(filters, (filter, handler)=> {
                    params = [].concat(event, filter, handler);
                    Common.$body.on.apply(Common.$body, params);
                })
            });
        },

        startWinListener(listenerMap = Fn.winListenerMap()){
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
                                    BaseFn.initCommonDom(null, Common);
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
                        Fn.updateTodoItemWithEvent(e, {
                            status: "finished"
                        });
                    },
                    [Filter.deleteItemBtn](e){
                        let it = Fn.getTodoItemWithEvent(e);
                        Db.deleteDataByKey(it.itemId);
                        Render.updateTodoItem(it.$thisItem, {});
                    },
                    [Filter.modifyItemBtn](e){
                        let it = Fn.getTodoItemWithEvent(e);
                        it.$thisItem.html(Temp.todoItemInput(it.itemText));
                        let $thisInput = it.$thisItem.find(Filter.todoItemInput);
                        $thisInput.focus().val($thisInput.val()); // 把光标移到代编辑内容尾部
                    },
                    [Filter.itemModifyDoneBtn](e){
                        let it = Fn.getTodoItemWithEvent(e);
                        Fn.updateTodoItemWithEvent(e, {
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
                            Db.getMultipleDataByIndex(IDBKeyRange.only(filterKey), (cursor)=> {
                                let data = cursor.value;
                                console.log(data);
                                Render.aNewTodoItem(data);
                            });
                        }
                    },
                    [Filter.unfinishItemBtn](e){
                        Fn.updateTodoItemWithEvent(e, {
                            status: "unfinished"
                        })
                    },
                    [Filter.tagsBtn](e){

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
                                //$this.find(Filter.todoItemBtnGroup).removeClass('show').hide();
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
                        let it = Fn.getTodoItemWithEvent(e);
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
                },
                "blur": {

                    // 当修改代办项的输入框失去焦点时，默认用修改后的内容替换原内容，并隐藏编辑框
                    [Filter.todoItemInput](e){
                        let it = Fn.getTodoItemWithEvent(e);
                        it.$thisItem.find(Filter.itemModifyDoneBtn).click();

                        // 待办项编辑选项失去焦点时，自动给新建待办项输入框加上焦点
                        Common.$newTodoInput.focus();
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

        updateTodoItemWithEvent(event, valObj){
            let it = Fn.getTodoItemWithEvent(event);
            Db.updateDataByKey(it.itemId, valObj);
            Db.getDataByKey(it.itemId, (data)=> {
                if (typeof data !== "undefined") {
                    Render.updateTodoItem(it.$thisItem, data);
                }
            });
        }
    };

    BaseFn.initCommonDom(Filter, Common);

    window.Listener = Fn;
    exports.Listener = Fn;
})();