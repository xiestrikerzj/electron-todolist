;(()=> {
    require('./common.js');
    let Db = require('./db.js').Db;
    let Temp = require('./render.js').Temp;
    let Render = require('./render.js').Render;
    let Listener = require('./listener.js').Listener;

    // let thunkify = require('thunkify');
    // var t = thunkify(window.indexedDB.open);
    // function*gen() {
    //     yield t('testDb',1);
    // }
    //
    // let g = gen();
    // let gg=g.next();
    // debugger

    let fn = {
        init(){
            let dbVersion = 17; // 数据库版本，修改后才会执行onupgradeneeded事件处理函数
            Db.openDB({
                name: Conf.mainDBName, version: dbVersion,
                onsuccess: (e)=> { // onsuccess
                    Common.mainDB = e.target.result;
                    Db.useDatabase(Common.mainDB);
                    Common.mainStore = Common.mainDB.transaction(Conf.mainStoreName).objectStore(Conf.mainStoreName);
                    Common.statusStore = Common.mainDB.transaction(Conf.statusStoreName).objectStore(Conf.statusStoreName);

                    // 初始化公共元素
                    Fn.initCommonDom(Filter, Common);

                    // 获取app状态，进行初始化
                    Db.getDataByIndex({
                        callback: (datas) => {
                            var appStatus = datas;
                            if (!appStatus) {
                                appStatus = {
                                    flag: 'main',
                                    statusFilter: 'all',
                                    tags: [Conf.noTagTxt],
                                    tagsFilter: [],
                                    initTime: (new Date()).getTime()
                                };
                                Db.addDatas(appStatus, function (e) {
                                    appStatus.id = e.target.result;
                                }, Conf.statusStoreName);
                            }

                            // 获取并渲染筛选后的todo数据
                            Db.getTodoDatas({status: appStatus.statusFilter, tags: appStatus.tagsFilter});

                            // 渲染标签筛选菜单项
                            Render.tagMenuItem({tags: appStatus.tags, actTags: appStatus.tagsFilter});

                            // 标签筛选输入框内容初始化
                            Common.$tagFilterInput.val(`标签:${($.isEmptyObject(appStatus.tagsFilter) ? ["所有标签"] : appStatus.tagsFilter).join(',')}`);

                            // 点亮筛选按钮
                            $(`${Filter.filterBtn}[data-val="${appStatus.statusFilter}"]`).addClass('btn-primary');


                            // 隐藏当前的标签筛选方式按钮
                            Render.tagFilterWayBtns({hideBtn: appStatus.tagsFilterWay || 'single'});
                        }
                    });

                    // 给新建待办项输入框一个焦点
                    Common.$newTodoInput.focus();

                    Listener.startListener(Listener.listenerMap()); // 普通元素事件监听
                    Listener.startWinListener(); // 窗口时间监听

                },
                onupgradeneeded: (e)=> { // onupgradeneeded
                    let db = e.target.result, store;
                    Db.useDatabase(db);
                    // 主仓库，用来存储待办项数据
                    if (!db.objectStoreNames.contains(Conf.mainStoreName)) {
                        store = db.createObjectStore(Conf.mainStoreName, {autoIncrement: true, keyPath: "id"}); // 键值自增
                        Db.createIndex({
                            store: store,
                            name: Conf.mainIndexName,
                            key: 'status',
                            options: {unique: false}
                        }); // 创建状态索引，将数据对象中的某个字段作为该索引的键值
                    }
                    // 状态仓库，用于存储：已创建的标签、关闭应用时的状态（用于开启应用后恢复）
                    if (!db.objectStoreNames.contains(Conf.statusStoreName)) {
                        store = db.createObjectStore(Conf.statusStoreName, {autoIncrement: true, keyPath: "id"}); // 键值自增
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
                onerror: (e)=> { // onerror
                    console.log(e.currentTarget.error.message);
                }
            });
        },
    };

    fn.init();
})();
