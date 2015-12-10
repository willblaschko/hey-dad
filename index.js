//initialize express
var express = require('express');
//initialize alexa
var alexa = require('alexa-app');
//initialize the app and set the port
var app = express();
app.set('port', (process.env.PORT || 5000));

//create and assign our Alexa App instance to an address on express, in this case https://hey-dad.herokuapp.com/api/hey-dad
var alexaApp = new alexa.app('hey-dad');
alexaApp.express(app, "/api/");

//our intent that is launched when "Hey Alexa, open Hey Dad" command is made
alexaApp.launch(function(request,response) {
	//log our app launch
	console.log("App launched"); 
	//this is what the Alexa device will say at first
	response.say("Hey champ! Do you want to hear a joke?");
	//this is what it'll say when prompted again
	response.shouldEndSession(false, "Come on, say: 'Tell me a joke!'");
	//send the response back to Alexa Skills to transmit to the user
	response.send();    
});

app.get('/schema', function(request, response) {
    response.send('<pre>'+alexaApp.schema()+'</pre>');
});

app.get('/utterances', function(request, response) {
    response.send('<pre>'+alexaApp.utterances()+'</pre>');
});


//make sure we're listening on the assigned port
app.listen(app.get('port'), function() {
    console.log("Node app is running at localhost:" + app.get('port'));
});