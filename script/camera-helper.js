var vw = 0;
var vh = 0;

var cameraElem = null;
var cameraOn = false;
var videoDevices = [];
var deviceNo = 0;

if (navigator.mediaDevices) {
    navigator.mediaDevices.enumerateDevices()
    .then(function(devices) {
         devices.forEach(function(device) {
             if (device.kind == "videoinput")
             videoDevices.push({
                 kind: device.kind,
                 label: device.label,
                 deviceId: device.deviceId
             });
         });
        window.deviceNo = videoDevices.length > 1 ? 
        deviceNo : 0;
    })
    .catch(function(err) {
         console.log(err.name + ": " + err.message);
    });
}

function startCamera(color=true) {
    stopCamera();
    if (navigator.mediaDevices) {
          navigator.mediaDevices
          .getUserMedia({ 
          video: videoDevices.length == 1 ? true : {
          deviceId: { 
               exact: videoDevices[deviceNo].deviceId
          } }, 
          audio: false })
          .then((stream) => {
               console.log("camera started");
               cameraOn = true;

               var track = stream.getVideoTracks()[0];
               var display = track.getSettings();

               console.log(display);
               vw = display.width;
               vh = display.height;

               var capabilities = track.getCapabilities();
               console.log(capabilities);

               focusMin = capabilities.zoom.min;
               focusMax = capabilities.zoom.max;
               focusStep = capabilities.zoom.step;
               focusDistance = display.zoom;

               cameraElem.srcObject = stream;
               cameraElem.width = vw;
               cameraElem.height = vh;
          });
    }
}

function stopCamera() {
    if (cameraElem.srcObject) {
         cameraOn = false;
         cameraElem.srcObject.getTracks().forEach(t => t.stop());
         cameraElem.srcObject = null;
    }
}

var torchEnabled = false;
function setTorch(action) {
    if (!cameraOn) return;

    var track = cameraElem.srcObject.getVideoTracks()[0];
    var settings = track.getSettings();
    var capabilities = track.getCapabilities();

    if (action == "toggle")
    torchEnabled = !settings.torch;
    else if (action == "on")
    torchEnabled = true;
    else if (action == "off")
    torchEnabled = false;

    track.applyConstraints({
        "advanced": [{
            "torch": torchEnabled
        }]
    });
};

// 640x480 => 240x180
/*
    240
    (480/640)*240
*/
// 480x640 => 240x180

var fitImageContain = function(img, frame) {
    var obj = {
        left: 0,
        top: 0,
        width: 0,
        height: 0
    };

    var left, top, width, height;

    if (frame.width > img.width) {
        width = frame.width;
        height = (img.height/img.width)*frame.width;

        left = 0;
        top = -(height-frame.height)/2;
    }
    else {
        height = frame.height;
        width = (img.width/img.height)*frame.height;

        top = 0;
        left = -(width-frame.width)/2;
    }

    obj.left = left;
    obj.top = top;
    obj.width = width;
    obj.height = height;

    return obj;
};

// 480x640 0.75
// 150x150 1
/*
var img = { width: 480, height: 640 };
var frame = { width: 150, height: 150 };
fitImageCover(img, frame);
*/

var fitImageCover = function(img, frame) {
    var obj = {
        left: 0,
        top: 0,
        width: 0,
        height: 0
    };

    var left, top, width, height;

    var img_aspectRatio = img.width/img.height;
    var frame_aspectRatio = frame.width/frame.height;

    if (frame_aspectRatio > img_aspectRatio) {
        width = frame.width;
        height = (img.height/img.width)*frame.width;

        left = 0;
        top = -(height-frame.height)/2;
    }
    else {
        height = frame.height;
        width = (img.width/img.height)*frame.height;

        top = 0;
        left = -(width-frame.width)/2;
    }

    obj.left = left;
    obj.top = top;
    obj.width = width;
    obj.height = height;

    return obj;
};

// 480/640 = 0.75
var resizeFrame = function(frame, content) {
    var r = content.width/content.height;
    if (content.width < content.height) {
        frame.height = frame.height / r;
    }
    else {
        frame.width = frame.width * r;
    }
    return frame;
};

var focusMin = 0;
var focusMax = 0;
var focusStep = 0;
var focusDistance = 0;
function setFocus(value) {
    console.log(value);
    focusDistance = value;

    var track = cameraElem.srcObject.getVideoTracks()[0];
    var settings = track.getSettings();
    var capabilities = track.getCapabilities();

    // Check whether focus distance is supported or not.
    if (!capabilities.focusDistance) {
        return;
    }

    track.applyConstraints({
        "advanced": [{
            "focusMode": "manual",
            "zoom": value
        }]
    });
    settings.focusDistance = focusDistance;
};

var torchEnabled = false;
var setTorch = function(action) {
    if (!cameraOn) return;

    var track = cameraElem.srcObject.getVideoTracks()[0];
    var settings = track.getSettings();
    var capabilities = track.getCapabilities();

    if (action == "toggle")
    torchEnabled = !settings.torch;
    else if (action == "on")
    torchEnabled = true;
    else if (action == "off")
    torchEnabled = false;

    track.applyConstraints({
        "advanced": [{
            "torch": torchEnabled
        }]
    });
};

/*
    console.log(
        { width: vw, height: vh }, 
        { width: photo.width, height: photo.height }, 
    pos);

    var img = new Image();
    img.ctx = ctx;
    img.photo = photo;
    img.onload = function() {
        var pos = fitImageCover(this, this.photo);
        this.ctx.drawImage(this, pos.left, pos.top, pos.width, pos.height);
        //this.ctx.drawImage(this, 0, 0, 
        //this.photo.width, this.photo.height);
    }
    var rnd = Math.random();
    img.src = "img/tree.png?rnd="+rnd;
*/