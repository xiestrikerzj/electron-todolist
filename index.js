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
            let dbVersion = 5; // 数据库版本，修改后才会执行onupgradeneeded事件处理函数
            Db.openDB(Conf.mainDBName, dbVersion,
                function (e) { // onsuccess
                    Common.mainDB = e.target.result;
                    Common.mainStore = Common.mainDB.transaction(Conf.mainStoreName).objectStore(Conf.mainStoreName);
                    Common.statusStore = Common.mainDB.transaction(Conf.statusStoreName).objectStore(Conf.statusStoreName);

                    // 获取app状态数据，保存到全局变量
                    Db.getAllData((e)=> {
                        Common.statusData = e.target.result;
                        console.log(Common.statusData);
                        Render.tagsBox();
                    }, Conf.statusStoreName);

                    BaseFn.initCommonDom(Conf.filter, Common);

                    Render.allTodoDataFromStore();

                    Listener.startListener(Listener.listenerMap()); // 普通元素事件监听
                    Listener.startWinListener(); // 窗口时间监听

                    Common.$newTodoInput.focus(); // 进入页面时,给新建待办项输入框一个焦点

                },
                function (e) { // onupgradeneeded
                    let db = e.target.result;
                    Db.createStore(db, Conf.mainStoreName, 'statusIndex', 'status', {unique: false}); // 主仓库，用来存储待办项数据
                    Db.createStore(db, Conf.statusStoreName, 'flagIndex', 'flag', {unique: true}); // 状态仓库，用于存储：已创建的标签、关闭应用时的状态（用于开启应用后恢复）
                    console.log('DB version changed to ' + dbVersion);
                },
                function (e) { // onerror
                    console.log(e.currentTarget.error.message);
                });
        },
    };

    Fn.init();
})();
