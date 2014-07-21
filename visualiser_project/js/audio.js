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
  audioUrl: "assets/VersionsModerat.mp3",
  audioData: null,
  audioPlaying: false,
  sampleSize: 1024,
  setupPhaserNodes: function () {
    // Monkey patches for Tuna
    Audio.audioContext.createGainNode = Audio.audioContext.createGain;
    Audio.audioContext.createDelayNode = Audio.audioContext.createDelay;
    Audio.audioContext.createJavaScriptNode = Audio.audioContext.createScriptProcessor;
    Audio.tuna = new Tuna(Audio.audioContext);
    Audio.phaser = new Audio.tuna.Phaser({
      rate: 1.2,                     //0.01 to 8 is a decent range, but higher values are possible
      depth: 0.3,                    //0 to 1
      feedback: 0.2,                 //0 to 1+
      stereoPhase: 30,               //0 to 180
      baseModulationFrequency: 700,  //500 to 1500
      bypass: 0
    });
    Audio.sourceNode = Audio.audioContext.createBufferSource();
    Audio.analyserNode = Audio.audioContext.createAnalyser();
  },
  connectPhaserNodes: function () {
    Audio.sourceNode.connect(Audio.phaser.input);
    Audio.phaser.connect(Audio.audioContext.destination);
    Audio.phaser.connect(Audio.analyserNode);
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


  $("#start").on('click', function (e) {
    e.preventDefault();
    console.log('playing')


    Audio.setupPhaserNodes();
    Audio.connectPhaserNodes();

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
