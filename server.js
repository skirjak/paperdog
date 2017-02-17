'use strict';

// where your node app starts
// init project
var express = require('express');
var assert = require('assert');
var integration = require('./integration.js');
var app = express();
app.set('json spaces', 4);

var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

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

  //console.log(req.body.result.contexts);

  var recipientId = getRecipient(req.body);

  console.log(JSON.stringify(integration.topics(recipientId), null, '\t'));

  res.send(200).end();

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

  return message.originalRequest.recipient.id;
}
