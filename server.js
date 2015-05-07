// modules
var constants = require('./constants');
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var methodOverride = require('method-override');
var morgan = require('morgan');
var bodyParser = require('body-parser');

// set port
var port = process.env.PORT || constants.port;

// connect to mongoDB
// var db = require('./config/db');
// mongoose.connect(db.url);

// log every request to the console
app.use(morgan('dev'));

// parse application/json
app.use(bodyParser.json());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// simulate DELETE/PUT for clients that don't support them
app.use(methodOverride('X-HTTP-Method-Override'));

// static files
app.use(express.static(__dirname + '/public'));

// routes
require('./app/routes')(app, express.Router());

// set up by grunt-express as a task, uncomment if using with nodemon
// app.listen(port);
// console.log('Server running on http://localhost:' + port);

// expose app
exports = module.exports = app;
