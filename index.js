//initialize express
var express = require('express');
//initialize alexa
var alexa = require('alexa-app');
//initialize the app and set the port
var app = express();
app.set('port', (process.env.PORT || 5000));

//what we say when we can't find a matching joke
var jokeFailed = "Sorry, your old dad's memory ain't what it used to be. Try me with another.";

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

//our TellMeAJoke intent, this handles the majority of our interactions.
alexaApp.intent('TellMeAJoke',{
		//define our custom variables, in this case, none
        "slots" : {},
		//define our utterances, basically the whole tell me a joke
        "utterances" : ["Tell me {another|} joke","What does the dad say?","Make me laugh.","{That's|You're} not funny","Ha ha ha","Very funny","That's so {corny|lame|stupid}"]
    },
    function(request, response){
		//our joke which we share to both the companion app and the Alexa device
		var joke = getJoke();
		//if we failed to get a joke, apologize
		if(!joke){
			joke = jokeFailed;
		}else{
			//only display it in the companion app if we have a joke
			response.card(joke);
		}
		response.say(joke);
		//let's keep it open so we can tell more jokes!
		response.shouldEndSession(false, "Come on, say: 'Tell me a joke!'");
		response.send();
});

//our TellMeAJokeAbout intent, this handles specific topic queries.
alexaApp.intent('TellMeAJokeAbout',{
		//define our custom variables, in this case the topic of our joke
        "slots" : {"TOPIC":"LITERAL"},
		//define our utterances, basically the whole tell me a joke
        "utterances" : ["{Tell me a joke|I want to hear about|What|What do you think about|} about {topic|TOPIC}"]
    },
    function(request, response){
		
		//our topic variable from the intent
		var topic = request.slot('TOPIC');
		
		//our joke which we share to both the companion app and the Alexa device
		var joke = getJokeAbout(topic);
		//if we failed to get a joke, apologize
		if(!joke){
			joke = jokeFailed;
		}else{
			//only display it in the companion app if we have a joke
			response.card(joke);
		}
		response.say(joke);
		//let's keep it open so we can tell more jokes!
		response.shouldEndSession(false, "Come on, say: 'Tell me a joke!'");
		response.send();
});



//our GoodbyeDad intent, this ends the conversation
alexaApp.intent('GoodbyeDad',{
		//define our custom variables, in this case, none
        "slots" : {},
		//define our utterances, we're saying goodbye to Dad
        "utterances" : ["Shut up!","I don't want to hear anymore.","Goodbye","No","Bye"]
    },
    function(request, response){
		//say "goodbye"
		response.say("Ok then. We can chat later, sport! Just say: 'Hey Dad!'");
		response.send();
});

//this function gets a single joke based on a RNG
var getJoke = function(){
	return "This is a joke!";
}

//this function tries to do a dumb string match against our joke list, this is not performant
var getJokeAbout = function(topic){
	return "This is a joke about: "+topic;
}

//a shortcut to get our app schema
app.get('/schema', function(request, response) {
    response.send('<pre>'+alexaApp.schema()+'</pre>');
});

//a shortcut to get our app utterances
app.get('/utterances', function(request, response) {
    response.send('<pre>'+alexaApp.utterances()+'</pre>');
});


//make sure we're listening on the assigned port
app.listen(app.get('port'), function() {
    console.log("Node app is running at localhost:" + app.get('port'));
});