/*
 * Requires:
 * phaser.js
 * jquery.js
 * underscore.js
 * d3.js
 */

/*jslint browser: true*/
/*global counterbalance, uniqueId, adServerLoc, mode, document, PsiTurk, $, _, d3, Phaser, window, setTimeout, clearTimeout, setInterval, clearInterval*/

function Game(popupCreator) {
    "use strict";
    var game,
        preload,
        create,
        update,
        ballLost,
        releaseBall,
        startLevel,
        ballHitBrick,
        ballHitPaddle,
        bonusHitPaddle,
        brickTexture,
        bonusTexture,
        paddleTexture,
        ballTexture,
        ball,
        paddle,
        bricks,
        bonuses,
        stopBonuses = false,
        ballOnPaddle = true,
        level = 0,
        points = 0,
        speed = 4,
        cursors,
        multiplierTimeout,
        multiplierText,
        lastRunPoints = 0,
        lastRunBricks = 0,
        lastRunDeaths = 0;

    preload = function () {
        var graphicBase;
        graphicBase = game.add.graphics(0, 0);
        graphicBase.beginFill(0xff0000);
        graphicBase.lineStyle(1, 0x000000, 1);
        graphicBase.drawRect(0, 0, 50, 20);
        graphicBase.endFill();
        brickTexture = graphicBase.generateTexture();
        graphicBase.destroy();
        graphicBase = game.add.graphics(0, 0);
        graphicBase.beginFill(0x00bb00);
        graphicBase.lineStyle(1, 0x000000, 1);
        graphicBase.drawRect(0, 0, 49, 19);
        graphicBase.endFill();
        bonusTexture = graphicBase.generateTexture();
        graphicBase.destroy();
        graphicBase = game.add.graphics(0, 0);
        graphicBase.beginFill(0x444444);
        graphicBase.drawRect(0, 0, 60, 10);
        graphicBase.endFill();
        paddleTexture = graphicBase.generateTexture();
        graphicBase.destroy();
        graphicBase = game.add.graphics(0, 0);
        graphicBase.beginFill(0x000000);
        graphicBase.drawCircle(0, 0, 20);
        graphicBase.endFill();
        ballTexture = graphicBase.generateTexture();
        graphicBase.destroy();
    };

    create = function () {
        game.stage.disableVisibilityChange = true;
        game.physics.startSystem(Phaser.Physics.ARCADE);
        //  We check bounds collisions against all walls other than the bottom one
        game.physics.arcade.checkCollision.down = false;
        game.stage.backgroundColor = "#00c5cf";
        bricks = game.add.group();
        bricks.enableBody = true;
        bricks.physicsBodyType = Phaser.Physics.ARCADE;
        var brick;
        for (var y = 0; y < 10; y++) {
            for (var x = 0; x < 14; x++) {
                brick = bricks.create(x * 50, 60 + (y * 20), brickTexture);
                brick.body.bounce.set(1);
                brick.body.immovable = true;
            }
        }
        bricks.callAll("kill");
        bonuses = game.add.group();
        bonuses.enableBody = true;
        bonuses.physicsBodyType = Phaser.Physics.ARCADE;
        paddle = game.add.sprite(game.world.centerX, 475, paddleTexture);
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
        game.time.events.add(1000, releaseBall, this);
        multiplierText = game.add.text(275, 180, speed.toString() + "x points", {font: "30px Arial"});
        multiplierText.alpha = 0;
        cursors = game.input.keyboard.createCursorKeys();
        cursors.up.onDown.add(function () {
            if (!game.paused) {
                if (speed < 8) {
                    speed++;
                    ball.body.velocity.x = ball.body.velocity.x * speed / (speed - 1);
                    ball.body.velocity.y = ball.body.velocity.y * speed / (speed - 1);
                }
                $("#multiplierbar :first-child").css("width", (speed/8*100).toFixed() + "%");
                $("#multiplierbar :first-child").html(speed.toString() +  "x");
                clearTimeout(multiplierTimeout);
                multiplierText.alpha = 1;
                multiplierText.text = speed.toString() + "x points";
                multiplierTimeout = setTimeout(function () {multiplierText.alpha = 0; }, 1000);
            }
        });
        cursors.down.onDown.add(function () {
            if (!game.paused) {
                if (speed > 1) {
                    speed--;
                    ball.body.velocity.x = ball.body.velocity.x * speed / (speed + 1);
                    ball.body.velocity.y = ball.body.velocity.y * speed / (speed + 1);
                }
                $("#multiplierbar :first-child").css("width", (speed/8*100).toFixed() + "%");
                $("#multiplierbar :first-child").html(speed.toString() +  "x");
                clearTimeout(multiplierTimeout);
                multiplierText.alpha = 1;
                multiplierText.text = speed.toString() + "x points";
                multiplierTimeout = setTimeout(function () {multiplierText.alpha = 0; }, 1000);
            }
        });
        $("#multiplierbar :first-child").css("width", (speed/8*100).toFixed() + "%");
        $("#multiplierbar :first-child").html(speed.toString() +  "x");
        startLevel();
        update();
        game.paused = true;
    };

    update = function () {
        paddle.x = game.input.x;
        if (paddle.x < 30) {
            paddle.x = 30;
        } else if (paddle.x > game.width - 30) {
            paddle.x = game.width - 30;
        }
        if (ballOnPaddle) {
            ball.body.x = paddle.x - 10;
            game.physics.arcade.collide(bonuses, paddle, bonusHitPaddle, null, this);
        } else {
            game.physics.arcade.collide(ball, paddle, ballHitPaddle, null, this);
            game.physics.arcade.collide(ball, bricks, ballHitBrick, null, this);
            game.physics.arcade.collide(bonuses, paddle, bonusHitPaddle, null, this);
        }
    };

    releaseBall = function () {
        if (ballOnPaddle)
        {
            ballOnPaddle = false;
            ball.body.velocity.y = speed * -75;
            ball.body.velocity.x = speed * (-20 + 40 * Math.random());
        }
    };

    ballLost = function () {
        game.paused = true;
        lastRunDeaths++;
        popupCreator.run(function () {
            game.paused = false;
            ballOnPaddle = true;
            ball.reset(paddle.body.x + 20, paddle.y - 16);
            game.time.events.add(1000, releaseBall, this);
        });
    };

    startLevel = function () {
        var x, y;
        //  Let's move the ball back to the paddle
        ballOnPaddle = true;
        ball.body.velocity.set(0);
        game.time.events.add(1000, releaseBall, this);
        ball.x = paddle.x + 16;
        ball.y = paddle.y - 16;
        switch (level % 10) {
        case 0:
            for (y = 0; y < 10; y++) {
                for (x = 0; x < 14; x++) {
                    // if (y % 2 === 0) {
                    if (y > 3 && y < 8) {
                        bricks.getChildAt(y * 14 + x).revive();
                    }
                }
            }
            break;
        case 1:
            for (y = 0; y < 10; y++) {
                for (x = 0; x < 14; x++) {
                    if (y < 3 || y > 6) {
                        bricks.getChildAt(y * 14 + x).revive();
                    }
                }
            }
            break;
        case 2:
            for (y = 0; y < 9; y++) {
                for (x = 0; x < 14; x++) {
                    if (y > x * .65) {
                        bricks.getChildAt(y * 14 + x).revive();
                    }
                }
            }
            break;
        case 3:
            for (y = 0; y < 10; y++) {
                for (x = 0; x < 14; x++) {
                    if (y < 2 || y > 7) {
                        bricks.getChildAt(y * 14 + x).revive();
                    } else if (_.contains([2, 3, 6, 7], y) && (x < 2 || x > 11)) {
                        bricks.getChildAt(y * 14 + x).revive();
                    } else if (_.contains([4, 5], y) && _.contains([0, 1, 4, 5, 6, 7, 8, 9, 12, 13], x)) {
                        bricks.getChildAt(y * 14 + x).revive();
                    }
                }
            }
            break;
        case 4:
            for (y = 0; y < 10; y++) {
                for (x = 0; x < 14; x++) {
                    if (!_.contains([2, 3, 6, 7, 10, 11], x) && y > 1) {
                        bricks.getChildAt(y * 14 + x).revive();
                    }
                }
            }
            break;
        case 5:
            for (y = 0; y < 10; y++) {
                for (x = 0; x < 14; x++) {
                    if (y % 2 === 0) {
                        bricks.getChildAt(y * 14 + x).revive();
                    }
                }
            }
            break;
        case 6:
            for (y = 0; y < 10; y++) {
                for (x = 0; x < 14; x++) {
                    if (y < 1 || y > 8) {
                        bricks.getChildAt(y * 14 + x).revive();
                    } else if ((y === 1 || y === 8) && (x < 5 || x > 8)) {
                        bricks.getChildAt(y * 14 + x).revive();
                    } else if ((y === 2 || y === 7) && (x < 4 || x > 9)) {
                        bricks.getChildAt(y * 14 + x).revive();
                    } else if ((y === 3 || y === 6) && (x < 3 || x > 10)) {
                        bricks.getChildAt(y * 14 + x).revive();
                    } else if ((y === 4 || y === 5) && (x < 2 || x > 11)) {
                        bricks.getChildAt(y * 14 + x).revive();
                    }
                }
            }
            break;
        case 7:
            for (y = 0; y < 10; y++) {
                for (x = 0; x < 14; x++) {
                    if ((y < x * .7 - 2) || (y > x * .7 + 2) ) {
                        bricks.getChildAt(y * 14 + x).revive();
                    }
                }
            }
            break;
        case 8:
            for (y = 0; y < 10; y++) {
                for (x = 0; x < 14; x++) {
                    if ((y === 0 || y === 1 || y === 8 || y === 9) || (x === 6 || x === 7)) {
                        bricks.getChildAt(y * 14 + x).revive();
                    }
                }
            }
            break;
        case 9:
            for (y = 0; y < 10; y++) {
                for (x = 0; x < 14; x++) {
                    if ("toqwiusdkjfetiufknskdfjetqoewtopsdiufaspqweioidsuflkjxvnmvksjdfhqwiyoerrsflkmmjbkhdfqietasdfqewrwertasdfasdwertdsadfewrtdsytouooojknvlkjfhtieorewoijflk".charCodeAt(y*14 + x) > 109) {
                        bricks.getChildAt(y * 14 + x).revive();
                    }
                }
            }
            break;
        }
        level++;
    };

    ballHitBrick = function (_ball, _brick) {
        var bonus;
        _brick.kill();
        points += speed;
        lastRunPoints += speed;
        lastRunBricks++;
        $("#points").html(points);
        //  Are they any bricks left?
        if (bricks.countLiving() === 0) {
            startLevel();
        } else if (!stopBonuses && Math.random() > .9) {
            bonus = bonuses.create(_brick.x, _brick.y, bonusTexture);
            bonus.body.velocity.y = 150;
            bonus.checkWorldBounds = true;
            bonus.outOfBoundsKill = true;
            bonus.addChild(game.add.text(10, 0, "+15", {font: "15px Arial", fill: "#000000"}));
        }
    };

    ballHitPaddle = function (_ball, _paddle) {
        var diff = 0;
        if (_ball.x < _paddle.x)
        {
            //  Ball is on the left-hand side of the paddle
            diff = _paddle.x - _ball.x;
            _ball.body.velocity.x = speed * (-2.5 * diff);
        }
        else if (_ball.x > _paddle.x)
        {
            //  Ball is on the right-hand side of the paddle
            diff = _ball.x - _paddle.x;
            _ball.body.velocity.x = speed * (2.5 * diff);
        }
        else
        {
            //  Ball is perfectly in the middle
            //  Add a little random X to stop it bouncing straight up!
            _ball.body.velocity.x = speed * (-1 + Math.random() * 2);
        }
    };

    bonusHitPaddle = function (_paddle, _bonus) {
        _bonus.kill();
        points += 15;
        lastRunPoints += 15;
        $("#points").html(points);
    };

    this.setup = function () {
        game = new Phaser.Game(700, 500, Phaser.AUTO, "gamediv", {preload: preload, create: create, update: update});
    };

    this.run = function (time, callback) {
        lastRunPoints = 0;
        lastRunBricks = 0;
        lastRunDeaths = 0;
        stopBonuses = false;
        game.paused = false;
        ballOnPaddle = true;
        ball.reset(paddle.body.x + 26, paddle.y - 16);
        game.time.events.add(1000, releaseBall, this);
        setTimeout(function () {
            if (popupCreator.isUp()) {
                popupCreator.clear(true);
            }
            game.paused = true;
            callback();
        }, time * 1000);
        // make sure there aren't bonuses falling when time runs out
        setTimeout(function () {
            stopBonuses = true;
        }, time * 1000 - 5000);
    };

    this.getStats = function () {
        return {points: points,
                lastRunPoints: lastRunPoints,
                lastRunBricks: lastRunBricks,
                endingSpeed: speed,
                level: level,
                bricksLeft: bricks.countLiving(),
                deaths: lastRunDeaths};
    };
}

function PopupCreator (length) {
    "use strict";
    var i,
        self = this,
        up = false,
        totalPopups = 0,
        totalCompletes = 0,
        number,
        next,
        popup,
        clickFn,
        timer,
        timeleft,
        countdown,
        fromDeath,
        completed,
        nextFn,
        stats = {deathPopups: 0,
                 deathCompletes: 0,
                 deathMisses: 0,
                 deathCancels: 0,
                 penaltyPopups: 0,
                 penaltyCompletes: 0,
                 penaltyMisses: 0};

    popup = function () {
        up = true;
        completed = false;
        if (fromDeath) {
            stats.deathPopups++;
        } else {
            stats.penaltyPopups++;
        }
        timeleft = length;
        $("#popup").show();
        $("#popup").css("background", "red");
        $("#popupinstruct").html("<strong>Click here</strong");
        $("#popupcountdown").html(timeleft.toString());
        $("#popup").click(clickFn);
        timer = setInterval(countdown, 1000);
    };

    clickFn = function() {
        completed = true;
        $("#popupinstruct").html("&nbsp;");
        $("#popup").css("background", "green");
        $("#popup").off("click");
    };

    countdown = function() {
        timeleft--;
        $("#popupcountdown").html(timeleft.toString());
        if (timeleft === 0) {
            self.clear(false);
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

    this.clear = function (preemptive) {
        if (preemptive) {
            stats.deathCancels++;
        } else {
            totalPopups++;
            if (completed && fromDeath) {
                stats.deathCompletes++;
                totalCompletes++;
            } else if (completed) {
                stats.penaltyCompletes++;
                totalCompletes++;
            } else if (fromDeath) {
                stats.deathMisses++;
            } else {
                stats.penaltyMisses++;
            }
            $("#popuppct").html(Math.floor(((1 - totalCompletes / totalPopups) * 100)).toString());
            if ((1 - totalCompletes / totalPopups) > .1) {
                $("#popuppctdiv").css("color", "red");
            } else {
                $("#popuppctdiv").css("color", "black");
            }
        }
        clearInterval(timer);
        $("#popup").hide();
        $("#popup").css("background", "black");
        $("#popup").off("click");
        up = false;
    };

    this.missPct = function () {
        return (1 - totalCompletes / totalPopups) * 100;
    };

    this.isUp = function () {
        return up;
    };

    this.reset = function () {
        var key;
        for (key in stats) {
            if (stats.hasOwnProperty(key)) {
                stats[key] = 0;
            }
        }
    };

    this.getStats = function () {
        return stats;
    };

    this.run = function (callback) {
        fromDeath = true;
        i = 0;
        number = 1;
        nextFn = callback;
        next();
    };

    this.runMultiple = function (num, callback) {
        fromDeath = false;
        i = 0;
        number = num;
        nextFn = callback;
        next();
    };

    $("#popup").hide();
    $("#popuppct").html("0");
}


function ExploreExploitTask(nTrials, taskType, psiTurk, callback) {
    "use strict";
    var responseFn,
        contexts,
        committed,
        resetArray,
        i,
        trial = -1,
        choiceNumber = -1,
        functionList = [],
        runChoice,
        maze = d3.select("#maze").append("g"),
        contextGroups,
        playerMarker,
        contextMarker,
        updateCards,
        getLocation,
        enterRoom,
        preCommitted,
        resetContext,
        timeStamp,
        showOutcome;

    getLocation = function (context, advanced) {
        var x,
            y;
        if (advanced) {
            x = .87 * 180 * -Math.cos(Math.PI * (context / 3 - 5 / 6));
            y = .87 * 100 * -Math.sin(Math.PI * (context / 3 - 5 / 6));
        } else {
            x = 180 * -Math.cos(Math.PI * (context / 3 - 4 / 3));
            y = 100 * -Math.sin(Math.PI * (context / 3 - 4 / 3));
        }
        return [x, y];
    };

    updateCards = function (exploitVal, exploreVal) {
        var widthpct;
        $("#exploittext").html(exploitVal.toFixed());
        $("#gametimenote").html(exploitVal.toFixed());
        $("#popuptimenote").html((36 - exploitVal).toFixed());
        widthpct = Math.ceil(exploitVal/.36);
        $("#exploitprogress :nth-child(1)").css("width", widthpct.toFixed() + "%");
        $("#exploitprogress :nth-child(2)").css("width", (100-widthpct).toFixed() + "%");
        if (exploreVal === "?") {
            $("#exploretext").html("?");
            $("#exploreprogress").css("opacity", "0");
        } else {
            $("#exploretext").html(exploreVal.toFixed());
            $("#exploreprogress").css("opacity", "1");
            widthpct = Math.ceil(exploreVal/.36);
            $("#exploreprogress :nth-child(1)").css("width", widthpct.toFixed() + "%");
            $("#exploreprogress :nth-child(2)").css("width", (100-widthpct).toFixed() + "%");
        }
    };

    responseFn = function (choiceId, context) {
        var contextObj = contexts[context],
            advanced = context === (trial + 4) % 6;
        $("#" + choiceId).css({"border": "10px solid black"});
        if (choiceId === "exploit") {
            d3.select("#context" + context + " .contextcard")
                .style("stroke-width", 4);
            contextObj.nextChoice = "exploit";
            contextObj.nextValue = contextObj.value;
        } else {
            d3.select("#context" + context + " .mysterycard")
                .style("stroke-width", 4);
            contextObj.nextChoice = "explore";
            if (Math.random() > .333) {
                contextObj.nextValue = 3 * (3 + Math.ceil(Math.random() * 9));
            } else {
                contextObj.nextValue = 0;
            }
        }
        if (advanced) {
            d3.select("#context" + context + " .roomphones")
                .style("opacity", 1);
        }
        $(".card").off("click");
        psiTurk.recordTrialData({phase: "EXPERIMENT",
                                 trialType: "exploreexploit",
                                 taskType: taskType,
                                 trialChoice: trial + 4 * advanced,
                                 trialOutcome: choiceNumber,
                                 uniqueid: uniqueId,
                                 counterbalance: counterbalance,
                                 context: context,
                                 response: choiceId === "explore" ? 1 : 0,
                                 advanced: advanced,
                                 rt: new Date().getTime() - timeStamp,
                                 currentValue: contextObj.value,
                                 outcome: contextObj.nextValue
                                });
        setTimeout(
            function () {
                if (advanced) {
                    d3.select("#context" + context + " .advancedpointer")
                        .style("opacity", 0);
                }
                functionList.pop()();
            }, 1000);
    };

    enterRoom = function (context) {
        $("#contextcontents").hide();
        $("#carddiv").css("background-color", "white");
        $("#alternativecontents").show();
        $("#alternativecontents").html("Click circled room");
        contextMarker.style("opacity", 1);
        contextMarker.attr("cx", getLocation(context, 0)[0])
            .attr("cy", getLocation(context, 0)[1]);
        if (context === trial % 6) {
            playerMarker.attr("cx", getLocation(context, 0)[0])
                .attr("cy", getLocation(context, 0)[1]);
            playerMarker.transition()
                .duration(1500)
                .attr("transform", "translate(" + (-12 + 1.3 * getLocation(context, 0)[0]) +
                      "," + (-35 + 1.3 * getLocation(context, 0)[1] ) + ")");
        } else {
            d3.select("#context" + context + " .advancedpointer")
                .style("opacity", 1);
            playerMarker.attr("cx", getLocation(context, 1)[0])
                .attr("cy", getLocation(context, 1)[1]);
            playerMarker.transition()
                .duration(1500)
                .attr("transform", "translate(" + (-12 + 1.3 * getLocation(context, 1)[0]) +
                      "," + (-35 + 1.3 * getLocation(context, 1)[1] ) + ")");
        }
        $("#explorediv").show();
        $("#contextmarker, #context" + context).click(function () {
            $("#contextmarker, #context" + context).off("click");
            $("#contextcontents").show();
            $("#alternativecontents").hide();
            contextMarker.style("opacity", 0);
            $("#carddiv").css("opacity", 1);
            functionList.pop()();
        });
    };

    preCommitted = function (context) {
        $("#contextcontents").hide();
        $("#alternativecontents").show();
        $("#carddiv").css("background", contexts[context].color);
        if(context === trial % 6) {
            $("#alternativecontents").html("Choice <strong>called ahead</strong> <br/> &#x260E;");
        } else {
            $("#alternativecontents").html("<strong>Call-ahead</strong> confirmed <br/> &#x260E;");
            $("#callahead").css("opacity", 0);
        }
        setTimeout(functionList.pop(), 1500);
    };

    runChoice = function (context) {
        $("#contextcontents").show();
        $("#alternativecontents").hide();
        var contextObj = contexts[context];
        timeStamp = new Date().getTime();
        choiceNumber++;
        $("#context").html(contextObj.colorName + " room");
        if (context === trial % 6) {
            $("#trialtype").html("&nbsp;");
        } else {
            $("#trialtype").html("<strong>call-ahead</strong> choice");
            $("#callahead").css("opacity", 1);
            contextObj.advanced = true;
        }
        updateCards(contextObj.value, "?");
        $(".card").css({"border": "5px solid black",
                        "margin": "0px"});
        $("#carddiv").css("background", contextObj.color);
        $(".card").click(function () {responseFn(this.id, context); });
    };

    showOutcome = function (context) {
        $("#contextcontents").show();
        $("#alternativecontents").hide();
        var contextObj = contexts[context];
        $("#context").html(contextObj.colorName + " room");
        $("#trialtype").html("<strong>click</strong> for <strong>outcome</strong>");
        $("#trialtype").css("background", "gainsboro");
        $("#trialtype").css({"border": "5px solid black", "border-radius": "5px"});
        updateCards(contextObj.value, "?");
        $(".card").css({"border": "5px solid black",
                        "margin": "0px"});
        $("#carddiv").css("background", contextObj.color);
        $("#" + contextObj.nextChoice).css({"border": "10px solid black"});
        $("#explorediv").show();
        $("#trialtype").click(function () {
            if (contextObj.advanced) {
                contextObj.advanced = false;
                d3.select("#context" + context + " .roomphones")
                    .style("opacity", 0);
            }
            $("#trialtype").off("click");
            $("#trialtype").css("background", "white");
            $("#trialtype").css("border", "");
            $("#trialtype").html("Outcome: <strong>" + contextObj.nextValue.toFixed() + "</strong>");
            $(".card").css({"border": "5px solid black",
                            "margin": "0px"});
            d3.select("#context" + context + " .contextcard")
                .style("stroke-width", 1);
            d3.select("#context" + context + " .mysterycard")
                .style("stroke-width", 1);
            if (contextObj.nextChoice === "explore") {
                updateCards(contextObj.value, contextObj.nextValue);
                if (contextObj.nextValue > contextObj.value) {
                    contextObj.value = contextObj.nextValue;
                    $("#explore").css("background", "lime");
                    $("#explore").animate({"margin-left": "-220px"}, 1000, "swing",
                                          function () {
                                              $("#explore").css("margin-left", "");
                                              $("#explore").css("background", "gainsboro");
                                              updateCards(contextObj.value, "?");
                                              $("#popuptimenote").html((36 - contextObj.value).toFixed());
                                              $("#exploit").css("background", "lime");
                                          });
                    d3.select("#context" + context + " .contextcard")
                        .style("fill", "lime");
                    d3.select("#context" + context + " .contextvalue")
                        .text(contextObj.value);
                }
            }
            d3.select("#context" + context + " .contextvalue")
                .text(contextObj.value);
            setTimeout(function () {
                $("#explorediv").hide();
                d3.select("#context" + context + " .contextcard")
                    .style("fill", "white");
                $("#exploit").css("background", "gainsboro");
                callback(contextObj.nextValue, trial);
            }, 2000);
        });
    };

    resetContext = function (context) {
        var contextObj = contexts[context];
        contextObj.value = 3 * (3 + Math.ceil(Math.random() * 3));
        $("#trialtype").html("<strong>room reset</strong>");
        updateCards(contextObj.value, "?");
        $(".card").css({"border": "5px solid black",
                        "margin": "0px"});
        $("#carddiv").css("background", contextObj.color);
        $("#exploit").css("background", "gray");
        setTimeout(function () {
            $("#exploit").css("background", "gainsboro");
        }, 1000);
        d3.select("#context" + context + " .contextvalue")
            .text(contextObj.value);
        d3.select("#context" + context + " .contextcard")
            .style("fill", "gray")
            .transition()
            .delay(1000)
            .duration(0)
            .style("fill", "white");
        $("#explorediv").show();
        setTimeout(functionList.pop(), 2000);
    };

    this.run = function() {
        trial++;
        functionList.push(function () {
            showOutcome(trial % 6);
        });
        if (!committed[trial]) {
            functionList.push(function () {
                runChoice(trial % 6);
            });
        } else {
            functionList.push(function () {
                preCommitted(trial % 6);
            });
        }
        functionList.push(function () {
            enterRoom(trial % 6);
        });
        if (committed[trial + 4]) {
            contextGroups.select(".advanced")
                .style("opacity", 1);
            functionList.push(function () {
                preCommitted((trial + 4) % 6);
            });
            functionList.push(function () {
                runChoice((trial + 4) % 6);
            });
            functionList.push(function () {
                enterRoom((trial + 4) % 6);
            });
        } else {
            contextGroups.select(".advanced")
                .style("opacity", 0);
        }
        if (resetArray[trial - 1]) {
            functionList.push(function () {
                resetContext((trial - 1) % 6);
            });
        }
        functionList.pop()();
        $("#inforeminder").hide();
    };

    $("#inforeminderbutton").click(function () {$("#inforeminder").toggle(400); });
    committed = [];
    if (taskType === "practice") {
        for (i = 0; i < nTrials; i++) {
            if (i < 6) {
                committed.push(0);
                // committed.push(1);
            } else if (i < 12){
                committed.push(1);
            } else {
                committed.push(0);
            }
        }
        $("#timediv").css("opacity", 0);
        $("#pointsdiv").css("opacity", 0);
        $("#popuppctdiv").css("opacity", 0);
    } else {
        for (i = 0; i < nTrials; i++) {
            if (i < 6) {
                committed.push(0);
            } else if (i < 54){
                committed.push((Math.floor((i - 6) / 12) + parseInt(counterbalance)) % 2);
            } else {
                committed.push((Math.floor((i - 6) / 6) + parseInt(counterbalance)) % 2);
            }
        }
    }
    (function () {
        var lastchosen = -1,
            chosen = -1;
        resetArray = [];
        for (i = 0; i < nTrials / 6; i++) {
            while(chosen === lastchosen) {
                chosen = Math.floor(Math.random() * 6);
            }
            resetArray = [0, 0, 0, 0, 0, 0].concat(resetArray);
            resetArray[chosen] = 1;
            lastchosen = chosen;
        }
    })();
    contexts = [{color: "red", colorName: "red"},
                {color: "orange", colorName: "orange"},
                {color: "yellow", colorName: "yellow"},
                {color: "green", colorName: "green"},
                {color: "#4444FF", colorName: "blue"},
                {color: "#A000A0", colorName: "purple"}];
    contexts = _.shuffle(contexts);
    contexts = contexts.map(function (obj) {
        obj.value = 3 * (3 + Math.ceil(Math.random() * 3));
        obj.nextValue = 0;
        obj.advanced = false;
        return obj;
    });
    maze.attr("transform", "translate(300, 150)");
    contextMarker = maze.append("circle")
        .attr("id", "contextmarker")
        .attr("r", "50")
        .style("fill", "gainsboro")
        .style("opacity", 0)
        .style("stroke", "black")
        .style("stroke-width", 1);
    maze.selectAll("path").data(contexts)
        .enter()
        .append("path")
        .attr("d", function (d, idx) {
            return "M " + getLocation(idx, 0)[0] +
                " " + getLocation(idx, 0)[1] +
                " L " + getLocation(idx + 1, 0)[0] +
                " " + getLocation(idx + 1, 0)[1];
        })
        .style("stroke", "black")
        .style("stroke-width", 3);
    contextGroups = maze.selectAll(".context")
        .data(contexts)
        .enter()
        .append("g")
        .attr("class", "context")
        .attr("id", function (d, idx) {
            return "context" + idx;
        });
    maze.append("svg:defs").append("svg:marker")
        .attr("id", "triangle")
        .attr("refX", 3)
        .attr("refY", 3)
        .attr("markerWidth", 15)
        .attr("markerHeight", 15)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M 0 0 6 3 0 6")
        .style("fill", "black");
    contextGroups.append("line")
        .attr("class", "advancedpointer")
        .attr("x1", function (d, idx) {
            return getLocation(idx, 1)[0];
        })
        .attr("y1", function (d, idx) {
            return getLocation(idx, 1)[1];
        })
        .attr("x2", function (d, idx) {
            return .25 * getLocation(idx, 1)[0] +
                .75 * getLocation(idx, 0)[0];
        })
        .attr("y2", function (d, idx) {
            return .25 * getLocation(idx, 1)[1] +
                .75 * getLocation(idx, 0)[1];
        })
        .attr("stroke-width", 3)
        .attr("stroke", "black")
        .attr("stroke-dasharray", "5, 5")
        .attr("marker-end", "url(#triangle)")
        .style("opacity", 0);
    contextGroups.append("rect")
        .attr("width", 84)
        .attr("height", 44)
        .attr("x", function (d, idx) {
            return -42 + getLocation(idx, 0)[0];
        })
        .attr("y", function (d, idx) {
            return -22 + getLocation(idx, 0)[1];
        })
        .style("fill", function (d) {
            return d.color;
        })
        .style("stroke", "black")
        .style("stroke-width", 1);
    contextGroups.append("rect")
        .attr("class", "contextcard")
        .attr("width", 30)
        .attr("height", 30)
        .attr("x", function (d, idx) {
            return -35 + getLocation(idx, 0)[0];
        })
        .attr("y", function (d, idx) {
            return -15 + getLocation(idx, 0)[1];
        })
        .style("fill", "white")
        .style("stroke", "black")
        .style("stroke-width", 1);
    contextGroups.append("rect")
        .attr("class", "mysterycard")
        .attr("width", 30)
        .attr("height", 30)
        .attr("x", function (d, idx) {
            return 5 + getLocation(idx, 0)[0];
        })
        .attr("y", function (d, idx) {
            return -15 + getLocation(idx, 0)[1];
        })
        .style("fill", "white")
        .style("stroke", "black")
        .style("stroke-width", 1);
    contextGroups.append("text")
        .attr("class", "contextvalue")
        .attr("x", function (d, idx) {
            return -20 + getLocation(idx, 0)[0];
        })
        .attr("y", function (d, idx) {
            return 6 + getLocation(idx, 0)[1];
        })
        .attr("text-anchor", "middle")
        .text(function (d) {return d.value.toString(); });
    contextGroups.append("text")
        .attr("class", "mysteryvalue")
        .attr("x", function (d, idx) {
            return 20 + getLocation(idx, 0)[0];
        })
        .attr("y", function (d, idx) {
            return 6 + getLocation(idx, 0)[1];
        })
        .attr("text-anchor", "middle")
        .text("?");
    contextGroups.append("text")
        .attr("class", "roomphones")
        .attr("x", function (d, idx) {
            return getLocation(idx, 0)[0];
        })
        .attr("y", function (d, idx) {
            return 40 + getLocation(idx, 0)[1];
        })
        .attr("text-anchor", "middle")
        .style("opacity", 0)
        .text("\u260E");
    contextGroups.append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .attr("class", "advanced")
        .attr("x", function (d, idx) {
            return -10 + getLocation(idx, 1)[0];
        })
        .attr("y", function (d, idx) {
            return -10 + getLocation(idx, 1)[1];
        })
        .style("opacity", 0)
        .style("fill", function (d) {
            return d.color;
        })
        .style("stroke", "black")
        .style("stroke-width", 1);
    playerMarker = maze.append("g")
        .attr("id", "marker")
        .attr("transform", "translate(" + (-12 + 1.3 * getLocation(0, 0)[0]) +
              "," + (-35 + 1.3 * getLocation(0, 0)[1] ) + ")");
    d3.xml("/static/images/player.svg", function(xml) {
        var importedNode = document.importNode(xml.documentElement, true);
        document.getElementById("marker").appendChild(importedNode.cloneNode(true));
    });
}

function ConsumptionRewards(psiTurk, callback) {
    "use strict";
    var game,
        baselength = 3,
        maxReward = 36,
        trialNum,
        rewardAmount,
        popupCreator,
        nextReward,
        nextPunishment,
        totalTime = maxReward,
        timeLeft,
        decrementTime,
        recordData,
        timeInterval;

    nextReward = function (length) {
        $("#time").html(length);
        timeLeft = length;
        timeInterval = setInterval(decrementTime, 1000);
        game.run(length, function () {
            clearInterval(timeInterval);
            nextPunishment(maxReward - length);
        });
    };

    nextPunishment = function (length) {
        $("#time").html(length);
        timeLeft = length;
        timeInterval = setInterval(decrementTime, 1000);
        popupCreator.runMultiple(length / 3, function () {
            $("#rewards").hide();
            clearInterval(timeInterval);
            recordData();
        });
    };

    recordData = function () {
        var gameData,
            popupData;
        gameData = game.getStats();
        popupData = popupCreator.getStats();
        psiTurk.recordTrialData({phase: "EXPERIMENT",
                                 trialType: "consumption",
                                 trial: trialNum,
                                 uniqueid: uniqueId,
                                 counterbalance: counterbalance,
                                 outcome: rewardAmount,
                                 points: gameData.points,
                                 lastRunPoints: gameData.lastRunPoints,
                                 lastRunBricks: gameData.lastRunBricks,
                                 endingSpeed: gameData.endingSpeed,
                                 level: gameData.level,
                                 bricksLeft: gameData.bricksLeft,
                                 deaths: gameData.deaths,
                                 deathCompletes: popupData.deathCompletes,
                                 deathMisses: popupData.deathMisses,
                                 deathCancels: popupData.deathCancels,
                                 penaltyPopups: popupData.penaltyPopups,
                                 penaltyCompletes: popupData.penaltyCompletes,
                                 penaltyMisses: popupData.penaltyMisses
        });
        callback();
    };

    this.setReward = function(reward, trial) {
        rewardAmount = reward;
        trialNum = trial;
        $("#rewards").show();
        popupCreator.reset();
        nextReward(reward);
    };

    this.recordFinal = function(taskType) {
        psiTurk.recordUnstructuredData("points_" + taskType, game.getStats().points.toString());
        psiTurk.recordUnstructuredData("misses_" + taskType, popupCreator.missPct().toString());
    };

    decrementTime = function () {
        timeLeft--;
        if (timeLeft >= 0) {
            $("#time").html(timeLeft);
        }
    };

    popupCreator = new PopupCreator(baselength);
    game = new Game(popupCreator);
    game.setup();
    $("#points").html("0");
    $("#time").html("0");
}

function PracticeRewards (psiTurk, callback) {
    "use strict";

    this.setReward = function (reward) {
        callback();
    };

    this.recordFinal = function(taskType) {
        return;
    };
}

function practiceConsumption(psiTurk, callback) {
    "use strict";
    var examples = [24, 12, 0, 36],
        trials = [-4, -3, -2, -1],
        rewards,
        next;

    next = function () {
        if (examples.length === 0) {
            callback();
        } else {
            var reward = examples.shift();
            $("#rewardintro").show();
            $("#rewardintrotext").html("Example outcome: " + reward);
            $("#continue").off("click");
            $("#continue").click(
                function () {
                    $("#rewardintro").hide();
                    rewards.setReward(reward, trials.shift());
                }
            );
        }
    };

    psiTurk.showPage("practice.html");
    $("#rewards").hide();
    rewards = new ConsumptionRewards(psiTurk, next);
    next();
}

function TransitionScreen(page, psiTurk, callback) {
    psiTurk.showPage(page);
    $("#continue").click(callback);
}

function phaseDriver(nTrials, ExploreFn, RewardFn, taskType, psiTurk, callback) {
    "use strict";
    var exploreExploit,
        rewards,
        nextChoice,
        trial = 0;

    nextChoice = function () {
        if (trial < nTrials) {
            $("#trials").html(nTrials - trial);
            trial++;
            exploreExploit.run();
        } else {
            rewards.recordFinal(taskType);
            psiTurk.saveData({
                success: callback,
                error: callback});
        }
    };

    psiTurk.showPage("stage.html");
    $("#rewards").hide();

    rewards = new RewardFn(psiTurk, nextChoice);
    exploreExploit = new ExploreFn(nTrials, taskType, psiTurk, rewards.setReward);
    nextChoice();
}

function instructionDriver(instructionPages, quizPage, answerKey, psiTurk, callback) {
    "use strict";
    var quiz,
        loop = 0;

    quiz = function () {
        var recordResponses;
        recordResponses = function() {
            var allRight = true;
            $("select").each(function () {
                psiTurk.recordTrialData({phase: "INSTRUCTQUIZ",
                                         quiz: quizPage,
                                         question: this.id,
                                         answer: this.value,
                                         loop: loop});
                if (answerKey[this.id] !== this.value) {
                    allRight = false;
                }
            });
            return allRight;
        };
        psiTurk.showPage(quizPage);
        $("#continue").click(function () {
            if (recordResponses()) {
                // Record that the user has finished the instructions and
                // moved on to the experiment. This changes their status code
                // in the database.
                psiTurk.recordUnstructuredData("instructionloops_" + quizPage, loop);
                psiTurk.finishInstructions();
                // Move on to the experiment
                callback();
            } else {
                loop += 1;
                psiTurk.showPage("restart.html");
                $(".continue").click(function () {
                    psiTurk.doInstructions(instructionPages, quiz);
                });
            }
        });
    };

    psiTurk.doInstructions(instructionPages, quiz);
}

function endingQuestions(psiTurk, callback) {
    "use strict";
    var recordResponses,
        points = psiTurk.getQuestionData().points_consumption,
        misspct = Math.floor(psiTurk.getQuestionData().misses_consumption),
        missloss = 0,
        bonus;

    recordResponses = function () {
        if ($("#popupenjoyment").val() === "noresp" || $("#brickbreakenjoyment").val() === "noresp") {
            $("#blankmessage").html("<strong>Please answer all questions before continuing.</strong>");
        } else {
            $("select").each(function () {
                psiTurk.recordUnstructuredData(this.id, this.value);
            });
            callback();
        }
    };


    psiTurk.showPage("endingquestions.html");
    $("#pointsscored").html(points);
    $("#misspct").html(misspct);
    if (misspct > 10) {
        missloss = Math.min((misspct - 10) * .1, 3);
        bonus = 3 - missloss;
    } else {
        bonus = 3;
    }
    $("#missloss").html(missloss.toFixed(2));
    psiTurk.recordUnstructuredData("bonus", bonus);
    psiTurk.recordUnstructuredData("uniqueid", uniqueId);
    psiTurk.recordUnstructuredData("counterbalance", counterbalance);
    $("#totalbonus").html(bonus.toFixed(2));
    $("#continue").click(function () {
        recordResponses();
    });
}

function questionnaire(psiTurk) {
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
    var psiTurk = new PsiTurk(uniqueId, adServerLoc, mode),
        next,
        nTrials = [18, 66],
        // nTrials = [3, 3, 3],
        functionList = [];

    next = function () {
        functionList.shift()();
    };

    psiTurk.preloadPages(["stage.html",
                          "practice.html",
                          "restart.html",
                          "instructions/instruct_1.html",
                          "instructions/instruct_2.html",
                          "instructions/instruct_3.html",
                          "instructions/instruct_4.html",
                          "instructions/instruct_5.html",
                          "instructions/instruct_6.html",
                          "instructions/instruct_7.html",
                          "instructions/instruct_8.html",
                          "instructions/quiz.html",
                          "transition_practicedecision.html",
                          "transition_practiceconsumption.html",
                          "transition_fulltask.html",
                          "endingquestions.html",
                          "postquestionnaire.html"]);
    functionList = [
        function () {
            instructionDriver(["instructions/instruct_1.html",
                               "instructions/instruct_2.html",
                               "instructions/instruct_3.html",
                               "instructions/instruct_4.html",
                               "instructions/instruct_5.html",
                               "instructions/instruct_6.html",
                               "instructions/instruct_7.html",
                               "instructions/instruct_8.html"],
                              "instructions/quiz.html",
                              {mystery0: "third",
                               range: "12_36",
                               reset: "1_6",
                               advancednum: "4",
                               penalty: "10percentage"},
                              psiTurk, next); },
        function () {
            TransitionScreen("transition_practicedecision.html", psiTurk, next);
        },
        function () {
            phaseDriver(nTrials[0], ExploreExploitTask, PracticeRewards, "practice", psiTurk, next); },
        function () {
            TransitionScreen("transition_practiceconsumption.html", psiTurk, next);
        },
        function () {
            practiceConsumption(psiTurk, next); },
        function () {
            TransitionScreen("transition_fulltask.html", psiTurk, next);
        },
        function () {
            phaseDriver(nTrials[1], ExploreExploitTask, ConsumptionRewards, "consumption", psiTurk, next); },
        function () {
            endingQuestions(psiTurk, next); },
        function () {
            questionnaire(psiTurk); }];
    next();
}

$(window).load(function () {
    "use strict";
    experimentDriver();
});
