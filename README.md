# Playing Audio Files & Real-time Frequency Analysis

## `<audio>` html5 tag limitation
- No precise timing controls
- Very low limit for the number of sounds played at once
- No way to reliably pre-buffer a sound
- No ability to apply real-time effects
- No way to analyze sounds


## types of webaudio nodes
#### Source nodes
- Sound sources such as audio buffers, live audio inputs, <audio> tags, oscillators, and JS processors(ScriptProcessorNode).

#### Modification nodes
- Filters, convolvers, panners, JS processors, etc.

#### Analysis nodes
- Analyzers and JS processors

#### Destination nodes
- Audio outputs and offline processing buffers

#### Simple example of node flow
![basicaudionodepath](http://orm-chimera-prod.s3.amazonaws.com/1234000001552/images/waap_0103.png)


## Audio-Definition: Waveform
A waveform is an image that represents an audio signal or recording. It shows the changes in amplitude over a certain amount of time. The amplitude of the signal is measured on the y-axis (vertically), while time is measured on the x-axis (horizontally).


## Audio-Definition: Sample Rate / Sample Frequency
Sampling rate or sampling frequency defines the number of samples per second (or per other unit) taken from a continuous signal to make a discrete or digital signal. For time-domain signals like the waveforms for sound (and other audio-visual content types), frequencies are measured in in hertz (Hz) or cycles per second.


## Audio-Definition: Nyquist's Theorum / Principle
The Nyquist–Shannon sampling theorem (Nyquist principle) states that perfect reconstruction of a signal is possible when the sampling frequency is greater than twice the maximum frequency of the signal being sampled. For example, if an audio signal has an upper limit of 20,000 Hz (the approximate upper limit of human hearing), a sampling frequency greater than 40,000 Hz (40 kHz) will avoid aliasing and allow theoretically perfect reconstruction.


## Audio-Definition: Frequency | Wavelength | Pitch
Audio waves with a longer wavelength don't arrive (at your ear, for example) as often (frequently) as the shorter waves. This aspect of a sound - how often a wave peak goes by, is called frequency by scientists and engineers. They measure it in hertz, which is how many wave peaks go by in one second. People can hear sounds that range from about 20 to about 17,000 hertz.
Lower frequency sounds have a longer wavelength, and therefor travel further.


## Audio-Definition: Bitrate
Bitrate is a measure of data throughput in a given amount of time. Simply put, it's the number of bits that are processed every second. For example, the audio data in an MP3 file which has been encoded with a constant bitrate (CBR) of 128kbps will be processed at 128,000 bits every second.


## Audio Context
In order to start using the API, we must first create an AudioContext. Think of this as a **canvas for sound**. It’s a container for all the playback and manipulation of audio we’re going to be doing. We create it by simply doing this:
```
var context = new webkitAudioContext();
    // We use the "webkit" prefix as the API isn't a standard yet
```


## Creating an Analyser Node
Creates an AnalyserNode.
`var analyser = context.createAnalyser();`


## fftSize
The fftSize basically determines the number of bins(or bands [audio term]), this is used for the frequency-domain analysis. It must be to the power of 2, and a minimum of 32.
It determines how large the frequency range one single bin(band) will cover.

`analyser.fftSize = 32;`

The actual number of bins (bands) in this example would be 16. As it is divided by 2.


## Creating an Audio Object
This is fairly self explainitory:
```
// creating an Audio object
  var audio0 = new Audio();
  audio0.src = 'assets/ConfessToMe.mp3';
  audio0.controls = true;
  audio0.autoplay = false;
  audio0.loop = true;
```


## Creating the Source, and connecting the nodes.

```
var source;
  // Creating a Source Node and passing our audio0 object into it
  source = context.createMediaElementSource(audio0);
  // connecting the source to the analyser
  source.connect(analyser);
  // connecting the source & analyser to the speakers (destination)
  analyser.connect(context.destination);
```


## getFrequencyByteData
Copies the current frequency data into the passed unsigned byte array. If the array has fewer elements than the frequencyBinCount, the excess elements will be dropped.


## Making the function that makes it all happen

```
  // Uint8Array = Unsigned Integer 8bit Array
  // Values between 0-255 will be pushed into this array
  // Which represent -1 to +1 (in audio terms)
  var frequencyData = new Uint8Array(analyser.frequencyBinCount);

  // Function that receives & returns the frequencyData
  var getFrequencies = function() {
    // Copies the current frequency data into the passed unsigned byte array.
    analyser.getByteFrequencyData(frequencyData);

    return frequencyData;
  }
```


## Play & Pause

```
var samplerID = null;
$(".play").on('click', function() {
  audio0.play();

  // using this setInterval function is a way to display results to the console for viewing. When sending this data for visual processing a ScriptProccessorNode will be used instead.
  samplerID = window.setInterval(function() {
    // Calls getFrequencies, and sets an interval rate.
    console.log(getFrequencies());
  }, 100);
});

$(".stop").on('click', function() {
    audio0.pause();
    audio0.currentTime = 0;
    // Stops the frequency data from being returned.
    clearInterval(samplerID);
  });

```


# 2D canvas visualiser

## Setting up the Canvas
```
<canvas id="canvas" width="512" height="256" ></canvas>
<style>
  #canvas {
    margin-left: auto;
    margin-right: auto;
    display: block;
    background-color: black;
  }
  #controls, h1 {
    text-align: center;
  }
  #start, #stop {
    font-size: 16pt;
  }
</style>
```

## Setting the rendering context / canvas context

```
// 2D rendering context for a drawing surface of a `<canvas>` element.
var ctx = $("#canvas")[0].getContext("2d");
```


## Script Processor Node
This interface is an AudioNode which can generate, process, or analyse audio directly using JavaScript.

```
var javascriptNode = audioContext.createScriptProcessor(sampleSize, 1, 1);
```
- Often named javascriptNode.

This node also need to be connected to the analyserNode and the destination:
```
analyserNode.connect(javascriptNode);
javascriptNode.connect(audioContext.destination);
```

## Drawing Function

```
var canvasWidth  = 512;
var canvasHeight = 256;
var drawTimeDomain = function() {
  clearCanvas();
  for (var i = 0; i < amplitudeArray.length; i++) {
    var value = amplitudeArray[i] / 256;
    var y = canvasHeight - (canvasHeight * value) - 1;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(i, y, 1, 1);
  }
};

var clearCanvas = function() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
};
```

## Start audio & draw

```
// Play sound & visualise
$("#start").on('click', function() {
  audio0.play();
  // An event listener which is called periodically for audio processing.
  javascriptNode.onaudioprocess = function () {
    // Get the Time Domain data for this sample
    analyserNode.getByteTimeDomainData(amplitudeArray);
    // Draw..
    requestAnimFrame(drawTimeDomain);
  }
});
```













