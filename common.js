/**
 * Created by Striker on 2016/9/24.
 */

(()=> {
    window.Fn = {
        initCommonDom(filters = Filter, obj) {
            $.map(filters, function (item, key) {
                obj['$' + key] = $(item);
            });
        },
        l(){
            console.log.apply(this, Array.prototype.slice.call(arguments));
        }
    };
    window.l = (...params)=>{
        console.log(...params);
    }

    window.Common={
    };

    window.Filter = {
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
        , tagBoxContainer: '.tagBoxContainer'
        , tagsBox: '.tagsBox'
        , myTag: '.todoTag.myTag'
        , tagsBoxCrossLine: '.tagsBox .crossLine'
        , otherTag: '.todoTag.otherTag'
        , newTagBtn: '.todoTag.newTag'
        , newTagInput: 'input.newTagInput'
        , todoItemInput: '.todoItemInput'
        , filterBtn: '.btn.filter'
        , filterAllBtn: '.btn.filter-all'
        , filterUnfinishedBtn: '.btn.filter-unfinished'
        , filterFinishedBtn: '.btn.filter-finished'
        , tagFilterContainr: '.tagFilterContainr'
        , tagMenu: '#tagMenu'
        , tagMenuCrossline: '#tagMenuCrossline'
        , tagMenuItem: '.tagMenuItem'
        , tagFilterInput: '#tagFilterInput'
        , tagFilterDropdownBtn: '.tagFilterContainr #dropdownMenu'
        , tagFilterBtnGroup: '.tagFilterContainr #dropdownMenu'


    };

    window.Conf = {
        mainDBName: 'todolistDB',
        mainStoreName: 'todolistStore',
        statusStoreName: 'statusStore',
        mainIndexName:'statusIndex',
        statusIndexName:'flagIndex',
        noTagTxt:'无标签',
        newTodoItemForm(){
            return {
                timeStamp: (new Date()).getTime()
                , status: Conf.todoStatusMap[0] // unfinished
                , tags: []
            }
        },
        todoStatusMap: ['unfinished', 'finished', 'delay', 'abort'],
    };
})();