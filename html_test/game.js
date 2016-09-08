/*
 * Requires:
 * phaser.js
 */

/*jslint browser: true*/
/*global $, Phaser, window, setTimeout, console*/


function Game(params) {
    "use strict";
    var game,
        state,
        respawnLength = 2000,
        postGameFn = params.postGameFn;

    state = {
        preload: function () {
        },
        create: function () {
            var i,
                border;
            game.stage.backgroundColor = "#00c5cf";
            // game.stage.disableVisibilityChange = true;
            game.physics.startSystem(Phaser.Physics.ARCADE);

            this.obstacles = game.add.group();
            this.bullets = game.add.group();
            this.tokens = game.add.group();
            this.targets = game.add.group();
            this.borders = game.add.group();

            this.powerup = false;
            this.waiting = false;
            this.obstacleTimer = game.time.create(false);
            this.obstacleEvents = this.obstacleTimer.loop(500,
                                                          this.createObstacleWave,
                                                          this);
            this.obstacleTimer.start();
            this.obstacleTimer.pause();
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
            this.labelPower = game.add.text(330, 470, "powerup: 0",
                                            {font: "20px Arial",
                                             fill: "#000000"});
            game.paused = true;

        },
        update: function () {
            if (!this.waiting) {
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
            }
        },
        clearGame: function () {
            this.player.body.velocity.x = 0;
            this.player.body.velocity.y = 0;
            // this.player.x = 300;
            // this.player.y = game.height - 120;
            this.obstacles.callAll("kill");
            this.tokens.callAll("kill");
            this.bullets.callAll("kill");
            this.targets.callAll("kill");
        },
        restart: function () {
            this.waiting = false;
            this.dead = false;
            if (this.obstacleInfo.obstacleType > 1) {
                this.obstacleInfo.obstacleType = 1;
            }
            this.obstacleInfo.waveNumber = 1;
            this.obstacleTimer.resume();
        },
        createObstacleWave: function () {
            var hole, i;
            this.alternator = (this.alternator + 1) % 2;
            if (this.alternator === 0) {
                this.score++;
                this.labelScore.text = "score: " + this.score;
            }
            switch (this.obstacleInfo.obstacleType) {
            case 0:
                for (i = 0; i < 5; i++) {
                    this.createObstacle(80 * i);
                }
                break;
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
            if (Math.random() > .6 && this.powerup) {
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
            obstacle = game.add.graphics(100 + x, -20);
            obstacle.beginFill(0xff0000);
            obstacle.drawRect(0, 0, 80, 20);
            obstacle.endFill();
            this.obstacles.add(obstacle);
            game.physics.arcade.enable(obstacle);
            obstacle.body.velocity.y = 200;
            obstacle.checkWorldBounds = true;
            obstacle.outOfBoundsKill = true;
        },
        createToken: function () {
            if (this.dead) {
                return;
            }
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
            if (this.dead) {
                return;
            }
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
        startPowerUp: function (length) {
            this.powerup = true;
            this.powerupLeft = length / 1000;
            this.labelPower.text = "powerup time: " +
                this.powerupLeft.toString();
            this.labelPower.fill = "#000000";
            this.bulletTimer = 0;
            this.bulletSpacing = 500;
            this.powerupLoop = game.time.events.loop(1000, function () {
                if (this.powerupLeft > 0) {
                    this.powerupLeft--;
                } if (this.powerupLeft < 4) {
                    this.labelPower.fill = "#FF0000";
                }
                this.labelPower.text = "powerup: " +
                    this.powerupLeft.toString();
            }, this);
            game.time.events.add(length, function () {
                this.powerup = false;
                game.time.events.remove(this.powerupLoop);
            },
                                 this);
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
            if (!this.dead) {
                this.waiting = true;
                this.dead = true;
                this.player.body.velocity.x = 0;
                this.player.body.velocity.y = 0;
                game.tweens.removeAll();
                this.obstacles.forEach(function (obstacle) {
                    obstacle.body.velocity.y = 0;
                }, this);
                this.tokens.forEach(function (token) {
                    token.body.velocity.y = 0;
                }, this);
                this.bullets.forEach(function (bullet) {
                    bullet.body.velocity.y = 0;
                    bullet.body.velocity.x = 0;
                }, this);
                this.targets.forEach(function (target) {
                    target.body.velocity.x = 0;
                    target.body.velocity.y = 0;
                }, this);
                this.obstacleTimer.pause();
                this.respawn();
            }
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
        respawn: function (callback) {
            this.pressEnter = game.add.text(30, 130,
                                            "press ENTER before countdown finishes",
                                            {font: "30px Arial",
                                             fill: "#000000"});
            this.respawnLeft = respawnLength/1000;
            this.respawnLabel = game.add.text(260, 200,
                                           this.respawnLeft.toString(),
                                           {font: "60px Arial",
                                            fill: "#000000"});
            this.respawnLoop = game.time.events.loop(1000, function () {
                if (this.respawnLeft > 0) {
                    this.respawnLeft--;
                }
                this.respawnLabel.text = this.respawnLeft.toString();
            }, this);
            this.respawnEvent = game.time.events.add(respawnLength, function () {
                this.pressEnter.destroy();
                this.respawnLabel.destroy();
                game.time.events.remove(this.respawnLoop);
                this.dead = false;
                this.clearGame();
                this.restart();
            }, this);
        },
        stopGame: function (callback) {
            this.obstacleTimer.pause();
            if (this.dead) {
                game.time.events.remove(this.respawnEvent);
                this.pressEnter.destroy();
                this.respawnLabel.destroy();
                game.time.events.remove(this.respawnLoop);
            }
            this.clearGame();
            game.paused = true;
            callback();
        },
        resumeGame: function (length, bonus) {
            length = length || 60;
            bonus = bonus || 0;
            this.obstacleInfo.obstacleType = 1;
            game.paused = false;
            if (bonus < 0) {
                this.restart();
                this.obstacleInfo.obstacleType = 0;
                game.time.events.add(30000, function () {
                    this.obstacleInfo.obstacleType = 1;
                }, this);
            } else {
                this.restart();
                if (bonus > 0) {
                    this.startPowerUp(bonus * 1000);
                }
            }
            game.time.events.add(length * 1000, this.stopGame, this, postGameFn);
        }

    };

    this.run = function (params) {
        state.resumeGame.call(state, 20, params.bonus);

        // setTimeout(60000, callback);
    };

    this.setup = function () {
        game = new Phaser.Game(600, 500, Phaser.AUTO, "game", state);
    };

}

function ExploreExploitTask(params) {
    "use strict";
    var responseFn,
        firstRun = true,
        postChoiceFn = params.callback;

    responseFn = function (choiceId) {
        var card = $("#" + choiceId),
            reward;
        if (!card.hasClass("clicked")) {
            card.css("background", "white")
                .addClass("clicked");
            if (Math.random() > .25) {
                card.html((Math.ceil(Math.random() * 40)).toFixed());
            } else {
                card.html("-1").css("color", "red");
            }
        }
        reward = parseFloat(card.html());
        $(".card").off("click");
        setTimeout(function () {postChoiceFn(reward); }, 1000);
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

function experimentDriver() {
    "use strict";
    var game,
        explore,
        nextChoice,
        nextGame;

    nextChoice = function () {
        // $("#game").hide();
        $("#carddiv").show();
        explore.run();
    };

    // hideGame = function () {
    //     $("#carddiv").hide();
    //     setTimeout(next, 2000);
    // };

    nextGame = function (bonus) {
        $("#carddiv").hide();
        // $("#game").show();
        game.run({bonus: bonus});
    };

    // $("#game").hide();
    game = new Game({postGameFn: nextChoice});
    game.setup();

    explore = new ExploreExploitTask({cards: 15, callback: nextGame});

    nextChoice();

    // game.setup();

    // setTimeout(next, 1000);
}

$(window).load(function () {
    "use strict";
    experimentDriver();
});
