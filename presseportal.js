'use strict'

const Promise = require('bluebird')
const request = require('request')
const assert = require('assert')
let env = {}

try {
  env = require('../.env')
} catch (e) {}

const API_KEY = process.env.API_KEY || env.API_KEY
const API_KEY_V2 = process.env.API_KEY_V2 || env.API_KEY_V2

/**
 * Returns data from the connected press API
 *
 * @param {String|Array<String>} tags
 * @param {Object} [{
 *   requestType = 'topic', //, 'all'
 *   mediaType = 'document', // 'image', 'audio', 'video',
 *   lang = 'de',
 *   teaser = 1, // 0
 *   limit = 5,
 *   start = 0
 * }={}]
 * @returns {Promise}
 */
function get (tags, {
  requestType = 'topic', //, 'all'
  mediaType = 'document', // 'image', 'audio', 'video',
  lang = 'de',
  teaser = 1, // 0
  limit = 5,
  start = 0
} = {}) {
  // Validate input
  assert.ok(['image', 'audio', 'document', 'video'].includes(mediaType))
  assert.ok(['keyword', 'topic', 'all'].includes(requestType))
  assert.ok(typeof tags === 'string' || Array.isArray(tags))

  // Request data from API
  const requestStr = typeof tags === 'string' ? tags : tags.join(',')
  const url = requestType === 'topic'
    ? `http://api.presseportal.de/api/article/${requestType}/${requestStr}/${mediaType}?api_key=${API_KEY}&teaser=${teaser}&lang=${lang}&format=json&limit=${limit}&start=${start}`
    : `http://api.presseportal.de/api/?controller=app&method=search&type=story&q=${requestStr}&limit=${limit}&start=${start}&api_key=${API_KEY_V2}&api_version=2&lang=${lang}&format=json`
  return Promise.fromCallback(cb => request({
    url,
    method: 'GET',
    json: true
  }, cb), { multiArgs: true })
    .spread((response, body = {}) => body)
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}

// get('sport').then(console.log)
get(['newcomer'], {
  requestType: 'all'
}).then((body) => {
  // const topics = 
  // if (body.content) {
  //   topics(body.content.story)
  // }
  console.log(body)
  console.log(body.content)
})

module.exports = get
