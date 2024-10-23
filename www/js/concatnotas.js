async function getNotaActual(rutcli){
		return new Promise(function(resolve, reject) {
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
                                                            fileEntry.file(function(file) {
                                                                var reader = new FileReader();
                                                                reader.onloadend = function(e) {
                                                                    celdas = "";
                                                                    var parser = new DOMParser();
                                                                    var xmlDoc = parser.parseFromString(this.result,"text/xml");
                                                                    var rutcliArchivo = xmlDoc.getElementsByTagName("rutcli")[0].childNodes[0].nodeValue;
                                                                    if(rutcli == rutcliArchivo){
                                                                        resolve(nombreArchivo);
                                                                    }
                                                                }
                                                                reader.readAsText(file);
                                                            });
                                                        }
        
                                                        function fail(e) {
                                                            alert("FileSystem Error" + e.message);
                                                            resolve(false);
                                                        }
                                                    }
                                                    resolve(false);
                                                }
                  ,function fail(error) {
                    alert("Failed to list directory contents: " + error.code);
                    resolve(false);
                });
            },
            function(error) { 
                alert("Error "+error.code);
                resolve(false);
            });
          });
        });
		
}

function concatenaNota(nombreArchivo, xmlDet){
    try {
		//agarro el directorio root
		var celdas = "";
		window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory + "nvt/" + nombreArchivo,
		gotFile, fail);

		function gotFile(fileEntry) {
			fileEntry.file(function(file) {
				var reader = new FileReader();
				reader.onloadend = function(e) {
					celdas = "";
					var parser = new DOMParser();
					var xmlDoc = parser.parseFromString(this.result,"text/xml");
					var numnvt = xmlDoc.getElementsByTagName("numnvt")[0].childNodes[0].nodeValue;
					var detalle = xmlDoc.getElementsByTagName("Producto");
                    detalle.childNodes[0].appendChild(xmlDet);
                    fileEntry.createWriter(function(fileWriter){
                        fileWriter.onwriteend = function( result ) {
                            alert( 'Nota de venta editada con éxito!');

                        };
                        fileWriter.onerror = function( error ) {
                            alert( JSON.stringify(error) );
                        };
                        fileWriter.write( new XMLSerializer().serializeToString(xmlDoc) );
                    },function(err){

                    });
				}
				reader.readAsText(file);
			});
		}

		function fail(e) {
			alert("FileSystem Error" + e.message);
		}
	} catch (error) {
		alert(error);
	}
}