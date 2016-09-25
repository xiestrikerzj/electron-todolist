/**
 * Created by Striker on 2016/9/24.
 */

(()=> {
    let Conf= require('./common.js').BaseConf;
    let BaseFn= require('./common.js').BaseFn;
    let Common= require('./common.js').BaseCommon;
    let Temp = require('./render.js').Temp;
    let Render = require('./render.js').Render;
    let Db = require('./db.js').Db;

    let Fn = {
        startListener(){
            $.each(Fn.listenerMap(), (event, filters)=> {
                $.each(filters, (filter, callbacks)=> {
                    params = [].concat(event, filter, callbacks);
                    Common.$body.on.apply(Common.$body, params);
                })
            });
        },

        listenerMap() {
            return {
                "click": {
                    [Conf.filter.newTodoBtn](){
                        let newTodoCont = Common.$newTodoInput.val();
                        if (newTodoCont !== "") {
                            Db.addDatas({cont: newTodoCont});
                            Render.aNewTodoItem($.extend(true, {}, Conf.newTodoItemForm(), newTodoCont));
                            BaseFn.initCommonDom();
                        }
                    },
                    [Conf.filter.todoItem](e){
                        var $this = $(e.target);
                        $this.siblings().find(Conf.filter.todoItemBtnGroup).removeClass('show').hide();
                        $this.find(Conf.filter.todoItemBtnGroup).toggleClass('show');
                    }
                },
                "mouseenter mouseleave": {
                    [Conf.filter.todoItem] (e){
                        switch (e.type) {
                            case "mouseenter":
                                // $(e.target).find(Conf.filter.todoItemBtnGroup).show();
                                break;
                            case "mouseleave":
                                // $(e.target).find(Conf.filter.todoItemBtnGroup).removeClass('show');
                                // $(e.target).find(Conf.filter.todoItemBtnGroup).hide();
                                break;
                        }
                    }
                }
            }
        },
    };

    BaseFn.initCommonDom(Conf.filter, Common);

    exports.Listener = Fn;
})();