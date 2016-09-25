/**
 * Created by Striker on 2016/9/24.
 */

(()=> {
    let BaseFn = {
        initCommonDom: function (filters, obj) {
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
                id: 4
                , timeStamp: BaseCommon.date.getTime()
                , status: BaseConf.todoStatusMap[0]
            }
        },
        filter: {
            body: 'body'
            , mainContainer: ''
            , newTodoBtn: '.newTodoBtn'
            , newTodoInput: '.newTodoInput'
            , todoItem: '.todoItem'
            , todoItemBtnGroup: '.todoItemBtnGroup'
            , todolistContainer: '.todolistContainer'
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