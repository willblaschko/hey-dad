var express = require('express');
var alexa = require('alexa-app');
var util = require('util');
var app = express();
app.set('port', (process.env.PORT || 5000));
app.use(express.static('public'));

var alexaApp = new alexa.app('heydad');
alexaApp.express(app, "/api/");

app.listen(app.get('port'), function() {
    console.log("Node app is running at localhost:" + app.get('port'));
});