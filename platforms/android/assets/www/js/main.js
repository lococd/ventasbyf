document.addEventListener('deviceready', function(){
	var limpiando = true;
	//funciones auxiliares
	function cargarModalGuardar(){
		//createDb();
		$('#modalGuardar').modal('toggle');
		//$("#lblTituloGuardar").text('Datos Nota de Venta');
		//totalizaNota();
	};

	function totalizaNota(){
		var productos = $("#tblProd >tbody >tr");
		var neto = 0;
		productos.each(function(tr,fila) {
				precio = $(fila).find('td:eq(2)').text();
				cantid = $(fila).find('td:eq(3) >input').val();
				totnet = precio * cantid;
				neto = neto + totnet;
			});
		return neto;
	};

	function getAgno(){
		var d = new Date();
		return d.getFullYear();
	}

	function getMes(){
		var d = new Date();
		var numMes = d.getMonth()+1;
		if (numMes < 10){
			return "0" + numMes;
		}
		else{
			return numMes;
		}
	}

	function getDia(){
		var d = new Date();
		var numDia = d.getDate();
		if (numDia < 10){
			return "0" + numDia;
		}
		else{
			return numDia;
		}
	}

	function getTotAtrib(){
		var cantid = $("#txtCantid").val();
		var clases = $("#tabAttrib").attr('class');
		if(clases.indexOf("invisible") < 0){
			var productos = $("#tblAttrib >tr");
			var cantidAtrib = 0;
			$(productos).each(function(i,fila){
				cantUni = $(fila).find('td:eq(1) input').val();
				if (cantUni === ""){
					cantUni = 0;
				}
				else{
					cantUni = parseInt(cantUni);
				}
				cantidAtrib = cantidAtrib + cantUni;
			});
			return cantidAtrib;
		}
		else{
			return cantid;
		}
	}

	function getAtributos(){
		var atributos = '';
		var productos = $("#tblAttrib >tr");
		var j = 1;
		$(productos).each(function(i,fila){
				cantUni = $(fila).find('td:eq(1) input').val();
				if (cantUni === ""){
					cantUni = 0;
				}
				else{
					cantUni = parseInt(cantUni);
				}
				if (cantUni>0){
					atributos = atributos +
						'<DeProducto>'+ String.fromCharCode(13) +
                 		'<Dnumnvt>${numnvt}</Dnumnvt>' + String.fromCharCode(13) +
                 		'<Dsequen>'+ j + '</Dsequen>' + String.fromCharCode(13) +
                 		'<Dcodpro>'+ $("#modalTxtCodpro").text() + '</Dcodpro>' + String.fromCharCode(13) +
                 		'<Ddespro>'+ $(fila).find('td:eq(0)').text() + '</Ddespro>' + String.fromCharCode(13) +
                 		'<Dcantid>'+ cantUni + '</Dcantid>' + String.fromCharCode(13) +
                 		'<Dcoddom>'+ $(fila).find('td:eq(1) input').attr("data-catpro") +'</Dcoddom>' + String.fromCharCode(13) +
             			'</DeProducto>' + String.fromCharCode(13);
             			j = j + 1;
				}
			});
		//atributos = atributos + '</DeProducto>'
		return atributos;
	}

	function duplicado(codpro){
		var productos = $("#tblProd >tbody >tr");
		var codproLista;
		var yaEsta = false;
		$(productos).each(function(i,fila){
			codproLista = $(fila).find('td:eq(0)').text();
			if(parseInt(codpro) == parseInt(codproLista)){
				yaEsta = true;
			}
		});
		return yaEsta;
	};

	function getNumnvt(){
		var numnvt = 1;
		if (window.localStorage.getItem("numnvt") != null){
			numnvt = parseInt(window.localStorage.getItem("numnvt"));
		}
		else{
			window.localStorage.setItem("numnvt",1);
		}

		$("#lblTituloLpr").text(numnvt);
	};

	function grabaXML(rutcli,numnvt,vendedor,observ,xmlDet){
		var subtot = totalizaNota();
		var totneto;
		var totiva;
		var totgen;
		var xmlCab = "";
		var query = "select a.rutusu as CODVEN, b.razons, b.direccion as DIRECC,"+
					"b.comuna, b.ciudad,c.desval as FORPAG,d.desval as PLAPAG,b.codlis, 0 as DESCTO01, 0 as DESCTO02, b.facturable "+
					"from ma_usuario as a, en_cliente as b, de_dominio as c,de_dominio as d " +
					"where b.forpag = c.codval " +
					"and c.coddom = 5 " +
					"and b.plapag = d.codval " +
					"and d.coddom = 6 " +
	   				"and a.codusu = '" + vendedor + "' " +
	   				"and b.rutcli = " + rutcli;
	   	window.sqlitePlugin.importPrepopulatedDatabase({file: "envios.db", "importIfExists": false});
      	var db = window.sqlitePlugin.openDatabase({name: "envios.db"});
		db.transaction(function(tx){
			tx.executeSql(query, [], function(tx,rs) {
			    if(rs.rows.length == 0){
			    	alert("Cliente no configurado");
			    }
			    else{
			    	totneto = subtot - (subtot * parseInt(rs.rows.item(0).DESCTO01)) - (subtot * parseInt(rs.rows.item(0).DESCTO02));
			    	totiva = Math.round(totneto * 0.19);
			    	totgen = Math.round(totneto + totiva);
			    	var fecemi = getAgno().toString() + getMes().toString() + getDia().toString();
			    	xmlCab = "<numnvt>" + numnvt +"</numnvt>" + String.fromCharCode(13) +
			    			 "<codven>" + rs.rows.item(0).CODVEN +"</codven>" + String.fromCharCode(13) +
			    			 "<fecemi>" + fecemi +"</fecemi>" + String.fromCharCode(13) +
			    			 "<vendedor>" + vendedor +"</vendedor>" + String.fromCharCode(13) +
			    			 "<rutcli>" + rutcli +"</rutcli>" + String.fromCharCode(13) +
			    			 "<razons>" + rs.rows.item(0).RAZONS + "</razons>" + String.fromCharCode(13) +
			    			 "<direcc>" + rs.rows.item(0).DIRECC + "</direcc>" + String.fromCharCode(13) +
			    			 "<comuna>" + rs.rows.item(0).COMUNA + "</comuna>" + String.fromCharCode(13) +
			    			 "<ciudad>" + rs.rows.item(0).CIUDAD + "</ciudad>" + String.fromCharCode(13) +
			    			 "<forpag>" + rs.rows.item(0).FORPAG + "</forpag>" + String.fromCharCode(13) +
			    			 "<plapag>" + rs.rows.item(0).PLAPAG + "</plapag>" + String.fromCharCode(13) +
			    			 "<codlis>" + rs.rows.item(0).CODLIS + "</codlis>" + String.fromCharCode(13) +
			    			 "<subtot>" + subtot +"</subtot>" + String.fromCharCode(13) +
			    			 "<dscto1>" + rs.rows.item(0).DESCTO01 + "</dscto1>" + String.fromCharCode(13) +
			    			 "<dscto2>" + rs.rows.item(0).DESCTO02 + "</dscto2>" + String.fromCharCode(13) +
			    			 "<toneto>" + totneto +"</toneto>" + String.fromCharCode(13) +
			    			 "<totiva>" + totiva +"</totiva>" + String.fromCharCode(13) +
			    			 "<totgen>" + totgen +"</totgen>" + String.fromCharCode(13) +
			    			 "<totsal>" + totgen +"</totsal>" + String.fromCharCode(13) +
			      			 "<numbul>0</numbul>" + String.fromCharCode(13)+
				             "<codban>30</codban>" + String.fromCharCode(13) +
				             "<origen>REM</origen>" + String.fromCharCode(13) +
				             "<estado>0</estado>" + String.fromCharCode(13) +
				             "<pagada>0</pagada>" + String.fromCharCode(13)+
				             "<factura>N</factura>" + String.fromCharCode(13)+
				             "<observ>"+ observ + "</observ>" + String.fromCharCode(13)+
				             "<facturable>" + rs.rows.item(0).FACTURABLE + "</facturable>" + String.fromCharCode(13);

				            var xmlText = '<?xml version="1.0" encoding="utf-8"?>' + String.fromCharCode(13) +
							  "<Pedidos>" + String.fromCharCode(13) +
							  	"<NotaVenta>" + String.fromCharCode(13) +
							  		"<Cabecera>" + String.fromCharCode(13) +
							  			xmlCab +
							  		"</Cabecera>" + String.fromCharCode(13) +
							  		"<Detalle>" + String.fromCharCode(13)+
							  			xmlDet+
							  		"</Detalle>" + String.fromCharCode(13) +
							  	"</NotaVenta>" + String.fromCharCode(13) +
							  "</Pedidos>";

							window.resolveLocalFileSystemURL( cordova.file.externalRootDirectory+"/nvt", function( directoryEntry ) {
								var sysdate = new Date();
								var mes = sysdate.getMonth() + 1;
								var fechasalida = (sysdate.getYear() + 1900).toString() + getMes() + getDia() + sysdate.getHours().toString() + sysdate.getMinutes().toString() + sysdate.getSeconds().toString();
							    directoryEntry.getFile(fechasalida + window.localStorage.getItem("user") + numnvt + ".xml", { create: true }, function( fileEntry ) {
							        fileEntry.createWriter( function( fileWriter ) {
							            fileWriter.onwriteend = function( result ) {
							            	alert( 'Nota de venta grabada con éxito! Numero '+ numnvt );

							            };
							            fileWriter.onerror = function( error ) {
							                alert( error );
							            };
							            fileWriter.write( xmlText );
							        }, function( error ) { alert( error ); } );
							    }, function( error ) { alert( error ); } );
							}, function( error ) { alert( error ); } );



				}
			}
			,function(error) {
				alert('Error en la consulta: ' + error.message);
			});
        },
	   	function(err){
		alert(err);
	   	},
	   	function(){
			window.localStorage.setItem("numnvt",numnvt + 1);
			limpiar();
        });	
	}

	function getDetalle(productos){
			var query;
			var sequen = 1;
			var numnvt = $("#lblTituloLpr").text();
			var codpro;
			var precio;
			var cantid;
			var costo;
			var totnet;
			var descrip;
			var facturable;
			var xmlDet = "";
			var xmlProdDet = "";
			var atributos = "";
			productos.each(function(tr,fila) {
				codpro = $(fila).find('td:eq(0)').text();
				descrip = $(fila).find('td:eq(1)').text();
				precio = $(fila).find('td:eq(2)').text();
				cantid = $(fila).find('td:eq(3) >input').val();
				costo = $(fila).find('td:eq(0)').attr("data-costo");
				facturable = $(fila).find('td:eq(0)').attr("data-facturable");
				totnet = precio * cantid;
				//query = "INSERT INTO DE_NOTAVTA (CODEMP,NUMNVT,SEQUEN,CODPRO,PRECIO,CANTID,PREFIN,TOTNET,PORDOC,COMIS,PREPARACION,PESO) " +
				//		"VALUES('1','"+numnvt+"','"+sequen+"','"+codpro+"','"+precio+"','"+cantid+"','"+precio+"','"+totnet+"','"+cantid+"','7.5','0','0')";
						//alert(query);
				
				xmlDet = xmlDet + "<Producto>" + String.fromCharCode(13) +
									"<codemp>1</codemp>" + String.fromCharCode(13)+
									"<numnvt>" + numnvt + "</numnvt>" + String.fromCharCode(13)+
									"<sequen>" + sequen + "</sequen>" + String.fromCharCode(13) +
									"<codpro>" + codpro + "</codpro>" + String.fromCharCode(13) +
									"<despro>" + descrip + "</despro>" + String.fromCharCode(13) +
									"<unidad>UND</unidad>" + String.fromCharCode(13) +
									"<precio>" + precio + "</precio>" + String.fromCharCode(13) +
									"<cantid>" + cantid + "</cantid>" + String.fromCharCode(13) +
									"<desc01>0</desc01>" + String.fromCharCode(13) +
									"<prefin>" + precio + "</prefin>" + String.fromCharCode(13) +
									"<totnet>" + totnet + "</totnet>" + String.fromCharCode(13) +
									"<qrevis>0</qrevis>" + String.fromCharCode(13) +
									"<pordoc>" + cantid + "</pordoc>" + String.fromCharCode(13) +
									"<margen>" + Math.round((((precio-costo)/precio)*100) * 100) / 100 + "</margen>" + String.fromCharCode(13) +
									"<revision>0</revision>" + String.fromCharCode(13) +
									"<codubi>4</codubi>" + String.fromCharCode(13) +
									"<costo>" + costo + "</costo>" + String.fromCharCode(13) +
									"<comis>7.5</comis>" + String.fromCharCode(13) +
									"<facturable>" + facturable + "</facturable>" + String.fromCharCode(13) +
									"</Producto>" + String.fromCharCode(13);
				atributos = $(fila).find('td:eq(0)').attr("data-attrib");
				if (typeof atributos != 'undefined'){
					atributos = atributos.replace(/\$\{numnvt\}/g,numnvt);
					atributos = atributos.replace(/\$\{sequen\}/g,sequen);
					atributos = String.fromCharCode(13) + atributos;
					xmlProdDet = xmlProdDet + atributos;
				}
				sequen = sequen + 1;
			});
			xmlDet = xmlDet.substring(0, xmlDet.length-1);
			xmlDet = xmlDet + xmlProdDet;
			return xmlDet;
	}
	function getPrecio(codpro, cantid){
	   if(cantid == ""){
	   	cantid = 1;
	   }
	   var query = "select a.codpro, a.despro, a.costo, b.predet, b.multip, a.catpro, b.canmay,b.premay, a.factur " +
	   		 		"from ma_product as a, re_lvenpro as b " +
	   				"where a.codpro = b.codpro " +
	   				"and a.codpro = '" + codpro + "'";
      	var db = window.sqlitePlugin.openDatabase({name: "envios.db"});


	   	db.executeSql(query, [], function(rs) {
	    if(rs.rows.length == 0){ //busco precio
	    	alert('Código '+ codpro +' no tiene precio configurado');
	    	$("#modalTxtCodpro").text('');
	    	$("#modalTxtDespro").text('');
	    	$("#modalTxtProdFacturable").val('');
	    	$("#modalTxtPrecio").text('');
	    	$("#modalTxtMultip").val(1);
	    	$("#insertarProducto").addClass("disabled");
	      	$("#insertarProducto").prop("disabled", true);
	      	//$("#txtCantid").trigger(':reset');
	      	$("#txtPro").focus();
	    	return false;
	    }
	    else{

	    	//atributos en caso de ser producto con múltiples variantes
	      	if(rs.rows.item(0).CATPRO>0){
	      		var query2 = "select desval from de_dominio " +
							 "where coddom = (select codref from de_dominio " +
							 "where coddom = 100 " +
							 "and codval = " + rs.rows.item(0).CATPRO + ")";
      			var db2 = window.sqlitePlugin.openDatabase({name: "envios.db"});
      			db2.executeSql(query2, [], function(rs2) {
      			var fila = '';//'<tr><td>ATRIBUTO</td><td>CANTIDAD</td></tr>';
      			//$("#tblAttrib").append(fila);
      			if (rs2.rows.length>0){
      				for (var i = 0; i < rs2.rows.length; i++) {
	      				fila = '<tr><td>' + rs2.rows.item(i).DESVAL + '</td>' +
	      					   '<td><input type="number" id="txtCantid" data-catpro ="'+ rs.rows.item(0).CATPRO +
	      					   '" class="form-control" max="99"></td></tr>';
	      				$("#tblAttrib").append(fila);
	      			}
	      			$("#tabAttrib").removeClass("invisible");
      			}
      			else{
      				$("#tabAttrib").addClass("invisible");
      				$("#tblAttrib").empty();
      			}
      		}, function(error) {
	    		alert('Error en la consulta: ' + error.message);
	  		});
	      }
	    else{
      		$("#tabAttrib").addClass("invisible");
      		$("#tblAttrib").empty();
      	}
      	//añado precios
      	var precio = 0;
      	/*if(cantid >= rs.rows.item(0).CANMAY && rs.rows.item(0).PREMAY > 0){
      		precio = rs.rows.item(0).PREMAY;
      	}
      	else{
      		precio = rs.rows.item(0).PREDET;
      	}*/
      	//cargo datos de producto
      	  if(rs.rows.item(0).FACTUR == "S"){ //si es facturable es verde, sino azul
      	  	$("#modalDatosProducto").prop("class","textoVerde");
      	  }
      	  else{
      	  	$("#modalDatosProducto").prop("class","textoAzul");
      	  }
	      $("#modalTxtCodpro").text(rs.rows.item(0).CODPRO);
	      $("#modalTxtCodpro").attr("data-costo",rs.rows.item(0).COSTO);
	      $("#modalTxtDespro").text(rs.rows.item(0).DESPRO);
	      $("#modalTxtPrecioNor").text(rs.rows.item(0).PREDET);
	      if(rs.rows.item(0).PREMAY > 0){
	      	$("#modalTxtPrecioMay").text(rs.rows.item(0).PREMAY);
	      }
	      else{
	      	$("#modalTxtPrecioMay").text(rs.rows.item(0).PREDET);
	      }
	      $("#modalTxtCanMay").val(rs.rows.item(0).CANMAY);
	      $("#modalTxtMultip").val(rs.rows.item(0).MULTIP);
	      $("#modalTxtProdFacturable").val(rs.rows.item(0).FACTUR);
	      $("#insertarProducto").removeClass("disabled");
	      $("#insertarProducto").prop("disabled", false);
	      $("#txtCantid").focus();
	      //getStock(rs.rows.item(0).CODPRO,window.localStorage.getItem('numlocal'),window.localStorage.getItem('tokenDMG'));
	    }
	  }, function(error) {
	    alert('Error en la consulta: ' + error.message);
	  });
	};
	



	function limpiar(){
		$("#txtRutcli").val("");
		$("#txtObserv").val("");
		$("#btnConfirmarGuardado").prop("enabled",false);
		$("#btnConfirmarGuardado").addClass("disabled");
		$("#tblProd >tbody").empty();
		$("#nombreCliente").text("");
		$("txtPro").removeClass("disabled");
		$("#totalNota").text("Total nota:$0");
    	$("#totalNota2").text("Total nota:$0");
    	limpiarModal();
		getNumnvt();
	};

	function limpiarModal(){
		$("#txtPro").text("");
		$("#txtPro").val("");
		$("#modalTxtCodpro").text("");
		$("#modalTxtDespro").text("");
		$("#modalTxtPrecioNor").text("");
		$("#modalTxtPrecioMay").text("");
		$("#modalTxtCanMay").val("");
		$("#txtCantid").val("");
		$("#tblAttrib").empty();
    	$("#tabAttrib").addClass("invisible");
    	$("#insertarProducto").addClass("disabled");
		$("#insertarProducto").prop("disabled",true);
		$("#tabAttrib").addClass("invisible");
		$("#tblAttrib").empty();
		$("#modalTxtProdFacturable").val("");
	}

	limpiar();
	cargarModalGuardar();

	$(".lblVendedor").text("Ejecutivo: " + window.localStorage.getItem("user"));
	$("#lblVendedor2").text("Ejecutivo: " + window.localStorage.getItem("user"));
	$("#lblVigencia").text("BD Válida hasta: " + window.localStorage.getItem("fecVenBase"));

	//eventos de botones
	function buscarProducto(){
		var txtPro =  $("#txtPro").val();
		var txtCantid =  $("#txtCantid").val();
	    if(txtPro!=''){
	    	if(duplicado(txtPro) == true){
	    		alert("Producto ya ingresado");
	    		return;
	    	}
	      	getPrecio(parseInt(txtPro),txtCantid);
	    }
	    else{
	      alert('Ingrese un código válido');
	      return;
		}
	}

	$("#btnCodigo").click(function (e) {
		$('#modalCodpro').modal('toggle');
		//$("#txtPro").focus();
	});

	$("#btnLimpiarModal").click(function(e){
		limpiarModal();
	});

	$("#btnGuardar").click(function(e){
		cargarModalGuardar();
	});

	$(".btnCerrarSesion").click(function(e){
		//window.localStorage.setItem("user", "");
		//window.localStorage.setItem("password", "");
		window.localStorage.removeItem("user");
		window.localStorage.removeItem("password");
		navigator.app.loadUrl("file:///android_asset/www/index.html");
	});

	$("#insertarProducto").click(function(e){
		//$("#txtCantid").trigger("change");
		var cantid = $("#txtCantid").val();
		var multip = $("#modalTxtMultip").val();
		var precio;
		if(cantid != "" && cantid > 0){
			if(cantid%multip>0){
				alert('Debe ingresar múltiplos de ' + multip);
				$('#txtCantid').focus();
			}
			else{
				if (cantid != getTotAtrib()){
					alert('Ingrese total de variedades');
					return false;
				}
				else{
					//getPrecio(parseInt($("#modalTxtCodpro").text()), cantid, false);
					//$("#buscarProducto").trigger("click");
					var canMay = parseInt($("#modalTxtCanMay").val());
					if(cantid >= canMay){
						netoProd = parseInt($("#modalTxtPrecioMay").text()) * cantid;
						precio = $("#modalTxtPrecioMay").text();
					}
					else{
						netoProd = parseInt($("#modalTxtPrecioNor").text()) * cantid;
						precio = $("#modalTxtPrecioNor").text();
					}
					
					var xmlAtrib = getAtributos();
					var tr = '';
					if (xmlAtrib != ''){ //si tiene atributos
						tr = '<tr id="prod-'+ $("#modalTxtCodpro").text() +'"><td data-costo="'+ $("#modalTxtCodpro").attr("data-costo") + '"' + 
							' data-facturable ="' + $("#modalTxtProdFacturable").val() +'" data-attrib="' + xmlAtrib + '">'
								 + $("#modalTxtCodpro").text() + "</td>" +
							"<td>"+$("#modalTxtDespro").text() + "</td>" +
							"<td>"+ precio + "</td>" +
							'<td><input type="number" class="form-control cantProd disabled" disabled="true" value="'+ cantid +'"></td>' +
							"<td>"+ netoProd +"</td>"+
							'<td><a href="#" class="up">SUBIR</a>/<a href="#" class="down">BAJAR</a></td>'+
							'<td><a class="eliminarFila" data-codpro="'+$("#modalTxtCodpro").text()+'" href="#">Eliminar</a></td>' +
							"</tr>";
					}
					else{
						tr = '<tr id="prod-'+ $("#modalTxtCodpro").text() +'"><td data-costo="'+ $("#modalTxtCodpro").attr("data-costo") + '"' + 
							' data-facturable ="' + $("#modalTxtProdFacturable").val() +'">'
								 + $("#modalTxtCodpro").text() + "</td>" +
							"<td>"+$("#modalTxtDespro").text() + "</td>" +
							"<td>"+ precio + "</td>" +
							'<td><input type="number" class="form-control cantProd" disabled value="'+ cantid +'"></td>' +
							"<td>"+ netoProd +"</td>"+
							'<td><a href="#" class="up">SUBIR</a>/<a href="#" class="down">BAJAR</a></td>'+
							'<td><a class="eliminarFila" data-codpro="'+$("#modalTxtCodpro").text()+'" href="#">Eliminar</a></td>' +
							"</tr>";
					}
					$("#tblProd").append(tr);
					$("#btnConfirmarGuardado").removeClass("disabled");
					limpiarModal();
					$("#totalNota").text("Total nota:$"+totalizaNota());
					$("#totalNota2").text("Total nota:$"+totalizaNota());
				}
			}
		}
		else{
			alert("Ingrese cantidad");
		}
	});

	$("#btnConfirmarGuardado").click(function(e){
		var rutcli = $("#txtRutcli").val();
		var productos = $("#tblProd >tbody >tr");
		if(productos.length > 0 && rutcli.length > 0){
			var nombreCliente = $("#nombreCliente").text();
			if (confirm("¿Desea grabar Nota de Venta? Subtotal:$" + totalizaNota() + ", Cliente:"+nombreCliente)) {
			    var xmlDet = getDetalle(productos);
				var numnvt = parseInt($("#lblTituloLpr").text());
				var vendedor = window.localStorage.getItem("user");
				var observ = $("#txtObserv").val();
				grabaXML(rutcli,numnvt,vendedor,observ,xmlDet);
			} else {
			    return false;
			} 
			
		}
		else{
			alert("Debe ingresar rut y al menos un producto");
			return;
		}
		
	});


    $("#txtRutcli" ).autocomplete({
      source: function( request, response ) {
      	var buscarPor = request.term;
      	var query = "";
      	if (!$.isNumeric(buscarPor)){
      		query = "select a.rutcli, a.razons as value, a.comuna from en_cliente as a " +
	   				"where upper(a.razons) like '%" + buscarPor.toUpperCase() + "%'";
      	}
      	else{
      		query = "select a.rutcli, a.razons as value, a.comuna from en_cliente as a " +
	   				"where rutcli like '%" + buscarPor.toUpperCase() + "%'";
      	}

      var db = window.sqlitePlugin.openDatabase({name: "envios.db"});

		   	db.executeSql(query, [], function(rs) {
		    if(rs.rows.length == 0){
		      return false;
		    }
		    else{
		    	var data = [];
			    for (i=0; i<rs.rows.length; ++i){
			        data.push(rs.rows.item(i));
			    }
	      		response(data);
		    }
		  }, function(error) {
		    alert('Error en la consulta: ' + error.message);
		  });
      	
      },
      minLength: 4,
      select: function( event, ui ) {
        $("#txtRutcli").val(parseInt(ui.item.RUTCLI));
        $("#nombreCliente").text(ui.item.value);
        $("#lblRazons").text(ui.item.value);
        $("#lblComuna").text(ui.item.COMUNA);
        return false;
      }
    } );

    $("#txtPro").autocomplete({
      source: function( request, response ) {
      	var buscarPor = request.term;
      	var query = "";
      	if (!$.isNumeric(buscarPor)){
      		query = "select a.codpro, a.despro as value from ma_product as a " +
	   				"where upper(a.despro) like '%" + buscarPor.toUpperCase() + "%'";
      	}
      	else{
      		query = "select a.codpro, a.despro as value from ma_product as a " +
	   				"where codpro like '%" + buscarPor.toUpperCase() + "%'";
      	}
      	var db = window.sqlitePlugin.openDatabase({name: "envios.db"});

		db.executeSql(query, [], function(rs) {
		    if(rs.rows.length == 0){
		    	//alert("no items");
		      return false;
		    }
		    else{
		    	var data = [];
			    for (i=0; i<rs.rows.length; ++i){
			        data.push(rs.rows.item(i));
			    }
	      		response(data);
		    }
		  }, function(error) {
		    alert('Error en la consulta: ' + error.message);
		  });
      	
      },
      minLength: 4,
      select: function( event, ui ) {
        $("#txtPro").val(parseInt(ui.item.CODPRO));
        $("#txtPro").addClass("disabled");
       	buscarProducto();
        return false;
      }
    } );

    $("#btnCerrarModallpr2").click(function(){
    	var rutcli = $("#txtRutcli").val();
    	if(rutcli.length > 0){
    		var sql = "SELECT razons, direccion, comuna from en_cliente " +
    				  "where rutcli =" + rutcli;
    		var db = window.sqlitePlugin.openDatabase({name: "envios.db"});

		   	db.executeSql(sql, [], function(rs) {
		    if(rs.rows.length == 0){
		      alert("Rut inválido");
		    }
		    else{
		    	$("#nombreCliente").text(rs.rows.item(0).RAZONS);
        		$("#lblRazons").text(rs.rows.item(0).RAZONS);
		    	$("#lblComuna").text(rs.rows.item(0).COMUNA);
		    	$("#modalGuardar").modal('hide');
		    	$("#modalCodpro").modal('toggle');
		    	$("#modalTxtCodpro").focus();
		    }
		  }, function(error) {
		    alert('Error en la consulta: ' + error.message);
		  });
    	}
    	else{
    		alert("Ingrese cliente para continuar");
    	}
    });

	$("#btnZip").click(function(e){
		var PathToFileInString  = cordova.file.externalRootDirectory+"nvt",
	        PathToResultZip     = cordova.file.externalRootDirectory;
	    JJzip.zip(PathToFileInString, {target:PathToResultZip,name:"nvt"},function(data){
	        //funcó e.e
	        //alert("ok!");
	        // this is the complete list of currently supported params you can pass to the plugin (all optional)
			var options = {
			  message: 'Notas de venta', // not supported on some apps (Facebook, Instagram)
			  files: [PathToResultZip+"nvt.zip", ''], // an array of filenames either locally or remotely
			  chooserTitle: 'Seleccione aplicación', // Android only, you can override the default share sheet title
			};

			/*window.plugins.socialsharing.shareWithOptions(options, function(result) {
			  alert("Share completed? " + result.completed); // On Android apps mostly return false even while it's true
			  alert("Shared to app: " + result.app); // On Android result.app since plugin version 5.4.0 this is no longer empty. On iOS it's empty when sharing is cancelled (result.completed=false)
			}, function(msg) {
			  alert("Sharing failed with message: " + msg);
			});*/
	        window.plugins.socialsharing.share('Notas de Venta', 'BYF', PathToResultZip+"nvt.zip");
	    },function(error){
	        alert("error: " + JSON.stringify(error));
	    })
	});

	$(document).on('click','.eliminarFila',function() {
    	var cid = $(this).data('codpro');
	    $("#prod-"+cid).remove();
	    $("#totalNota").text("Total nota:$" + totalizaNota());
	    $("#totalNota2").text("Total nota:$" + totalizaNota());
	});

	$(document).on('click','.up,.down',function(){
        var row = $(this).parents("tr:first");
        if ($(this).is(".up")) {
            row.insertBefore(row.prev());
        } else {
            row.insertAfter(row.next());
        }
    });
}, false);