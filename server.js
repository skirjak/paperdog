'use strict';

// where your node app starts
// init project
const Promise = require('bluebird')
const express = require('express');
const assert = require('assert');

var integration = require('./integration.js');
var presseportal = require('./presseportal.js');
var app = express();
app.set('json spaces', 4);

var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var actions = {
    fallback: 'input.unknown',
    showStories: 'show.stories',
    showStoriesAboutTopic: 'show.storiesAboutTopic',
    searchSimilar: 'search.similar'
}

//app.use(express.static('public'));

// setup db
var Datastore = require('nedb'),

// Security note: the database is saved to the file `datafile` on the local filesystem. It's deliberately placed in the `.data` directory
// which doesn't get copied if someone remixes the project.
db = new Datastore({ filename: '.data/datafile', autoload: true, timestampData: true });

// Webhook validation
app.get('/webhook', function(req, res) {

  if (req.query['hub.mode'] && req.query['hub.verify_token'] === 'tuxedo_cat') {
    res.status(200).send(req.query['hub.challenge']);
  } else {
    res.status(403).end();
  }

});

// Message processing
app.post('/webhook', function (req, res) {

    var message = req.body;

    var action = getAction(message);
  
    console.log('get message at ' + message.timestamp);
    console.log('get action ' + action);
    console.log('msg: ' + JSON.stringify(message));

    switch(action) {

        case actions.fallback:
            
            var responseMessage = decorateForAPI(integration.topics(1));
            console.log(JSON.stringify(responseMessage));
            res.json(responseMessage);
            break;
        
      case actions.showStories:
        
        presseportal('Wissenschaft', { requestType: 'topic'}).then((response) => {
          
          console.log(JSON.stringify(response))
          var facebookResponse = integration.stories(response.content.story);
          
          var responseMessage = decorateForAPI(facebookResponse);
          
          res.json(responseMessage);
          
        }, (error) => {
          console.err(error)
        });
          
        break;
        
      case actions.showStoriesAboutTopic:
        
          presseportal(getTopic(message), { requestType: 'all'})
            .then(data => data.content.story)
            .then(integration.pressMessages)
            .then((result) => {
              console.log('result' + JSON.stringify(result))
              
              res.json(decorateForAPI(result))
            
            });        
          break;
        
      case actions.searchSimilar:
        
        presseportal(getTerms(message), { requestType: 'all'})
            .then(data => data.content.story)
            .then(integration.pressMessages)
            .then((result) => {
              console.log('result' + JSON.stringify(result))
              
          
              res.json(decorateForAPI(result))          
            });    
        
        break;

        default: res.status(200);

    }

});


// start
var server = app.listen(process.env.PORT || 3000, function () {
  console.log("Listening on port %s", server.address().port);
});

function decorateForAPI(facebookResponse) {

  return {

      "speech": "Barack ",
      "displayText": "Barack Hussein",
      "data": {
        facebook: facebookResponse || {}
        
      },
      "contextOut": [],
      "source": "paperdog"

  };
}

function getIntent(message) {
    return message.result.metadata.intentName;
}

function getAction(message) {
  return message.result.action;
}

function getTopic(message) {
  return message.result.parameters.topic;
}

function getTerms(message) {
  return message.result.parameters.search;
}