/**
 * Created by dell on 2016/10/31.
 */
;(()=> {
    window.fs = require('fs');
    window.co = require('co');
    let File = {
        readFile: thunkify(fs.readFile),
        writeFile: thunkify(fs.writeFile),
        appendFile: thunkify(fs.appendFile),
        stat: thunkify(fs.stat),
        exists: thunkify(fs.exists),

        // 如果数据库中的数据比备份文件中的小，可能是数据库中的数据有丢失，将文件中的内容覆盖到数据库中
        // 从备份文件导入
        importDataFromBakFile(){
            co(function*() {
                let bakFilePath = Common.bakFilePath;
                let bakData = {
                    todoDatas: yield Db.getAllData({}),
                    appStatus: yield Db.getDataByIndex({})
                };
                let bakDataStr = JSON.stringify(bakData);
                let bakDataSize = bakDataStr.length;
                let bakFileSize = (yield File.stat(bakFilePath)).size;
                if (bakDataSize < bakFileSize) {
                    let bakData = JSON.parse(yield File.readFile(bakFilePath, 'utf8'));
                    l(bakDataSize, bakFileSize);
                    //alert(`数据已备份到${bakFilePath}（大小${bakFileSize}->${bakDataSize}）`);
                }
            });
        },

        exportDataToBakFile(){
            co(function*() {
                let bakFilePath = Common.bakFilePath;
                let bakData = {
                    todoDatas: yield Db.getAllData({}),
                    appStatus: yield Db.getDataByIndex({})
                };
                let bakDataStr = JSON.stringify(bakData);
                let bakDataSize = bakDataStr.length;
                let bakFileSize = (yield File.stat(bakFilePath)).size;
                if (bakDataSize > bakFileSize) {
                    yield File.writeFile(bakFilePath, bakDataStr, 'utf8');
                    alert(`数据已备份到${bakFilePath}（大小${bakFileSize}->${bakDataSize}）`);
                }
            });
        },
    };

    window.File = File;
    exports.File = File;

})();
