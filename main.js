// Synths
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
		}).toMaster();

var _mono = new Tone.MonoSynth().toMaster();

var _bass = new Tone.MembraneSynth({
			"pitchDecay" : 0.008,
			"octaves" : 2,
			"envelope" : {
				"attack" : 0.0006,
				"decay" : 0.5,
				"sustain" : 0
			}
		}).toMaster();

var _hihat = new Tone.MetalSynth({
			"harmonicity" : 12,
			"resonance" : 800,
			"modulationIndex" : 20,
			"envelope" : {
				"decay" : 0.4,
			},
			"volume" : -15
		}).toMaster();

// Scales
var _CMaj = [ "C5", "B4", "A4", "G4", "F4", "E4", "D4", "C4" ];
var _CMajRhythm = [ "F3", "E3", "D3", "C3" ];
var _chords = [["C4", "E4", "G4"], ["G3", "B3", "D4"], ["F3", "A3", "C4"], ["C3", "E3", "G3"]]
//                     C                   G                   F                   C

var _matrixes;

nx.onload = function(){
  init();
  console.log();
}

function init(){
  _matrixes = [matrix1, matrix2, matrix3];
  Tone.Transport.bpm.value = 100;

  matrix1.row = 8;
  matrix1.col = 8;
  matrix1.synth = _mono;
  matrix1.scale = _CMaj; // Tilldelar matrix en skala.
  matrix1.colors.accent = "#FF00CC";
  matrix1.init();

  matrix2.row = 4;
  matrix2.col= 4;
  matrix2.synth = _fatSynth;
  matrix2.scale = _chords;
  matrix2.colors.accent = "#03EAFF";
  matrix2.init();


  matrix3.row = 4;
  matrix3.col = 8;
  matrix3.synth = _bass;
  matrix3.scale = _CMajRhythm;
  matrix3.colors.accent = "#00CCFF";
  matrix3.init();

  // Listener for when cell is pressed.
  _matrixes.forEach(function(element) {
    element.on("*", function(data){
      if(data.row != undefined){
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

  Tone.Transport.scheduleRepeat(function(time){
    matrix.synth.triggerAttackRelease(matrix.scale[row], duration, time);
  }, "1m", start);
}

function startSequence(){
 _matrixes.forEach(function(element) {
    interpretMatrix(element);
  }, this);

  Tone.Transport.start("+0.1");
}

function resetSequence(){
  Tone.Transport.seconds = "0";
}

function stopSequence(){
  Tone.Transport.stop();
}

function playTone(synth, tone, duration){
  synth.triggerAttackRelease(tone, duration);
}

function toggleMatrix(matrix){
  clearActive();
  document.querySelector(matrix).classList.add("active");
}
function clearActive(){
  document.querySelector('.active').classList.remove("active");
}