/*
 * Requires:
 * phaser.js
 * jquery.js
 * underscore.js
 * d3.js
 */

/*jslint browser: true*/
/*global condition, uniqueId, adServerLoc, mode, document, PsiTurk, $, _, d3, Phaser, window, setTimeout, clearTimeout, setInterval, clearInterval*/

condition = parseInt(condition);

function Game() {
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
        messageTimeout,
        messageText,
        pointsText,
        lastRunPoints = 0,
        lastRunBricks = 0,
        lastRunDeaths = 0;

    preload = function () {
        var graphicBase;
        game.load.image('starfield', 'static/images/starfield.jpg');
        graphicBase = game.add.graphics(0, 0);
        graphicBase.beginFill(0xff0000);
        graphicBase.lineStyle(1, 0x000000, 1);
        graphicBase.drawRect(0, 0, 40, 16);
        graphicBase.endFill();
        brickTexture = graphicBase.generateTexture();
        graphicBase.destroy();
        graphicBase = game.add.graphics(0, 0);
        graphicBase.beginFill(0x00bb00);
        graphicBase.lineStyle(1, 0x000000, 1);
        graphicBase.drawRect(0, 0, 40, 16);
        graphicBase.endFill();
        bonusTexture = graphicBase.generateTexture();
        graphicBase.destroy();
        graphicBase = game.add.graphics(0, 0);
        graphicBase.beginFill(0x0058ff);
        graphicBase.drawRect(0, 0, 60, 10);
        graphicBase.endFill();
        paddleTexture = graphicBase.generateTexture();
        graphicBase.destroy();
        graphicBase = game.add.graphics(0, 0);
        graphicBase.beginFill(0xffa500);
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
        game.add.tileSprite(0, 0, 800, 600, 'starfield');
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
        paddle = game.add.sprite(game.world.centerX, game.world.height - 25, paddleTexture);
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
        messageText = game.add.text(275, 180, "", {font: "30px Arial", fill: "white"});
        pointsText = game.add.text(15, 15, "Points: 0", {font: "20px Arial", fill: "white"});
        messageText.alpha = 0;
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
                clearTimeout(messageTimeout);
                messageText.alpha = 1;
                messageText.text = speed.toString() + "x points";
                messageTimeout = setTimeout(function () {messageText.alpha = 0; }, 1000);
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
                clearTimeout(messageTimeout);
                messageText.alpha = 1;
                messageText.text = speed.toString() + "x points";
                messageTimeout = setTimeout(function () {messageText.alpha = 0; }, 1000);
            }
        });
        $("#multiplierbar :first-child").css("width", (speed/8*100).toFixed() + "%");
        $("#multiplierbar :first-child").html(speed.toString() +  "x");
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
        lastRunDeaths++;
        setTimeout(function () {
            ballOnPaddle = true;
            ball.reset(paddle.body.x + 20, paddle.y - 16);
            game.time.events.add(1000, releaseBall, this);
        }, 1000);
    };

    startLevel = function () {
        var x, y;
        //  Let's move the ball back to the paddle
        ballOnPaddle = true;
        ball.body.velocity.set(0);
        game.time.events.add(1000, releaseBall, this);
        ball.x = paddle.x + 16;
        ball.y = paddle.y - 16;
        clearTimeout(messageTimeout);
        messageText.alpha = 1;
        messageText.text = "Level " + (level + 1);
        messageTimeout = setTimeout(function () {messageText.alpha = 0; }, 1000);
        switch (level % 10) {
        case 0:
            for (y = 0; y < 10; y++) {
                for (x = 0; x < 14; x++) {
                    if (y % 2 && y < 8 && x > 0 && x < 13) {
                        bricks.getChildAt(y * 14 + x).revive();
                    }
                }
            }
            break;
        case 1:
            for (y = 0; y < 10; y++) {
                for (x = 0; x < 14; x++) {
                    if (y < 2 || y > 7) {
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
        pointsText.text = "Points: " + points;
        //  Are they any bricks left?
        if (bricks.countLiving() === 0) {
            startLevel();
        } else if (!stopBonuses && Math.random() > .9) {
            bonus = bonuses.create(_brick.x, _brick.y, bonusTexture);
            bonus.body.velocity.y = 150;
            bonus.checkWorldBounds = true;
            bonus.outOfBoundsKill = true;
            bonus.addChild(game.add.text(7, 0, "+15", {font: "15px Arial", fill: "#000000"}));
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
        pointsText.text = "Points: " + points;
    };

    this.practiceRun = function () {
        if (bricks.countLiving() === 0) {
            startLevel();
        }
        ballOnPaddle = true;
        ball.reset(paddle.body.x + 26, paddle.y - 16);
        $("#rewards").show();
    };

    this.run = function () {
        if (bricks.countLiving() === 0) {
            startLevel();
        }
        $("#rewards").show();
        lastRunPoints = 0;
        lastRunBricks = 0;
        lastRunDeaths = 0;
        stopBonuses = false;
        game.paused = false;
        ballOnPaddle = true;
        ball.reset(paddle.body.x + 26, paddle.y - 16);
        game.time.events.add(1000, releaseBall, this);
    };

    this.stop = function () {
        $("#rewards").hide();
        game.paused = true;
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

    game = new Phaser.Game(700, 500, Phaser.AUTO, "gamediv", {preload: preload, create: create, update: update});
}

function SliderTask() {
    "use strict";
    var misses,
        totalMisses = 0,
        total = 0;

    $(".sliderdiv").each(function () {
        var div = $(this);
        div.children(".slider").on("input", function () {
            div.children(".sliderlabel").html($(this).val());
            if($(this).val() !== "50") {
                div.css("background-color", "");
            }
        });
        div.children(".slider").on("change", function () {
            if($(this).val() === "50") {
                div.css("background-color", "#98ff98");
            }
        });
    });

    this.practiceRun = function () {
        $("#sliders").show();
        $(".sliderdiv").each(function () {
            var div = $(this),
                initial = Math.floor(Math.random() * 101);
            if(initial === 50) {
                initial++;
            }
            div.css("padding-left", (200*Math.random()).toString() + "px");
            div.children(".slider").val(initial);
        });
        $(".slider").trigger("input");
        $(".sliderdiv").css("background-color", "gray");
        $(".slider").prop("disabled", true);
        // $("#slider1").prop("disabled", false);
        $("#sliderdiv1").css("background-color", "");
    };

    this.run = function () {
        $("#sliders").show();
        $(".sliderdiv").each(function () {
            var div = $(this),
                initial = Math.floor(Math.random() * 101);
            if(initial === 50) {
                initial++;
            }
            div.css("padding-left", (200*Math.random()).toString() + "px");
            div.children(".slider").val(initial);
        });
        $(".slider").trigger("input");
        $(".sliderdiv").css("background-color", "gray");
        $(".slider").prop("disabled", true);
        $("#slider1").prop("disabled", false);
        $("#sliderdiv1").css("background-color", "");
        setTimeout(function () {
            $("#slider2").prop("disabled", false);
            $("#sliderdiv2").css("background-color", "");
        }, 5000);
        setTimeout(function () {
            $("#slider3").prop("disabled", false);
            $("#sliderdiv3").css("background-color", "");
        }, 10000);
        setTimeout(function () {
            $("#slider4").prop("disabled", false);
            $("#sliderdiv4").css("background-color", "");
        }, 15000);
        setTimeout(function () {
            $("#slider5").prop("disabled", false);
            $("#sliderdiv5").css("background-color", "");
        }, 20000);
    };

    this.getStats = function () {
        //return number of sliders missed (out of 5)
        return { slidersMissed: misses };
    };

    this.missPct = function () {
        return totalMisses / total * 100 || 0;
    };

    this.stop = function () {
        misses = $(".slider").map(function () {
            return this.value;
        }).get().map(function (x) {
            return x !== "50" ? 1 : 0;
        }).reduce(function(a, b) {return a + b; }, 0);
        totalMisses += misses;
        total += 5;
        $("#sliders").hide();
    };
}

function ExploreExploitTask(nChoices, nPreWorkPeriods, taskType, psiTurk, callback) {
    "use strict";
    var responseFn,
        contexts,
        locations,
        resetArray,
        i,
        trial = -1,
        firstMachineTrial = nPreWorkPeriods,
        nTrials = nChoices + nPreWorkPeriods,
        choiceNumber = -1,
        functionList = [],
        runChoice,
        maze = d3.select("#maze").append("g"),
        tau = 2 * Math.PI,
        arc = d3.arc().innerRadius(0).outerRadius(70).startAngle(0),
        contextGroups,
        contextMarker,
        updateMachine,
        spinMachine,
        upgradeMachine,
        preMachineWork,
        enterContext,
        resetContext,
        incrementContexts,
        timeStamp,
        showOutcome;

    updateMachine = function (exploitVal, exploreVal, context) {
        var widthpct,
            exploitSvgGroup = d3.select("#exploitcirclegroup" + context),
            exploreSvgGroup = d3.select("#explorecirclegroup" + context);
        d3.selectAll(".exploitgroupouter").style("opacity", 0);
        d3.select("#exploitgroupouter" + context).style("opacity", 1);
        d3.selectAll(".exploregroupouter").style("opacity", 0);
        d3.select("#exploregroupouter" + context).style("opacity", 1);
        exploitSvgGroup.attr("transform", "translate(75, 75)");
        exploreSvgGroup.attr("transform", "translate(75, 75)");
        exploitSvgGroup.select(".winningArc")
            .datum({endAngle: exploitVal * tau})
            .attr("d", arc);
        if (exploreVal === "?") {
            exploreSvgGroup.select("#questionMark")
                .style("opacity", 1);
            exploreSvgGroup.select(".winningArc")
                .style("opacity", 0);
            exploreSvgGroup.select("#losingLine")
                .style("opacity", 0);
        } else {
            exploreSvgGroup.select("#questionMark")
                .style("opacity", 0);
            if (exploreVal > 0) {
                exploreSvgGroup.select(".winningArc")
                    .style("opacity", 1);
                exploreSvgGroup.select(".winningArc")
                    .datum({endAngle: exploreVal * tau})
                    .attr("d", arc);
            } else {
                exploreSvgGroup.select("#losingLine")
                    .style("opacity", 1);
            }
        }
    };

    spinMachine = function (choiceId, choiceVal, outcome, context) {
        var group,
            r,
            exploitSvgGroup = d3.select("#exploitcirclegroup" + context),
            exploreSvgGroup = d3.select("#explorecirclegroup" + context);
        if (choiceId === "explore") {
            group = exploreSvgGroup;
        } else {
            group = exploitSvgGroup;
        }
        if (outcome) {
            r = 1440 - 360 * choiceVal * (.02 + .98 * Math.random());
        } else {
            r = 1440 - 360 * (choiceVal + (1 - choiceVal) * (.02 + .98 * Math.random()));
        }
        group.transition()
            .duration(2000)
            .attrTween("transform", function() {
                var intrp = d3.interpolate(0, r);
                return function (t){
                    return "translate(75, 75) rotate(" + intrp(t) + ")";
                };
            });
    };

    upgradeMachine = function (newVal, context) {
        var exploitSvgGroup = d3.select("#exploitcirclegroup" + context),
            arcTween = function (newAngle) {
            return function(d) {
                var interpolate = d3.interpolate(d.endAngle, newAngle);
                return function(t) {
                    d.endAngle = interpolate(t);
                    return arc(d);
                };
            };
        };
        exploitSvgGroup.select(".winningArc")
            .transition()
            .duration(1000)
            .attrTween("d", arcTween(newVal * tau));
    };

    responseFn = function (choiceId, context) {
        var contextObj = contexts[context],
            advanced = condition === 1;
        $("#" + choiceId).addClass("clicked");
        $("#machinescreen").html("processing...");
        if (condition) {
            $("#idlerect").css("fill", "#CCCCFF");
            $("#idletext").html("processing");
        }
        if (choiceId === "exploit") {
            contextObj.nextChoice = "exploit";
            contextObj.nextValue = contextObj.value;
            $("#exploitgroupinner" + context + " .spinnerbacking").css("opacity", 1);
        } else {
            $("#exploregroupinner" + context + " .spinnerbacking").css("opacity", 1);
            contextObj.nextChoice = "explore";
            if (Math.random() > .333) {
                contextObj.nextValue = .333 + .667 * Math.random();
            } else {
                contextObj.nextValue = 0;
            }
        }
        contextObj.outcome = Math.random() < contextObj.nextValue;
        $(".choicebutton").off("click");
        psiTurk.recordTrialData({phase: "EXPERIMENT",
                                 trialType: "exploreexploit",
                                 taskType: taskType,
                                 trialChoice: trial + 4 * advanced,
                                 trialOutcome: choiceNumber,
                                 uniqueid: uniqueId,
                                 condition: condition,
                                 context: context,
                                 response: choiceId === "explore" ? 1 : 0,
                                 advanced: advanced,
                                 rt: new Date().getTime() - timeStamp,
                                 currentValue: contextObj.value,
                                 nextValue: contextObj.nextValue,
                                 outcome: contextObj.outcome
                                });
        setTimeout(functionList.pop(), 1000);
    };

    enterContext = function (context) {
        var contextObj = contexts[context];
        $("#exploreexploitdiv").hide();
        $("#alternativecontents").show();
        $("#alternativecontents").html("Click circled machine");
        $("#context" + context).css("opacity", 1);
        contextGroups.transition()
            .duration(1500)
            .attr("transform", function(d) {
                return "translate(" + locations[d.loc][0] +
                    "," + locations[d.loc][1] + ")";
            });
        contextMarker.transition()
            .duration(1500)
            .attr("cx", locations[contextObj.loc][0])
            .attr("cy", locations[contextObj.loc][1]);
        $("#contextmarker, #context" + context).click(function () {
            $("#contextmarker, #context" + context).off("click");
            $("#alternativecontents").hide();
            $("#exploreexploitdiv").show();
            functionList.pop()();
        });
    };

    runChoice = function (context) {
        $("#alternativecontents").hide();
        $(".machinebutton").removeClass("clicked");
        $("#start").prop("disabled", true);
        $("#machinescreen").html("Select setting.");
        $("#machineid").html(context + 1);
        updateMachine(contexts[context].value, "?", context);
        $("#exploreexploit").show();
        timeStamp = new Date().getTime();
        choiceNumber++;
        $(".choicebutton").click(function () {responseFn(this.id, context); });
    };

    showOutcome = function (context) {
        var contextObj = contexts[context];
        updateMachine(contextObj.value, "?", context);
        $("#machineid").html(context + 1);
        $(".choicebutton").removeClass("clicked");
        $("#" + contextObj.nextChoice).addClass("clicked");
        $("#machinescreen").html("processing...");
        $("#alternativecontents").hide();
        $("#exploreexploitdiv").show();
        setTimeout(function () {
            var extraTime = 0;
            if (contextObj.nextChoice === "explore") {
                extraTime = 1500;
                updateMachine(contextObj.value, contextObj.nextValue, context);
                if (contextObj.nextValue > contextObj.value) {
                    $("#machinescreen").html("new setting saved!");
                    contextObj.value = contextObj.nextValue;
                    upgradeMachine(contextObj.value, context);
                } else {
                    $("#machinescreen").html("new setting not saved");
                }
            }
            setTimeout(function () {
                $("#machinescreen").html("running...");
                spinMachine(contextObj.nextChoice, contextObj.nextValue, contextObj.outcome, context);
            }, extraTime);
            setTimeout(function () {
                if (contextObj.outcome) {
                    $("#machinescreen").html("Machine succeeded!<br/>Press START to begin game.");
                } else {
                    $("#machinescreen").html("Machine failed.<br/>Press START to begin task.");
                }
                $("#start").prop("disabled", false);
                $("#start").click(function () {
                    $("#start").off("click");
                    $("#exploreexploitdiv").hide();
                    $("#mazediv").hide();
                    $("#bottominfodiv").hide();
                    $(".choicebutton").removeClass("clicked");
                    $("#exploitgroupinner" + context + " .spinnerbacking").css("opacity", 0);
                    $("#exploregroupinner" + context + " .spinnerbacking").css("opacity", 0);
                    updateMachine(contextObj.value, "?", context);
                    callback(contextObj.nextValue, contextObj.outcome, trial);
                });
            }, 2000 + extraTime);
        }, 500);
    };

    resetContext = function (context) {
        var contextObj = contexts[context];
        contextObj.value = .333 + .333 * Math.random();
        $("#machinescreen").html("Machine<br/>RESET");
        $("#start").prop("disabled", true);
        updateMachine(0, "?", context);
        setTimeout(function () {
            upgradeMachine(contextObj.value, context);
        }, 1000);
        $("#alternativecontents").hide();
        $("#exploreexploitdiv").show();
        setTimeout(functionList.pop(), 4000);
    };

    incrementContexts = function () {
        contexts = contexts.map(function (obj) {
            obj.loc = (obj.loc + 5) % 6;
            return obj;
        });
        functionList.pop()();
    };

    preMachineWork = function () {
        $("#exploreexploitdiv").hide();
        $("#alternativecontents").show();
        $("#alternativecontents").html("Press START to begin task.<br/><button id=\"alternativestart\" class=\"machinebutton\"> START </button>");
        $("#alternativestart").click(function () {$("#alternativecontents").hide();
                                                  $("#mazediv").hide();
                                                  $("#bottominfodiv").hide();
                                                  callback(0, 0, trial); });
    };

    this.run = function() {
        trial++;
        $("#idlerect").css("fill", "white");
        $("#idletext").html("idle");
        $("#mazediv").show();
        $("#bottominfodiv").show();

        if (trial + 4 * condition < firstMachineTrial) {
            $("#trialsuntilmachines").html(firstMachineTrial - 4*condition - trial);
        } else if (trial + 4 * condition === firstMachineTrial) {
            $("#mazeblocker").hide();
        }

        if (trial < firstMachineTrial && condition === 1 && trial + 4 >= firstMachineTrial) {
            functionList = [function () {preMachineWork(); },
                            function () {incrementContexts(); },
                            function () {runChoice((trial + 4) % 6); },
                            function () {enterContext((trial + 4) % 6); }];
        } else if (trial < firstMachineTrial) {
            functionList = [function () {preMachineWork(); }];
        } else if (condition === 0) {
            functionList = [
                function () {showOutcome(trial % 6); },
                function () {incrementContexts(); },
                function () {runChoice(trial % 6); },
                function () {enterContext(trial % 6); },
            ];
        } else if (condition === 1 && trial < nTrials - 4){
            functionList = [
                function () {showOutcome(trial % 6); },
                function () {incrementContexts(); },
                function () {enterContext(trial % 6); },
                function () {runChoice((trial + 4) % 6); },
                function () {enterContext((trial + 4) % 6); },
            ];
        } else {
            functionList = [
                function () {showOutcome(trial % 6); },
                function () {incrementContexts(); },
                function () {enterContext(trial % 6); },
            ];
        }
        if (trial > firstMachineTrial && resetArray[trial - 1]) {
            functionList.push(function () {resetContext((trial - 1) % 6); });
        }

        functionList.pop()();
        $("#inforeminder").hide();
    };

    $("#inforeminderbutton").click(function () {$("#inforeminder").toggle(400); });
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
    locations = _.range(6).map(function (i) {
        return [100 + 200 * ((2.5-Math.abs(i - 2.5)) % 3), 75 + 150 * Math.floor(i/3)];
    });
    contexts = [{}, {}, {}, {}, {}, {}];
    contexts = _.shuffle(contexts);
    contexts = contexts.map(function (obj, i) {
        obj.value = .333 + .333 * Math.random();
        obj.nextValue = 0;
        obj.loc = (i + 6 - firstMachineTrial % 6) % 6;
        return obj;
    });

    function arcTween (newAngle) {
        return function (d) {
            var interpolate = d3.interpolate(d.endAngle, newAngle);
            return function (t) {
                d.endAngle = interpolate(t);
                return arc(d);
            };
        };
    }

    _.range(contexts.length).map(function (x) {
        var entiregroup,
            circlegroup;
        entiregroup = d3.select("#exploitsvg")
            .append("g")
            .attr("class", "exploitgroupouter")
            .attr("id", "exploitgroupouter" + x)
            .append("g")
            .attr("class", "exploitgroupinner")
            .attr("id", "exploitgroupinner" + x);
        entiregroup.append("rect")
            .attr("class", "spinnerbacking")
            .attr("width",  150)
            .attr("height", 150)
            .style("opacity", 0)
            .style("fill", "#444444");
        circlegroup = entiregroup.append("g")
            .attr("class", "exploitcirclegroup")
            .attr("id", "exploitcirclegroup" + x)
            .attr("transform", "translate(75, 75)");
        circlegroup.append("path")
            .datum({endAngle: tau})
            .style("fill", "#222222")
            .attr("d", arc);
        circlegroup.append("path")
            .datum({endAngle: 0.127 * tau})
            .attr("class", "winningArc")
            .style("fill", "orange")
            .attr("d", arc);
        entiregroup.append("polygon")
            .attr("points", "65 0, 85 0, 75 20")
            .style("fill", "black")
            .style("stroke", "gray")
            .style("stroke-width", 2);
        entiregroup = d3.select("#exploresvg")
            .append("g")
            .attr("class", "exploregroupouter")
            .attr("id", "exploregroupouter" + x)
            .append("g")
            .attr("class", "exploregroupinner")
            .attr("id", "exploregroupinner" + x);
        entiregroup.append("rect")
            .attr("class", "spinnerbacking")
            .attr("width",  150)
            .attr("height", 150)
            .style("opacity", 0)
            .style("fill", "#444444");
        circlegroup = entiregroup.append("g")
            .attr("class", "explorecirclegroup")
            .attr("id", "explorecirclegroup" + x)
            .attr("transform", "translate(75, 75)");
        circlegroup.append("path")
            .datum({endAngle: tau})
            .style("fill", "#222222")
            .attr("d", arc);
        circlegroup.append("path")
            .datum({endAngle: 0 * tau})
            .attr("class", "winningArc")
            .style("fill", "orange")
            .attr("d", arc);
        circlegroup.append("line")
            .attr("id", "losingLine")
            .attr("y2", -70)
            .style("stroke-width", 1)
            .style("stroke", "orange");
        circlegroup.append("text")
            .attr("id", "questionMark")
            .text("?")
            .attr("text-anchor", "middle")
            .attr("y", "10px")
            .style("font-family", "sans-serif")
            .style("font-size", "30px")
            .style("fill", "lightgray");
        entiregroup.append("polygon")
            .attr("points", "65 0, 85 0, 75 20")
            .style("fill", "black")
            .style("stroke", "gray")
            .style("stroke-width", 2);
    });

    maze.append("rect")
        .attr("x", 3)
        .attr("y", 3)
        .attr("width", 594)
        .attr("height", 294)
        .style("fill", condition ? "#CCCCFF" : "#FFCCCC")
        .style("stroke-width", "3")
        .style("stroke", "black");
    maze.append("rect")
        .attr("id", "idlerect")
        .attr("x", 3)
        .attr("y", 3)
        .attr("width", 200)
        .attr("height", 150)
        .style("fill", "white")
        .style("stroke-width", "3")
        .style("stroke", "black");
    if (condition) {
        maze.append("rect")
            .attr("x", 200)
            .attr("y", 3)
            .attr("width", 200)
            .attr("height", 150)
            .style("fill", "#FFCCCC")
            .style("stroke-width", "3")
            .style("stroke", "black");
        maze.append("rect")
            .attr("x", 397)
            .attr("y", 3)
            .attr("width", 200)
            .attr("height", 150)
            .style("fill", "white")
            .style("stroke-width", "3")
            .style("stroke", "black");
        maze.append("text")
            .attr("x", 404)
            .attr("y", 24)
            .style("font-size", "20px")
            .text("ready");
        maze.append("text")
            .attr("x", 10)
            .attr("y", 174)
            .style("font-size", "20px")
            .text("processing");
    }
    maze.append("text")
        .attr("id", "idletext")
        .attr("x", 10)
        .attr("y", 24)
        .style("font-size", "20px")
        .text("idle");
    maze.append("text")
        .attr("x", condition ? 207 : 10)
        .attr("y", condition ? 24 : 174)
        .style("font-size", "20px")
        .text("cooling");
    contextMarker = maze.append("circle")
        .attr("id", "contextmarker")
        .attr("r", "70")
        .attr("cx", locations[0][0])
        .attr("cy", locations[0][1])
        .style("fill", "black")
        .style("fill-opacity", .15)
        .style("stroke", "black")
        .style("stroke-width", 1);

    contextGroups = maze.selectAll(".context")
        .data(contexts)
        .enter()
        .append("g")
        .attr("class", "context")
        .attr("transform", function(d) {
            return "translate(" + locations[d.loc][0] +
                "," + locations[d.loc][1] + ")";
        })
        .attr("id", function (d, idx) {
            return "context" + idx;
        })
        .style("opacity", 0);
    contextGroups.append("rect")
        .attr("class", "contextbox")
        .attr("width", 120)
        .attr("height", 70)
        .attr("x", -60)
        .attr("y", -35)
        .attr("rx", 5)
        .attr("ry", 5)
        .style("fill", "gray")
        .style("stroke", "black")
        .style("stroke-width", 1);
    contextGroups.append("use")
        .attr("transform", "translate(-55, -25) scale(.35, .35)")
        .attr("xlink:href", function (d, e) {
            return "#exploitgroupinner" + e;
        });
    contextGroups.append("use")
        .attr("transform", "translate(0, -25) scale(.35, .35)")
        .attr("xlink:href", function (d, e) {
            return "#exploregroupinner" + e;
        });
    contextGroups.append("text")
        .text(function(d, e) { return e + 1; })
        .style("font-size", "16px")
        .style("font-family", "monospace")
        .attr("x", 45)
        .attr("y", -20);
    _.range(contexts.length).map(function (x) {
        updateMachine(contexts[x].value, "?", x);
    });
}

function ConsumptionRewards(psiTurk, callback) {
    "use strict";
    var game,
        trialNum,
        rewardProb,
        reward,
        sliderTask,
        currentTask,
        totalTime = 30,
        timeLeft,
        decrementTime,
        recordData,
        timeInterval;

    recordData = function () {
        var data,
            missPct;
        if (reward) {
            data = game.getStats();
            psiTurk.recordTrialData({phase: "EXPERIMENT",
                                     trialType: "consumption",
                                     trial: trialNum,
                                     uniqueid: uniqueId,
                                     condition: condition,
                                     outcome: reward,
                                     rewardProb: rewardProb,
                                     points: data.points,
                                     lastRunPoints: data.lastRunPoints,
                                     lastRunBricks: data.lastRunBricks,
                                     endingSpeed: data.endingSpeed,
                                     level: data.level,
                                     bricksLeft: data.bricksLeft,
                                     deaths: data.deaths,
                                     slidersMissed: -1
                                    });
        } else {
            data = sliderTask.getStats();
            psiTurk.recordTrialData({phase: "EXPERIMENT",
                                     trialType: "consumption",
                                     trial: trialNum,
                                     uniqueid: uniqueId,
                                     condition: condition,
                                     outcome: reward,
                                     rewardProb: rewardProb,
                                     points: -1,
                                     lastRunPoints: -1,
                                     lastRunBricks: -1,
                                     endingSpeed: -1,
                                     level: -1,
                                     bricksLeft: -1,
                                     deaths: -1,
                                     slidersMissed: data.slidersMissed
                                    });
        }
        missPct = sliderTask.missPct();
        $("#sliderpct").html(missPct.toFixed());
        if (missPct > 10) {
            $("#sliderpctdiv").css("color", "red");
        } else {
            $("#sliderpctdiv").css("color", "black");
        }
        callback();
    };

    this.setReward = function(_rewardProb, _reward, trial) {
        reward = _reward;
        rewardProb = _rewardProb;
        trialNum = trial;
        $("#time").html(30);
        timeLeft = 30;
        timeInterval = setInterval(decrementTime, 1000);
        if (reward) {
            currentTask = game;
        } else {
            currentTask = sliderTask;
        }
        currentTask.run();
    };

    this.recordFinal = function(taskType) {
        psiTurk.recordUnstructuredData("points_" + taskType, game.getStats().points.toString());
        psiTurk.recordUnstructuredData("misses_" + taskType, sliderTask.missPct().toString());
    };

    decrementTime = function () {
        timeLeft--;
        if (timeLeft >= 0) {
            $("#time").html(timeLeft);
        }
        if (timeLeft === 0) {
            currentTask.stop();
            clearInterval(timeInterval);
            recordData();
        }
    };

    sliderTask = new SliderTask();
    game = new Game();
    $("#time").html("0");
    $("#sliderpct").html("0");
}

function PracticeRewards (psiTurk, callback) {
    "use strict";
    var sliderTask,
        currentTask,
        game;

    this.setReward = function (rewardProb, reward, trial) {
        // $("#alternativecontents").show();
        $("#consumptionblocker").show();
        if (reward) {
            currentTask = game;
            $("#consumptionblocker").html("Brickbreak game");
        } else {
            currentTask = sliderTask;
            $("#consumptionblocker").html("Slider task");
        }

        currentTask.practiceRun();
        setTimeout(function () {
            currentTask.stop();
            $("#consumptionblocker").hide();
            callback();
        }, 2000);
    };

    this.recordFinal = function(taskType) {
        return;
    };

    sliderTask = new SliderTask();
    game = new Game();
    $("#time").html("0");
    $("#sliderpct").html("0");
}

function practiceConsumption(psiTurk, callback) {
    "use strict";
    var examples = [0, 0, 0, 1],
        trials = [-4, -3, -2, -1],
        rewards,
        next;

    next = function () {
        if (examples.length === 0) {
            callback();
        } else {
            var reward = examples.shift();
            $("#rewards").hide();
            $("#sliders").hide();
            $("#rewardintro").show();
            if (reward) {
                $("#rewardintrotext").html("Example outcome: Brickbreak game");
            } else {
                $("#rewardintrotext").html("Example outcome: Slider task");
            }
            $("#continue").off("click");
            $("#continue").click(
                function () {
                    $("#rewardintro").hide();
                    rewards.setReward(.5, reward, trials.shift());
                }
            );
        }
    };

    psiTurk.showPage("practice.html");
    $("#rewards").hide();
    $("#sliders").hide();
    rewards = new ConsumptionRewards(psiTurk, next);
    next();
}

function TransitionScreen(page, psiTurk, callback) {
    psiTurk.showPage(page);
    $("#continue").click(callback);
}

function phaseDriver(nChoices, nPreWorkPeriods, ExploreFn, RewardFn, taskType, psiTurk, callback) {
    "use strict";
    var exploreExploit,
        rewards,
        nextChoice,
        nTrials = nChoices + nPreWorkPeriods,
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
    $("#sliders").hide();

    rewards = new RewardFn(psiTurk, nextChoice);
    exploreExploit = new ExploreFn(nChoices, nPreWorkPeriods, taskType, psiTurk, rewards.setReward);
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
        if ($("#sliderenjoyment").val() === "noresp" || $("#brickbreakenjoyment").val() === "noresp") {
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
    psiTurk.recordUnstructuredData("condition", condition);
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
        $("input").each(function () {
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
        nChoices = [12, 60],
        nPreWorkPeriods = [2 + 4 * condition, 10],
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
                               "instructions/instruct_7.html"],
                              "instructions/quiz.html",
                              {new0: "third",
                               range: "onethird_all",
                               reset: "1_6",
                               processnum: "4",
                               penalty: "10percentage"},
                              psiTurk, next); },
        function () {
            TransitionScreen("transition_practicedecision.html", psiTurk, next);
        },
        function () {
            phaseDriver(nChoices[0], nPreWorkPeriods[0], ExploreExploitTask, PracticeRewards, "practice", psiTurk, next); },
        function () {
            TransitionScreen("transition_practiceconsumption.html", psiTurk, next);
        },
        function () {
            practiceConsumption(psiTurk, next); },
        function () {
            TransitionScreen("transition_fulltask.html", psiTurk, next);
        },
        function () {
            phaseDriver(nChoices[1], nPreWorkPeriods[1], ExploreExploitTask, ConsumptionRewards, "consumption", psiTurk, next); },
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
