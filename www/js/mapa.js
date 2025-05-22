//funciones GMaps
var geocoder;
var map;
var apikey = 'AIzaSyBn68EL8wFjvBhngKLbYRgtvG2ABvM0drw';

function inicializarMapa(dir) {
  geocoder = new L.Control.Geocoder.Nominatim();
  if (map) {
    map.remove();
  }
  map = L.map('mapa').setView([0, 0], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  results = geocoder.geocode(dir);
  results.then(function(results) {
    if (results && results.length > 0) {
    var result = results[0];
    map.setView(result.center, 13);
    L.marker(result.center).addTo(map).bindPopup(result.name).openPopup();
    return true;
    } else {
    alert('Dirección no encontrada');
    return false;
    }
  });
  return true;
}