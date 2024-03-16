var uploadAlert = new Audio("audio/ui-audio/upload-alert.wav");
var warningBeep = new Audio("audio/warning_beep.wav");

var sw = 360; //window.innerWidth;
var sh = 669; //window.innerHeight;
var swo = sw-100;

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
new Audio("audio/music/ringtone-0.wav");

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

    backgroundView = document.createElement("img");
    backgroundView.style.position = "absolute";
    //pictureView.style.background = "#fff";
    backgroundView.style.objectFit = "cover";
    backgroundView.width = (sw);
    backgroundView.height = (sh); 
    backgroundView.style.left = (0)+"px";
    backgroundView.style.top = (0)+"px";
    backgroundView.style.width = (sw)+"px";
    backgroundView.style.height = (sh)+"px";
    backgroundView.style.zIndex = "15";
    //backgroundView.src = "img/background-0.png";
    //document.body.appendChild(backgroundView);

    camera = document.createElement("video");
    camera.style.position = "absolute";
    camera.style.display = "none";
    camera.autoplay = true;
    camera.style.objectFit = "cover";
    camera.width = (sw);
    camera.height = (sh); 
    camera.style.left = (0)+"px";
    camera.style.top = (0)+"px";
    camera.style.width = (sw)+"px";
    camera.style.height = (sh)+"px";
    camera.style.zIndex = "15";
    document.body.appendChild(camera);
    cameraElem = camera;

    pictureView = document.createElement("canvas");
    pictureView.style.position = "absolute";
    //pictureView.style.background = "#fff";
    pictureView.width = (sw);
    pictureView.height = (sh); 
    pictureView.style.left = (0)+"px";
    pictureView.style.top = (0)+"px";
    pictureView.style.width = (sw)+"px";
    pictureView.style.height = (sh)+"px";
    pictureView.style.zIndex = "15";
    document.body.appendChild(pictureView);

    userInteracted = false;
    pictureView.ontouchstart = function(e) {
        if (userInteracted) {
            //oscillator.start();

            if (mic.closed)
            mic.open(false, 1);

            if (!cameraOn)
            startCamera();
        }
    };

    pictureView.ontouchend = function(e) {
        userInteracted = true;
    };

    receive = true;
    textView = document.createElement("span");
    textView.style.position = "absolute";
    textView.style.objectFit = "cover";
    textView.style.userSelect = "none";
    textView.innerText = "0 Hz OUT";
    textView.style.animationDuration = "1s";
    textView.style.color = "#000";
    textView.style.fontWeight = "900";
    textView.style.fontSize = "25px";
    textView.style.lineHeight = "25px";
    textView.style.textAlign = "center";
    textView.style.left = ((sw/2)-125)+"px";
    textView.style.top = ((sh/4)-75)+"px";
    textView.style.width = (250)+"px";
    textView.style.height = (50)+"px";
    textView.style.zIndex = "15";
    document.body.appendChild(textView);

    textView.onclick = function() {
        receive = !receive;
        if (receive) {
            motion = true;
            micFrequency = 0;
            textView.innerText = 
            oscillator.frequency.value.toFixed(2)+" Hz OUT";
        }
        else {
            motion = false;
            oscillator.frequency.value = 0;
            textView.innerText = micFrequency.toFixed(2)+" Hz IN";
        }

        if (receive) {
            baseRotation = 0;
            frontRotation = 0;
        }
        else {
            baseRotation = 1;
            frontRotation = 1;
        }
    };

    baseRotation = 0;
    frontRotation = 0;

    torchTime = 0;

    micFrequency = 0;
    mic = new EasyMicrophone();
    mic.onsuccess = function() { 
        mic.audio.play();
    };
    mic.onupdate = function(freqArray, reachedFreq, avgValue) {
        micAvgValue = avgValue;

        baseRotation = (5/50)*freqArray.length;
        frontRotation = (5/50)*freqArray.length;

        //console.log(freqArray.length);
        var currentTime = new Date().getTime();
        if (freqArray.length > 100 && (currentTime-torchTime) > 5000) {
            setTorch("on");
            torchTime = currentTime;
        }

        textView.innerText = 
        ((24000/512)*freqArray.length).toFixed(2)+" Hz IN";
    };
    mic.onclose = function() { 
        //mic.audio.loop = true;
        //mic.audio.play();
    };

    oscillator = createOscillator();
    oscillator.volume.gain.value = 1;
    oscillator.biquadFilter.frequency.value = 100;
    oscillator.frequency.value = 0;

    motion = true;
    gyroUpdated = function(e) {
        var value = (1/18.6)*Math.abs((-9.8+e.accY));
        oscillator.frequency.value = (value*500);
    };

    drawImage();
    animate();
});

var updateImage = true;

var updateTime = 0;
var renderTime = 0;
var elapsedTime = 0;
var animationSpeed = 0;

var resetTme = 2500;

var animate = function() {
    elapsedTime = new Date().getTime()-renderTime;
    if (!backgroundMode) {
        if ((new Date().getTime() - updateTime) > resetTme) {
            updateTime = new Date().getTime();
        }

        if (receive)
        textView.innerText = 
        //oscillator.frequency.value.toFixed(2)+" Hz OUT";
        "0 Hz OUT";
        else
        textView.innerText = 
        micFrequency.toFixed(2)+" Hz IN";

        drawImage();
    }
    renderTime = new Date().getTime();

    requestAnimationFrame(animate);
};

var baseFrame = 0;
var frontFrame = 0;

var drawImage = function() {
    var ctx = pictureView.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, sw, sh);

    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, sw, sh);

    ctx.lineWidth = 10;
    ctx.strokeStyle = "#000";

    ctx.save();
    ctx.translate((sw/2), (sh/2));
    ctx.rotate(-(baseFrame*((Math.PI*2)/120)));
    ctx.translate(-(sw/2), -(sh/2));

    //drawCircle(ctx, (sw/2), (sh/2), (sw/3));
    ctx.restore();

    baseFrame += baseRotation;

    ctx.save();
    ctx.translate((sw/2), (sh/2));
    ctx.rotate(-(frontFrame*((Math.PI*2)/180)));
    ctx.translate(-(sw/2), -(sh/2));

    //drawCircle(ctx, (sw/2), (sh/2), (sw/3), true);
    ctx.restore();

    frontFrame += frontRotation;

    //drawHexagon(ctx, (sw/2), (sh/2), (sw/3), true);
    //drawHexagon(ctx, (sw/2), (sh/2)+(sw/3), (sw/3), true);

    ctx.globalAlpha = 0.3;

    var numColumns = 20;
    var size = (sw/numColumns);
    var numRows = Math.floor(sh/size);

    for (var y = 0; y < numRows; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y*size);
        ctx.lineTo(sw, y*size);
        if ((y-3)%4 != 0) ctx.stroke();
    }

    for (var x = 0; x < 20; x++) {
        ctx.beginPath();
        ctx.moveTo(x*size, 0);
        ctx.lineTo(x*size, sh);
        if ((x-3)%4 != 0) ctx.stroke();
    }

    ctx.globalAlpha = 1;

    ctx.restore();
};

var drawHexagon = function(ctx, x, y, height, rotated=false) {
    var c = {
        x: x,
        y: y
    };
    var p = {
        x: c.x,
        y: c.y-(height/2)
    };

    var offset = rotated ? -(360/12) : 0;

    ctx.beginPath();
    var rp = _rotate2d(c, p, offset);
    ctx.moveTo(rp.x, rp.y);

    for (var n = 1; n <= 6; n++) {
        var rp = _rotate2d(c, p, offset+(n*(360/6)));
        ctx.lineTo(rp.x, rp.y);
    }
    ctx.stroke();
};

var calcHexagon = function(width) {
    var c = {
        x: 0,
        y: 0
    };
    var p = {
        x: c.x,
        y: c.y-(width/2)
    };

    var rp0 = _rotate2d(c, p, (360/12));
    var rp1 = _rotate2d(c, p, (360/12)-(360/6));
    var rp2 = _rotate2d(c, p, (360/12)-(4*(360/6)));

    console.log(rp0, rp1);

    var size = (rp1.x-rp0.x);
    var height = (rp2.y-rp0.y);

    console.log("hexagon size: "+size.toFixed(2)+"cm");
    console.log("hexagon width: "+width.toFixed(2)+"cm");
    console.log("hexagon height: "+height.toFixed(2)+"cm");
};

var drawCircle = function(ctx, x, y, size, reverse=false) {
    var c = {
        x: x,
        y: y
    };

    var numLines = 10;
    var numPoints = 25;

    for (var n = 0; n < numLines; n++) {
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        for (var k = 0; k < numPoints; k++) {
            var p = {
                x: c.x,
                y: c.y-(k*(size/numPoints))
            };

            var effect = 
            (reverse ? -(k*(360/(numLines*8))) : (k*(360/(numLines*8))));

            var rp = _rotate2d(c, p, 
            (n*(360/numLines))+effect);
            ctx.lineTo(rp.x, rp.y);
        }
        ctx.stroke();
    }
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
    var currentTime = new Date().getTime();
    backgroundMode = !backgroundMode;
    if (backgroundMode) {
        console.log("backgroundMode: "+backgroundMode+" - "+
        moment(currentTime).format("HH:mm SSS"));
    }
    else {
        console.log("backgroundMode: "+backgroundMode+" - "+
        moment(currentTime).format("HH:mm SSS"));
    }
}, false);