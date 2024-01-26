var createLogin = function() {
    loginBackgroundView = document.createElement("div");
    loginBackgroundView.style.position = "absolute";
    loginBackgroundView.style.display = "none";
    loginBackgroundView.style.background = "#000";
    loginBackgroundView.width = (sw);
    loginBackgroundView.height = (sh); 
    loginBackgroundView.style.left = (0)+"px";
    loginBackgroundView.style.top = (0)+"px";
    loginBackgroundView.style.width = (sw)+"px";
    loginBackgroundView.style.height = (sh)+"px";
    loginBackgroundView.style.zIndex = "50";
    document.body.appendChild(loginBackgroundView);

    var size = sw < sh ? (sw/2) : (sh/2);

    titleView = document.createElement("span");
    titleView.style.position = "absolute";
    titleView.style.display = "none";
    titleView.style.color = "#fff";
    titleView.innerText = "";
    titleView.style.textAlign = "center";
    titleView.style.fontFamily = "Khand";
    titleView.style.fontSize = "20px";
    titleView.style.left = ((sw/2)-150)+"px";
    titleView.style.top = ((sh/2)-(size/2)-70)+"px";
    titleView.style.width = (300)+"px";
    titleView.style.height = (25)+"px";
    titleView.style.zIndex = "50";
    document.body.appendChild(titleView);

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

    var loginContainerView_touchstart = function(e) {
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

    loginContainerView.ontouchstart = 
    loginContainerView_touchstart;
    loginContainerView.ontouchmove = 
    loginContainerView_touchmove;

    loginContainerView.onmousedown = 
    loginContainerView_touchstart;
    loginContainerView.onmousemove = 
    loginContainerView_touchmove;

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

    lockPosX = 
    10+(((size-20)/3)/2)+(Math.random()*(((size-20)/3)*2));
    lockPosY = 
    10+(((size-20)/3)/2)+(Math.random()*(((size-20)/3)*2));

    lockPositionView = document.createElement("div");
    lockPositionView.style.position = "absolute";
    lockPositionView.style.display = "none";
    //lockPositionView.style.background = "#fff";
    lockPositionView.style.left = 
    (lockPosX-(((size-20)/3)/2))+"px";
    lockPositionView.style.top = 
    (lockPosY-(((size-20)/3)/2))+"px";
    lockPositionView.style.width = (size/3)+"px";
    lockPositionView.style.height = (size/3)+"px";
    lockPositionView.style.border = "2px solid #000";
    lockPositionView.style.zIndex = "50";
    loginContainerView.appendChild(lockPositionView);
};

var showLogin = function() {
    loginBackgroundView.style.display = "initial";
    titleView.style.display = "initial";
    loginContainerView.style.display = "initial";
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
    loginBackgroundView.style.display = "none";
    titleView.style.display = "none";
    loginContainerView.style.display = "none";
    keyPositionView.style.display = "none";
    lockPositionView.style.display = "none";
};

var keyPlaced = false;
var updateKeyPosition = function(x, y) {
    var size = sw < sh ? (sw/2) : (sh/2);

    keyPositionView.style.left = 
    (x-(((size-20)/3)/2))+"px";
    keyPositionView.style.top = 
    (y-(((size-20)/3)/2))+"px";

    var co = Math.abs(x-lockPosX);
    var ca = Math.abs(y-lockPosY);
    var hyp = Math.sqrt(
    Math.pow(co, 2)+
    Math.pow(ca, 2));

    var border = (hyp/5) < (((size-20)/3)/2) ? 
    (hyp/5) : (((size-20)/3)/2);
    lockPositionView.style.border = (border)+"px solid #000";

    //console.log(hyp);
    var interpretationTimeout = 0;
    if (hyp < 5) {
        keyPositionView.style.left = 
        (lockPosX-(((size-20)/3)/2))+"px";
        keyPositionView.style.top = 
        (lockPosY-(((size-20)/3)/2))+"px";

        if (!keyPlaced) {
            keyPositionView.style.background = "#5f5";
            interpretationTimeout = setTimeout(function() {
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