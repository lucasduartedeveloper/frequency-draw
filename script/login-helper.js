var showLogin = function() {
    loginBackgroundView = document.createElement("div");
    loginBackgroundView.style.position = "absolute";
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

    var alphabet = 
    ("ABCDEFGHIJKLMNOPQRSTUVWXYZ").split("");

    var resumedAlphabet = "";
    for (var n = 0; n < 12; n++) {
        var rnd = Math.floor(Math.random()*alphabet.length);
        resumedAlphabet += alphabet.splice(rnd, 1);
    }

    var password = "";
    for (var n = 0; n < 4; n++) {
        var rnd = 
        Math.floor(Math.random()*resumedAlphabet.length);
        password += resumedAlphabet[rnd];
    }

    passwordView = document.createElement("span");
    passwordView.style.position = "absolute";
    passwordView.style.color = "#fff";
    passwordView.innerText = password;
    passwordView.style.textAlign = "center";
    passwordView.style.fontFamily = "Khand";
    passwordView.style.fontSize = "20px";
    passwordView.style.left = ((sw/2)-50)+"px";
    passwordView.style.top = ((sh/2)-(size/2)-35)+"px";
    passwordView.style.width = (100)+"px";
    passwordView.style.height = (25)+"px";
    passwordView.style.zIndex = "50";
    document.body.appendChild(passwordView);

    loginContainerView = document.createElement("div");
    loginContainerView.style.position = "absolute";
    loginContainerView.style.background = "#fff";
    loginContainerView.style.left = ((sw/2)-(size/2))+"px";
    loginContainerView.style.top = ((sh/2)-(size/2))+"px";
    loginContainerView.style.width = (size)+"px";
    loginContainerView.style.height = (size)+"px";
    loginContainerView.style.zIndex = "50";
    document.body.appendChild(loginContainerView);

    var buttonArr = [];
    for (var n = 0; n < 12; n++) {
        var x = (n%3);
        var y = Math.floor(n/3);
        var buttonView = document.createElement("button");
        buttonView.style.position = "absolute";
        buttonView.style.background = "#fff";
        buttonView.style.color = "#000";
        buttonView.innerText = resumedAlphabet[n];
        buttonView.style.fontWeight = 900;
        buttonView.style.fontFamily = "Khand";
        buttonView.style.fontSize = "15px";
        buttonView.style.left = 10+(x*((size-20)/3))+"px";
        buttonView.style.top = 10+(y*((size-20)/4))+"px";
        buttonView.style.width = ((size-20)/3)+"px";
        buttonView.style.height = ((size-20)/4)+"px";
        buttonView.style.border = "1px solid #000";
        //buttonView.style.borderRadius = "25px";
        buttonView.style.zIndex = "15";
        loginContainerView.appendChild(buttonView);

        buttonView.no = n;
        buttonView.onclick = function() {
            password = 
            password.replace(resumedAlphabet[this.no], "");
            passwordView.innerText = password;

            if (password.length > 0) return;

            loginBackgroundView.style.display = "none";
            titleView.style.display = "none";
            passwordView.style.display = "none";
            loginContainerView.style.display = "none";
        };
    }
};