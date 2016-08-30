/*
 * Requires:
 * phaser.js
 */

/*jslint browser: true*/
/*global $, Phaser, window, setTimeout, console*/

var game;

function Game(params) {
    "use strict";
    var game,
        state,
        firstRun = true,
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
            this.obstacleTimer.start();
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
            this.score = 0;
            this.labelScore = game.add.text(120, 20, "score: 0",
                                            {font: "20px Arial",
                                             fill: "#000000"});
            this.labelPower = game.add.text(330, 20, "powerup time: 0",
                                            {font: "20px Arial",
                                             fill: "#000000"});
            this.labelPower.visible = false;
            this.obstacleEvents = this.obstacleTimer.loop(500,
                                                          this.createObstacleWave,
                                                          this);

            this.stopGame(function () {});
            // game.paused = true;
            // this.startPowerUp(20000);
            // this.multiRespawn(1);
            // game.time.events.add(5000, function() {
            //     this.pausemotion();
            //     this.multiRespawn(2);
            // }, this);

        },
        update: function () {
            if (!this.waiting) {
                if (this.cursors.left.isDown) {
                    this.player.body.velocity.x = -300;
                } else if (this.cursors.right.isDown) {
                    this.player.body.velocity.x = 300;
                } else {
                    this.player.body.velocity.x = 0;
                }
                if (this.cursors.up.isDown) {
                    this.player.body.velocity.y = -300;
                } else if (this.cursors.down.isDown) {
                    this.player.body.velocity.y = 300;
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
            } else {
                if (this.enter.isDown) {
                    this.pressEnter.destroy();
                }
            }
        },
        clearGame: function () {
            this.player.x = 300;
            this.obstacles.callAll('kill');
            this.bullets.callAll('kill');
        },
        restart: function () {
            this.waiting = false;
            this.obstacleEvents = this.obstacleTimer.loop(500,
                                                          this.createObstacleWave,
                                                          this);
        },
        pausemotion: function () {
            this.waiting = true;
            this.obstacleTimer.pause();
            this.player.body.velocity.x = 0;
            this.player.body.velocity.y = 0;
            this.obstacles.forEach(function (obstacle) {
                obstacle.body.velocity.y = 0;
            }, this);
            this.bullets.forEach(function (bullet) {
                bullet.body.velocity.y = 0;
            }, this);
        },
        resumemotion: function () {
            this.waiting = false;
            this.obstacles.forEach(function (obstacle) {
                obstacle.body.velocity.y = 200;
            }, this);
            this.bullets.forEach(function (bullet) {
                bullet.body.velocity.y = -320;
            }, this);
            this.obstacleTimer.resume();
        },
        createObstacleWave: function () {
            var hole, i;
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
            obstacle.events.onOutOfBounds.add(function() {
                obstacle.kill();
                this.score++;
                this.labelScore.text = "score: " + this.score;
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
            this.obstacleInfo.obstacleType = 1;
            this.obstacleInfo.waveNumber = 1;
            this.player.body.velocity.x = 0;
            this.player.body.velocity.y = 0;
            this.obstacles.forEach(function (obstacle) {
                obstacle.body.velocity.y = 0;
            }, this);
            this.bullets.forEach(function (bullet) {
                bullet.body.velocity.y = 0;
            }, this);
            this.obstacleTimer.remove(this.obstacleEvents);
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
        multiRespawn: function (number=null) {
            if (number != null) {
                this.respawnsLeft = number;
            }
            if (this.respawnsLeft === 1) {
                this.respawn(this.resumemotion);
            } else {
                this.respawnsLeft--;
                this.respawn(this.multiRespawn);
            }
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
            if (this.dead) {
                game.time.events.remove(this.respawnEvent);
                this.pressEnter.destroy();
                this.respawnLabel.destroy();
                game.time.events.remove(this.respawnLoop);
                this.clearGame();
            } else {
                this.pausemotion();
            }
            game.paused = true;
            callback();
        },
        resumeGame: function (length=60, bonus=0) {
            var prepareLength = 3;
            game.paused = false;
            this.prepare = prepareLength;
            this.preparelabel = game.add.text(260, 200,
                                              this.prepare.toString(),
                                              {font: "60px Arial",
                                               fill: "#000000"});
            this.prepareLoop = game.time.events.loop(1000, function () {
                if (this.prepare > 0) {
                    this.prepare--;
                }
                this.preparelabel.text = this.prepare.toString();
            }, this);
            game.time.events.add(prepareLength * 1000, function () {
                this.preparelabel.destroy();
                game.time.events.remove(this.prepareLoop);
                if (this.dead) {
                    this.dead = false;
                    this.restart();
                } else {
                    this.resumemotion();
                }
                if (bonus < 0) {
                    this.pausemotion();
                    this.multiRespawn(6);
                } else if (bonus > 0) {
                    this.startPowerUp(bonus * 1000);
                }
                game.time.events.add(length * 1000, this.stopGame, this, postGameFn);
            }, this);
        }

    };

    this.run = function (params) {
        var bonus;
        if (Math.random() > .8) {
            bonus = -1;
        } else {
            bonus = Math.ceil(Math.random() * 40);
        }
        state.resumeGame.call(state, 60, bonus);

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
        $("#game").show();
        game.run({});
    };

    game = new Game({postGameFn: hideGame});

    game.setup();

    setTimeout(next, 1000);
}

$(window).load(function () {
    "use strict";
    experimentDriver();
});
