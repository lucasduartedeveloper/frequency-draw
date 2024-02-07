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
    //pictureView.style.background = "#fff";
    pictureView.width = (sw);
    pictureView.height = (sh); 
    pictureView.style.left = (0)+"px";
    pictureView.style.top = (0)+"px";
    pictureView.style.width = (sw)+"px";
    pictureView.style.height = (sh)+"px";
    pictureView.style.zIndex = "15";
    document.body.appendChild(pictureView);

    oscillatorStarted = false;
    userInteracted = false;
    pictureView.onclick = function() {
        if (userInteracted && !oscillatorStarted) {
            oscillator.start();
            oscillatorStarted = true;
        }
        else if (!userInteracted)
        userInteracted = true;
    };

    previousTimeView = document.createElement("span");
    previousTimeView.style.position = "absolute";
    previousTimeView.style.color = "#55f";
    previousTimeView.innerHTML = 
    moment(0).format(
    "mm:ss[&nbsp;<span style=\"font-size:15px\">]SSS[</span>]");
    previousTimeView.style.fontSize = (25)+"px";
    previousTimeView.style.textAlign = "center";
    previousTimeView.style.lineHeight = (25)+"px";
    previousTimeView.style.left = ((sw/2)-50)+"px";
    previousTimeView.style.top = ((sh/2)-175)+"px";
    previousTimeView.style.width = (100)+"px";
    previousTimeView.style.height = (25)+"px";
    previousTimeView.style.zIndex = "15";
    document.body.appendChild(previousTimeView);

    previousTimeView.onclick = function() {
        clearCount();
    };

    timerView = document.createElement("span");
    timerView.style.position = "absolute";
    timerView.style.color = "#fff";
    timerView.innerHTML = 
    moment(0).format(
    "mm:ss[&nbsp;<span style=\"font-size:15px\">]SSS[</span>]");
    timerView.style.fontSize = (25)+"px";
    timerView.style.textAlign = "center";
    timerView.style.lineHeight = (25)+"px";
    timerView.style.left = ((sw/2)-50)+"px";
    timerView.style.top = ((sh/2)-150)+"px";
    timerView.style.width = (100)+"px";
    timerView.style.height = (25)+"px";
    timerView.style.zIndex = "15";
    document.body.appendChild(timerView);

    count = 1000;
    countView = document.createElement("span");
    countView.style.position = "absolute";
    countView.style.color = "#fff";
    countView.innerText = count;
    countView.style.fontSize = (50)+"px";
    countView.style.textAlign = "center";
    countView.style.lineHeight = (50)+"px";
    countView.style.left = ((sw/2)-50)+"px";
    countView.style.top = ((sh/2)-50)+"px";
    countView.style.width = (100)+"px";
    countView.style.height = (50)+"px";
    countView.style.zIndex = "15";
    document.body.appendChild(countView);

    countView.onclick = function() {
        document.body.requestFullscreen();
    };

    direction = -50
    directionView = document.createElement("span");
    directionView.style.position = "absolute";
    directionView.style.color = "#5f5";
    directionView.innerText = direction;
    directionView.style.fontSize = (50)+"px";
    directionView.style.textAlign = "center";
    directionView.style.lineHeight = (50)+"px";
    directionView.style.left = ((sw/2)-50)+"px";
    directionView.style.top = ((sh/2)+25)+"px";
    directionView.style.width = (100)+"px";
    directionView.style.height = (50)+"px";
    directionView.style.zIndex = "15";
    document.body.appendChild(directionView);

    directionView.onclick = function() {
        count += direction;
        countView.innerText = count;

        var currentTime = new Date().getTime();
        var elapsedTime = currentTime - timeStarted;

        previousTimeView.innerHTML = 
        moment(elapsedTime).format(
        "mm:ss[&nbsp;<span style=\"font-size:15px\">]SSS[</span>]");

        saveCount(elapsedTime);

        timeStarted = currentTime;
    };

    oscillator = createOscillator();

    frequencyPath = [ 0 ];
    timeStarted = new Date().getTime();

    loadCount();

    drawImage();
    animate();
});

Math.curve = function(value, scale=1) {
    var c = {
        x: 0,
        y: 0
    };
    var p = {
        x: -1,
        y: 0
    };
    var rp = _rotate2d(c, p, (value*360));
    return rp.y*scale;
};

var loadCount = function() {
    var storage = localStorage.getItem("storage");
    if (!storage) return;

    var obj = JSON.parse(storage);
    count = obj.count;
    countView.innerText = count;

    previousTimeView.innerHTML = 
    moment(obj.previousTime).format(
    "mm:ss[&nbsp;<span style=\"font-size:15px\">]SSS[</span>]");
};

var saveCount  = function(elapsedTime) {
    var obj = {
        timestamp: new Date().getTime(),
        previousTime: elapsedTime,
        count: count
    };
    localStorage.setItem("storage", JSON.stringify(obj));
};

var clearCount = function() {
    count = 1000;
    countView.innerText = count;

    timeStarted = new Date().getTime();
    previousTimeView.innerHTML = 
    moment(0).format(
    "mm:ss[&nbsp;<span style=\"font-size:15px\">]SSS[</span>]");

    localStorage.removeItem("storage");
};

var updateImage = true;

var updateTime = 0;
var renderTime = 0;
var elapsedTime = 0;
var animationSpeed = 0;

var effectRatio = 0.1;

var animate = function() {
    elapsedTime = new Date().getTime()-renderTime;
    if (!backgroundMode) {
        if ((new Date().getTime() - updateTime) > 1000) {
            updateTime = new Date().getTime();
        }

        var currentTime = new Date().getTime();
        var elapsedTime = currentTime - timeStarted;

        timerView.innerHTML = 
        moment(elapsedTime).format(
        "mm:ss[&nbsp;<span style=\"font-size:15px\">]SSS[</span>]");

        var value = Math.curve((1/1000)*
        parseInt(moment(elapsedTime).format("SSS")));

        if (frequencyPath.length == (sw/2))
        frequencyPath.splice(frequencyPath.length-1, 1);

        frequencyPath.splice(0, 0, value);

        oscillator.frequency.value = 50+(value*50);

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

    ctx.lineWidth = 1;
    ctx.strokeStyle = "#fff";

    ctx.beginPath();
    ctx.moveTo((sw/2), (sh/2)+100+(frequencyPath[0]*25));
    for (var n = 1; n < frequencyPath.length; n++) {
        ctx.lineTo((sw/2)-n, (sh/2)+100+(frequencyPath[n]*25));
    }
    ctx.stroke();

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
    backgroundMode = !backgroundMode;
    if (backgroundMode) {
        console.log("backgroundMode: "+backgroundMode);
    }
    else {
        console.log("backgroundMode: "+backgroundMode);
    }
}, false);