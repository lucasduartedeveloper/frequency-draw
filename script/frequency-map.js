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

    document.body.style.overflowX = "scroll";

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

    var startX = 0;
    var startY = 0;
    var moveX = 0;
    var moveY = 0;

    userInteracted = false;
    pictureView.ontouchstart = function(e) {

        var value = 0.5+((1/(sw/2))*(e.touches[0].clientX-(sw/2)));
        value = value < 0 ? 0 : value;
        value = value > 1 ? 1 : value;
        //console.log(value);

        frequency = value*500;
        oscillator.frequency.value = frequency;
    };

    pictureView.ontouchmove = function(e) {
        var value = 0.5+((1/(sw/2))*(e.touches[0].clientX-(sw/2)));
        value = value < 0 ? 0 : value;
        value = value > 1 ? 1 : value;

        frequency = value*500;
        oscillator.frequency.value = frequency;
    };

    pictureView.ontouchend= function() {
        userInteracted = true;
    }

    bpmView = document.createElement("span");
    bpmView.style.position = "absolute";
    bpmView.style.userSelect = "none";
    bpmView.style.color = "#fff";
    bpmView.style.fontFamily = "Khand";
    bpmView.style.textAlign = "center";
    bpmView.innerText = invadersDefeated+" defeated";
    bpmView.style.left = ((sw/2)-50)+"px";
    bpmView.style.top = ((sh/2)-(sw/2)-50)+"px";
    bpmView.style.width = (100)+"px";
    bpmView.style.height = (25)+"px";
    bpmView.style.zIndex = "15";
    document.body.appendChild(bpmView);

    playView = document.createElement("button");
    playView.style.position = "absolute";
    playView.style.color = "#000";
    playView.style.fontFamily = "Khand";
    playView.style.textAlign = "center";
    playView.innerText = frequencyDirection == 1 ? 
    "stop" : "play";
    playView.style.left = ((sw/2)+(sw/4)+30)+"px";
    playView.style.top = ((sh/2)-(sw/2)-50)+"px";
    playView.style.width = (50)+"px";
    playView.style.height = (25)+"px";
    playView.style.zIndex = "15";
    document.body.appendChild(playView);

    gameStarted = false;
    playView.onclick = function() {
        oscillator.start();
        invaderOscillator.start();
        gameStarted = true;
    };

    oscillator = createOscillator();
    oscillator.frequency.value = 0;

    invaderOscillator = createOscillator();
    invaderOscillator.frequency.value = 0;

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

var frequency = 0;

var invadersDefeated = 0;
var invaderArr = [];

var createInvader = function() {
    var rnd = Math.random();
    var posX = (sw/2)+((rnd-0.5)*(sw/2));

    var obj = {
        dead: false,
        x: posX,
        y: (sh/2)-(sw/4)
    };

    invaderOscillator.frequency.value = rnd*500;

    invaderArr.push(obj);
};

var frequencyDirection = 0
var frequencyNo = 0;
var lap = 0;

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

    ctx.lineWidth = 0.5;
    ctx.strokeStyle = "#fff";
    ctx.fillStyle = "#fff";

    ctx.beginPath();
    ctx.moveTo(0, (sh/2));
    ctx.lineTo(sw, (sh/2));
    ctx.stroke();

    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(
    (sw/2)+((((1/500)*frequency)-0.5)*(sw/2)),
    (sh/2));
    ctx.lineTo(
    (sw/2)+((((1/500)*frequency)-0.5)*(sw/2)),
    (sh/2)-10);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(
    (sw/2)+
    ((((1/500)*frequency)-0.5)*(sw/2)),
    (sh/2),
    2.5, 0, (Math.PI*2));
    ctx.fill();

    for (var n = 0; n < invaderArr.length; n++) {
        ctx.beginPath();
        ctx.rect(
        invaderArr[n].x-5, invaderArr[n].y-5,
        10, 10);
         ctx.fill();

        var diff = (1/500)*
        Math.abs(frequency -
        invaderOscillator.frequency.value);

        if (diff < 0.1) {
            invaderArr[n].dead = true;
            invaderOscillator.frequency.value = 0;
            invadersDefeated += 1;
            bpmView.innerText = invadersDefeated+" defeated";
        }
 
        invaderArr[n].y += 1;

        if ((invaderArr[n].y + 5) > (sh/2)) {
            invaderArr[n].y = (sh/2)-5;

            /*
            invaderArr[n].dead = true;
            invaderOscillator.stop();
            invadersDefeated = 0;
            bpmView.innerText = invadersDefeated+" defeated";*/
        }
    }

    invaderArr = invaderArr.filter((o) => {
        return !o.dead;
    });

    if (gameStarted && invaderArr.length == 0)
    createInvader();
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