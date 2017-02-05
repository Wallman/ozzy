var _matrixes;
var _poly = new Tone.PolySynth().toMaster();
var _mono = new Tone.MonoSynth().toMaster();
var _CMaj = [ "C5", "B4", "A4", "G4", "F4", "E4", "D4", "C4" ];
var _chords = [["C4", "E4", "G4"], ["D4", "F#4", "A4"], ["E4", "G#4", "B4"], ["G4", "B4", "D4"]]
//                  CMaj                  DMaj                 EMaj                GMaj

nx.onload = function(){
  init();
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
  matrix2.synth = _poly;
  matrix2.scale = _chords;
  matrix2.colors.accent = "#03EAFF";
  matrix2.init();

  // Not finished
  matrix3.row = 8;
  matrix3.col = 8;
  matrix3.synth = null;
  matrix3.scale = null;
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
    _poly.triggerAttackRelease(matrix.scale[row], duration, time);
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

function toggleLead(){
  clearActive();
  document.querySelector("#matrix1").classList.add("active");
}

function toggleChords(){
  clearActive();
  document.querySelector("#matrix2").classList.add("active");
}

function toggleRhythm(){
  clearActive();
  document.querySelector("#matrix3").classList.add("active");
}

function clearActive(){
  document.querySelector('.active').classList.remove("active");
}