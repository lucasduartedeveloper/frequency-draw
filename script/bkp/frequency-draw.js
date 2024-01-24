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

    micAvgValue = 0;
    path = [
        { x: (sw/2), y: (sh/2) }
    ];
    frequencyPath = [{
        openValue: 0,
        highValue: 0,
        lowValue: 0,
        closeValue: 0
    }];

    var restartTimeout = 0;

    var lastPeriodTime = 0;
    var openValue = 0;
    var highValue = 0;
    var lowValue = 0;
    var closeValue = 0;

    mic = new EasyMicrophone();
    mic.onsuccess = function() { 
        console.log("mic open");
    };
    mic.onupdate = function(freqArray, reachedFreq, avgValue) {
        micAvgValue = avgValue;

        if (micAvgValue > 0) {
            clearTimeout(restartTimeout);
            restartTimeout = setTimeout(function() {
                path = [
                    { x: (sw/2), y: (sh/2) }
                ];
                frequencyPath = [{
                    openValue: 0,
                    highValue: 0,
                    lowValue: 0,
                    closeValue: 0
                }];
            }, 5000);
        }

        var pos = path[path.length-1];
        var angle = ((1/250)*reachedFreq)*360;

        var c = {
            x: pos.x,
            y: pos.y
        };
        var p = {
            x: c.x,
            y: c.y-(micAvgValue*10)
        };
        var rp = _rotate2d(c, p, angle);

        path.push(rp);

        var frequency = ((1/250)*reachedFreq);
        var currentTime = new Date().getTime();

        if (frequency > highValue)
        highValue = frequency;

        if (frequency < lowValue)
        lowValue = frequency;

        if (currentTime - lastPeriodTime > 5000) {
            if (openValue == 0) openValue = frequency;
            closeValue = frequency;

            frequencyPath.push({ 
                openValue: openValue,
                highValue: highValue,
                lowValue: lowValue,
                closeValue: closeValue
            });

            openValue = frequency;
            highValue = 0;
            lowValue = 0;
            closeValue = 0;

            lastPeriodTime = currentTime;
        }
        drawImage();
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

    drawImage();
});

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

    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (var n = 1; n < path.length; n++) {
        ctx.lineTo(path[n].x, path[n].y);
    }
    //ctx.stroke();

    var reversed = frequencyPath.toReversed();

    for (var n = 1; n < reversed.length; n++) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#555";

        ctx.beginPath();
        ctx.moveTo(
        (sw/2)-((n-1)*5), 
        (sh/2)-((reversed[n-1].highValue-0.5)*((sw/gridSize)*2)));
        ctx.lineTo(
        (sw/2)-((n-1)*5), 
        (sh/2)-((reversed[n].lowValue-0.5)*((sw/gridSize)*2)));
        ctx.stroke();

        ctx.lineWidth = 3;
        if (reversed[n-1].openValue > reversed[n].closeValue)
        ctx.strokeStyle = "#5f5";
        else
        ctx.strokeStyle = "#f55";

        ctx.beginPath();
        ctx.moveTo(
        (sw/2)-((n-1)*5), 
        (sh/2)-((reversed[n-1].openValue-0.5)*((sw/gridSize)*2)));
        ctx.lineTo(
        (sw/2)-((n-1)*5), 
        (sh/2)-((reversed[n].closeValue-0.5)*((sw/gridSize)*2)));
        ctx.stroke();
    }

    var avgFrequency = 0;
    for (var n = 0; n < reversed.length; n++) {
        avgFrequency += reversed[n].frequency;
    }
    avgFrequency /= reversed.length;

    ctx.lineWidth = 1;
    ctx.strokeStyle = "#555";

    ctx.beginPath();
    ctx.moveTo(0, (sh/2));
    ctx.lineTo(sw, (sh/2));
    ctx.stroke();

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
        //drawImage();
    }
    renderTime = new Date().getTime();
    requestAnimationFrame(animate);
};

var visibilityChange;
if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
  visibilityChange = "visibilitychange";
} else if (typeof document.msHidden !== "undefined") {
  visibilityChange = "msvisivbilitychange";
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