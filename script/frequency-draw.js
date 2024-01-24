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

    predictionDistance = 1;

    prediction = {
        positionY: -1,
        startValue: 0,
        value: 0,
        direction: 0,
        ready: false,
        correct: false,
        met: false,
        closeValue: 0,
        steps: predictionDistance
    };

    predictionDistanceView = 
    document.createElement("span");
    predictionDistanceView.style.position = "absolute";
    predictionDistanceView.style.color = "#fff";
    predictionDistanceView.innerText = 
    prediction.steps+" / "+predictionDistance;
    predictionDistanceView.style.textAlign = "center";
    predictionDistanceView.style.fontFamily = "Khand";
    predictionDistanceView.style.fontSize = "20px";
    predictionDistanceView.style.left = ((sw/2)-50)+"px";
    predictionDistanceView.style.top = (10)+"px";
    predictionDistanceView.style.width = (100)+"px";
    predictionDistanceView.style.height = (25)+"px";
    predictionDistanceView.style.zIndex = "15";
    document.body.appendChild(predictionDistanceView);

    predictionDistanceView.onclick = function() {
        var input = 
        prompt("Prediction distance: ", predictionDistance);

        var value = parseInt(input);
        if (!value) return;

        predictionDistance = value;
        predictionDistanceView.innerText = 
        prediction.steps+" / "+predictionDistance;
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
    correctPredictionCountView.style.left = (sw-110)+"px";
    correctPredictionCountView.style.top = (10)+"px";
    correctPredictionCountView.style.width = (100)+"px";
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
    correctPredictionIconView.style.left = (sw-110)+"px";
    correctPredictionIconView.style.top = (10)+"px";
    correctPredictionIconView.style.width = (100)+"px";
    correctPredictionIconView.style.height = (25)+"px";
    correctPredictionIconView.style.zIndex = "15";
    document.body.appendChild(correctPredictionIconView);

    var startX = 0;
    var startY = 0;
    var moveX = 0;
    var moveY = 0;

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

        prediction.steps = predictionDistance;
        predictionDistanceView.innerText = 
        prediction.steps+" / "+predictionDistance;

        prediction.ready = false;
        prediction.correct = false;
        prediction.met = false;
        prediction.closeValue = 0;

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
        prediction.direction = startY > moveY ? -1 : 1;
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
    frequencyPath = [{
        openValue: 0,
        highValue: 0,
        lowValue: 0,
        closeValue: 0,
        readingCount: 0,
        volumeValue: 0
    }];

    var restartTimeout = 0;

    var lastPeriodTime = 0;
    var openValue = 0;
    var highValue = 0;
    var lowValue = 0;
    var closeValue = 0;

    var readingCount = 0;
    var volumeValue = 0;

    mic = new EasyMicrophone();
    mic.onsuccess = function() { 
        console.log("mic open");
    };
    mic.onupdate = function(freqArray, reachedFreq, avgValue) {
        micAvgValue = avgValue;

        var frequency = ((1/250)*reachedFreq);
        var currentTime = new Date().getTime();

        readingCount += 1;
        volumeValue += micAvgValue;

        if (frequency > highValue)
        highValue = frequency;

        if (frequency < lowValue)
        lowValue = frequency;

        if (currentTime - lastPeriodTime > 1000) {
            if (openValue == 0) {
                openValue = frequency;
                highValue = frequency;
                lowValue = frequency;
            }
            closeValue = frequency;

            frequencyPath.push({ 
                openValue: openValue,
                highValue: highValue,
                lowValue: lowValue,
                closeValue: closeValue,
                readingCount: readingCount,
                volumeValue: (volumeValue/readingCount)
            });

            currentValueView.innerText = 
            closeValue.toFixed(2);

            if (prediction.ready && prediction.steps > 0) {
                prediction.steps -= 1;
                predictionDistanceView.innerText = 
                prediction.steps+" / "+predictionDistance;
            }

            if (prediction.ready && prediction.steps == 0) {
                if (prediction.direction == -1 && 
                closeValue >= prediction.value) {
                    predictionCount += 1;
                    prediction.correct = true;
                }

                if (prediction.direction == 1 && 
                closeValue <=prediction.value) {
                    predictionCount += 1;
                    prediction.correct = true;
                }

                prediction.met = true;
                //prediction.positionY = -1;
                prediction.direction = 0;
                prediction.ready = false;
                prediction.closeValue = closeValue;

                correctPredictionCountView.innerText = 
                predictionCount;

                if (prediction.correct)
                say("Your prediction was correct!");
                else
                say("Your prediction failed.");
            }

            openValue = frequency;
            highValue = frequency;
            lowValue = frequency;
            closeValue = frequency;

            readingCount = 0;
            volumeValue = 0;

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
    //animate();
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

    ctx.lineWidth = 1;
    ctx.strokeStyle = "#555";

    ctx.beginPath();
    ctx.moveTo(0, (sh/2));
    ctx.lineTo(sw, (sh/2));
    ctx.stroke();

    if (prediction.positionY != -1) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#555";

        if (prediction.direction == -1)
        ctx.strokeStyle = "#5f5";
        if (prediction.direction == 1)
        ctx.strokeStyle = "#f55";

        ctx.beginPath();
        ctx.moveTo(0, prediction.positionY);
        ctx.lineTo(sw, prediction.positionY);
        ctx.stroke();

        ctx.fillStyle = "#000";

        ctx.beginPath();
        ctx.rect(sw-(sw/4)-25, prediction.positionY-10, 50, 20);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#fff";
        ctx.font = "15px sans serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(prediction.value.toFixed(2), 
        sw-(sw/4), prediction.positionY);

        ctx.strokeStyle = "#555";
        ctx.fillStyle = "#000";

        ctx.beginPath();
        ctx.rect(sw-(sw/4)-80, prediction.positionY-10, 50, 20);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#fff";
        ctx.font = "15px sans serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(prediction.startValue.toFixed(2), 
        sw-(sw/4)-55, prediction.positionY);

        if (prediction.met) {
            ctx.fillStyle = "#000";
            if (prediction.correct)
            ctx.strokeStyle = "#55f";
            else 
            ctx.strokeStyle = "#555";

            ctx.beginPath();
            ctx.rect(sw-(sw/4)+30, prediction.positionY-10, 50, 20);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = "#fff";
            ctx.font = "15px sans serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(prediction.closeValue.toFixed(2), 
            sw-(sw/4)+55, prediction.positionY);
        }
    }

    var reversed = frequencyPath.toReversed();

    for (var n = 0; n < reversed.length; n++) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#555";

        ctx.beginPath();
        ctx.moveTo(
        (sw/2)-(n*10), 
        (sh/2)-((reversed[n].highValue-0.5)*((sw/gridSize)*4)));
        ctx.lineTo(
        (sw/2)-(n*10), 
        (sh/2)-((reversed[n].lowValue-0.5)*((sw/gridSize)*4)));
        ctx.stroke();

        ctx.lineWidth = 5;
        if (reversed[n].openValue > reversed[n].closeValue)
        ctx.strokeStyle = "#5f5";
        else
        ctx.strokeStyle = "#f55";

        ctx.beginPath();
        ctx.moveTo(
        (sw/2)-(n*10), 
        (sh/2)-((reversed[n].openValue-0.5)*((sw/gridSize)*4)));
        ctx.lineTo(
        (sw/2)-(n*10), 
        (sh/2)-((reversed[n].closeValue-0.5)*((sw/gridSize)*4)));
        ctx.stroke();
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