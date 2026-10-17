// ClearedToCode overlay settings.
// Edit this file, save it, then in OBS right-click a browser source -> Refresh
// (or just restart OBS) to see the change.

window.CTC_CONFIG = {
  // Your Twitch channel name. Powers live chat, latest sub, cheer and raid.
  twitchChannel: 'clearedtocode',

  // Logo text. The middle word is highlighted.
  brand: ['Cleared', 'To', 'Code'],
  brandTagline: 'Flight Sim · Dev · Live',

  // Camera nameplate
  name: 'Jesse Manchester',
  role: 'Sim Pilot · Developer',

  // Title bar above the main screen in the Hangar scene
  screenTitle: 'MSFS Addons Linker — live build',

  taglines: [
    { word: 'Develop', text: 'Building MSFS add-ons live' },
    { word: 'Enhance', text: 'Tuning aircraft, scenery & tools' },
    { word: 'Elevate', text: 'Better pilots, better code' },
  ],

  // Shown in the footer. Remove any line you don't want.
  socials: [
    { label: 'Web', handle: 'clearedtocode.com' },
    { label: 'Twitch', handle: 'clearedtocode' },
  ],

  // Rotating messages in the middle of the footer
  footerMessages: [
    'Downloads, licences & support at clearedtocode.com',
    'New here? Hit follow so you know when we take off',
    'Questions about the code or the flight? Drop them in chat',
  ],

  // Starting Soon countdown length (restarts every time the scene is shown)
  startingMinutes: 5,

  // Shown on the Offline and Ending screens. Leave empty to hide.
  // Example: [{ day: 'Tue', time: '7:00 PM ET' }, { day: 'Sat', time: '2:00 PM ET' }]
  schedule: [],

  chat: {
    hideBots: ['streamelements', 'nightbot', 'streamlabs', 'moobot', 'fossabot'],
    hideCommands: true, // hide messages that start with "!"
    maxMessages: 40,
  },

  colors: {
    accent: '#ffb547',  // taxiway amber
    accent2: '#46d2ff', // glass-cockpit cyan
  },
};
