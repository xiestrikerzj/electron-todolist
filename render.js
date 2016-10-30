/**
 * Created by Striker on 2016/9/24.
 */

(()=> {

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
                    btnGroup = ['tags', 'modify', 'delete', 'finish']; // 标签 修改 删除 完成
                    break;
                case Conf.todoStatusMap[1]: // finished
                    itemCss += " list-group-item-success";
                    btnGroup = ['tags', 'modify', 'delete', 'unfinish']; // 标签 修改 删除 完成
                    break;
                case Conf.todoStatusMap[2]: // abort
                    itemCss += " list-group-item-warning";
                    break;
                case Conf.todoStatusMap[3]: // delay
                    itemCss += " list-group-item-danger";
                    break;
            }
            return `<div class="clearfix list-group-item todoItem${itemCss}"
                data-id="${data.id}" data-cont="${data.cont}" data-tags='${JSON.stringify(data.tags || [])}'
                data-status="${data.status}">
                <div class="todoCont fl">
                ${data.cont}
                </div>
                ${btnGroup && Temp.todoItemBtnGroup(btnGroup)}
                </div>`
        },

        iconBtn({icon = "ok", style = 'primary', className = '', css = ''}={}){
            return `<button type="button" class="btn btn-${style} glyphicon glyphicon-${icon} ${className}" style="${css}"></button>`;
        },

        // 待办项按钮列表
        todoBtns(){
            return {
                modify: Temp.iconBtn({icon: 'pencil', className: 'modify'}), // 0
                delete: Temp.iconBtn({icon: 'trash', className: 'delete'}), // 1
                finish: Temp.iconBtn({icon: 'ok', className: 'finish'}), // 2
                unfinish: Temp.iconBtn({icon: 'remove', className: 'unfinish'}), // 3
                save: Temp.iconBtn({icon: 'saved', className: 'itemModifyDone'}), // 4
                flag: Temp.iconBtn({icon: 'flag', className: 'flag'}), // 5
                tags: Temp.iconBtn({icon: 'tags', className: 'tags'}), // 6
                tag: Temp.iconBtn({icon: 'tag', className: 'tag',}), // 7
                // newTag: Temp.iconBtn({icon: 'tag', className: 'newTagBtn', style: 'default',css:'float:left;'}), // 7
                newTag: Temp.tag({className: 'newTag'}),
            };
        },

        // 参数是一个整形数组，包含每个按钮的索引
        todoItemBtnGroup(btns){
            return `<div class="todoItemBtnGroup fr" style="display:none;">
            <div class="btn-group">
                ${$.map(btns, (ind, key)=> {
                return Temp.todoBtns()[ind];
            }).join('')}
                </div>
                </div>`;
        },
        inputGroup({value = "", className = "todoItemInput", placeholder = "输入待办项并回车", btnHtml = '', css = ""}={}){
            var inputHtml = `<input type="text" class="form-control ${className}" placeholder="${placeholder}" value="${value}" style="${css}">`;
            if (btnHtml) {
                return `<div class="input-group">
                ${inputHtml}
                <span class="input-group-btn">
                ${btnHtml}
                </span>
                </div>`
            } else {
                return inputHtml;
            }

        },
        tag({cont = "+", style = 'default', css = "", className = ""}){
            return `<div class="todoTag label label-${style} ${className}" style="${css}" data-val="${cont}">${cont}</div>`;
        },
        tagsBox(myTags = []){
            let allTags = Common.tagList, myTagsHtml = "", otherTagsHtml = "";
            $.map(myTags, (item)=> {
                myTagsHtml += Temp.tag({cont: item, className: 'myTag'});
            });
            $.map(allTags, function (item, key) {
                if (!myTags.includes(item)) {
                    otherTagsHtml += Temp.tag({cont: item, className: 'otherTag'});
                }
            });

            // 如果待办项沒有标签，默认加上“无标签”标签
            // debugger
            myTagsHtml === "" && (myTagsHtml = Temp.tag({cont: "无标签", className: 'noTag'}));

            // 其他标签后面加上一个“+”标签用于新增标签
            otherTagsHtml += Temp.todoBtns()['newTag'];
            return `<div class="tagsBox clearfix">${myTagsHtml}<div class="crossLine"></div>${otherTagsHtml}</div>`;
        },
        tagMenuItem({cont = ''}){
            return `<li role="presentation" class="tagMenuItem" data-val="${cont}"><a role="menuitem" tabindex="-1" href="#">${cont}</a></li>`;
        },
    };

    let Render = {
        todoItems({datas = datas, $container = Common.$todolistContainer}){
            datas = [].concat(datas);
            let html = '';
            $.map(datas, (data)=> {
                html = Temp.todoItem(data) + html;
            });
            $container.prepend(html);
        },
        allTodoDataFromStore(){
            Db.getAllData((e)=> {
                Common.todolistData = e.target.result;
                Render.todoItems({datas: Common.todolistData});
                Fn.initCommonDom(Filter, Common);
            });
        },
        updateTodoItem($item, data){
            $item.replaceWith(Temp.todoItem(data));
        },
        tagsBox(tags){
            Common.$tagBoxContainer.html(Temp.tagsBox(tags));
        },
        tagMenuItem({tags = []}){
            let tagHtml = '';
            $.map(tags, (item)=> {
                tagHtml += Temp.tagMenuItem({cont: item});
            });
            if (tagHtml !== '') {
                // debugger
                $(Filter.tagMenuItem).remove();
                Common.$tagMenuCrossline.after(tagHtml);
            }

        }
    };

    window.Temp = Temp;
    window.Render = Render;

    exports.Temp = Temp;
    exports.Render = Render;
})();
