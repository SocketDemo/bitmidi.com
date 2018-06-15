import MidiPlayer from 'midi-player-js/module/midiplayer'
import SoundfontPlayer from 'soundfont-player'
// import instrumentNames from 'soundfont-player/names/fluidR3.json'
import simpleGet from 'simple-get'
import runParallel from 'run-parallel'

const instrumentNames = [
  'acoustic_grand_piano',
  'bright_acoustic_piano',
  'electric_grand_piano',
  'honky-tonk_piano',
  'electric_piano_1',
  'electric_piano_2',
  'harpsichord',
  'clavi',
  'celesta',
  'glockenspiel',
  'music_box',
  'vibraphone',
  'marimba',
  'xylophone',
  'tubular_bells',
  'dulcimer',
  'drawbar_organ',
  'percussive_organ',
  'rock_organ',
  'church_organ',
  'reed_organ',
  'accordion',
  'harmonica',
  'tango_accordion',
  'acoustic_guitar_nylon',
  'acoustic_guitar_steel',
  'electric_guitar_jazz',
  'electric_guitar_clean',
  'electric_guitar_muted',
  'overdriven_guitar',
  'distortion_guitar',
  'guitar_harmonics',
  'acoustic_bass',
  'electric_bass_finger',
  'electric_bass_pick',
  'fretless_bass',
  'slap_bass_1',
  'slap_bass_2',
  'synth_bass_1',
  'synth_bass_2',
  'violin',
  'viola',
  'cello',
  'contrabass',
  'tremolo_strings',
  'pizzicato_strings',
  'orchestral_harp',
  'timpani',
  'string_ensemble_1',
  'string_ensemble_2',
  'synthstrings_1',
  'synthstrings_2',
  'choir_aahs',
  'voice_oohs',
  'synth_voice',
  'orchestra_hit',
  'trumpet',
  'trombone',
  'tuba',
  'muted_trumpet',
  'french_horn',
  'brass_section',
  'synthbrass_1',
  'synthbrass_2',
  'soprano_sax',
  'alto_sax',
  'tenor_sax',
  'baritone_sax',
  'oboe',
  'english_horn',
  'bassoon',
  'clarinet',
  'piccolo',
  'flute',
  'recorder',
  'pan_flute',
  'blown_bottle',
  'shakuhachi',
  'whistle',
  'ocarina',
  'lead_1_square',
  'lead_2_sawtooth',
  'lead_3_calliope',
  'lead_4_chiff',
  'lead_5_charang',
  'lead_6_voice',
  'lead_7_fifths',
  'lead_8_bass_+_lead',
  'pad_1_new_age',
  'pad_2_warm',
  'pad_3_polysynth',
  'pad_4_choir',
  'pad_5_bowed',
  'pad_6_metallic',
  'pad_7_halo',
  'pad_8_sweep',
  'fx_1_rain',
  'fx_2_soundtrack',
  'fx_3_crystal',
  'fx_4_atmosphere',
  'fx_5_brightness',
  'fx_6_goblins',
  'fx_7_echoes',
  'fx_8_sci-fi',
  'sitar',
  'banjo',
  'shamisen',
  'koto',
  'kalimba',
  'bag_pipe',
  'fiddle',
  'shanai',
  'tinkle_bell',
  'agogo',
  'steel_drums',
  'woodblock',
  'taiko_drum',
  'melodic_tom',
  'synth_drum',
  'reverse_cymbal',
  'guitar_fret_noise',
  'breath_noise',
  'seashore',
  'bird_tweet',
  'telephone_ring',
  'helicopter',
  'applause',
  'gunshot'
]

export default async function play (url) {
  var AudioContext = window.AudioContext || window.webkitAudioContext
  var ac = new AudioContext()

  const player = new MidiPlayer.Player()

  player.on('midiEvent', onMidiEvent)

  let instruments = {} // channel -> instrument

  const nodes = {} // '<channel>-<noteName>' -> AudioNode

  function onMidiEvent (event) {
    console.log(event)
    if (event.name === 'Note on') {
      if (event.velocity > 0) {
        const instrument = instruments[event.channel]
        const node = instrument.play(event.noteName, ac.currentTime, { gain: instrument._gain * event.velocity / 127 })
        nodes[`${event.channel}-${event.noteName}`] = node
      } else {
        console.log('OFFFFFFFF')
        const node = nodes[`${event.channel}-${event.noteName}`]
        node.stop(ac.currentTime)
      }
    }
    if (event.name === 'Controller Change' && event.number === 7) {
      instruments[event.channel]._gain = event.value / 127
    }
  }

  simpleGet.concat(url, (err, res, data) => {
    if (err) throw err
    player.loadArrayBuffer(data)
    const tasks = flat(player.getEvents())
      .filter(event => event.name === 'Program Change')
      .map(event => {
        return cb => {
          SoundfontPlayer.instrument(ac, instrumentNames[event.value])
            .then(instrument => {
              console.log(instrumentNames[event.value])
              instruments[event.channel] = instrument
              cb(null)
            }, cb)
        }
      })

    runParallel(tasks, err => {
      if (err) throw err
      player.play()
    })
  })
}

function flat (arr) {
  return arr.reduce((acc, val) => acc.concat(val), [])
}
