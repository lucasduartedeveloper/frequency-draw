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
            oscillator.start();

            if (mic.closed)
            mic.open(false, 1);
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
    textView.style.color = "#fff";
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
    };

    micFrequency = 0;
    mic = new EasyMicrophone();
    mic.onsuccess = function() { 
        mic.audio.play();
    };
    mic.onupdate = function(freqArray, reachedFreq, avgValue) {
        micAvgValue = avgValue;

        //var value = (24000/512)*(freqArray.length/2);
        micFrequency = reachedFreq;
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
        oscillator.frequency.value.toFixed(2)+" Hz OUT";
        else
        textView.innerText = 
        micFrequency.toFixed(2)+" Hz IN";

        drawImage();
    }
    renderTime = new Date().getTime();

    requestAnimationFrame(animate);
};

var drawImage = function() {
    var ctx = pictureView.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, sw, sh);

    ctx.fillStyle = "#000";
    //ctx.fillRect(0, 0, sw, sh);

    ctx.lineWidth = 1;
    ctx.strokeStyle = "#555";

    ctx.beginPath();
    ctx.moveTo((sw/2), (sh/4));
    ctx.lineTo((sw/2), (sh/2)+(sh/4));
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo((sw/2)-(sw/8), (sh/4));
    ctx.lineTo((sw/2)+(sw/8), (sh/4));
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo((sw/2)-(sw/8), (sh/2)+(sh/4));
    ctx.lineTo((sw/2)+(sw/8), (sh/2)+(sh/4));
    ctx.stroke();

    for (var n = 1; n < 10; n++) {
        ctx.beginPath();
        ctx.moveTo((sw/2)-(sw/16), (sh/4)+(n*((sh/2)/10)));
        ctx.lineTo((sw/2)+(sw/16), (sh/4)+(n*((sh/2)/10)));
        ctx.stroke();
    };

    var value = (1/500)*oscillator.frequency.value;
    ctx.save();
    ctx.translate((sw/2)-(sw/8)-5, (sh/2)+(sh/4)-(value*(sh/2)))

    ctx.fillStyle = "#fff";

    ctx.beginPath();
    ctx.moveTo(-10, +5);
    ctx.lineTo(-10, -5);
    ctx.lineTo(0, 0);
    ctx.fill();

    ctx.restore();
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