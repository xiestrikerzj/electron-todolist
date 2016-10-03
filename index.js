(()=> {
    let Conf = require('./common.js').BaseConf;
    let BaseFn = require('./common.js').BaseFn;
    let Common = require('./common.js').BaseCommon;
    let Db = require('./db.js').Db;
    let Temp = require('./render.js').Temp;
    let Render = require('./render.js').Render;
    let Listener = require('./listener.js').Listener;

    let Fn = {
        init(){
            let dbVersion = 1;
            Db.openDB(Conf.mainDBName, dbVersion,
                function (e) { // onsuccess
                    Common.mainDB = e.target.result;
                    Common.mainStore = Common.mainDB.transaction(Conf.mainStoreName).objectStore(Conf.mainStoreName);

                    BaseFn.initCommonDom(Conf.filter, Common);

                    Render.allTodoDataFromStore();

                    Listener.startListener(Listener.listenerMap());
                },
                function (e) { // onupgradeneeded
                    let db = e.target.result;
                    if (!db.objectStoreNames.contains(Conf.mainStoreName)) {
                        let store = db.createObjectStore(Conf.mainStoreName, {autoIncrement: true, keyPath: "id"}); // 键值自增
                        store.createIndex('statusIndex', 'status', {unique: false}); // 创建状态索引
                    }
                    console.log('DB version changed to ' + dbVersion);
                },
                function (e) { // onerror
                    console.log(e.currentTarget.error.message);
                });
        },
    };

    Fn.init();
})();
