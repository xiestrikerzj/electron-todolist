/**
 * Created by Striker on 2016/9/24.
 */

(()=> {
    let Conf = require('./common.js').BaseConf;
    let BaseFn = require('./common.js').BaseFn;
    let Common = require('./common.js').BaseCommon;

    let Temp = {
        todoItem(data = {}, itemCss = ""){
            if ($.isEmptyObject(data)) {
                return "";
            }
            let btnGroup;
            switch (data.status) {
                case Conf.todoStatusMap[0]:
                    itemCss += " list-group-item-info";
                    btnGroup = [0, 1, 2];
                    break;
                case Conf.todoStatusMap[1]:
                    itemCss += " list-group-item-success";
                    btnGroup = [0, 1, 3];
                    break;
                case Conf.todoStatusMap[2]:
                    itemCss += " list-group-item-warning";
                    break;
                case Conf.todoStatusMap[3]:
                    itemCss += " list-group-item-danger";
                    break;
            }
            return [
                '<a href="#" class="list-group-item todoItem ' + itemCss + '" ',
                ' data-id="' + data.id + '"',
                ' data-cont=' + data.cont + '>',
                data.cont,
                btnGroup && Temp.todoItemBtnGroup(btnGroup),
                '</a>'
            ].join('')
        },
        iconBtn(className){
            return [
                '<button type="button" class="btn btn-primary glyphicon glyphicon-',
                className,
                '"></button>',
            ].join('');
        },
        todoItemBtnGroup(btnIndexes){
            let tempMapKeys = Object.keys(Render.btnTempMap);
            return [
                '<div class="btn-group todoItemBtnGroup" style="display:none;">',
                $.map(btnIndexes, (item, key)=> {
                    return Render.btnTempMap[tempMapKeys[item]];
                }).join(''),
                '</div>',
            ].join('');
        },
        todoItemInput(text){
            return [
                '<div class="input-group">',
                '<input type="text" class="form-control todoItemInput" placeholder="输入待办项并回车" value="' + (text || "") + '">',
                '<span class="input-group-btn">',
                Render.btnTempMap['save'],
                '</span>',
                '</div>'
            ].join('');
        },
    };

    let Render = {
        allTodoItems(datas){
            $.each(datas, (key, data)=> {
                Render.aNewTodoItem(data);
            });
        },
        allTodoDataFromStore(){
            Db.getAllData((e)=> {
                Common.todolistData = e.target.result;
                Render.allTodoItems(Common.todolistData);
                BaseFn.initCommonDom(Conf.filter, Common);
            });
        },
        aNewTodoItem(data, $container = Common.$todolistContainer){
            $container.prepend(Temp.todoItem(data));
        },
        updateTodoItem($item, data){
            $item.replaceWith(Temp.todoItem(data));
        },
        btnTempMap: {
            modify: Temp.iconBtn('pencil modify'),
            delete: Temp.iconBtn('trash delete'),
            finish: Temp.iconBtn('ok finish'),
            unfinish: Temp.iconBtn('remove unfinish'),
            save: Temp.iconBtn('saved itemModifyDone'),
        }
    };

    exports.Temp = Temp;
    exports.Render = Render;
})();
