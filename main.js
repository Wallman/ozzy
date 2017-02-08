// Synths
//compressor
var compressor = new Tone.Compressor({
  "threshold" : -30,
  "ratio" : 6,
  "attack" : 0.3,
  "release" : 0.1
}).toMaster();
 
var delay = new Tone.FeedbackDelay ("8n + 16n", 0.2).toMaster();
var preDelayFilter = new Tone.Filter(1600, "highpass").connect(delay); 

var _lead = new Tone.PolySynth(8, Tone.AMSynth, {
  "harmonicity": 6,
  "oscillator": {
  "type": "square",
  },
  "filter": {
  "Q": 6,
  "type": "lowpass",
  "rolloff": -24,
  },
  "envelope": {
  "attack": 0.005,
  "decay": 0.1,
  "sustain": 0.5,
  "release": 1,
  },
  "filterEnvelope": {
  "attack": 0.06,
  "decay": 0.2,
  "sustain": 0.5,
  "release": 2,
  "baseFrequency": 200,
  "octaves": 7,
  "exponent": 2,
  },
  "volume": -5
}).fan(compressor, preDelayFilter);

var _bass = new Tone.PolySynth(3, Tone.Synth, {
      "oscillator" : {
        "type" : "sawtooth",
        "count" : 3,
        "spread" : 30
      },
      "envelope": {
        "attack": 0.01,
        "decay": 0.1,
        "sustain": 0.5,
        "release": 0.4,
        "attackCurve" : "exponential"
      },
      "volume": -25
    }).connect(compressor);

var _drums = new Tone.MultiPlayer({
      urls : {
        "C" : "audio/kick.wav",
        "D" : "audio/snare.wav",
        "E" : "audio/hihat.wav",
        "F" : "audio/cowbell.wav",
      },
      volume : -10,
      fadeOut : 0.1,
    }).connect(compressor);

var _draggieSynth = new Tone.DuoSynth({
  "vibratoAmount" : 0.5,
  "vibratoRate" : 5,
  "portamento" : 0.1,
  "harmonicity" : 1.005,
  "volume" : -10,
    "voice0" : {
      "volume" : -2,
      "oscillator" : {
        "type" : "sawtooth"
      },
      "filter" : {
        "Q" : 1,
        "type" : "lowpass",
        "rolloff" : -24
      },
      "envelope" : {
        "attack" : 0.25,
        "decay" : 0.25,
        "sustain" : 0.4,
        "release" : 1.2
      },
      "filterEnvelope" : {
        "attack" : 0.001,
        "decay" : 0.05,
        "sustain" : 0.3,
        "release" : 2,
        "baseFrequency" : 100,
        "octaves" : 4
      }
    },
    "voice1" : {
      "volume" : -10,
      "oscillator" : {
        "type" : "sawtooth"
      },
      "filter" : {
        "Q" : 2,
        "type" : "bandpass",
        "rolloff" : -12
      },
      "envelope" : {
        "attack" : 0.25,
        "decay" : 1000,
        "sustain" : 0.1,
        "release" : 0.8
      },
      "filterEnvelope" : {
        "attack" : 0.05,
        "decay" : 0.05,
        "sustain" : 0.7,
        "release" : 2,
        "baseFrequency" : 5000,
        "octaves" : -1.5
      }
    }
}).fan(delay, compressor);

// Scales
var _CMaj = [ "C6", "B5", "A5", "G5", "F5", "E5", "D5", "C5" ];
var _CMajDrums = [ "F", "E", "D", "C" ];
var _bassCMaj = [ "C3", "B2", "A2", "G2", "F2", "E2", "D2", "C2" ];
//var _chords = [["G3", "B3", "D4"], ["F3", "A3", "C4"], ["E3", "G3", "B3"], ["C3", "E3", "G3"]]
//                     G                   F                   Em                   C
var draggieToneLibrary = 
["B3", "C4", "D4", "E4", "F4", "G4", "A4", "B4", 
"C5", "D5", "E5", "F5", "G5", "A5", "B5", 
"C6"];

// Global variables
var _matrixes;
var _soundEvents;

nx.onload = function(){
  init();
  console.log();
}

function init(){
  _matrixes = [matrix1, matrix2, matrix3];
  _soundEvents = [];
  Tone.Transport.bpm.value = 100;

  matrix1.row = 8;
  matrix1.col = 16;
  matrix1.synth = _lead;
  matrix1.scale = _CMaj; // Tilldelar matrix en skala.
  matrix1.colors.accent = "#FF00CC";
  matrix1.init();

  matrix2.row = 8;
  matrix2.col= 8;
  matrix2.synth = _bass;
  matrix2.scale = _bassCMaj;
  matrix2.colors.accent = "#08875c";
  matrix2.init();

  matrix3.row = 4;
  matrix3.col = 16;
  matrix3.synth = _drums;
  matrix3.scale = _CMajDrums;
  matrix3.colors.accent = "#FFBF19";
  matrix3.init();

  // Listener for when cell is pressed.
  _matrixes.forEach(function(element) {
    element.on("*", function(data) {
      if (Tone.Transport.state === "started"){
        if (data.level === 1) {
          registerBeat(data.row, data.col, element);
        }
        else {
          deregisterBeat(data.row, data.col, element);
        }
      }
      else {
        playTone(element.synth, element.scale[data.row], element.col + "n");
      }
    });
  }, this);
}

function interpretMatrix(matrix){
  for (var i = 0; i < matrix.col; i++) {
    for (var j = 0; j < matrix.row; j++) {
      if(matrix.matrix[i][j] == 1){
        registerBeat(j, i, matrix);
      }
    }
  }
}

function registerBeat(row, col, matrix){
  var duration = matrix.col + "n";
  var start = "0:0:" + col / matrix.col * 16; // Start-beat in 16th notes.
  
  let id = Tone.Transport.scheduleRepeat(function(time){
    if (matrix.synth === _drums)
    {
      matrix.synth.start(matrix.scale[row], time);
    }
    else {
      matrix.synth.triggerAttackRelease(matrix.scale[row], duration, time);
    }
  }, "1m", start);
  _soundEvents.push({
    id: id, 
    matrix: matrix, 
    row: row, 
    col: col
  });
}

function deregisterBeat(row, col, matrix){
  for (var i = _soundEvents.length - 1; i >= 0; i--) {
    let temp = _soundEvents[i];
    if (matrix === temp.matrix && row === temp.row && col === temp.col) {
      Tone.Transport.clear(temp.id);
      _soundEvents.splice(i, 1);
      break;
    }
  }
}

function startSequence(){
 _matrixes.forEach(function(element) {
    interpretMatrix(element);
  }, this);

  Tone.Transport.start("+0.1");
}

function resetSequence(){
  Tone.Transport.seconds = "0";
  _soundEvents.forEach(function(element) {
    Tone.Transport.clear(element.id);
  }, this);
  _soundEvents = [];
}

function stopSequence(){
  resetSequence();
  Tone.Transport.stop();
}

function playTone(synth, tone, duration){
  if (synth === _drums)
  {
    synth.start(tone);
  }
  else {
    synth.triggerAttackRelease(tone, duration);
  }
}

function toggleMatrix(matrix){
  clearActive();
  document.querySelector(matrix).classList.add("active");
}
function clearActive(){
  document.querySelector('.active').classList.remove("active");
}

//jQuery
$(function() {
  //initialize draggable
  var $draggable = $('.draggable').draggabilly({
    containment: true
  });

  //drag events
  $draggable.on('pointerDown', draggieSingOnce);
  $draggable.on('dragMove', draggieSing);
  $draggable.on('pointerUp', draggieStopSinging);

  var _previousTone = 8;

  function draggieSingOnce() {
    _draggieSynth.triggerAttack(draggieToneLibrary[_previousTone]);
  }

  function draggieSing() {
    var draggie = $(this).data('draggabilly');
    let vibratoIndex = draggie.position.y / -132 + 0.8;
    _draggieSynth.vibratoAmount.value = vibratoIndex;
    console.log(_draggieSynth.vibratoAmount.value);
    let toneIndex = Math.ceil(draggie.position.x / 12) + 7;
    if (toneIndex != _previousTone) {
      _draggieSynth.setNote(draggieToneLibrary[toneIndex]);
      _previousTone = toneIndex;
    }
    if (draggie.position.x > 75 && draggie.position.y < -75) {
      $('.draggable-container').addClass('animated infinite shake');
    }
    else {
      $('.draggable-container').removeClass('animated infinite shake');
    }
  }
  
  function draggieStopSinging() {
    _draggieSynth.triggerRelease();
    $('.draggable-container').removeClass('animated infinite shake');
  }
});







