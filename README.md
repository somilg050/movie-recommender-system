# Movie Mania

## Skill Overview

The skill aims to engage the user in the following ways:
1. Similar Movies.
2. Movies Description.
3. Upcoming Movies.
4. Movies recommendation.

Once the user launches the skill saying “Open Movie Mania”, Alexa gives the user the option to get a movie description, upcoming movies, similar movies or movie recommendation.

## Intent handlers

**LaunchRequestHandler**​ : Handles the launch request intent of the skill. It explains the basic functionality of the skill.

**UpcomingMovieHandler**: ​ Raised when the user asks for upcoming movies. Users can even provide an actor name or genre for getting upcoming movies. If the movie with user mentions condition is not there then Alexa informs the user for the same else gives the user upcoming movies.

**MovieDescriptionHandler**: ​ Raised when the user asks for a movie description by providing a movie name. Alexa gives a brief description of asked movie. If the movie name provided by the user doesn’t exist then Alexa informs the user for the same.

**MovieSuggestIntentHandler**: ​ Raised when the user asks for a movie
recommendation on the basis of a genre or the year or particular actor movies.
Alexa recommends the user with four movies and if the user asks for more
then Alexa suggests three more movies and keeps on doing this until we have
movies in our database.

**SimilarMoviesHandler**: ​ Raised when the user provides a movie and asks
similar movies to it.

**FallBackHandler**:​ Gets called when the user response could not be mapped
to any of the defined intents.

**HelpIntentHandler**​ : Gets called when the user asks for help regarding the
usage of the skill.

**CancelAndStopIntentHandler**​ : Gets called when the user wants to end the
session saying "Quit", "Stop", "End" etc.

**RepeatHandler**:​ Gets called when the user asks to repeat the last statement.

**SessionEndedRequestHandler**:​ Raised when there is a problem compiling
the Lambda.
