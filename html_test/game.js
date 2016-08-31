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
        respawnLength = 5000,
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
            this.player = game.add.graphics(300, game.height - 20);
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
            this.labelScore = game.add.text(120, 20, "score: 0",
                                            {font: "20px Arial",
                                             fill: "#000000"});
            this.labelPower = game.add.text(330, 20, "powerup time: 0",
                                            {font: "20px Arial",
                                             fill: "#000000"});
            this.labelPower.visible = false;
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
                if (this.spacebar.isDown && this.powerup) {
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
                                            this.bulletHit,
                                            null,
                                            this);
            }
        },
        clearGame: function () {
            this.player.body.velocity.x = 0;
            this.player.body.velocity.y = 0;
            this.player.x = 300;
            this.player.y = game.height - 20;
            this.obstacles.callAll('kill');
            this.bullets.callAll('kill');
        },
        restart: function () {
            this.waiting = false;
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
        },
        createObstacle: function (x) {
            var obstacle;
            obstacle = game.add.graphics(100 + x, 0);
            obstacle.beginFill(0xff0000);
            obstacle.drawRect(0, 0, 80, 20);
            obstacle.endFill();
            this.obstacles.add(obstacle);
            game.physics.arcade.enable(obstacle);
            obstacle.body.velocity.y = 200;
            obstacle.checkWorldBounds = true;
            obstacle.outOfBoundsKill = true;
        },
            }, this);
        },
        startPowerUp: function (length) {
            this.powerup = true;
            this.powerupLeft = length/1000;
            this.labelPower.text = "powerup time: " +
                this.powerupLeft.toString();
            this.labelPower.visible = true;
            this.labelPower.fill = "#000000";
            this.bulletTimer = 0;
            this.bulletSpacing = 300;
            this.powerupLoop = game.time.events.loop(1000, function () {
                if (this.powerupLeft > 0) {
                    this.powerupLeft--;
                } if (this.powerupLeft < 4) {
                    this.labelPower.fill = "#FF0000";
                }
                this.labelPower.text = "powerup time: " +
                    this.powerupLeft.toString();
            }, this);
            game.time.events.add(length, function () {
                this.powerup = false;
                this.labelPower.visible = false;
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
            this.waiting = true;
            this.dead = true;
            this.player.body.velocity.x = 0;
            this.player.body.velocity.y = 0;
            this.obstacles.forEach(function (obstacle) {
                obstacle.body.velocity.y = 0;
            }, this);
            this.bullets.forEach(function (bullet) {
                bullet.body.velocity.y = 0;
            }, this);
            this.obstacleTimer.pause();
            this.respawn(function () {
                this.clearGame();
                this.restart();
            }
                        );
        },
        bulletHit: function (bullet, obstacle) {
            obstacle.kill();
            bullet.kill();
            this.score += 2;
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
                callback.call(this);
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
        state.resumeGame.call(state, 40, params.bonus);

        // setTimeout(60000, callback);
    };

    this.setup = function () {
        game = new Phaser.Game(600, 500, Phaser.AUTO, "game", state);
    };

}

function experimentDriver() {
    "use strict";
    var game,
        next,
        hideGame;

    hideGame = function () {
        $("#game").hide();
        setTimeout(next, 2000);
    };

    next = function () {
        var bonus;
        $("#game").show();
        if (Math.random() > .8) {
            bonus = -1;
        } else {
            bonus = Math.ceil(Math.random() * 40);
        }
        game.run({bonus: bonus});
    };

    game = new Game({postGameFn: hideGame});

    $("#game").hide();
    game.setup();

    setTimeout(next, 1000);
}

$(window).load(function () {
    "use strict";
    experimentDriver();
});
