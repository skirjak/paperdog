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
        "title": "Auswählen",
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
    title: story.title.substring(0, 80),
    subtitle: story.teaser.substring(0, 80),
    image_url: 'http://cache.pressmailing.net/thumbnail/liste/60fce31c-0594-4b64-8fc3-43f8c3bed618/news-aktuell-gmbh-blogpost-app-check-refind-dein-neues-digitales-gedaechtnis?crop=0,1,290,190',
    buttons :[
      {
        "type":"web_url",
        "url": story.url,
        "title": 'Lesen'
      },
      {
        "type": "postback",
        "title": "mehr",
        "payload": 'story.more'
      }, { 
        "type": "postback",
        "title": "weniger",
        "payload": 'story.less'
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
function pressMessages (data) {
  console.log(data)
  return cards(data.map(pressMessage))
}

function pressMessage ({
  title,
  teaser,
  url
}) {
  return {
    title,
    subtitle: teaser,
    image_url: 'http://cache.pressmailing.net/thumbnail/liste/60fce31c-0594-4b64-8fc3-43f8c3bed618/news-aktuell-gmbh-blogpost-app-check-refind-dein-neues-digitales-gedaechtnis?crop=0,1,290,190',
    // url,
//    default_action: {
//      type: 'web_url',
//      url,
//      messenger_extensions: true,
//      webview_height_ratio: 'tall'
 //   },
    buttons: [{
      title: 'Mehr',
      payload: constants.states.MORE_OF_SIMILAR_MESSAGES
    }, {
      title: 'Weniger',
      payload: constants.states.LESS_OF_SIMILAR_MESSAGES
    }].map(e => button(e, 'postback'))
  }
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
