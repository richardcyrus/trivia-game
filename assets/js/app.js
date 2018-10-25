/* global window, jQuery */

/**
 * Trivia Game.
 *
 * UNC Charlotte Full Stack Boot Camp.
 * (c) 2018 Richard Cyrus <richard.cyrus@rcyrus.com>
 *
 * - Create a trivia game that presents the player with a question.
 * - Each question that is displayed to the player is accompanied by a
 *   countdown timer. (done)
 * - If the player selects the correct answer:
 *      - Display a screen congratulating the player.
 *      - After a brief timeout, display the next question in the game.
 * - If the player does not select the correct answer:
 *      - Display a screen to notify the player that they have chosen an
 *        incorrect answer.
 *      - Also display the correct answer.
 *      - After a brief timeout, display the next question in the game.
 * - If the countdown timer expires:
 *      - Display a screen to notify the player that they have run out
 *        of time to answer the question.
 *      - Also display the correct answer.
 *      - After a brief timeout, display the next question in the game.
 * - When all questions have been played:
 *      - Display the number of correct answers.
 *      - Display the number of incorrect answers.
 *      - Display an option to start the game again.
 *
 * Note: For all display options in the game, do not reload the page.
 * - This applies to the change of questions
 * - The game statistics display at the end.
 * - Starting the game again if the player chooses to do so.
 */

(function (window, $) {
    'use strict';

    /**
     * A Fisher-Yates shuffle to ensure that for each turn of the game
     * the word presented is unique.
     *
     * @see https://bost.ocks.org/mike/shuffle/
     * @see https://www.frankmitchell.org/2015/01/fisher-yates/
     *
     * @param list
     *
     * @returns {*}
     */
    function shuffle(list) {
        let remaining = list.length, pick, current;

        while (0 !== remaining) {
            pick = Math.floor(Math.random() * remaining--);

            current = list[remaining];
            list[remaining] = list[pick];
            list[pick] = current;
        }

        return list;
    }

    let correctAnswerCount = 0;
    let incorrectAnswerCount = 0;


    const TriviaGame = {
        /**
         * This tracks the timer for question play.
         */
        questionTimerId: 0,
        /**
         * This tracks the display change timer. Those cases where we are
         * between questions (right or wrong answer).
         */
        messageTimerId: 0,
        /**
         * The number of seconds to display the messaging between questions.
         */
        messageTimeout: 10,
        /**
         * The Trivia questions for play at page load.
         * For use when the player has exhausted all questions and chooses
         * to play again.
         */
        playList: [],
        /**
         * The Trivia questions for play since browser page load.
         */
        currentPlayList: [],
        /**
         * The question object currently on the screen.
         */
        currentQuestion: {},

        init: function(questions, bindEvents = false) {
            if (this.playList.length === 0) {
                this.playList = questions.slice();
            }

            this.currentPlayList = shuffle(questions);

            this.startPlay();

            if (bindEvents) {
                this.bindHandler();
            }
        },

        bindHandler: function () {

        },

        startPlay: function() {
            console.log('Called startPlay');

            if (this.currentPlayList.length > 0) {
                this.currentQuestion = this.currentPlayList.shift();
                this.currentQuestion.choices = shuffle(this.currentQuestion.choices);

                console.log('Pushing to the screen. ' + this.currentQuestion);
                this.showQuestion(this.currentQuestion);

                console.log('Starting a new timer');
                this.timer(this.updateQuestionTimer, this.questionTimerId);
            }
        },

        showQuestion: function(data) {
            $('.row').html(
                `<div class="card">
                    <div class="card-header">
                        <h5 class="card-title question">${data.question}</h5>
                    </div>
                    <div class="choices list-group">
                        <div class="list-group-item border-0 flex-column align-items-start">
                            <div class="d-flex w-100 justify-content-between">
                                <small class="text-muted">Click on the item you think is the correct answer.</small>
                                <small class="text-muted">Time Remaining: <span class="countdown"></span></small>
                            </div>
                        </div>
                        ${data.choices.map((choice) => `
                            <div class="list-group-item text-center border-0" data-answer="${data.answer === choice}">${choice}</div>
                        `.trim()).join('')}
                    </div>
                </div>`
            );
        },

        updateQuestionTimer: function(seconds) {
            $('.countdown').text(seconds);
        },

        outOfTimeTimer: function() {
            clearInterval(this.messageTimerId);

            const now = Date.now();
            const then = now + this.messageTimeout * 1000;

            this.messageTimerId = setInterval(() => {

                const secondsLeft = Math.round((then - Date.now()) / 1000);

                // Should we stop?
                if (secondsLeft < 0) {

                    // Stop setInterval.
                    clearInterval(this.messageTimerId);

                    // Must be called here. If it isn't the Time's-up
                    // message isn't displayed.
                    this.startPlay();

                    // If this return is not here, on the last one it
                    // will still fall through after calling this.startPlay();
                    return;
                }

                console.log(`Time's-up message countdown: ${secondsLeft}`);
            }, 1000);
        },

        displayMessage: function() {
            $('.row').html(
                `<div class="card">
                    <div class="card-header">
                        <h1 class="card-title time-is-up">Your time to answer this question has expired!</h1>
                    </div>
                    <div class="card-body">
                        <p>The correct answer is ${this.currentQuestion.answer}</p>
                        <p>Please wait while we choose the next question.</p>
                    </div>
                </div>`
            );
        },

        timerDecision: function() {
            console.log("Timer's run out!");

            if (this.currentPlayList.length === 0) {
                // Show statistics. This case if the user runs out of time
                // on the last question. Show message, show stats for
                // game over.

                this.displayMessage();
                // this.outOfTimeTimer();
                console.log('Game Over!');
            } else {
                // This is the case if the user runs out of time
                // on a question, and there are more question to play.
                // Show message, pick question, start new question at
                // messageTimer === 0
                console.log(`${this.currentPlayList.length} more questions to ask.`);
                this.displayMessage();
                this.outOfTimeTimer();
            }
        },

        timer: function(displayUpdate, intervalAnchor, seconds = 15) {

            // Clear existing timers.
            clearInterval(intervalAnchor);

            const now = Date.now();
            const then = now + seconds * 1000;

            // Start the clock.
            displayUpdate(seconds);

            intervalAnchor = setInterval(() => {
                const secondsLeft = Math.round((then - Date.now()) / 1000);

                // Should we stop?
                if (secondsLeft <= 0) {
                    // Stop setInterval.
                    clearInterval(intervalAnchor);

                    // Let caller know time's up.
                    console.log(`Reached ${secondsLeft} of ${seconds}`);
                    this.timerDecision();

                    // If this return is not here, on the last one it
                    // will still fall through after calling this.timerDecision();
                    return;
                }

                // Display time left
                displayUpdate(secondsLeft);
            }, 1000);
        }
    };

    const questions = [
        {
            question: "A whole generation of Americans refers to this famous person as 'Ole Blue Eyes'. To whom are they referring?",
            choices: [
                "Robert Redford",
                "Chris Pine",
                "Frank Sinatra",
                "Bradley Cooper"
            ],
            answer: "Frank Sinatra"
        },
        {
            question: "The Sex in the City Series is based on a real-life person's experiences in New York City. Name the real-life person.",
            choices: [
                "Carrie Bradshaw",
                "Candace Bushnell",
                "Miranda Priestley",
                "Sarah Jessica Parker"
            ],
            answer: "Candace Bushnell"
        },
        {
            question: "Cinco de Mayo was first celebrated in the United States as a show of solidarity with which country against French rule?",
            choices: [
                "Bolivia",
                "Portugal",
                "Spain",
                "Mexico"
            ],
            answer: "Mexico"
        },
        {
            question: "In 2008, several financial institutions faced a financial crisis, forcing the U.S. government to take measures to prevent their collapse. What phrase is used to denote the importance of those institutions?",
            choices: [
                "The Wolf of Wall Street",
                "Too Big to Fail",
                "The Big Chill",
                "A Lion in Winter"
            ],
            answer: "Too Big to Fail"
        },
        {
            question: "In today's lexicon, acronyms have replaced words in everyday language and messaging. What does the acronym »idk« mean?",
            choices: [
                "It's darn kind",
                "Invention done kind",
                "Internet diction kills",
                "I don't know"
            ],
            answer: "I don't know"
        }
    ];

    TriviaGame.init(questions);

})(window, jQuery);
