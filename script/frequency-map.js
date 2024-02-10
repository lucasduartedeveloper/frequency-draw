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

    camera = document.createElement("video");
    camera.style.position = "absolute";
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
    oscillatorStarted = false;

    position = {
        x: (sw/2),
        y: (sh/2)
    };

    selected = false;
    startX = (sw/2);
    startY = (sh/2);
    diffX = 0;
    diffY = 0;
    moveX = (sw/2);
    moveY = (sh/2);

    pictureView.ontouchstart = function(e) {
        if (userInteracted && !oscillatorStarted) {
            //if (!cameraOn) startCamera();
            if (navigator.getUserMedia && mic.closed) mic.open(false, 50);
            //oscillator.start();
            oscillatorStarted = true;

            //document.body.requestFullscreen();
        }
        angle = -(Math.PI/4);
        frequencyDirection = 1;

        if (e.touches.length < 2) return;

        posX0 = e.touches[0].clientX;
        posY0 = e.touches[0].clientY;

        posX1 = e.touches[1].clientX;
        posY1 = e.touches[1].clientY;

        startX = posX0+((posX1-posX0)/2);
        startY = posY0+((posY1-posY0)/2);

        diffX = startX-position.x;
        diffY = startY-position.y;

        if (startX > (position.x - (25)) && startX < (position.x + (25)) && 
            startY > (position.y - (25)) && startY < (position.y + (25))) {
            selected = true;
        }
        else selected = false;

        //console.log(startX, startY, position, selected);
    };

    pictureView.ontouchmove = function(e) {
        if (e.touches.length < 2) return;

        posX0 = e.touches[0].clientX;
        posY0 = e.touches[0].clientY;

        posX1 = e.touches[1].clientX;
        posY1 = e.touches[1].clientY;

        moveX = posX0+((posX1-posX0)/2);
        moveY = posY0+((posY1-posY0)/2);

        if (selected) {
            position.x = moveX-diffX;
            position.y = moveY-diffY;
        }
    };

    pictureView.ontouchend = function() {
        userInteracted = true;
        angle = 0;
        frequencyDirection = -1;
    };

    var versionName = "v0.9";

    titleView = document.createElement("span");
    titleView.style.position = "absolute";
    titleView.style.display = "none";
    titleView.style.color = "#fff";
    titleView.innerText = "REPLAY";
    titleView.style.textAlign = "center";
    titleView.style.left = ((sw/2)-75)+"px";
    titleView.style.top = ((sh/2)-(sw/2))+"px";
    titleView.style.width = (150)+"px";
    titleView.style.height = (25)+"px";
    titleView.style.zIndex = "15";
    document.body.appendChild(titleView);

    drawAcc(60, effectRatio);

    oscillator = createOscillator();
    oscillator.volume.gain.value = 1;
    oscillator.frequency.value = 5;

    previousOffset = 0;

    motion = false;
    gyroUpdated = function(e) {
        var accX = Math.abs(e.accX);
        var accY = Math.abs(e.accY);
        var accZ = Math.abs(e.accZ);

        var offset = ((accX+accY+accZ)/3);
        if (Math.abs(offset-previousOffset) > 1) {
            var image_options = [ 0, 1, 2, 3, 4, 5 ];
            var mode0 = 
            image_options .splice(
            Math.floor(Math.random()*image_options.length), 1);
            var mode1 = 
            image_options .splice(
            Math.floor(Math.random()*image_options.length), 1);

            modeArr[0] = mode0[0];
            modeArr[1] = mode1[0];

            previousOffset = offset;
        }
    }

    isRecording = false;
    plabackRate = 0.5;

    plabackRateView = document.createElement("span");
    plabackRateView.style.position = "absolute";
    plabackRateView.style.color = "#fff";
    plabackRateView.innerText = "PLAYBACK "+plabackRate+"x";
    plabackRateView.style.textAlign = "left";
    plabackRateView.style.left = (10)+"px";
    plabackRateView.style.top = (sh-35)+"px";
    plabackRateView.style.width = (150)+"px";
    plabackRateView.style.height = (25)+"px";
    plabackRateView.style.zIndex = "15";
    document.body.appendChild(plabackRateView);

    plabackRateView.onclick = function() {
        plabackRate = (plabackRate+0.5) < 2.5 ?
        (plabackRate+0.5) : 0.5;
        plabackRateView.innerText = "PLAYBACK "+plabackRate+"x";
    };

    media = 0;
    recordingAvgValue = 0;

    recordedAudio = new Audio("audio/glass-breaking_sfx.wav");
    //recordedAudio.volume = 0;

    effectLayer = new Audio();

    recordedAudio.oncanplay = function() {
        var duration = (recordedAudio.duration*1000);
        duration = duration != Infinity ? duration : 0;

        console.log("recording duration: "+
            duration + " " + moment(duration).format("mm:ss")
        );

        recordedAudio.playbackRate = plabackRate;
        recordedAudio.preservesPitch = false;

        var audioCtx = 
        new(window.AudioContext || window. webkitAudioContext)();

        return;
        var source = 
        audioCtx.createMediaElementSource(recordedAudio);

        var pitchShift = new Tone.PitchShift();
        pitchShift.pitch = 1;

        source.connect(pitchShift);
        pitchShift.toMaster();

        /*
        var delay = audioCtx.createDelay(0.5);
        delay.connect(audioCtx.destination);

        var biquadFilter = audioCtx.createBiquadFilter();
        biquadFilter.type = "lowpass";
        biquadFilter.frequency.value = 100;
        biquadFilter.connect(delay);

        // As a consequence of calling createMediaElementSource(), audio playback from the HTMLMediaElement will be re-routed into the processing graph of the AudioContext. So playing/pausing the media can still be done through the media element API and the player controls.

        source.connect(biquadFilter);*/
    };

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

                mode = 1;
                isRecording = false;

                console.log("recording stopped");
                recordedAudio.src = url;
                recordedAudio.play();
            });
        }
        else if (!isRecording && 
            recordedAudio.paused && micAvgValue > 0.1) {

            mode = 0;
            isRecording = true;

            //console.clear();
            console.log("started recording");
            mic.record();
            micTime = currentTime;
        }
        else if (micAvgValue > 0.1) {
            micTime = currentTime;
        }

        if (isRecording) { 
            angle = -micAvgValue*(Math.PI/4);
            frequencyDirection = angle < 0 ? 
            Math.ceil((5/(Math.PI/4))*(-angle)) : -1;
        }
        else {
            frequencyNo = 0;
            angle = 0;
        }

        if (recordedAudio.paused)
        titleView.style.display = "none";
        else
        titleView.style.display = "initial";

        if (isRecording)
        resumedWave = resumeWave(freqArray);
        else {
            var ab = new Array(4);
            for (var n = 0; n < 4; n++) {
                ab[n] = 0;
            }
            resumedWave = ab;
        }
    };
    mic.onclose = function() { 
        console.log("mic closed");
    };
    var ab = new Array(4);
    for (var n = 0; n < 4; n++) {
        ab[n] = 0;
    }
    resumedWave = ab;

    loadImages();

    drawImage();
    animate();
});

var modeArr = [ 0, 1 ];
var getImage = function() {
    return img_list[modeArr[mode]];
};

var resumeWave = function(freqArray) {
    var blocks = 4;
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
function(freqArray=false, avgValue=0, offset=0) {
    var canvas = pictureView;
    var ctx = canvas.getContext("2d");

    var polygon = [];

    // create waveform A
    if (freqArray) 
    for (var n = 0; n < freqArray.length; n++) {
        var c = { 
            x: position.x,
            y: position.y
        };
        var p0 = { 
            x: position.x,
            y: position.y-(sw/16)
        };
        var p1 = { 
            x: position.x,
            y: position.y-(sw/16)-offset-(freqArray[n]*25)
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

    ctx.fillStyle = "#fff";

    if (freqArray) {
        ctx.beginPath();
        ctx.moveTo(polygon[0].x1, polygon[0].y1);
    }
    if (freqArray)
    for (var n = 1; n < polygon.length; n++) {
        ctx.lineTo(polygon[n].x1, polygon[n].y1);
    }
    ctx.lineTo(polygon[0].x1, polygon[0].y1);
    ctx.fill();

    // draw waveform A
    ctx.lineWidth = 3;

    if (freqArray) {
        ctx.beginPath();
        ctx.moveTo(polygon[0].x1, polygon[0].y1);
    }
    if (freqArray)
    for (var n = 1; n < polygon.length; n++) {
        ctx.strokeStyle = 
        getColor((1/(polygon.length-1))*(n-1), true, 
        (1-polygon[n].value));

        ctx.beginPath();
        ctx.moveTo(polygon[n-1].x1, polygon[n-1].y1);
        ctx.lineTo(polygon[n].x1, polygon[n].y1);
        //ctx.arc(polygon[n].x1, polygon[n].y1, 2.5, 0, (Math.PI*2));
        //ctx.stroke();
    }

    ctx.strokeStyle = 
    getColor(1, true, (1-polygon[0].value));

    ctx.beginPath();
    ctx.moveTo(
        polygon[polygon.length-1].x1, 
        polygon[polygon.length-1].y1);
    ctx.lineTo(polygon[0].x1, polygon[0].y1);
    //ctx.stroke();
};

var getColor = function(brightness, toString, opacity=1) {
    var direction = 0;

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
    "img/picture-3.png",
    "img/picture-5.png",
    "img/picture-6.png",
    "img/picture-7.png",
    "img/picture-8.png"
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
    //ctx.fillRect(0, 0, sw, sh);

    if (imagesLoaded) {
        ctx.save();
        ctx.translate((sw/2), (sh/2));
        ctx.rotate(-frequencyPath[frequencyNo].angle*(Math.PI/180));
        ctx.translate(-(sw/2), -(sh/2));

        var image = getImage();
        var size = {
            width: image.naturalWidth,
            height: image.naturalHeight
        };
        var frame = {
            width: getSquare(size),
            height: getSquare(size)
        };
        var format = fitImageCover(size, frame);

        /*
        ctx.drawImage(image, 
        -format.left, -format.top, frame.width, frame.height, 
        (sw/2)-(sw/4), (sh/2)-(sw/4), 
        (sw/2), (sw/2));*/

        ctx.restore();
    }

    ctx.lineWidth = 1;
    ctx.strokeStyle = "#fff";
    ctx.fillStyle = "#000";

    ctx.beginPath();
    ctx.rect((sw/2)+25, (sh/2)+(sw/2)-50, 50, 50);
    //ctx.stroke();

    ctx.beginPath();
    ctx.rect((sw/2)+30, (sh/2)+(sw/2)-45, 50, 50);
    //ctx.fill();
    //ctx.stroke();

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
    //ctx.stroke();

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
    //ctx.fill();

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

    ctx.save();
    ctx.translate(position.x, position.y);
    ctx.rotate((Math.PI/4));
    ctx.translate(-position.x, -position.y);

    drawAB_rounded(resumedWave, 0);

    ctx.restore();

    ctx.beginPath();
    ctx.arc(moveX, moveY, 2.5, 0, (Math.PI*2));
    //ctx.fill();
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