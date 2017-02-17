'use strict'

const constants = require('./constants')
const { button, plainMessage, showTyping, quickReply, facebookMessage, cards } = require('./facebook')
const MAX_RESORTS = 3

function randomEntry (data) {
  return Math.floor(Math.random() * data.length)
}

function choseEntry (topics, data, max) {
  while (topics.length < max && data.length) {
    const entryNr = randomEntry(data)
    topics.push(data[entryNr])
    data.slice(entryNr, 1)
  }
}

function getNewTopics (type, alreadyChosen, alreadyShown) {
  return Object.keys(constants[type])
    .filter(e => !alreadyChosen.includes(e) && !alreadyShown.includes(e))
    .map(e => constants[type][e])
}

function getTopics (alreadyChosen = [], alreadyShown = [], MAX_TOTAL_TOPICS = 5) {
  const resorts = getNewTopics('resorts', alreadyChosen, alreadyShown)
  const sectors = getNewTopics('sectors', alreadyChosen, alreadyShown)

  const topics = []

  choseEntry(topics, resorts, MAX_RESORTS)
  choseEntry(topics, sectors, MAX_TOTAL_TOPICS)
  choseEntry(topics, alreadyShown, MAX_TOTAL_TOPICS)

  // TODO: Persist all entries per user!
  alreadyShown.concat(topics)
  return topics
}

function topics (id) {
  // TODO: Read alreadyChosen and alreadyShown entries from database
  const alreadyChosen = []
  const alreadyShown = []
  return facebookMessage(id, cards(getTopics(alreadyChosen, alreadyShown).map(topic)))
}

function topic (title) {
  return {
    title,
    buttons :[
      {
        "type":"postback",
        "title": "Bookmark Item",
        "payload": `TOPIC_${title.toUpperCase()}`
      }
    ]
  }
}

function stories(stories) {
  return facebookMessage(1, cards(stories.map(story)));
}

function story(story) {
  return {
    title: story.title.substring(0,80),
    subtitle: story.teaser.substring(0,80),
    buttons :[
      {
        "type":"postback",
        "title": "Bookmark Item",
        "payload": ''
      }
    ]
  }
}

//    default_action: {
//      type: 'postback',
//      payload: `TOPIC_${title.toUpperCase()}`
//    }

/**
 * Rewrite press content to facebook topic cards
 *
 * @param {Array<Object>} data
 * @returns
 */
function pressMessages (id, data) {
  return facebookMessage(id, cards(data.map(pressMessage)))
}

function pressMessage ({
  title,
  teaser,
  url
}) {
  return [{
    title,
    subtitle: teaser,
    // url,
    default_action: {
      type: 'web_url',
      url,
      messenger_extensions: true,
      webview_height_ratio: 'tall'
    },
    buttons: [{
      title: 'Mehr',
      payload: constants.states.MORE_OF_SIMILAR_MESSAGES
    }, {
      title: 'Details',
      payload: constants.states.NEWS_DETAILS
    }, {
      title: 'Weniger',
      payload: constants.states.LESS_OF_SIMILAR_MESSAGES
    }].map(button)
  }]
}

function welcome (id, data) {
  // TODO: Persistent the user data
  plainMessage(id, 'HALLO')
}

module.exports = {
  welcome,
  plainMessage,
  topics,
  stories,
  pressMessages,
  showTyping,
  quickReply,
  story
}
