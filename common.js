/**
 * Created by Striker on 2016/9/24.
 */

;(()=> {
    window.thunkify = require('thunkify')
    window.fs = require('fs');
    window.co = require('co');
    window.Db = require('./db.js').Db;
    window.Temp = require('./render.js').Temp;
    window.Render = require('./render.js').Render;
    window.Listener = require('./listener.js').Listener;
    window.file = require('./file.js').file;

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
    window.l = (...params)=> {
        let callerName;
        if (arguments.caller) {
            callerName = callerDemo.caller.toString();
        }
        console.log(callerName, ...params);
    };

    window.Common = {
        bakFilePath: './databak.json',
    };

    window.Filter = {
        window: 'window'
        , body: 'body'
        , textarea: 'textarea'
        , mainContainer: ''
        , newTodoBtn: '.newTodoBtn'
        , newTodoInput: '.newTodoInput'
        , todolistContainer: '.todolistContainer'
        , todoItem: '.todoItem'
        , todoCont: '.todoCont'
        , todoItemBtnGroup: '.todoItemBtnGroup'
        , todoDateTime: '.todoDateTime'
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
        , newTagInput: '.newTagInput'
        , todoItemInput: '.todoItemInput'
        , filterBtn: '.btn.filter'
        , tagFilterContainer: '.tagFilterContainer'
        , tagFilterWayBtn: '.tagFilterWayBtn'
        , clearTagFilterBtn: '.clearTagFilterBtn'
        , tagMenu: '#tagMenu'
        , tagMenuCrossline: '#tagMenuCrossline'
        , tagMenuItem: '.tagMenuItem'
        , tagFilterInput: '#tagFilterInput'
        , tagFilterDropdownBtn: '.tagFilterContainer #dropdownMenu'
        , tagFilterWayBtnGroup: '#tagFilterBtnGroupContainer .tagFilterBtnGroup'
        , tagMenuContainer: '.tagMenuContainer'
        , scrollbarThumbStyle: 'style.scrollbar-thumb'

    };

    window.Conf = {
        mainDBName: 'todolistDB',
        mainStoreName: 'todolistStore',
        statusStoreName: 'statusStore',
        mainIndexName: 'statusIndex',
        statusIndexName: 'flagIndex',
        noTagTxt: '无标签',
        isDebug: 0, // 是否开启测试模式
        newTodoItemForm(){
            return {
                initTime: (new Date()).getTime()
                , status: Conf.todoStatusMap[0] // unfinished
                , tags: [Conf.noTagTxt]
            }
        },
        todoStatusMap: ['unfinished', 'finished', 'delay', 'abort', 'deleted'],
    };
})();