/**
 * Created by Striker on 2016/9/24.
 */

let fs = require('fs');
let co = require('co');

// function co(generator) {
//     return function(fn) {
//         var gen = generator();
//         function next(err, result) {
//             if(err){
//                 return fn(err);
//             }
//             var step = gen.next(result);
//             if (!step.done) {
//                 step.value(next);
//             } else {
//                 fn(null, step.value);
//             }
//         }
//         next();
//     }
// }

// fs.readFile('./electron/todolist/databak.json', "utf8", function (error, data) {
//     if (error) throw error;
//     console.log(data);
// });

window.readFileThunk = thunkify(fs.readFile);
window.writeFileThunk = thunkify(fs.writeFile);
window.test = thunkify(window.indexedDB.open);
// readFileThunk('./databak.json', 'utf8')((err, data)=> {
//     l(JSON.parse(data).test)
// });
// writeFileThunk('./databak.json', '{"tt":1}')((err)=> {
//     l(1, err)
// });

// test('testDb', 1)((e)=> {
//     // l(e)
//     console.log(e)
// });

// function* openDB ({name, version = 1, onsuccess, onupgradeneeded, onerror}) {
//     let request = window.indexedDB.open(name, version);
//     request.onerror = onerror;
//     request.onsuccess = (e)=> {
//         // yield 'test';
//     };
//     request.onupgradeneeded = onupgradeneeded;
//     yield 2;
// }

function t(p, call) {
    call(p + 1);
    // return new Promise(function(resolve, reject) {
    //     if (p){
    //         resolve(p+1);
    //     } else {
    //         reject(error);
    //     }
    // });
}

let tt = thunkify(t);
// co(function*() {
//     var ttt = yield tt(2);
//     l(ttt)
// });

// function*gen() {
//     var data1 = yield tt(2);
//     console.log(1,data1);
//     var data2 = yield readFileThunk('./file.js', 'utf8');
//     console.log(data2);
// }
// let g =gen();
// let gr =g.next().value(data=>{
//         return data
//     });
//     g.next(gr);

// var request = require('request');
// co(function *(){
//     var a = yield request('http://google.com');
//     var b = yield request('http://yahoo.com');
//     console.log(a[0].statusCode);
//     console.log(b[0].statusCode);
// })()


co(function *() {
    let a = yield tt(3);
    l(a)
    // yield readFileThunk('./file.js', 'utf8');
    // yield readFileThunk('./file.js', 'utf8');
    return a;
})

co(function*() {
    // var data1 = yield tt(2);
    var data1 = yield readFileThunk('./databak.json', 'utf8');
    console.log(data1);
    var data2 = yield readFileThunk('./file.js', 'utf8');
    console.log(data2);
})

// let op = openDB({name: 'testDb'});
// l(op.next());

// fs.state('./electron/todolist/databak.json')

;
(()=> {
    let Temp = require('./render.js').Temp;
    let Render = require('./render.js').Render;
    let Db = require('./db.js').Db;
    let thunkify = require('thunkify');

    let fn = {
        startListener(listenerMap){
            $.each(listenerMap, (event, filters)=> {
                $.each(filters, (filter, handler)=> {
                    params = [].concat(event, filter, handler);
                    Common.$body.on.apply(Common.$body, params);
                })
            });
        },

        startWinListener(listenerMap = fn.winListenerMap()){
            $.each(listenerMap, (event, handler)=> {
                $(window).on(event, handler);
            })
        },

        // 监听事件映射方法，返回一个对象用于映射事件名、元素筛选器和处理函数，
        // 该对象包含的所有映射关系将在startListener方法中被统一注册成标准的jq事件监听
        listenerMap() {
            return {
                "click": { // 事件名，下同
                    [Filter.newTodoBtn](){ // 元素筛选器和处理函数，下同
                        let newTodoCont = Common.$newTodoInput.val();
                        if (newTodoCont !== "") {
                            let contList = newTodoCont.split(/\n/);
                            let targData = $.extend(true, {}, Conf.newTodoItemForm(), {cont: newTodoCont});
                            Db.addDatas(targData, (e)=> {
                                let dataInd = e.target.result;
                                Db.getDataByPrimaryKey({
                                    key: dataInd, callback: (data)=> {
                                        Render.todoItems({datas: data, prepend: true});
                                        Fn.initCommonDom(null, Common);
                                        Common.$newTodoInput.val(null);
                                    }
                                });
                            });
                        }
                    },
                    [Filter.todoItem](e){
                        //let $this = $(e.target);
                        //$this.siblings().find(Filter.todoItemBtnGroup).removeClass('show').hide();
                        //$this.find(Filter.todoItemBtnGroup).toggleClass('show');
                    },
                    [Filter.todoItemBtnGroup](e){
                        e.stopPropagation();
                    },
                    [Filter.finishItemBtn](e){
                        fn.updateTodoItemWithEvent({
                            event: e, valObj: {
                                status: "finished"
                            }
                        });
                    },
                    [Filter.deleteItemBtn](e){
                        fn.updateTodoItemWithEvent({
                            event: e, valObj: {
                                status: "deleted"
                            }, callback: (data)=> {
                                let dataCont = data.cont;
                                let $thisTodo = $(`${Filter.todoItem}[data-cont="${dataCont}"]`);
                                $thisTodo.remove();
                            }
                        });
                    },
                    [Filter.modifyItemBtn](e){
                        let it = fn.getTodoItemWithEvent(e);
                        it.$thisItem.html(Temp.inputGroup({
                            value: it.itemText,
                            btnHtml: Temp.todoBtns()['save'],
                            css: "margin-left: -14px; margin-top: -7px; margin-bottom: -7px;"
                        }));
                        let $thisInput = it.$thisItem.find(Filter.todoItemInput);
                        $thisInput.focus().val($thisInput.val()); // 把光标移到代编辑内容尾部
                    },
                    [Filter.itemModifyDoneBtn](e){
                        let it = fn.getTodoItemWithEvent(e);
                        fn.updateTodoItemWithEvent({
                            event: e, valObj: {
                                cont: it.itemInputText,
                                updateTime: (new Date()).getTime()
                            }
                        });
                    },
                    [Filter.filterBtn](e){
                        let $this = $(this);
                        let filterKey = $this.data('val');
                        // filterkey !== 'deleted' && $this.addClass('btn-primary').siblings().removeClass('btn-primary');
                        $(Filter.filterBtn).removeClass('btn-primary');
                        $this.addClass('btn-primary');

                        // 更新搜索状态和搜索按钮样式
                        Db.updateDataByIndex({
                            valObj: {statusFilter: filterKey}, callback: (data)=> {
                                Db.getTodoDatas({status: data.statusFilter, tags: data.tagsFilter});
                            }
                        });
                    },
                    [Filter.unfinishItemBtn](e){
                        fn.updateTodoItemWithEvent({
                            event: e, valObj: {
                                status: "unfinished"
                            }
                        })
                    },
                    [Filter.tagsBtn](e){
                        var $this = $(this),
                            $thisTodo = $this.parents(Filter.todoItem);
                        var $thisBtnGroup = $thisTodo.find(Filter.todoItemBtnGroup);
                        Render.tagsBox({
                            tags: $thisTodo.data('tags'),
                            $container: $thisBtnGroup.find(Filter.tagsBox)
                        });
                    },
                    [Filter.myTag](e){
                        var $this = $(this),
                            $thisTodo = $this.parents(Filter.todoItem),
                            thisVal = String($this.data('val')),
                            thisTodoTags = $thisTodo.data('tags'),
                            thisValInd = thisTodoTags.indexOf(thisVal);
                        thisTodoTags.splice(thisValInd, 1);
                        (thisTodoTags.length === 0) && thisTodoTags.push(Conf.noTagTxt); // 如果删除标签后待办项没标签了，补上“无标签”标签
                        fn.updateTodoItemWithEvent({event: e, valObj: {tags: thisTodoTags}}); // 更新數據庫&&重繪待辦
                    },
                    [Filter.otherTag](e){
                        var $this = $(this),
                            $thisTodo = $this.parents(Filter.todoItem),
                            thisVal = String($this.data('val')),
                            thisTodoTags = $thisTodo.data('tags');
                        thisTodoTags.push(thisVal);
                        thisTodoTags.includes(Conf.noTagTxt) && thisTodoTags.splice(thisTodoTags.indexOf(Conf.noTagTxt), 1); // 如果待办项没标签，加上标签后去掉“无标签”标签
                        fn.updateTodoItemWithEvent({event: e, valObj: {tags: thisTodoTags}}); // 更新數據庫&&重繪待辦
                    },
                    [Filter.newTagBtn](e){
                        var $this = $(this);
                        var $thisInput = $(Temp.inputGroup({
                            className: 'newTagInput',
                            placeholder: "回车新建标签",
                            css: "margin: 0 auto; height: 30px;"
                        }));
                        $this.replaceWith($thisInput);
                        $thisInput.focus();
                    },
                    [Filter.tagFilterContainer](e){
                        $(this).toggleClass('open');
                    },
                    [Filter.tagMenuItem](e){
                        let $this = $(this),
                            thisVal = String($this.data('val')),
                            tagsFilter;
                        Db.getDataByIndex({
                            callback: data=> {
                                if (data.tagsFilterWay === 'multi') {
                                    tagsFilter = data.tagsFilter;
                                    if (tagsFilter.includes(thisVal) && tagsFilter.length > 1) {
                                        tagsFilter.splice(tagsFilter.indexOf(thisVal), 1);
                                    } else if (!tagsFilter.includes(thisVal)) {
                                        tagsFilter.push(thisVal);
                                    }
                                } else {
                                    tagsFilter = [thisVal];
                                }

                                Common.$tagFilterInput.val(`标签:${tagsFilter.join(',')}`); // 输入框显示为点击的按钮文案

                                // 更新搜索状态和搜索按钮样式
                                Db.updateDataByIndex({
                                    valObj: {tagsFilter: tagsFilter}, callback: (appStatus)=> {
                                        Db.getTodoDatas({status: appStatus.statusFilter, tags: appStatus.tagsFilter});

                                        // 渲染标签筛选菜单项
                                        Render.tagMenuItem({tags: appStatus.tags, actTags: appStatus.tagsFilter});
                                    }
                                });
                            }
                        });
                    },
                    [Filter.tagFilterWayBtn](e){
                        let $this = $(this),
                            thisVal = $this.data('val') || 'single';
                        if (thisVal === 'all') {
                            Common.$tagFilterInput.val('标签:所有');
                            Db.updateDataByIndex({
                                valObj: {tagsFilter: []},
                                callback: (data)=> {
                                    Render.tagMenuItem({tags: data.tags, actTags: data.tags})
                                    Db.getTodoDatas({status: data.statusFilter, tags: data.tagsFilter});
                                }
                            });
                        } else {
                            Render.tagFilterWayBtns({hideBtn: thisVal});
                            Db.updateDataByIndex({valObj: {tagsFilterWay: thisVal}});
                        }
                    },
                },
                "dblclick": {
                    [Filter.todoItemBtnGroup](e){
                        e.stopPropagation();
                    },
                    [Filter.todoItem] (e){
                        let $this = $(this);
                        $this.find(Filter.modifyItemBtn).click();
                    }
                },
                "mouseenter mouseleave": {
                    [Filter.todoItem] (e){
                        let $this = $(this);
                        switch (e.type) {
                            case "mouseenter":
                                $this.find(Filter.todoItemBtnGroup).addClass('show').show();
                                $this.siblings().find(Filter.todoItemBtnGroup).removeClass('show').hide();
                                break;
                            case "mouseleave":
                                // $this.find(Filter.todoItemBtnGroup).removeClass('show').hide();
                                // if ($this.find(Common.$tagBoxContainer).length > 0) {
                                //     Common.$tagBoxContainer.remove();
                                // }
                                break;
                        }
                    },
                },
                "keypress": {
                    [Filter.newTodoInput](e){
                        switch (e.keyCode) {
                            case 13: // enter
                                Common.$newTodoBtn.click();
                                break;
                            case 27: // esc
                                Common.$newTodoInput.val("");
                                break;
                        }
                    },
                    [Filter.todoItemInput](e){
                        let it = fn.getTodoItemWithEvent(e);
                        switch (e.keyCode) {
                            case 13: // enter
                                it.$thisItem.find(Filter.itemModifyDoneBtn).click();
                                break;
                            case 27: // esc
                                Db.getDataByKey(it.itemId, (data)=> {
                                    Render.updateTodoItem(it.$thisItem, data);
                                });
                                break;
                        }
                    },
                    [Filter.newTagInput](e){
                        Db.getDataByIndex({
                            callback: data=> {
                                var $this = $(this), tagList = data.tags;
                                switch (e.keyCode) {
                                    case 13: // enter
                                        var val = $this.val();
                                        if (tagList.includes(val)) {
                                            alert('该标签已存在');
                                        } else if (val.length === 0) {
                                            alert('请输入标签名');
                                        } else if (val.length > 6) {
                                            alert('标签太长');
                                        } else {
                                            tagList.push(String(val));
                                            //tagList.includes(Conf.noTagTxt) && tagList.splice(tagList.indexOf(Conf.noTagTxt), 1); // 如果待办项没标签，加上标签后去掉“无标签”标签
                                            var $tag = $(Temp.tag({cont: val, className: 'otherTag'}));
                                            $this.before($tag);
                                            $tag.click();
                                            Db.updateDataByIndex({
                                                valObj: {tags: tagList}
                                            });
                                            Render.tagMenuItem({tags: tagList, actTags: data.tagsFilter});
                                        }
                                        break;
                                }
                            }
                        });
                    }
                },
                "focus": {
                    [Filter.tagFilterInput](e){
                        Common.$tagFilterDropdownBtn.click();
                    }
                },
                "blur": {

                    // 当修改代办项的输入框失去焦点时，默认用修改后的内容替换原内容，并隐藏编辑框
                    [Filter.todoItemInput](e){
                        let it = fn.getTodoItemWithEvent(e);
                        it.$thisItem.find(Filter.itemModifyDoneBtn).click();

                        // 待办项编辑选项失去焦点时，自动给新建待办项输入框加上焦点
                        Common.$newTodoInput.focus();
                    },

                    [Filter.newTagInput](e){
                        // var $this = $(this);
                        // $this.replaceWith(Temp.todoBtns()['newTag']);
                    },

                    // 在所有元素都失去焦点的情况下
                    //[Filter.body](e){
                    //
                    //}
                },
            }
        },

        // 窗口监听事件映射，和上面的事件映射函数一样，因为窗口的事件监听不能用字符串作为筛选器，
        // 所以单独做一个映射，被startWinListener注册为 标准的jq事件监听
        winListenerMap() {
            return {
                "beforeunload"(e){
                    //alert('您输入的内容尚未保存，确定离开此页面吗？');
                }
            }
        },

        getTodoItemWithEvent(event){
            let $this = $(event.target);
            let $thisItem = $this.parents(Filter.todoItem) || $this;
            return {
                $this: $this
                , $thisItem: $thisItem
                , itemId: $thisItem.data('id')
                , itemText: $thisItem.data('cont')
                , itemInputText: $thisItem.find(Filter.todoItemInput).val()
            }
        },

        // 更新數據庫&&重繪待辦
        updateTodoItemWithEvent({event, valObj, callback, isDeepExtend = false}){
            let it = fn.getTodoItemWithEvent(event);
            Db.updateDataByPrimaryKey({
                key: it.itemId,
                valObj: $.extend(valObj, {updateTime: (new Date()).getTime()}),
                isDeepExtend: isDeepExtend,
                callback: (data)=> {
                    if (typeof data !== "undefined") {
                        Render.updateTodoItem(it.$thisItem, data);
                        callback && callback(data);
                    }
                }
            });
        }
    };

    // Fn.initCommonDom(Filter, Common);

    window.Listener = fn;
    exports.Listener = fn;
})();