/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');

const genre_code = {
  '28' :'action',
  '12' :'adventure',
  '16' :'animation',
  '35':'comedy',
  '80':'crime',
  '99':'documentary',
  '18':'drama',
  '10751':'family',
  '14':'fantasy',
  '27':'horror',
  '53':'thriller',
  '10752':'war' ,
  '36':'history',
  '10402':'music',
  '9648':'mystery',
  '10749':'romance',
  '37':'western',
  '878':'science-fiction',
};

var RandomInt = (min, max) => {
		return Math.floor(Math.random()*(max-min+1)+min);
};

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = `Welcome!! You can ask me for upcoming movies. How can I help you?`;
    return handlerInput.responseBuilder
      .speak(speechText)
      .withShouldEndSession(false)
      .getResponse();
  },
};

var URL = 'https://api.themoviedb.org/3';
const APIKEY = 'ed2abc139713cf83b45739d153cc15b1';

var currentDate = new Date();
var numberOfDaysToAdd = 30;
var nextDate = new Date(currentDate.getTime()+(numberOfDaysToAdd*24*60*60*1000));

var currentDay = currentDate.getDate();
var currentMonth = currentDate.getMonth()+1;
var currentYear = currentDate.getFullYear();

var nextDay = nextDate.getDate();
var nextMonth = nextDate.getMonth()+1;
var nextYear = nextDate.getFullYear();

var currentFormattedDate = currentYear + '-'+ currentMonth + '-'+ currentDay;
var nextFormattedDate = nextYear + '-'+ nextMonth + '-'+ nextDay;


const UpcomingMovieHandler = {
  canHandle(handlerInput) {
    return (handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'upcomingMovie');
  },
  async handle(handlerInput) {
    var outputSpeech = 'Here are the some upcoming movies: ';
    var SessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    URL+=`/discover/movie?api_key=${APIKEY}`;
    URL+=`&page=1`;
    URL+=`&with_original_language=en`;
    URL+=`&primary_release_date.gte=${currentFormattedDate}`;
    URL+=`&primary_release_date.lte=${nextFormattedDate}`;
    await getRemoteData(URL)
      .then((response) => {
        const data = JSON.parse(response);
        var i=0;
        while(i<4){
          if(i===3){
            outputSpeech+=' and ';
          }
          var movieDate = data.results[i].release_date;
          var movieTitle = data.results[i].title;
          outputSpeech += `${movieTitle} releasing on ${movieDate}`;
          if(i<2)outputSpeech+=', ';
          i++;
        }
      });
    SessionAttributes.lastStatement = outputSpeech;
    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .withShouldEndSession(false)
      .getResponse();
  },
};

const MovieDescriptionHandler = {
  canHandle(handlerInput) {
    return (handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'movieDescription');
  },
  async handle(handlerInput) {
    var movieName=handlerInput.requestEnvelope.request.intent.slots.movieName.value; // Getting movieName from the slot
    var outputSpeech;
    var SessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    
    // Building URL for API
    URL+=`/search/movie?api_key=${APIKEY}`; 
    URL+=`&page=1`;
    URL+=`&language=en-US`;
    URL+=`&query=${movieName}`;
    
    await getRemoteData(URL)
      .then((response) => {
        // Building response from API Response
        const data = JSON.parse(response);
        outputSpeech = data.results[0].title + " was released in year " + data.results[0].release_date.split("-")[0];
        outputSpeech += ", Movie Description: ";
        outputSpeech += data.results[0].overview;
      });
    SessionAttributes.lastStatement = outputSpeech;
    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .withShouldEndSession(false)
      .getResponse();
  },
};

const MovieSuggestIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'movieIntent';
  },
  async handle(handlerInput){
    let genreSlot = handlerInput.requestEnvelope.request.intent.slots['genre'].value;
    let genreId = handlerInput.requestEnvelope.request.intent.slots.genre.resolutions.resolutionsPerAuthority[0].values[0].value.id;
    
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    let speechText;
    URL+=`/discover/movie?api_key=${APIKEY}`;
    URL+=`&page=1`;
    URL+=`&with_original_language=en`;

    if(genreId != 0){
      speechText = `Here are your movie recommendations in ${genreSlot} genre: `;
      URL+=`&with_genres=${genreId}`;
    }
    else{
      speechText = `Here are your movie recommendations: `;
      var Keys = Object.keys(genre_code);
      var Size = Keys.length;
      var choice = Keys[RandomInt(0, Size-1)];
      URL+=`&with_genres=${choice}`;
    }

    await getRemoteData(URL)
    .then((response) => {
      const data = JSON.parse(response);
      var i=0;
      while(i<4){
        if(i===3){
          speechText+=' and ';
        }
        var movieTitle = data.results[i].title;
        speechText += `${movieTitle}`;
        if(i<2)speechText+=', ';
        i++;
        if(i===3)speechText+='.';
      }
    })
    .catch(function(error){
      console.log(error);
    });
    sessionAttributes.lastStatement = speechText;
    return handlerInput.responseBuilder
    .speak(speechText)
    .reprompt(speechText)
    .withShouldEndSession(false)
    .getResponse();
  },
};

const SimilarMoviesHandler = {
  canHandle(handlerInput) {
    return (handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'similarMovie');
  },
  async handle(handlerInput) {
    var movieName=handlerInput.requestEnvelope.request.intent.slots.movieName.value; // Getting movieName from the slot
    var SessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    // console.log(movieName);
    // Building URL for API
    var queryURL = URL; // URL for searching similar movies
    queryURL+= `/movie`;
    // // var queryURL
    URL+=`/search/movie?api_key=${APIKEY}`; // URL for getting movieID
    URL+=`&page=1`;
    URL+=`&language=en-US`;
    URL+=`&query=${movieName}`;
    
    
    var movieId; 
    
    await getRemoteData(URL)
      .then((response) => {
        // Building response from API Response
        const data = JSON.parse(response);
        movieId = data.results[0].id;
    });
    
    queryURL+=`/${movieId}/similar?api_key=${APIKEY}&language=en-US`;
    let speechText = `Here are your movie recommendations similar to ${movieName} genre: `;
    await getRemoteData(queryURL)
    .then((response) => {
      const data = JSON.parse(response);
      var i=0;
      while(i<4){
        if(i===3){
          speechText+=' and ';
        }
        var movieTitle = data.results[i].title;
        speechText += `${movieTitle}`;
        if(i<2)speechText+=', ';
        i++;
        if(i===3)speechText+='.';
      }
    })
      
    SessionAttributes.lastStatement = speechText;
    return handlerInput.responseBuilder
      .speak(speechText)
      .withShouldEndSession(false)
      .getResponse();
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = `Any HELP!!`;
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withShouldEndSession(true)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak(`You are in HelpIntent`)
      .getResponse();
  },
};

const RepeatHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && (request.intent.name === 'AMAZON.RepeatIntent');
  },
  handle(handlerInput) {
    var repeatStatement = 'Yeah sure. ';
    var SessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    repeatStatement += SessionAttributes.lastStatement;
    return handlerInput.responseBuilder
      .speak(repeatStatement)
      .withShouldEndSession(false)
      .getResponse();
  },
};

const getRemoteData = function (url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? require('https') : require('http');
    const request = client.get(url, (response) => {
      if (response.statusCode < 200 || response.statusCode > 299) {
        reject(new Error('Failed with status code: ' + response.statusCode));
      }
      const body = [];
      response.on('data', (chunk) => body.push(chunk));
      response.on('end', () => resolve(body.join('')));
    });
    request.on('error', (err) => reject(err));
  });
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    UpcomingMovieHandler,
    LaunchRequestHandler,
    MovieDescriptionHandler,
    MovieSuggestIntentHandler,
    SimilarMoviesHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
    RepeatHandler,
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();

