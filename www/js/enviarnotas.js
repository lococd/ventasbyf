function visualizarNota(nombreArchivo){
	$("#detalleTblNota").empty();
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
					var codpro = "";
					var descripcion = "";
					var precio = 0;
					var cantid = 0;
					var total = 0;
					for (let i = 0; i < detalle.length; i++) {
						const producto = detalle[i];
						
						codpro = producto.getElementsByTagName("codpro")[0].childNodes[0].nodeValue;
						descripcion = producto.getElementsByTagName("despro")[0].childNodes[0].nodeValue;
						precio = producto.getElementsByTagName("prefin")[0].childNodes[0].nodeValue;
						cantid = producto.getElementsByTagName("cantid")[0].childNodes[0].nodeValue;
						total = producto.getElementsByTagName("totnet")[0].childNodes[0].nodeValue;;
						celdas = celdas + "<tr>" +
						"<td>" + codpro + "</td>" +
						"<td>" + descripcion + "</td>" +
						"<td>" + precio.toString() + "</td>" + 
						"<td>" + cantid.toString() + "</td>" +
						"<td>" + total.toString() + "</td>" +
						"</tr>";
					}
					$("#detalleTblNota").append(celdas);
					$("#numeroNota").text(numnvt);
					$("#modalVerNota").modal("show");
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
				                                    		'<td><input class="chk-enviar" type="checkbox" data-filename="'+file.name+'" data-contenido="'+
				                                    		this.result.replaceAll("\"","'")+'"></td>' +
															'<td><a href="#" class="btn btn-primary" onclick="visualizarNota(\''+ file.name +'\')">Ver</a></td>' +
															'</tr>';
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

	function seleccionarTodas(){
		var notasSeleccionadas = $(".chk-enviar");
		for (var i = 0; i < notasSeleccionadas.length; i++) {
			$(notasSeleccionadas[i]).prop("checked", true);
		}
	}

	function deseleccionarTodas(){
		var notasSeleccionadas = $(".chk-enviar");
		for (var i = 0; i < notasSeleccionadas.length; i++) {
			$(notasSeleccionadas[i]).prop("checked", false);
		}
	}

	function toggleAll(){
		var togglear = $("#toggleMarcarNotas").prop("checked");
		if(togglear){
			seleccionarTodas();
		}
		else{
			deseleccionarTodas();
		}
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
		//si no hay notas a enviar, entonces se termina la función
		if(qNotasAenviar == 0){
			alert("Seleccione al menos una nota para enviar");
			return false;
		}
		//alert("notaselegidas" + qNotasAenviar);
		var pathDestino = cordova.file.externalDataDirectory + "nvtEnviadas";
		for (var i = 0; i < notasSeleccionadas.length; i++) {
			var nombreArchivo = $(notasSeleccionadas[i]).data("filename");
			var contenidoXML = $(notasSeleccionadas[i]).data("contenido").replace("<?xml version='1.0' encoding='utf-8'?>", "<?xml version=\"1.0\" encoding=\"utf-8\"?>");
			var seleccionada = $(notasSeleccionadas[i]).prop("checked");
			if(seleccionada){
        subirArchivo(nombreArchivo, contenidoXML, pathDestino).then(function(subida){
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

	async function subirArchivo(nombreArchivo, contenido, pathDestino){
		return new Promise(function(resolve, reject) {
			var form = new FormData();
			form.append("nombre", nombreArchivo);
			form.append("contenido", contenido);
			form.append("password", "ventasbyf_");

			var settings = {
			  "url": "https://traspasoxml.byf.cl/",
			  "method": "POST",
			  "timeout": 0,
			  "processData": false,
			  "mimeType": "multipart/form-data",
			  "contentType": false,
			  "data": form,
			  "async": true
			};

			$.ajax(settings).done(function (response) {
				//se mueve archivo
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
	      	alert("error al mover "+ pathDestino + " " + error.code);
	      });
	      //resolvemos archivo
			  resolve(true);
			})
			.fail(function (jqXHR, textStatus) {
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
	      	alert("error al mover "+ pathDestino + " " + error.code);
	      });
	}

	

	$(".btnVerNotas").click(function(e){
		$("#modalEnviarNotas").modal('toggle');
		cargarNotas();
	});

	$("#btnEnviarNotas").click(function(e){
		var notasSeleccionadas = $(".chk-enviar");
    var qNotasAenviar = 0;
    //vamos a tener que hacer un primer for para saber cuantas notas se seleccionaron
    for (var i = 0; i < notasSeleccionadas.length; i++) {
			var seleccionada = $(notasSeleccionadas[i]).prop("checked");
			if(seleccionada){
				qNotasAenviar++;
			}
		}
		//si no hay notas a enviar, entonces se termina la función
		if(qNotasAenviar == 0){
			alert("Seleccione al menos una nota para enviar");
			return false;
		}
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
	});

	$("#toggleMarcarNotas").click(function(e){
		toggleAll();
	});
});