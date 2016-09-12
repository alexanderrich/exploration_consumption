/*
 * Requires:
 * phaser.js
 */

/*jslint browser: true*/
/*global $, Phaser, window, setTimeout, setInterval, clearInterval, console*/

function Game2(popupCreator) {
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
        scoreText,
        introText;

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
        introText = game.add.text(game.world.centerX, 400, "- click to start -", { font: "40px Arial", fill: "#ffffff", align: "center" });
        introText.anchor.setTo(0.5, 0.5);

        game.input.onDown.add(releaseBall, this);

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
            introText.visible = false;
        }

    };

    ballLost = function () {
        game.paused = true;
        dead = true;
        popupCreator.run(function () {
            game.paused = false;
            ballOnPaddle = true;
            ball.reset(paddle.body.x + 16, paddle.y - 16);
            dead = false;
        });
    };

    ballHitBrick = function (_ball, _brick) {

        _brick.kill();

        score += 10;

        scoreText.text = "score: " + score;

        //  Are they any bricks left?
        if (bricks.countLiving() == 0)
        {
            //  New level starts
            score += 1000;
            scoreText.text = "score: " + score;
            introText.text = "- Next Level -";

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
            diff = _ball.x -_paddle.x;
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
        game = new Phaser.Game(800, 600, Phaser.AUTO, "game", {preload: preload, create: create, update: update});
    };

    this.run = function (time, callback) {
        game.paused = false;
        if (dead) {
            ballOnPaddle = true;
            ball.reset(paddle.body.x + 16, paddle.y - 16);
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


function Game(params) {
    "use strict";
    var game,
        state,
        graphicBase,
        respawnLength = 2000;

    state = {
        preload: function () {
        },
        create: function () {
            var i,
                border;
            game.stage.backgroundColor = "#00c5cf";
            game.stage.disableVisibilityChange = true;
            game.physics.startSystem(Phaser.Physics.ARCADE);

            this.obstacles = game.add.group();
            this.bullets = game.add.group();
            this.tokens = game.add.group();
            this.targets = game.add.group();
            this.borders = game.add.group();

            graphicBase = game.add.graphics(0, 0);
            graphicBase.beginFill(0xff0000);
            graphicBase.drawRect(0, 0, 80, 20);
            graphicBase.endFill();
            this.obstacleTexture = graphicBase.generateTexture();
            graphicBase.destroy();


            this.obstacleTimer = game.time.create(false);
            this.obstacleEvents = this.obstacleTimer.loop(500,
                                                          this.createObstacleWave,
                                                          this);
            this.bulletTimer = 0;
            this.bulletSpacing = 500;
            this.obstacleTimer.start();
            this.alternator = 0;
            this.obstacleInfo = {obstacleType: 1,
                                 waveNumber: 1};
            this.player = game.add.graphics(300, game.height - 120);
            this.player.beginFill(0x0000ff);
            this.player.drawRect(0, 0, 20, 20);
            this.player.endFill();
            game.physics.arcade.enable(this.player);
            this.player.body.collideWorldBounds = true;
            for (i = 0; i < 2; i++) {
                border = game.add.graphics(500 * i, 0);
                border.beginFill(0x008800);
                border.drawRect(0, 0, 100, game.height);
                border.endFill();
                game.physics.arcade.enable(border);
                border.body.immovable = true;
                this.borders.add(border);
            }
            this.cursors = game.input.keyboard.createCursorKeys();
            this.spacebar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
            this.enter = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
            this.enter.onDown.add(function () {
                if (this.pressEnter && this.pressEnter.exists) {
                    this.pressEnter.destroy();
                }
            }, this);

            this.score = 0;
            this.labelScore = game.add.text(110, 470, "score: 0",
                                            {font: "20px Arial",
                                             fill: "#000000"});
            this.time = 0;
            this.labelTime = game.add.text(230, 470, "time: 0",
                                           {font: "20px Arial",
                                            fill: "#000000"});
            game.paused = true;

        },
        update: function () {
            if (this.cursors.left.isDown) {
                this.player.body.velocity.x = -250;
            } else if (this.cursors.right.isDown) {
                this.player.body.velocity.x = 250;
            } else {
                this.player.body.velocity.x = 0;
            }
            if (this.cursors.up.isDown) {
                this.player.body.velocity.y = -250;
            } else if (this.cursors.down.isDown) {
                this.player.body.velocity.y = 250;
            } else {
                this.player.body.velocity.y = 0;
            }
            if (this.spacebar.isDown) {
                this.fireBullet();
            }
            game.physics.arcade.collide(this.player, this.borders);
            game.physics.arcade.overlap(this.player,
                                        this.obstacles,
                                        this.collide,
                                        null,
                                        this);
            game.physics.arcade.overlap(this.bullets,
                                        this.obstacles,
                                        function (bullet, obstacle) {
                                            bullet.kill();
                                        },
                                        null,
                                        this);
            game.physics.arcade.overlap(this.bullets,
                                        this.targets,
                                        this.bulletHit,
                                        null,
                                        this);
            game.physics.arcade.overlap(this.player,
                                        this.tokens,
                                        this.tokenHit,
                                        null,
                                        this);
        },
        clearGame: function () {
            this.player.body.velocity.x = 0;
            this.player.body.velocity.y = 0;
            this.obstacles.callAll("kill");
            this.tokens.callAll("kill");
            this.bullets.callAll("kill");
            this.targets.callAll("kill");
        },
        restart: function () {
            this.dead = false;
            this.obstacleInfo.obstacleType = 1;
            this.obstacleInfo.waveNumber = 1;
        },
        createObstacleWave: function () {
            var hole, i;
            this.alternator = (this.alternator + 1) % 2;
            if (this.alternator === 0) {
                this.score++;
                this.labelScore.text = "score: " + this.score;
            }
            switch (this.obstacleInfo.obstacleType) {
            case 1:
                if(Math.random() > .9) {
                    this.obstacleInfo.obstacleType = Math.floor(Math.random() * 3) + 2;
                }
                this.createObstacle(40 * Math.floor(Math.random() * 9));
                break;
            case 2:
                this.createObstacle(0);
                this.createObstacle(160);
                this.createObstacle(320);
                if (this.obstacleInfo.waveNumber === 3) {
                    this.obstacleInfo.obstacleType = 1;
                    this.obstacleInfo.waveNumber = 1;
                } else {
                    this.obstacleInfo.waveNumber++;
                }
                break;
            case 3:
                if (this.obstacleInfo.waveNumber % 2 === 1) {
                    this.createObstacle(0);
                    this.createObstacle(160);
                    this.createObstacle(320);
                } else {
                    this.createObstacle(80);
                    this.createObstacle(240);
                }
                if (this.obstacleInfo.waveNumber === 3) {
                    this.obstacleInfo.obstacleType = 1;
                    this.obstacleInfo.waveNumber = 1;
                } else {
                    this.obstacleInfo.waveNumber++;
                }
                break;
            case 4:
                this.obstacleInfo.obstacleType = 1;
                hole = Math.floor(Math.random() * 5);
                for (i = 0; i < 5; i++) {
                    if (i !== hole) {
                        this.createObstacle(80 * i);
                    }
                }
            }
            if (Math.random() > .6) {
                if (Math.random() > .5) {
                    game.time.events.add(250,
                                         this.createToken, this);
                } else {
                    game.time.events.add(250,
                                         this.createTarget, this);
                }
            }
        },
        createObstacle: function (x) {
            var obstacle;
            obstacle = game.add.sprite(100 + x, -20, this.obstacleTexture);
            this.obstacles.add(obstacle);
            game.physics.arcade.enable(obstacle);
            obstacle.body.velocity.y = 200;
            obstacle.checkWorldBounds = true;
            obstacle.outOfBoundsKill = true;
        },
        createToken: function () {
            var token;
            token = game.add.graphics(100 + 10 * Math.floor(Math.random() * 36), -20);
            token.beginFill(0xdddd00);
            token.drawRect(0, 0, 20, 20);
            token.endFill();
            this.tokens.add(token);
            game.physics.arcade.enable(token);
            token.body.velocity.y = 200;
            token.checkWorldBounds = true;
            token.events.onOutOfBounds.add(function() {
                token.kill();
            }, this);
        },
        createTarget: function () {
            var target,
                startSide;
            startSide = Math.floor(Math.random() * 2);
            target = game.add.graphics(100 + 320 * startSide, -20);
            target.beginFill(0xcc00cc);
            target.drawRect(0, 0, 80, 20);
            target.endFill();
            this.targets.add(target);
            game.physics.arcade.enable(target);
            target.body.velocity.y = 200;
            game.add.tween(target).to({x: 420 - 320 * startSide}, 2000, Phaser.Easing.Linear.None,
                                      true, 0, -1, true);
            target.checkWorldBounds = true;
            target.outOfBoundsKill = true;
        },
        fireBullet: function () {
            var bullet;
            if (game.time.now > this.bulletTimer) {
                bullet = game.add.graphics(
                    this.player.body.position.x +
                        this.player.body.width / 2 - 3,
                    this.player.body.position.y - 6);
                bullet.beginFill(0x000000);
                bullet.drawRect(0, 0, 6, 6);
                bullet.endFill();
                this.bullets.add(bullet);
                game.physics.arcade.enable(bullet);
                bullet.body.velocity.y = -320;
                bullet.checkWorldBounds = true;
                this.bulletTimer = game.time.now + this.bulletSpacing;
            }
        },
        collide: function () {
            game.paused = true;
            this.dead = true;
            this.popupEnder = popUp(5, function () {
                state.clearGame();
                state.restart();
                game.paused = false;
            });
        },
        bulletHit: function (bullet, target) {
            target.kill();
            bullet.kill();
            this.score += 5;
            this.labelScore.text = "score: " + this.score;
        },
        tokenHit: function (player, token) {
            token.kill();
            this.score += 5;
            this.labelScore.text = "score: " + this.score;
        },
        stopGame: function (callback) {
            if (this.dead) {
                this.popupEnder();
            }
            this.clearGame();
            game.paused = true;
            callback();
        },
        resumeGame: function (length, callback) {
            console.log(length);
            length = length || 60;
            game.paused = false;
            this.restart();
            setTimeout(function () {
                state.stopGame.call(state, callback);
            }, length * 1000);
            // game.time.events.add(length * 1000, this.stopGame, this, callback);
        }

    };

    this.run = function (params, callback) {
        if (params.length > 0) {
            state.resumeGame.call(state, params.length, callback);
        } else {
            callback();
        }
    };

    this.setup = function () {
        game = new Phaser.Game(600, 500, Phaser.AUTO, "game", state);
    };

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
        setTimeout(function () {callback(reward); }, 1000);
    };

    this.run = function() {
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

}

function experimentDriver() {
    "use strict";
    var game,
        explore,
        popupCreator,
        nextChoice,
        setReward,
        nextReward,
        nextPunishment,
        rewardAmount,
        maxReward = 12,
        baselength = 3;

    nextChoice = function () {
        $("#carddiv").show();
        explore.run();
    };

    setReward = function (reward) {
        $("#carddiv").hide();
        rewardAmount = reward;
        nextReward(rewardAmount);
    };

    nextReward = function (length) {
        game.run(baselength * length, function () {
            nextPunishment(maxReward - length);
        });
    };

    nextPunishment = function (penalty) {
        popupCreator.runMultiple(penalty, function () {
            nextChoice();
        });
    };

    $("#popup").hide();
    // $("#carddiv").hide();
    // game = new Game({postGameFn: nextChoice});

    popupCreator = new PopupCreator(baselength, 1);

    game = new Game2(popupCreator);
    game.setup();

    explore = new ExploreExploitTask({cards: 15}, setReward);


    nextChoice();

}

$(window).load(function () {
    "use strict";
    experimentDriver();
});
