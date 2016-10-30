/**
 * Created by Striker on 2016/9/24.
 */

(()=> {

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
        getDataByPrimaryKey({key, callback, storeName = Conf.mainStoreName, db = Common.mainDB}){
            let transaction = db.transaction(storeName, 'readonly');
            let store = transaction.objectStore(storeName);
            let request = store.get(key);
            request.onsuccess = function (e) {
                callback && callback(e.target.result);
            };
        },
        getDataByIndex({index, callback, indexName = Conf.statusIndexName, storeName = Conf.statusStoreName, db = Common.mainDB}){
            var transaction = db.transaction(storeName);
            var store = transaction.objectStore(storeName);
            var ind = store.index(indexName);
            ind.get(index).onsuccess = (e) => {
                callback && callback(e.target.result);
            }
        },
        getDatasByIndex({IDBKeyRange, callback, eachCallback, indexName = Conf.mainIndexName, storeName = Conf.mainStoreName, db = Common.mainDB}){
            let transaction = db.transaction(storeName);
            let store = transaction.objectStore(storeName);
            let index = store.index(indexName);
            let request = index.openCursor(IDBKeyRange);
            let datas = [], keys = [];
            request.onsuccess = function (e) {
                let cursor = e.target.result;
                if (cursor) {
                    datas.push(cursor.value);
                    keys.push(cursor.key);
                    eachCallback && eachCallback(cursor);
                    cursor.continue();
                } else {
                    callback && callback(datas, keys);
                }
            };
        },
        getAllData(succCallback, storeName = Conf.mainStoreName, db = Common.mainDB){
            let transaction = db.transaction(storeName, 'readonly');
            let store = transaction.objectStore(storeName);
            let request = store.getAll();
            request.onsuccess = succCallback;
        },

        //
        updateDataByPrimaryKey({key, valObj, storeName = Conf.mainStoreName, db = Common.mainDB}){
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
                store.add(datas[i]).onsuccess = succCallback;
            }
        },
        deleteDataByPrimaryKey(key, storeName = Conf.mainStoreName, db = Common.mainDB){
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
        getTodoDatas({
            id, status, tags = [], callback = ()=> {
        }
        }){
            let transaction = db.transaction(Conf.mainStoreName, 'readonly');
            let store = transaction.objectStore(Conf.mainStoreName);
            let request;
            if ($.isNumeric(id)) {
                request = store.get(id);
                request.onsuccess = function (e) {
                    callback(e.target.result);
                };
            } else if (typeof status === 'string') {
                let index = store.index('status'), datas = [];
                request = index.openCursor(IDBKeyRange.only(status))
                request.onsuccess = function (e) {
                    let cursor = e.target.result;
                    if (cursor) {
                        datas.push(cursor.value);
                        cursor.continue();
                    }
                };
                callback(datas);
            } else if ($.isArray(tags) && !$.isEmptyObject(tags)) {

            } else {
                request = store.getAll();
                request.onsuccess = function (e) {
                    callback(e.target.result);
                };
            }
        },
    };

    window.Db = Db;
    exports.Db = Db;
})();
