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
    pictureView.onclick = function() {
        if (userInteracted) {
            if (!cameraOn)
            startCamera();
            else
            stopCamera();

            if (cameraOn)
            oscillator.stop();
            else
            oscillator.start();
        }
        else {
            userInteracted = true;
        }
    };

    divide = 1;
    divideView = document.createElement("button");
    divideView.style.position = "absolute";
    divideView.style.userSelect = "none";
    divideView.style.color = "#000";
    divideView.innerText = (divide);
    divideView.style.textAlign = "center";
    divideView.style.left = ((sw/2)-160)+"px";
    divideView.style.top = (sh-120)+"px";
    divideView.style.width = (100)+"px";
    divideView.style.height = (50)+"px";
    divideView.style.zIndex = "15";
    document.body.appendChild(divideView);

    divideView.onclick = function() {
        divide = (divide+0.5) < 3.5 ?  (divide+0.5) : 1;
        divideView.innerText = (divide);
        ratioView.innerText = imageRatio+"x/"+divide;
    };

    imageRatio = 1;
    ratioView = document.createElement("button");
    ratioView.style.position = "absolute";
    ratioView.style.userSelect = "none";
    ratioView.style.color = "#000";
    ratioView.innerText = imageRatio+"x/"+divide;
    ratioView.style.textAlign = "center";
    ratioView.style.left = ((sw/2)-50)+"px";
    ratioView.style.top = (sh-60)+"px";
    ratioView.style.width = (100)+"px";
    ratioView.style.height = (50)+"px";
    ratioView.style.zIndex = "15";
    document.body.appendChild(ratioView);

    ratioView.onclick = function() {
        var ratio = (imageRatio+2) < 18 ? 
        (imageRatio+2) : 1;
        ratio = (ratio > 1) ? (Math.floor(ratio/2)*2) : ratio;

        imageRatio = ratio;
        ratioView.innerText = imageRatio+"x/"+divide;
    };

    pauseView = document.createElement("button");
    pauseView.style.position = "absolute";
    pauseView.style.userSelect = "none";
    pauseView.style.color = "#000";
    pauseView.innerText = "PAUSE";
    pauseView.style.textAlign = "center";
    pauseView.style.left = ((sw/2)+60)+"px";
    pauseView.style.top = (sh-60)+"px";
    pauseView.style.width = (100)+"px";
    pauseView.style.height = (50)+"px";
    pauseView.style.zIndex = "15";
    document.body.appendChild(pauseView);

    pauseView.onclick = function() {
        if (!camera.paused) {
            setTimeout(function() {
                camera.pause();
            }, 10000);
        }
        else {
            camera.play();
        }
    };

    downloadView = document.createElement("button");
    downloadView.style.position = "absolute";
    downloadView.style.userSelect = "none";
    downloadView.style.color = "#000";
    downloadView.innerText = "DOWNLOAD";
    downloadView.style.textAlign = "center";
    downloadView.style.left = ((sw/2)-160)+"px";
    downloadView.style.top = (sh-60)+"px";
    downloadView.style.width = (100)+"px";
    downloadView.style.height = (50)+"px";
    downloadView.style.zIndex = "15";
    document.body.appendChild(downloadView);

    downloadView.onclick = function() {
        var resolutionCanvas;
        if (imagesLoaded && ! cameraOn) {
            var image = img_list[0];
            var size = {
                width: image.naturalWidth,
                height: image.naturalHeight
            };

            var resolutionCanvas = document.createElement("canvas");
            resolutionCanvas.width = (size.width/imageRatio);
            resolutionCanvas.height = (size.height/imageRatio);

            var resolutionCtx = resolutionCanvas.getContext("2d");
            resolutionCtx.imageSmoothingEnabled = false;

            resolutionCtx.drawImage(image, 
            0, 0, (size.width/imageRatio), (size.height/imageRatio));
        }

        if (cameraOn) {
            var image = camera;
            var size = {
                width: vw,
                height: vh
            };

            var resolutionCanvas = document.createElement("canvas");
            resolutionCanvas.width = (size.width/imageRatio);
            resolutionCanvas.height = (size.height/imageRatio);

            var resolutionCtx = resolutionCanvas.getContext("2d");
            resolutionCtx.imageSmoothingEnabled = false;

            resolutionCtx.drawImage(image, 
            0, 0, (size.width/imageRatio), (size.height/imageRatio));
        }

        var name = "download.png";
        var url = resolutionCanvas.toDataURL();
        var a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
    };

    oscillator = createOscillator();
    oscillator.volume.gain.value = 1;
    oscillator.frequency.value = 0;

    loadImages();

    motion = true;
    gyroUpdated = function(e) {
        oscillator.frequency.value = 50+((1/9.8)*e.accX)*50
    };

    sh = 539;
    drawImage();
    animate();
});

var modeArr = [ 0, 1 ];
var getImage = function() {
    return img_list[modeArr[mode]];
};

var img_list = [
    "img/picture-0.png",
    "img/weight-0.png"
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

        drawImage();
    }
    renderTime = new Date().getTime();
    requestAnimationFrame(animate);
};

var positionArr = [
    { x: (10), y: (20), divide: true }
];

var divideArr = [];

var input = {
    move: { 
        x: 25+((sw/4)/2),
        y: (sh-((sw/4)/2)-25),
        value: -1
    },
    divide: {
        x: (sw-((sw/4)/2)-25),
        y: (sh-((sw/4)/2)-25),
        value: -1
    }
};

var drawImage = function() {
    var ctx = pictureView.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, sw, sh);

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, sw, sh);

    if (imagesLoaded) {
        var image = img_list[0];
        var size = {
            width: image.naturalWidth,
            height: image.naturalHeight
        };
        var frame = {
            width: getWidth(size),
            height: getHeight(size)
        };

        var format = fitImageCover(size, frame);
        ctx.drawImage(image, 
        -format.left, -format.top, frame.width, frame.height,
        0, 0, sw, sh);

        var resolutionCanvas = document.createElement("canvas");
        resolutionCanvas.width = (sw/imageRatio);
        resolutionCanvas.height = (sh/imageRatio);

        var resolutionCtx = resolutionCanvas.getContext("2d");
        resolutionCtx.imageSmoothingEnabled = false;

        resolutionCtx.drawImage(pictureView, 
        (sw/2)-(sw/(divide*2)), 
        (sh/2)-(sh/(divide*2)), 
        (sw/divide), (sh/divide),
        0, 0, (sw/imageRatio), (sh/imageRatio));

        ctx.drawImage(resolutionCanvas, 
        (sw/2)-(sw/(divide*2)), 
        (sh/2)-(sh/(divide*2)), 
        (sw/divide), (sh/divide));
    }

    if (cameraOn) {
        var image = camera;
        var size = {
            width: vw,
            height: vh
        };
        var frame = {
            width: getWidth(size),
            height: getHeight(size)
        };

        var format = fitImageCover(size, frame);
        ctx.drawImage(image, 
        -format.left, -format.top, sw, sh,
        0, 0, sw, sh);

        var resolutionCanvas = document.createElement("canvas");
        resolutionCanvas.width = (sw/imageRatio);
        resolutionCanvas.height = (sh/imageRatio);

        var resolutionCtx = resolutionCanvas.getContext("2d");
        resolutionCtx.imageSmoothingEnabled = false;

        resolutionCtx.drawImage(pictureView, 
        (sw/2)-(sw/(divide*2)), 
        (sh/2)-(sh/(divide*2)), 
        (sw/divide), (sh/divide),
        0, 0, (sw/imageRatio), (sh/imageRatio));

        ctx.drawImage(resolutionCanvas, 
        (sw/2)-(sw/(divide*2)), 
        (sh/2)-(sh/(divide*2)), 
        (sw/divide), (sh/divide));
    }

    ctx.lineWidth = 1;
    ctx.strokeStyle = "#000";

    ctx.beginPath();
    ctx.rect((sw/2)-(sw/(divide*2)), 
    (sh/2)-(sh/(divide*2)), 
    (sw/divide), (sh/divide));
    ctx.stroke();
};

var getSquare = function(item) {
    var width = item.naturalWidth ? 
    item.naturalWidth : item.width;
    var height = item.naturalHeight ? 
    item.naturalHeight : item.height;

    return width < height ? width : height;
};

// 480x640 640x480
var getWidth = function(item) {
    var width = item.naturalWidth ? 
    item.naturalWidth : item.width;
    var height = item.naturalHeight ? 
    item.naturalHeight : item.height;

    var r0 = (sw/sh); //0.53
    var r1 = (width/height);

    return width < height ? width : height*r0;
};

var getHeight = function(item) {
    var width = item.naturalWidth ? 
    item.naturalWidth : item.width;
    var height = item.naturalHeight ? 
    item.naturalHeight : item.height;

    var r0 = (sh/sw); //1.85
    var r1 = (height/width);

    return width < height ? width*r0 : height;
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