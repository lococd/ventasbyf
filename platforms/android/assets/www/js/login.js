document.addEventListener('deviceready', function(){
  function checkLogin()
  {
    if (window.localStorage.getItem("user") != "" && window.localStorage.getItem("password") != "" && window.localStorage.getItem("user") != null && window.localStorage.getItem("password") != null){
      login(window.localStorage.getItem("user"),window.localStorage.getItem("password"));
    }
    else{
      $("#txtUser").focus();
      return false;
    }
  }

  function login(user, password){
    var baseOK = false;
    //compruebo validez de la base
    createCarpetaNvt();
    //window.sqlitePlugin.importPrepopulatedDatabase({file: "envios2.db", "importIfExists": false});
      var db = window.sqlitePlugin.openDatabase({name: "envios2.db"});
      var query = "select fecact from ma_update";

      db.transaction(function (tx) {

        tx.executeSql(query, [], function (tx, rs) {
          var fecha = rs.rows.item(0).fecact.toString();
          var agno = parseInt(fecha.substr(0,4));
          var mes = parseInt(fecha.substr(4,2));
          var dia = parseInt(fecha.substr(6,2));
          var sysdate = new Date();
          var fechaVenc = new Date(agno,mes-1,dia);
          if( fechaVenc > sysdate ){ //>
            query = "select count(*) as TOTAL from ma_usuario where codusu = '" + user + "' and clave1 = '" + password + "'";
            db.executeSql(query, [], function(rs2) {
              if(rs2.rows.item(0).TOTAL > 0){
                window.localStorage.setItem("user", user);
                window.localStorage.setItem("password", password);
                window.location.replace("main.html");
              }
              else{
                alert("logueado incorrecto");
                return false;
              }
            }, function(error) {
                //alert("logueado incorrecto " + JSON.stringify(error));
                return false;
            });
          }
          else{
            alert("Base vencida, ingrese una nueva");
            getBase();
            return false;
          }
        },
        function (tx, error) {
            var strErr = JSON.stringify(error);
            if(strErr.includes("2:") || strErr.includes("missing database") || strErr.includes("no such table")){
              alert("No hay base de datos cargada, ingrese una");
              getBase();
              return false;
            }
            else{
                alert("problema en query " + strErr);
                return false;
            }
        });
    }, function (error) {
        console.log('transaction error: ' + error.message);
    }, null);







      /*db.executeSql(query, [], function(rs) {
        var fecha = rs.rows.item(0).fecact.toString();
        var agno = parseInt(fecha.substr(0,4));
        var mes = parseInt(fecha.substr(4,2));
        var dia = parseInt(fecha.substr(6,2));
        var sysdate = new Date();
        var fechaVenc = new Date(agno,mes-1,dia);
        if( fechaVenc > sysdate ){
          checkLogin();
        }
        else{
          alert("Base vencida, ingrese una nueva");
          getBase();
          return false;
        }
      }, function(error) {
        var strErr = JSON.stringify(error);
        if(strErr.includes("2:")){
          alert("No hay base de datos cargada, ingrese una");
          getBase();
          return false;
        }
        else{
            alert("problema en query " + strErr);
            return false;
        }
      });*/

      /*db = window.sqlitePlugin.openDatabase({name: "envios2.db"});
      query = "select count(*) as TOTAL from ma_usuario where codusu = '" + user + "' and clave1 = '" + password + "'";
      db.executeSql(query, [], function(rs) {
        if(rs.rows.item(0).TOTAL > 0){
          window.localStorage.setItem("user", user);
          window.localStorage.setItem("password", password);
          window.location.replace("main.html");
        }
        else{
          alert("logueado incorrecto");
          return false;
        }
      }, function(error) {
          alert("logueado incorrecto " + JSON.stringify(error));
          return false;
      });*/
  }

    function getBase(){
    if(!confirm("Recuerde enviar todas las notas de venta antes de cargar nueva base, se borrarán las notas existentes. ¿Quiere continuar?")){
      return false;
    }
    else{
      filechooser.open({"mime": "application/octet-stream"}, function(data) {
        var pathDB = "file:///data/data/cl.dimeiggs.precios/databases/";

        var seleccionado = data.url;

        window.resolveLocalFileSystemURI(seleccionado, function(fileEntrySelected) {
          var path2 = "file:///data/data/cl.dimeiggs.precios/"
          //agarro el directorio root
          window.resolveLocalFileSystemURL(seleccionado, 
              function(fileDB){
                  window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
                          window.resolveLocalFileSystemURL( path2, function( directoryEntry ) {
                            directoryEntry.getDirectory("databases", {create: true, exclusive: false}, function(dirDB) {
                              fileDB.copyTo(dirDB, 'envios2.db',
                              function(){
                                  fileDB.copyTo(dirDB, 'envios.db',
                                  function(){
                                      window.localStorage.setItem("numnvt", 1);
                                      deleteNvts();
                                      alert("¡Base de datos cargada correctamente!");
                                      checkLogin();
                                  }, 
                                  function(err){
                                      alert('unsuccessful copying ' + err);
                                  });
                              }, 
                              function(err){
                                  alert('unsuccessful copying ' + err);
                              });
                            },null);
                          },null);                        
                      }, null);
              }, 
              function(){
                  alert('failure! database was not found');
              });




          /*window.resolveLocalFileSystemURL( path2, function( directoryEntry ) {
            directoryEntry.getDirectory("databases", {create: false, exclusive: false}, function(dir) {  //tomo el directorio databases
              // tomo un lector del directorio
              var directoryReader = dir.createReader();

              // borro todos los ficheros
              directoryReader.readEntries(function(entries) {
                                              var i;
                                              for (i=0; i<entries.length; i++) {
                                                  //tomo archivo por archivo
                                                  dir.getFile(entries[i].name, {create:false}, function(fileEntry2) {
                                                              //y borro el archivo
                                                              fileEntry2.remove(function(){
                                                                  //alert("archivo removido! " + entries[i].name);
                                                              },function(error){
                                                                  alert("Problemas al borrar");
                                                              },function(){
                                                                 alert("Archivo no existe");
                                                              });
                                                  });
                                              }
                                          }
              ,function fail(error) {
                alert("Failed to list directory contents: " + error.code);
            });

            },
            function(error) { 
              alert("Error "+error.code); 
            });
          });*/


          /*var strDB;

          window.localStorage.setItem("numnvt", 1);
                                          deleteNvts();
                                          alert("¡Base de datos cargada correctamente!");
                                          checkLogin();*/ //DESCOMENTAR AL TERMINAR
          

          /*window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs){
            window.resolveLocalFileSystemURL(pathDB,function(dirCopy){
            fileEntry.copyTo(dirCopy, 'envios.db',function(){
                        fileEntry.copyTo(dirCopy, 'envios2.db',function(){
                        window.localStorage.setItem("numnvt", 1);
                        deleteNvts();
                        alert("¡Base de datos cargada correctamente!");
                        checkLogin();
                        },
                      function(err)
                      {
                          alert(err.code);
                      });
                      },
                    function(err)
                    {
                        alert(err.code);
                    });
            },
            function(err){
              alert("err getAppDir " +err.code);
            });
          },function(err){
            alert("error al copiar! " + err);
          });*/

        },
        function(error) {
          alert("err getBaseNueva " + error.code);
        });
      },
      function(msg) {
        alert("Archivo no seleccionado " + msg);
      });
    }    
  }

  $("#btnLogin").click(function(e){
    window.localStorage.setItem("user", "");
    window.localStorage.setItem("password", "");
    var user = $("#txtUser").val().toUpperCase();
    var password = $("#txtPassword").val().toUpperCase();
    if(user.length>0 && password.length>0){
      login(user,password);
    }
    else{
      $("#lblTexto").text("Ingrese usuario y contraseña");
      $("#txtUser").val('');
      $("#txtPassword").val('');
      $("#txtUser").focus();
    }
  });

function createCarpetaNvt(){
  //genero carpeta nvt
  window.resolveLocalFileSystemURL( cordova.file.externalRootDirectory, function( directoryEntry ) {
    directoryEntry.getDirectory("nvt", {create: true, exclusive: false}, function(dir) { 
      //alert("Created dir "+dir.name); 
    },
    function(error) { 
      alert("Error creando directorio "+error.code); 
    });
  });
}

function deleteDB() {
  var path = "file:///data/data/cl.dimeiggs.precios/"
  //agarro el directorio root
  window.resolveLocalFileSystemURL( path, function( directoryEntry ) {
    directoryEntry.getDirectory("databases", {create: false, exclusive: false}, function(dir) {  //tomo el directorio databases
      // tomo un lector del directorio
      var directoryReader = dir.createReader();

      // listo todos los ficheros
      directoryReader.readEntries(function(entries) {
                                      var i;
                                      for (i=0; i<entries.length; i++) {
                                          //tomo archivo por archivo
                                          dir.getFile(entries[i].name, {create:false}, function(fileEntry) {
                                                      //y borro el archivo
                                                      fileEntry.remove(function(){
                                                          //alert("archivo removido! " + entries[i].name);
                                                      },function(error){
                                                          alert("Problemas al borrar");
                                                      },function(){
                                                         alert("Archivo no existe");
                                                      });
                                          });
                                      }
                                  }
      ,function fail(error) {
        alert("Failed to list directory contents: " + error.code);
    });

    },
    function(error) { 
      alert("Error "+error.code); 
    });
  });
}

function deleteNvts(){
  //agarro el directorio root
  window.resolveLocalFileSystemURL( cordova.file.externalRootDirectory, function( directoryEntry ) {
    directoryEntry.getDirectory("nvt", {create: false, exclusive: false}, function(dir) {  //tomo el directorio root/nvt
      // tomo un lector del directorio
      var directoryReader = dir.createReader();

      // listo todos los ficheros
      directoryReader.readEntries(function(entries) {
                                      var i;
                                      for (i=0; i<entries.length; i++) {
                                          //tomo archivo por archivo
                                          dir.getFile(entries[i].name, {create:false}, function(fileEntry) {
                                                      //y borro el archivo
                                                      fileEntry.remove(function(){
                                                          //alert("archivo removido!");
                                                      },function(error){
                                                          alert("Problemas al borrar");
                                                      },function(){
                                                         alert("Archivo no existe");
                                                      });
                                          });
                                      }
                                  }
      ,function fail(error) {
        alert("Failed to list directory contents: " + error.code);
    });

    },
    function(error) { 
      alert("Error "+error.code); 
    });
  });
}

checkLogin();

}, false);