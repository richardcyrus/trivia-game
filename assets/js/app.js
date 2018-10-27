/* global jQuery */

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
 *      - Display a screen congratulating the player. (done)
 *      - After a brief timeout, display the next question in the game. (done)
 * - If the player does not select the correct answer:
 *      - Display a screen to notify the player that they have chosen an
 *        incorrect answer. (done)
 *      - Also display the correct answer. (done)
 *      - After a brief timeout, display the next question in the game. (done)
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
 *      - This applies to the change of questions
 *      - The game statistics display at the end.
 *      - Starting the game again if the player chooses to do so.
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

    /**
     * Track the number of questions answered correctly.
     *
     * @type {number}
     */
    let correctAnswerCount = 0;

    /**
     * Track the number of questions answered incorrectly.
     *
     * @type {number}
     */
    let incorrectAnswerCount = 0;

    /**
     * A reference to the timer that is currently active. Allows us to
     * stop the question timer when the player clicks on an answer.
     *
     * @type {number}
     */
    let timerId = 0;

    const TriviaGame = {
        messageTimeout: 10,
        playList: [],
        currentPlayList: [],
        currentQuestion: {},
        timerElement: null,

        /**
         * Initialize the object. Get the list of questions, and whether
         * or not to register the click handler for the questions.
         *
         * @param questions
         * @param bindEvents
         */
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

        /**
         * Bind the click handler for the questions.
         */
        bindHandler: function () {
            $('.trivia__game').on(
                'click', '.trivia__card-answer', $.proxy(this.playerClick, this)
            );
        },

        /**
         * Pop a question off the front of the questions in play,
         * display on screen, and start the timer.
         */
        startPlay: function() {
            this.currentQuestion = this.currentPlayList.shift();
            this.currentQuestion.choices = shuffle(this.currentQuestion.choices);

            this.showQuestion(this.currentQuestion);

            this.timer(
                $.proxy(this.timerDecision, this),
                $.proxy(this.updateQuestionTimer, this)
            );
        },

        /**
         * Handle the player clicking on one of the answers.
         *
         * @param event
         */
        playerClick: function(event) {
            const element = event.target;
            const playerChoice = $(element).attr('data-answer');

            clearInterval(timerId);

            if (playerChoice === this.currentQuestion.answer) {
                correctAnswerCount++;

                // Show the player congratulations.
                this.showCorrect();
            } else {
                incorrectAnswerCount++;

                // Show the player the correct answer.
                this.displayMessage();
            }

            this.handlePlay();
        },

        /**
         * Display the question on the screen.
         *
         * @param data
         */
        showQuestion: function(data) {
            $('.trivia__game').html(
                `<section class="trivia__card">
                    <div class=trivia__card-wrap>
                        <h1 class="trivia__question">${data.question}</h1>
                        <hr>
                        <div class="trivia__card-information">
                            <ul class="trivia__card-information--sections">
                                <li>Click to choose the correct answer.</li>
                                <li>Time Remaining:&nbsp;<span class="countdown"></span></li>
                            </ul>
                        </div>
                        <hr>
                        <div class="trivia__card-answers">
                            <div class="trivia__card-choices">
                            ${data.choices.map((choice) => `<button class="trivia__card-answer" data-answer="${choice}">${choice}</button>`.trim()).join('')}
                            </div>
                        </div>
                    </div>
                </section>`
            );
        },

        /**
         * Display and update the time remaining.
         *
         * @param seconds The amount of time to display.
         */
        updateQuestionTimer: function(seconds) {
            /**
             * Have to grab the element reference here since it does not
             * exist when the page is loaded.
             */
            this.timerElement = $('.countdown');

            if (seconds <= 10 && ! this.timerElement.hasClass('danger')) {
                this.timerElement.addClass('danger');
            }

            this.timerElement.text(seconds);
        },

        /**
         * Display a message when the player chooses the incorrect answer
         * or their time to choose an answer has run out.
         */
        displayMessage: function() {
            $('.trivia__game').html(
                `<section class="trivia__card">
                    <div class=trivia__card-wrap>
                        <h1 class="trivia__message">Oh-oh!</h1>
                        <hr>
                        <div class="trivia__wrong-answer">
                            <p>You either chose the incorrect answer or your time expired!<p>
                            <p>The correct answer to the question is: <i>${this.currentQuestion.answer}</i></p>
                        </div>
                    </div>
                </section>`
            );
        },

        /**
         * Display the end of play message, and tell the player how many
         * questions they answered correctly and how many were incorrect.
         */
        displayGameStats: function () {
            $('.trivia__game').html(
                `<section class="trivia__card">
                    <div class=trivia__card-wrap>
                        <h1 class="trivia__game-over">We have reached the end of the game!</h1>
                        <hr>
                        <div class="trivia__message-details">
                            <h2>Here's how you scored:</h2>
                            <p>${correctAnswerCount} Questions answered correctly.</p>
                            <p>${incorrectAnswerCount} Questions answered incorrectly.</p>
                        </div>
                    </div>
                </section>`
            );
        },

        /**
         * Display a message to the player when they have chosen the
         * correct answer.
         */
        showCorrect: function() {
            $('.trivia__game').html(
                `<section class="trivia__card">
                    <div class=trivia__card-wrap>
                        <h1 class="trivia__message">Congratulations!</h1>
                        <hr>
                        <div class="trivia__right-answer">
                            <p>You chose the correct answer!<p>
                        </div>
                    </div>
                </section>`
            );
        },

        /**
         * This is fired when the player does not choose an answer before
         * the clock has run out on the question in play.
         */
        timerDecision: function() {
            /**
             * If the player ran out of time before clicking, then they
             * do not get points for the question.
             */
            incorrectAnswerCount++;

            // Show the player the correct answer.
            this.displayMessage();

            // Continue to the next step (new question or game over).
            this.handlePlay();
        },

        // TODO: Choose a better name for what happens here!
        handlePlay: function() {
            if (this.currentPlayList.length === 0) {
                /**
                 * **Game Over!** Start a timer to display the game
                 * statistics. This allows the player time to read the
                 * correct answer. This will show the end of game
                 * statistics when the timer reaches 0.
                 */
                this.timer(
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
                    $.proxy(this.startPlay, this),
                    false,
                    this.messageTimeout
                );
            }
        },

        /**
         * Execute a timed delay for various events in the game.
         *
         * @param runWhenFinished The callback to execute when the timer expires.
         * @param displayUpdate The callback to execute to display time remaining.
         * @param seconds The number of seconds to count down.
         */
        timer: function(runWhenFinished = false, displayUpdate = false, seconds = 15) {

            const now = Date.now();
            const then = now + seconds * 1000;

            clearInterval(timerId);

            /**
             * If provided, execute the callback provided to show the
             * change in time remaining. This starts the clock at
             * `seconds`.
             */
            if (displayUpdate) {
                displayUpdate(seconds);
            }

            timerId = setInterval(() => {
                const secondsLeft = Math.round((then - Date.now()) / 1000);

                if (secondsLeft <= 0) {
                    clearInterval(timerId);

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

    // const all_questions = [
    //     {
    //         question: "A whole generation of Americans refers to this famous person as 'Ole Blue Eyes'. To whom are they referring?",
    //         choices: [
    //             "Robert Redford",
    //             "Chris Pine",
    //             "Frank Sinatra",
    //             "Bradley Cooper"
    //         ],
    //         answer: "Frank Sinatra"
    //     },
    //     {
    //         question: "The Sex in the City Series is based on a real-life person's experiences in New York City. Name the real-life person.",
    //         choices: [
    //             "Carrie Bradshaw",
    //             "Candace Bushnell",
    //             "Miranda Priestley",
    //             "Sarah Jessica Parker"
    //         ],
    //         answer: "Candace Bushnell"
    //     },
    //     {
    //         question: "Cinco de Mayo was first celebrated in the United States as a show of solidarity with which country against French rule?",
    //         choices: [
    //             "Bolivia",
    //             "Portugal",
    //             "Spain",
    //             "Mexico"
    //         ],
    //         answer: "Mexico"
    //     },
    //     {
    //         question: "In 2008, several financial institutions faced a financial crisis, forcing the U.S. government to take measures to prevent their collapse. What phrase is used to denote the importance of those institutions?",
    //         choices: [
    //             "The Wolf of Wall Street",
    //             "Too Big to Fail",
    //             "The Big Chill",
    //             "A Lion in Winter"
    //         ],
    //         answer: "Too Big to Fail"
    //     },
    //     {
    //         question: "In today's lexicon, acronyms have replaced words in everyday language and messaging. What does the acronym »idk« mean?",
    //         choices: [
    //             "It's darn kind",
    //             "Invention done kind",
    //             "Internet diction kills",
    //             "I don't know"
    //         ],
    //         answer: "I don't know"
    //     },
    //     {
    //         question: "The Academy Awards, also known as the Oscars, are awarded annually by the Academy of Motion Picture Arts and Sciences, to recognise excellence in cinematic achievements. What is the equivalent organisation in the United Kingdom?",
    //         choices: [
    //             "The Socky",
    //             "The IGOR",
    //             "The BAFTA",
    //             "The Tony"
    //         ],
    //         answer: "The BAFTA"
    //     },
    //     {
    //         question: "As of January 1, 2018 how many countries are a member of the E.U.?",
    //         choices: [
    //             "15",
    //             "21",
    //             "18",
    //             "28"
    //         ],
    //         answer: "28"
    //     },
    //     {
    //         question: "Which country uses the dinar as their currency?",
    //         choices: [
    //             "Greece",
    //             "Hungary",
    //             "Serbia",
    //             "Finland"
    //         ],
    //         answer: "Serbia"
    //     },
    //     {
    //         question: "In the U.S., on average, what colour car is pulled over by the police more than any other?",
    //         choices: [
    //             "Red",
    //             "Silver",
    //             "Black",
    //             "Grey"
    //         ],
    //         answer: "Red"
    //     },
    //     {
    //         question: "On September 11th of which year did the United States suffer a series of terrorist attacks?",
    //         choices: [
    //             "2011",
    //             "2001",
    //             "2012",
    //             "2013"
    //         ],
    //         answer: "2001"
    //     }
    // ];

    TriviaGame.init(questions, true);

})(jQuery);
