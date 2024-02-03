class MediaAnalyser {

     constructor(audio, curve=true, clipArray=0) {
        var scope = this;

        // wave drawing setup
        this.audioContent = new AudioContext();
        this.analyser = 0;
        this.frequencyArray = []
        this.audioStream = 0;
        this.frequencyLength = 0;

        // recording setup
        this.audio = audio;
        this.mediaRecorder = 0;
        this.audioBlob = [];

        this.curve = curve;
        this.clipArray = clipArray;

        this.audio.onplay = function() {
            this.start();
        }.bind(this);

        this.audio.onpause = function() {
            this.closed = true;
            this.onstop();
        }.bind(this);

        this.onsuccess = function() { };
        this.onupdate = function() { };
        this.closed = true;

        this.onstart = function() { };
        this.onstop = function() { };

        this.debug = false;
    }

    _log(msg) {
        if (this.debug)
        console.log("MediaAnalyser: ", msg);
    }

    setAudio(audio) {
        this.audio = audio;
        this.audio.onplay = function() {
            this._log("audio playing...");

            this.start();
        }.bind(this);
    }

    start() {
        this.closed = false;
        var stream = this.audio.captureStream();

        // configuration
        this.audioContent = new AudioContext();

        // configuration
        this.audioStream = 
        this.audioContent.createMediaStreamSource(stream);
        this.analyser = this.audioContent.createAnalyser();
        this.audioStream.connect(this.analyser);
        //this.analyser.minDecibels = -200;
        this.analyser.maxDecibels = -50;
        this.analyser.fftSize = 1024;

        this.frequencyArray = 
        new Uint8Array(this.analyser.frequencyBinCount);

        // enter rendering loop
        this.onsuccess();
        this.animate();

        this.onstart();
    }

    // closed: needs more information to be done
    connect(mic) {
        var stream = this.audio.captureStream();
        var micTrack = mic.audioStream.mediaStream.getTracks()[0];
        stream.addTrack(micTrack);
    }

    join(mic) {
        var mic_floatArray = [];

        // connect to microphone updates
        var mic_onupdate = mic.onupdate;
        mic.onupdate = 
        function(freqArray, reachedFrequency, averageValue) {
            mic_floatArray = freqArray;
            mic_onupdate(freqArray, reachedFrequency, averageValue);
        };

        // add microphone data to audio data
        var _onupdate = this.onupdate;
        this.onupdate = 
        function(freqArray, reachedFrequency, averageValue) {
            for (var n = 0; n < freqArray.length; n++) {
                if (n > (mic_floatArray.length-1)) break;
                freqArray[n] += mic_floatArray[n];
                freqArray[n] /= 2;
            }
            _onupdate(freqArray, reachedFrequency, averageValue);
        };

        // expose method to separate microphone data
        // from audio data
        this.split = function() {
            // set objects to previous states
            mic.onupdate = mic_onupdate;
            this.onupdate = _onupdate;

            // dispose method
            delete this.split;
        };
    }

    stop() {
        this.closed = true;

        this.onstop();
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
            new Blob(this.audioBlob, { type: mimeType }));
            this.audioBlob = [];
            this.audio = new Audio(url);
        }.bind(this);

        this.mediaRecorder.start();
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
        this.onupdate(floatArray, reachedFrequency, averageValue);

        if (!this.closed) requestAnimationFrame(animate);
    }
}