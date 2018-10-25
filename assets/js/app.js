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
 *        of time to answer the question. (done)
 *      - Also display the correct answer. (done)
 *      - After a brief timeout, display the next question in the game. (done)
 * - When all questions have been played:
 *      - Display the number of correct answers. (done)
 *      - Display the number of incorrect answers. (done)
 *      - Display an option to start the game again.
 *
 * Note: For all display options in the game, do not reload the page.
 * - This applies to the change of questions
 * - The game statistics display at the end.
 * - Starting the game again if the player chooses to do so.
 */

(function ($) {
    'use strict';

    /**
     * A Fisher-Yates shuffle.
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
        questionTimerId: 0,
        messageTimerId: 0,
        messageTimeout: 10,
        playList: [],
        currentPlayList: [],
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
            this.currentQuestion = this.currentPlayList.shift();
            this.currentQuestion.choices = shuffle(this.currentQuestion.choices);

            this.showQuestion(this.currentQuestion);

            this.timer(
                this.questionTimerId,
                $.proxy(this.timerDecision, this),
                this.updateQuestionTimer
            );
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

        displayGameStats: function () {
            $('.row').html(
                `<div class="card">
                    <div class="card-header">
                        <h1 class="card-title time-is-up">We have reached the end of the game!</h1>
                    </div>
                    <div class="card-body">
                        <h2>Here's how you scored:</h2>
                        <p class="text-center">${correctAnswerCount} Questions answered correctly.</p>
                        <p class="text-center">${incorrectAnswerCount} Questions answered incorrectly.</p>
                    </div>
                </div>`
            );
        },

        timerDecision: function() {
            /**
             * If the player ran out of time before clicking, then they
             * do not get points for the question.
             */
            incorrectAnswerCount++;

            // Show the player the correct answer.
            this.displayMessage();

            if (this.currentPlayList.length === 0) {
                /**
                 * **Game Over!** Start a timer to display the game
                 * statistics. This allows the player time to read the
                 * correct answer. This will show the end of game
                 * statistics when the timer reaches 0.
                 */
                this.timer(
                    this.messageTimerId,
                    $.proxy(this.displayGameStats, this),
                    false,
                    this.messageTimeout
                );
            } else {
                /**
                 * Start a timer to the next question. This allows the
                 * player time to read the correct answer. This will
                 * show the next question when the timer reaches 0.
                 */
                this.timer(
                    this.messageTimerId,
                    $.proxy(this.startPlay, this),
                    false,
                    this.messageTimeout
                );
            }
        },

        timer: function(intervalId, runWhenFinished = false, displayUpdate = false, seconds = 15) {

            const now = Date.now();
            const then = now + seconds * 1000;

            clearInterval(intervalId);

            /**
             * If provided, execute the callback provided to show the
             * change in time remaining. This starts the clock at
             * `seconds`.
             */
            if (displayUpdate) {
                displayUpdate(seconds);
            }

            intervalId = setInterval(() => {
                const secondsLeft = Math.round((then - Date.now()) / 1000);

                if (secondsLeft <= 0) {
                    clearInterval(intervalId);

                    /**
                     * If provided, execute the callback `runWhenFinished`.
                     */
                    if (runWhenFinished) {
                        runWhenFinished();
                    }

                    /**
                     * If this return is not here, on the last one it
                     * will still fall through. to the statement after
                     * this block.
                     */
                    return;
                }

                /**
                 * If provided, execute the callback provided to show the
                 * change in time remaining.
                 */
                if (displayUpdate) {
                    displayUpdate(secondsLeft);
                }
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

})(jQuery);
