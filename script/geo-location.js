var options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
};

function success(pos) {
    var crd = pos.coords;

    console.log("Your current position is:");
    console.log(`Latitude : ${crd.latitude}`);
    console.log(`Longitude: ${crd.longitude}`);	
    console.log(`More or less ${crd.accuracy} meters.`);

    locationName(crd.latitude, crd.longitude);
    map.setView([ 
        crd.latitude, 
        crd.longitude
    ], 18);
}

function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
}

navigator.geolocation.getCurrentPosition(success, error, options);

var latitude = 0;
var longitude = 0;

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