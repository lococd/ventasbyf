function visualizarNotaEnviada(nombreArchivo){
	//este es el que sirve, nunca pude separar en visualizarnotas.js :c
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
					var atributosProducto = xmlDoc.getElementsByTagName("DeProducto");
					var codpro = "";
					var descripcion = "";
					var precio = 0;
					var cantid = 0;
					var total = 0;
					for (let i = 0; i < detalle.length; i++) {
						const producto = detalle[i];
						
						codpro = producto.getElementsByTagName("codpro")[0].childNodes[0].nodeValue;

						strAtributos = "";
						//buscamos codigo producto en el xml de atributos
						for (let j = 0; j < atributosProducto.length; j++) {
							const atributo = atributosProducto[j];
							if (atributo.getElementsByTagName("Dcodpro")[0].childNodes[0].nodeValue == codpro) {
								var descripcionAtributo = atributo.getElementsByTagName("Ddespro")[0].childNodes[0].nodeValue;
								var cantidadAtributo = atributo.getElementsByTagName("Dcantid")[0].childNodes[0].nodeValue;
								//concatenamos los atributos y agregamos a la tabla principal
								strAtributos = strAtributos + "<tr>" +
								"<td></td>" +
								"<td>" + descripcionAtributo.toString() + "</td>" +
								"<td></td>" +
								"<td>" + cantidadAtributo.toString() + "</td>" +
								"<td></td>" +
								"</tr>";
							}
						}
						
						descripcion = producto.getElementsByTagName("despro")[0].childNodes[0].nodeValue;
						precio = producto.getElementsByTagName("prefin")[0].childNodes[0].nodeValue;
                        cantid = producto.getElementsByTagName("cantid")[0].childNodes[0].nodeValue;
                        total = producto.getElementsByTagName("totnet")[0].childNodes[0].nodeValue;
						celdas = celdas + "<tr>" +
						"<td>" + codpro + "</td>" +
						"<td>" + descripcion + "</td>" +
						"<td>" + precio.toString() + "</td>" + 
						"<td>" + cantid.toString() + "</td>" +
						"<td>" + total.toString() + "</td>" +
						"</tr>" +
						strAtributos;
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
	function cargarNotasEnviadas(){
		$("#detalleTblNotasEnviadas").empty();
		//agarro el directorio root
	  	window.resolveLocalFileSystemURL( cordova.file.externalDataDirectory, function( directoryEntry ) {
	    directoryEntry.getDirectory("nvtEnviadas", {create: false, exclusive: false}, function(dir) {  //tomo el directorio root/nvt
	      // tomo un lector del directorio
      		var directoryReader = dir.createReader();

	    	// listo todos los ficheros
	    	directoryReader.readEntries(function(entries) {
	                                    	var i;
	                                    	var nombreArchivo = "";
	                                    	var celdas = "";
	                                    	for (i=0; i<entries.length; i++) {
	                                    		nombreArchivo = entries[i].name;
	                                    		window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory + "nvtEnviadas/" + nombreArchivo,
	                                    		gotFile, fail);
	                                    		function gotFile(fileEntry) {
													fileEntry.file(function(file) {
														var reader = new FileReader();
														reader.onloadend = function(e) {
															celdas = "";
															var parser = new DOMParser();
															var xmlDoc = parser.parseFromString(this.result,"text/xml");
															var totneto = xmlDoc.getElementsByTagName("totgen")[0].childNodes[0].nodeValue;
															var razons = xmlDoc.getElementsByTagName("razons")[0].childNodes[0].nodeValue;
															var fecemiRaw = xmlDoc.getElementsByTagName("fecemi")[0].childNodes[0].nodeValue;
															var fecemi = "";
															if (fecemiRaw && fecemiRaw.length === 8) {
																// yyyymmdd -> dd/mm/yy
																var year = fecemiRaw.substring(2, 4); // get last two digits
																var month = fecemiRaw.substring(4, 6);
																var day = fecemiRaw.substring(6, 8);
																fecemi = day + "/" + month + "/" + year;
															}
															else {
																fecemi = fecemiRaw;
															}
															celdas = celdas + "<tr>" +
															"<td>" + fecemi + "</td>" +
															'<td class="text-right">$' + totneto + "</td>" +
				                                    		'<td></td>' +
															'<td><a href="#" class="btn btn-primary" onclick="visualizarNota(\''+ file.name +'\',\'nvtEnviadas\')">Ver</a></td>' +
															'</tr>'+
															'<tr><td colspan="4"><b>' + razons + '</b></td></tr>';
				                                    		$("#detalleTblNotasEnviadas").append(celdas);
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

	$(".btnVerNotasEnviadas").click(function(e){
		$("#modalVerNotasEnviadas").modal('toggle');
		cargarNotasEnviadas();
	});

	$("#btnCerrarVerNotasEnviadas").click(function(e){
	    $("#modalVerNotasEnviadas").modal("hide");
	});
});