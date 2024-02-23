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
            recordedAudio.play();

            if (mic.closed)
            mic.open();
        }
    };

    pictureView.ontouchend = function(e) {
        userInteracted = true;
    };

    textView = document.createElement("span");
    textView.style.position = "absolute";
    textView.style.userSelect = "none";
    textView.style.objectFit = "cover";
    textView.style.display = "none";
    textView.style.animationDuration = "1s";
    textView.style.color = "#fff";
    textView.style.fontWeight = "900";
    textView.style.fontSize = "25px";
    textView.style.lineHeight = "25px";
    textView.style.textAlign = "center";
    textView.style.left = ((sw/2)-125)+"px";
    textView.style.top = ((sh/4)-25)+"px";
    textView.style.width = (250)+"px";
    textView.style.height = (50)+"px";
    textView.style.zIndex = "15";
    document.body.appendChild(textView);

    textView.onanimationend = function() {
        textView.className = "";
        textView.innerText = "";
    };

    clearTextTimeout = 0;

    showText = function(text) {
        textView.innerText = text;
        //textView.src = "img/fx-"+(text.toLowerCase())+".png";

        textView.style.display = "initial";
        textView.className = 
        "animate__animated animate__rubberBand";

        clearTimeout(clearTextTimeout);
        clearTextTimeout= setTimeout(function() {
            textView.style.display = "none";
        }, 2500);
    };

    keepTime = 0;
    keepView = document.createElement("span");
    keepView.style.position = "absolute";
    keepView.style.userSelect = "none";
    keepView.style.objectFit = "cover";
    keepView.innerText = "KEEP";
    keepView.style.animationDuration = "1s";
    keepView.style.color = "#fff";
    keepView.style.fontWeight = "900";
    keepView.style.fontSize = "25px";
    keepView.style.lineHeight = "25px";
    keepView.style.textAlign = "center";
    keepView.style.left = (10)+"px";
    keepView.style.top = (sh-60)+"px";
    keepView.style.width = (100)+"px";
    keepView.style.height = (50)+"px";
    keepView.style.zIndex = "15";
    document.body.appendChild(keepView);

    keepView.onclick = function() {
        var currentTime = new Date().getTime();
        keepTime = currentTime;

        previousResumedWave = [ ...resumedWave ];
    };

    dataView = document.createElement("span");
    dataView.style.position = "absolute";
    dataView.style.userSelect = "none";
    dataView.style.objectFit = "cover";
    dataView.innerText = "0.00%";
    dataView.style.animationDuration = "1s";
    dataView.style.color = "#fff";
    dataView.style.fontWeight = "900";
    dataView.style.fontSize = "25px";
    dataView.style.lineHeight = "25px";
    dataView.style.textAlign = "center";
    dataView.style.left = (120)+"px";
    dataView.style.top = (sh-60)+"px";
    dataView.style.width = (100)+"px";
    dataView.style.height = (50)+"px";
    dataView.style.zIndex = "15";
    document.body.appendChild(dataView);

    mic = new EasyMicrophone();
    mic.onsuccess = function() { 
        mic.audio.play();
    };
    mic.onupdate = function(freqArray, reachedFreq, avgValue) {
        micAvgValue = avgValue;

        resumedWave = resumeWave(freqArray);
        compareData();
    };
    mic.onclose = function() { 
        //mic.audio.loop = true;
        //mic.audio.play();
    };
    var ab = new Array(50);
    for (var n = 0; n < 50; n++) {
        ab[n] = 0;
    }
    resumedWave = [ ...ab ];
    previousResumedWave = [ ...ab ];

    recordedAudio = new Audio("audio/sfx-hexa.wav");

    media = new MediaAnalyser(recordedAudio);
    media.onupdate = function(freqArray, reachedFreq, avgValue) {
        var media = resumeWave(freqArray);
        for (var n = 0; n < media.length; n++) {
            if (media[n] > previousResumedWave[n])
            previousResumedWave[n] = media[n];
        }
    };

    drawImage();
    animate();
});

var compareData = function() {
    var sum = 0;
    for (var n = 0; n < resumedWave.length; n++) {
        var previousValue = previousResumedWave[n];
        var value = resumedWave[n];

        sum += 100-((Math.abs(previousValue-value)/2)*100);
    }

    var result = (sum/resumedWave.length);
    dataView.innerText = result.toFixed(2) + "%";

    var currentTime = new Date().getTime();
    keepDuration = currentTime-keepTime;

    if (keepDuration > 1000 && result > 98) {
        var ab = new Array(50);
        for (var n = 0; n < 50; n++) {
            ab[n] = 0;
        }
        previousResumedWave = ab;
    }
};

var drawAB = 
function(freqArray=false, y, direction=1) {
    var canvas = pictureView;
    var ctx = canvas.getContext("2d");

    var offset = 0;
    var polygon = [];

    // create waveform A
    if (freqArray) 
    offset = (canvas.width/freqArray.length)/2;
    if (freqArray) 
    for (var n = 0; n < freqArray.length; n++) {
        var obj = {
            x: offset+(n*(canvas.width/freqArray.length)),
            y0: (y)+
            (direction*(freqArray[n]*25)),
            y1: (y)+
            (direction*(freqArray[n]*25)+1)
        };
        polygon.push(obj);
    }

    // draw waveform A
    ctx.strokeStyle = "#fff";

    if (freqArray) {
        ctx.lineWidth = (canvas.width/freqArray.length)-2;
        //ctx.clearRect(0, 0, canvas.width, 100);
    }
    if (freqArray)
    for (var n = 0; n < polygon.length; n++) {
        ctx.beginPath();
        ctx.moveTo(polygon[n].x, polygon[n].y0-1);
        ctx.lineTo(polygon[n].x, polygon[n].y1+1);
        ctx.stroke();
    }
};

var resumeWave = function(freqArray) {
    var blocks = 50;
    var blockSize = Math.floor(freqArray.length / blocks);

    var resumedArray = [];
    var sum = 0;
    for (var n = 0; n < blocks; n++) {
        sum = 0;
        for (var k = 0; k < blockSize; k++) {
            var m = (n * blockSize) + k;
             if ((m+1) <= freqArray.length) {
                 sum += freqArray[m];
             }
        }

        resumedArray.push(sum/blockSize);
    }
    //console.log(blockSize);
    //console.log(resumedArray);

    return resumedArray;
};

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
    ctx.moveTo(0, (sh/2));
    ctx.lineTo(sw, (sh/2));
    ctx.stroke();

    drawAB(resumedWave, (sh/2)+10);
    drawAB(previousResumedWave, (sh/2)-10, -1);
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