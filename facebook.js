'use strict'

const assert = require('assert')

/**
 * Create a response object with predefined quick replies
 *
 * quickReply(id, 'Weiteres Thema auswählen', {
 *   GET_MORE_TOPICS: 'Ja',
 *   GET_ARTICLES: 'Nein'
 * })
 *
 * @param {String} id
 * @param {String} text
 * @param {Array<Object>} replies
 * @returns
*/
function quickReply (id, text, replies) {
  assert(id)
  assert(text)

  const constants = Object.keys(replies)
  const quickReplies = constants.map(constant => {
    return {
      title: replies[constant],
      payload: constant,
      content_type: 'text'
    }
  })

  return facebookMessage(id, {
    text,
    quick_replies: quickReplies
  })
}

/**
 * Create default button
 *
 * @param {Object} data
 * @param {String} [type='postback']
 * @returns
 */
function button (data, type = 'postback') {
  data.type = type
  return data
}

/**
 * Wrap a message with the recipient id
 *
 * @param {String} id
 * @param {Object} message
 * @returns
 */
function facebookMessage (id, message) {
  assert(id)
  assert(message)

  return message
}

function cards (data) {
  return {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'generic',
        elements: data
      }
    }
  }
}

function plainMessage (id, message) {
  assert(id)
  assert(message)

  return facebookMessage(id, {
    text: message
  })
}

function showTyping (id, on) {
  return {
    recipient: {
      id
    },
    sender_action: on ? 'typing_on' : 'typing_off'
  }
}

module.exports = {
  quickReply,
  button,
  plainMessage,
  facebookMessage,
  cards,
  showTyping
}
