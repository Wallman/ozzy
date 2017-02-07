// Synths
//compressor
var compressor = new Tone.Compressor({
    "threshold" : -30,
    "ratio" : 6,
    "attack" : 0.3,
    "release" : 0.1
  }).toMaster();

var _fatSynth = new Tone.PolySynth(3, Tone.Synth, {
			"oscillator" : {
				"type" : "fatsawtooth",
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
      "volume": -20
		}).connect(compressor);

var _mono = new Tone.MonoSynth({
  "oscillator": {
  "type": "sine",
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
  "volume": -20
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

// Scales
var _CMaj = [ "C6", "B5", "A5", "G5", "F5", "E5", "D5", "C5" ];
var _CMajDrums = [ "F", "E", "D", "C" ];
var _chords = [["G3", "B3", "D4"], ["F3", "A3", "C4"], ["E3", "G3", "B3"], ["C3", "E3", "G3"]]
//                     G                   F                   Em                   C

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
  matrix1.synth = _mono;
  matrix1.scale = _CMaj; // Tilldelar matrix en skala.
  matrix1.colors.accent = "#FF00CC";
  matrix1.init();

  matrix2.row = 4;
  matrix2.col= 8;
  matrix2.synth = _fatSynth;
  matrix2.scale = _chords;
  matrix2.colors.accent = "#03EAFF";
  matrix2.init();

  matrix3.row = 4;
  matrix3.col = 16;
  matrix3.synth = _drums;
  matrix3.scale = _CMajDrums;
  matrix3.colors.accent = "#00CCFF";
  matrix3.init();

  // Listener for when cell is pressed.
  _matrixes.forEach(function(element) {
    element.on("*", function(data){
      if(data.row != undefined){
        playTone(element.synth, element.scale[data.row], element.col + "n");
        stopSequence();
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
  _soundEvents.push(id);
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
    Tone.Transport.clear(element);
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