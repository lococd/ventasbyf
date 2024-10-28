async function getNotaActual(rutcli){
    //para resolver este problema y como tenemos callbacks en la función que permite acceder a los contenidos de archivos
    //y a la vez esa función es asíncrona, se debe generar un array de promesas,
    //se espera a la resolución de todas esas promesas, y luego se resolverá a una única promesa
		return new Promise(function(resolve, reject) {
            //agarro el directorio root
	  	    window.resolveLocalFileSystemURL( cordova.file.externalDataDirectory, function( directoryEntry ) {
                directoryEntry.getDirectory("nvt", {create: false, exclusive: false}, function(dir) {  //tomo el directorio root/nvt
                // tomo un lector del directorio
                    var directoryReader = dir.createReader();
                // listo todos los ficheros
                    directoryReader.readEntries(function(entries) {
                                                    var celdas = "";
                                                    //primero con promise.all se obtienen un array de resultados de promesas
                                                    Promise.all(entries.map(function(archivo){ //y con entries.map se generan operaciones sobre el array de archivos del directorio sin for
                                                        return new Promise(function(resolve,reject){
                                                            //para cada archivo genero una promesa que será resuelta
                                                            window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory + "nvt/" + archivo.name,
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
                                                                            resolve(archivo.name);
                                                                        }
                                                                        else{
                                                                            resolve(false);
                                                                        }
                                                                    }
                                                                    reader.readAsText(file);
                                                                });
                                                            }
                                                            function fail(e) {
                                                                alert("FileSystem Error" + e.message);
                                                                resolve(false);
                                                            }
                                                        });
                                                    })).then(function(promesas){
                                                        //ya con las promesas, invocamos la función then para resolver la promesa original
                                                        for (let i = 0; i < promesas.length; i++) {
                                                            const promesa = promesas[i];
                                                            if(promesa){
                                                                resolve(promesa);
                                                            }
                                                        }
                                                        resolve(false);
                                                    });
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
                    alert(xmlDet);
					var xmlDoc = new DOMParser().parseFromString(this.result,"text/xml");
                    var xmlDetalle = new DOMParser().parseFromString(xmlDet, 'text/xml');
                    let sources = xmlDetalle.evaluate("//Producto", xmlDetalle, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                    let destination = xmlDoc.querySelector("Detalle");
                    for(var i = 0; i < sources.snapshotLength; i++) {
                        let node = sources.snapshotItem(i);
                        let n_node = node.cloneNode(true);
                        destination.append(n_node);
                    }
                    var strEditado = new XMLSerializer().serializeToString(xmlDoc);
                    fileEntry.createWriter(function(fileWriter){
                        fileWriter.onwriteend = function( result ) {
                            alert( 'Nota de venta editada con éxito!');

                        };
                        fileWriter.onerror = function( error ) {
                            alert( JSON.stringify(error) );
                        };
                        fileWriter.write( strEditado );
                    },function(err){
                        alert( JSON.stringify(err) );
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