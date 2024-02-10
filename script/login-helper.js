var createLogin = function() {
    loginBackgroundView = document.createElement("div");
    loginBackgroundView.style.position = "absolute";
    loginBackgroundView.style.display = "none";
    loginBackgroundView.style.background = "#fff";
    loginBackgroundView.width = (sw);
    loginBackgroundView.height = (sh); 
    loginBackgroundView.style.left = (0)+"px";
    loginBackgroundView.style.top = (0)+"px";
    loginBackgroundView.style.width = (sw)+"px";
    loginBackgroundView.style.height = (sh)+"px";
    loginBackgroundView.style.zIndex = "50";
    document.body.appendChild(loginBackgroundView);

    var size = sw < sh ? (sw/2) : (sh/2);

    gameLoop = false;
    gameLoopView = document.createElement("span");
    gameLoopView.style.position = "absolute";
    gameLoopView.style.display = "none";
    gameLoopView.style.userSelect = "none";
    gameLoopView.style.color = "#000";
    gameLoopView.innerText = "LOOP: "+
    (gameLoop ? "TRUE" : "FALSE");
    gameLoopView.style.fontWeight = 900;
    gameLoopView.style.textAlign = "center";
    gameLoopView.style.fontFamily = "Khand";
    gameLoopView.style.fontSize = "20px";
    gameLoopView.style.left = ((sw/2)-150)+"px";
    gameLoopView.style.top = ((sh/2)-(size/2)-105)+"px";
    gameLoopView.style.width = (300)+"px";
    gameLoopView.style.height = (25)+"px";
    gameLoopView.style.zIndex = "50";
    document.body.appendChild(gameLoopView);

    gameLoopView.onclick = function() {
        gameLoop = !gameLoop;
        gameLoopView.innerText = "LOOP: "+
        (gameLoop ? "TRUE" : "FALSE");
    };

    resistance = 1;
    titleView = document.createElement("span");
    titleView.style.position = "absolute";
    titleView.style.display = "none";
    titleView.style.userSelect = "none";
    titleView.style.color = "#000";
    titleView.innerText = "WELCOME";
    titleView.style.fontWeight = 900;
    titleView.style.textAlign = "center";
    titleView.style.fontFamily = "Khand";
    titleView.style.fontSize = "20px";
    titleView.style.left = ((sw/2)-150)+"px";
    titleView.style.top = ((sh/2)-(size/2)-70)+"px";
    titleView.style.width = (300)+"px";
    titleView.style.height = (25)+"px";
    titleView.style.zIndex = "50";
    document.body.appendChild(titleView);

    titleView.onclick = function() {
        resistance = (resistance+0.25) < 1.25 ? 
        (resistance+0.25) : 0.25;
    };

    loginContainerView = document.createElement("div");
    loginContainerView.style.position = "absolute";
    loginContainerView.style.display = "none";
    loginContainerView.style.background = "#fff";
    loginContainerView.style.left = ((sw/2)-(size/2))+"px";
    loginContainerView.style.top = ((sh/2)-(size/2))+"px";
    loginContainerView.style.width = (size)+"px";
    loginContainerView.style.height = (size)+"px";
    loginContainerView.style.zIndex = "50";
    document.body.appendChild(loginContainerView);

    var startX = 0;
    var startY = 0;
    var moveX = 0;
    var moveY = 0;

    hasControl = false;
    var loginContainerView_touchstart = function(e) {
        hasControl = true;
        if (e.touches) {
            startX = e.touches[0].clientX - ((sw/2)-(size/2));
            startY = e.touches[0].clientY - ((sh/2)-(size/2));
        }
        else {
            startX = e.clientX - ((sw/2)-(size/2));
            startY = e.clientY - ((sh/2)-(size/2));
        }

        updateKeyPosition(startX, startY);
        websocketBot.sendKey(startX, startY);
    };

    var loginContainerView_touchmove = function(e) {
        if (e.touches) {
            moveX = e.touches[0].clientX - ((sw/2)-(size/2));
            moveY = e.touches[0].clientY - ((sh/2)-(size/2));
        }
        else {
            moveX = e.clientX - ((sw/2)-(size/2));
            moveY = e.clientY - ((sh/2)-(size/2));
        }

        updateKeyPosition(moveX, moveY);
        websocketBot.sendKey(moveX, moveY);
    };

    var loginContainerView_touchend = function(e) {
        hasControl = false;
    };

    loginContainerView.ontouchstart = 
    loginContainerView_touchstart;
    loginContainerView.ontouchmove = 
    loginContainerView_touchmove;
    loginContainerView.ontouchend = 
    loginContainerView_touchend;

    loginContainerView.onmousedown = 
    loginContainerView_touchstart;
    loginContainerView.onmousemove = 
    loginContainerView_touchmove;
    loginContainerView.onmouseup = 
    loginContainerView_touchend;

    areaPositionView = document.createElement("div");
    areaPositionView.style.position = "absolute";
    areaPositionView.style.display = "none";
    //areaPositionView.style.background = "#000";
    areaPositionView.style.border = "1px solid #55f";
    areaPositionView.style.zIndex = "50";
    loginContainerView.appendChild(areaPositionView);

    lockPosX = 
    10+(((size-20)/3)/2)+(Math.random()*(((size-20)/3)*2));
    lockPosY = 
    10+(((size-20)/3)/2)+(Math.random()*(((size-20)/3)*2));

    lockPositionView = document.createElement("div");
    lockPositionView.style.position = "absolute";
    lockPositionView.style.display = "none";
    lockPositionView.style.background = "#000";
    lockPositionView.style.left = 
    (lockPosX-(((size-20)/3)/2))+"px";
    lockPositionView.style.top = 
    (lockPosY-(((size-20)/3)/2))+"px";
    lockPositionView.style.width = (size/3)+"px";
    lockPositionView.style.height = (size/3)+"px";
    lockPositionView.style.border = "1px solid #000";
    lockPositionView.style.zIndex = "50";
    loginContainerView.appendChild(lockPositionView);

    var keyPosX = 
    10+(((size-20)/3)/2)+(Math.random()*(((size-20)/3)*2));
    var keyPosY = 
    10+(((size-20)/3)/2)+(Math.random()*(((size-20)/3)*2));

    keyPositionView = document.createElement("div");
    keyPositionView.style.position = "absolute";
    keyPositionView.style.display = "none";
    keyPositionView.style.background = "#f55";
    keyPositionView.style.left = 
    (keyPosX-(((size-20)/3)/2))+"px";
    keyPositionView.style.top = 
    (keyPosY-(((size-20)/3)/2))+"px";
    keyPositionView.style.width = (size/3)+"px";
    keyPositionView.style.height = (size/3)+"px";
    //lockPositionView.style.border = "1px solid #000";
    keyPositionView.style.zIndex = "50";
    loginContainerView.appendChild(keyPositionView);

    var left = lockPosX-Math.abs(keyPosX-lockPosX);
    var top = lockPosY-Math.abs(keyPosY-lockPosY);
    var width = Math.abs(keyPosX-lockPosX)*2;
    var height = Math.abs(keyPosY-lockPosY)*2;

    areaPositionView.style.left = (left)+"px"
    areaPositionView.style.top = (top)+"px";
    areaPositionView.style.width = (width)+"px";
    areaPositionView.style.height = (height)+"px";
};

var showLogin = function() {
    loginBackgroundView.style.display = "initial";
    gameLoopView.style.display = "initial";
    titleView.style.display = "initial";
    loginContainerView.style.display = "initial";
    areaPositionView.style.display = "initial";
    keyPositionView.style.display = "initial";
    lockPositionView.style.display = "initial";

    keyPlaced = false;
    var size = sw < sh ? (sw/2) : (sh/2);

    lockPosX = 
    10+(((size-20)/3)/2)+(Math.random()*(((size-20)/3)*2));
    lockPosY = 
    10+(((size-20)/3)/2)+(Math.random()*(((size-20)/3)*2));

    lockPositionView.style.left = 
    (lockPosX-(((size-20)/3)/2))+"px";
    lockPositionView.style.top = 
    (lockPosY-(((size-20)/3)/2))+"px";
};

var hideLogin = function() {
    if (gameLoop) {
        keyPositionView.style.background = "#f55";
        showLogin();
        return;
    }

    loginBackgroundView.style.display = "none";
    gameLoopView.style.display = "none";
    titleView.style.display = "none";
    loginContainerView.style.display = "none";
    areaPositionView.style.display = "none";
    keyPositionView.style.display = "none";
    lockPositionView.style.display = "none";
};

var keyPlaced = false;
var updateKeyPosition = function(x, y) {
    var size = sw < sh ? (sw/2) : (sh/2);

    var left = lockPosX-Math.abs(x-lockPosX);
    var top = lockPosY-Math.abs(y-lockPosY);
    var width = Math.abs(x-lockPosX)*2;
    var height = Math.abs(y-lockPosY)*2;

    areaPositionView.style.left = (left)+"px"
    areaPositionView.style.top = (top)+"px";
    areaPositionView.style.width = (width)+"px";
    areaPositionView.style.height = (height)+"px";

    var co = Math.abs(x-lockPosX);
    var ca = Math.abs(y-lockPosY);
    var hyp = Math.sqrt(
    Math.pow(co, 2)+
    Math.pow(ca, 2));

    if (!keyPlaced) {
        keyPositionView.style.left = 
        (x-(((size-20)/3)/2))+"px";
        keyPositionView.style.top = 
        (y-(((size-20)/3)/2))+"px";

        var border = (hyp/5) < (((size-20)/3)/2) ? 
        (hyp/5) : (((size-20)/3)/2);
        //lockPositionView.style.border = (border)+"px solid #000";
    }

    //console.log(hyp);
    var interpretationTimeout = 0;
    if (hyp < 5) {
        keyPositionView.style.left = 
        (lockPosX-(((size-20)/3)/2))+"px";
        keyPositionView.style.top = 
        (lockPosY-(((size-20)/3)/2))+"px";

        if (!keyPlaced) {
            keyPositionView.style.background = "#fff";
            interpretationTimeout = setTimeout(function() {
                keyPositionView.style.background = "#fff";
                //sfxPool.play("audio/jump-sfx.wav");
                hideLogin();
            }, 1000);

            keyPlaced = true;
        }
    }
    else if (!keyPlaced) {
        keyPositionView.style.background = "#f55";
        clearTimeout(interpretationTimeout);
    }
};