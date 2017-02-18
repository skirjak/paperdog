'use strict'

const Promise = require('bluebird')
const request = require('request')
const assert = require('assert')
const _ = require('lodash')

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
  requestType = 'topic', //, 'all', 'storyInfo'
  mediaType = 'document', // 'image', 'audio', 'video',
  lang = 'de',
  teaser = 1, // 0
  limit = 5,
  start = 0
} = {}) {
  // Validate input
  assert.ok(['image', 'audio', 'document', 'video'].includes(mediaType))
  assert.ok(['keyword', 'topic', 'all', 'storyInfo'].includes(requestType))
  assert.ok(typeof tags === 'string' || Array.isArray(tags))

  // Request data from API
  const requestStr = typeof tags === 'string' ? tags : tags.join(',')

  const url = requestType === 'topic'
    ? `http://api.presseportal.de/api/article/${requestType}/${requestStr}/${mediaType}?api_key=${API_KEY}&teaser=${teaser}&lang=${lang}&format=json&limit=${limit}&start=${start}`
    : requestType === 'storyInfo'
      ? `http://api.presseportal.de/api/?controller=app&method=article&type=story&id=${requestStr}&limit=${limit}&start=${start}&api_key=${API_KEY_V2}&api_version=2&lang=${lang}&format=json`
      : `http://api.presseportal.de/api/?controller=app&method=search&type=story&q=${requestStr}&limit=${limit}&start=${start}&api_key=${API_KEY_V2}&api_version=2&lang=${lang}&format=json`

console.log(url)
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

function getAllData (tags, options = {}) {
  options.requestType = 'all'
  return get(tags, options).then(body => {
    if (body.content && body.content.story) {
      const optionsCopy = _.clone(options)
      optionsCopy.requestType = 'storyInfo'
      return Promise.map(body.content.story, (e, i) => {
        return get(e.id, optionsCopy).then(inner => {
          const imageUrl = inner.content &&
            inner.content.story &&
            inner.content.story.media &&
            inner.content.story.media.image &&
            inner.content.story.media.image[0] &&
            inner.content.story.media.image[0].url
          body.content.story[i].imageUrl = imageUrl || 'http://cache.pressmailing.net/thumbnail/liste/60fce31c-0594-4b64-8fc3-43f8c3bed618/news-aktuell-gmbh-blogpost-app-check-refind-dein-neues-digitales-gedaechtnis?crop=0,1,290,190'
        })
      }).return(body)
    }
    return body
  })
}

module.exports = {
  get,
  getAllData
}
