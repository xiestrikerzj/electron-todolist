/**
 * Created by Striker on 2016/9/24.
 */
;(()=> {

    // 元素模板 形式是返回元素html的函数
    let Temp = {
        todoItem(data = {}, itemCss = ""){
            if ($.isEmptyObject(data)) {
                return "";
            }
            let btnGroup, initTime = new Date(data.initTime);
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
                case Conf.todoStatusMap[4]: // deleted
                    break;
            }

            return `<div class="clearfix list-group-item todoItem${itemCss}"
                data-id='${data.id}' data-cont="${data.cont}" data-tags='${JSON.stringify(data.tags || [])}'
                data-status="${data.status}" data-btngroup='${JSON.stringify(btnGroup)}'
                data-time="${JSON.stringify([initTime.getFullYear(), initTime.getMonth() + 1, initTime.getDate()])}">
                <div class="todoCont fl">
                ${data.cont}
                </div>
                ${btnGroup ? Temp.todoItemBtnGroup(btnGroup) : ''}
                </div>`
        },

        todoDateTime({date=[],todoNum=0,isShowYear=true}){
            if ($.isEmptyObject(date)) return;
            return `<li class="list-group-item todoDateTime" data-time="${JSON.stringify(date)}">
                <span class="badge">${todoNum}</span>
                ${isShowYear ? date[0] + '.' : ''}${date[1]}.${date[2]}
                </li>`
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
            <!--按钮组-->
            <div class="btn-group">
                ${$.map(btns, (ind, key)=> {
                return Temp.todoBtns()[ind];
            }).join('')}
                </div>
                <!--标签容器-->
                <div class="tagsBox clearfix"></div>
                </div>`;
        },
        inputGroup({value = "", className = "todoItemInput", placeholder = "输入待办项并回车", btnHtml = '', css = ""}={}){
            var inputHtml = ``;
            if (btnHtml) {
                return `<div class="input-group"  style="${css}">
                <textarea type="text" class="form-control ${className}" placeholder="${placeholder}" data-val="${value}">${value}</textarea>
                <span class="input-group-btn">
                ${btnHtml}
                </span>
                </div>`
            } else {
                return `<input type="text" class="form-control ${className}" placeholder="${placeholder}" value="${value}" style="${css}">`;
            }
        },
        tag({cont = "+", style = 'default', css = "", className = ""}){
            return `<div class="todoTag label label-${style} ${className}" style="${css}" data-val="${cont}">${cont}</div>`;
        },
        tagsBox({myTags = [], allTags = []}) {
            let myTagsHtml = "", otherTagsHtml = "";
            if (allTags.length > 1 && allTags.includes(Conf.noTagTxt)) {
                allTags.splice(allTags.indexOf(Conf.noTagTxt), 1);
            }
            $.map(myTags, (item)=> {
                allTags.includes(item) && (myTagsHtml += Temp.tag({
                    cont: item,
                    className: 'myTag',
                    style: 'primary'
                }));
            });
            $.map(allTags, function (item, key) {
                if (!myTags.includes(item)) {
                    otherTagsHtml += Temp.tag({cont: item, className: 'otherTag'});
                }
            });

            // 如果待办项沒有标签，加上默认标签
            myTagsHtml === "" && (myTagsHtml = Temp.tag({
                cont: "无标签",
                className: 'noTag',
                style: 'primary'
            }));

            // 其他标签后面加上一个“+”标签用于新增标签
            otherTagsHtml += Temp.todoBtns()['newTag'];
            return `${myTagsHtml}<div class="crossLine"></div>${otherTagsHtml}`;
        },
        tagMenuItem({cont = '', isAct = false}){
            let icon = isAct ? Temp.iconBtn({
                icon: 'leaf',
                style: 'default',
                css: 'float: right; border: 0; padding: 0;'
            }) : '';
            return `<li role="presentation" class="tagMenuItem" data-val="${cont}"><a role="menuitem" tabindex="-1" href="#">${cont}${icon}</a></li>`;
        },
        tagFilterWayBtn({text = '', dataVal = ''}){
            return `<button type="button" class="btn btn-default tagFilterWayBtn" data-val="${dataVal}">${text}</button>`;
        },
    };

    let Render = {
        todoItems({datas, showDate = false, prepend = false, $container = Common.$todolistContainer}){
            datas = [].concat(datas);
            let html = '';
            $.map(datas, (data)=> {
                html = Temp.todoItem(data) + html;
            });
            //if (prepend) {
            //    let $contTodoItems = $container.find(Filter.todoItem);
            //    $.isEmptyObject($contTodoItems) ? $container.prepend(html) : $contTodoItems.before(html);
            //} else {
            $container.html(html);
            //}
            Render.todoDateTime();
        },
        todoDateTime(){
            nowDate = [(new Date()).getYear()];
            $(Filter.todoItem).each(function () {
                let $this = $(this);
                thisDate = $this.data('time');
                if (nowDate.toString() !== thisDate.toString()) {
                    $this.before(Temp.todoDateTime({
                        date: thisDate,
                        todoNum: $(`${Filter.todoItem}[data-time="${JSON.stringify(thisDate)}"]`).length,
                        isShowYear: (nowDate[0] !== thisDate[0])
                    }));
                    nowDate = thisDate;
                }
            });
        },
        allTodoDataFromStore(){
            co(function*() {
                todolistData = yield Db.getAllData({});
                Common.todolistData = todolistData;
                Render.todoItems({datas: Common.todolistData});
                Fn.initCommonDom(Filter, Common);
            });
        },
        updateTodoItem($item, data){
            $item.replaceWith(Temp.todoItem(data));
        },
        tagsBox({tags = [], $container = $('body')}){
            co(function*() {
                let data = yield Db.getDataByIndex({});
                let allTags = data.tags;
                $container.html(Temp.tagsBox({myTags: tags, allTags: allTags}));
            });
        },
        tagMenuItem({tags = [], actTags = []}){
            let tagHtml = '', isAct;
            //tags.unshift(Conf.noTagTxt);

            // 如果没有选中的标签筛选项，则默认选中所有筛选项
            actTags = $.isEmptyObject(actTags) ? tags : actTags;
            $.map(tags, (item)=> {
                actTags.includes(item) ? isAct = true : isAct = false;
                tagHtml += Temp.tagMenuItem({cont: item, isAct: isAct});
            });
            Common.$tagMenuContainer.html(tagHtml);
        },
        tagFilterWayBtns({hideBtn = 'multi'}){
            let btnHtml =
                `${hideBtn !== 'single' ? Temp.tagFilterWayBtn({text: '单选', dataVal: 'single'}) :
                    Temp.tagFilterWayBtn({text: '多选', dataVal: 'multi'})}
                    ${Temp.tagFilterWayBtn({text: '全部', dataVal: 'all'})}`;
            $(Filter.tagFilterWayBtnGroup).html(btnHtml);
        },
        refreshTodoList({appStatus={}}={}){
            co(function*() {
                if ($.isEmptyObject(appStatus)) {
                    appStatus = yield Db.getDataByIndex({});
                }
                Db.getTodoDatas({status: appStatus.statusFilter, tags: appStatus.tagsFilter});
            });
        }
    };

    window.Temp = Temp;
    window.Render = Render;

    exports.Temp = Temp;
    exports.Render = Render;
})();
