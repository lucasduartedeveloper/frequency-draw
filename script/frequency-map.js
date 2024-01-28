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

    userInteracted = false;
    oscillatorStarted = false;
    pictureView.ontouchstart = function() {
        if (userInteracted && !oscillatorStarted) {
            oscillator.start();
            oscillatorStarted = true;
        }
        frequencyDirection = 1;
    };

    pictureView.ontouchend= function() {
        userInteracted = true;
        frequencyDirection = -1;
    }

    var c = { x: 0, y: 0 };
    var p = { x: c.x, y: c.y+0.5 };

    frequencyPath = [];
    frequencyPath.push({ x: -0.5, y: 0.5 });
    for (var n = 0; n < 10; n++) {
        frequencyPath.push({ x: -0.5+((0.5/10))*n, y: 0.5 });
    }
    for (var n = 0; n < 10; n++) {
        var rp = _rotate2d(c, p, n*(180/10));
        frequencyPath.push(rp);
    }
    for (var n = 0; n < 10; n++) {
        frequencyPath.push({ x: -((0.5/10))*n, y: -0.5 });
    }
    frequencyPath.push({ x: -0.5, y: -0.5 });

    oscillator = createOscillator();
    oscillator.frequency.value = 100;

    drawImage();
    animate();
});

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

        frequencyNo += frequencyDirection;

        if (frequencyNo > (frequencyPath.length-1))
        frequencyNo = (frequencyPath.length-1);

        if (frequencyNo < 0)
        frequencyNo = 0;

        oscillator.frequency.value = 
        100 - (frequencyPath[frequencyNo].y*200);

        drawImage();
    }
    renderTime = new Date().getTime();
    requestAnimationFrame(animate);
};

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
    ctx.strokeStyle = "#fff";
    ctx.fillStyle = "#fff";

    ctx.beginPath();
    ctx.moveTo((sw/2), (sh/2)-(sw/2));
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
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(
    (sw/2)+(frequencyPath[frequencyNo].x*(sw/2)), 
    (sh/2)+(frequencyPath[frequencyNo].y*(sw/2)), 
    10, 0, (Math.PI*2));
    ctx.fill();

    ctx.restore();
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