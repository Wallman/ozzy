// Global variables
var _matrixes;
var _soundEvents;
var $draggable = $('.draggable').draggabilly({
  containment: true
});
var _draggieTone = 8;

nx.onload = function(){
  checkBrowser();
  try {
    init(); 
    registerSequencer();
  }
  catch (err) {
    alert('Ett problem (error: "'+ err +'") uppstod när sidan laddes. Vänligen uppdatera sidan.');
  }
  createListeners();
};

function checkBrowser(){
  if(!window.chrome){
    alert("This app works best with Google Chrome, some features may not work in other browsers.")
  }
}

function init(){
  // Start audio context, this is needed for sound to be turned on in mobile iOS environments 
  // Uses StartAudioContext.js
  StartAudioContext(Tone.context);

  // Matrixes are automatically collected through NexusUI.js.
  _matrixes = [matrix1, matrix2, matrix3];
  _soundEvents = [];
  Tone.Transport.bpm.value = 100;

  matrix1.row = 8;
  matrix1.col = 16;
  matrix1.synth = _lead; // Synths are created in sound.js
  matrix1.scale = _leadCMaj; // Skapar attributet scale.
  matrix1.colors.accent = "#FF00CC";
  matrix1.init();

  matrix2.row = 8;
  matrix2.col= 8;
  matrix2.synth = _bass;
  matrix2.scale = _bassCMaj;
  matrix2.colors.accent = "#077750";
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
      if (Tone.Transport.state != "started" && data.row != undefined){
        playTone(element.synth, element.scale[data.row], element.col + "n");
      }
    });
  }, this);

  // Draggie events
  $draggable.on('pointerDown', draggieSingOnce);
  $draggable.on('dragMove', draggieSing);
  $draggable.on('pointerUp', draggieStopSinging);

  // Add button listeners
  document.querySelector("#playBtn").addEventListener("click", startSequence);
  document.querySelector("#stopBtn").addEventListener("click", stopSequence);
  document.querySelector("#leadBtn").addEventListener("click", function(){ toggleMatrix("matrix1")});
  document.querySelector("#bassBtn").addEventListener("click", function(){ toggleMatrix("matrix2")});
  document.querySelector("#rhythmBtn").addEventListener("click", function(){ toggleMatrix("matrix3")});
  document.querySelector("#scaleBtn").addEventListener("click", changeScale); 
  document.querySelector("#resetBtn").addEventListener("click", reset); 
}

function registerBeat(row, col, matrix){
  var duration = matrix.col + "n";
  var start = "0:0:" + col / matrix.col * 16; // Start-beat in 16th notes.
  
  let id = Tone.Transport.scheduleRepeat(function(time){
    if (matrix.synth === _drums) {
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

function registerSequencer(){
  // Position comes in format Bars:Fourths:Sixteenths
  for (var i = 0; i < matrix1.matrix.length; i++) {
    Tone.Transport.scheduleRepeat(function(time){
      // Save position before delay
      var position = Tone.Transport.position;
      var fourths = Number(position.substr(position.indexOf(":")+1, 1));
      var sixteenths = Number(position.substr(position.lastIndexOf(":")+1, 1)) + fourths*4;
      matrix1.jumpToCol(sixteenths);
      matrix3.jumpToCol(sixteenths);
    }, "1m", "0:0:"+i);
  }
}

function stopSequence(){
  Tone.Transport.stop();
  Tone.Transport.seconds = "0";
  matrix1.jumpToCol(0);
  matrix3.jumpToCol(0);
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

// changes the scale of matrix 1 (lead), matrix 2 (bass) and the draggieSynth. 
// Utilizes the queue _scaleQueue which is declared in sound.js
function changeScale(){
  let nextScale = _scaleQueue.shift(); //takes out the first scale in _scaleQueue
  matrix1.scale = nextScale.leadScale;
  matrix2.scale = nextScale.bassScale;
  _draggieToneLibrary = nextScale.draggieScale;
  document.querySelector("#scaleBtn").innerHTML = nextScale.scaleBtnText;
  _scaleQueue.push(nextScale); //pushes nextScale to the end of _scaleQueue
}

// clears all graphical matrixes and all the registered tones
// _soundEvents become an empty array again
// also stops the sequence
function reset(){
  let temp = _soundEvents.slice();
  temp.forEach(function(element){
    deregisterBeat(element.row, element.col, element.matrix); // remove registered tone
    element.matrix.setCell(element.col, element.row, false); // clear matrix cell
  });
}

// GUI

function toggleMatrix(matrix){
  clearActive();
  document.querySelector(`#${matrix}`).classList.add("active");
}

function clearActive(){
  document.querySelector('.active').classList.remove("active");
}

//Solo-Draggie functionality
function draggieSingOnce() {
  _draggieSynth.triggerAttack(_draggieToneLibrary[_draggieTone]);
}

function draggieSing() {
  var draggie = $(this).data('draggabilly');
  _draggieSynth.vibratoAmount.value = draggie.position.y / -132 + 0.8;

  var toneIndex = Math.ceil(draggie.position.x / 12) + 7;
  if (toneIndex != _draggieTone) {
    _draggieSynth.setNote(_draggieToneLibrary[toneIndex]);
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
