document.addEventListener('deviceready', function(){

	function visualizarNota(nombreArchivo){
        alert(nombreArchivo);
		$("#detalleTblNotas").empty();
		//agarro el directorio root
	  	window.resolveLocalFileSystemURL( cordova.file.externalDataDirectory, function( directoryEntry ) {
	    directoryEntry.getDirectory("nvt", {create: false, exclusive: false}, function(dir) {  //tomo el directorio root/nvt
	      // tomo un lector del directorio
      		var directoryReader = dir.createReader();
	    	// listo todos los ficheros
	    	directoryReader.readEntries(function(entries) {
	                                    	var i;
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
                                                            var codpro,descripcion = "";
                                                            var precio,cantid, total = 0;
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
});