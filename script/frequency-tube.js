var uploadAlert = new Audio("audio/ui-audio/upload-alert.wav");
var warningBeep = new Audio("audio/warning_beep.wav");

var sw = 360; //window.innerWidth;
var sh = 669; //window.innerHeight;

var gridSize = 10;

if (window.innerWidth > window.innerHeight) {
    sw = window.innerWidth;
    sh = window.innerHeight;
    gridSize = 20;
}

var queryString = window.location.search;
var urlParams = new URLSearchParams(queryString);
if (urlParams.has("height"))
sh = parseInt(urlParams.get("height"));

var audioBot = true;
var playerId = new Date().getTime();

var canvasBackgroundColor = "rgba(255,255,255,1)";
var backgroundColor = "rgba(50,50,65,1)";
var buttonColor = "rgba(75,75,90,1)";

var audioStream = 
new Audio("audio/music/stream-0.wav");

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

    frequencyArr = 
    [ 246.94, 
      261.63, 293.66, 329.63, 349.23, 392, 440, 493.88, 523.25, 
      587.33 ];
    frequencyNo = 0;

    var startX = 0;
    var startY = 0;

    userInteracted = false;
    oscillatorStarted = false;
    pictureView.ontouchstart = function(e) {
        if (userInteracted && mic.closed) mic.open(false, 1);
        if (userInteracted && !oscillatorStarted) {
            oscillator.start();
            oscillatorStarted = true;
        }

        var no = 
        (1/sw)*(e.touches[0].clientY-((sh/2)-(sw/2)));
        no = Math.round((1-no)*10);

        frequencyNo = no;
        oscillator.frequency.value = frequencyArr[no];
    }

    pictureView.ontouchend= function() {
        userInteracted = true;
        oscillator.frequency.value = 0;
    }

    oscillator = createOscillator();
    oscillator.frequency.value = 100;

    micReachedValue = 0;
    micAvgValue = 1;
    micReachedFreq = 0;

    mic = new EasyMicrophone();
    mic.onsuccess = function() { 
        console.log("mic open");
    };
    mic.onupdate = function(freqArray, reachedFreq, avgValue) {
        micAvgValue = avgValue;

        if (micAvgValue > micReachedValue)
        micReachedValue = micAvgValue;

        if (micReachedFreq > reachedFreq)
        micReachedFreq = reachedFreq;

        //console.log(micAvgValue, micReachedFreq);
    };
    mic.onclose = function() { 
        console.log("mic closed");
    };

    remoteMotionPath = [
        { x: 0, y: 0, z: 0 }
    ];
    motionPath = [ 
        { x: 0, y: 0, z: 0 }
    ];

    lastMotionTime = 0;
    motion = true;
    gyroUpdated = function(e) {
        var currentTime = new Date().getTime();

        var accX = (1/9.8)*e.accX;
        var accY = (1/9.8)*e.accY;
        var accZ = (1/9.8)*e.accZ;

        motionPath[0].x = accX;
        motionPath[0].y = accY;
        motionPath[0].z = accZ;

        if (currentTime - lastMotionTime > (1000/30)) {
            var obj = { x: accX, y: accY, z: accZ };

            if (motionPath.length >= (30*60))
            motionPath.splice((motionPath.length-2), 1);

            motionPath.splice(0, 0, obj);
            lastMotionTime = currentTime;

            if (currentTime - websocketBot.lastUpload > 250)
            websocketBot.sendUsage();
        }
    };

    websocketBot.attachMessageHandler();

    drawImage();
    animate();
});

var websocketBot = {
    messageRequested: false,
    lastUpdate: 0,
    periodTimestamp: 0,
    lastUpload: 0,
    sendUsage: function(value) {
        var currentTime = new Date().getTime();

        var obj = {
            timestamp: currentTime,
            motionPath: motionPath
        };
        ws.send("PAPER|"+playerId+"|acc-data|"+
        JSON.stringify(obj));

        this.lastUpload = currentTime;
        this.messageRequested = false;
    },
    attachMessageHandler: function() {
        ws.onmessage = function(e) {
            var msg = e.data.split("|");
            //console.log(msg[2] + " from " + msg[1]);

            if (msg[0] == "PAPER" &&
                msg[1] != playerId &&
                msg[2] == "acc-data") {
                var obj = JSON.parse(msg[3]);

                var currentTime = new Date().getTime();

                if (obj.timestamp < this.lastUpdate) return;

                remoteMotionPath = obj.motionPath;
            }
        }.bind(this);
        ws.send("PAPER|"+playerId+"|data-missing|"+
        JSON.stringify({ lat: latitude, lon: longitude }));
    }
};

Math.curve = function(value, scale=1) {
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

        oscillator.volume.gain.value = 
        ((frequencyNo+1)/10) < micAvgValue ? 0.1 : 0;

        drawImage();
    }
    renderTime = new Date().getTime();
    requestAnimationFrame(animate);
};

var distance = 0;
var drawImage = 
    function(angle=0, color="#000", gridColor="#333") {
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
    ctx.strokeStyle = "#fff";
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";

    ctx.beginPath();
    ctx.moveTo((sw/2), (sh/2)-(sw/2));
    ctx.lineTo((sw/2), (sh/2)+(sw/2));
    ctx.stroke();

    for (var n = 0; n < 10; n++) {
        ctx.beginPath();
        ctx.moveTo((sw/2)-(sw/4), (sh/2)+(sw/2)-(n*(sw/10)));
        ctx.lineTo((sw/2)+(sw/4), (sh/2)+(sw/2)-(n*(sw/10)));
        ctx.stroke();

        if (((n+1)/10) <= micAvgValue) {
            ctx.beginPath();
            ctx.rect((sw/2)-(sw/4), (sh/2)+(sw/2)-((n+1)*(sw/10)),
            (sw/4), (sw/10));
            ctx.fill();
        }
    }

    if (motionPath.length > 0) {
        var limit = motionPath.length > (sw/2) ? 
        (sw/2) : motionPath.length;

        ctx.beginPath();
        ctx.moveTo((sw/2), 25+(motionPath[0].y*25));
        for (var n = 1; n < limit; n++) {
            ctx.lineTo((sw/2)-n, 25+(motionPath[n].y*25));
            ctx.stroke();
        }
    }

    if (remoteMotionPath.length > 0) {
        var limit = remoteMotionPath.length > (sw/2) ? 
        (sw/2) : remoteMotionPath.length;

        ctx.beginPath();
        ctx.moveTo((sw/2), 75+(remoteMotionPath[0].y*25));
        for (var n = 1; n < limit; n++) {
            ctx.lineTo((sw/2)-n, 75+(remoteMotionPath[n].y*25));
            ctx.stroke();
        }
    }

    var reachedValue = micReachedValue > 0.1 ? 
    (Math.floor(micReachedValue*10)-1) : 0;

    ctx.beginPath();
    ctx.arc((sw/2)+(sw/4)+(sw/8), (sh/2)+(sw/2)-(sw/20)
    -(reachedValue*(sw/10)), 
    5, 0, (Math.PI*2));
    ctx.fill();

    ctx.restore();
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