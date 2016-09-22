$(function () {
    window.Common = {};

    window.Fn = {
        init(){
            Fn.openDB(Conf.mainDBName);

            Fn.addData({test: 1});
        },
        openDB (name, version=2) {
            var version = version || 1;
            var request = window.indexedDB.open(name, version);
            request.onerror = function (e) {
                console.log(e.currentTarget.error.message);
            };
            request.onsuccess = function (e) {
                Common.mainDB = e.target.result;
            };
            request.onupgradeneeded = function (e) {
                var db = e.target.result;
                if (!db.objectStoreNames.contains(Conf.mainStoreName)) {
                    db.createObjectStore(Conf.mainStoreName, {keyPath: "id"});
                }
                console.log('DB version changed to ' + version);
            };
        },
        closeDB(db){
            db.close();
        },
        deleteDB(dbName){
            indexedDB.deleteDatabase(dbName);
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
        addData(datas, storeName = Conf.mainStoreName, db = Common.mainDB){
            datas = [].concat(datas);
            var transaction = db.transaction(storeName, 'readwrite');
            var store = transaction.objectStore(storeName);

            for (var i = 0, len = datas.length; i < len; i++) {
                store.add(datas[i]);
            }
        }
    }

    window.Conf = {
        mainDBName: 'todolistDB',
        mainStoreName: 'todolistStore',
    }

    Fn.init();
})
