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

    titleView = document.createElement("span");
    titleView.style.position = "absolute";
    titleView.style.color = "#fff";
    titleView.innerText = "TÍTULO";
    titleView.style.textAlign = "center";
    titleView.style.left = ((sw/2)-50)+"px";
    titleView.style.top = ((sh/2)-(sw/2))+"px";
    titleView.style.width = (100)+"px";
    titleView.style.height = (25)+"px";
    titleView.style.zIndex = "15";
    //document.body.appendChild(titleView);

    userInteracted = false;
    oscillatorStarted = false;
    pictureView.ontouchstart = function() {
        if (userInteracted && !oscillatorStarted) {
            if (mic.closed) mic.open(false, 50);
            //oscillator.start();
            oscillatorStarted = true;

            //document.body.requestFullscreen();
        }
        angle = -(Math.PI/4);
        frequencyDirection = 1;
    };

    pictureView.ontouchend= function() {
        userInteracted = true;
        angle = 0;
        frequencyDirection = -1;
    }

    drawAcc(60, effectRatio);

    oscillator = createOscillator();
    oscillator.volume.gain.value = 1;
    oscillator.frequency.value = 5;

    motion = false;
    gyroUpdated = function(e) {
        var co = e.accY;
        var ca = e.accX > e.accZ ? e.accX : e.accZ;
        angle = -(_angle2d(co, ca)-(Math.PI/2));

        frequencyDirection = angle < 0 ? 
        Math.ceil((5/(Math.PI/4))*(-angle)) : -1;
    }

    isRecording = false;
    recordedAudio = new Audio();
    mode = 1;

    micTime = 0;
    mic = new EasyMicrophone();
    mic.onsuccess = function() { 
        console.log("mic open");
        //mic.audio.srcObject = mic.audioStream.mediaStream;
        //mic.audio.play();
    };
    mic.onupdate = function(freqArray, reachedFreq, avgValue) {
        if (recordedAudio.paused)
        micAvgValue = avgValue;

        var currentTime = new Date().getTime();
        if (isRecording && currentTime - micTime > 1000) {
            mic.stopRecording(function(url) {
                isRecording = false;
                mode = 1;
                console.log("recording stopped");
                recordedAudio.src = url;
                recordedAudio.play();
            });
        }
        else if (!isRecording && 
            recordedAudio.paused && micAvgValue > 0.1) {
            isRecording = true;
            mode = 0;
            console.log("started recording");
            mic.record();
            micTime = currentTime;
        }
        else if (micAvgValue > 0.1) {
            micTime = currentTime;
        }

        if (isRecording)
        angle = -micAvgValue*(Math.PI/4);
        frequencyDirection = angle < 0 ? 
        Math.ceil((5/(Math.PI/4))*(-angle)) : -1;

        resumedWave = resumeWave(freqArray);
    };
    mic.onclose = function() { 
        console.log("mic closed");
    };
    var ab = new Array(50);
    for (var n = 0; n < 50; n++) {
        ab[n] = 0;
    }
    resumedWave = ab;

    loadImages();

    drawImage();
    animate();
});

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

var drawAB = 
function(freqArray=false, avgValue=0) {
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
            x: (n*(canvas.width/freqArray.length)),
            y0: (sh/2)+(sw/2)+25+
            (-freqArray[n]*25),
            y1: (sh/2)+(sw/2)+25+
            (freqArray[n]*25)
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

var drawAB_rounded = 
function(freqArray=false, avgValue=0) {
    var canvas = pictureView;
    var ctx = canvas.getContext("2d");

    var offset = 0;
    var polygon = [];

    // create waveform A
    if (freqArray) 
    for (var n = 0; n < freqArray.length; n++) {
        var c = { 
            x: (sw/2),
            y: (sh/2)
        };
        var p0 = { 
            x: (sw/2),
            y: (sh/2)-(sw/4)
        };
        var p1 = { 
            x: (sw/2),
            y: (sh/2)-(sw/4)-(freqArray[n]*25)
        };

        var rp0 = _rotate2d(c, p0, (n*(360/freqArray.length)));
        var rp1 = _rotate2d(c, p1, (n*(360/freqArray.length)));

        var obj = {
            x0: rp0.x,
            y0: rp0.y,
            x1: rp1.x,
            y1: rp1.y,
            value: freqArray[n]
        };
        polygon.push(obj);

        //updatePhiSegmentState(n, freqArray);
    }

    // draw waveform A
    ctx.lineWidth = 3;

    if (freqArray) {
        ctx.beginPath();
        ctx.moveTo(polygon[0].x1, polygon[0].y1);
    }
    if (freqArray)
    for (var n = 1; n < polygon.length; n++) {
        ctx.strokeStyle = 
        getColor((1/(polygon.length-1))*n, true, 
        (1-polygon[n].value));

        ctx.beginPath();
        ctx.moveTo(polygon[n-1].x1, polygon[n-1].y1);
        ctx.lineTo(polygon[n].x1, polygon[n].y1);
        ctx.stroke();
    }

    ctx.strokeStyle = 
    getColor(1, true, (1-polygon[0].value));

    ctx.beginPath();
    ctx.moveTo(
        polygon[polygon.length-1].x1, 
        polygon[polygon.length-1].y1);
    ctx.lineTo(polygon[0].x1, polygon[0].y1);
    ctx.stroke();
};

var getColor = function(brightness, toString, opacity=1) {
    var direction = frequencyDirection > 0 ? 1 : 0;
    var rgb = [ 0, 0, 255 ];
    if (brightness < 0.25) {
        rgb[0] = ((1*direction)*((1-((1/0.25)*brightness)) * (128)));

        rgb[1] = ((1/0.25)*brightness) * (255);
    }
    else if (brightness < 0.50) {
        rgb = [ 0, 255, 255 ];
        rgb[2] = (1-((1/0.25)*(brightness-0.25))) * (255);
    }
    else if (brightness < 0.75) {
        rgb = [ 0, 255, 0 ];
        rgb[0] = ((1/0.25)*(brightness-0.5)) * (255);
    }
    else if (brightness <= 1) {
        rgb = [ 255, 255, 0 ];

        rgb[0] = 255-((1*direction)*(((1/0.25)*(brightness-0.75)) * (128)));
        rgb[2] = (1*direction)*(((1/0.25)*(brightness-0.75)) * (255));

        rgb[1] = (1-((1/0.25)*(brightness-0.75))) * (255);
    }

    if (toString)
    rgb = "rgba("+rgb[0]+","+rgb[1]+","+rgb[2]+","+opacity+")";

    return rgb;
};

var img_list = [
    "img/picture-4.png",
    "img/picture-3.png"
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

var drawAcc = function(length = 15, effect = 0.01) {
    var c0 = { x: 0, y: 0 };
    var c1 = { x: 0, y: 0 };

    var p0 = { x: c0.x, y: c0.y+0.5 };
    var p1 = { x: c1.x, y: c1.y-0.5 };

    var size = Math.floor(length/3);

    frequencyPath = [];
    frequencyPath.push({ x: -0.5, y: 0.5 });
    for (var n = 0; n < size; n++) {
        frequencyPath.push({ x: -0.5+((0.5/size))*n, y: 0.5, angle: 0 });
    }
    for (var n = 0; n < size; n++) {
        var pe = { ...p0 };
        pe.y += (-(effect/2)+(Math.random()*effect));
        var rp = _rotate2d(c0, pe, n*(180/size));
        rp.angle = n*(180/size);
        frequencyPath.push(rp);
    }
    for (var n = 0; n < size; n++) {
        var pe = { ...p1 };
        pe.y += (-(effect/2)+(Math.random()*effect));
        var rp = _rotate2d(c1, pe, n*(180/size));
        rp.angle = 180+(n*(180/size));
        frequencyPath.push(rp);
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

var frequencyDirection = 0;
var frequencyNo = 0;
var lap = 0;

var updateImage = true;

var updateTime = 0;
var renderTime = 0;
var elapsedTime = 0;
var animationSpeed = 0;

var effectRatio = 0;

var animate = function() {
    elapsedTime = new Date().getTime()-renderTime;
    if (!backgroundMode) {
        if ((new Date().getTime() - updateTime) > 1000) {
            updateTime = new Date().getTime();
        }

        frequencyNo += frequencyDirection;

        if (frequencyNo > (frequencyPath.length-1)) {
             frequencyNo = 20;
             if (lap < 10) lap += 1;
             drawAcc(60, (effectRatio/lap));
        }

        if (frequencyNo < 0) {
             frequencyNo = 0;
             lap = 0;
             drawAcc(60, effectRatio);
        }

        oscillator.frequency.value = 
        (5+(lap*5) - 
        (frequencyPath[frequencyNo].y*10));

        drawImage();
    }
    renderTime = new Date().getTime();
    requestAnimationFrame(animate);
};

var angle = 0;
var distance = 0;

var drawImage = function() {
    var ctx = pictureView.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, sw, sh);

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, sw, sh);

    if (imagesLoaded) {
        ctx.save();
        ctx.translate((sw/2), (sh/2));
        ctx.rotate(-frequencyPath[frequencyNo].angle*(Math.PI/180));
        ctx.translate(-(sw/2), -(sh/2));

        var size = {
            width: img_list[mode].naturalWidth,
            height: img_list[mode].naturalHeight
        };
        var frame = {
            width: getSquare(size),
            height: getSquare(size)
        };
        var format = fitImageCover(size, frame);

        ctx.drawImage(img_list[mode], 
        -format.left, -format.top, frame.width, frame.height, 
        (sw/2)-(sw/4), (sh/2)-(sw/4), 
        (sw/2), (sw/2));

        ctx.restore();
    }

    ctx.lineWidth = 1;
    ctx.strokeStyle = "#fff";
    ctx.fillStyle = "#fff";

    ctx.beginPath();
    ctx.moveTo((sw/2), (sh/2)-(sw/2));
    ctx.lineTo((sw/2), (sh/2)-(sw/4));
    //ctx.stroke();

    ctx.beginPath();
    ctx.moveTo((sw/2), (sh/2)+(sw/4));
    ctx.lineTo((sw/2), (sh/2)+(sw/2));
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(
    (sw/2)+(frequencyPath[0].x*(sw/2)), 
    (sh/2)+(frequencyPath[0].y*(sw/2)));
    for (var n = 1; n < frequencyPath.length; n++) {
        ctx.lineTo(
        (sw/2)+(frequencyPath[n].x*(sw/2)), 
        (sh/2)+(frequencyPath[n].y*(sw/2)));
    }
    //ctx.stroke();

    distance = lap < 10 ? 0 : (distance+1);
    var posX = 
    (sw/2)+(frequencyPath[frequencyNo].x*(sw/2)) + 
    ((((sw/2) - 
    ((sw/2)+(frequencyPath[frequencyNo].x*(sw/2))))/10)*lap);
    var posY = 
    (sh/2)+(frequencyPath[frequencyNo].y*(sw/2)) + 
    (((((sh/2)+(sw/2)) - 
    ((sh/2)+(frequencyPath[frequencyNo].y*(sw/2))))/10)*lap)-
    distance;

    ctx.beginPath();
    ctx.arc(
    (sw/2)+(frequencyPath[frequencyNo].x*(sw/2)), 
    (sh/2)+(frequencyPath[frequencyNo].y*(sw/2)), 
    10, 0, (Math.PI*2));
    //ctx.arc(posX, posY, 10*(1-(1/10)*lap), 0, (Math.PI*2));
    ctx.fill();

    /*
    var scale = 0.5+,((0.5/10)*lap);
    ctx.beginPath();
    ctx.rect(posX-(scale*5), posY-(scale*10), 
    scale*10, scale*20);
    ctx.fill();*/

    if (lap > 0) {
        ctx.beginPath();
        ctx.arc(
        (sw/2)+(frequencyPath[0].x*(sw/2))-30, 
        (sh/2)+(frequencyPath[0].y*(sw/2)), 
        10, 0, (Math.PI*2));
        //ctx.fill();
    }

    if (lap > 1) {
        ctx.beginPath();
        ctx.arc(
        (sw/2)+(frequencyPath[0].x*(sw/2))-60, 
        (sh/2)+(frequencyPath[0].y*(sw/2)), 
        10, 0, (Math.PI*2));
        //ctx.fill();
    }

    ctx.save();
    ctx.translate((sw/2), (sh/2));
    ctx.rotate(angle);
    ctx.translate(-(sw/2), -(sh/2));

    ctx.beginPath();
    ctx.moveTo((sw/2), (sh/2)-(sw/4));
    ctx.lineTo((sw/2), (sh/2)+(sw/4));
    //ctx.stroke();

    ctx.restore();

    //drawAB(resumedWave);
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