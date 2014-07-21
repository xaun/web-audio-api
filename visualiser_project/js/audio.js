// Browser support hack
window.AudioContext = (function (){
  return  window.webkitAudioContext ||
          window.AudioContext       ||
          window.mozAudioContext;
})();


var Audio = {
  audioContextSetup: function () {
    try {
      Audio.audioContext = new webkitAudioContext();
    } catch(e) {
      alert('Web Audio API is not supported in this browser');
    }
  },
  monkeyPatches: function () {
    Audio.audioContext.createGainNode = Audio.audioContext.createGain;
    Audio.audioContext.createDelayNode = Audio.audioContext.createDelay;
    Audio.audioContext.createJavaScriptNode = Audio.audioContext.createScriptProcessor;
  },
  audioUrl: "assets/VersionsModerat.mp3",
  audioData: null,
  audioPlaying: false,
  sampleSize: 1024,
  setupAudioNodes: function () {
    Audio.tuna = new Tuna(Audio.audioContext);
    Audio.phaser = new Audio.tuna.Phaser({
      rate: 0.5,                     //0.01 to 8 is a decent range, but higher values are possible
      depth: 0.6,                     //0 to 1
      feedback: 0.3,                 //0 to 1+
      stereoPhase: 30,               //0 to 180
      baseModulationFrequency: 700,  //500 to 1500
      bypass: 1
    });
    Audio.overdrive = new Audio.tuna.Overdrive({
      outputGain: 0.5,         //0 to 1+
      drive: 0.1,              //0 to 1
      curveAmount: 1,          //0 to 1
      algorithmIndex: 1,       //0 to 5, selects one of our drive algorithms
      bypass: 1
    });
    Audio.tremolo = new Audio.tuna.Tremolo({
      intensity: 1,    //0 to 1
      rate: 8,         //0.001 to 8
      stereoPhase: 0,    //0 to 180
      bypass: 1
    });
    Audio.chorus = new Audio.tuna.Chorus({
      rate: 5.5,         //0.01 to 8+
      feedback: 0.9,     //0 to 1+
      delay: 1.0000,     //0 to 1
      bypass: 1          //the value 1 starts the effect as bypassed, 0 or 1
    });
    Audio.sourceNode = Audio.audioContext.createBufferSource();
    Audio.analyserNode = Audio.audioContext.createAnalyser();
    Audio.gainNode = Audio.audioContext.createGain();
  },
  connectAudioNodes: function () {
    Audio.sourceNode.connect(Audio.overdrive.input);
    Audio.sourceNode.connect(Audio.phaser.input);
    Audio.sourceNode.connect(Audio.tremolo.input);
    Audio.sourceNode.connect(Audio.chorus.input);
    Audio.overdrive.connect(Audio.gainNode);
    Audio.phaser.connect(Audio.gainNode);
    Audio.tremolo.connect(Audio.gainNode);
    Audio.chorus.connect(Audio.gainNode);
    Audio.gainNode.connect(Audio.audioContext.destination);
    Audio.gainNode.connect(Audio.analyserNode);
  },
  getFrequencyDomain: function () {
    var frequencyData = new Uint8Array(Audio.analyserNode.frequencyBinCount);
    Audio.analyserNode.getByteFrequencyData(frequencyData);
    return frequencyData;
  },
  getTimeDomain: function () {
    var timeDomainData = new Uint8Array(Audio.analyserNode.frequencyBinCount);
    Audio.analyserNode.getByteTimeDomainData(timeDomainData);
    return timeDomainData;
  },
  loadSound: function (url) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    request.onload = function () {
      // debugger;
      Audio.audioContext.decodeAudioData(request.response,
        function (buffer) {
          Audio.audioData = buffer;
          Audio.playSound(Audio.audioData);
      }, null);
    }
    request.send();
  },
  playSound: function (buffer) {
    Audio.sourceNode.buffer = buffer;
    Audio.sourceNode.start(0);
    Audio.sourceNode.loop = true;
    Audio.audioPlaying = true;
  }
};

$(document).ready(function () {
  Audio.audioContextSetup();
  Audio.monkeyPatches();


  $("#start").on('click', function (e) {
    e.preventDefault();
    console.log('playing')


    Audio.setupAudioNodes();
    Audio.connectAudioNodes();

    if (Audio.audioData == null) {
      Audio.loadSound(Audio.audioUrl);
    } else {
      Audio.playSound(Audio.audioData);
    }
  });

  $("#stop").on('click', function (e) {
    e.preventDefault();
    Audio.sourceNode.stop(0);
    Audio.audioPlaying = false;
  });
});
