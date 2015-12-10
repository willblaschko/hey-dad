//initialize express
var express = require('express');
//initialize alexa-app
var alexa = require('alexa-app');
//initialize body-parser
var bodyParser = require('body-parser');
//initialize the app and set the port
var app = express();
app.set('port', (process.env.PORT || 5000));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine','ejs');

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
        "utterances" : ["Tell me {another|} joke","What does the dad say","Make me laugh.","{That's|You're} not funny","Ha ha ha","Very funny","That's so {corny|lame|stupid}"]
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
		response.shouldEndSession(false, "Come on, say: 'Tell me a joke'");
		response.send();
});



//our GoodbyeDad intent, this ends the conversation
alexaApp.intent('GoodbyeDad',{
		//define our custom variables, in this case, none
        "slots" : {},
		//define our utterances, we're saying goodbye to Dad
        "utterances" : ["Shut up","I don't want to hear anymore","Good bye dad"]
    },
    function(request, response){
		//say "goodbye"
		response.say("Ok then. We can chat later sport! Just say: 'Hey Dad!'");
		response.send();
});

//this function gets a single joke based on a RNG
var getJoke = function(){
	var length = jokeList.length;
	var jokeNumber = Math.floor(Math.random() * length);
	console.log("Getting joke #"+jokeNumber");
	return jokeList[jokeNumber];
}

//this function tries to do a dumb string match against our joke list, this is not performant
var getJokeAbout = function(topic){
	//regex off final "s" "ed" or "er"
	topic = topic.replace(/s$|ed$|er$/gi,"");
	
	//so that we can randomize and not always get the first joke about a topic
	var length = jokeList.length;
	var randomOffset = Math.floor(Math.random() * length);
	
	for(var i = 0; i < jokeList.length; i++){
			var which = (i + randomOffset) % length;
			console.log("Getting joke #"+which");
			var joke = jokeList[which];
			if(joke.toLowerCase().indexOf(topic) > -1){
				return joke;
			}
	}
	return null;
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



var jokeList = ["How do you know when you are going to drown in milk?... When its past your eyes!",
"Milk is also the fastest liquid on earth – its pasteurized before you even see it",
"A steak pun is a rare medium well done.",
"Did you hear that the police have a warrant out on a midget psychic ripping people off?... It reads 'Small medium at large.'",
"A panda walks into a bar and says to the bartender 'I'll have a Scotch and......... Coke thank you'. Sure thing the bartender replies and asks 'but what's with the big pause?...' The panda holds up his hands and says 'I was born with them'",
"A man was caught stealing in a supermarket today while balanced on the shoulders of a couple of vampires. He was charged with shoplifting on two counts. ",
"I heard there was a new store called Moderation. They have everything there",
"Our wedding was so beautiful, even the cake was in tiers.",
"Did you hear about the new restaurant on the moon?... The food is great, but there's just no atmosphere.",
"I went to a book store and asked the saleswoman where the Self Help section was, she said if she told me it would defeat the purpose.",
"What did the mountain climber name his son?... Cliff.",
"I was thinking about moving to Moscow but there is no point Russian into things.",
"My New Years resolution is to stop leaving things so late.",
"If you're struggling to think of what to get someone for Christmas. Get them a fridge and watch their face light up when they open it.",
"What's ET short for?... Because he's only got little legs.",
"People are making apocalypse jokes like there's no tomorrow.",
"Why do crabs never give to charity?... Because they're shellfish.",
"What do you call an Argentinian with a rubber toe?... Roberto",
"What do you call a Mexican man leaving the hospital?... Manuel",
"I cut my finger chopping cheese, but I think that I may have grater problems.",
"Today a girl said she recognized me from vegetarian club, but I'm sure I've never met herbivore.",
"I went to the doctor today and he told me I had type A blood but it was a type O.",
"When you have a bladder infection, urine trouble.",
"My cat was just sick on the carpet, I don't think it's feline well.",
"I dreamed about drowning in an ocean made out of orange soda last night. It took me a while to work out it was just a Fanta sea.",
"Without geometry life is pointless.",
"A termite walks into a bar and asks 'Is the bar tender here?...'",
"What's Forest Gump's Facebook password?... 1forest1",
"I gave all my dead batteries away today… Free of charge.",
"What's the advantage of living in Switzerland?... Well, the flag is a big plus.",
"Why did the octopus beat the shark in a fight?... Because it was well armed.",
"A red and a blue ship have just collided in the Caribbean. Apparently the survivors are marooned.",
"How do you organize a space party?... You planet.",
"What do you call a group of killer whales playing instruments?... An Orca-stra.",
"Why was the big cat disqualified from the race?... Because it was a cheetah.",
"A man walked in to a bar with some asphalt on his arm. He said 'Two beers please, one for me and one for the road.'",
"Just watched a documentary about beavers… It was the best damn program I've ever seen.",
"Breaking news! Energizer Bunny arrested – charged with battery.",
"Conjunctivitis.com – now that's a site for sore eyes.",
"A Sandwich walks into a bar, the bartender says 'Sorry, we don't serve food here'",
"'Doctor, I've broken my arm in several places...' Doctor responds 'Well don't go to those places.'",
"I fear for the calendar, it's days are numbered.",
"There's a new type of broom out, it's sweeping the nation.",
"Atheism is a non-prophet organisation.",
"Slept like a log last night … woke up in the fireplace.",
"What did the fish say when it swam into a wall?... Damn!",
"What cheese can never be yours?... Nacho cheese.",
"A police officer caught two kids playing with a firework and a car battery. He charged one and let the other one off.",
"Velcro… What a rip-off.",
"Where does Napoleon keep his armies?... In his sleevies.",
"I went to the zoo the other day, there was only one dog in it. It was a shitzu.",
"Why can't you hear a pterodactyl go to the bathroom?... The p is silent.",
"What do you call a cow with no legs?... Ground beef.",
"What did the Buffalo say to his little boy when he dropped him off at school?... Bison.",
"So a duck walks into a pharmacy and says 'Give me some chap-stick… and put it on my bill'",
"Why did the scarecrow win an award?... Because he was outstanding in his field.",
"Why did the girl smear peanut butter on the road?... To go with the traffic jam.",
"Why does a chicken coop only have two doors?... Because if it had four doors it would be a chicken sedan.",
"Why don't seagulls fly over the bay?... Because then they'd be bay-gulls!",
"What do you call a fly without wings?... A walk.",
"What do you do when a blonde throws a grenade at you?... Pull the pin and throw it back.",
"What's brown and sounds like a bell?... Dung!",
"How do you make a hankie dance?... Put a little boogie in it.",
"Where does batman go to the bathroom?... The batroom.",
"What's the difference between an African elephant and an Indian elephant?... About 5000 miles.",
"Two muffins were sitting in an oven, and the first looks over to the second, and says, 'man, it's really hot in here'. The second looks over at the first with a surprised look, and answers, 'WHOA, a talking muffin!'",
"A man walks into a bar and orders helicopter flavor chips. The barman replies 'sorry mate we only do plain'",
"What do you call a sheep with no legs?... A cloud.",
"I knew i shouldn't have ate that seafood. Because now i'm feeling a little… Eel",
"What did the late tomato say to the early tomato?... I'll ketch up",
"What did the 0 say to the 8?... Nice belt.",
"Why didn't the skeleton cross the road?... Because he had no guts.",
"Why don't skeletons ever go trick or treating?... Because they have nobody to go with.",
"Why do scuba divers fall backwards into the water?... Because if they fell forwards they'd still be in the boat.",
"Have you ever heard of a music group called Cellophane?... They mostly wrap.",
"What kind of magic do cows believe in?... MOO-DOO.",
"At what time does the soldier go to the dentist?... 1430.",
"What time did the man go to the dentist?... Tooth hurt-y.",
"Did you hear about the guy who invented Lifesavers?... They say he made a mint.",
"Why did the Clydesdale give the pony a glass of water?... Because he was a little horse!",
"Two peanuts were walking down the street. One was a salted.",
"I used to have a job at a calendar factory but I got the sack because I took a couple of days off.",
"How do you make holy water?... You boil the hell out of it.",
"Two guys walk into a bar, the third one ducks.",
"I had a dream that I was a muffler last night. I woke up exhausted!",
"5/4 of people admit that they’re bad with fractions.",
"Did you hear the news?... FedEx and UPS are merging. They’re going to go by the name Fed-Up from now on.",
"What's the difference between a poorly dressed man on a tricycle and a well dressed man on a bicycle?... Attire",
"Why do bears have hairy coats?... Fur protection.",
"What do you call a fish with no eyes?... A fshhhh.",
"What do you call cheese by itself?... Provolone.",
"Why did the A go to the bathroom and come out as an E?... Because he had a vowel movement.",
"Did you hear about the cheese factory that exploded in France?... There was nothing left but de Brie.",
"Do you know where you can get chicken broth in bulk?... The stock market.",
"Why is no one friends with Dracula?... Because he's a pain in the neck.",
"What did the ocean say to the shore?... Nothing, it just waved.",
"Why are skeletons so calm?... Because nothing gets under their skin.",
"What did the beaver say to the tree?... It's been nice gnawing you.",
"Why did the orange stop halfway up the hill?... He ran out of juice.",
"What's the richest country in the world?... Ireland, because its capital is always Dublin. ",
"What's worse than finding a worm in your apple?... Finding half a worm. ",
"William Shakespeare went into a pub. The barman took one look at him and said, 'You're bard!'",
"Did you hear about the man who drowned in a bowl of muesli?... He was pulled under by a strong currant.",
"What do you get when you run over a sparrow with a lawnmower?... Shredded Tweet.",
"What's yellow and swings through the jungle smelling of almonds?... Tarzipan. ",
"Why do milking stools only have three legs?... Because the cow has the udder. "]