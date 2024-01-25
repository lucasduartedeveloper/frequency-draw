var uploadAlert = new Audio("audio/ui-audio/upload-alert.wav");
var warningBeep = new Audio("audio/warning_beep.wav");

var sw = 360; //window.innerWidth;
var sh = 669; //window.innerHeight;

var audioBot = true;
var playerId = new Date().getTime();

var canvasBackgroundColor = "rgba(255,255,255,1)";
var backgroundColor = "rgba(50,50,65,1)";
var buttonColor = "rgba(75,75,90,1)";

// Botão de gravação
$(document).ready(function() {
    $("html, body").css("overscroll-behavior", "none");
    $("html, body").css("overflow", "hidden");
    $("html, body").css("background", "#000");

    $("#title").css("font-size", "15px");
    $("#title").css("color", "#fff");
    $("#title").css("top", "10px");
    $("#title").css("z-index", "25");

    // O outro nome não era [  ]
    // Teleprompter
    $("#title")[0].innerText = ""; //"PICTURE DATABASE"; 
    $("#title")[0].onclick = function() {
        var text = prompt();
        sendText(text);
    };

    if (window.innerWidth > window.innerHeight) {
        sw = window.innerWidth;
        sh = window.innerHeight;
        gridSize = 20;
    }

    tileSize = (sw/7);

    pictureView = document.createElement("canvas");
    pictureView.style.position = "absolute";
    pictureView.style.background = "#fff";
    pictureView.width = (sw);
    pictureView.height = (sh); 
    pictureView.style.left = (0)+"px";
    pictureView.style.top = (0)+"px";
    pictureView.style.width = (sw)+"px";
    pictureView.style.height = (sh)+"px";
    pictureView.style.zIndex = "15";
    document.body.appendChild(pictureView);

    mapEnabled = false;
    mapView = document.createElement("div");
    mapView.style.position = "absolute";
    mapView.style.display = mapEnabled ? "initial" : "none";
    mapView.id = "map";
    mapView.className = "map-box";
    mapView.style.background = "#fff";
    mapView.style.left = (0)+"px";
    mapView.style.top = (0)+"px";
    mapView.style.width = (sw)+"px";
    mapView.style.height = (sh)+"px";
    mapView.style.zIndex = "35";
    document.body.appendChild(mapView);

    startMap();

    mapToggleView = document.createElement("button");
    mapToggleView.style.position = "absolute";
    mapToggleView.style.color = "#000";
    mapToggleView.innerText = "MAP";
    mapToggleView.style.fontFamily = "Khand";
    mapToggleView.style.fontSize = "20px";
    mapToggleView.style.left = (sw-60)+"px";
    mapToggleView.style.top = (45)+"px";
    mapToggleView.style.width = (50)+"px";
    mapToggleView.style.height = (50)+"px";
    mapToggleView.style.zIndex = "35";
    document.body.appendChild(mapToggleView);

    mapToggleView.onclick = function() {
        mapEnabled = !mapEnabled;

        mapView.style.display = mapEnabled ? "initial" : "none";
        map.invalidateSize();
    };

    currentValueView = document.createElement("span");
    currentValueView.style.position = "absolute";
    currentValueView.style.color = "#fff";
    currentValueView.innerText = "0.00";
    currentValueView.style.fontFamily = "Khand";
    currentValueView.style.fontSize = "20px";
    currentValueView.style.left = (10)+"px";
    currentValueView.style.top = (10)+"px";
    currentValueView.style.width = (100)+"px";
    currentValueView.style.height = (25)+"px";
    //currentValueView.style.border = "1px solid white";
    //currentValueView.style.borderRadius = "25px";
    currentValueView.style.zIndex = "15";
    document.body.appendChild(currentValueView);

    periodLength = 15000;
    periodLengthView = document.createElement("span");
    periodLengthView.style.position = "absolute";
    periodLengthView.style.color = "#fff";
    periodLengthView.innerText = periodLength+" ms";
    periodLengthView.style.textAlign = "center";
    periodLengthView.style.fontFamily = "Khand";
    periodLengthView.style.fontSize = "20px";
    periodLengthView.style.left = ((sw/2)-50)+"px";
    periodLengthView.style.top = (10)+"px";
    periodLengthView.style.width = (100)+"px";
    periodLengthView.style.height = (25)+"px";
    periodLengthView.style.zIndex = "15";
    document.body.appendChild(periodLengthView);

    periodLengthView.onclick = function() {
        var input = 
        prompt("Period length: ", periodLength);

        var value = parseInt(input);
        //if (!value) return;

        periodLength = value;
        periodLengthView.innerText = periodLength+" ms";
    };

    predictionCount = 0;
    correctPredictionCountView = 
    document.createElement("span");
    correctPredictionCountView.style.position = "absolute";
    correctPredictionCountView.style.color = "#fff";
    correctPredictionCountView.innerText = 
    predictionCount;
    correctPredictionCountView.style.textAlign = "right";
    correctPredictionCountView.style.fontFamily = "Khand";
    correctPredictionCountView.style.fontSize = "20px";
    correctPredictionCountView.style.left = (sw-60)+"px";
    correctPredictionCountView.style.top = (10)+"px";
    correctPredictionCountView.style.width = (50)+"px";
    correctPredictionCountView.style.height = (25)+"px";
    correctPredictionCountView.style.zIndex = "15";
    document.body.appendChild(correctPredictionCountView);

    correctPredictionIconView = 
    document.createElement("i");
    correctPredictionIconView.style.position = "absolute";
    correctPredictionIconView.style.color = "#fff";
    correctPredictionIconView.className = 
    "fa-solid fa-gear";
    correctPredictionIconView.style.textAlign = "left";
    correctPredictionIconView.style.fontSize = "20px";
    correctPredictionIconView.style.left = (sw-60)+"px";
    correctPredictionIconView.style.top = (10)+"px";
    correctPredictionIconView.style.width = (50)+"px";
    correctPredictionIconView.style.height = (25)+"px";
    correctPredictionIconView.style.zIndex = "15";
    document.body.appendChild(correctPredictionIconView);

   colorPalletes = [ 
       [ "#5f5", "#f55" ],
       [ "orange", "purple" ],
       [ "#fff", "#999" ]
    ];
    colorPalleteNo = 0;

    correctPredictionIconView.onclick = function() {
        var input = 
        prompt("Color pallete: \n"+
        "0 - green/red \n"+
        "1 - orange/purple \n"+
        "2 - white/gray", 
        colorPalleteNo);

        var value = parseInt(input);
        if (value < 0 || value > (colorPalletes.length-1)) return;

        colorPalleteNo = value;
    };

    var startX = 0;
    var startY = 0;
    var moveX = 0;
    var moveY = 0;

    prediction = {
        positionY: -1,
        startValue: 0,
        value: 0,
        direction: 0,
        ready: false,
        met: false,
        openValue: 0
    };

    var ontouch = false;
    var pictureView_touchstart = function(e) {
        ontouch = true;
        if (e.touches) {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;

            if (e.touches.length > 1) {
                ontouch = false;
                prediction.positionY = -1;
                return;
            }
        }
        else {
            voice_no = 2;
            voicesLoaded = true;

            startX = e.clientX;
            startY = e.clientY;

            if (e.button == 2) {
                ontouch = false;
                prediction.positionY = -1;
                return;
            }
        }

        prediction.ready = false;
        prediction.met = false;
        prediction.openValue = 0;

        var y = startY;
        if (startY < (sh/2)-((sw/gridSize)*2))
        y = (sh/2)-((sw/gridSize)*2);

        if (startY > (sh/2)+((sw/gridSize)*2))
        y = (sh/2)+((sw/gridSize)*2);

        prediction.positionY = y;
        prediction.startValue = 
        (1/((sw/gridSize)* 4)) * (((sh/2)+((sw/gridSize)*2))-y);
        prediction.value = 
        (1/((sw/gridSize)* 4)) * (((sh/2)+((sw/gridSize)*2))-y);
        prediction.direction = 0;
    };

    pictureView_touchmove= function(e) {
        if (!ontouch) return;
        if (e.touches) {
            moveX = e.touches[0].clientX;
            moveY = e.touches[0].clientY;
        }
        else {
            moveX = e.clientX;
            moveY = e.clientY;
        }

        var y = moveY;
        if (moveY < (sh/2)-((sw/gridSize)*2))
        y = (sh/2)-((sw/gridSize)*2);

        if (moveY > (sh/2)+((sw/gridSize)*2))
        y = (sh/2)+((sw/gridSize)*2);

        prediction.positionY = y;
        prediction.value = 
        (1/((sw/gridSize)* 4)) * (((sh/2)+((sw/gridSize)*2))-y);
    };

    pictureView_touchend = function(e) {
        if (!ontouch) return;
        prediction.ready = true;
        ontouch = false;
    };

    pictureView.ontouchstart = pictureView_touchstart;
    pictureView.ontouchmove = pictureView_touchmove;
    pictureView.ontouchend = pictureView_touchend;

    pictureView.onmousedown = pictureView_touchstart;
    pictureView.onmousemove = pictureView_touchmove;
    pictureView.onmouseup = pictureView_touchend;

    micAvgValue = 0;

    mic = new EasyMicrophone();
    mic.onsuccess = function() { 
        console.log("mic open");
    };
    mic.onupdate = function(freqArray, reachedFreq, avgValue) {
        micAvgValue = avgValue;

        var frequency = ((1/250)*reachedFreq);

        if (websocketBot.messageRequested)
        websocketBot.sendUsage(frequency);

        updateValue(frequency);
    };
    mic.onclose = function() { 
        console.log("mic closed");
    };

    buttonMicView = document.createElement("button");
    buttonMicView.style.position = "absolute";
    buttonMicView.style.color = "#000";
    buttonMicView.innerText = "mic: off";
    buttonMicView.style.fontFamily = "Khand";
    buttonMicView.style.fontSize = "15px";
    buttonMicView.style.left = (10)+"px";
    buttonMicView.style.top = (sh-35)+"px";
    buttonMicView.style.width = (100)+"px";
    buttonMicView.style.height = (25)+"px";
    buttonMicView.style.border = "1px solid white";
    buttonMicView.style.borderRadius = "25px";
    buttonMicView.style.zIndex = "15";
    document.body.appendChild(buttonMicView);

    buttonMicView.onclick = function() {
        if (mic.closed) {
            mic.open(false, 1);
            buttonMicView.innerText = "mic: on";
        }
        else {
            mic.close();
            buttonMicView.innerText = "mic: off";
        }
    };

    drawingMode = 0;
    buttonModeView = document.createElement("button");
    buttonModeView.style.position = "absolute";
    buttonModeView.style.color = "#000";
    buttonModeView.innerText = 
    drawingMode == 0 ? "candlesticks" : "line";
    buttonModeView.style.fontFamily = "Khand";
    buttonModeView.style.fontSize = "15px";
    buttonModeView.style.left = (120)+"px";
    buttonModeView.style.top = (sh-35)+"px";
    buttonModeView.style.width = (100)+"px";
    buttonModeView.style.height = (25)+"px";
    buttonModeView.style.border = "1px solid white";
    buttonModeView.style.borderRadius = "25px";
    buttonModeView.style.zIndex = "15";
    document.body.appendChild(buttonModeView);

    buttonModeView.onclick = function() {
        drawingMode = 
        (drawingMode+1) < 2 ? (drawingMode+1) : 0;

        buttonModeView.innerText = 
        drawingMode == 0 ? "candlesticks" : "line";
    };

    buttonBuyView = document.createElement("button");
    buttonBuyView.style.position = "absolute";
    buttonBuyView.style.background = "#595";
    buttonBuyView.style.color = "#fff";
    buttonBuyView.innerText = "WILL ENTER";
    buttonBuyView.style.fontFamily = "Khand";
    buttonBuyView.style.fontSize = "15px";
    buttonBuyView.style.left = (sw-110)+"px";
    buttonBuyView.style.top = (sh-180)+"px";
    buttonBuyView.style.width = (100)+"px";
    buttonBuyView.style.height = (50)+"px";
    //buttonBuyView.style.border = "1px solid white";
    buttonBuyView.style.borderRadius = "5px";
    buttonBuyView.style.zIndex = "15";
    document.body.appendChild(buttonBuyView);

    buttonBuyView.onclick = function() {
        prediction.met = false;
        prediction.ready = true;
        prediction.direction = -1;
    };

    buttonSellView = document.createElement("button");
    buttonSellView.style.position = "absolute";
    buttonSellView.style.background = "#955";
    buttonSellView.style.color = "#fff";
    buttonSellView.innerText = "WILL LEAVE";
    buttonSellView.style.fontFamily = "Khand";
    buttonSellView.style.fontSize = "15px";
    buttonSellView.style.left = (sw-110)+"px";
    buttonSellView.style.top = (sh-120)+"px";
    buttonSellView.style.width = (100)+"px";
    buttonSellView.style.height = (50)+"px";
    //buttonBuyView.style.border = "1px solid white";
    buttonSellView.style.borderRadius = "5px";
    buttonSellView.style.zIndex = "15";
    document.body.appendChild(buttonSellView);

    buttonSellView.onclick = function() {
        prediction.met = false;
        prediction.ready = true;
        prediction.direction = 1;
    };

    exampleDataEnabled = false;
    buttonExampleDataView = document.createElement("button");
    buttonExampleDataView.style.position = "absolute";
    buttonExampleDataView.style.color = "#000";
    buttonExampleDataView.innerText = 
    exampleDataEnabled ? "test data: yes" : 
    "test data: no";
    buttonExampleDataView.style.fontFamily = "Khand";
    buttonExampleDataView.style.fontSize = "15px";
    buttonExampleDataView.style.left = (230)+"px";
    buttonExampleDataView.style.top = (sh-35)+"px";
    buttonExampleDataView.style.width = (100)+"px";
    buttonExampleDataView.style.height = (25)+"px";
    buttonExampleDataView.style.border = "1px solid white";
    buttonExampleDataView.style.borderRadius = "25px";
    buttonExampleDataView.style.zIndex = "15";
    document.body.appendChild(buttonExampleDataView);

    var exampleDataInterval = 0;
    buttonExampleDataView.onclick = function() {
        exampleDataEnabled = !exampleDataEnabled;
        buttonExampleDataView.innerText = 
        exampleDataEnabled ? "test data: yes" : 
        "test data: no";

        if (!exampleDataEnabled) {
            clearInterval(exampleDataInterval);
            frequencyPath = [{
                timestamp: 0,
                openValue: 0,
                highValue: 0,
                lowValue: 0,
                closeValue: 0,
                readingCount: 0,
                volumeValue: 0
            }];
            return;
        }

        var min = 0;
        var minArr = [ 0, (1/5), (2/5), (3/5), (4/5)];
        exampleDataInterval = setInterval(function() {
            var frequency = min + Math.random()*(1/5);
            updateValue(frequency, function() {
                min = minArr[Math.floor(Math.random()*5)];
            });
        }, 250);
    }

    lastMessageView = document.createElement("span");
    lastMessageView.style.position = "absolute";
    lastMessageView.style.color = "#fff";
    lastMessageView.innerText = 
    "Last message: "+
    moment(websocketBot.lastUpdate)
    .format("HH:mm:ss.SSS");
    lastMessageView.style.fontFamily = "Khand";
    lastMessageView.style.fontSize = "15px";
    lastMessageView.style.left = (10)+"px";
    lastMessageView.style.top = (sh-105)+"px";
    lastMessageView.style.width = (150)+"px";
    lastMessageView.style.height = (25)+"px";
    //lastMessageView.style.border = "1px solid white";
    //lastMessageView.style.borderRadius = "25px";
    lastMessageView.style.zIndex = "15";
    document.body.appendChild(lastMessageView);

    periodTimestampView = document.createElement("span");
    periodTimestampView.style.position = "absolute";
    periodTimestampView.style.color = "#fff";
    periodTimestampView.innerText = 
    "Period start: "+
    moment(frequencyPath[0].timestamp)
    .format("HH:mm:ss.SSS");
    periodTimestampView.style.fontFamily = "Khand";
    periodTimestampView.style.fontSize = "15px";
    periodTimestampView.style.left = (10)+"px";
    periodTimestampView.style.top = (sh-175)+"px";
    periodTimestampView.style.width = (150)+"px";
    periodTimestampView.style.height = (25)+"px";
    //lastMessageView.style.border = "1px solid white";
    //lastMessageView.style.borderRadius = "25px";
    periodTimestampView.style.zIndex = "15";
    document.body.appendChild(periodTimestampView);

    periodTimestampView.onclick = function() {
        console.clear();
        console.log(frequencyPath[0]);
    };

    periodOpenValueView = document.createElement("span");
    periodOpenValueView.style.position = "absolute";
    periodOpenValueView.style.color = "#fff";
    periodOpenValueView.innerText = 
    "Open value: "+frequencyPath[0].openValue.toFixed(2);
    periodOpenValueView.style.fontFamily = "Khand";
    periodOpenValueView.style.fontSize = "15px";
    periodOpenValueView.style.left = (10)+"px";
    periodOpenValueView.style.top = (sh-140)+"px";
    periodOpenValueView.style.width = (150)+"px";
    periodOpenValueView.style.height = (25)+"px";
    //lastMessageView.style.border = "1px solid white";
    //lastMessageView.style.borderRadius = "25px";
    periodOpenValueView.style.zIndex = "15";
    document.body.appendChild(periodOpenValueView);

    websocketBot.attachMessageHandler();
    loadImages();

    locationInterval = setInterval(function() {
        navigator.geolocation.getCurrentPosition(
        success, error, options);
    }, 1000);

    drawImage();
    animate();
});

var map;
var startMap = function() {
    // Create the map
    map = L.map("map").setView([-23.37062642645644,  -51.15587314318577], 18);

    var tileLayer = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: "",
        maxZoom: 20,
        id: "mapbox/streets-v11",
        tileSize: 512,
        zoomOffset: -1,
        accessToken: "pk.eyJ1IjoibHVjYXNkdWFydGUxOTkyIiwiYSI6ImNreGZieWE3ODFwNTQyb3N0cW4zNHMxMG8ifQ.HXS54wWrm6wPz-29LVVRbg"
    }).addTo(map);

    $(".leaflet-control-container").hide();
};

var markerArr = [];
var putMarker = function(playerId, lat, lon, isServer=false) {
    var search = markerArr.filter((o) => {
        return o.playerId == playerId;
    });

    var rnd = Math.random();
    var markerIcon= L.icon({
        iconUrl: isServer ? 
        "img/marker.png?rnd="+rnd : 
        "img/marker-b.png?rnd="+rnd,
        /*shadowUrl: '/img/icon-shadow.png',*/
        iconSize: [ 5, 5 ], // size of the icon
        shadowSize: [ 5, 5 ], // size of the shadow
        iconAnchor: [ 2.5, 2.5 ], // point of the icon which will correspond to marker's location
        shadowAnchor: [ 2.5, 2.5 ], // the same for the shadow
        popupAnchor: [ 2.5, 2.5 ] // point from which the popup should open relative to the iconAnchor
    });

    if (search.length > 0) {
        search[0].marker.setIcon(markerIcon);
        search[0].marker.setLatLng([ lat, lon ]);
        return;
    };

    var marker = 
    L.marker([ lat, lon ], { icon: markerIcon }).addTo(map);

    var obj = {
        playerId: playerId,
        isServer: isServer,
        marker: marker
    };
    markerArr.push(obj);
};

var websocketBot = {
    messageRequested: false,
    lastUpdate: 0,
    periodTimestamp: 0,
    sendUsage: function(value) {
        var obj = {
            timestamp: new Date().getTime(),
            frequencyData: frequencyPath[0],
            frequencyPath: frequencyPath
        };
        ws.send("PAPER|"+playerId+"|frequency-data|"+
        JSON.stringify(obj));
        this.messageRequested = false;
    },
    attachMessageHandler: function() {
        ws.onmessage = function(e) {
            var msg = e.data.split("|");
            //console.log(msg[2] + " from " + msg[1]);

            if (msg[0] == "PAPER" &&
                msg[1] != playerId &&
                msg[2] == "frequency-data") {
                var obj = JSON.parse(msg[3]);

                if (obj.timestamp < this.lastUpdate) return;
                this.lastUpdate = obj.timestamp;

                lastMessageView.innerText = 
                "Last message: "+
                moment(this.lastUpdate).format("HH:mm:ss.SSS")+
                " \n"+(new Date().getTime()-this.lastUpdate)+" ms"

                frequencyPath = obj.frequencyPath;

                ws.send("PAPER|"+playerId+"|data-missing");
            }
            else if (msg[0] == "PAPER" &&
                msg[1] != playerId &&
                msg[2] == "data-missing") {
                this.messageRequested = true;
            }
        }.bind(this);
        ws.send("PAPER|"+playerId+"|data-missing");
    }
};

var img_list = [
    "img/line-draw-0.png"
];

var imagesLoaded = false;
var loadImages = function(callback) {
    var count = 0;
    for (var n = 0; n < img_list.length; n++) {
        var img = document.createElement("img");
        img.n = n;
        img.onload = function() {
            count += 1;
            console.log("loading ("+count+"/"+img_list.length+")");
            img_list[this.n] = this;
            if (count == img_list.length) {
                imagesLoaded = true;
                //callback();
            }
        };
        var rnd = Math.random();
        img.src = img_list[n].includes("img") ? 
        img_list[n]+"?f="+rnd : 
        img_list[n];
    }
};

frequencyPath = [{
    timestamp: 0,
    openValue: 0,
    highValue: 0,
    lowValue: 0,
    closeValue: 0,
    readingCount: 0,
    volumeValue: 0
}];

var openValue = 0;
var highValue = 0;
var lowValue = 0;
var closeValue = 0;

var readingCount = 0;
var volumeValue = 0;

var updateValue = function(value, callback) {
    var frequency = value;
    var currentTime = new Date().getTime();

    if (frequencyPath[0].timestamp == 0) {
        frequencyPath[0].timestamp = currentTime;
        frequencyPath[0].openValue = frequency;
    }

    lastMessageView.innerText = 
    "Server time: "+
    moment(currentTime).format("HH:mm:ss.SSS");

    readingCount += 1;
    volumeValue += micAvgValue;

    if (frequency > highValue)
    highValue = frequency;

    if (frequency < lowValue)
    lowValue = frequency;

    frequencyPath[0].highValue = highValue;
    frequencyPath[0].lowValue = lowValue;
    frequencyPath[0].closeValue = frequency;

    frequencyPath[0].readingCount = readingCount;
    frequencyPath[0].volumeValue = 
    (volumeValue/readingCount);

    if (currentTime - frequencyPath[0].timestamp >= 
        periodLength) {
        closeValue = frequency;

        currentValueView.innerText = 
        closeValue.toFixed(2);

        // clip to last 100 periods
        if (frequencyPath.length > 99)
        frequencyPath.splice(99, (frequencyPath.length-99));

        // reset fixed fields
        openValue = closeValue;
        highValue = frequency;
        lowValue = frequency;
        closeValue = 0;

        readingCount = 0;
        volumeValue = 0;

        // start new period
        frequencyPath.splice(0, 0, { 
            timestamp: currentTime,
            openValue: openValue,
            highValue: highValue,
            lowValue: lowValue,
            closeValue: closeValue,
            readingCount: readingCount,
            volumeValue: (volumeValue/readingCount)
        });

        if (prediction.direction == -1 && 
            closeValue >= prediction.value) {

            if (closeValue > openValue) {
                predictionCount += 1;
            }

            prediction.met = true;
            prediction.direction = 0;
            prediction.ready = false;
            prediction.openValue = openValue;

            correctPredictionCountView.innerText = 
            predictionCount;
        }

        if (prediction.direction == 1 && 
            closeValue <= prediction.value) {

            if (openValue > closeValue) {
                predictionCount += 1;
            }

            prediction.met = true;
            prediction.direction = 0;
            prediction.ready = false;
            prediction.openValue = openValue;

            correctPredictionCountView.innerText = 
            predictionCount;
        }

        periodTimestampView.innerText = 
        "Period start: "+
        moment(frequencyPath[0].timestamp)
        .format("HH:mm:ss.SSS");

        periodOpenValueView.innerText = 
        "Open value: "+frequencyPath[0].openValue.toFixed(2);

        if (callback) callback();
    }
};

var toHertz = function(no) {
    return (no*250)*((24000)/512);
};

Math.curve = function(value, scale) {
    var c = {
        x: 0,
        y: 0
    };
    var p = {
        x: -1,
        y: 0
    };
    var rp = _rotate2d(c, p, (value*90));
    return rp.y*scale;
};

var gridSize = 10;

var drawImage = 
    function(angle=0, color="#000", gridColor="#333") {
    var currentColorPallete = colorPalletes[colorPalleteNo];

    var ctx = pictureView.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, sw, sh);

    ctx.save();
    ctx.translate((sw/2), (sh/2));
    ctx.rotate(angle);
    ctx.translate(-(sw/2), -(sh/2));

    ctx.fillStyle = color;
    ctx.fillRect(0, 0, sw, sh);

    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;

    for (var y = 0; y < Math.floor((sh/(sw/gridSize))); y++) {
        ctx.beginPath();
        ctx.moveTo(0, y*(sw/gridSize));
        ctx.lineTo(sw, y*(sw/gridSize));
        //ctx.stroke();
    }

    for (var x = 0; x <= gridSize; x++) {
        ctx.beginPath();
        ctx.moveTo(x*(sw/gridSize), 0);
        ctx.lineTo(x*(sw/gridSize), sh);
        //ctx.stroke();
    }

    ctx.lineWidth = 1;
    ctx.strokeStyle = "#555";

    ctx.beginPath();
    ctx.moveTo(0, (sh/2));
    ctx.lineTo(sw, (sh/2));
    ctx.stroke();

    ctx.lineWidth = 0.5;

    ctx.beginPath();
    ctx.moveTo(0, (sh/2)-(sw/gridSize));
    ctx.lineTo(sw, (sh/2)-(sw/gridSize));
    ctx.stroke();

    ctx.save();
    ctx.beginPath();
    ctx.rect((sw/2)-(sw/4), (sh/2)-(sw/2), (sw/2), 0);
    ctx.clip();

    var image = img_list[0];
    var size = {
        width: image.naturalWidth,
        height: image.naturalHeight
    };
    var frame = {
        width: getSquare(image),
        height: getSquare(image)
    };
    var format = fitImageCover(size, frame);

    if (imagesLoaded)
    ctx.drawImage(image, 
    -format.left, 0, format.width, format.height, 
    (sw/2)-(sw/4), 
    (sh/2)+(sw/4)-(frequencyPath[0].closeValue*(sw/2)), 
    (sw/2), (sw/2));

    ctx.restore();

    ctx.beginPath();
    ctx.moveTo(0, (sh/2)+(sw/gridSize));
    ctx.lineTo(sw, (sh/2)+(sw/gridSize));
    ctx.stroke();

    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo((sw/2)-5, 
    (sh/2)-((frequencyPath[0].closeValue-0.5)*((sw/gridSize)*4)));
    ctx.lineTo(sw, 
    (sh/2)-((frequencyPath[0].closeValue-0.5)*((sw/gridSize)*4)));
    ctx.stroke();

    ctx.beginPath();
    ctx.rect(sw-(sw/4)-80, 
    (sh/2)-((frequencyPath[0].closeValue-0.5)*((sw/gridSize)*4))-10, 50, 20);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#fff";
    ctx.font = "15px sans serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(frequencyPath[0].closeValue.toFixed(2), 
    sw-(sw/4)-55, 
    (sh/2)-((frequencyPath[0].closeValue-0.5)*((sw/gridSize)*4)));

    if (imagesLoaded)
    ctx.drawImage(image, 
    -format.left, 0, format.width, format.height, 
    (sw)-(sw/4)-25, 
    prediction.positionY-60, 
    50, 50);

    if (prediction.positionY != -1) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#555";

        if (prediction.direction == -1)
        ctx.strokeStyle = currentColorPallete[0];
        if (prediction.direction == 1)
        ctx.strokeStyle = currentColorPallete[1];

        ctx.beginPath();
        ctx.moveTo(sw-(sw/4), prediction.positionY);
        ctx.lineTo(sw-(sw/4), 
        (sh/2)-((frequencyPath[0].closeValue-0.5)*((sw/gridSize)*4)));
        if (!prediction.met)
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(sw-(sw/4), prediction.positionY);
        ctx.lineTo(sw, prediction.positionY);
        ctx.stroke();

        ctx.fillStyle = "#000";

        ctx.beginPath();
        ctx.rect(!prediction.met ? sw-(sw/4)-25 : sw-(sw/4)+30,
        prediction.positionY-10, 50, 20);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#fff";
        ctx.font = "15px sans serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(prediction.value.toFixed(2), 
        !prediction.met ? sw-(sw/4) : sw-(sw/4)+55, 
        prediction.positionY);

        ctx.strokeStyle = "#555";
        ctx.fillStyle = "#000";

        if (prediction.met) {
            ctx.fillStyle = "#000";
            if (prediction.correct)
            ctx.strokeStyle = "#55f";
            else 
            ctx.strokeStyle = "#555";

            ctx.beginPath();
            ctx.rect(sw-(sw/4)-25, prediction.positionY-10, 50, 20);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = "#fff";
            ctx.font = "15px sans serif";
             ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(prediction.openValue.toFixed(2), 
            sw-(sw/4), prediction.positionY);
        }
    }

    if (drawingMode == 0)
    for (var n = 0; n < frequencyPath.length; n++) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#555";

        ctx.beginPath();
        ctx.moveTo(
        (sw/2)-(n*20), 
        (sh/2)-((frequencyPath[n].highValue-0.5)*((sw/gridSize)*4)));
        ctx.lineTo(
        (sw/2)-(n*20), 
        (sh/2)-((frequencyPath[n].lowValue-0.5)*((sw/gridSize)*4)));
        ctx.stroke();

        ctx.lineWidth = 10;

        if (frequencyPath[n].openValue < frequencyPath[n].closeValue)
        ctx.strokeStyle = currentColorPallete[0];
        else
        ctx.strokeStyle = currentColorPallete[1];

        ctx.beginPath();
        ctx.moveTo(
        (sw/2)-(n*20),
        (sh/2)-((frequencyPath[n].openValue-0.5)*((sw/gridSize)*4)));
        ctx.lineTo(
        (sw/2)-(n*20), 
        (sh/2)-((frequencyPath[n].closeValue-0.5)*((sw/gridSize)*4)));
        ctx.stroke();

        var flipped = 
        frequencyPath[n].openValue > frequencyPath[n].closeValue;

        var top = !flipped ? 
        (sh/2)-((frequencyPath[n].closeValue-0.5)*((sw/gridSize)*4)) : 
        (sh/2)-((frequencyPath[n].openValue-0.5)*((sw/gridSize)*4));

        var height = !flipped ? 
        (frequencyPath[n].closeValue-
        frequencyPath[n].openValue)*((sw/gridSize)*4) : 
        (frequencyPath[n].openValue-
        frequencyPath[n].closeValue)*((sw/gridSize)*4);

        ctx.lineWidth = 2;
        ctx.strokeStyle = "#000";

        ctx.beginPath();
        ctx.rect((sw/2)-(n*20)-5, top, 10, height);
        //ctx.stroke();
    }

    if (drawingMode == 1) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#fff";
        ctx.lineJoin = "round";
        ctx.lineCap = "round";

        ctx.beginPath();
        ctx.moveTo(
        (sw/2), 
        (sh/2)-((frequencyPath[0].closeValue-0.5)*((sw/gridSize)*4)));
        for (var n = 1; n < frequencyPath.length; n++) {
            ctx.lineTo(
            (sw/2)-(n*10), 
            (sh/2)-((frequencyPath[n].closeValue-0.5)*((sw/gridSize)*4)));
        }
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(
        (sw/2), 
        (sh/2)-((frequencyPath[0].closeValue-0.5)*((sw/gridSize)*4)), 2.5, 0, (Math.PI*2));
        ctx.fill();

        // Create gradient
        var grd = 
        ctx.createLinearGradient((sw/2), (sh/2)-((sw/gridSize)*2), 
        (sw/2), (sh/2)+((sw/gridSize)*2));

        grd.addColorStop(0, "#fff");
        grd.addColorStop(1, "rgba(255, 255, 255, 0)");

        // Fill with gradient
        ctx.fillStyle = grd;

        ctx.beginPath();
        ctx.moveTo(
        (sw/2)-((frequencyPath.length-1)*10), 
        (sh/2)+((sw/gridSize)*2));
        ctx.lineTo((sw/2), (sh/2)+((sw/gridSize)*2));
        ctx.lineTo(
        (sw/2), 
        (sh/2)-((frequencyPath[0].closeValue-0.5)*((sw/gridSize)*4)));
        for (var n = 1; n < frequencyPath.length; n++) {
            ctx.lineTo(
            (sw/2)-(n*10), 
            (sh/2)-((frequencyPath[n].closeValue-0.5)*((sw/gridSize)*4)));
        }
        ctx.closePath();
        ctx.fill();
    }

    ctx.restore();
};

var updateImage = true;

var updateTime = 0;
var renderTime = 0;
var elapsedTime = 0;
var animationSpeed = 0;

var animate = function() {
    elapsedTime = new Date().getTime()-renderTime;
    if (!backgroundMode) {
        if ((new Date().getTime() - updateTime) > 1000) {
            updateTime = new Date().getTime();
        }
        drawImage();
    }
    renderTime = new Date().getTime();
    requestAnimationFrame(animate);
};

var alertTime = 0;
var lightTime = 0;

var lightAmmount = 0;
var deviceUsed = false;

var ambientLight_topValue = 0;
var ambientLight_currentValue = 0;

window.addEventListener("devicelight", function(e) {
    if (backgroundMode) return;

    ambientLight_topValue = 
    ambientLight_topValue < e.value ? 
    e.value : ambientLight_topValue;

    ambientLight_currentValue = 
    (1/ambientLight_topValue)*e.value;

    updateValue(ambientLight_currentValue);

    var elapsedTime = new Date().getTime() - lightTime;
    //console.clear();
    //console.log(lightAmmount, e.value, elapsedTime);

    if (Math.abs(e.value-lightAmmount) > 50) {
        lightTime = new Date().getTime();

        //console.log(
        //Math.floor(elapsedTime/1000) + " seconds ago");

        if (elapsedTime > 0 && elapsedTime < 86400000 &&
            new Date().getTime() - alertTime > 30000) {
            alertTime = new Date().getTime();

            say(toTimestamp(elapsedTime));
        }
    }

    lightAmmount = e.value;
});

var toTimestamp = function(ms, lang=language) {
    var hours = Math.floor(((ms/1000)/60)/60)%24;
    var minutes = Math.floor((ms/1000)/60)%60;
    var seconds = Math.floor(ms/1000)%60;

    var text = "";
    if (lang == "pt-BR") {
        if (hours > 0)
        text += hours + " hora"+(hours > 1 ? "s" : "");

        if (hours > 0 && (minutes > 0 && seconds > 0))
        text += ", ";
        else if (hours > 0 && (minutes > 0 || seconds > 0))
        text += " e ";

        if (minutes > 0)
        text += minutes + " minuto"+(minutes > 1 ? "s" : "");

        if (minutes > 0 && seconds > 0)
        text += " e ";

        if (seconds > 0)
        text += seconds + " segundo"+(seconds > 1 ? "s" : "");

        text += " atrás";
    }
    else {
        if (hours > 0)
        text += hours + " hour"+(hours > 1 ? "s" : "");

        if (hours > 0 && (minutes > 0 && seconds > 0))
        text += ", ";
        else if (hours > 0 && (minutes > 0 || seconds > 0))
        text += " and ";

        if (minutes > 0)
        text += minutes + " minute"+(minutes > 1 ? "s" : "");

        if (minutes > 0 && seconds > 0)
        text += " and ";

        if (seconds > 0)
        text += seconds + " second"+(seconds > 1 ? "s" : "");

        text += " ago";
    }

    return text;
};

var fitImageCover = function(img, frame) {
    var obj = {
        left: 0,
        top: 0,
        width: 0,
        height: 0
    };

    var left, top, width, height;

    var img_aspectRatio = img.width/img.height;
    var frame_aspectRatio = frame.width/frame.height;

    if (frame_aspectRatio > img_aspectRatio) {
        width = frame.width;
        height = (img.height/img.width)*frame.width;

        left = 0;
        top = -(height-frame.height)/2;
    }
    else {
        height = frame.height;
        width = (img.width/img.height)*frame.height;

        top = 0;
        left = -(width-frame.width)/2;
    }

    obj.left = left;
    obj.top = top;
    obj.width = width;
    obj.height = height;

    return obj;
};

var getSquare = function(item) {
    var width = item.naturalWidth ? 
    item.naturalWidth : item.width;
    var height = item.naturalHeight ? 
    item.naturalHeight : item.height;

    return width < height ? width : height;
};

var visibilityChange;
if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
  visibilityChange = "visibilitychange";
} else if (typeof document.msHidden !== "undefined") {
  visibilityChange = "msvisibilitychange";
} else if (typeof document.webkitHidden !== "undefined") {
  visibilityChange = "webkitvisibilitychange";
}
//^different browsers^

var backgroundMode = false;
document.addEventListener(visibilityChange, function(){
    backgroundMode = !backgroundMode;
    if (backgroundMode) {
        console.log("backgroundMode: "+backgroundMode);
    }
    else {
        console.log("backgroundMode: "+backgroundMode);
    }
}, false);