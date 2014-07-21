// Browser support hack
window.AudioContext = (function(){
  return  window.webkitAudioContext ||
          window.AudioContext       ||
          window.mozAudioContext;
})();


var Audio = {
  audioContextSetup: function() {
    try {
      Audio.audioContext = new webkitAudioContext();
    } catch(e) {
      alert('Web Audio API is not supported in this browser');
    }
  },
  audiourl: "assets/VersionsModerat.mp3",
  audioData: null,
  audioPlaying: false,
  sampleSize: 1024,
  setupPhaserNodes: function() {
    Audio.tuna = new Tuna(Audio.audioContext);
    Audio.phaser = new tuna.Phaser({
      rate: 1.2,                     //0.01 to 8 is a decent range, but higher values are possible
      depth: 0.3,                    //0 to 1
      feedback: 0.2,                 //0 to 1+
      stereoPhase: 30,               //0 to 180
      baseModulationFrequency: 700,  //500 to 1500
      bypass: 0
    };
    Audio.sourceNode = Audio.audioContext.createBufferSource();
    Audio.analyserNode = Audio.audioContext.createAnalyser();
  },
  connectPhaserNodes: function() {
    Audio.sourceNode.connect(Audio.phaser.input);
    Audio.phaser.connect(audioContext.destination);
    Audio.phaser.connect(analyserNode);
  },
  getFrequencies: function() {
    var frequencyAmplitudeArray = new Uint8Array(Audio.analyserNode.frequencyBinCount);
    Audio.analyserNode.getByteFrequencyData(frequencyAmplitudeArray);
    return frequencyAmplitudeArray;
  },
  loadSound: function(url) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    request.onload = function() {
      Audio.AudioContext.decodeAudioData(request.response, function (buffer) {
        Audio.audioData = buffer;
        playSound(audioData);
      }, onError);
    }
    request.send();
  },
  playSound: function(buffer) {
    Audio.sourceNode.buffer = buffer;
    Audio.sourceNode.start(0);
    Audio.sourceNode.loop = true;
    Audio.audioPlaying = true;
  },
  onError: function(e) {
    console.log(e);
  }
};

$(document).ready(function() {



});
