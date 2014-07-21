// Hacks to deal with different function names in different browsers
  // Tells the browser that you wish to perform an animation and requests that the browser call a specified function to update an animation before the next repaint.
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function(callback, element){
            window.setTimeout(callback, 1000 / 60);
          };
})();

window.AudioContext = (function(){
  return  window.webkitAudioContext ||
          window.AudioContext       ||
          window.mozAudioContext;
})();

// Global Variables for Audio
var audioContext;
var audioBuffer;
var sourceNode;
var analyserNode;
var audioData = null;
var audioPlaying = false;
var sampleSize = 1024;  // number of samples to collect before analyzing data
var amplitudeArray;     // array to hold time domain data
var frequencyAmplitudeArray;
var audioUrl = "assets/VersionsModerat.mp3";
var tuna = new Tuna(audioContext);


$(document).ready(function() {
    // the AudioContext is the primary 'container' for all your audio node objects
    try {
        audioContext = new webkitAudioContext();
    } catch(e) {
        alert('Web Audio API is not supported in this browser');
    }

    // Monkey patches for Tuna
    audioContext.createGainNode = audioContext.createGain;
    audioContext.createDelayNode = audioContext.createDelay;
    audioContext.createJavaScriptNode = audioContext.createScriptProcessor;

    // When the Start button is clicked, finish setting up the audio nodes, play the sound,
    // gather samples for the analysis, update the canvas
    $("#start").on('click', function(e) {
        e.preventDefault();
        console.log('playing');



        // Set up the audio Analyser, the Source Buffer and javascriptNode
        setupAudioNodes(Effects.phaser);

        // get the Time Domain data for this sample
        analyserNode.getByteTimeDomainData(amplitudeArray);

        // Load the Audio the first time through, otherwise play it from the buffer
        if(audioData == null) {
            loadSound(audioUrl);
        } else {
            playSound(audioData);
        }
    });

    // Stop the audio playing
    $("#stop").on('click', function(e) {
        e.preventDefault();
        sourceNode.stop(0);
        audioPlaying = false;
    });
});

Effects = {
    phaser: new tuna.Phaser({
        rate: 1.2,                     //0.01 to 8 is a decent range, but higher values are possible
        depth: 0.3,                    //0 to 1
        feedback: 0.2,                 //0 to 1+
        stereoPhase: 30,               //0 to 180
        baseModulationFrequency: 700,  //500 to 1500
        bypass: 0
    });
}

function setupAudioNodes(phaser) {


    sourceNode     = audioContext.createBufferSource();
    analyserNode   = audioContext.createAnalyser();
    javascriptNode = audioContext.createScriptProcessor(sampleSize, 1, 1);

    // Create the array for the data values
    amplitudeArray = new Uint8Array(analyserNode.frequencyBinCount);

    // Now connect the nodes together
    sourceNode.connect(phaser.input);
    phaser.connect(audioContext.destination);
    phaser.connect(analyserNode);
    analyserNode.connect(javascriptNode);
    javascriptNode.connect(audioContext.destination);
}



// Load the audio from the URL via Ajax and store it in global variable audioData
// Note that the audio load is asynchronous
function loadSound(url) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    // When loaded, decode the data and play the sound
    request.onload = function () {
        audioContext.decodeAudioData(request.response, function (buffer) {
            audioData = buffer;
            playSound(audioData);
        }, onError);
    }
    request.send();
}

// Play the audio and loop until stopped
function playSound(buffer) {
    sourceNode.buffer = buffer;
    sourceNode.start(0);    // Play the sound now
    sourceNode.loop = true;
    audioPlaying = true;
}

function onError(e) {
    console.log(e);
}

