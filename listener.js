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
                $.each(filters, (filter, callbacks)=> {
                    params = [].concat(event, filter, callbacks);
                    Common.$body.on.apply(Common.$body, params);
                })
            });
        },

        listenerMap() {
            return {
                "click": {
                    [Filter.newTodoBtn](){
                        let newTodoCont = Common.$newTodoInput.val();
                        if (newTodoCont !== "") {
                            let targData = {cont: newTodoCont};
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
                        let $this = $(e.target);
                        $this.siblings().find(Filter.todoItemBtnGroup).removeClass('show').hide();
                        $this.find(Filter.todoItemBtnGroup).toggleClass('show');
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
                        $thisInput.focus().val($thisInput.val());
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
                        switch (e.type) {
                            case "mouseenter":
                                // $(e.target).find(Filter.todoItemBtnGroup).show();
                                break;
                            case "mouseleave":
                                // $(e.target).find(Filter.todoItemBtnGroup).removeClass('show');
                                // $(e.target).find(Filter.todoItemBtnGroup).hide();
                                break;
                        }
                    }
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
                            case 13:
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
                    [Filter.todoItemInput](e){
                        let it = Fn.getTodoItemWithEvent(e);
                        it.$thisItem.find(Filter.itemModifyDoneBtn).click();
                    }
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

    exports.Listener = Fn;
})();