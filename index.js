$(function () {
    window.Common = {
        date: new Date()
    };

    window.Fn = {
        init(){
            Fn.openDB(Conf.mainDBName);
        },

        render: {
            allTodoItems(datas){
                $.each(datas, (key, data)=> {
                    Fn.render.aNewTodoItem(data);
                });
            },
            aNewTodoItem(data){
                Common.$todolistContainer.prepend(Temp.todoItem(data));
            }
        },


        getTodolistData(callback){
            Common.mainStore.getAll().onsuccess = callback;
        },

        initCommonDom: function () {
            $.map(Conf.filter, function (item, key) {
                if (Common.$modContainer && item !== Conf.filter.modContainer) {
                    Common['$' + key] = Common.$modContainer.find(item);
                } else {
                    Common['$' + key] = $(item);
                }
            });
        },
        startListener(){
            $.each(Fn.listenerMap(), (event, filters)=> {
                console.log(event);
                $.each(filters, (filter, callbacks)=> {
                    params = [].concat(event, filter, callbacks);
                    console.log(params);
                    Common.$body.on.apply(Common.$body, params);
                })
            });
        },

        listenerMap() {
            return {
                click: {
                    [Conf.filter.newTodoBtn](){
                        var newTodoCont = Common.$newTodoInput.val();
                        if (newTodoCont !== "") {
                            Fn.addDatas({cont: newTodoCont});
                        }
                    },
                    [Conf.filter.todoItem](){
                        //console.log(2)
                    }
                },
                "mouseover mouseout": {
                    [Conf.filter.todoItem]: [
                        (e)=> {
                            console.log(e.type)
                        }
                    ]
                }
            }
        },

        openDB (name, version = 1){
            var request = window.indexedDB.open(name, version);
            request.onerror = function (e) {
                console.log(e.currentTarget.error.message);
            };
            request.onsuccess = function (e) {
                Common.mainDB = e.target.result;
                Common.mainStore = Common.mainDB.transaction(Conf.mainStoreName).objectStore(Conf.mainStoreName);

                Fn.initCommonDom();

                Common.todolistData = Fn.getTodolistData((e)=> {
                    Common.todolistData = e.target.result;
                    Fn.render.allTodoItems(Common.todolistData);
                    Fn.initCommonDom();
                });

                Fn.startListener();
            };
            request.onupgradeneeded = function (e) {
                var db = e.target.result;
                if (!db.objectStoreNames.contains(Conf.mainStoreName)) {
                    db.createObjectStore(Conf.mainStoreName, {autoIncrement: true}); // 键值自增
                }
                console.log('DB version changed to ' + version);
            };
        },
        closeDB(db){
            db.close();
        },
        deleteDB(dbName){
            window.indexedDB.deleteDatabase(dbName);
        },
        getDataByKey(db, storeName, value){
            var transaction = db.transaction(storeName, 'readwrite');
            var store = transaction.objectStore(storeName);
            var request = store.get(value);
            request.onsuccess = function (e) {
                var student = e.target.result;
                console.log(student.name);
            };
        },
        addDatas(datas, storeName = Conf.mainStoreName, db = Common.mainDB){
            datas = [].concat(datas);
            var transaction = db.transaction(storeName, 'readwrite');
            var store = transaction.objectStore(storeName);

            for (var i = 0, len = datas.length; i < len; i++) {
                datas[i] = $.extend(true, {}, Conf.newTodoItemForm(), datas[i]);
                store.add(datas[i]);

                Fn.render.aNewTodoItem(datas[i]);
                Fn.initCommonDom();
            }
        }
    };

    window.Conf = {
        mainDBName: 'todolistDB',
        mainStoreName: 'todolistStore',
        newTodoItemForm(){
            return {
                id: 4
                , timeStamp: Common.date.getTime()
                , status: Conf.todoStatusMap[0]
            }
        },
        filter: {
            body: 'body'
            , mainContainer: ''
            , newTodoBtn: '.newTodoBtn'
            , newTodoInput: '.newTodoInput'
            , todoItem: '.todoItem'
            , todolistContainer: '.todolistContainer'
        },
        todoStatusMap: ['unfinished', 'finished', 'delay', 'abort']
    };

    window.Temp = {
        todoItem(data, itemCss = ""){
            itemCss += " todoItem";
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
                '<a href="#" class="list-group-item todoItemContainer ' + itemCss + '">',
                data.cont,
                '<div class="btn-group todoItemBtnGroup">',
                '<button type="button" class="btn btn-primary glyphicon glyphicon-pencil"></button>',
                '<button type="button" class="btn btn-primary glyphicon glyphicon-minus"></button>',
                '<button type="button" class="btn btn-primary glyphicon glyphicon-ok"></button>',
                '</div>',
                '</a>'
            ].join('')
        }
    }

    Fn.init();
})
