// Browser support hack
window.AudioContext = (function (){
  return  window.webkitAudioContext ||
          window.AudioContext       ||
          window.mozAudioContext;
})();

// Audio factory
var Sound = {
  audioContextSetup: function () {
    try {
      Sound.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch(e) {
      alert('Web Audio API is not supported in this browser');
    }
  },
  createAudioObject: function () {
    Sound.audio0 = new Audio();
    Sound.audio0.src = '/audio/MakeYouWanna.mp3';
    Sound.audio0.controls = true;
    Sound.audio0.autoplay = false;
    Sound.audio0.loop = true;
  },
  setupAudioNodes: function () {
    Sound.sourceNode = Sound.audioContext.createMediaElementSource(Sound.audio0);
    Sound.analyserNode = Sound.audioContext.createAnalyser();
    Sound.analyserNode.fftSize = 1024,
    Sound.frequencyArray = new Uint8Array(Sound.analyserNode.frequencyBinCount);
    Sound.timeDomainArray = new Uint8Array(Sound.analyserNode.frequencyBinCount);
  },
  connectAudioNodes: function () {
    Sound.sourceNode.connect(Sound.analyserNode);
    Sound.analyserNode.connect(Sound.audioContext.destination);
  },
  getFrequencyDomain: function () {
    Sound.analyserNode.getByteFrequencyData(Sound.frequencyArray);
    return Sound.frequencyArray;
  },
  getTimeDomain: function () {
    Sound.analyserNode.getByteTimeDomainData(Sound.timeDomainArray);
    return Sound.timeDomainArray;
  }
};


$(document).ready(function () {

  // Initial Audio setup
  Sound.audioContextSetup();
  Sound.createAudioObject();
  Sound.setupAudioNodes();
  Sound.connectAudioNodes();

  // Appends the Audio object (audio0), which in modern browsers will appear
  // as a player in HTML5!!
  $('#player').append(Sound.audio0);


  // Function that runs when #player audio is playing sound =)
    // Currently set to console log freq analysis data.
  $('#player audio').on('playing', function () {
    setInterval(function() {
      console.log(Sound.frequencyArray);
    }, 500);
  })



// ADD CREATESCRIPTPROCCESSOR MDN DOC TO WEBAUDIOAPI.MD FILE!!!!!!!!
// ADD UINT8ARRAY DOC TO WEBAUDIOAPI.MD FILE!!!!

