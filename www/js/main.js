document.addEventListener('deviceready', function(){
	var limpiando = true;
	//funciones auxiliares
	function limpiarModalCrearCliente(){

	}

	function validaBase(){
		var db = window.sqlitePlugin.openDatabase({name: "envios.db"});
	      var query = "select fecact from ma_update";
	      var user = window.localStorage.getItem("user");
	      db.transaction(function (tx) {
	        tx.executeSql(query, [], function (tx, rs) {
	          var fecha = rs.rows.item(0).fecact.toString();
	          var agno = parseInt(fecha.substr(0,4));
	          var mes = parseInt(fecha.substr(4,2));
	          var dia = parseInt(fecha.substr(6,2));
	          var sysdate = new Date();
	          var fechaVenc = new Date(agno,mes-1,dia);
	          db.close();
	          if( fechaVenc > sysdate || user == "FVERGARA"){ //>
	            alert("¡Nueva base de datos cargada correctamente!");
	          }
	          else{
	            alert("Base vencida, ingrese una nueva");
	            getBase();
	            return false;
	          }
	        },
	        function (tx, error) {
	            var strErr = JSON.stringify(error);
	            if(strErr.includes("2:") || strErr.includes("missing database") || strErr.includes("no such table")){
	              alert("No hay base de datos cargada, ingrese una");
	              alert(strErr);
	              getBase();
	              return false;
	            }
	            else{
	                alert("problema en query " + strErr);
	                return false;
	            }
	        });
	    }, function (error) {
	        alert('transaction error: ' + error.message);
	    }, null);
	}

	function cargaBase(){
		getBase("main");
  }

	function cargarModalGuardar(){
		$('#modalGuardar').modal('toggle');
		//$('#modalNuevoCliente').modal('toggle');
	};

	function totalizaNota(){
		var productos = $("#tblProd >tbody >tr");
		var neto = 0;
		var cantid;
		var totnet;
		var precio;
		productos.each(function(tr,fila) {
				precio = $(fila).find('td:eq(2)').text();
				cantid = $(fila).find('td:eq(3) >input').val();
				totnet = precio * cantid;
				neto = neto + totnet;
			});
		return neto;
	};

	function getDescuentos(){
		var productos = $("#tblProd >tbody >tr");
		var neto = 0;
		var facturable = "N";
		var descuento = 0;
		var cantid;
		var totnet;
		var precio;
		if($("#txtDescuento").val() != ""){
			descuento = parseInt($("#txtDescuento").val());
		}
		else{
			return 0;
		}
		productos.each(function(tr,fila) {
				precio = $(fila).find('td:eq(2)').text();
				cantid = $(fila).find('td:eq(3) >input').val();
				facturable = $(fila).find('td:eq(0)').attr("data-facturable");
				totnet = precio * cantid;
				if(facturable == "S"){
					totnet = Math.round(totnet * (descuento/100));
					neto = neto + totnet;
				}
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

	function validarRut(numero,dv) {
	    if(numero.length == 0 || numero.length > 8 ) {
	        return false;
	    } else {
	        if(getDV(numero) == dv) return true;
	    }
	    return false;
	}
    function getDV(numero) {
        nuevo_numero = numero.toString().split("").reverse().join("");
        for(i=0,j=2,suma=0; i < nuevo_numero.length; i++, ((j==7) ? j=2 : j++)) {
            suma += (parseInt(nuevo_numero.charAt(i)) * j); 
        }
        n_dv = 11 - (suma % 11);
        return ((n_dv == 11) ? 0 : ((n_dv == 10) ? "K" : n_dv));
    }

	function getTotAtrib(){
		var cantid = $("#txtCantid").val();
		var clases = $("#tabAttrib").attr('class');
		if(clases.indexOf("invisible") < 0){
			var productos = $("#tblAttrib >tr");
			var cantidAtrib = 0;
			var parar = false;
			$(productos).each(function(i,fila){
				cantUni = $(fila).find('td:eq(1) input').val();
				var multip = $("#modalTxtMultip").val();
				if (cantUni == ""){
					cantUni = 0;
				}
				else{
					if(cantUni%multip > 0){
						cantidAtrib = -1;
						parar = true;
					}
					cantUni = parseInt(cantUni);
				}
				if (!parar){
					cantidAtrib = cantidAtrib + cantUni;
				}
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

	function buscarClienteModal(rutcli, hideModal){
		if(rutcli.length > 0){
    		var sql = /*"SELECT razons, direccion, lincre, comuna, sum(totsal) b from en_cliente a, en_notavta b" +
    				  "where rutcli =" + rutcli;*/
    				  "SELECT a.rutcli, a.razons, direccion, lincre - sum(ifnull(totsal,0)) LINCRE, a.comuna, " +
					  "sum(ifnull(totsal,0)) as TOTSAL " +
					  "from en_cliente a " +
					  "left outer join " +
    				  "en_notavta b " +
					  "on a.rutcli = b.rutcli " +
					  "where a.rutcli = " + rutcli;
    		var db = window.sqlitePlugin.openDatabase({name: "envios.db"});

		   	db.executeSql(sql, [], function(rs) {
		    if(rs.rows.length == 0){
		      alert("Rut inválido");
		    }
		    else{
		    	$("#nombreCliente").text(rs.rows.item(0).RAZONS);
        		$("#lblRazons").text(rs.rows.item(0).RAZONS);
		    	$("#lblComuna").text(rs.rows.item(0).COMUNA);
		    	window.localStorage.setItem("lincre", rs.rows.item(0).LINCRE);

				if(rs.rows.item(0).LINCRE <=0){
					alert("Cliente sin crédito disponible");
				}

				if(parseInt(rs.rows.item(0).TOTSAL) > 0){
					mostrarMensaje("Cliente con deuda pendiente de $"+rs.rows.item(0).TOTSAL);
					//cargarDeuda();
				}else{
					if(hideModal){
						$("#modalGuardar").modal('hide');
						$("#modalCodpro").modal('toggle');
						$("#modalTxtCodpro").focus();
					}
				}
				
		    }
		  }, function(error) {
		    alert('Error en la consulta: ' + error.message);
		  });
    	}
    	else{
    		alert("Ingrese cliente para continuar");
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
		var dscto;
		var xmlCab = "";
		var totDescuentos = getDescuentos();
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
			    	totgen = subtot - totDescuentos;
			    	totneto = Math.trunc(totgen / 1.19); //- (subtot * parseInt(rs.rows.item(0).DESCTO01)) - (subtot * parseInt(rs.rows.item(0).DESCTO02));
			    	totiva = totgen - totneto;
			    	
			    	dscto = 0;
			    	if($("#txtDescuento").val() != ""){
			    		dscto = $("#txtDescuento").val();
			    	}
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
			    			 "<dscto1>" + totDescuentos + "</dscto1>" + String.fromCharCode(13) +
			    			 "<dscto2>0</dscto2>" + String.fromCharCode(13) +
			    			 "<toneto>" + totneto +"</toneto>" + String.fromCharCode(13) +
			    			 "<totiva>" + totiva +"</totiva>" + String.fromCharCode(13) +
			    			 "<totgen>" + totgen +"</totgen>" + String.fromCharCode(13) +
			    			 "<totsal>" + totgen +"</totsal>" + String.fromCharCode(13) +
			      			 "<numbul>0</numbul>" + String.fromCharCode(13)+
				             "<codban>30</codban>" + String.fromCharCode(13) +
				             "<origen>REM</origen>" + String.fromCharCode(13) +
				             "<estado>0</estado>" + String.fromCharCode(13) +
				             "<pagada>0</pagada>" + String.fromCharCode(13)+
				             //"<factura>N</factura>" + String.fromCharCode(13)+
				             "<observ>"+ observ + "</observ>" + String.fromCharCode(13)+
				             "<factura>" + $("#cmbFacturable option:selected").text() + "</factura>" + String.fromCharCode(13);

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

							window.resolveLocalFileSystemURL( cordova.file.externalDataDirectory+"/nvt", function( directoryEntry ) {
								var sysdate = new Date();
								var mes = sysdate.getMonth() + 1;
								var fechasalida = (sysdate.getYear() + 1900).toString() + getMes() + getDia() + sysdate.getHours().toString() + sysdate.getMinutes().toString() + sysdate.getSeconds().toString();
							    directoryEntry.getFile(fechasalida + window.localStorage.getItem("user") + numnvt + ".xml", { create: true }, function( fileEntry ) {
							        fileEntry.createWriter( function( fileWriter ) {
							            fileWriter.onwriteend = function( result ) {
							            	alert( 'Nota de venta grabada con éxito! Numero '+ numnvt );

							            };
							            fileWriter.onerror = function( error ) {
							                alert( JSON.stringify(error) );
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
		alert('Error almacenamiento' + err.message);
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
	   		 		"from ma_product as a, re_lvenpro as b, en_cliente c " +
	   				"where a.codpro = b.codpro " +
	   				"and c.codlis = b.codlis " +
	   				"and c.rutcli = " + $("#txtRutcli").val() + " " +
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
      	  	$("#modalDatosProducto").prop("class","textoRojo");
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
	      $("#modalTxtCanMay").text(rs.rows.item(0).CANMAY);
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
	
	function cargarCombos(){
		var db = window.sqlitePlugin.openDatabase({name: "envios.db"});
		var query = "SELECT DESVAL FROM DE_DOMINIO WHERE CODDOM = 1 ORDER BY DESVAL ASC";
		db.executeSql(query, [], function(rs) {
		    if(rs.rows.length == 0){
		    	//alert("no items");
		    	db.close();
		      	return false;
		    }
		    else{
		    	var fila;
		    	//alert(JSON.stringify(rs));
		    	/*for (i=0; i<rs.rows.length; ++i){
		    		fila = "<option>" + rs.rows.item(i).DESVAL + "</option>";
		    		$("#cmbNewCiudad").append(fila);
			    }*/

			    query = "SELECT DESVAL FROM DE_DOMINIO WHERE CODDOM = 2 ORDER BY DESVAL ASC";
				db.executeSql(query, [], function(rs) {
				    if(rs.rows.length == 0){
				    	//alert("no items");
				    	db.close();
				      	return false;
				    }
				    else{
				    	db.close();
				    	/*for (i=0; i<rs.rows.length; ++i){
				    		fila = "<option>" + rs.rows.item(i).DESVAL + "</option>";
				    		$("#cmbNewComuna").append(fila);
					    }*/
					    
				    }
				  }, function(error) {
				    alert('Error en la consulta: ' + error.message);
				  });
		    }
		  }, function(error) {
		    alert('Error en la consulta: ' + error.message);
		  });
	}


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
    	$("#txtDescuento").val("");
    	$("#lblRazons").text("");
    	$('#cmbFacturable').val("S");
    	$("#btnCabecera").text("Nueva nota de venta");
    	$("#btnCerrarModallpr2").show();
    	window.localStorage.setItem("lincre", 0);
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
		$("#modalTxtCanMay").text("");
		$("#txtCantid").val("");
		$("#tblAttrib").empty();
    	$("#tabAttrib").addClass("invisible");
    	$("#insertarProducto").addClass("disabled");
		$("#insertarProducto").prop("disabled",true);
		$("#tabAttrib").addClass("invisible");
		$("#tblAttrib").empty();
		$("#modalTxtProdFacturable").val("");
	}

	function limpiarFicha(){
		$("#txtNewRut").val("");
		$("#txtNewDV").val("");
		$("#txtNewRazons").val("");
		$("#txtNewDireccion").val("");
		$("#txtNewFono").val("");
		$("#txtNewContacto").val("");
		$("#txtNewObservacion").val("");
	}

	function validaDescuento(){
		var descMax = parseInt(window.localStorage.getItem("descuento"));
  		var descuento = parseInt($("#txtDescuento").val());

  		if(descMax < descuento){
  			alert("DESCUENTO MÁXIMO EXCEDIDO, DESCUENTO AUTORIZADO "+descMax+"%");
  			return false;
  		}
  		else{
  			return true;
  		}
	}

	limpiar();
	//$('#modalCodpro').modal('toggle'); return false;
	cargarModalGuardar();
	cargarCombos();

	$(".lblVendedor").text("Ejecutivo: " + window.localStorage.getItem("user"));
	$("#lblVendedor2").text("Ejecutivo: " + window.localStorage.getItem("user"));
	$("#lblVigencia").text("BD Válida hasta: " + window.localStorage.getItem("fecVenBase"));

	//eventos de botones
	function buscarProducto(){
		var nombreCliente = $("#nombreCliente").text();
		if(nombreCliente.length == 0){
			alert("Debe ingresar datos de cliente para nueva nota");
			$("#modalCodpro").modal("hide");
			$("#modalGuardar").modal("show");
			return false;
		}
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

	$(".btnGuardar").click(function(e){
		confirmarGuardado();
	});

	$(".btnCabecera").click(function(e){
		cargarModalGuardar();
	});

	$(".btnCerrarSesion").click(function(e){
		//window.localStorage.setItem("user", "");
		//window.localStorage.setItem("password", "");
		window.localStorage.removeItem("user");
		window.localStorage.removeItem("password");
		window.localStorage.removeItem("descuento");
		$("#modalCargando").modal("toggle");
		setTimeout(function(){
			var db = window.sqlitePlugin.openDatabase({name: "envios.db"});
			db.close();
			$("#modalCargando").modal("toggle");
			window.location.replace("index.html");
		  },2000);
		//navigator.app.loadUrl("file:///android_asset/www/index.html");
	});

	$("#insertarProducto").click(function(e){
		//$("#txtCantid").trigger("change");
		var lincre = window.localStorage.getItem("lincre");
		var totalNota = totalizaNota();
		var cantid = $("#txtCantid").val();
		var multip = $("#modalTxtMultip").val();
		var precio;
		
		if(cantid != "" && cantid > 0){
			if(cantid%multip>0){
				alert('Debe ingresar múltiplos de ' + multip);
				$('#txtCantid').focus();
			}
			else{
				var cantAtrib = getTotAtrib();
				if(cantAtrib == -1){ //validación detalle
					alert("Ingresar múltiplos de " + multip + " en las variedades");
					return false;
				}
				if (cantid != cantAtrib){
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
					totalNota = totalNota + netoProd;
					if(lincre<totalNota){
						alert("Total excede credito \nCredito: $"+lincre+"\nTotal sin producto a ingresar:$"+(totalNota-netoProd)+"\nTotal con producto a ingresar: $"+totalNota);
						return false;
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
					//se cambia el boton nueva nota de venta por cambiar datos de nota
					var productos = $("#tblProd >tbody >tr");
					if(productos.length == 1){
						$("#btnCabecera").text("Editar Datos de Nota");
					}
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


	function confirmarGuardado(){
		var rutcli = $("#txtRutcli").val();
		var productos = $("#tblProd >tbody >tr");
		if(!validaDescuento()){
			return false;
		}
		if(productos.length > 0 && rutcli.length > 0){
			var nombreCliente = $("#nombreCliente").text();
			var lincre = window.localStorage.getItem("lincre");
			if(lincre<totalizaNota()){
				alert("Total excede credito");
				return false;
			}
			if (confirm("¿Desea grabar Nota de Venta? Subtotal:$" + totalizaNota() + ", Descuentos $" + getDescuentos() + 
				", Total neto: $"+ (totalizaNota() - getDescuentos()) +",Cliente:"+nombreCliente)){
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
			return false;
		}
	}

	function iniciarNota(){
		if(!validaDescuento()){
  			return false;
  		}
  		else{
  			buscarClienteModal($("#txtRutcli").val(), true);
  		}
	}

	$("#btnConfirmarGuardado").click(function(e){
		
	});


    $("#txtRutcli").autocomplete({
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
		    	//alert(JSON.stringify(rs));
		    	var data = [];
			    for (i=0; i<rs.rows.length; ++i){
			        data.push(rs.rows.item(i));
			        //alert(JSON.stringify(rs.rows.item(i)));
			    }
				if(db !== undefined && db !== null){
					db.close();
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
				if(db !== undefined && db !== null){
					db.close();
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
    });

    $("#cmbNewComuna").autocomplete({
      source: function( request, response ) {
      	var buscarPor = request.term;
      	var query = "";
      	query = `select a.desval as value, b.desval as ciudad
				from de_dominio a,
				de_dominio b
				where a.codref = b.codval
				and a.coddom = 2
				and b.coddom = 1
   				and upper(a.desval) like '%` + buscarPor.toUpperCase() + `%'`;


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
				if(db !== undefined && db !== null){
					db.close();
				}
	      		response(data);
		    }
		  }, function(error) {
		    alert('Error en la consulta: ' + error.message);
		  });
      	
      },
      minLength: 4,
      select: function( event, ui ) {
        $("#cmbNewComuna").val(ui.item.value);
        $("#cmbNewCiudad").val(ui.item.ciudad);
        return false;
      }
    });


    $("#cmbNewGiro").autocomplete({
      source: function( request, response ) {
      	var buscarPor = request.term;
      	var query = "";
      	query = `select a.codval, a.desval as value
      			 from de_dominio a
      			 where coddom = 8
   				 and upper(a.desval) like '%` + buscarPor.toUpperCase() + `%'`;


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
				if(db !== undefined && db !== null){
					db.close();
				}
	      		response(data);
		    }
		  }, function(error) {
		    alert('Error en la consulta: ' + error.message);
		  });
      	
      },
      minLength: 3,
      select: function( event, ui ) {
        $("#cmbNewGiro").val(ui.item.value);
        return false;
      }
    });

    $("#btnCerrarModallpr2").click(function(){

    });

	$("#btnZip").click(function(e){
		var PathToFileInString  = cordova.file.externalDataDirectory+"nvt",
	        PathToResultZip     = cordova.file.externalDataDirectory;
	    JJzip.zip(PathToFileInString, {target:PathToResultZip,name:"nvt"},function(data){
	    	
	    	var options = {
				    		message:    'Notas de Venta', // string
				    		subject:       'BYF',    // string
				    		files:  [PathToResultZip+"nvt.zip"]
						};
	        window.plugins.socialsharing.shareWithOptions(options, function(result){
	        	if(result.app.length>0){
	        		if(confirm("Pasar notas actuales a carpeta enviadas?")) {
	        			moveNotasEnviadas();
	        			window.localStorage.setItem("numnvt", 1);
	        			getNumnvt();
	        			alert("Notas movidas a enviadas");
	        		}
	        	}
	        },function(error){
	        	alert("no pasa naranja " + error);
	        });
	    },function(error){
	        alert("Hay notas para enviar? error: " + error.message);
	    })
	});

	$("#btnLimpiarNota").click(function(e){
		if(confirm("¿Limpiar datos de la nota de venta?")){
			limpiar();
		}
		else{
			return false;
		}
	});

	function moveNotasEnviadas(){
		var pathDestino = cordova.file.externalDataDirectory+"nvtEnviadas";
		var pathOrigen = cordova.file.externalDataDirectory;
		  //agarro el directorio root
	  window.resolveLocalFileSystemURL(pathOrigen, function( directoryEntry ) {
	    directoryEntry.getDirectory("nvt", {create: false, exclusive: false}, function(dir) {  //tomo el directorio nvt
	      // tomo un lector del directorio
	      var directoryReader = dir.createReader();
	      // listo todos los ficheros
	      directoryReader.readEntries(function(entries) {
	                                      var i;
	                                      for (i=0; i<entries.length; i++) {
	                                          //muevo archivo por archivo
	                                          moveFile(entries[i].nativeURL,entries[i].name, pathOrigen);
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

	function cargarDeuda(){
		var query = "SELECT NUMNVT, FECEMI, TOTGEN, TOTSAL, ESTADO FROM EN_NOTAVTA " +
				  "WHERE TOTSAL > 0 AND RUTCLI = " + $("#txtRutcli").val();
		var db = window.sqlitePlugin.openDatabase({name: "envios.db"});
		var fecha; 
        var agno;
        var mes;
        var dia;
        var totgen;
        var totsal;
		db.executeSql(query, [], function(rs) {
		    if(rs.rows.length == 0){
		      alert("Cliente sin deuda");
		      return false;
		    }
		    else{
		    	$("#tblDeuda").empty();
		    	var celdas = "<thead>" +
		    				 	"<tr>" +
		    				 		"<td>NUMNVT</td>" +
		    				 		"<td>FECEMI</td>" +
		    				 		"<td>TOTGEN</td>" +
		    				 		"<td>TOTSAL</td>" +
		    				 	"</tr>" +
		    				 "</thead><tbody>";
		    	var clase = "";
			    for (i=0; i<rs.rows.length; ++i){
			    	fecha = rs.rows.item(i).FECEMI.toString();
			    	agno = fecha.substr(2,2);
			    	mes = fecha.substr(4,2);
			    	dia = fecha.substr(6,2);
			    	totgen = rs.rows.item(i).TOTGEN.toLocaleString('es-CL', {
					  style: 'currency',
					  currency: 'CLP',
					});
					if(rs.rows.item(i).ESTADO == 5){
						totsal = "NULA";
						clase = "textoRojo";
					}
					else{
						totsal = rs.rows.item(i).TOTSAL.toLocaleString('es-CL', {
					  	style: 'currency',
					  	currency: 'CLP',
						});
						clase = "";
					}
					

			    	celdas = celdas + '<tr class = "'+ clase + '">' +
			    	"<td>" + Math.trunc(rs.rows.item(i).NUMNVT) + "</td>" +
			    	"<td>" + dia + "-" + mes + "-" + agno + "</td>" +
			    	"<td>" + totgen + "</td>" +
			    	"<td>" + totsal + "</td></tr>";
			    }
			    celdas = celdas + "</tbody>";
			    $("#tblDeuda").append(celdas);
		    }
		  }, function(error) {
		    alert('Error en la consulta: ' + error.message);
		  });
	}


	$("#btnBorrarEnviadas").click(function(e){
		//agarro el directorio root
	  	window.resolveLocalFileSystemURL( cordova.file.externalDataDirectory, function( directoryEntry ) {
	    directoryEntry.getDirectory("nvtEnviadas", {create: false, exclusive: false}, function(dir) {  //tomo el directorio root/nvt
	      // tomo un lector del directorio
	      var directoryReader = dir.createReader();

	      // listo todos los ficheros
	      directoryReader.readEntries(function(entries) {
	                                      var i;
	                                      for (i=0; i<entries.length; i++) {
	                                          //tomo archivo por archivo
	                                          dir.getFile(entries[i].name, {create:false}, function(fileEntry) {
	                                                      //y borro el archivo
	                                                      fileEntry.remove(function(){
	                                                          //alert("archivo removido!");
	                                                      },function(error){
	                                                          alert("Problemas al borrar");
	                                                      },function(){
	                                                         alert("Archivo no existe");
	                                                      });
	                                          });
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
	});

	$("#txtNewRut").blur(function(e){
		var sql = "SELECT razons, direccion, comuna from en_cliente " +
    				  "where rutcli =" + $("#txtNewRut").val();
    	var db = window.sqlitePlugin.openDatabase({name: "envios.db"});

		db.executeSql(sql, [], function(rs){
		    if(rs.rows.length > 0){
		      alert("Rut existe");
		      $("#txtNewRut").focus();
		      return false;
			}
		}, function(error) {
			alert('Error en la consulta: ' + error.message);
			return false;
		});

		if ($("#txtNewDV").val().length>0){
			if (!validarRut($("#txtNewRut").val(), $("#txtNewDV").val())){
				alert("Rut inválido");
				return false;
			}	
		}
	});

	$("#txtNewDV").blur(function(e){
		if ($("#txtNewDV").val().length>0){
			if (!validarRut($("#txtNewRut").val(), $("#txtNewDV").val())){
				alert("Rut inválido");
				$("#txtNewRut").focus();
				return false;
			}	
		}
		else{
			alert("Ingrese DV");
			return false;
		}
	});

	$(".validarut").on("focus",function(){
		if($("#txtNewRut").val().length==0){
			alert("Ingrese RUT");
			$("#txtNewRut").focus();
			return false;
		}
		if($("#txtNewDV").val().length==0){
			alert("Ingrese Digito Verificador");
			$("#txtNewDV").focus();
			return false;
		}
		if (!validarRut($("#txtNewRut").val(), $("#txtNewDV").val())){
			alert("Rut inválido");
			$("#txtNewRut").focus();
			return false;
		}
	});

	$("#btnConfirmarCliente").click(function(e){
		if (!validarRut($("#txtNewRut").val(), $("#txtNewDV").val())){
			alert("Rut inválido");
			$("#txtNewRut").focus();
			return false;
		}
		var direccion = $("#txtNewDireccion").val();
		if(direccion.length >=50){
			alert("Dirección puede tener máximo 50 caracteres");
			$("#txtNewDireccion").focus();
			return false;
		}
		//valido que rut no exista
		var sql = "SELECT razons, direccion, comuna from en_cliente " +
    				  "where rutcli = " + $("#txtNewRut").val();
    	var db = window.sqlitePlugin.openDatabase({name: "envios.db"});
		db.executeSql(sql, [], function(rs){
		    if(rs.rows.length > 0){
		      alert("Rut existe");
		      return false;
			}
			else{
				//valido que el giro ingresado exista
				var sql = "SELECT desval from de_dominio " +
							  "where coddom = 8 " +
		    				  "and desval = '" + $("#cmbNewGiro").val() + "'";
		    	var db = window.sqlitePlugin.openDatabase({name: "envios.db"});
				db.executeSql(sql, [], function(rs){
				    if(rs.rows.length == 0){
				      alert("Giro no existe");
				      return false;
					}
					else{
						//inserto cliente
						var query = "INSERT INTO EN_CLIENTE(RUTCLI, DV, RAZONS, DIRECCION, COMUNA," +
														   "CIUDAD, TELEFONO, CODVEN, GIRO, CONTAC, OBSERV, FACTURABLE, FORPAG, PLAPAG, LISPRE) " +
														   "VALUES(?,?,?,?,?,?,?,?,?,?,?,?,1,1,1)";
						db = window.sqlitePlugin.openDatabase({name: "envios.db"});

						var dv = $("#txtNewDV").val();
						if(dv == "k"){
							dv = "K";
						}
						db.executeSql(query, [$("#txtNewRut").val(), dv,$("#txtNewRazons").val(),
											  $("#txtNewDireccion").val(),$("#cmbNewComuna").val(), $("#cmbNewCiudad").val(),
											  $("#txtNewFono").val(), window.localStorage.getItem("codven"), $("#cmbNewGiro").val(),
											  $("#txtNewContacto").val(), $("#txtNewObservacion").val(), "S"], function(rs) {
							//alert(JSON.stringify(rs));
						    if(rs.rowsAffected == 0){
						      alert("Error al ingresar Cliente");
						      return false;
						    }
						    else{
						    	alert("Cliente Ingresado");
						    	$("#txtRutcli").val($("#txtNewRut").val());
						    	limpiarFicha();
						    	$('#btnCancelarCliente').trigger("click");
						    	buscarClienteModal($("#txtRutcli").val(), false);
						    }
						  }, function(error) {
						    alert('Error en la consulta: ' + error.message);
						  });
					}
				}, function(error) {
					alert('Error en la consulta: ' + error.message);
					return false;
				});
			}
		}, function(error) {
			alert('Error en la consulta: ' + error.message);
			return false;
		});
	});

	$("#btnNuevoCliente").click(function(e){
		$('#modalNuevoCliente').modal('toggle');
	});

	$(".btnCargarBase").click(function(e){
		cargaBase();
	});

	$("#btnVerDeuda").click(function(e){
		$('#modalDeuda').modal('toggle');
		cargarDeuda();
	});

	$("#btnCerrarDeuda").click(function(e){
		$('#modalDeuda').modal('toggle');
	});

	$("#btnCancelarCliente").click(function(e){
		limpiarFicha();
	})

	$("#btnProductos").click(function(e){
		iniciarNota();
	});

	$("#btnCerrarMensaje").click(function(e){
		$("#modalMensaje").modal("hide");
		$("#modalGuardar").modal('hide');
		$("#modalCodpro").modal('toggle');
		$("#modalTxtCodpro").focus();
	});

	function mostrarMensaje(mensaje){
		$("#modalMensaje").modal("show");
		$("#lblMensaje").text(mensaje);
	}

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

	document.addEventListener("backbutton", function(e) { 
   		e.preventDefault(); 
   		return false;
	}, false);  


}, false);