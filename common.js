/**
 * Created by Striker on 2016/9/24.
 */

(()=> {
    let BaseFn = {
        initCommonDom(filters = BaseConf.filter, obj) {
            $.map(filters, function (item, key) {
                obj['$' + key] = $(item);
            });
        },
        l(){
            console.log.apply(this, Array.prototype.slice.call(arguments));
        }
    };

    let BaseCommon = {};

    let BaseConf = {
        mainDBName: 'todolistDB',
        mainStoreName: 'todolistStore',
        statusStoreName: 'statusStore',
        newTodoItemForm(){
            return {
                timeStamp: (new Date()).getTime()
                , status: BaseConf.todoStatusMap[0] // unfinished
                , tags: []
            }
        },
        filter: {
            window: 'window',
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
            , itemModifyDoneBtn: '.btn.itemModifyDone'
            , flagBtn: '.btn.flag'
            , tagsBtn: '.btn.tags'
            , todoItemInput: '.todoItemInput'
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