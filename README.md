# Trivia Game

## Instructions

* Create a trivia game, that presents the player with a question.
* Each question that is displayed to the player is accompanied by a countdown timer.
* If the player selects the correct answer:
    - Display a screen congratulating the player.
    - After a brief timeout, display the next question in the game.
* If the player does not select the correct answer:
    - Display a screen to notify the player that they have chosen an incorrect answer.
    - Also display the correct answer.
    - After a brief timeout, display the next question in the game.
* If the countdown timer expires:
    - Display a screen to notify the player that they have run out of time to answer the question.
    - Also display the correct answer.
    - After a brief timeout, display the next question in the game.
* When all questions have been played:
    - Display the number of correct answers.
    - Display the number of incorrect answers.
    - Display an option to start the game again.

**Note:** For all display options in the game, do not reload the page.
    - This applies to the change of questions
    - The game statistics display at the end.
    - Starting the game again if the player chooses to do so.

## Notes

* The inspiration for the page design is from the concept of an HTML slide show.
* The design is based partially on work from [WebSlides](https://webslides.tv/ "WebSlides")
* [WebSlides](https://webslides.tv/ "WebSlides") was used as a reference for some of the styles.

* The game also uses a Fisher-Yates shuffle. The following locations were used as a reference.
    - [Mike Bostock :: Fisher-Yates Shuffle](https://bost.ocks.org/mike/shuffle/)
    - [Frank Mitchell :: The only way to shuffle an array in JavaScript](https://www.frankmitchell.org/2015/01/fisher-yates/)

* The idea for the shuffle came about during the [Word Guess game](https://github.com/richardcyrus/word-guess-game). 
    - In that game it was used to ensure that the players would exhaust the entire list of words in play, before experiencing a repeat.
* In this game it is used to shuffle the list of questions as well as the possible answers to each question.
    - It reduces the possibility of the questions appearing in the same order on each run of the game.
    - It reduces the possibility of the answer choices appearing in the same order on each run of the game.

# Credits

- The questions in this game were provided courtesy of my very good friend Ms. Rhonda Williams.

- The background image is from [Unsplash](https://unsplash.com "Unsplash").
    - _Author_: [Jason Leung](https://unsplash.com/@ninjason)

## The Unsplash License

All photos published on Unsplash can be used for free. You can use them for commercial and noncommercial purposes. You do not need to ask permission from or provide credit to the photographer or Unsplash, although it is appreciated when possible.

More precisely, Unsplash grants you an irrevocable, nonexclusive, worldwide copyright license to download, copy, modify, distribute, perform, and use photos from Unsplash for free, including for commercial purposes, without permission from or attributing the photographer or Unsplash. This license does not include the right to compile photos from Unsplash to replicate a similar or competing service.
