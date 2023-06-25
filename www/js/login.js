document.addEventListener('deviceready', function(){
  function checkLogin(){
    if (window.localStorage.getItem("user") != "" && window.localStorage.getItem("password") != "" && window.localStorage.getItem("user") != null && window.localStorage.getItem("password") != null){
      login(window.localStorage.getItem("user"),window.localStorage.getItem("password"));
    }
    else{
      $("#txtUser").focus();
      return false;
    }
  }

  function validarUsuario(user, password, dia, mes, agno, db){
    var query = "select count(*) as TOTAL, CODVEN, DSCMAX from ma_usuario where codusu = '" + user + "' and clave1 = '" + password + "'";
    db.executeSql(query, [], function(rs2) {
      if(rs2.rows.item(0).TOTAL > 0){
        window.localStorage.setItem("user", user);
        window.localStorage.setItem("password", password);
        window.localStorage.setItem("codven", rs2.rows.item(0).CODVEN);
        window.localStorage.setItem("descuento", rs2.rows.item(0).DSCMAX);
        window.localStorage.setItem("fecVenBase", dia + "/" + mes + "/" + agno);
        db.close();
        window.location.replace("main.html");
      }
      else{
        alert("logueado incorrecto");
        return false;
      }
    }, function(error) {
        alert("logueado incorrecto " + JSON.stringify(error));
        return false;
    });
  }

  function login(user, password){
    var baseOK = false;
    //compruebo validez de la base
    createCarpetaNvt();
    createCarpetaNvtEnviadas();
    var db = window.sqlitePlugin.openDatabase({name: "envios2.db"});
    var query = "select fecact, fecact - 1 as fecaviso from ma_update";
    db.executeSql(query, [], function (rs) {
          var fecha = rs.rows.item(0).fecact.toString();
          var fechaAviso = rs.rows.item(0).fecaviso.toString();
          var agno = parseInt(fecha.substr(0,4));
          var mes = parseInt(fecha.substr(4,2));
          var dia = parseInt(fecha.substr(6,2));
          var sysdate = new Date();
          var fechaVenc = new Date(agno,mes-1,dia);
          var agnoAviso = parseInt(fechaAviso.substr(0,4));
          var mesAviso = parseInt(fechaAviso.substr(4,2));
          var diaAviso = parseInt(fechaAviso.substr(6,2));
          var fechaAviso = new Date(agnoAviso,mesAviso-1,diaAviso);

          if( fechaVenc > sysdate || user == "FVERGARA"){ //si la base esta vigente, reviso si es necesario subir notas
            if(fechaAviso <= sysdate){ //si la fecha de aviso es menor o igual a hoy
              //primero determino si hay notas de venta por subir
              window.resolveLocalFileSystemURL( cordova.file.externalDataDirectory, function( directoryEntry ) {
                directoryEntry.getDirectory("nvt", {create: false, exclusive: false}, function(dir) {  //tomo el directorio root/nvt
                  // tomo un lector del directorio
                    var directoryReader = dir.createReader();

                  // listo todos los ficheros
                  directoryReader.readEntries(function(entries) {
                      if(entries.length>0){
                        alert("La base de datos vence mañana, se deben subir todas las notas de venta");
                        $("#btnVerNotas").trigger('click');
                      }
                      else{
                        validarUsuario(user, password, dia, mes, agno, db);
                      }
                    }
                    ,function fail(error) {
                      return false;
                  });
                },
                function(error) { 
                  return false;
                });
              });
            }
            else{
              validarUsuario(user, password, dia, mes, agno, db);
            }  
          }
          else{
            alert("Base vencida, ingrese una nueva");
            getBase();
            return false;
          }
          
        },
        function (error) {
            var strErr = JSON.stringify(error);
            //alert(strErr);
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
  }

  $("#btnLogin").click(function(e){
    window.localStorage.setItem("user", "");
    window.localStorage.setItem("password", "");
    window.localStorage.setItem("codven", "");

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
  window.resolveLocalFileSystemURL( cordova.file.externalDataDirectory, function( directoryEntry ) {
    directoryEntry.getDirectory("nvt", {create: true, exclusive: false}, function(dir) { 
      //alert("Created dir "+dir.name); 
    },
    function(error) {
      alert("Error creando directorio nvt "+JSON.stringify(error)); 
    });
  });
}

function createCarpetaNvtEnviadas(){
  //genero carpeta nvt
  window.resolveLocalFileSystemURL( cordova.file.externalDataDirectory, function( directoryEntry ) {
    directoryEntry.getDirectory("nvtEnviadas", {create: true, exclusive: false}, function(dir) { 
      //alert("Created dir "+dir.name); 
    },
    function(error) { 
      alert("Error creando directorio nvtenviadas "+error.code); 
    });
  });
}

function deleteDB() {
  var path = cordova.file.externalDataDirectory;
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

checkLogin();

}, false);