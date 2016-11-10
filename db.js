/**
 * Created by Striker on 2016/9/24.
 */

;(()=> {

    let Db = {
        openDB ({name, version = 1, onsuccess, onupgradeneeded, onerror}){
            let request = window.indexedDB.open(name, version);
            request.onerror = onerror;
            request.onsuccess = onsuccess;
            request.onupgradeneeded = onupgradeneeded;
        },
        closeDB(db){
            db.close();
        },
        deleteDB(dbName){
            window.indexedDB.deleteDatabase(dbName);
        },
        useDatabase(db) {
            // 确保添加一个如果另一个页面请求一个版本变化时来被通知的处理程序。
            // 我们必须关闭这个数据库。这就允许其他页面对数据库进行升级。
            // 如果你不这么做的话，除非用户关闭标签页否则升级就不会发生。
            db.onversionchange = function (event) {
                db.close();
                alert("A new version of this page is ready. Please reload!");
            };

            // 其他针对数据库的处理
        },
        getDatasByPrimaryKey({keys=[], storeName = Conf.mainStoreName, db = Common.mainDB}){
            keys = [].concat(keys);
            let transaction = db.transaction(storeName, 'readonly');
            let store = transaction.objectStore(storeName);
            let promises = [];
            $.each(keys, (index, key)=> {
                promises.push(new Promise(function (resolved, reject) {
                    let request = store.get(key);
                    request.onsuccess = (e)=> {
                        resolved(e.target.result);
                    };
                    request.onerror = reject;
                }));
            });
            return promises;
        },
        getDataByIndex({index = 'main', indexName = Conf.statusIndexName, storeName = Conf.statusStoreName, db = Common.mainDB}){
            var transaction = db.transaction(storeName);
            var store = transaction.objectStore(storeName);
            var ind = store.index(indexName);
            return new Promise((resolve, reject)=> {
                let request = ind.get(index);
                request.onsuccess = (e) => {
                    resolve(e.target.result);
                };
                request.onerror = reject;
            });
        },
        getDatasByIndex({IDBKeyRange, callback, eachCallback, indexName = Conf.mainIndexName, storeName = Conf.mainStoreName, db = Common.mainDB}){
            let datas = [], keys = [];
            let transaction = db.transaction(storeName);
            let store = transaction.objectStore(storeName);
            let index = store.index(indexName);
            let request = index.openCursor(IDBKeyRange);
            request.onsuccess = function (e) {
                let cursor = e.target.result;
                if (cursor) {
                    eachCallback && eachCallback(cursor.value, cursor);
                    datas.push(cursor.value);
                    keys.push(cursor.key);
                    cursor.continue();
                } else {
                    callback && callback(datas, keys);
                }
            };
        },
        getAllData({storeName = Conf.mainStoreName, db = Common.mainDB}){
            return new Promise((resolve, reject)=> {
                let transaction = db.transaction(storeName, 'readonly');
                let store = transaction.objectStore(storeName);
                let request = store.getAll();
                request.onsuccess = (e)=> {
                    resolve(e.target.result);
                };
                request.onerror = reject;
            })
        },

        //
        updateDataByPrimaryKey({key, valObj, storeName = Conf.mainStoreName, db = Common.mainDB, callback, isDeepExtend = false}){
            let transaction = db.transaction(storeName, 'readwrite');
            let store = transaction.objectStore(storeName);
            let request = store.get(key);
            request.onsuccess = function (e) {
                let data = e.target.result;
                data = $.extend(isDeepExtend, data, valObj);
                store.put(data);
                callback && callback(data);
            };
        },
        updateDataByIndex({index = 'main', valObj, callback, indexName = Conf.statusIndexName, storeName = Conf.statusStoreName, db = Common.mainDB}){
            var transaction = db.transaction(storeName);
            var store = transaction.objectStore(storeName);
            var ind = store.index(indexName);
            ind.get(index).onsuccess = (e) => {
                var data = e.target.result;
                Db.updateDataByPrimaryKey({
                    key: data.id,
                    valObj: valObj,
                    storeName: Conf.statusStoreName,
                    callback: callback
                });
            }
        },
        addDatas({datas=[], storeName = Conf.mainStoreName, db = Common.mainDB}){
            datas = [].concat(datas);
            let transaction = db.transaction(storeName, 'readwrite');
            let store = transaction.objectStore(storeName);
            let promises = [];

            for (let i = 0, len = datas.length; i < len; i++) {
                promises.push(new Promise((resolve, reject)=> {
                    let request = store.add(datas[i]);
                    request.onsuccess = (e)=> {
                        resolve(e.target.result);
                    };
                    request.onerror = (err)=> {
                        reject(err);
                    }
                }));
            }
            return promises;
        },
        deleteDataByPrimaryKey({key, storeName = Conf.mainStoreName, db = Common.mainDB}){
            let transaction = db.transaction(storeName, 'readwrite');
            let store = transaction.objectStore(storeName);
            store.delete(key);
        },
        createStore(db, storeName, indexName, indexKey, indexOpt){
            if (!db.objectStoreNames.contains(storeName)) {
                let store = db.createObjectStore(storeName, {autoIncrement: true, keyPath: "id"}); // 键值自增
                store.createIndex(indexName, indexKey, indexOpt); // 创建状态索引，将数据对象中的某个字段作为该索引的键值
            }
        },
        createIndex({store, name = Conf.mainIndexName, key = 'status', options = {unique: false}}){
            if ($.isEmptyObject(store))return;
            store.createIndex(name, key, options); // 创建状态索引，将数据对象中的某个字段作为该索引的键值
        },
        getTodoDatas({ids=[], status, tags = [], callback, autoRender = true}){
            ids = [].concat(ids);
            let datas;
            return new Promise((resolve, reject)=> {
                co(function*() {
                    if (!$.isEmptyObject(ids)) { // 如果指定id，忽略其他筛选条件，返回id指定数据
                        datas = yield Db.getDatasByPrimaryKey({keys: ids});
                    } else { // 没有指定id，则获取所有数据 进行条件筛选
                        datas = yield Db.getAllData({});
                        datas = filte(datas);
                    }
                    autoRender && Render.todoItems({datas: datas});
                    return datas;
                }).then(datas=> {
                    resolve(datas);
                }).catch(err=> {
                    reject(err);
                });
            });

            // 条件筛选
            function filte(datas) {

                // 状态筛选
                if (typeof status === 'string') {
                    let res = [], statusList = [].concat(status);
                    (status === 'all') && (statusList = ['finished', 'unfinished']);
                    $.each(datas, (ind, data)=> {
                        (statusList.includes(data.status)) && res.push(data);
                    });
                    datas = res;
                }

                // 标签筛选 如果筛选已删除的商品 则略过标签筛选
                if ($.isArray(tags) && !$.isEmptyObject(tags) && status !== 'deleted') {
                    let res = [];
                    $.each(datas, (ind, data)=> {
                        $.each(tags, (i, tag)=> {
                            if ((data.tags || []).includes(tag)) {
                                res.push(data);
                                return false;
                            }
                        });
                    });
                    datas = res;
                }

                return datas;
            }
        }
    };

    window.Db = Db;
    exports.Db = Db;
})
();
