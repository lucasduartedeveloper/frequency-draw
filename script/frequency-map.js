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

    bpm = 180;
    bpmView = document.createElement("span");
    bpmView.style.position = "absolute";
    bpmView.style.color = "#fff";
    bpmView.style.fontFamily = "Khand";
    bpmView.style.textAlign = "center";
    bpmView.innerText = bpm+" bpm";
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
    playView.style.left = ((sw/2)+(sw/4)-25)+"px";
    playView.style.top = ((sh/2)-(sw/2)-50)+"px";
    playView.style.width = (50)+"px";
    playView.style.height = (25)+"px";
    playView.style.zIndex = "15";
    document.body.appendChild(playView);

    playView.onclick = function() {
        frequencyDirection = frequencyDirection == 0 ? 1 : 0;
        playView.innerText = frequencyDirection == 1 ? 
        "stop" : "play";
    };

    var notes0 = [ 0, 32, 34, 36, 38, 41, 43, 46, 49, 52, 55, 58, 61 ];
    for (var n = 0; n < 13; n++) {
        var noteView = document.createElement("button");
        noteView.style.position = "absolute";
        noteView.style.color = "#000";
        noteView.style.fontFamily = "Khand";
        noteView.style.textAlign = "center";
        noteView.style.fontSize = "10px";
        noteView.innerText = notes0[n];
        noteView.style.left = ((sw/2)+((-6.5+n)*((sw-20)/13)))+"px";
        noteView.style.top = ((sh/2)+(sw/2)+25)+"px";
        noteView.style.width = ((sw-20)/13)+"px";
        noteView.style.height = (25)+"px";
        noteView.style.zIndex = "15";
        document.body.appendChild(noteView);

        noteView.no = n;

        noteView.onclick = function() {
            frequencyPath.push(notes0[this.no]);
            oscillator.frequency.value = notes0[this.no];
        }
    }

    var notes1 = [ 65, 69, 73, 77, 82, 87, 92, 98, 104, 110, 116, 123 ];
    for (var n = 0; n < 12; n++) {
        var noteView = document.createElement("button");
        noteView.style.position = "absolute";
        noteView.style.color = "#000";
        noteView.style.fontFamily = "Khand";
        noteView.style.textAlign = "center";
        noteView.style.fontSize = "10px";
        noteView.innerText = notes1[n];
        noteView.style.left = ((sw/2)+((-6+n)*((sw-20)/12)))+"px";
        noteView.style.top = ((sh/2)+(sw/2)+55)+"px";
        noteView.style.width = ((sw-20)/12)+"px";
        noteView.style.height = (25)+"px";
        noteView.style.zIndex = "15";
        document.body.appendChild(noteView);

        noteView.no = n;

        noteView.onclick = function() {
            frequencyPath.push(notes1[this.no]);
            oscillator.frequency.value = notes1[this.no];
        }
    }

    var notes2 = 
    [ 130, 138, 146, 155, 164, 174, 185, 196, 208, 220, 233, 246 ];
    for (var n = 0; n < 12; n++) {
        var noteView = document.createElement("button");
        noteView.style.position = "absolute";
        noteView.style.color = "#000";
        noteView.style.fontFamily = "Khand";
        noteView.style.textAlign = "center";
        noteView.style.fontSize = "10px";
        noteView.innerText = notes2[n];
        noteView.style.left = ((sw/2)+((-6+n)*((sw-20)/12)))+"px";
        noteView.style.top = ((sh/2)+(sw/2)+85)+"px";
        noteView.style.width = ((sw-20)/12)+"px";
        noteView.style.height = (25)+"px";
        noteView.style.zIndex = "15";
        document.body.appendChild(noteView);

        noteView.no = n;

        noteView.onclick = function() {
            frequencyPath.push(notes2[this.no]);
            oscillator.frequency.value = notes2[this.no];
        }
    }

    userInteracted = false;
    oscillatorStarted = false;
    pictureView.ontouchstart = function() {
        if (userInteracted && !oscillatorStarted) {
            oscillator.start();
            oscillatorStarted = true;
        }
    };

    pictureView.ontouchend= function() {
        userInteracted = true;
    }

    frequencyPath = [];

    /*
        32, 36, 41, 43, 0, 43, 0, 43, 
        32, 36, 32, 36, 0, 36, 0, 36,
        32, 49, 43, 41, 0, 41, 0, 41,
        32, 43, 41, 36, 32, 36, 32, 36
    ];*/

    oscillator = createOscillator();
    oscillator.frequency.value = 0;

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
        if ((new Date().getTime() - updateTime) > (60000/bpm)) {
            updateTime = new Date().getTime();

            frequencyNo += frequencyDirection;

            if (frequencyNo > (frequencyPath.length-1)) {
                frequencyNo = 0
                lap += 1;
            }

            if (frequencyNo < 0) {
                frequencyNo = 0;
                 lap = 0;
            }

            if (frequencyDirection == 1)
            oscillator.frequency.value = frequencyPath[frequencyNo];
            drawImage();
        }
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

    ctx.save();
    ctx.translate(-frequencyNo*10, 0);

    for (var n = 0; n < frequencyPath.length; n++) {
        ctx.beginPath();
        ctx.moveTo(
        (sw/2)+(n*10), 
        (sh/2)+((0.5-((1/500)*frequencyPath[n]))*(sw/2)));
        ctx.lineTo(
        (sw/2)+((n+1)*10), 
        (sh/2)+((0.5-((1/500)*frequencyPath[n]))*(sw/2)));
        ctx.stroke();
    }

    ctx.restore();

    ctx.beginPath();
    ctx.arc(
    (sw/2), 
    (sh/2)+
    ((0.5-((1/500)*frequencyPath[frequencyNo]))*(sw/2)),
    2.5, 0, (Math.PI*2));
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