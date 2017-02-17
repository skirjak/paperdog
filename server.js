//
// This is main file containing code implementing the Express server and functionality for the Express echo bot.
//
'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const path = require('path');
var messengerButton = "<html><head><title>Facebook Messenger Bot</title></head><body><h3>Facebook Messenger Bot Example</h3></body></html>";

// The rest of the code implements the routes for our Express server.
let app = express();

// setup a new database
var Datastore = require('nedb'), 
    // Security note: the database is saved to the file `datafile` on the local filesystem. It's deliberately placed in the `.data` directory
    // which doesn't get copied if someone remixes the project.
    db = new Datastore({ filename: '.data/datafile', autoload: true });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

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
  let data = req.body;
  
  
  db.insert({ test: 'test' }, function (err, newDoc) {
      if(err) console.log("There's a problem with the database: ", err);
      else if(newDoc) console.log("Test inserted in the database");
    });

  // Make sure this is a page subscription
  if (data.object === 'page') {
    


    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.send(200).end();
  }
});

// Display the web page
app.get('/', function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write(messengerButton);
  res.end();
});

// Display the web page
app.get('/db', function(req, res) {

    db.find({}, function (err, docs) {

        res.send(docs).end();

    });

});

function handleError(err, response) {
  response.status(500);
  response.send(
    "<html><head><title>Internal Server Error!</title></head><body><pre>"
    + JSON.stringify(err, null, 2) + "</pre></body></pre>"
  );
}

// Set Express to listen out for HTTP requests
var server = app.listen(process.env.PORT || 3000, function () {
  console.log("Listening on port %s", server.address().port);
});