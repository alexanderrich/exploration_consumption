/*
 * Requires:
 * phaser.js
 */

/*jslint browser: true*/
/*global $, Phaser, window, setTimeout, setInterval, clearInterval*/

function Game(popupCreator) {
    "use strict";
    var game,
        preload,
        create,
        update,
        ballLost,
        releaseBall,
        ballHitBrick,
        ballHitPaddle,
        brickTexture,
        ballTexture,
        ball,
        paddle,
        bricks,
        ballOnPaddle = true,
        score = 0,
        dead = false,
        scoreText;

    preload = function () {
        var graphicBase;
        graphicBase = game.add.graphics(0, 0);
        graphicBase.beginFill(0xff0000);
        graphicBase.drawRect(0, 0, 40, 20);
        graphicBase.endFill();
        brickTexture = graphicBase.generateTexture();
        graphicBase.destroy();
        graphicBase = game.add.graphics(0, 0);
        graphicBase.beginFill(0x000000);
        graphicBase.drawCircle(0, 0, 20);
        graphicBase.endFill();
        ballTexture = graphicBase.generateTexture();
        graphicBase.destroy();
    };

    create = function () {

        game.physics.startSystem(Phaser.Physics.ARCADE);

        //  We check bounds collisions against all walls other than the bottom one
        game.physics.arcade.checkCollision.down = false;

        game.stage.backgroundColor = "#00c5cf";

        bricks = game.add.group();
        bricks.enableBody = true;
        bricks.physicsBodyType = Phaser.Physics.ARCADE;

        var brick;

        for (var y = 0; y < 4; y++)
        {
            for (var x = 0; x < 15; x++)
            {
                brick = bricks.create(20 + (x * 50), 100 + (y * 52), brickTexture);
                brick.body.bounce.set(1);
                brick.body.immovable = true;
            }
        }

        paddle = game.add.sprite(game.world.centerX, 500, brickTexture);
        paddle.anchor.setTo(0.5, 0.5);

        game.physics.enable(paddle, Phaser.Physics.ARCADE);

        paddle.body.collideWorldBounds = true;
        paddle.body.bounce.set(1);
        paddle.body.immovable = true;

        ball = game.add.sprite(game.world.centerX, paddle.y - 16, ballTexture);
        ball.anchor.set(0.5);
        ball.checkWorldBounds = true;

        game.physics.enable(ball, Phaser.Physics.ARCADE);

        ball.body.collideWorldBounds = true;
        ball.body.bounce.set(1);

        ball.events.onOutOfBounds.add(ballLost, this);

        scoreText = game.add.text(32, 550, "score: 0", { font: "20px Arial", fill: "#ffffff", align: "left" });

        game.input.onDown.add(releaseBall, this);
        game.time.events.add(1000, releaseBall, this);

        game.paused = true;

    };

    update = function () {

        paddle.x = game.input.x;

        if (paddle.x < 24)
        {
            paddle.x = 24;
        }
        else if (paddle.x > game.width - 24)
        {
            paddle.x = game.width - 24;
        }

        if (ballOnPaddle)
        {
            ball.body.x = paddle.x;
        }
        else
        {
            game.physics.arcade.collide(ball, paddle, ballHitPaddle, null, this);
            game.physics.arcade.collide(ball, bricks, ballHitBrick, null, this);
        }

    };

    releaseBall = function () {

        if (ballOnPaddle)
        {
            ballOnPaddle = false;
            ball.body.velocity.y = -300;
            ball.body.velocity.x = -75;
        }

    };

    ballLost = function () {
        game.paused = true;
        dead = true;
        popupCreator.run(function () {
            game.paused = false;
            ballOnPaddle = true;
            ball.reset(paddle.body.x + 16, paddle.y - 16);
            game.time.events.add(1000, releaseBall, this);
            dead = false;
        });
    };

    ballHitBrick = function (_ball, _brick) {

        _brick.kill();

        score += 10;

        scoreText.text = "score: " + score;

        //  Are they any bricks left?
        if (bricks.countLiving() === 0)
        {
            //  New level starts
            score += 1000;
            scoreText.text = "score: " + score;

            //  Let's move the ball back to the paddle
            ballOnPaddle = true;
            ball.body.velocity.set(0);
            ball.x = paddle.x + 16;
            ball.y = paddle.y - 16;

            //  And bring the bricks back from the dead :)
            bricks.callAll("revive");
        }

    };

    ballHitPaddle = function (_ball, _paddle) {

        var diff = 0;

        if (_ball.x < _paddle.x)
        {
            //  Ball is on the left-hand side of the paddle
            diff = _paddle.x - _ball.x;
            _ball.body.velocity.x = (-10 * diff);
        }
        else if (_ball.x > _paddle.x)
        {
            //  Ball is on the right-hand side of the paddle
            diff = _ball.x - _paddle.x;
            _ball.body.velocity.x = (10 * diff);
        }
        else
        {
            //  Ball is perfectly in the middle
            //  Add a little random X to stop it bouncing straight up!
            _ball.body.velocity.x = 2 + Math.random() * 8;
        }

    };

    this.setup = function () {
        game = new Phaser.Game(800, 600, Phaser.AUTO, "rewards", {preload: preload, create: create, update: update});
    };

    this.run = function (time, callback) {
        game.paused = false;
        if (dead) {
            ballOnPaddle = true;
            ball.reset(paddle.body.x + 16, paddle.y - 16);
            game.time.events.add(1000, releaseBall, this);
            dead = false;
        }
        setTimeout(function () {
            if (popupCreator.isUp()) {
                popupCreator.clear();
            }
            game.paused = true;
            callback();
        }, time * 1000);
    };
}

function PopupCreator (length, clicksneeded) {
    "use strict";
    var i,
        self = this,
        up = false,
        number,
        next,
        popup,
        clicks,
        clickFn,
        timer,
        timeleft,
        countdown,
        nextFn;

    popup = function () {
        up = true;
        timeleft = length;
        clicks = 0;
        $("#popup").show();
        $("#popup").css("background", "red");
        $("#popupinstruct").html("click box " + clicksneeded + " times");
        $("#popupcountdown").html(timeleft.toString());
        $("#popup").click(clickFn);
        timer = setInterval(countdown, 1000);
    };

    clickFn = function() {
        clicks++;
        $("#popupinstruct").html("click box " + (clicksneeded - clicks) + " times");
        if (clicks === clicksneeded) {
            $("#popupinstruct").html("&nbsp;");
            $("#popup").css("background", "green");
            $("#popup").off("click");
        }
    };

    countdown = function() {
        timeleft--;
        $("#popupcountdown").html(timeleft.toString());
        if (timeleft === 0) {
            self.clear();
            next();
        }
    };

    next = function () {
        if (i === number) {
            nextFn();
        } else {
            popup();
            i++;
        }
    };

    this.clear = function () {
        clearInterval(timer);
        $("#popup").hide();
        $("#popup").css("background", "black");
        up = false;
    };

    this.isUp = function () {
        return up;
    };


    this.run = function (callback) {
        i = 0;
        number = 1;
        nextFn = callback;
        next();
    };

    this.runMultiple = function (num, callback) {
        i = 0;
        number = num;
        nextFn = callback;
        next();
    };

    $("#rewards").append("<div id=\"popup\"> <div id=\"popupinstruct\"></div> <div id=\"popupcountdown\"></div> </div> ");
    $("#popup").hide();
}

function ExploreExploitTask(params, callback) {
    "use strict";
    var responseFn,
        firstRun = true;

    responseFn = function (choiceId) {
        var card = $("#" + choiceId),
            reward;
        if (!card.hasClass("clicked")) {
            card.css("background", "white")
                .addClass("clicked");
            if (Math.random() > .25) {
                card.html((3 + Math.ceil(Math.random() * 9)).toFixed());
            } else {
                card.html("0").css("color", "red");
            }
        }
        reward = parseFloat(card.html());
        $(".card").off("click");
        setTimeout(function () {
            $("#carddiv").hide();
            callback(reward);
        },
                   1000);
    };

    this.run = function() {
        $("#carddiv").show();
        var i;
        if (firstRun || Math.random() > .8) {
            firstRun = false;
            $("#carddiv").html("");
            for (i = 0; i < params.cards; i++) {
                $("#carddiv").append("<div class=\"card\" id=\"card" + i + "\"></div>");
            }
            $(".card").css("background", "gray");
        }
        $(".card").click(function () {responseFn(this.id); });
    };
}


function ConsumptionRewards(baselength, maxReward, callback) {
    "use strict";
    var game,
        popupCreator,
        nextReward,
        nextPunishment;

    popupCreator = new PopupCreator(baselength, 1);

    game = new Game(popupCreator);
    game.setup();

    nextReward = function (length) {
        game.run(baselength * length, function () {
            nextPunishment(maxReward - length);
        });
    };

    nextPunishment = function (penalty) {
        popupCreator.runMultiple(penalty, function () {
            $("#rewards").hide();
            callback();
        });
    };

    this.setReward = function(reward) {
        $("#rewards").show();
        nextReward(reward);
    };


}

function StandardRewards (callback) {
    "use strict";
    $("#rewards").css({"font-size": "48pt",
                       "text-align": "center"});

    this.setReward = function (reward) {
        $("#rewards").html(reward.toString());
        $("#rewards").show();
        setTimeout(function () {
            $("#rewards").html("");
            $("#rewards").hide();
            callback();
        }, 3000);
    };
}

function experimentDriver() {
    "use strict";
    var explore,
        nextChoice,
        // consumptionRewards,
        standardRewards,
        maxReward = 12,
        baselength = 3;

    nextChoice = function () {
        explore.run();
    };

    $("#rewards").hide();

    // consumptionRewards = new ConsumptionRewards(baselength, maxReward, nextChoice);
    standardRewards = new StandardRewards(nextChoice);

    // explore = new ExploreExploitTask({cards: 15}, consumptionRewards.setReward);
    explore = new ExploreExploitTask({cards: 15}, standardRewards.setReward);


    nextChoice();

}

$(window).load(function () {
    "use strict";
    experimentDriver();
});
