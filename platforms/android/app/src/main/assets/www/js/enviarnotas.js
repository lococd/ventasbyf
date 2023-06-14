document.addEventListener('deviceready', function(){

var qNotasAenviar = 0;

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

	async function enviarNotas(){
		var progressbar = $( "#porcentajeAvance" ),
      progressLabel = $( ".progress-label" );
 
    progressbar.progressbar({
      value: 0,
      open: function(){
      	progressLabel.text("Cargando...");
      	setTimeout( lala, 1000 );
      }
      change: function() {
        progressLabel.text( progressbar.progressbar( "value" ) + "%" );
      },
      complete: function() {
        progressLabel.text( "Notas subidas!" );
      }
    });

    function lala(){

    }
 
    var notasSeleccionadas = $(".chk-enviar");

    //vamos a tener que hacer un primer for para saber cuantas notas se seleccionaron
    for (var i = 0; i < notasSeleccionadas.length; i++) {
			var seleccionada = $(notasSeleccionadas[i]).prop("checked");
			if(seleccionada){
				qNotasAenviar++;
			}
		}
		
		var pathDestino = cordova.file.externalDataDirectory + "nvtEnviadas";
		for (var i = 0; i < notasSeleccionadas.length; i++) {
			var nombreArchivo = $(notasSeleccionadas[i]).data("filename");
			var urlNativa = $(notasSeleccionadas[i]).data("uri");
			var seleccionada = $(notasSeleccionadas[i]).prop("checked");
			if(seleccionada){
				await subirArchivo(nombreArchivo, urlNativa, pathDestino);
			}
		}
		$("#porcentajeAvance" ).progressbar({
      value: 100
    });
		alert("Notas subidas!");
		qNotasAenviar = 0;
		$("#porcentajeAvance" ).progressbar({
      value: 0
    });
		$("#modalEnviarNotas").modal("hide");
	}

	async function subirArchivo(nombreArchivo, urlNativa, pathDestino){
		cordova.plugin.ftp.connect("ftp.byf.cl","app@byf.cl","ventasbyf_",
          function(result){
            cordova.plugin.ftp.upload(cordova.file.externalDataDirectory + "/nvt/"+nombreArchivo,"/notasventa/por_procesar/"+nombreArchivo,function(percent){
                if(percent == 1){
                  //alert("uploaded!");
                  //una vez termina cada archivo
									//seteamos en la progressbar el porcentaje de notas enviadas
                  var progreso = $("#porcentajeAvance").val();
                  $("#porcentajeAvance").progressbar("value", progreso + ((1/qNotasAenviar)*100));
                  moveFile(nombreArchivo, pathDestino);
                  return true;
                }
              },function(error){
              alert(JSON.stringify(error));
              return false;
            });
          },function(error){
            alert(JSON.stringify(error));
            return false;
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
		qNotasAenviar = 0;
		$("#porcentajeAvance" ).progressbar({
      value: 0
    });
		cargarNotas();
	});

	$("#btnEnviarNotas").click(function(e){
		enviarNotas();
	});

});