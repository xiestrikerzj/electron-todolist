$(function(){
  window.Fn = {
    getDatabase(){
      if (!window.indexedDB) {  
        window.indexedDB = window.mozIndexedDB || window.webkitIndexedDB;  
      }  

      var request = indexedDB.open("MyTestDatabase");  

      request.onsuccess = function(e) {  
        // Obtain IDBDatabase   
        // VERSION_CHANGE transaction callback  
        console.log(1);
        var db = request.result;  
      }  
    },
    createDatabase(dbName) {
     var openRequest = localDatabase.indexedDB.open(dbName);

     openRequest.onerror = function(e) {
      console.log("Database error: " + e.target.errorCode);
    };
    openRequest.onsuccess = function(event) {
      console.log("Database created");
      localDatabase.db = openRequest.result;
    };
    openRequest.onupgradeneeded = function (evt) {

    };
  },
  getData(){

  }
}
})
