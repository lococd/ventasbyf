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
											// sort entries by date ascending (try metadata first, fall back to parsing filename)
											// sort entries by date ascending (try metadata first, fall back to parsing filename)
											function getTime(entry) {
												if (!entry || !entry.name) return 0;
												var m = entry.name.match(/\d{8}/);
												if (m) {
													var s = m[0];
													var y = parseInt(s.substring(0, 4), 10);
													var mo = parseInt(s.substring(4, 6), 10) - 1;
													var d = parseInt(s.substring(6, 8), 10);
													return new Date(y, mo, d).getTime();
												}
												return 0;
											}

											function compareEntries(a, b) {
												var ta = getTime(a);
												var tb = getTime(b);
												if (ta !== tb) return ta - tb;
												var na = (a.name || "").toLowerCase();
												var nb = (b.name || "").toLowerCase();
												if (na < nb) return -1;
												if (na > nb) return 1;
												return 0;
											}

											// insertion sort (stable) — avoids using Array.prototype.sort
											for (var i = 1; i < entries.length; i++) {
												var key = entries[i];
												var j = i - 1;
												while (j >= 0 && compareEntries(entries[j], key) > 0) {
													entries[j + 1] = entries[j];
													j--;
												}
												entries[j + 1] = key;
											}
											var i;
	                                    	var nombreArchivo = "";
	                                    	var celdas = "";
	                                    	for (i=0; i<entries.length; i++) {
	                                    		nombreArchivo = entries[i].name;
												// process entries sequentially starting from current index
												(function processFrom(idx){
													if (idx >= entries.length) return;
													var name = entries[idx].name;
													window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory + "nvtEnviadas/" + name,
														function(fileEntry){
															fileEntry.file(function(file){
																var reader = new FileReader();
																reader.onloadend = function(e){
																	var celdas = "";
																	var parser = new DOMParser();
																	var xmlDoc = parser.parseFromString(this.result,"text/xml");
																	var totneto = xmlDoc.getElementsByTagName("totgen")[0].childNodes[0].nodeValue;
																	var razons = xmlDoc.getElementsByTagName("razons")[0].childNodes[0].nodeValue;
																	var fecemiRaw = xmlDoc.getElementsByTagName("fecemi")[0].childNodes[0].nodeValue;
																	var fecemi = "";
																	if (fecemiRaw && fecemiRaw.length === 8) {
																		var year = fecemiRaw.substring(2, 4);
																		var month = fecemiRaw.substring(4, 6);
																		var day = fecemiRaw.substring(6, 8);
																		fecemi = day + "/" + month + "/" + year;
																	} else {
																		fecemi = fecemiRaw;
																	}
																	celdas = celdas + "<tr>" +
																		"<td>" + fecemi + "</td>" +
																		'<td class="text-right">$' + totneto + "</td>" +
																		'<td></td>' +
																		'<td><a href="#" class="btn btn-primary" onclick="visualizarNota(\''+ file.name +'\',\'nvtEnviadas\')">Ver</a></td>' +
																		'</tr>' +
																		'<tr><td colspan="4"><b>' + razons + '</b></td></tr>';
																	$("#detalleTblNotasEnviadas").append(celdas);
																	// proceed to next entry after this one finished processing
																	processFrom(idx + 1);
																};
																reader.readAsText(file);
															}, function(err){
																// on file read error, continue to next
																alert("File read error: " + (err && err.code));
																processFrom(idx + 1);
															});
														},
														function(err){
															alert("File system error: " + (err && err.code));
															processFrom(idx + 1);
														}
													);
												})(i);
												// stop the outer for-loop from continuing; processing continues in the recursive function
												i = entries.length;
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