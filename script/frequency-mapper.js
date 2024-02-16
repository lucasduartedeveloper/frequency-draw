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

    pictureView.ontouchstart = function(e) {
        if (!cameraOn)
        startCamera();

        for (var n = 0; n < e.touches.length; n++) {
            var startX = e.touches[n].clientX;
            var startY = e.touches[n].clientY;

            if (startX > input.move.x-(sw/8) && 
                 startX < input.move.x+(sw/8) && 
                 startY > input.move.y-(sw/8) && 
                 startY < input.move.y+(sw/8)) {
                 var c = { x: 0, y: 0 };
                 var p = { 
                     x: startX-input.move.x,
                     y: startY-input.move.y
                 };
                 var v = Math.normalize(p, 1);
                 var angle = _angle2d(v.x, v.y);
                 angle = angle*(180/Math.PI);
                 angle = 360-(angle < 0 ? (360+angle) : angle);

                 var value = Math.round((8/360)*angle);
                 value = value == 8 ? 0 : value;

                 //console.log(value);
                 input.move.value = value;

                 var pos = { ...positionArr[0] };
                 switch (value) {
                     case 0:
                         pos.y -= 1;
                         break;
                     case 1:
                         pos.x -= 1;
                         pos.y -= 1;
                         break;
                     case 2:
                         pos.x -= 1;
                         break;
                     case 3:
                         pos.x -= 1;
                         pos.y += 1;
                         break;
                     case 4:
                         pos.y += 1;
                         break;
                     case 5:
                         pos.x += 1;
                         pos.y += 1;
                         break;
                     case 6:
                         pos.x += 1;
                         break;
                     case 7:
                         pos.x += 1;
                         pos.y -= 1;
                         break;
                 };
                 //pos.divide = false;
                 positionArr.splice(0, 1, pos);
             }
             else if (startX > input.divide.x-(sw/8) && 
                 startX < input.divide.x+(sw/8) && 
                 startY > input.divide.y-(sw/8) && 
                 startY < input.divide.y+(sw/8)) {
                 //positionArr[0].divide = true;
                 divideArr.push({ ...positionArr[0] });
             }
             else {
                 map_startX = e.touches[0].clientX;
                 map_startY = e.touches[0].clientY;
             }
        }
    };

    imageRatio = 8;
    ratioView = document.createElement("span");
    ratioView.style.position = "absolute";
    ratioView.style.userSelect = "none";
    ratioView.style.color = "#fff";
    ratioView.innerText = imageRatio+"x/2";
    ratioView.style.textAlign = "center";
    ratioView.style.left = ((sw/2)-50)+"px";
    ratioView.style.top = (10)+"px";
    ratioView.style.width = (100)+"px";
    ratioView.style.height = (50)+"px";
    ratioView.style.zIndex = "15";
    document.body.appendChild(ratioView);

    ratioView.onclick = function() {
        var ratio = (imageRatio+2) < 18 ? 
        (imageRatio+2) : 1;
        ratio = (ratio > 1) ? (Math.floor(ratio/2)*2) : ratio;

        imageRatio = ratio;
        ratioView.innerText = imageRatio+"x/2";
    };

    pauseView = document.createElement("span");
    pauseView.style.position = "absolute";
    pauseView.style.userSelect = "none";
    pauseView.style.color = "#fff";
    pauseView.innerText = "PAUSE";
    pauseView.style.textAlign = "center";
    pauseView.style.left = ((sw/2)+60)+"px";
    pauseView.style.top = (10)+"px";
    pauseView.style.width = (100)+"px";
    pauseView.style.height = (50)+"px";
    pauseView.style.zIndex = "15";
    document.body.appendChild(pauseView);

    pauseView.onclick = function() {
        if (!camera.paused) {
            camera.pause();
        }
        else {
            camera.play();
        }
    };

    downloadView = document.createElement("span");
    downloadView.style.position = "absolute";
    downloadView.style.userSelect = "none";
    downloadView.style.color = "#fff";
    downloadView.innerText = "DOWNLOAD";
    downloadView.style.textAlign = "center";
    downloadView.style.left = ((sw/2)-160)+"px";
    downloadView.style.top = (10)+"px";
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

            resolutionCanvas = document.createElement("canvas");
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

            resolutionCanvas = document.createElement("canvas");
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

    map_startX = 0;
    map_startY = 0;

    map_offset = {
       x: 0, y: 0
    };

    map_acc = {
       x: 0, y: 0
    };

    pictureView.ontouchmove = function(e) {
        var map_moveX = e.touches[0].clientX - map_startX;
        var map_moveY = e.touches[0].clientY - map_startY;

        map_acc.x = -(map_moveX/8);
        map_acc.y = -(map_moveY/8);
    };

    pictureView.ontouchend = function(e) {
        input.move.value = -1;
    }

    oscillator = createOscillator();
    oscillator.volume.gain.value = 1;
    oscillator.frequency.value = 5;

    loadImages();

    drawImage();
    animate();
});

var modeArr = [ 0, 1 ];
var getImage = function() {
    return img_list[modeArr[mode]];
};

var img_list = [
    "img/wallpaper-0.png"
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

        map_offset.x += map_acc.x;
        map_offset.y += map_acc.y;

        var accX = map_acc.x - 1;
        var accY = map_acc.y - 1;

        if (accX < 0) accX = 0;
        if (accY < 0) accY = 0;

        map_acc.x = accX;
        map_acc.y = accY;

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

    ctx.save();
    ctx.translate(map_offset.x, map_offset.y);
    ctx.rotate(-(Math.PI/4));
    ctx.translate(-map_offset.x, -map_offset.y);

    ctx.save();
    ctx.translate(map_offset.x, map_offset.y);

    if (imagesLoaded) {
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

        ctx.drawImage(resolutionCanvas, 
        (sw/2)-(size.width/4), (sh/2)-(size.height/4), 
        (size.width/2), (size.height/2));
    }

    ctx.restore();
    ctx.restore();

    ctx.save();
    ctx.translate(map_offset.x, map_offset.y);

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

        ctx.drawImage(resolutionCanvas, 
        (sw/2)-(size.width/4), (sh/2)-(size.height/4), 
        (size.width/2), (size.height/2));
    }

    ctx.lineWidth = 2;
    ctx.strokeStyle = "#fff";

    ctx.beginPath();
    ctx.moveTo(positionArr[0].x*(sw/20), positionArr[0].y*(sw/20));
    for (var n = 1; n < positionArr.length; n++) {
        ctx.lineTo(positionArr[n].x*(sw/20), positionArr[n].y*(sw/20));
    }
    ctx.stroke();

    ctx.fillStyle = "#fff";

    for (var n = 0; n < positionArr.length; n++) {
        ctx.beginPath();
        ctx.arc(positionArr[n].x*(sw/20), positionArr[n].y*(sw/20), 5, 
        0, (Math.PI*2));
        //if (positionArr[n].divide)
        //ctx.fill();
    }

    for (var n = 0; n < divideArr.length; n++) {
        ctx.beginPath();
        ctx.arc(divideArr[n].x*(sw/20), divideArr[n].y*(sw/20), 3, 
        0, (Math.PI*2));
        //ctx.fill();
    }

    ctx.restore();

    var c = input.move;
    var p = {
        x: c.x,
        y: c.y-(sw/8)-5
    };

    ctx.lineWidth = 1;
    ctx.strokeStyle = "#fff";

    ctx.beginPath();
    ctx.arc(input.move.x, input.move.y, (sw/8), 
    0, (Math.PI*2));
    ctx.stroke();

    ctx.fillStyle = "#fff";

    for (var n = 0; n < 8; n++) {
        var rp = _rotate2d(c, p,  -n*(360/8));
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, 2, 
        0, (Math.PI*2));
        ctx.fill();
    }

    var c = { x: input.move.x, y: input.move.y };
    var p = { x: c.x, y: input.move.value > -1 ? c.y-(sw/8) : c.y };
    var rp = _rotate2d(c, p, input.move.value*(360/8));

    ctx.strokeStyle = "#fff";

    ctx.beginPath();
    ctx.arc(rp.x, rp.y, 10, 
    0, (Math.PI*2));
    ctx.stroke();

    ctx.strokeStyle = "#fff";

    ctx.beginPath();
    ctx.arc(input.divide.x, input.divide.y, (sw/8), 
    0, (Math.PI*2));
    ctx.stroke();

    ctx.fillStyle = "#fff";

    ctx.beginPath();
    ctx.arc(input.divide.x-7.5, input.divide.y, 10, 
    0, (Math.PI*2));
    ctx.fill();

    ctx.fillStyle = "#fff";

    ctx.beginPath();
    ctx.arc(input.divide.x+7.5, input.divide.y, 10, 
    0, (Math.PI*2));
    ctx.fill();
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