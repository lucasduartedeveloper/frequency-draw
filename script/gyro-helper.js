var hasMotionSensor = false;
if ('DeviceMotionEvent' in window) {
    var onDeviceMotion = function (e) {
        accHandler(e.accelerationIncludingGravity);
    }
    window
    .addEventListener('devicemotion',
    onDeviceMotion, false);

    hasMotionSensor = true;
} 

var x = 0;
var y = 0;
var z = 0;

var motion = false;
var gyroUpdated = function(gyro) { 
   //console.log("gyro-updated", gyro);
};

var accX = 0;
var accY = 0;
var accZ = 0;

var gyro = {
    timestamp:  new Date().getTime(),
    accX: 0,
    accY: 0,
    accZ: 0,
    distX: 0,
    distY: 0,
    distZ: 0,
    restart: function() {
        this.distX = 0;
        this.distY = 0;
        this.distZ = 0;
    },
    updated: function() {
        //console.log("gyro-updated", gyro);
    }
}
function accHandler(acc) {
    //console.log(acc);
    if(!motion) return;

    var distX = (acc.x - gyro.accX);
    var distY = (acc.y - gyro.accY);
    var distZ = (acc.z - gyro.accZ);

    gyro.accX = acc.x;
    gyro.accY = acc.y;
    gyro.accZ = acc.z;
    gyro.distX += distX;
    gyro.distY += distY;
    gyro.distZ += distZ;

    if ((new Date().getTime() -
         gyro.timestamp) > 50) {
         gyroUpdated(gyro);
         gyro.timestamp =  new Date().getTime();
    }
}