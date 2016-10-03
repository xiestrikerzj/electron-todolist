/**
 * Created by Striker on 2016/9/24.
 */

(()=> {
    let Conf = require('./common.js').BaseConf;
    let BaseFn = require('./common.js').BaseFn;
    let Common = require('./common.js').BaseCommon;

    let Db = {
        openDB (name, version = 1, onsuccess, onupgradeneeded, onerror){
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
        getDataByKey(key, callback, storeName = Conf.mainStoreName, db = Common.mainDB){
            let transaction = db.transaction(storeName, 'readwrite');
            let store = transaction.objectStore(storeName);
            let request = store.get(key);
            request.onsuccess = function (e) {
                callback && callback(e.target.result);
            };
        },
        getMultipleDataByIndex(keyRangeObj, succCallback, indexName = "statusIndex", storeName = Conf.mainStoreName, db = Common.mainDB){
            let transaction = db.transaction(storeName);
            let store = transaction.objectStore(storeName);
            let index = store.index(indexName);
            let request = index.openCursor(keyRangeObj)
            request.onsuccess = function (e) {
                let cursor = e.target.result;
                if (cursor) {
                    succCallback(cursor);
                    // let student = cursor.value;
                    // console.log(student);
                    cursor.continue();
                }
            }
        },
        getAllData(succCallback, storeName = Conf.mainStoreName, db = Common.mainDB){
            let transaction = db.transaction(storeName, 'readwrite');
            let store = transaction.objectStore(storeName);
            let request = store.getAll();
            request.onsuccess = succCallback;
        },

        updateDataByKey(key, valObj, storeName = Conf.mainStoreName, db = Common.mainDB){
            let transaction = db.transaction(storeName, 'readwrite');
            let store = transaction.objectStore(storeName);
            let request = store.get(key);
            request.onsuccess = function (e) {
                let data = e.target.result;
                $.extend(true, data, valObj);
                store.put(data);
            };
        },
        addDatas(datas, succCallback, storeName = Conf.mainStoreName, db = Common.mainDB){
            datas = [].concat(datas);
            let transaction = db.transaction(storeName, 'readwrite');
            let store = transaction.objectStore(storeName);

            for (let i = 0, len = datas.length; i < len; i++) {
                datas[i] = $.extend(true, {}, Conf.newTodoItemForm(), datas[i]);
                store.add(datas[i]).onsuccess = succCallback;
            }
        },
        deleteDataByKey(key, storeName = Conf.mainStoreName, db = Common.mainDB){
            let transaction = db.transaction(storeName, 'readwrite');
            let store = transaction.objectStore(storeName);
            store.delete(key);
        }
    };

    window.Db = Db;
    exports.Db = Db;
})();
