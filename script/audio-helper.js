var slotInUrl = "audio/slot-in.wav";

class SfxPool {
    constructor() {
       this.stored = [];
       this.playing = [];
       this.used = 0;
       this.volume = 1;
       this.playbackRate = 1;
       this.preservesPitch = false;
    }
    play(url, callback=false, obj=false) {
       var rnd = Math.random();
       var stored = this.stored.filter((o) => { return o.url == url; });
       var sfx0 = stored.length > 0 ? stored[0] : 
       new Audio(url+"?rnd="+rnd);

       sfx0.playbackRate = this.playbackRate;
       sfx0.preservesPitch = this.preservesPitch;

       var n = this.stored.indexOf(sfx0);
       this.stored.splice(n, 1);
       /*var beep0 = this.stored.length > 0 ?
       this.stored.pop() : new Audio(url);*/
       sfx0.volume = this.volume;
       sfx0.onended = function() {
           for (var k in this.pool.playing) {
               if (this.timestamp == this.pool.playing[k].timestamp) {
                   this.pool.stored.push(
                       this.pool.playing.splice(k, 1)[0]
                   );
                   this.pool.used += 1;
                   /*
                   info.innerText = "mp3: "+this.pool.used+
                   (this.pool.playing.length > 0 ?
                   "/"+this.pool.playing.length : "");*/
                   if (callback) callback(obj);
               }
           }
       }
       this.playing.push(sfx0);

       for (var n = 0; n < this.stored.length; n++) {
           if ((new Date().getTime() - this.stored[n].timestamp) > 
           5000) {
               this.stored[n].expired = true;
           }
       }
       stored = stored.filter((o) => { return !o.expired });

       sfx0.url = url;
       sfx0.timestamp = new Date().getTime();
       sfx0.expired = false;
       sfx0.pool = this;
       sfx0.play();
       //navigator.vibrate(200);
    }
    empty() {
       this.stored = [];
       this.used = 0;
    }
}
var sfxPool = new SfxPool();

var language = "en-US";
var beforeAudio = false;
var afterAudio = false;

var speaking = false;
var lastText = "";
function say(text, lang=language, afterAudio) {
    if (!audioBot) return;
    if (beforeAudio) beforeAudio(text);
    //if (text == lastText) return;
    lastText = text;
    if (!speaking) {
         //speaking = true;
         var msg = new SpeechSynthesisUtterance();
         if (!voicesLoaded) msg.lang = lang;
         else {
             msg.lang = voiceList[voice_no].lang;
             msg.voice = voiceList[voice_no];
         }
         msg.text = text;
         msg.onend = function(event) {
              speaking = false;
              if (afterAudio) afterAudio();
         };
         window.speechSynthesis.speak(msg);
         //console.log("0");
    }
}

var sayAny = function(text, obj, beforeAudio, afterAudio,
    boundary=true, pitch=1) {
    var msg = new SpeechSynthesisUtterance();
    msg.pitch = pitch;
    if (!voicesLoaded) msg.lang = language;
    else {
         msg.lang = voiceList[voice_no].lang;
         msg.voice = voiceList[voice_no];
    }
    msg.text = "<speak version=\"1.1\" "+
      "xmlns=\"http://www.w3.org/2001/10/synthesis\" "+
      "xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" "+
      "xsi:schemaLocation=\"http://www.w3.org/2001/10/synthesis"+
      "http://www.w3.org/TR/speech-synthesis11/synthesis.xsd\" "+
      "xml:lang=\""+msg.lang+"\">"+
      text+
      "</speak>";
    console.log(msg.text);
    msg.onstart = function(event) {
         if (beforeAudio) beforeAudio(obj);
    };
    if (boundary)
    msg.onpause = 
    msg.onmark = 
    msg.onboundary = function(event) {
         console.log("boundary");
         if (afterAudio) afterAudio(obj);
    };
    else
    msg.onend = function(event) {
         console.log("end");
         if (afterAudio) afterAudio(obj);
    };
    window.speechSynthesis.speak(msg);
};

var cancelText = function() {
    window.speechSynthesis.cancel();
};

var cancelText = function() {
    window.speechSynthesis.cancel();
};

var voice_no = 0;
var voiceList = [];
var voicesLoaded = false;
var voicesLoadedCallback = false;

var loadVoices = function(callback) {
    voicesLoadedCallback = callback;
    window.speechSynthesis.getVoices();
}

window.speechSynthesis.onvoiceschanged = function() {
    voiceList = window.speechSynthesis.getVoices();
    //voicesLoaded = true;
    if (voicesLoadedCallback) voicesLoadedCallback();
};

var createOscillator = function() {
    // create web audio api context
    var audioCtx = 
    new(window.AudioContext || window. webkitAudioContext)();

    var mediaStreamDestination = 
    audioCtx.createMediaStreamDestination();
    var recorder = 
    new MediaRecorder(mediaStreamDestination.stream);

    // Store the chunks of audio data in an array.
    var chunks = [];
    recorder.addEventListener("start", function(event) {
        if (source !== null) {
            URL.revokeObjectURL(source);
        }
        chunks.length = 0;
    });

    recorder.addEventListener("dataavailable", function(event) {
        var { data } = event;
        chunks.push(data);
    });

    recorder.addEventListener("stop", function(event) {
        var blob = new Blob(chunks, { "type": "audio/aac" });
        source = URL.createObjectURL(blob);

        var a = document.createElement("a");
        a.style.display = "none";
        a.href = source;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
    });

    // create Oscillator node
    var oscillator = audioCtx.createOscillator();

    oscillator.recorder = recorder;

    var volume = audioCtx.createGain();
    volume.gain.value = 0.1;

    var delay = audioCtx.createDelay(5);
    //delay.connect(audioCtx.destination);

    var biquadFilter = audioCtx.createBiquadFilter();
    biquadFilter.type = "lowpass";
    biquadFilter.frequency.value = 100;
    biquadFilter.connect(audioCtx.destination);

    // Create a stereo panner
    var panNode = audioCtx.createStereoPanner();
    panNode.connect(biquadFilter);

    volume.connect(panNode);

    oscillator.type = "square"; //"sine";
    oscillator.frequency.value = 0; // value in hertz
    oscillator.connect(volume);
    oscillator.volume = volume;
    oscillator.biquadFilter = biquadFilter;
    oscillator.panNode = panNode;
    //oscillator.connect(audioCtx.destination);

    return oscillator;
}

/*
    var msg = new SpeechSynthesisUtterance();
    msg.lang = "en-US";
    msg.text = "123";
    msg.onend = function(event) {
        speaking = false;
    };
    window.speechSynthesis.speak(msg);
*/