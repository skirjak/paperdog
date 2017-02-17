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

//var texte = require('node-yaml').read('texte.yml', (err,data) => {app.texte = data});

app.db = db;
//var routes = require("./routes.js")(app, db);
var port = process.env.PORT || 3000;
// listen for requests :) TEST 6
var listener = app.listen(port, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
