function deleteNvts(){
  //agarro el directorio root
  window.resolveLocalFileSystemURL( cordova.file.externalDataDirectory, function( directoryEntry ) {
      directoryEntry.getDirectory("nvt", {create: false, exclusive: false}, function(dir) {  //tomo el directorio root/nvt
        // tomo un lector del directorio
        var directoryReader = dir.createReader();
        // listo todos los ficheros
        directoryReader.readEntries(function(entries) {
          var i;
          var nombreArchivo = "";
          var celdas = "";
          for (i=0; i<entries.length; i++) {

            nombreArchivo = entries[i].name;
            window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory + "nvt/" + nombreArchivo,
              gotFile, fail);
            function gotFile(fileEntry) {
              fileEntry.remove(function(file) {
              }, function(error){
                alert("error deleting "+ error.message);
              });
            }
            function fail(e) {
              alert("FileSystem Error" + e.message);
            }
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

function getBase(fromMain){
  fromMain = fromMain || "";
  if(!confirm("Recuerde enviar todas las notas de venta antes de cargar nueva base, se borrarán las notas existentes. ¿Quiere continuar?")){
      return false;
    }
    else{
      $("#modalDescargarBD").modal("show");
      $( "#porcentajeAvanceBD" ).progressbar({
        value: false
      });
      $(".progress-label-bd").text("Descargando...");

      setTimeout(bajarBase,1000,fromMain);

      function bajarBase(fromMain){
        try {
           
           cordova.plugin.ftp.connect("ftp.byf.cl","app@byf.cl","ventasbyf_",
            function(result){
              cordova.plugin.ftp.download(cordova.file.externalDataDirectory + "/envios.db","/dbtest.db",function(percent){
                  if(percent == 1){
                    deleteNvts();
                    window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory + "/envios.db",
                    function(fileDB){
                        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
                                window.resolveLocalFileSystemURL(cordova.file.applicationStorageDirectory, function( directoryEntry ) {
                                  directoryEntry.getDirectory("databases", {create: true, exclusive: false}, function(dirDB) {
                                    fileDB.copyTo(dirDB, 'envios2.db',
                                    function(){
                                        fileDB.copyTo(dirDB, 'envios.db',
                                        function(){
                                            window.localStorage.setItem("numnvt", 1);
                                            
                                            if(fromMain == "main"){
                                              alert("¡Base de datos cargada correctamente! Se reiniciará la aplicación");
                                              $("#modalDescargarBD").modal("hide");
                                              window.location.replace("index.html");
                                            }else{
                                              alert("¡Base de datos cargada correctamente!");
                                              $("#modalDescargarBD").modal("hide");
                                              checkLogin();
                                            }
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
                  }
                  else{
                    //codigo progreso barra progreso
                    $( "#porcentajeAvanceBD" ).progressbar({
                      value: Math.round(percent * 100)
                    });
                    $(".progress-label-bd").text(Math.round(percent * 100) + "%");
                  }
                },function(error){
                alert(JSON.stringify(error));
              });
            },function(error){
              alert(JSON.stringify(error));
            });
        } catch(e) {
           alert(e.name + " , "+ e.message + " , "+ e.stack);
        }
      }

    }   
}