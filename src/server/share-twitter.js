import Debug from 'debug'
import get from 'simple-get'

import Midi from '../models/midi'
import stripIndent from 'common-tags/lib/stripIndent'
import { origin, apiUserAgent } from '../config'
import { buffer as bufferSecret } from '../../secret'

const debug = Debug('bitmidi:share-twitter')

const BUFFER_API = 'https://api.bufferapp.com/1/updates/create.json'

const POSTS = [
  stripIndent`
    π¨ NEW MIDI ALERT! π¨

    π΅ MIDI_NAME

    MIDI_URL
  `,
  stripIndent`
    π₯ Get it while it's hot! π₯

    π΅ MIDI_NAME

    MIDI_URL
  `,
  stripIndent`
    πΊ IT'S MIDI TIME πΊ

    π΅ MIDI_NAME

    MIDI_URL
  `,
  stripIndent`
    β¨ Today's MIDI is... β¨

    π΅ MIDI_NAME

    MIDI_URL
  `,
  stripIndent`
    π¬ YOU'VE GOT MAIL π¬

    π΅ MIDI_NAME

    MIDI_URL
  `,
  stripIndent`
    π Fresh MIDI in your inbox! π

    π΅ MIDI_NAME

    MIDI_URL
  `,
  stripIndent`
    πΌ Coming Soon On Videocassette πΌ

    π΅ MIDI_NAME

    MIDI_URL
  `,
  stripIndent`
    πΌ Be kind, please rewind. πΌ

    π΅ MIDI_NAME

    MIDI_URL
  `,
  stripIndent`
    π¦ YOUR MIDI SHIPMENT HAS ARRIVED π¦

    π΅ MIDI_NAME

    MIDI_URL
  `,
  stripIndent`
    π’π§ A WILD MIDI APPEARED! πΈπ₯

    π΅ MIDI_NAME

    MIDI_URL
  `,
  stripIndent`
    β¨ Listening to this MIDI was super effective! β¨

    π΅ MIDI_NAME

    MIDI_URL
  `,
  stripIndent`
    πΉ Fresh MIDI Goodness πΉ

    π΅ MIDI_NAME

    MIDI_URL
  `,
  stripIndent`
    πΏ Party Like It's 1999 πΏ

    π΅ MIDI_NAME

    MIDI_URL
  `,
  stripIndent`
    π³ Don't be trippin' home skillet! π³

    π΅ MIDI_NAME

    MIDI_URL
  `,
  stripIndent`
    π₯ This MIDI is all that and a bag of potato chips! π₯

    π΅ MIDI_NAME

    MIDI_URL
  `,
  stripIndent`
    βοΈ WE GOT THE 4-1-1 βοΈ

    π΅ MIDI_NAME

    MIDI_URL
  `,
  stripIndent`
    π A new MIDI every day π

    π΅ MIDI_NAME

    MIDI_URL
  `,
  stripIndent`
    π MIDI CHLORIAN READINGS OFF THE CHART π

    π΅ MIDI_NAME

    MIDI_URL
  `,
  stripIndent`
    Impressed with the MIDI chlorian counts, yoda is. Hmmmmmm.

    π΅ MIDI_NAME

    MIDI_URL
  `,
  stripIndent`
    πΊ πΈ PARTY TIME π· π₯

    π΅ MIDI_NAME

    MIDI_URL
  `,
  stripIndent`
    π MIDI of the Day π

    π΅ MIDI_NAME

    MIDI_URL
  `,
  stripIndent`
    π€© MIDI of the Day π€©

    π΅ MIDI_NAME

    MIDI_URL
  `,
  stripIndent`
    π MIDI of the Day π

    π΅ MIDI_NAME

    MIDI_URL
  `,
  stripIndent`
    π₯³ MIDI of the Day π₯³

    π΅ MIDI_NAME

    MIDI_URL
  `,
  stripIndent`
    π MIDI of the Day π

    π΅ MIDI_NAME

    MIDI_URL
  `,
  stripIndent`
    πΆ A new MIDI every day πΆ

    π΅ MIDI_NAME

    MIDI_URL
  `,
  stripIndent`
    πΆ THIS MIDI IS HOTTTT πΆ

    π΅ MIDI_NAME

    MIDI_URL
  `,
  stripIndent`
    π Someone call the firefighters! π¨βπ

    π΅ MIDI_NAME

    MIDI_URL
  `,
  stripIndent`
    β¨ Brand New MIDI β¨

    π΅ MIDI_NAME

    MIDI_URL
  `,
  stripIndent`
    π This MIDI will make you go wild π

    π΅ MIDI_NAME

    MIDI_URL
  `,
  stripIndent`
    π This MIDI starts out good but you won't believe what happens next π

    π΅ MIDI_NAME

    MIDI_URL
  `,
  stripIndent`
    π° One weird MIDI file trick β MP3 files HATE this file! π°

    π΅ MIDI_NAME

    MIDI_URL
  `
]

export default async function shareTwitter () {
  const midi = await Midi
    .query()
    .orderBy('plays', 'desc')
    .findOne({ sharedTwitter: false })

  const text = getPostText(midi)
  await queueTweet(text)

  await midi
    .$query()
    .patch({ sharedTwitter: true })

  debug('Shared tweet: %s', text)
}

function getPostText (midi) {
  const postIndex = Math.floor(Math.random() * POSTS.length)
  const post = POSTS[postIndex]
  return post
    .replace(/MIDI_NAME/g, midi.name)
    .replace(/MIDI_URL/g, `${origin}${midi.url}`)
}

async function queueTweet (text) {
  return new Promise((resolve, reject) => {
    get.concat({
      url: BUFFER_API,
      method: 'POST',
      json: true,
      timeout: 30 * 1000,
      headers: {
        'user-agent': apiUserAgent
      },
      form: {
        access_token: bufferSecret.accessToken,
        profile_ids: [bufferSecret.profileId],
        text,
        top: true
      }
    }, (err, res, body) => {
      if (err) return reject(new Error(`Failed to queue tweet: ${err.message}`))
      if (res.statusCode !== 200) {
        return reject(new Error(`Non-200 status code: ${res.statusCode}. ${body.error || body.message}`))
      }
      if (!body.success) {
        return reject(new Error(`Buffer API error: ${body.error || body.message}`))
      }
      resolve()
    })
  })
}
