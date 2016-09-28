/*
 * Requires:
 * phaser.js
 * jquery.js
 * underscore.js
 * d3.js
 */

/*jslint browser: true*/
/*global counterbalance, uniqueId, adServerLoc, mode, document, PsiTurk, $, _, d3, Phaser, window, setTimeout, setInterval, clearInterval*/

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
        bonusHitPaddle,
        brickTexture,
        bonusTexture,
        paddleTexture,
        ballTexture,
        ball,
        paddle,
        bricks,
        bonuses,
        ballOnPaddle = true,
        points = 0,
        lastRunPoints = 0,
        lastRunDeaths = 0;

    preload = function () {
        var graphicBase;
        graphicBase = game.add.graphics(0, 0);
        graphicBase.beginFill(0xff0000);
        graphicBase.drawRect(0, 0, 40, 20);
        graphicBase.endFill();
        brickTexture = graphicBase.generateTexture();
        graphicBase.destroy();
        graphicBase = game.add.graphics(0, 0);
        graphicBase.beginFill(0x00bb00);
        graphicBase.drawRect(0, 0, 40, 20);
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
        game.physics.startSystem(Phaser.Physics.ARCADE);
        //  We check bounds collisions against all walls other than the bottom one
        game.physics.arcade.checkCollision.down = false;
        game.stage.backgroundColor = "#00c5cf";
        bricks = game.add.group();
        bricks.enableBody = true;
        bricks.physicsBodyType = Phaser.Physics.ARCADE;
        var brick;
        for (var y = 0; y < 5; y++) {
            for (var x = 0; x < 15; x++) {
                brick = bricks.create(30 + (x * 50), 90 + (y * 42), brickTexture);
                brick.body.bounce.set(1);
                brick.body.immovable = true;
            }
        }
        bonuses = game.add.group();
        bonuses.enableBody = true;
        bonuses.physicsBodyType = Phaser.Physics.ARCADE;
        paddle = game.add.sprite(game.world.centerX, 500, paddleTexture);
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
        game.paused = true;
    };

    update = function () {
        paddle.x = game.input.x;
        if (paddle.x < 30)
        {
            paddle.x = 30;
        }
        else if (paddle.x > game.width - 30)
        {
            paddle.x = game.width - 30;
        }
        if (ballOnPaddle)
        {
            ball.body.x = paddle.x - 10;
            game.physics.arcade.collide(bonuses, paddle, bonusHitPaddle, null, this);
        }
        else
        {
            game.physics.arcade.collide(ball, paddle, ballHitPaddle, null, this);
            game.physics.arcade.collide(ball, bricks, ballHitBrick, null, this);
            game.physics.arcade.collide(bonuses, paddle, bonusHitPaddle, null, this);
        }
    };

    releaseBall = function () {
        if (ballOnPaddle)
        {
            ballOnPaddle = false;
            ball.body.velocity.y = -300;
            ball.body.velocity.x = -75 + 150 * Math.random();
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

    ballHitBrick = function (_ball, _brick) {
        var bonus;

        _brick.kill();
        points++;
        lastRunPoints++;
        $("#points").html(points);
        //  Are they any bricks left?
        if (bricks.countLiving() === 0) {
            //  Let's move the ball back to the paddle
            ballOnPaddle = true;
            ball.body.velocity.set(0);
            game.time.events.add(1000, releaseBall, this);
            ball.x = paddle.x + 16;
            ball.y = paddle.y - 16;
            //  And bring the bricks back from the dead :)
            bricks.callAll("revive");
        } else if (Math.random() > .9) {
            bonus = bonuses.create(_brick.x, _brick.y, bonusTexture);
            bonus.body.velocity.y = 120;
            bonus.checkWorldBounds = true;
            bonus.outOfBoundsKill = true;
            bonus.addChild(game.add.text(10, 0, "+3", {font: "15px Arial", fill: "#000000"}));
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
            _ball.body.velocity.x = -4 + Math.random() * 8;
        }
    };

    bonusHitPaddle = function (_paddle, _bonus) {
        _bonus.kill();
        points += 3;
        lastRunPoints += 3;
        $("#points").html(points);
    };

    this.setup = function () {
        game = new Phaser.Game(800, 600, Phaser.AUTO, "rewards", {preload: preload, create: create, update: update});
    };

    this.run = function (time, callback) {
        lastRunPoints = 0;
        lastRunDeaths = 0;
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
    };

    this.getStats = function () {
        return {points: points,
                lastRunPoints: lastRunPoints,
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
            $("#popuppct").html(((1 - totalCompletes / totalPopups) * 100).toFixed());
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

    $("#rewards").append("<div id=\"popup\"> <div id=\"popupinstruct\"></div> <div id=\"popupcountdown\"></div> </div> ");
    $("#popup").hide();
    $("#popuppct").html("0");
}

function ExploreExploitTaskNoContext(nTrials, taskType, psiTurk, callback) {
    "use strict";
    var responseFn,
        trial = -1,
        runChoice,
        reset,
        showOutcome,
        value = 3 + Math.ceil(Math.random() * 4),
        nextValue,
        nextChoice;

    responseFn = function (choiceId) {
        $("#" + choiceId).css({"border": "10px solid black",
                               "margin": "-5px"});
        if (choiceId === "exploit") {
            nextValue = value;
            nextChoice = "exploit";
        } else {
            nextChoice = "explore";
            if (Math.random() > .5) {
                nextValue = 3 + Math.ceil(Math.random() * 9);
            } else {
                nextValue = 0;
            }
        }
        $(".card").off("click");
        psiTurk.recordTrialData({phase: "EXPERIMENT",
                                 trialType: "exploreexploit",
                                 taskType: taskType,
                                 trial: trial,
                                 uniqueid: uniqueId,
                                 counter: counterbalance,
                                 context: -1,
                                 response: choiceId,
                                 advanced: -1,
                                 currentValue: value,
                                 outcome: nextValue
                                });
        setTimeout(showOutcome, 1000);
    };

    runChoice = function () {
        $("#trialtype").html("choose a card");
        $("#exploit").html(value);
        $("#explore").html("?");
        $(".card").css({"border": "5px solid black",
                        "margin": "0px"});
        $("#explorediv").show();
        $(".card").click(function () {responseFn(this.id); });
    };

    showOutcome = function () {
        $("#trialtype").html("<strong>click</strong> for <strong>outcome</strong>");
        $("#exploit").html(value.toFixed());
        $("#explore").html("?");
        $(".card").css({"border": "5px solid black",
                        "margin": "0px"});
        $("#" + nextChoice).css({"border": "10px solid black",
                                            "margin": "-5px"});
        $("#explorediv").show();
        $("#trialtype").click(function () {
            $("#trialtype").off("click");
            $("#trialtype").html(nextValue.toFixed());
            $(".card").css({"border": "5px solid black",
                            "margin": "0px"});
            if (nextChoice === "explore") {
                $("#explore").html(nextValue.toFixed());
                if (nextValue > value) {
                    value = nextValue;
                    $("#exploit").html(value.toFixed());
                    $("#exploit").css("background", "lime");
                    setTimeout(function () {
                        $("#exploit").css("background", "white");
                    }, 1000);
                }
            }
            setTimeout(function () {
                $("#explorediv").hide();
                callback(nextValue);
            }, 2000);
        });
    };

    reset = function () {
        value = 3 + Math.ceil(Math.random() * 4);
        $("#trialtype").html("<strong>cards reset</strong>");
        $("#exploit").html(value);
        $("#explore").html("?");
        $(".card").css({"border": "5px solid black",
                        "margin": "0px"});
        $("#exploit").css("background", "gray");
        setTimeout(function () {
            $("#exploit").css("background", "white");
        }, 1000);
        $("#explorediv").show();
        setTimeout(runChoice, 2000);
    };

    this.run = function() {
        trial++;
        if (trial !== 0 && Math.random() < .1) {
            reset();
        } else {
            runChoice();
        }
    };

    $("#context").html("practice round");
    $("#carddiv").css("background", "darkgray");
}

function ExploreExploitTask(nTrials, taskType, psiTurk, callback) {
    "use strict";
    var responseFn,
        contexts,
        committed,
        committedOn = 0,
        i,
        trial = -1,
        functionList = [],
        runChoice,
        maze = d3.select("#maze").append("g"),
        contextGroups,
        marker,
        futureMarker,
        update,
        getLocation,
        resetContext,
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

    update = function (context, advanced) {
        contextGroups = maze.selectAll(".context")
            .data(contexts);
        contextGroups.select(".contextvalue")
            .text(function (d) {
                return d.value.toString();
            });
        contextGroups.select(".advancedmarker")
            .style("opacity", function (d) {
                return d.advancedSet;
            });
        contextGroups.select(".advanced")
            .style("opacity", committedOn);
        // marker.attr("cx", getLocation(context, advanced)[0])
        //     .attr("cy", getLocation(context, advanced)[1]);
        marker.transition()
            .duration(1500)
            .attr("transform", "translate(" + (-12 + 1.3 * getLocation(context, advanced)[0]) +
                    "," + (-35 + 1.3 * getLocation(context, advanced)[1] ) + ")");
        if (advanced) {
            futureMarker.attr("cx", getLocation(context, 0)[0])
                .attr("cy", getLocation(context, 0)[1])
                .style("opacity", 1);
        } else {
            futureMarker
                .style("opacity", 0);
        }
    };

    responseFn = function (choiceId, context) {
        var contextObj = contexts[context],
            advanced = context === (trial + 4) % 6;
        $("#" + choiceId).css({"border": "10px solid black",
                               "margin": "-5px"});
        if (choiceId === "exploit") {
            contextObj.nextChoice = "exploit";
            contextObj.nextValue = contextObj.value;
            // card.html(reward.toString());
        } else {
            contextObj.nextChoice = "explore";
            if (Math.random() > .5) {
                contextObj.nextValue = 3 + Math.ceil(Math.random() * 9);
            } else {
                contextObj.nextValue = 0;
            }
        }
        if (advanced) {
            contextObj.advancedSet = 1;
        }
        $(".card").off("click");
        psiTurk.recordTrialData({phase: "EXPERIMENT",
                                 trialType: "exploreexploit",
                                 taskType: taskType,
                                 trial: trial + 4 * advanced,
                                 uniqueid: uniqueId,
                                 counter: counterbalance,
                                 context: context,
                                 response: choiceId,
                                 advanced: advanced,
                                 currentValue: contextObj.value,
                                 outcome: contextObj.nextValue
                                });
        setTimeout(functionList.pop(), 1000);
    };

    runChoice = function (context) {
        var contextObj = contexts[context];
        $("#context").html(contextObj.color + " context");
        if (context === trial % 6) {
            $("#trialtype").html("<strong>immediate</strong> choice");
            update(context, 0);
        } else {
            $("#trialtype").html("<strong>advanced</strong> choice");
            update(context, 1);
        }
        $("#exploit").html(contextObj.value.toFixed());
        $("#explore").html("?");
        $(".card").css({"border": "5px solid black",
                        "margin": "0px"});
        $("#carddiv").css("background", contextObj.color);
        $("#explorediv").show();
        $(".card").click(function () {responseFn(this.id, context); });
    };

    showOutcome = function (context) {
        var contextObj = contexts[context];
        update(context, 0);
        $("#context").html(contextObj.color + " context");
        $("#trialtype").html("<strong>click</strong> for <strong>outcome</strong>");
        $("#exploit").html(contextObj.value.toFixed());
        $("#explore").html("?");
        $(".card").css({"border": "5px solid black",
                        "margin": "0px"});
        $("#carddiv").css("background", contextObj.color);
        $("#" + contextObj.nextChoice).css({"border": "10px solid black",
                                            "margin": "-5px"});
        $("#explorediv").show();
        $("#trialtype").click(function () {
            $("#trialtype").off("click");
            $("#trialtype").html(contextObj.nextValue.toFixed());
            $(".card").css({"border": "5px solid black",
                            "margin": "0px"});
            if (contextObj.nextChoice === "explore") {
                $("#explore").html(contextObj.nextValue.toFixed());
                if (contextObj.nextValue > contextObj.value) {
                    contextObj.value = contextObj.nextValue;
                    $("#exploit").html(contextObj.value.toFixed());
                    $("#exploit").css("background", "lime");
                    setTimeout(function () {
                        $("#exploit").css("background", "white");
                    }, 1000);
                    d3.select("#context" + context + " .contextcard")
                        .style("fill", "lime")
                        .transition()
                        .delay(1000)
                        .duration(0)
                        .style("fill", "white");
                }
            }
            contextObj.advancedSet = 0;
            update(context, 0);
            setTimeout(function () {
                $("#explorediv").hide();
                callback(contextObj.nextValue, trial);
            }, 2000);
        });
    };

    resetContext = function (context) {
        var contextObj = contexts[context];
        contextObj.value = 3 + Math.ceil(Math.random() * 4);
        update(context, 0);
        $("#trialtype").html("<strong>context reset</strong>");
        $("#exploit").html(contextObj.value);
        $("#explore").html("?");
        $(".card").css({"border": "5px solid black",
                        "margin": "0px"});
        $("#carddiv").css("background", contextObj.color);
        $("#exploit").css("background", "gray");
        setTimeout(function () {
            $("#exploit").css("background", "white");
        }, 1000);
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
        }
        if (committed[trial + 4]) {
            committedOn = 1;
            functionList.push(function () {
                runChoice((trial + 4) % 6);
            });
        } else {
            committedOn = 0;
        }
        if (trial !== 0 && Math.random() < .1) {
            functionList.push(function () {
                resetContext((trial - 1) % 6);
            });
        }
        functionList.pop()();
    };

    committed = [];
    for (i = 0; i < nTrials; i++) {
        if (i < 6) {
            committed.push(0);
        } else {
            committed.push((Math.floor((i - 6) / 18) + parseInt(counterbalance)) % 2);
        }
    }
    contexts = [{color: "red"},
                {color: "orange"},
                {color: "yellow"},
                {color: "green"},
                {color: "blue"},
                {color: "purple"}];
    contexts = _.shuffle(contexts);
    contexts = contexts.map(function (obj) {
        obj.value = 3 + Math.ceil(Math.random() * 4);
        obj.nextValue = 0;
        obj.advancedSet = 0;
        return obj;
    });
    maze.attr("transform", "translate(300, 150)");
    futureMarker = maze.append("circle")
        .attr("r", "40")
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
    contextGroups.append("rect")
        .attr("width", 50)
        .attr("height", 50)
        .attr("x", function (d, idx) {
            return -25 + getLocation(idx, 0)[0];
        })
        .attr("y", function (d, idx) {
            return -25 + getLocation(idx, 0)[1];
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
            return -15 + getLocation(idx, 0)[0];
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
            return getLocation(idx, 0)[0];
        })
        .attr("y", function (d, idx) {
            return 6 + getLocation(idx, 0)[1];
        })
        .attr("text-anchor", "middle")
        .text("4");
    contextGroups.append("text")
        .attr("class", "advancedmarker")
        .attr("x", function (d, idx) {
            return getLocation(idx, 0)[0];
        })
        .attr("y", function (d, idx) {
            return 40 + getLocation(idx, 0)[1];
        })
        .attr("text-anchor", "middle")
        .style("opacity", 0)
        .text("a");
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
    marker = maze.append("g")
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
        maxReward = 12,
        trialNum,
        rewardAmount,
        popupCreator,
        nextReward,
        nextPunishment,
        totalTime = maxReward * baselength,
        timeLeft,
        decrementTime,
        recordData,
        timeInterval;

    nextReward = function (length) {
        game.run(baselength * length, function () {
            nextPunishment(maxReward - length);
        });
    };

    nextPunishment = function (penalty) {
        popupCreator.runMultiple(penalty, function () {
            $("#rewards").hide();
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
                                 counter: counterbalance,
                                 reward: rewardAmount,
                                 points: gameData.points,
                                 lastRunPoints: gameData.lastRunPoints,
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
        timeLeft = totalTime;
        $("#time").html(timeLeft);
        timeInterval = setInterval(decrementTime, 1000);
        nextReward(reward);
    };

    decrementTime = function () {
        timeLeft--;
        if (timeLeft > 0) {
            $("#time").html(timeLeft);
        } else {
            $("#time").html(timeLeft);
            clearInterval(timeInterval);
        }
    };

    popupCreator = new PopupCreator(baselength);
    game = new Game(popupCreator);
    game.setup();
    $("#points").html("0");
    $("#time").html("0");
}

function StandardRewards (psiTurk, callback) {
    "use strict";
    var totalRewards = 0;

    this.setReward = function (reward) {
        totalRewards += reward;
        $("#points").html(totalRewards);
        $("#rewards").html(reward.toString());
        $("#rewards").show();
        setTimeout(function () {
            $("#rewards").html("");
            $("#rewards").hide();
            callback();
        }, 1000);
    };

    $("#rewards").addClass("standardRewards");
    $("#points").html(totalRewards);
    $("#timediv").css("opacity", 0);
    $("#popuppctdiv").css("opacity", 0);
}

function practiceConsumption(psiTurk, callback) {
    "use strict";
    var examples = [4, 0, 8, 0, 12],
        trials = [-5, -4, -3, -2, -1],
        rewards,
        next;

    next = function () {
        if (examples.length === 0) {
            $("#rewardintro").show();
            $("#rewardintro").html("Continuing to main task");
            setTimeout(callback, 3000);
        } else {
            var reward = examples.shift();
            $("#rewardintro").show();
            $("#rewardintro").html("Example outcome: " + reward);
            setTimeout(
                function () {
                    $("#rewardintro").hide();
                    rewards.setReward(reward, trials.shift());
                }, 3000);
        }
    };

    psiTurk.showPage("practice.html");
    $("#rewards").hide();
    rewards = new ConsumptionRewards(psiTurk, next);
    next();
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
    var recordResponses;

    recordResponses = function () {
        if ($("#popupenjoyment").val() === "noresp" || $("#breakoutenjoyment").val() === "noresp") {
            $("#blankmessage").html("<strong>Please answer all questions before continuing.</strong>");
        } else {
            $("select").each(function () {
                psiTurk.recordUnstructuredData(this.id, this.value);
            });
            callback();
        }
    };


    psiTurk.showPage("endingquestions.html");
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
        nTrials = [36, 78, 78],
        // nTrials = [3, 3, 3],
        functionList = [];

    next = function () {
        functionList.shift()();
    };

    psiTurk.preloadPages(["stage.html",
                          "practice.html",
                          "restart.html",
                          "instructions/instruct-1-1.html",
                          "instructions/instruct-1-2.html",
                          "instructions/instruct-2-1.html",
                          "instructions/instruct-2-2.html",
                          "instructions/instruct-3-1.html",
                          "instructions/instruct-3-2.html",
                          "instructions/quiz-1.html",
                          "instructions/quiz-2.html",
                          "instructions/quiz-3.html",
                          "endingquestions.html",
                          "postquestionnaire.html"]);
    functionList = [
        function () {
            instructionDriver(["instructions/instruct-1-1.html", "instructions/instruct-1-2.html"],
                              "instructions/quiz-1.html", {mystery0: "50", range: "4_12", reset: "1_10"},
                              psiTurk, next); },
        function () {
            phaseDriver(nTrials[0], ExploreExploitTaskNoContext, StandardRewards, "nocontext", psiTurk, next); },
        function () {
            instructionDriver(["instructions/instruct-2-1.html", "instructions/instruct-2-2.html"],
                              "instructions/quiz-2.html", {contextmove: "clockwise", contextlink: "no", advancednum: "4"},
                              psiTurk, next); },
        function () {
            phaseDriver(nTrials[1], ExploreExploitTask, StandardRewards, "standard", psiTurk, next); },
        function () {
            instructionDriver(["instructions/instruct-3-1.html", "instructions/instruct-3-2.html"],
                              "instructions/quiz-3.html", {outcomelength: "36", penalty: "5percentage", gamename: "breakout"},
                              psiTurk, next); },
        function () {
            practiceConsumption(psiTurk, next); },
        function () {
            phaseDriver(nTrials[2], ExploreExploitTask, ConsumptionRewards, "consumption", psiTurk, next); },
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
