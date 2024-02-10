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
    //pictureView.style.background = "#fff";
    pictureView.width = (sw);
    pictureView.height = (sh); 
    pictureView.style.left = (0)+"px";
    pictureView.style.top = (0)+"px";
    pictureView.style.width = (sw)+"px";
    pictureView.style.height = (sh)+"px";
    pictureView.style.zIndex = "15";
    document.body.appendChild(pictureView);

    chord0View = document.createElement("span");
    chord0View.style.position = "absolute";
    chord0View.style.userSelect = "none";
    chord0View.style.color = "#fff";
    chord0View.innerText = "G";
    chord0View.style.textAlign = "center";
    chord0View.style.left = ((sw/2)+(sw/3)+10)+"px";
    chord0View.style.top = ((sh/2)-(sw/2))+"px";
    chord0View.style.width = (50)+"px";
    chord0View.style.height = (50)+"px";
    chord0View.style.zIndex = "15";
    document.body.appendChild(chord0View);

    chord0View.onclick = function() {
        stringArr[0].fy = 2;
        stringArr[1].fy = 1;
        stringArr[2].fy = 0;
        stringArr[3].fy = 0;
        stringArr[4].fy = 0;
        stringArr[5].fy = 2;
    };

    chord1View = document.createElement("span");
    chord1View.style.position = "absolute";
    chord1View.style.userSelect = "none";
    chord1View.style.color = "#fff";
    chord1View.innerText = "C";
    chord1View.style.textAlign = "center";
    chord1View.style.left = ((sw/2)+(sw/3)+10)+"px";
    chord1View.style.top = ((sh/2)-(sw/2)+50)+"px";
    chord1View.style.width = (50)+"px";
    chord1View.style.height = (50)+"px";
    chord1View.style.zIndex = "15";
    document.body.appendChild(chord1View);

    chord1View.onclick = function() {
        stringArr[0].fy = 0;
        stringArr[1].fy = 3;
        stringArr[2].fy = 2;
        stringArr[3].fy = 0;
        stringArr[4].fy = 1;
        stringArr[5].fy = 0
    };

    chord2View = document.createElement("span");
    chord2View.style.position = "absolute";
    chord2View.style.userSelect = "none";
    chord2View.style.color = "#fff";
    chord2View.innerText = "D";
    chord2View.style.textAlign = "center";
    chord2View.style.left = ((sw/2)+(sw/3)+10)+"px";
    chord2View.style.top = ((sh/2)-(sw/2)+100)+"px";
    chord2View.style.width = (50)+"px";
    chord2View.style.height = (50)+"px";
    chord2View.style.zIndex = "15";
    document.body.appendChild(chord2View);

    chord2View.onclick = function() {
        stringArr[0].fy = 0;
        stringArr[1].fy = 0;
        stringArr[2].fy = 0;
        stringArr[3].fy = 2;
        stringArr[4].fy = 3;
        stringArr[5].fy = 2;
    };

    sweepView = document.createElement("span");
    sweepView.style.position = "absolute";
    sweepView.style.userSelect = "none";
    sweepView.style.color = "#fff";
    sweepView.innerText = "PLAY";
    sweepView.style.textAlign = "center";
    sweepView.style.left = ((sw/2)+(sw/3)+10)+"px";
    sweepView.style.top = ((sh/2)-(sw/2)+200)+"px";
    sweepView.style.width = (50)+"px";
    sweepView.style.height = (50)+"px";
    sweepView.style.zIndex = "15";
    document.body.appendChild(sweepView);

    sweepView.onclick = function() {
        for (var n = 0; n < 6; n++) {
            //if (!stringArr[n].ready) continue;

            stringArr[n].y = 66.5;
            stringArr[n].radius = 1;
            stringArr[n].value = 1;
            stringArr[n].impulse = 0.05;

            stringArr[n].ready = false;
        }
    };

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

    startTimestamp = 0;

    pictureView.ontouchstart = function(e) {
        if (userInteracted && !oscillatorStarted) {
            //if (!cameraOn) startCamera();
            if (navigator.getUserMedia && mic.closed) mic.open(false, 50);
            for (var n = 0; n < 6; n++) {
                //stringArr[n].oscillator.start();
            }
            oscillator.start();
            oscillatorStarted = true;

            //document.body.requestFullscreen();
        }
        angle = -(Math.PI/4);
        frequencyDirection = 1;

        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;

        startTimestamp = new Date().getTime();
    };

    pictureView.ontouchmove = function(e) {
        moveX = e.touches[0].clientX;
        moveY = e.touches[0].clientY;

        for (var n = 0; n < 6; n++) {
            if ((moveY - startY) > (sh/20) && 
                Math.abs(moveX-stringArr[n].x) < ((sw/3)/6)) {
                stringArr[n].fy = startFret+Math.floor(((10/sh)*startY));
            }

            if (Math.abs(moveY - startY) < (sh/20) && 
                (moveX < stringArr[n].x && startX > stringArr[n].x || 
                startX < stringArr[n].x && moveX > stringArr[n].x)) {
                if (!stringArr[n].sounded) {
                    stringArr[n].y = Math.floor(((100/sh)*moveY));
                    stringArr[n].radius = 1;
                    stringArr[n].value = 1;
                    stringArr[n].impulse = 0.05;
                }
                stringArr[n].sounded = true;
            }
            else {
                stringArr[n].sounded = false;
            }
        }
    };
  
    pictureView.ontouchend = function() {
        userInteracted = true;
        angle = 0;
        frequencyDirection = -1;

        var fyArr = [];
        var musicStringArr = [];
        for (var n = 0; n < 6; n++) {
            if (stringArr[n].sounded) {
                fyArr.push(stringArr[n].fy);
                musicStringArr.push(n);
            }
        };

        if (fyArr.length > 0 && 
            (recordedMusic.length == 0 || 
            startTimestamp > 
            recordedMusic[recordedMusic.length-1].timestamp)) {
            var obj = {
                fy: fyArr,
                string: musicStringArr,
                timestamp: startTimestamp
            };
            recordedMusic.push(obj);
            recordView.innerText = "RECORD \n"+recordedMusic.length;
        }
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

    noteArr = [ 
        [ 82.41, 110, 146.83, 196, 246.94, 329.63 ],
        [ 87.31, 116.54, 155.56, 207.65, 261.63, 349.23 ], 
        [ 92.50, 123.47, 164.81, 220, 277.18, 369.99 ],
        [ 98, 130.81, 174.61, 233.08, 293.66, 392 ],
        [ 103.83, 138.59, 185, 246.94, 311.13, 415.30 ],

        [ 110, 146.83, 196, 261.63, 329.63, 440 ],
        [ 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0 ],
 
        [ 138.59, 185, 246.94, 329.63, 415.30, 554.37 ],
        [ 146.83, 196, 261.63, 349.23, 440, 587.33 ],
        [ 155.56, 207.65, 277.18, 369.99, 466.16, 622.25 ],
        [ 164.81, 220, 293.66, 392, 493.88, 659.23 ],
        [ 174.61, 233.08, 311.13, 415.30, 523.25, 698.46 ],
        [ 185, 246.94, 329.63, 440, 554.37, 739.99 ]
    ];

    oscillator = createOscillator();
    oscillator.volume.gain.value = 1;
    oscillator.frequency.value = 0;

    stringArr = [];
    for (var n = 0; n < 6; n++) {
        var obj = {
            sounded: false,
            x: (sw/2)-(sw/3)+(((sw/1.5)/6)/2)+(n*((sw/1.5)/6)),
            y: 50,
            fy: 1,
            radius: 0,
            value: 0,
            impulse: 0,
            oscillator: createOscillator()
        }

        obj.oscillator.volume.gain.value = 1;
        obj.oscillator.frequency.value = 0;
        stringArr.push(obj);
    }

    noteNo = 0;
    musicArr = [
        { fy: 12, string: 2 },
        { fy: 15, string: 4 },
        { fy: 14, string: 3 },
        { fy: 12, string: 3 },
        { fy: 15, string: 5 },
        { fy: 14, string: 3 },
        { fy: 14, string: 5 },
        { fy: 14, string: 3 },

        { fy: 12, string: 2 },
        { fy: 15, string: 4 },
        { fy: 14, string: 3 },
        { fy: 12, string: 3 },
        { fy: 15, string: 5 },
        { fy: 14, string: 3 },
        { fy: 14, string: 5 },
        { fy: 14, string: 3 },

        { fy: 12, string: 2 },
        { fy: 15, string: 4 },
        { fy: 14, string: 3 },
        { fy: 12, string: 3 },
        { fy: 15, string: 5 },
        { fy: 14, string: 3 },
        { fy: 14, string: 5 },
        { fy: 14, string: 3 },

        { fy: 12, string: 2 },
        { fy: 15, string: 4 },
        { fy: 14, string: 3 },
        { fy: 12, string: 3 },
        { fy: 15, string: 5 },
        { fy: 14, string: 3 },
        { fy: 14, string: 5 },
        { fy: 14, string: 3 },

        { fy: 14, string: 2 },
        { fy: 15, string: 4 },
        { fy: 14, string: 3 },
        { fy: 12, string: 3 },
        { fy: 15, string: 5 },
        { fy: 14, string: 3 },
        { fy: 14, string: 5 },
        { fy: 14, string: 3 },

        { fy: 14, string: 2 },
        { fy: 15, string: 4 },
        { fy: 14, string: 3 },
        { fy: 12, string: 3 },
        { fy: 15, string: 5 },
        { fy: 14, string: 3 },
        { fy: 14, string: 5 },
        { fy: 14, string: 3 },

        { fy: 12, string: 3 },
        { fy: 15, string: 4 },
        { fy: 14, string: 3 },
        { fy: 12, string: 3 },
        { fy: 15, string: 5 },
        { fy: 14, string: 3 },
        { fy: 14, string: 5 },
        { fy: 14, string: 3 },

        { fy: 12, string: 3 },
        { fy: 15, string: 4 },
        { fy: 14, string: 3 },
        { fy: 12, string: 3 },
        { fy: 15, string: 5 },
        { fy: 14, string: 3 },
        { fy: 14, string: 5 },
        { fy: 14, string: 3 },

        { fy: 12, string: 5 },
        { fy: 14, string: 3 },
        { fy: 15, string: 4 },
        { fy: 14, string: 3 },
        { fy: 12, string: 5 },
        { fy: 14, string: 3 },
        { fy: 14, string: 5 },
        { fy: 14, string: 3 },

        { fy: 15, string: 5 },
        { fy: 14, string: 3 },
        { fy: 14, string: 5 },
        { fy: 14, string: 3 },
        { fy: 12, string: 5 },
        { fy: 14, string: 3 },
        { fy: [ 14, 15 ], string: [ 3, 4 ] }
    ];

    play2View = document.createElement("span");
    play2View.style.position = "absolute";
    play2View.style.userSelect = "none";
    play2View.style.color = "#fff";
    play2View.innerText = "PLAY 2";
    play2View.style.textAlign = "center";
    play2View.style.left = ((sw/2)+(sw/3)+10)+"px";
    play2View.style.top = ((sh/2)-(sw/2)+250)+"px";
    play2View.style.width = (50)+"px";
    play2View.style.height = (50)+"px";
    play2View.style.zIndex = "15";
    document.body.appendChild(play2View);

    play2Interval = 0;
    play2View.onclick = function() {
        clearInterval(play2Interval);
        noteNo = 0;

        play2Interval = setInterval(function() {
            for (var n = 0; n < 6; n++) {
                stringArr[n].fy = 0;
            }

            var obj = recordedMusic.length > 0 ? 
            recordedMusic[noteNo] : musicArr[noteNo];
            console.log(obj);
            if (typeof(obj.fy) == "number") {
                moveX = stringArr[obj.string].x;
                moveY = (sh/3)*2;
                stringArr[obj.string].y = 66.5;
                stringArr[obj.string].fy = obj.fy;
                stringArr[obj.string].radius = 1;
                stringArr[obj.string].value = 1;
                stringArr[obj.string].impulse = 0.05;
            }
            else {
                var move = 0;
                for (var n = 0; n < obj.fy.length; n++) {
                    move += stringArr[obj.string[n]].x;
                    stringArr[obj.string[n]].y = 66.5;
                    stringArr[obj.string[n]].fy = obj.fy[n];
                    stringArr[obj.string[n]].radius = 1;
                    stringArr[obj.string[n]].value = 1;
                    stringArr[obj.string[n]].impulse = 0.05;
                }
                moveX = (move / obj.fy.length);
                moveY = (sh/3)*2;
            }
    
            noteNo = (noteNo+1) < 
            (recordedMusic.length > 0 ? 
            recordedMusic.length : musicArr.length) ?
            (noteNo+1) : 0;
            if (noteNo == 0) clearInterval(play2Interval);
        }, 500);
    };

    recordedMusic = [];

    recordView = document.createElement("span");
    recordView.style.position = "absolute";
    recordView.style.userSelect = "none";
    recordView.style.color = "#fff";
    recordView.innerText = "RECORD \n"+recordedMusic.length;
    recordView.style.fontSize = (10)+"px";
    recordView.style.textAlign = "center";
    recordView.style.left = ((sw/2)+(sw/3)+10)+"px";
    recordView.style.top = (50)+"px";
    recordView.style.width = (50)+"px";
    recordView.style.height = (50)+"px";
    recordView.style.zIndex = "15";
    document.body.appendChild(recordView);

    recordView.onclick = function() {
        recordedMusic = [];
        recordView.innerText = "RECORD \n"+recordedMusic.length;
    };

    startFret = 0;
    scaleView = document.createElement("span");
    scaleView.style.position = "absolute";
    scaleView.style.userSelect = "none";
    scaleView.style.color = "#fff";
    scaleView.innerText = "FRET "+startFret;
    scaleView.style.fontSize = (10)+"px";
    scaleView.style.textAlign = "center";
    scaleView.style.left = ((sw/2)+(sw/3)+10)+"px";
    scaleView.style.top = (0)+"px";
    scaleView.style.width = (50)+"px";
    scaleView.style.height = (50)+"px";
    scaleView.style.zIndex = "15";
    document.body.appendChild(scaleView);

    scaleView.onclick = function() {
        startFret = (startFret+5) < 15 ? (startFret+5) : 0;
        scaleView.innerText = "FRET "+startFret;
    };

    loadImages();

    drawImage();
    animate();
});

var img_list = [
    "img/box-template-0_texture.png",
    "img/guitar-pick.png"
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
                callback();
            }
        };
        var rnd = Math.random();
        img.src = img_list[n].includes("img") ? 
        img_list[n]+"?f="+rnd : 
        img_list[n];
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

var effectRatio = 0;

var animate = function() {
    elapsedTime = new Date().getTime()-renderTime;
    if (!backgroundMode) {
        if ((new Date().getTime() - updateTime) > 1000) {
            updateTime = new Date().getTime();
        }

        var oscillatorValue = 0;
        var count = 0;

        for (var n = 0; n < 6; n++) {
            var value = 
            (stringArr[n].radius != 0 ? 
            noteArr[stringArr[n].fy][n]+(stringArr[n].value*5) : 0);

            if (value > 0) count += 1;
            oscillatorValue += value;

            stringArr[n].value = stringArr[n].radius != 0 ?
            (stringArr[n].value + stringArr[n].impulse) : 0;

            if (stringArr[n].impulse > 0 && 
                stringArr[n].value > stringArr[n].radius) {
                stringArr[n].impulse = -0.25;

                var radius = (stringArr[n].radius - 0.25) > 0 ? 
                (stringArr[n].radius - 0.25) : 0;
                stringArr[n].radius = radius;
            }

            if (stringArr[n].impulse < 0 && 
                stringArr[n].value < -stringArr[n].radius) {
                stringArr[n].impulse = 0.25;

                var radius = (stringArr[n].radius - 0.25) > 0 ? 
                (stringArr[n].radius - 0.25) : 0;
                stringArr[n].radius = radius;
            }
        }

        console.log((oscillatorValue/count), count);
        oscillator.frequency.value = count > 0 ? 
        (oscillatorValue / count) : 0;

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

    ctx.fillStyle = "#335";
    ctx.fillRect(0, 0, sw, sh);

    if (imagesLoaded) {
        var size = {
            width: img_list[0].naturalWidth,
            height: img_list[0].naturalHeight
        };
        var frame = {
            width: (sw/sh)*size.height,
            height: size.height
        };
        var format = fitImageCover(size, frame);
        ctx.drawImage(img_list[0],
        -format.left, -format.top, frame.width, frame.height,
        0, 0, sw, sh);
    }

    ctx.lineWidth = 1;
    ctx.strokeStyle = "#fff";
    ctx.fillStyle = "rgba(0, 0, 0, 0.9)";

    ctx.beginPath();
    ctx.arc((sw/2), (sh/3)*2, (sw/3)+10, 0, (Math.PI*2));
    ctx.fill();

    ctx.lineWidth = 1;
    ctx.strokeStyle = "#fff";
    ctx.fillStyle = "rgba(50, 0, 0, 0.7)";

    ctx.beginPath();
    ctx.rect((sw/2)-(sw/3), 0, (sw/1.5), (sh/3));
    ctx.fill();

   for (var n = 0; n <= 3; n++) {
        ctx.beginPath();
        ctx.moveTo((sw/2)-(sw/3), (n *(sh/10))-(sh/20));
        ctx.lineTo((sw/2)-(sw/3)+(sw/1.5), (n *(sh/10))-(sh/20));
        ctx.stroke();
   }

    for (var n = 0; n < 6; n++) {
        ctx.strokeStyle = "#fff";

        var diff = Math.abs((0-stringArr[n].y));
        diff = diff > 20 ? 20 : diff;
        var x = Math.curve(((1-(1/20)*diff)*
        Math.abs(stringArr[n].value)), Math.abs(stringArr[n].value))*10;
        x = stringArr[n].value < 0 ? -x : x;

        ctx.beginPath();
        ctx.moveTo(stringArr[n].x+x, 0);
        for (var k = 1; k <= 100; k++) {
            var diff = Math.abs((k-stringArr[n].y));
            diff = diff > 20 ? 20 : diff;
            var x = Math.curve(((1-(1/20)*diff)*
            Math.abs(stringArr[n].value)), Math.abs(stringArr[n].value))*10;
            x = stringArr[n].value < 0 ? -x : x;

            ctx.lineTo(stringArr[n].x+x, k*(sh/100));
        }
        ctx.stroke();

        if (stringArr[n].fy == 0) continue;

        ctx.fillStyle = "rgba(100, 255, 100, 0.5)";
        ctx.beginPath();
        ctx.arc(stringArr[n].x, 
        ((stringArr[n].fy%6)+(stringArr[n].fy > 5 ? 1 : 0))*(sh/10), 10, 
        0, (Math.PI*2));
        ctx.fill();

        ctx.fillStyle = "#000";
        ctx.font = (15)+"px sans serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillText(stringArr[n].fy, 
        stringArr[n].x, 
        ((stringArr[n].fy%6)+(stringArr[n].fy > 5 ? 1 : 0))*(sh/10));
    }

    if (imagesLoaded) {
        ctx.strokeStyle = "#fff";
        ctx.fillStyle = "#fff";

        ctx.beginPath();
        ctx.arc((moveX-30), moveY, 12.5, 0, (Math.PI*2));
        if (moveY >= (sh/2))
        ctx.fill();

        ctx.beginPath();
        ctx.arc((moveX), moveY, 12.5, 0, (Math.PI*2));
        if (moveY < (sh/2))
        ctx.stroke();

        ctx.save();
        ctx.translate((moveX-25), moveY);
        ctx.rotate(-(Math.PI/2));
        ctx.translate(-(moveX-25), -(moveY));

        var size = {
            width: img_list[1].naturalWidth,
            height: img_list[1].naturalHeight
        };
        var frame = {
            width: getSquare(size),
            height: getSquare(size)
        };
        var format = fitImageCover(size, frame);

        if (moveY >= (sh/2))
        ctx.drawImage(img_list[1],
        -format.left, -format.top, frame.width, frame.height,
        moveX-50, moveY-25, 50, 50);

        ctx.restore();
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