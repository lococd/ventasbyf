document.addEventListener('deviceready', function(){
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
					"b.comuna, b.ciudad,b.forpag,b.plapag,b.codlis, 0 as DESCTO01, 0 as DESCTO02 "+
					"from ma_usuario as a, en_cliente as b " +
	   				"where a.codusu = '" + vendedor + "' " +
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
			    	totiva = totneto * 0.19;
			    	totgen = Math.round(totneto + totiva);
			    	var fecemi = getAgno() + getMes() + getDia();
			    	xmlCab = "<numnvt>" + numnvt +"</numnvt>" +
			    			 "<codven>" + rs.rows.item(0).CODVEN +"</codven>" +
			    			 "<fecemi>" + fecemi +"</fecemi>" +
			    			 "<vendedor>" + vendedor +"</vendedor>" +
			    			 "<razons>" + rs.rows.item(0).RAZONS +"</razons>" +
			    			 "<direcc>" + rs.rows.item(0).DIRECC +"</direcc>" +
			    			 "<comuna>" + rs.rows.item(0).COMUNA +"</comuna>" +
			    			 "<ciudad>" + rs.rows.item(0).CIUDAD +"</ciudad>" +
			    			 "<forpag>" + rs.rows.item(0).FORPAG +"</forpag>" +
			    			 "<plapag>" + rs.rows.item(0).PLAPAG +"</plapag>" +
			    			 "<codlis>" + rs.rows.item(0).CODLIS +"</codlis>" +
			    			 "<subtot>" + subtot +"</subtot>" +
			    			 "<dscto1>" + rs.rows.item(0).DESCTO01 +"</dscto1>" +
			    			 "<dscto2>" + rs.rows.item(0).DESCTO02 +"</dscto2>" +
			    			 "<totneto>" + totneto +"</totneto>" +
			    			 "<totiva>" + totiva +"</totiva>" +
			    			 "<totgen>" + totgen +"</totgen>" +
			    			 "<totsal>" + totgen +"</totsal>" +
			      			 "<numbul>0</numbul>"+
				             "<codban>30</codban>" +
				             "<origen>REM</origen>" +
				             "<estado>0</estado>" +
				             "<pagada>0</pagada>"+
				             "<factura>N</factura>"+
				             "<observ>"+ observ + "</observ>";

				            var xmlText = '<?xml version="1.0" encoding="utf-8"?>'+
							  "<Pedidos><NotaVenta><Cabecera>"+ xmlCab +
							  "</Cabecera><Detalle>"+ xmlDet+
							  "</Detalle></NotaVenta></Pedidos>";

							window.resolveLocalFileSystemURL( cordova.file.externalRootDirectory+"/nvt", function( directoryEntry ) {
							    directoryEntry.getFile(numnvt+".txt", { create: true }, function( fileEntry ) {
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
			var xmlDet = "";
			productos.each(function(tr,fila) {
				codpro = $(fila).find('td:eq(0)').text();
				descrip = $(fila).find('td:eq(1)').text();
				precio = $(fila).find('td:eq(2)').text();
				cantid = $(fila).find('td:eq(3) >input').val();
				costo = $(fila).find('td:eq(0)').attr("data-costo");
				totnet = precio * cantid;
				query = "INSERT INTO DE_NOTAVTA (CODEMP,NUMNVT,SEQUEN,CODPRO,PRECIO,CANTID,PREFIN,TOTNET,PORDOC,COMIS,PREPARACION,PESO) " +
						"VALUES('1','"+numnvt+"','"+sequen+"','"+codpro+"','"+precio+"','"+cantid+"','"+precio+"','"+totnet+"','"+cantid+"','7.5','0','0')";
						//alert(query);
				xmlDet = xmlDet + "<Producto>" +
									"<codemp>1</codemp>"+
									"<numnvt>" + numnvt + "</numnvt>"+
									"<sequen>" + sequen + "</sequen>" +
									"<despro>" + descrip + "</despro>" +
									"<unidad>UND</unidad>" +
									"<precio>" + precio + "</precio>" +
									"<cantid>" + cantid + "</cantid>" +
									"<desc01>0</desc01>" +
									"<prefin>" + precio + "</prefin>" +
									"<totnet>" + totnet + "</totnet>" +
									"<qrevis>0</qrevis>" +
									"<pordoc>" + cantid + "</pordoc>" +
									"<margen>" + Math.round((((precio-costo)/precio)*100) * 100) / 100 + "</margen>" +
									"<revision>0</revision>" +
									"<codubi>4</codubi>" +
									"<costo>" + costo + "</costo>" +
									"<comis>7,5</pordoc>"
								+ "</Producto>";
				sequen = sequen + 1;
			});
			return xmlDet;
	}
	function getPrecio(codpro){

	   var query = "select a.codpro, a.despro, a.costo, b.predet from ma_product as a, re_lvenpro as b " +
	   				"where a.codpro = b.codpro " +
	   				"and a.codpro = '" + codpro + "'";
      	var db = window.sqlitePlugin.openDatabase({name: "envios.db"});


	   	db.executeSql(query, [], function(rs) {
	    if(rs.rows.length == 0){
	    	alert('Código '+ codpro +' no tiene precio configurado');
	    	$("#modalTxtCodpro").text('');
	    	$("#modalTxtDespro").text('');
	    	$("#modalTxtPrecio").text('');
	    	$("#insertarProducto").addClass("disabled");
	      	$("#insertarProducto").prop("disabled", true);
	      	$("#txtCantid").val("");
	      	$("#txtPro").focus();
	    	return false;
	    }
	    else{
	      $("#modalTxtCodpro").text(rs.rows.item(0).CODPRO);
	      $("#modalTxtCodpro").attr("data-costo",rs.rows.item(0).COSTO);
	      $("#modalTxtDespro").text(rs.rows.item(0).DESPRO);
	      $("#modalTxtPrecio").text(rs.rows.item(0).PREDET);
	      $("#insertarProducto").removeClass("disabled");
	      $("#insertarProducto").prop("disabled", false);
	      //getStock(rs.rows.item(0).CODPRO,window.localStorage.getItem('numlocal'),window.localStorage.getItem('tokenDMG'));
	    }
	  }, function(error) {
	    alert('Error en la consulta: ' + error.message);
	  });
	};
	



	function limpiar(){
		$("#modalTxtCodpro").text("");
		$("#modalTxtDespro").text("");
		$("#modalTxtPrecio").text("");
		$("#txtCantid").val("");
		$("#txtRutcli").val("");
		$("#txtObserv").text("");
		$("#btnConfirmarGuardado").prop("enabled",false);
		$("#btnConfirmarGuardado").addClass("disabled");
		$("#tblProd >tbody").empty();
		$("#nombreCliente").text("");
		$("#totalNota").text("Total nota:$0");
    	$("#totalNota2").text("Total nota:$0");
		getNumnvt();
	};

	limpiar();
	cargarModalGuardar();

	$("#lblVendedor").text("Ejecutivo: " + window.localStorage.getItem("user"));

	//eventos de botones

	$("#buscarProducto").click(function(e){
		var txtPro =  $("#txtPro").val();
	    if(txtPro!=''){
	    	if(duplicado(txtPro) == true){
	    		alert("Producto ya ingresado");
	    		return;
	    	}
	      	getPrecio(parseInt(txtPro));
	    }
	    else{
	      alert('Ingrese un código válido');
	      return;
		}
	});

	$("#btnCodigo").click(function (e) {
		$('#modalCodpro').modal('toggle');
		//$("#txtPro").focus();
	});

	$("#btnGuardar").click(function(e){
		cargarModalGuardar();
	});

	$("#btnCerrarSesion").click(function(e){
		window.localStorage.setItem("user", "");
		window.localStorage.setItem("password", "");
		window.location.replace("index.html");
	});

	$("#insertarProducto").click(function(e){
		var cantid = $("#txtCantid").val();
		if(cantid != "" && cantid > 0){
			/*if($("#modalTxtCodpro").text() != $("#txtPro").text()){
				alert("Producto a ingresar cambiado");
				$("#txtCantid").val("");
				$("#insertarProducto").addClass("disabled");
				$("#insertarProducto").prop("disabled",true);
				$("#txtPro").text("");
				$("#txtPro").focus();
				return false;
			}*/
	      	netoProd = parseInt($("#modalTxtPrecio").text()) * cantid;
			var tr = '<tr id="prod-'+ $("#modalTxtCodpro").text() +'"><td data-costo="'+ $("#modalTxtCodpro").attr("data-costo") + '">'
						 + $("#modalTxtCodpro").text() + "</td>" +
					"<td>"+$("#modalTxtDespro").text() + "</td>" +
					"<td>"+$("#modalTxtPrecio").text() + "</td>" +
					'<td><input type="number" class="form-control cantProd" value="'+ cantid +'"></td>' +
					"<td>"+ netoProd +"</td>"+
					'<td><a class="eliminarFila" data-codpro="'+$("#modalTxtCodpro").text()+'" href="#">Eliminar</a></td>' +
					"</tr>";
			$("#tblProd").append(tr);
			$("#btnConfirmarGuardado").removeClass("disabled");
			$("#modalTxtCodpro").text("");
			$("#modalTxtDespro").text("");
			$("#modalTxtPrecio").text("");
			$("#txtPro").val("");
			$("#txtCantid").val("");
			$("#insertarProducto").addClass("disabled");
			$("#insertarProducto").prop("disabled",true);
			$("#totalNota").text("Total nota:$"+totalizaNota());
			$("#totalNota2").text("Total nota:$"+totalizaNota());
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
				var observ = $("#txtObserv").text();
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
      	if (!$.isNumeric(buscarPor)){
      		var query = "select a.rutcli, a.razons as value from en_cliente as a " +
	   				"where upper(a.razons) like '%" + buscarPor.toUpperCase() + "%'";
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
      		
      	}
      else{
      	return false;
      }
      	
      },
      minLength: 4,
      select: function( event, ui ) {
        $("#txtRutcli").val(parseInt(ui.item.RUTCLI));
        $("#nombreCliente").text(ui.item.value);
        return false;
      }
    } );

    $("#txtPro").autocomplete({
      source: function( request, response ) {
      	var buscarPor = request.term;
      	if (!$.isNumeric(buscarPor)){
      		var query = "select a.codpro, a.despro as value from ma_product as a " +
	   				"where upper(a.despro) like '%" + buscarPor.toUpperCase() + "%'";
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
      		
      	}
      else{
      	return false;
      }
      	
      },
      minLength: 4,
      select: function( event, ui ) {
        $("#txtPro").val(parseInt(ui.item.CODPRO));
        $("#buscarProducto").trigger("click");
        return false;
      }
    } );

    $("#btnCerrarModallpr2").click(function(){
    	var rutcli = $("#txtRutcli").val();
    	if(rutcli.length > 0){
    		var sql = "SELECT razons, direccion from en_cliente " +
    				  "where rutcli =" + rutcli;
    		var db = window.sqlitePlugin.openDatabase({name: "envios.db"});

		   	db.executeSql(sql, [], function(rs) {
		    if(rs.rows.length == 0){
		      alert("Rut inválido");
		    }
		    else{
		    	$("#nombreCliente").text(rs.rows.item(0).RAZONS);
		    	$("#modalGuardar").modal('hide');
		    }
		  }, function(error) {
		    alert('Error en la consulta: ' + error.message);
		  });
    	}
    	else{
    		alert("Ingrese cliente para continuar");
    	}
    });

	$(document).on('click','.eliminarFila',function() {
    	var cid = $(this).data('codpro');
	    $("#prod-"+cid).remove();
	    $("#totalNota").text("Total nota:$" + totalizaNota());
	    $("#totalNota2").text("Total nota:$" + totalizaNota());
	});

	$(document).on('blur','.cantProd',function() {
    	var cantid = $(this).val();
    	if(cantid == "" || cantid == null || cantid == 0){
    		alert("Ingrese cantidad");
    		$(this).focus();
    		return false;
    	}
    	else{
    		var precio = $(this).parent().parent().find('td:eq(2)').text();
    		$(this).parent().parent().find('td:eq(4)').text(precio * cantid);
    		$("#totalNota").text("Total nota:$" + totalizaNota());
    		$("#totalNota2").text("Total nota:$" + totalizaNota());
    	}
	});

	

}, false);