var options = {
    enableHighAccuracy: true,
    timeout: 1000,
    maximumAge: 0,
};

var logLocation = function(pos) {
    console.log("Your current position is:");
    console.log(`Latitude : ${crd.latitude}`);
    console.log(`Longitude: ${crd.longitude}`);	
    console.log(`More or less ${crd.accuracy} meters.`);

    locationName(crd.latitude, crd.longitude);
};

function success(pos) {
    var crd = pos.coords;

    latitude = crd.latitude;
    longitude = crd.longitude;

    if (!map) return;

    map.setView([ 
        crd.latitude, 
        crd.longitude
    ], map.zoom);

    putMarker(playerId, crd.latitude, crd.longitude, !mic.closed);
}

function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

navigator.geolocation.getCurrentPosition(success, error, options);

var latitude = -23.37062642645644;
var longitude = -51.15587314318577;

var locationName = function(lat, lon) {
    if (latitude == lat && longitude == lon)
    //if (latitude == lat && longitude == lon) 
    return;

    latitude = lat;
    longitude = lon;

    $.getJSON("https://nominatim.openstreetmap.org/reverse?lat="+latitude+"&lon="+longitude+"&format=json", function(data) {
         //say("Estamos próximos à " + data.display_name);
    });
};

var say = function(text) {
    console.log(text);
};