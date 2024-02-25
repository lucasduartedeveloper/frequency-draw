var audioDevice = 0;
var audioDevices = [];

if (navigator.mediaDevices) {
    navigator.mediaDevices.enumerateDevices()
    .then(function(devices) {
         devices.forEach(function(device) {
             if (device.kind == "audioinput")
             audioDevices.push({
                 kind: device.kind,
                 label: device.label,
                 deviceId: device.deviceId
             });
         });
         audioDeviceNo = audioDevices.length > 1 ? 
         (audioDevices.length-1) : 0;
    })
    .catch(function(err) {
         console.log(err.name + ": " + err.message);
    });
}

class EasyMicrophone {

    constructor() {
        var scope = this;

        // wave drawing setup
        this.audioContent = new AudioContext();
        this.analyser = 0;
        this.processor = 0;
        this.frequencyArray = [];
        this.audioStream = 0;
        this.frequencyLength = 0;

        // recording setup
        this.recordingCallback = function() { };
        this.recordingQueue = [];
        this.audio = new Audio();
        this.mediaRecorder = 0;
        this.audioBlob = [];

        this.curve = false;
        this.clipArray = 0;

        this.onsuccess = function() { };
        this.onupdate = function() { };
        this.onclose = function() { };
        this.closed = true;
    }

    open(curve, clipArray=0) {
        this.closed = false;
        var scope = this;

        // configuration
        this.audioContent = new AudioContext();

        this.curve = curve;
        this.clipArray = clipArray;

        function soundAllowed(stream) {
            // configuration
            scope.audioStream = 
            scope.audioContent.createMediaStreamSource(stream);

            scope.analyser = scope.audioContent.createAnalyser();
            scope.audioStream.connect(scope.analyser);
            //scope.analyser.minDecibels = -200;
            scope.analyser.fftSize = 1024;

            scope.frequencyArray = 
            new Uint8Array(scope.analyser.frequencyBinCount);

            // enter rendering loop
            scope.onsuccess();
            scope.animate();
        }

        function soundNotAllowed(error) {
            console.log("EasyMicrophone: " + error);
        }

        // request microphone access
        navigator.mediaDevices.getUserMedia({
            audio: audioDevices.length == 1 ? true : {
            deviceId: { 
               exact: audioDevices[audioDevice].deviceId
            } }, 
        }).
        then((stream) => {
            soundAllowed(stream);
        }).
        catch((err) => {
            soundNotAllowed(err);
        });
    }

    close() {
        this.closed = true;

        // check stream is open
        if (this.audioStream.mediaStream)
        this.audioStream.mediaStream.getTracks()[0].stop();

        if(this.mediaRecorder) {
            this.mediaRecorder.stop();
        }
        this.onclose();
    }

    record() {
        this.mediaRecorder = 
        new MediaRecorder(this.audioStream.mediaStream);

        var mimeType = this.mediaRecorder.mimeType;
        this.mediaRecorder.ondataavailable = 
        function(e) {
            this.audioBlob.push(e.data);
        }.bind(this);
        this.mediaRecorder.onstop = 
        function(e) {
            var url = URL.createObjectURL(
            new Blob(this.audioBlob, 
                { type: "audio/webm;codecs=opus" }));

            this.audioBlob = [];
            this.recordingCallback(url);
        }.bind(this);

        this.mediaRecorder.start();
    }

    stopRecording(callback) {
        this.recordingCallback = callback;

        if(this.mediaRecorder) {
            this.mediaRecorder.stop();
        }
    }

    animate() {
        var animate = function() {
            this.animate()
        }.bind(this);

        this.analyser.getByteFrequencyData(this.frequencyArray);
        //console.log(this.frequencyArray.join(","));

        var floatArray = [];
        var sum = 0;
        var averageValue = 0;
        var topValue = 0;
        var reachedFrequency = 0;
        var adjustedLength = 0;

        // clip to reached frequency
        for (var i = 0 ; i < 255 ; i++) {
            if (this.frequencyArray[i] < topValue)
            topValue = this.frequencyArray[i];
            adjustedLength = this.frequencyArray[i];

            if (adjustedLength > 0) reachedFrequency = (i+1);
        }
        reachedFrequency = 
            reachedFrequency < this.clipArray ? 
            this.clipArray : (this.clipArray > 0 ? reachedFrequency : 
            this.frequencyArray.length);

        for (var i = 0 ; i < reachedFrequency ; i++) {
            if (this.frequencyArray[i] < topValue)
            topValue = this.frequencyArray[i];

            adjustedLength = this.frequencyArray[i];
            adjustedLength = (1/255)*adjustedLength;
            sum += adjustedLength;

            if (this.curve) {
                adjustedLength = 
                curve(adjustedLength);
            }

            floatArray.push(adjustedLength);
        }

        averageValue = (sum/reachedFrequency);
        averageValue = isNaN(averageValue) ? 0 : averageValue;

        var audioData = new Float32Array(this.analyser.fftSize);
        this.analyser.getFloatTimeDomainData(audioData);
        reachedFrequency = this.getAutocorrolatedPitch(audioData);

        this.onupdate(floatArray, reachedFrequency, averageValue);

        if (!this.closed) requestAnimationFrame(animate);
    }

    getAutocorrolatedPitch(audioData) {
        var corrolatedSignal = new Float32Array(this.analyser.fftSize);
        var localMaxima = new Array(10);

        // First: autocorrolate the signal
        var maximaCount = 0;
        for (var n = 0; n < this.analyser.fftSize; n++) {
            corrolatedSignal[n] = 0;
            for (var k = 0; k < this.analyser.fftSize - n; k++) {
                corrolatedSignal[n] += audioData[k] * audioData[k + n];
            }
            if (n > 1) {
                if ((corrolatedSignal[n - 2] - corrolatedSignal[n - 1]) < 0
                    && (corrolatedSignal[n - 1] - corrolatedSignal[n]) > 0) {
                    localMaxima[maximaCount] = (n - 1);
                    maximaCount++;
                    if ((maximaCount >= localMaxima.length))
                    break;
                }
            }
        }

        // Second: find the average distance in samples between maxima
        var maximaMean = localMaxima[0];
        for (var n = 1; n < maximaCount; n++)
            maximaMean += localMaxima[n] - localMaxima[n - 1];
        maximaMean /= maximaCount;
        return (this.audioContent.sampleRate / maximaMean);
    }

    download(file_name) {
        const name = file_name || "recording.mp3";
        const url = this.audio.src;
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
    }
}

function curve(value, limit=1) {
    var a = ((Math.PI*2)/limit)*value;
    var c = { x: 0, y: 0 };
    var p0 = { x: -1, y: 0 };
    var p1 = _rotate2d(c, p0, a, false);
    return (limit*p1.y)/2;
}

function _rotate2d(c, p, angle, deg=true) {
    var cx = c.x;
    var cy = c.y;
    var x = p.x;
    var y = p.y;
    var radians = deg ? (Math.PI / 180) * angle : angle,
    cos = Math.cos(parseFloat(radians.toFixed(2))),
    sin = Math.sin(parseFloat(radians.toFixed(2))),
    nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
    ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
    return { x: nx, y: ny };
};