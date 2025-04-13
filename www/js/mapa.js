//funciones GMaps
var geocoder;
var map;
var apikey = 'AIzaSyBn68EL8wFjvBhngKLbYRgtvG2ABvM0drw';

  function inicializarMapa(dir) {
    document.getElementById('iframe-mapa').src = `https://www.google.com/maps/embed/v1/place?key=${apikey}&q=${encodeURIComponent(dir)}`;
    document.getElementById('iframe-mapa').contentWindow.location.reload();
  }