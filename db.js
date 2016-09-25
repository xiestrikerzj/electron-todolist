/**
 * Created by Striker on 2016/9/24.
 */

(()=> {
    let Conf= require('./common.js').BaseConf;
    let BaseFn= require('./common.js').BaseFn;
    let Common= require('./common.js').BaseCommon;

    var Db = {
        openDB (name, version = 1, onsuccess, onupgradeneeded, onerror){
            var request = window.indexedDB.open(name, version);
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
        getDataByKey(store, value, callback){
            if (typeof store === "undefined") return;
            var request = store.get(value);
            request.onsuccess = function (e) {
                callback && callback(e.target.result);
            };
        },
        getAllData(){

        },
        addDatas(datas, storeName = Conf.mainStoreName, db = Common.mainDB){
            datas = [].concat(datas);
            var transaction = db.transaction(storeName, 'readwrite');
            var store = transaction.objectStore(storeName);

            for (var i = 0, len = datas.length; i < len; i++) {
                datas[i] = $.extend(true, {}, Conf.newTodoItemForm(), datas[i]);
                store.add(datas[i]);
            }
        }
    };

    exports.Db = Db;
})();
