(()=> {
    let Db = require('./db.js').Db;
    let Temp = require('./render.js').Temp;
    let Render = require('./render.js').Render;
    let Listener = require('./listener.js').Listener;

    let fn = {
        init(){
            let dbVersion = 8; // 数据库版本，修改后才会执行onupgradeneeded事件处理函数
            Db.openDB(Conf.mainDBName, dbVersion,
                function (e) { // onsuccess
                    Common.mainDB = e.target.result;
                    Common.mainStore = Common.mainDB.transaction(Conf.mainStoreName).objectStore(Conf.mainStoreName);
                    Common.statusStore = Common.mainDB.transaction(Conf.statusStoreName).objectStore(Conf.statusStoreName);

                    // 获取app状态数据，保存到全局变量
                    Db.getDataByIndex({
                        index: 'main',
                        indexName: Conf.statusIndexName,
                        storeName: Conf.statusStoreName,
                        callback: (datas) => {
                            var mainStatus = datas;
                            if (!mainStatus) {
                                mainStatus = {
                                    flag: 'main',
                                    tags: [],
                                    nowTag: '',
                                    nowFiler: '',
                                    initTime: (new Date()).getTime()
                                };
                                Db.addDatas(mainStatus, function (e) {
                                    mainStatus.id = e.target.result;
                                }, Conf.statusStoreName);
                            }
                            Common.mainStatusData = mainStatus;
                            Common.tagList = mainStatus.tags;

                            // 渲染标签筛选菜单项
                            Render.tagMenuItem({tags: Common.tagList});
                        }
                    });

                    Fn.initCommonDom(Filter, Common);

                    Render.allTodoDataFromStore();

                    Listener.startListener(Listener.listenerMap()); // 普通元素事件监听
                    Listener.startWinListener(); // 窗口时间监听

                    Common.$newTodoInput.focus(); // 进入页面时,给新建待办项输入框一个焦点

                },
                function (e) { // onupgradeneeded
                    let db = e.target.result;
                    // 主仓库，用来存储待办项数据
                    debugger
                    if (!db.objectStoreNames.contains(Conf.mainStoreName)) {
                        let store = db.createObjectStore(Conf.mainStoreName, {autoIncrement: true, keyPath: "id"}); // 键值自增
                        Db.createIndex({
                            store: store,
                            name: Conf.mainIndexName,
                            key: 'status',
                            options: {unique: false}
                        }); // 创建状态索引，将数据对象中的某个字段作为该索引的键值
                        Db.createIndex({
                            store: store,
                            name: 'tagsIndex',
                            key: 'tags',
                            options: {unique: false}
                        }); // 创建状态索引，将数据对象中的某个字段作为该索引的键值
                    }
                    // 状态仓库，用于存储：已创建的标签、关闭应用时的状态（用于开启应用后恢复）
                    if (!db.objectStoreNames.contains(Conf.statusStoreName)) {
                        let store = db.createObjectStore(Conf.statusIndexName, {autoIncrement: true, keyPath: "id"}); // 键值自增
                        Db.createIndex({
                                store: store,
                                name: Conf.statusIndexName,
                                key: 'flag',
                                options: {unique: false}
                            }
                        ); // 创建状态索引，将数据对象中的某个字段作为该索引的键值
                    }
                    console.log('DB version changed to ' + dbVersion);
                },
                function (e) { // onerror
                    console.log(e.currentTarget.error.message);
                });
        },
    };

    fn.init();
})();
