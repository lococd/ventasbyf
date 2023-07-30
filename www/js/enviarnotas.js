document.addEventListener('deviceready', function(){

	function cargarNotas(){
		$("#detalleTblNotas").empty();
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
															var totneto = xmlDoc.getElementsByTagName("toneto")[0].childNodes[0].nodeValue;
															var razons = xmlDoc.getElementsByTagName("razons")[0].childNodes[0].nodeValue;
															var fecemi = xmlDoc.getElementsByTagName("fecemi")[0].childNodes[0].nodeValue;
															celdas = celdas + "<tr><td>" + razons + "</td>" +
															"<td>" + fecemi + "</td>" +
															"<td>$" + totneto + "</td>" +
				                                    		'<td><input class="chk-enviar" type="checkbox" data-filename="'+file.name+'"></td></tr>';
				                                    		$("#detalleTblNotas").append(celdas);
														}
														reader.readAsText(file);
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

	function enviarNotas(){
    var notasSeleccionadas = $(".chk-enviar");
    var qNotasAenviar = 0;
    //vamos a tener que hacer un primer for para saber cuantas notas se seleccionaron
    for (var i = 0; i < notasSeleccionadas.length; i++) {
			var seleccionada = $(notasSeleccionadas[i]).prop("checked");
			if(seleccionada){
				qNotasAenviar++;
			}
		}
		
		//alert("notaselegidas" + qNotasAenviar);
		var pathDestino = cordova.file.externalDataDirectory + "nvtEnviadas";
		for (var i = 0; i < notasSeleccionadas.length; i++) {
			var nombreArchivo = $(notasSeleccionadas[i]).data("filename");
			var urlNativa = $(notasSeleccionadas[i]).data("uri");
			var seleccionada = $(notasSeleccionadas[i]).prop("checked");
			if(seleccionada){
				subirArchivo(nombreArchivo, urlNativa, pathDestino).then(function(subida){
					if(subida == false){
						alert("Problema al subir archivo, favor compruebe su conexión y reintente");
						$("#btnCerrarEnviarNotas").click();
						return false;
					}
				});
				//alert(JSON.stringify(subida));
        //alert("uploaded!" + (((1/qNotasAenviar)*100)));
			}
		}
		var progressbar = $( "#porcentajeAvance" ),
      progressLabel = $( ".progress-label" );
 
    progressbar.progressbar({
      value: false,
      change: function() {
        progressLabel.text( progressbar.progressbar( "value" ) + "%" );
      },
      complete: function() {
      	alert("Notas subidas!");
        progressLabel.text("Notas subidas!");
        $("#btnCerrarEnviarNotas").click();
      }
    });
 
    function progress() {
      var val = progressbar.progressbar( "value" ) || 0;
 			if(val < 100){
 				progressbar.progressbar( "value", val + 2 );
 
	      if ( val < 99 ) {
	        setTimeout( progress, (20 * qNotasAenviar) );
	      }
 			}
 			else{
 				return false;
 			}
      
    }
    //funcion para completar progreso
    progress();
	}

	async function subirArchivo(nombreArchivo, urlNativa, pathDestino){
		return new Promise(function(resolve, reject) {
			cordova.plugin.ftp.connect("ftp.byf.cl","app@byf.cl","ventasbyf_",
		    function(result){
		      cordova.plugin.ftp.upload(cordova.file.externalDataDirectory + "/nvt/"+nombreArchivo,"/notasventa/por_procesar/"+nombreArchivo,function(percent){
		          if(percent == 1){
		            //alert("uploaded!");
		            
		            moveFile(nombreArchivo, pathDestino);
		            resolve(true);
		          }
		        },function(error){
		        //alert(JSON.stringify(error));
		        resolve(false);
		      });
		    },function(error){
		      //alert(JSON.stringify(error));
		      resolve(false);
		  	});
		});
	}

	function moveFile(nombreArchivo, pathDestino) {
	window.resolveLocalFileSystemURL(
	      cordova.file.externalDataDirectory + "nvt/"+nombreArchivo,
	      function(fileEntry){
	            window.resolveLocalFileSystemURL(pathDestino,
	                    function(dirEntry) {
	                        // move the file to a new directory and rename it
	                        fileEntry.moveTo(dirEntry, nombreArchivo, null, function(error){
						    	alert("nomovio " + error.code);
						    });
	                    },
	                    function(error){
				        	alert("noaccedio a path destino " + error.code);
				        });
	      },
	      function(error){
	      	alert("error " + error.code);
	      });
	}

	$("#btnVerNotas").click(function(e){
		$("#modalEnviarNotas").modal('toggle');
		cargarNotas();
	});

	$("#btnEnviarNotas").click(function(e){
		$( "#porcentajeAvance" ).progressbar({
      value: false
    });
    $(".progress-label").text("Cargando...");
    setTimeout(enviarNotas,1000);
	});

	$("#btnCerrarEnviarNotas").click(function(e){
		var esBarraPorcentaje = ($("#porcentajeAvance").progressbar("instance") !== undefined);
		if(esBarraPorcentaje){
			$("#porcentajeAvance" ).progressbar("destroy");
		}
    $( ".progress-label" ).text("");
		$("#modalEnviarNotas").modal("hide");
	})

});