// Synth accessories
var _compressor = new Tone.Compressor({
  "threshold" : -30,
  "ratio" : 6,
  "attack" : 0.3,
  "release" : 0.1
}).toMaster(); 
var _delay = new Tone.FeedbackDelay ("8n + 8n", 0.1).toMaster();
var _preDelayFilter = new Tone.Filter(1600, "highpass").connect(_delay); 

// Synths
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
}).fan(_compressor, _preDelayFilter);

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
    }).connect(_compressor);

var _drums = new Tone.MultiPlayer({
      urls : {
        "C" : "audio/kick.wav",
        "D" : "audio/snare.wav",
        "E" : "audio/hihat.wav",
        "F" : "audio/cowbell.wav",
      },
      volume : -10,
      fadeOut : 0.1,
    }).connect(_compressor);

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
}).fan(_delay, _compressor);

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