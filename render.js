/**
 * Created by Striker on 2016/9/24.
 */

(()=> {
    let Conf = require('./common.js').BaseConf;
    let BaseFn = require('./common.js').BaseFn;
    let Common = require('./common.js').BaseCommon;

    // 元素模板 形式是返回元素html的函数
    let Temp = {
        todoItem(data = {}, itemCss = ""){
            if ($.isEmptyObject(data)) {
                return "";
            }
            let btnGroup;
            switch (data.status) {
                case Conf.todoStatusMap[0]: // unfinished
                    itemCss += " list-group-item-info";
                    btnGroup = [6, 0, 1, 2]; // 标签 修改 删除 完成
                    break;
                case Conf.todoStatusMap[1]: // finished
                    itemCss += " list-group-item-success";
                    btnGroup = [6, 0, 1, 3]; // 标签 修改 删除 完成
                    break;
                case Conf.todoStatusMap[2]: // abort
                    itemCss += " list-group-item-warning";
                    break;
                case Conf.todoStatusMap[3]: // delay
                    itemCss += " list-group-item-danger";
                    break;
            }
            return [
                '<div class="list-group-item todoItem ' + itemCss + '" ',
                ' data-id="' + data.id + '"',
                ' data-cont="' + data.cont + '">',
                data.cont,
                btnGroup && Temp.todoItemBtnGroup(btnGroup),
                '</div>'
            ].join('')
        },
        iconBtn({icon="ok", style = 'primary', className }={}){
            return `<button type="button" class="btn btn-${style} glyphicon glyphicon-${icon} ${className}"></button>`;
        },

        // 参数是一个整形数组，包含每个按钮的索引
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
        tag(cont = "+", style = {style: 'default', size: 3}, addClassName = ""){
            return `<h${style.size}><span class="todoTag label label-${style.style} ${addClassName}">${cont}</span></h${style.size}>`;
        },
        tagsBox(myTags = []){
            let allTags, otherTags = [], tagsHtml = "", tagHtml = "";
            $.map(myTags, function (item, key) {
                tagsHtml += Temp.tag(item, undefined, 'myTag');
            });
            $.map(otherTags, function (item, key) {
                tagsHtml += Temp.tag(item, undefined, 'otherTag');
            });
            tagsHtml += Temp.iconBtn({icon: 'tag', className: 'newTagBtn', style: 'default'});
            return `<div class="tagsBox">${tagsHtml}</div>`;
        }
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
        tagsBox(tags){
            Common.$body.append(Temp.tagsBox(tags));
        },
        btnTempMap: {
            modify: Temp.iconBtn({icon: 'pencil', className: 'modify'}), // 0
            delete: Temp.iconBtn({icon: 'trash', className: 'delete'}), // 1
            finish: Temp.iconBtn({icon: 'ok', className: 'finish'}), // 2
            unfinish: Temp.iconBtn({icon: 'remove', className: 'unfinish'}), // 3
            save: Temp.iconBtn({icon: 'saved', className: 'itemModifyDone'}), // 4
            flag: Temp.iconBtn({icon: 'flag', className: 'flag'}), // 5
            tags: Temp.iconBtn({icon: 'tags', className: 'tags'}), // 6
            tag: Temp.iconBtn({icon: 'tag', className: 'tag'}), // 7
        }
    };

    window.Temp = Temp;
    window.Render = Render;

    exports.Temp = Temp;
    exports.Render = Render;
})();
