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

    textView = document.createElement("span");
    textView.style.objectFit = "cover";
    textView.style.position = "absolute";
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

    text = "";
    direction = -1;
    lineHeight = (swo/2);
    perfectMargin = 0.01;

    pause = false;
    startX = 0;
    startY = 0;
    objX = 0;
    objY = 0;

    hitCount = 0;

    userInteracted = false;

    poorCount = 0;
    goodCount = 0;
    greatCount = 0;
    perfectCount = 0;

    buttonMap = [ 0, 1, 2, 3 ];

    pictureView.ontouchstart = function(e) {
        if (userInteracted && oscillator.paused) {
            oscillator.start();
            oscillator.paused = false;
        }

        if (e.touches[0].clientX < 100) return;

        direction = 
        buttonMap[Math.floor((e.touches[0].clientX-100)/(swo/4))];

        var thereIsObject = false;
        for (var n = 0; n < positionArr.length; n++) {
            var obj = positionArr[n];
            if (obj.direction == direction) {
                thereIsObject = true;
                break;
            }
        }

        if (!thereIsObject) {
            text = "FAILED";

            pause = true;
            startX = lineArr[direction];
            startY = ((sh/2)+(sh/4));
            objX = lineArr[direction];
            objY = 0;

            return;
        }

        if (positionArr.length > 0) {
            var distanceY0 = Math.abs(((sh/2)+(sh/4)) - positionArr[0].y);
            var hit0 = (1/(lineHeight))*distanceY0;

            console.log(" --- hit no: "+hitCount);
            console.log("direction: "+direction);

            console.log(" --- obj #0");
            console.log("direction: "+positionArr[0].direction);
            console.log("distance: "+distanceY0);
            console.log("hit value: "+hit0);
        }

        if (positionArr.length > 1) {
            var distanceY1 = Math.abs(((sh/2)+(sh/4)) - positionArr[1].y);
            var hit1 = (1/(lineHeight))*distanceY1;

            console.log(" --- obj #1");
            console.log("direction: "+positionArr[1].direction);
            console.log("distance: "+distanceY1);
            console.log("hit value: "+hit1);

            hitCount += 1;
        }

        for (var n = 0; n < positionArr.length; n++) {
            var obj = positionArr[n];

            var setLine = Math.floor((sh/2)+(sh/4));

            var distanceY = Math.abs(setLine - obj.y);
            var hit = (1/(lineHeight))*distanceY;

            console.log("failed", 
            (obj.direction == direction),
            (distanceY > (lineHeight)));

            console.log("accepted", 
            (obj.direction == direction),
            (distanceY <= (lineHeight)));

            if (obj.direction == direction && distanceY > (lineHeight)) {
                //positionArr = [];
                text = "FAILED";

                textView.innerText = text;
                textView.style.display = "initial";

                obj.highlight = true;

                pause = true;
                startX = lineArr[obj.direction];
                startY = ((sh/2)+(sh/4));
                objX = lineArr[obj.direction];
                objY = obj.y;

                audioStream.pause();

                break;
            }
            else if (obj.direction == direction && 
                distanceY <= (lineHeight)) {
                obj.remove = true;
                if (hit >= 0 && hit <= (0 + perfectMargin)) text = "PERFECT";
                else if (hit < 0.25) text = "GREAT";
                else if (hit < 0.75) text = "GOOD";
                else text = "POOR";

                sfxPool.play("audio/sfx-"+(text.toLowerCase())+".wav");
                //oscillator.frequency.value = (1-hit)*250;

                switch (text) {
                    case "POOR":
                        poorCount += 1;
                        break;
                    case "GOOD":
                        goodCount += 1;
                        break;
                    case "GREAT":
                        greatCount += 1;
                        break;
                    case "PERFECT":
                        perfectCount += 1;
                        break;
                }

                showText(text);

                //pause = true;
                startX = lineArr[obj.direction];
                startY = ((sh/2)+(sh/4));
                objX = lineArr[obj.direction];
                objY = obj.y;

                //audioStream.play();

                positionArr = positionArr.filter((o) => { return !o.remove; });
                break;
            }
        }
    };

    oscillator = createOscillator();
    oscillator.paused = true;
    oscillator.volume.gain.value = 1;

    pictureView.ontouchend = function(e) {
        direction = -1;
        userInteracted = true;
    };

    drawImage();
    animate();
});

var updateImage = true;

var updateTime = 0;
var renderTime = 0;
var elapsedTime = 0;
var animationSpeed = 0;

var animate = function() {
    elapsedTime = new Date().getTime()-renderTime;
    if (!backgroundMode) {
        if ((new Date().getTime() - updateTime) > 2500) {
            var dir = Math.floor(Math.random()*4);
            var obj = {
                y: Math.floor(-(sw/8)),
                direction: dir,
                remove: false,
                hightlight: false
            };
            positionArr.push(obj);

            updateTime = new Date().getTime();
        }

        drawImage();
    }
    renderTime = new Date().getTime();

    if (audioStream.currentTime > 7)
    audioStream.currentTime = 0;

    if (!pause)
    requestAnimationFrame(animate);
};

var positionArr = [];

var directionArr = [  -90, 0, -270, -180 ];
var lineArr = [ 
    (swo/4)-(swo/8), 
    ((swo/4)*2)-(swo/8), 
    ((swo/4)*3)-(swo/8), 
    ((swo/4)*4)-(swo/8) 
];

var drawButton = function(ctx, x, y, size, color, direction) {
    ctx.lineWidth = 3;
    ctx.strokeStyle =color;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(directionArr[direction]*(Math.PI/180));

    ctx.beginPath();
    ctx.moveTo(-(size/4), -(size/10));
    ctx.lineTo(0, -(size/3));
    ctx.lineTo(0, (size/3));
    ctx.lineTo(0, -(size/3));
    ctx.lineTo((size/4), -(size/10));
    ctx.stroke();

    ctx.beginPath();
    ctx.roundRect(-(size/2), -(size/2), size, size, (size/10));
    ctx.stroke();

    ctx.restore();
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
    ctx.moveTo(0, ((sh/2)+(sh/4))-(lineHeight));
    ctx.lineTo(sw, ((sh/2)+(sh/4))-(lineHeight));
    ctx.stroke();

    ctx.fillStyle = "#fff";
    ctx.font = "10px sans serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("POOR: "+poorCount, 0, ((sh/2)+(sh/4))-(lineHeight));

    ctx.beginPath();
    ctx.moveTo(0, ((sh/2)+(sh/4))-(lineHeight*0.75));
    ctx.lineTo(sw, ((sh/2)+(sh/4))-(lineHeight*0.75));
    ctx.stroke();

    ctx.fillStyle = "#fff";
    ctx.font = "10px sans serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("GOOD: "+goodCount, 
    0, ((sh/2)+(sh/4))-(lineHeight*0.75));

    ctx.beginPath();
    ctx.moveTo(0, ((sh/2)+(sh/4))-(lineHeight*0.25));
    ctx.lineTo(sw, ((sh/2)+(sh/4))-(lineHeight*0.25));
    ctx.stroke();

    ctx.fillStyle = "#fff";
    ctx.font = "10px sans serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("GREAT: "+greatCount, 
    0, ((sh/2)+(sh/4))-(lineHeight*0.25));

    ctx.beginPath();
    ctx.moveTo(0, ((sh/2)+(sh/4))-(lineHeight*(0+perfectMargin)));
    ctx.lineTo(sw, ((sh/2)+(sh/4))-(lineHeight*(0+perfectMargin)));
    ctx.stroke();

    ctx.fillStyle = "#fff";
    ctx.font = "10px sans serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("PERFECT: "+perfectCount, 0, 
    ((sh/2)+(sh/4))-(lineHeight*(0+perfectMargin)));

    var y = (sh/2)+(sh/4);

    for (var n = 0; n < positionArr.length; n++) {
        var obj = positionArr[n];

        var distanceY = ((sh/2)+(sh/4)) - obj.y;
        if (distanceY < -(sw/4)) {
            text = "FAILED";

            textView.innerText = text;
            textView.style.display = "initial";

            obj.highlight = true;

            pause = true;
            startX = lineArr[obj.direction];
            startY = ((sh/2)+(sh/4));
            objX = lineArr[obj.direction];
            objY = obj.y;

            audioStream.pause();
        }

        var x = lineArr[obj.direction];
        var color = obj.highlight ? "#5f5" : "#777";
        drawButton(ctx, 100+x, obj.y, (swo/4)-10, color, obj.direction);

        obj.y += 1;
    }

    var colorArr = [
        direction == 0 ? "#fff" : "#555",
        direction == 1 ? "#fff" : "#555",
        direction == 2 ? "#fff" : "#555",
        direction == 3 ? "#fff" : "#555"
    ];

    drawButton(ctx, 100+(swo/4)-(swo/8), y, (swo/4)-5, colorArr[0], 0);
    drawButton(ctx, 
    100+((swo/4)*2)-(swo/8), y, (swo/4)-5, colorArr[1], 1);
    drawButton(ctx, 
    100+((swo/4)*3)-(swo/8), y, (swo/4)-5, colorArr[2], 2);
    drawButton(ctx, 
    100+((swo/4)*4)-(swo/8), y, (swo/4)-5, colorArr[3], 3);

    if (pause) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#5f5";

        ctx.beginPath();
        ctx.moveTo(100+startX, startY);
        ctx.lineTo(100+objX, objY);
        ctx.stroke();
    }
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