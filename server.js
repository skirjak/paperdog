'use strict';

// where your node app starts
// init project
var express = require('express');
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

  console.log(req.body);

  res.send(200).end();

});



var port = process.env.PORT || 3000;
// listen for requests :) TEST 6
var listener = app.listen(port, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
