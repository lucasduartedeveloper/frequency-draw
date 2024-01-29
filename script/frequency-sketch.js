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

    pictureViewZoom = document.createElement("canvas");
    pictureViewZoom.style.position = "absolute";
    pictureViewZoom.style.background = "#fff";
    pictureViewZoom.width = (sw);
    pictureViewZoom.height = (sh); 
    pictureViewZoom.style.left = (0)+"px";
    pictureViewZoom.style.top = (0)+"px";
    pictureViewZoom.style.width = (sw)+"px";
    pictureViewZoom.style.height = (sh)+"px";
    pictureViewZoom.style.zIndex = "15";
    //document.body.appendChild(pictureViewZoom);

    pictureView = document.createElement("canvas");
    pictureView.style.position = "absolute";
    pictureView.width = (sw);
    pictureView.height = (sh); 
    pictureView.style.left = (0)+"px";
    pictureView.style.top = (0)+"px";
    pictureView.style.width = (sw)+"px";
    pictureView.style.height = (sh)+"px";
    pictureView.style.zIndex = "15";
    document.body.appendChild(pictureView);

    var oscillatorX0 = 0;
    var oscillatorY0 = 0;
    var oscillatorX1 = 0;
    var oscillatorY1 = 0;

    pathArr = [];
    var path = [];

    userInteracted = false;
    oscillatorStarted = false;
    pictureView.ontouchstart = function(e) {
        var detail_x = (1/sw)*e.touches[0].clientX;
        var detail_y = (1-((1/sh)*e.touches[0].clientY));
        drawDetailLevel(
            Math.floor(detail_x*30),
            Math.floor(detail_y*50)
        );
        return;

        path = [];
        pathArr[pathArr.length] = [];

        var x0 = e.touches[0].clientX;
        var y0 = e.touches[0].clientY;

        oscillatorX0 = (1/sw)*(x0-(sh/2));
        oscillatorY0 = -(1/sw)*(y0-(sh/2));

        var frequency = 50+(oscillatorY0*100);
        oscillator0.frequency.value = frequency;

        var pos = {
            x: x0,
            y: y0,
            frequency: frequency
        };
        path.push(pos);
        pathArr[pathArr.length-1] = path;

        if (e.touches.length < 2) return;
        var x1 = e.touches[1].clientX;
        var y1 = e.touches[1].clientY;

        oscillatorX1 = (1/sw)*(x1-(sh/2));
        oscillatorY1 = -(1/sw)*(y1-(sh/2));

        var frequency = 100+(oscillatorY1*20);
        oscillator1.frequency.value = frequency;
    };

    pictureView.ontouchmove = function(e) {
        var detail_x = (1/sw)*e.touches[0].clientX;
        var detail_y = (1-((1/sh)*e.touches[0].clientY));
        drawDetailLevel(
            Math.floor(detail_x*30),
            Math.floor(detail_y*50)
        );
        return;

        var x0 = e.touches[0].clientX;
        var y0 = e.touches[0].clientY;

        oscillatorX0 = (1/sw)*(x0-(sh/2));
        oscillatorY0 = -(1/sw)*(y0-(sh/2));

        var frequency = 50+(oscillatorY0*100);
        oscillator0.frequency.value = frequency;

        var pos = {
            x: x0,
            y: y0,
            frequency: frequency
        };
        path.push(pos);
        pathArr[pathArr.length-1] = path;

        if (e.touches.length < 2) return;
        var x1 = e.touches[1].clientX;
        var y1 = e.touches[1].clientY;

        oscillatorX1 = (1/sw)*(x1-(sh/2));
        oscillatorY1 = -(1/sw)*(y1-(sh/2));

        var frequency = 100+(oscillatorY1*20);
        oscillator1.frequency.value = frequency;
    };

    pictureView.ontouchend = function(e) {
        console.log(e);

        //pathArr.push(path);
        userInteracted = true;

        if (e.changedTouches[0].identifier == 0)
        oscillator0.frequency.value = 0;

        if (e.changedTouches[0].identifier == 1)
        oscillator1.frequency.value = 0;
    };

    var c0 = { x: 0, y: 0 };
    var c1 = { x: 0, y: 0 };

    var p0 = { x: c0.x, y: c0.y+0.5 };
    var p1 = { x: c1.x, y: c1.y-0.5 };

    frequencyPath = [];
    frequencyPath.push({ x: -0.5, y: 0.5 });
    for (var n = 0; n < 10; n++) {
        frequencyPath.push({ x: -0.5+((0.5/10))*n, y: 0.5 });
    }
    for (var n = 0; n < 10; n++) {
        var rp = _rotate2d(c0, p0, n*(180/10));
        frequencyPath.push(rp);
    }
    for (var n = 0; n < 10; n++) {
        var rp = _rotate2d(c1, p1, n*(180/10));
        frequencyPath.push(rp);
    }

    oscillator0 = createOscillator();
    oscillator0.frequency.value = 0;
    oscillator1 = createOscillator();
    oscillator1.frequency.value = 0;

    buttonPlaySquareView = document.createElement("button");
    buttonPlaySquareView.style.position = "absolute";
    buttonPlaySquareView.style.background = "#000";
    buttonPlaySquareView.style.color = "#fff";
    buttonPlaySquareView.innerText = "play";
    buttonPlaySquareView.style.fontFamily = "Khand";
    buttonPlaySquareView.style.fontSize = "15px";
    buttonPlaySquareView.style.left = (10)+"px";
    buttonPlaySquareView.style.top = (sh-60)+"px";
    buttonPlaySquareView.style.width = (100)+"px";
    buttonPlaySquareView.style.height = (50)+"px";
    buttonPlaySquareView.style.border = "1px solid white";
    buttonPlaySquareView.style.borderRadius = "25px";
    buttonPlaySquareView.style.zIndex = "15";
    document.body.appendChild(buttonPlaySquareView);

    totalSquares = (sectionCount*sectionCount);
    currentPosition = 0;
    playSquareInterval = 0;
    buttonPlaySquareView.onclick = function() {
        if (currentPosition > 0) {
             //currentPosition = 0;
             oscillator0.frequency.value = 0;
             clearInterval(playSquareInterval);
             return;
        }

        playSquareInterval = setInterval(function() {
            var found = false;
            var distance = 0;
            for (var n = 0; n < pathArr.length; n++) {
                var path = pathArr[n];
                for (var k = 0; k < path.length; k++) {
                    if (distance+k == currentPosition) {
                        oscillator0.frequency.value = path[k].frequency;
                        found = true;
                        break;
                    }
                }
                distance += path.length;
                if (found) break;
            }

            if (!found) currentPosition = 0;
            else if (currentPosition < (totalSquares-1)) 
            currentPosition += 1;
            else currentPosition = 0;
        }, 1000/60);
    };

    buttonOscillatorView = document.createElement("button");
    buttonOscillatorView.style.position = "absolute";
    buttonOscillatorView.style.background = "#000";
    buttonOscillatorView.style.color = "#fff";
    buttonOscillatorView.innerText = "off";
    buttonOscillatorView.style.fontFamily = "Khand";
    buttonOscillatorView.style.fontSize = "15px";
    buttonOscillatorView.style.left = (120)+"px";
    buttonOscillatorView.style.top = (sh-60)+"px";
    buttonOscillatorView.style.width = (100)+"px";
    buttonOscillatorView.style.height = (50)+"px";
    buttonOscillatorView.style.border = "1px solid white";
    buttonOscillatorView.style.borderRadius = "25px";
    buttonOscillatorView.style.zIndex = "15";
    document.body.appendChild(buttonOscillatorView);

    buttonOscillatorView.onclick = function() {
        if (userInteracted && !oscillatorStarted) {
            oscillator0.start();
            oscillator1.start();
            oscillatorStarted = true;
            buttonOscillatorView.innerText = "on";
        }

        if (!navigator.mediaDevices) return;

        if (mic.closed) {
            mic.open(false, 1);
        }
    };

    mic = new EasyMicrophone();
    mic.onsuccess = function() { 
        console.log("mic open");
    };
    mic.onupdate = function(freqArray, reachedFreq, avgValue) {
        micAvgValue = avgValue;

        var value = ((1/250)*reachedFreq);
        drawDetailLevel(1+Math.floor(value*9), value*50);

        totalSquares = (sectionCount*sectionCount);
    };
    mic.onclose = function() { 
        console.log("mic closed");
    };

    drawImage();
    animate();
});

var sectionCount = 0;
var drawDetailLevel = function(numSections, sectionLength) {
    sectionLength = numSections;
    sectionCount = numSections;

    pathArr = [];
    for (var n = 0; n < numSections; n++) {
        var path = [];
        var c = {
            x: (sw/2),
            y: (sh/2)
        };

       for (var k = 0; k < sectionLength; k++) {
            var p = {
                 x: c.x,
                 y: c.y-(sw/4)+(sw/8)-(k*((sw/8)/sectionLength))
            };
            var rp = _rotate2d(c,p, n*((360)/numSections));
            rp.frequency = (n*50)+50+((k-5)*(100/sectionLength));
            //50+((-(1/sw)*((rp.y)-(sh/2)))*100);
            path.push(rp);
        }

        pathArr.push(path);
    }
};

var toHertz = function(no) {
    return (no*250)*((24000)/512);
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

        drawImage();
    }
    renderTime = new Date().getTime();
    requestAnimationFrame(animate);
};

var drawImage = 
    function(angle=0, color="#fff", gridColor="#333") {
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

    ctx.restore();

    var size = (sw/4)/Math.sqrt(2);

    ctx.lineWidth = 1;
    ctx.strokeStyle = "#55f";

    ctx.beginPath();
    ctx.rect((sw/2)-(size/2), (sh/2)-(size/2), size, size);
    ctx.stroke();

    for (var y = 1; y < sectionCount; y++) {
        ctx.beginPath();
        ctx.moveTo((sw/2)-(size/2), 
        (sh/2)-(size/2)+(y*(size/sectionCount)));
        ctx.lineTo((sw/2)+(size/2), 
        (sh/2)-(size/2)+(y*(size/sectionCount)));
        ctx.stroke();
    }

    for (var x = 1; x < sectionCount; x++) {
        ctx.beginPath();
        ctx.moveTo((sw/2)-(size/2)+(x*(size/sectionCount)), 
        (sh/2)-(size/2));
        ctx.lineTo((sw/2)-(size/2)+(x*(size/sectionCount)), 
        (sh/2)+(size/2));
        ctx.stroke();
    }

    ctx.fillStyle = "#55f";

    var x = (currentPosition%sectionCount);
    var y = Math.floor(currentPosition/sectionCount);
    //var itemSize = (size/sectionCount);

    ctx.beginPath();
    ctx.rect((sw/2)-(size/2)+(x*(size/sectionCount)), 
    (sh/2)-(size/2)+(y*(size/sectionCount)), 
    (size/sectionCount), (size/sectionCount));
    ctx.fill();

    drawPathArr();

    var zoomCtx = pictureViewZoom.getContext("2d");
    zoomCtx.drawImage(pictureView, 
    0, 0, (sw/2), (sh/2),
    0, 0, sw, sh);
};

var currentPosition = 0;

var drawPathArr = function(freqArray) {
    var canvas = pictureView;
    var ctx = canvas.getContext("2d");

    ctx.lineWidth = 3;
    ctx.strokeStyle = "#000";
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    for (var n = 0; n < pathArr.length; n++) {
        var path = pathArr[n];

        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        for (var k = 1; k < path.length; k++) {
            ctx.lineTo(path[k].x, path[k].y);
        }
        ctx.stroke();
    }

    ctx.fillStyle = "#5f5";

    var found = false;
    var distance = 0;
    for (var n = 0; n < pathArr.length; n++) {
        var path = pathArr[n];
        for (var k = 1; k < path.length; k++) {
            if (distance+k == currentPosition) {
                ctx.beginPath();
                ctx.arc(path[k].x, path[k].y, 2.5, 0, (Math.PI*2));
                ctx.fill();
                found = true;
                break;
            }
        }
        distance += path.length;
        if (found) break;
    }
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