/**
 * Created by Striker on 2016/9/24.
 */

(()=> {
    let Conf = require('./common.js').BaseConf;
    let BaseFn = require('./common.js').BaseFn;
    let Common = require('./common.js').BaseCommon;

    let Temp = {
        todoItem(data, itemCss = ""){
            switch (data.status) {
                case Conf.todoStatusMap[0]:
                    itemCss += " list-group-item-info";
                    break;
                case Conf.todoStatusMap[1]:
                    itemCss += " list-group-item-success";
                    break;
                case Conf.todoStatusMap[2]:
                    itemCss += " list-group-item-warning";
                    break;
                case Conf.todoStatusMap[3]:
                    itemCss += " list-group-item-danger";
                    break;
            }
            return [
                '<a href="#" class="list-group-item todoItem ' + itemCss + '">',
                data.cont,
                Temp.todoItemBtnGroup([0, 1, 2]),
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
            let btnTempMap = {
                modify: Temp.iconBtn('pencil'),
                delete: Temp.iconBtn('trash'),
                finish: Temp.iconBtn('ok'),
                unfinish: Temp.iconBtn('remove'),
            };
            let tempMapKeys = Object.keys(btnTempMap);
            return [
                '<div class="btn-group todoItemBtnGroup" style="display:none;">',
                $.map(btnIndexes, (item, key)=> {
                    return btnTempMap[tempMapKeys[item]];
                }).join(''),
                '</div>',
            ].join('');
        },
    };

    let Render = {
        allTodoItems(datas){
            $.each(datas, (key, data)=> {
                Render.aNewTodoItem(data);
            });
        },
        aNewTodoItem(data){
            Common.$todolistContainer.prepend(Temp.todoItem(data));
        }
    };

    exports.Temp = Temp;
    exports.Render = Render;
})();
