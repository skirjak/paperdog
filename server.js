'use strict';

// where your node app starts
// init project
const Promise = require('bluebird')
var express = require('express');
var assert = require('assert');

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
    showStoriesAboutTopic: 'show.storiesAboutTopic'
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
          
            console.log('get ' + JSON.stringify(result.attachment))
          
            Promise.all(result.attachment.payload.elements.map(storyElement => presseportal(storyElement.id, { requestType: 'storyInfo'})))
              .then(stories => console.log(JSON.stringify(stories)))
          
          /*
            presseportal('3563506', { requestType: 'storyInfo'}).then((response) => {
          
              console.log('result 1 -> ' + JSON.stringify(result));
             assert(response.content.story.media)
             assert(response.content.story.media.image)
              
          
              result.image_url = response.content.story.media.image[0].url;
              result.id = undefined;
            
              console.log('result 2 -> ' + JSON.stringify(result));
          
              res.json(decorateForAPI(result));
              */
          
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
        facebook: facebookResponse
        
      },
      "contextOut": [],
      "source": "paperdog"

  };
}

function getRecipient(message) {
  assert(message);
  assert(message.originalRequest);

  return message.originalRequest.data.recipient.id;
}

function getIntent(message) {
    return message.result.metadata.intentName;
}

function getContext(message) {

}

function getAction(message) {
  return message.result.action;
}

function getTopic(message) {
  return message.result.parameters.topic;
}