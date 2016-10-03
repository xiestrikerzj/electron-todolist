/**
 * Created by Striker on 2016/9/24.
 */

(()=> {
    let BaseFn = {
        initCommonDom: function (filters = BaseConf.filter, obj) {
            $.map(filters, function (item, key) {
                obj['$' + key] = $(item);
            });
        },
    };

    let BaseCommon = {
        date: new Date(),
    };

    let BaseConf = {
        mainDBName: 'todolistDB',
        mainStoreName: 'todolistStore',
        newTodoItemForm(){
            return {
                timeStamp: BaseCommon.date.getTime()
                , status: BaseConf.todoStatusMap[0]
            }
        },
        filter: {
            body: 'body'
            , mainContainer: ''
            , newTodoBtn: '.newTodoBtn'
            , newTodoInput: '.newTodoInput'
            , todolistContainer: '.todolistContainer'
            , todoItem: '.todoItem'
            , todoItemBtnGroup: '.todoItemBtnGroup'
            , finishItemBtn: '.btn.finish'
            , deleteItemBtn: '.btn.delete'
            , removeItemBtn: '.btn.remove'
            , unfinishItemBtn: '.btn.unfinish'
            , modifyItemBtn: '.btn.modify'
            , todoItemInput: '.todoItemInput'
            , itemModifyDoneBtn: '.btn.itemModifyDone'
            , filterBtn: '.btn.filter'
            , filterAllBtn: '.btn.filter-all'
            , filterUnfinishedBtn: '.btn.filter-unfinished'
            , filterFinishedBtn: '.btn.filter-finished'
        },
        todoStatusMap: ['unfinished', 'finished', 'delay', 'abort'],
    };

    window.BaseFn = BaseFn;
    window.BaseConf = BaseConf;
    window.BaseCommon = BaseCommon;

    exports.BaseFn = BaseFn;
    exports.BaseConf = BaseConf;
    exports.BaseCommon = BaseCommon;
})();