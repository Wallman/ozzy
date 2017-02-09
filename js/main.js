// Global variables
var _matrixes;
var _soundEvents;
var $draggable = $('.draggable').draggabilly({
  containment: true
});
var _draggieTone = 8;

$(function(){
  try {
    init(); 
  }
  catch (err) {
    alert('Ett problem (error: "'+ err +'") uppstod när sidan laddes. Vänligen uppdatera sidan.');
  }
  createListeners();
});

function init(){
  // Matrixes are automatically collected through NexusUI.js.
  _matrixes = [matrix1, matrix2, matrix3];
  _soundEvents = [];
  Tone.Transport.bpm.value = 100;

  matrix1.row = 8;
  matrix1.col = 16;
  matrix1.synth = _lead; // Synths are created in sound.js
  matrix1.scale = _CMaj; // Skapar attributet scale.
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
}

function createListeners(){
  // Matrix events
  _matrixes.forEach(function(element) {
    element.on("*", function(data) {
      if (data.level === 1) { // Clicked empty cell
        registerBeat(data.row, data.col, element);
      }
      else { // Erased cell
        deregisterBeat(data.row, data.col, element);
      }

      // If the sequence is not started, play tone anyway.
      if (Tone.Transport.state != "started"){
        playTone(element.synth, element.scale[data.row], element.col + "n");
      }
    });
  }, this);

  // Draggie events
  $draggable.on('pointerDown', draggieSingOnce);
  $draggable.on('dragMove', draggieSing);
  $draggable.on('pointerUp', draggieStopSinging);
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
  Tone.Transport.start("+0.1");
}

function stopSequence(){
  Tone.Transport.stop();
  Tone.Transport.seconds = "0";
}

// Plays a tone when the sequence is not playing.
function playTone(synth, tone, duration){
  if (synth === _drums)
  {
    synth.start(tone);
  }
  else {
    synth.triggerAttackRelease(tone, duration);
  }
}

// GUI

function toggleMatrix(matrix){
  clearActive();
  document.querySelector(matrix).classList.add("active");
}

function clearActive(){
  document.querySelector('.active').classList.remove("active");
}

//Solo-Draggie functionality

function draggieSingOnce() {
  _draggieSynth.triggerAttack(draggieToneLibrary[_draggieTone]);
}

function draggieSing() {
  var draggie = $(this).data('draggabilly');
  _draggieSynth.vibratoAmount.value = draggie.position.y / -132 + 0.8;

  var toneIndex = Math.ceil(draggie.position.x / 12) + 7;
  if (toneIndex != _draggieTone) {
    _draggieSynth.setNote(draggieToneLibrary[toneIndex]);
    _draggieTone = toneIndex;
  }
  // Makes the box shake when dragged to top-right corner
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