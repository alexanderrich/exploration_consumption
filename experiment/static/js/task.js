/*
 * Requires:
 *     psiturk.js
 *     utils.js
 */

/*jslint browser: true*/
/*global _, $, document, window, setInterval, setTimeout, clearInterval, PsiTurk, uniqueId, adServerLoc, mode, condition, counterbalance */

// Initalize psiturk object
var psiTurk = new PsiTurk(uniqueId, adServerLoc, mode),
    EXP = {
        skipinstr: true,
        condition: parseInt(condition),
        counterbalance: parseInt(counterbalance),
        pages: [
            "instructions/instruct-1.html",
            "instructions/instruct-2.html",
            "postquestionnaire.html",
            "quiz.html",
            "stage.html",
            "cardTask.html",
            "restart.html",
            "sliders.html",
            "game.html"
        ],
        instructionPages: [
            "instructions/instruct-1.html",
            "instructions/instruct-2.html"
        ],
        loop: 0
    };


psiTurk.preloadPages(EXP.pages);

function quiz(instructions, callback) {
    "use strict";
    function record_responses() {
        var allRight = true;
        $("select").each(function () {
            psiTurk.recordTrialData({"phase": "INSTRUCTQUIZ", "question": this.id, "answer": this.value, "loop": EXP.loop});
            if (this.id === "grovessame" && this.value !== "no") {
                allRight = false;
            }
        });
        return allRight;
    }
    psiTurk.showPage("quiz.html");
    $("#continue").click(function () {
        if (record_responses()) {
            // Record that the user has finished the instructions and
            // moved on to the experiment. This changes their status code
            // in the database.
            psiTurk.recordUnstructuredData("instructionloops", EXP.loop);
            psiTurk.finishInstructions();
            // Move on to the experiment
            callback();
        } else {
            EXP.loop += 1;
            psiTurk.showPage("restart.html");
            $(".continue").click(function () {
                psiTurk.doInstructions(
                    instructions,
                    function () {quiz(instructions, callback); }
                );
            });
        }
    });
}

function ExploreExploitTask(params, callback) {
    "use strict";
    var page = psiTurk.pages["cardTask.html"],
        responseFn,
        firstRun = true;

    responseFn = function (choiceId) {
        var card = $("#" + choiceId),
            reward;
        if (!card.hasClass("clicked")) {
            card.css("background", "white")
                .addClass("clicked");
            if (Math.random() > .5) {
                card.html((Math.ceil(Math.random() * 6)).toFixed());
            } else {
                card.html("0").css("color", "red");
            }
        }
        reward = parseFloat(card.html());
        page = $("body").html();
        setTimeout(function () {callback(reward); }, 1000);
    };

    this.run = function(choicesLeft) {
        var i;
        $("body").html(page);
        if (firstRun) {
            firstRun = false;
            for (i = 0; i < params.cards; i++) {
                $("#carddiv").append("<div class=\"card\" id=\"card" + i + "\"></div>");
            }
            $(".card").css("background", "gray");
        }
        $(".card").click(function () {responseFn(this.id); });
        $("#trials").html(choicesLeft);
    };
}

function PositiveTask(params, callback) {
    "use strict";
    var page = psiTurk.pages["game.html"],
        canvas,
        width = 600,
        height = 500,
        ctx,
        ballRadius = 10,
        x = width/2,
        y = height-30,
        dx = 2,
        dy = -2,
        paddleHeight = 10,
        paddleWidth = 75,
        paddleX = (width-paddleWidth)/2,
        rightPressed = false,
        leftPressed = false,
        brickRowCount = 5,
        brickColumnCount = 3,
        brickWidth = 75,
        brickHeight = 20,
        brickPadding = 10,
        brickOffsetTop = 30,
        brickOffsetLeft = 30,
        score = 0,
        lives = 3,
        first = true,
        stopped,
        timeLeft,
        countdownTimer,
        bricks,
        keyDownHandler,
        keyUpHandler,
        mouseMoveHandler,
        countFn;


    keyDownHandler = function (e) {
        if(e.keyCode == 39) {
            rightPressed = true;
        }
        else if(e.keyCode == 37) {
            leftPressed = true;
        }
    };
    keyUpHandler = function (e) {
        if(e.keyCode == 39) {
            rightPressed = false;
        }
        else if(e.keyCode == 37) {
            leftPressed = false;
        }
    };
    mouseMoveHandler = function (e) {
        var relativeX = e.clientX - canvas.offsetLeft;
        if(relativeX > 0 && relativeX < canvas.width) {
            paddleX = relativeX - paddleWidth/2;
        }
    };
    function initBricks() {
        bricks = [];
        var c, r;
        for(c=0; c<brickColumnCount; c++) {
            bricks[c] = [];
            for(r=0; r<brickRowCount; r++) {
                bricks[c][r] = { x: 0, y: 0, status: 1 };
            }
        }
    }
    function collisionDetection() {
        var c, r;
        for(c=0; c<brickColumnCount; c++) {
            for(r=0; r<brickRowCount; r++) {
                var b = bricks[c][r];
                if(b.status == 1) {
                    if(x > b.x && x < b.x+brickWidth && y > b.y && y < b.y+brickHeight) {
                        dy = -dy;
                        b.status = 0;
                        score++;
                        if(score == brickRowCount*brickColumnCount) {
                            // alert("YOU WIN, CONGRATS!");
                            score = 0;
                            initBricks();
                            // document.location.reload();
                        }
                   }
                }
            }
        }
    }

    function drawBall() {
        ctx.beginPath();
        ctx.arc(x, y, ballRadius, 0, Math.PI*2);
        ctx.fillStyle = "#0095DD";
        ctx.fill();
        ctx.closePath();
    }
    function drawPaddle() {
        ctx.beginPath();
        ctx.rect(paddleX, canvas.height-paddleHeight, paddleWidth, paddleHeight);
        ctx.fillStyle = "#0095DD";
        ctx.fill();
        ctx.closePath();
    }
    function drawBricks() {
        var c, r;
        for(c=0; c<brickColumnCount; c++) {
            for(r=0; r<brickRowCount; r++) {
                if(bricks[c][r].status == 1) {
                    var brickX = (r*(brickWidth+brickPadding))+brickOffsetLeft;
                    var brickY = (c*(brickHeight+brickPadding))+brickOffsetTop;
                    bricks[c][r].x = brickX;
                    bricks[c][r].y = brickY;
                    ctx.beginPath();
                    ctx.rect(brickX, brickY, brickWidth, brickHeight);
                    ctx.fillStyle = "#0095DD";
                    ctx.fill();
                    ctx.closePath();
                }
            }
        }
    }
    function drawScore() {
        ctx.font = "16px Arial";
        ctx.fillStyle = "#0095DD";
        ctx.fillText("Score: "+score, 8, 20);
    }
    function drawLives() {
        ctx.font = "16px Arial";
        ctx.fillStyle = "#0095DD";
        ctx.fillText("Lives: "+lives, canvas.width-65, 20);
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBricks();
        drawBall();
        drawPaddle();
        drawScore();
        drawLives();
        collisionDetection();

        if(x + dx > canvas.width-ballRadius || x + dx < ballRadius) {
            dx = -dx;
        }
        if(y + dy < ballRadius) {
            dy = -dy;
        }
        else if(y + dy > canvas.height-ballRadius) {
            if(x > paddleX && x < paddleX + paddleWidth) {
                dy = -dy;
            }
            else {
                lives--;
                if(!lives) {
                    alert("GAME OVER");
                    document.location.reload();
                }
                else {
                    x = canvas.width/2;
                    y = canvas.height-30;
                    dx = 3;
                    dy = -3;
                    paddleX = (canvas.width-paddleWidth)/2;
                }
            }
        }

        if(rightPressed && paddleX < canvas.width-paddleWidth) {
            paddleX += 7;
        }
        else if(leftPressed && paddleX > 0) {
            paddleX -= 7;
        }

        x += dx;
        y += dy;
        if (!stopped) {
            requestAnimationFrame(draw);
        }
    }

    countFn = function () {
        timeLeft--;
        if(timeLeft === 0) {
            clearInterval(countdownTimer);
            stopped = true;
            document.removeEventListener("keydown", keyDownHandler);
            document.removeEventListener("keyup", keyUpHandler);
            document.removeEventListener("mousemove", mouseMoveHandler);
            callback();
        } else {
            $("#countdown").html(timeLeft);
        }
    };

    this.run = function(time) {
        $("body").html(page);
        canvas = document.getElementById("canvas");
        ctx = canvas.getContext("2d");
        if (first) {
            initBricks();
            first = false;
        }
        document.addEventListener("keydown", keyDownHandler, false);
        document.addEventListener("keyup", keyUpHandler, false);
        document.addEventListener("mousemove", mouseMoveHandler, false);
        timeLeft = time;
        countdownTimer = setInterval(countFn, 1000);
        stopped=false;
        draw();
    };
}

function NegativeTask(params, callback) {
    "use strict";
    var page = psiTurk.pages["sliders.html"],
        timeLeft,
        countdownTimer,
        countFn,
        sliderFn,
        sliders,
        i;

    countFn = function () {
        timeLeft--;
        if(timeLeft === 0) {
            clearInterval(countdownTimer);
            if (i === sliders) {
                callback();
            } else {
                sliderFn();
            }
        } else {
            $("#countdown").html(timeLeft);
        }
    };

    sliderFn = function () {
        var sliderholder,
            slider,
            button,
            initialval;
        i++;
        $("body").html(page);
        timeLeft = 10;
        $("#countdown").html(timeLeft);
        countdownTimer = setInterval(countFn, 1000);
        sliderholder = $("<div></div>");
        sliderholder.addClass("sliderholder");
        sliderholder.attr("id", "holder");

        slider = $("<input type=\"range\" />");
        initialval = Math.floor(Math.random() * 100);
        if (initialval === 50) {
            initialval = 51;
        }
        slider.attr({min: 0, max: 99, value: initialval});
        slider.on("input", function() {
            $("#holder  p").html(this.value);
        });
        sliderholder.append(slider);
        sliderholder.append("<p>" + initialval + "</p>");
        button = $("<button>submit</button>");
        button.on("click", function () {
            var sliderref = $("#holder input");
            if (sliderref.prop("valueAsNumber") === 50) {
                sliderref.prop("disabled", true);
                this.disabled = true;
                $("#holder").css("background", "palegreen");
            }
        });
        sliderholder.append(button);

        $("#sliderdiv").append(sliderholder);
    };

    this.run = function (time) {
        sliders = time / 10;
        i = 0;
        sliderFn();
    };
}

function RewardController(params, callback) {
    "use strict";
    var positiveTask,
        negativeTask,
        nPositive,
        next,
        i;

    next = function() {
        if (i === 0) {
            i++;
            if (nPositive > 0) {
                positiveTask.run(nPositive * 10);
            } else {
                next();
            }
        } else if (i === 1) {
            i++;
            if (params.maxreward - nPositive > 0) {
                negativeTask.run((params.maxreward - nPositive) * 10);
            } else {
                next();
            }
        } else {
            callback();
        }
    };

    positiveTask = new PositiveTask({}, next);
    negativeTask = new NegativeTask({}, next);


    this.run = function(reward) {
        i = 0;
        nPositive = reward;
        next();
        // $("body").html(page);
        // $("#temp").html(reward);
        // $("#temp").click(function () {callback(); });
    };

}

function gameController(params, callback) {
    "use strict";
    var trial = 0,
        ntrials = 10,
        next,
        setReward,
        exploreExploitObject,
        rewardObject;

    next = function() {
        if (trial === ntrials) {
                callback();
        } else {
            exploreExploitObject.run(ntrials - trial);
            // setReward(0);
            trial += 1;
        }
    };

    setReward = function(reward) {
        rewardObject.run(reward);
    };

    exploreExploitObject = new ExploreExploitTask({cards: 16}, setReward);
    rewardObject = new RewardController({maxreward: 6}, next);
    next();
}


function questionnaire() {
    "use strict";
    var errorMessage = "<h1>Oops!</h1><p>Something went wrong submitting your HIT. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>",
        replaceBody, promptResubmit, resubmit, recordResponses;

    replaceBody = function(x) { $("body").html(x); };
    recordResponses = function () {
        psiTurk.recordTrialData({"phase": "postquestionnaire", "status": "submit"});

        $("textarea").each(function () {
            psiTurk.recordUnstructuredData(this.id, this.value);
        });
        $("select").each(function () {
            psiTurk.recordUnstructuredData(this.id, this.value);
        });
    };

    promptResubmit = function () {
        replaceBody(errorMessage);
        $("#resubmit").click(resubmit);
    };

    resubmit = function () {
        var reprompt;
        replaceBody("<h1>Trying to resubmit...</h1>");
        reprompt = setTimeout(promptResubmit, 10000);

        psiTurk.saveData({
            success: function() {
                clearInterval(reprompt);
                psiTurk.computeBonus("compute_bonus", function () {
                    psiTurk.completeHIT();
                });
                // psiTurk.completeHIT();
            },
            error: promptResubmit
        });
    };

    // Load the questionnaire snippet
    psiTurk.showPage("postquestionnaire.html");
    psiTurk.recordTrialData({"phase": "postquestionnaire", "status": "begin"});

    $("#continue").click(function () {
        recordResponses();
        psiTurk.saveData({
            success: function () {
                psiTurk.computeBonus("compute_bonus", function () {
                    psiTurk.completeHIT(); // when finished saving compute bonus, the quit
                });
            },
            error: promptResubmit});
    });
}

function experimentDriver() {
    "use strict";
    var runNext,
        functionList = [],
        paramsList = [];

    runNext = function () {
        var nextFun = functionList.shift();
        if (functionList.length === 0) {
            nextFun();
        } else {
            nextFun(paramsList.shift(), runNext);
        }
    };

    // $.ajax({
    //     dataType: "json",
    //     url: "/get_stims",
    //     data: {condition: EXP.condition,
    //            counterbalance: EXP.counterbalance,
    //            dims: EXP.dims,
    //            options: EXP.options,
    //            nblocks: EXP.nblocks,
    //            trialsperblock: EXP.trialsperblock
    //           },
    //     success: function (data) {
    //         EXP.stimuli = data.results;
    //         console.log(EXP.stimuli);
    //         paramsList = EXP.stimuli;
    //         functionList = _.map(_.range(EXP.stimuli.length), function () {return decisionProblem; });
    //         functionList.push(questionnaire);

    //         runNext();
    //     }
    // });

    functionList = [gameController, questionnaire];
    paramsList = [{}];
    runNext();
}



/*******************
 * Run Task
 ******************/
$(window).load(function () {
    "use strict";
    if (EXP.skipinstr) {
        experimentDriver();
    } else {
        psiTurk.doInstructions(
            EXP.instructionPages,
            function () {quiz(EXP.instructionPages, experimentDriver); }
        );
    }
});
