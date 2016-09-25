(()=> {
    let Conf= require('./common.js').BaseConf;
    let BaseFn= require('./common.js').BaseFn;
    let Common= require('./common.js').BaseCommon;
    let Db = require('./db.js').Db;
    let Temp = require('./render.js').Temp;
    let Render = require('./render.js').Render;
    let Listener = require('./listener.js').Listener;

    let Fn = {
        init(){
            Db.openDB(Conf.mainDBName, 1,
                function (e) { // onsuccess
                    Common.mainDB = e.target.result;
                    Common.mainStore = Common.mainDB.transaction(Conf.mainStoreName).objectStore(Conf.mainStoreName);

                    BaseFn.initCommonDom(Conf.filter, Common);

                    Fn.getTodolistData((e)=> {
                        Common.todolistData = e.target.result;
                        Render.allTodoItems(Common.todolistData);
                        BaseFn.initCommonDom(Conf.filter, Common);
                    });

                    Listener.startListener();
                },
                function (e) { // onupgradeneeded
                    let db = e.target.result;
                    if (!db.objectStoreNames.contains(Conf.mainStoreName)) {
                        db.createObjectStore(Conf.mainStoreName, {autoIncrement: true}); // 键值自增
                    }
                    console.log('DB version changed to ' + version);
                },
                function (e) { // onerror
                    console.log(e.currentTarget.error.message);
                });
        },

        getTodolistData(callback){
            Common.mainStore.getAll().onsuccess = callback;
        },
    };

    Fn.init();
})();
