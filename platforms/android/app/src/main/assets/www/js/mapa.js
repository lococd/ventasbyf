//funciones GMaps
var geocoder;
var map;
var apikey = 'AIzaSyBn68EL8wFjvBhngKLbYRgtvG2ABvM0drw';
function inicializarMapa(dir) {
  alert(dir);
  geocoder = new google.maps.Geocoder();
  var myOptions = {
    zoom: 17,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  }
  map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
codDireccion(dir);
}

function codDireccion(direccion) {
  var address = direccion;
  geocoder.geocode({ 'address': address }, verDireccion);
}

function verDireccion (results,status){
    if (status == google.maps.GeocoderStatus.OK) {
      
      map.setCenter(results[0].geometry.location);
      var marker = new google.maps.Marker({
          map: map, 
          position: results[0].geometry.location
      });
      var position = results[0].geometry.location;
      /*geo = document.createElement('label');
      geo.type = "label";
      geo.id = "geo";
      geo.innerHTML = position;
      document.getElementById('contgeo').appendChild(geo);*/
    } else {
      alert("La ubicación no es correcta,\n corregir por favor: " + status);
    }
}