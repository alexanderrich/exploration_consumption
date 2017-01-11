/*
 * Requires:
 * phaser.js
 * jquery.js
 * underscore.js
 * d3.js
 */

/*jslint browser: true*/
/*global condition, uniqueId, adServerLoc, mode, document, PsiTurk, YT, $, _, d3, Phaser, window, setTimeout, clearTimeout, setInterval, clearInterval*/

condition = parseInt(condition);

var tag = document.createElement('script'),
    firstScriptTag = document.getElementsByTagName('script')[0],
    videoChoice;
tag.src = "https://www.youtube.com/iframe_api";
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function VideoPlayer() {
    "use strict";
    var player,
        startPlaying,
        stopPlaying,
        onVideo = false,
        playing = false,
        timeStamp,
        playTime,
        totalPlayTime = 0,
        totalPlayTimePossible = 0;
    player = new YT.Player('player', {
        height: '430',
        width: '700',
        playerVars: {'controls': 0,
                     'disablekb': 1,
                     'start': videoChoice.start},
        videoId: videoChoice.videoId
    });

    $(window).blur(function () {
        console.log("testing");
        if (onVideo && playing) {
            player.pauseVideo();
            playTime += (new Date().getTime()) - timeStamp;
            playing = false;
        }
    });

    $("body").keydown(function (e) {
        console.log("keyup");
        if(e.keyCode === 32 && onVideo && !playing) {
            player.playVideo();
            timeStamp = new Date().getTime()
            playing = true;
        } else if (e.keyCode === 32){
            return false;
        }
    });

    $("body").keyup(function (e) {
        if(e.keyCode === 32 && onVideo && playing) {
            player.pauseVideo();
            playTime += (new Date().getTime()) - timeStamp;
            playing = false;
        }
    });

    this.run = function () {
        $("#rewards").show();
        onVideo = true;
        playTime = 0;
        totalPlayTimePossible += 30000;
    };

    this.stop = function () {
        $("#rewards").hide();
        onVideo = false;
        player.pauseVideo();
        playTime += (new Date().getTime()) - timeStamp;
        totalPlayTime += playTime;
        playing = false;
    };

    this.getPlayTime = function () {
        return playTime;
    };

    this.pausePct = function () {
        return ((1 - (totalPlayTime / totalPlayTimePossible)) * 100) || 0;
    };

    this.practiceRun = function () {
        $("#rewards").show();
    };
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

    this.getMisses = function () {
        //return number of sliders missed (out of 5)
        return misses;
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
        var contextObj = contexts[context];
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
                                 trialChoice: trial + 4 * condition,
                                 trialOutcome: trial,
                                 uniqueid: uniqueId,
                                 condition: condition,
                                 context: context,
                                 response: choiceId === "explore" ? 1 : 0,
                                 rt: new Date().getTime() - timeStamp,
                                 currentValue: contextObj.value,
                                 nextValue: contextObj.nextValue,
                                 outcome: contextObj.outcome,
                                 reset: resetArray[trial + 4 * condition - firstMachineTrial]
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
                    $("#machinescreen").html("Machine succeeded!<br/>Press START to begin video.");
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
        if (trial > firstMachineTrial && resetArray[trial - firstMachineTrial - 1]) {
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
        for (i = 0; i < nChoices / 6; i++) {
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
    var video,
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
        var stat,
            missPct,
            pausePct;
        if (reward) {
            stat = video.getPlayTime();
            psiTurk.recordTrialData({phase: "EXPERIMENT",
                                     trialType: "consumption",
                                     trial: trialNum,
                                     uniqueid: uniqueId,
                                     condition: condition,
                                     outcome: reward,
                                     rewardProb: rewardProb,
                                     slidersMissed: -1,
                                     playTime: stat
                                    });
        } else {
            stat = sliderTask.getMisses();
            psiTurk.recordTrialData({phase: "EXPERIMENT",
                                     trialType: "consumption",
                                     trial: trialNum,
                                     uniqueid: uniqueId,
                                     condition: condition,
                                     outcome: reward,
                                     rewardProb: rewardProb,
                                     slidersMissed: stat,
                                     playTime: -1
                                    });
        }
        missPct = sliderTask.missPct();
        pausePct = video.pausePct();
        $("#sliderpct").html(missPct.toFixed());
        $("#pausepct").html(pausePct.toFixed());
        if (missPct > 10) {
            $("#sliderpctdiv").css("color", "red");
        } else {
            $("#sliderpctdiv").css("color", "black");
        }
        if (pausePct > 20) {
            $("#pausepctdiv").css("color", "red");
        } else {
            $("#pausepctdiv").css("color", "black");
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
            currentTask = video;
        } else {
            currentTask = sliderTask;
        }
        currentTask.run();
    };

    this.recordFinal = function(taskType) {
        psiTurk.recordUnstructuredData("misses_" + taskType, sliderTask.missPct().toString());
        psiTurk.recordUnstructuredData("pauses_" + taskType, video.pausePct().toString());
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
    video = new VideoPlayer();
    $("#time").html("0");
    $("#sliderpct").html("0");
    $("#pausepct").html("0");
}

function PracticeRewards (psiTurk, callback) {
    "use strict";
    var sliderTask,
        currentTask,
        video;

    this.setReward = function (rewardProb, reward, trial) {
        // $("#alternativecontents").show();
        $("#consumptionblocker").show();
        if (reward) {
            currentTask = video;
            $("#consumptionblocker").html("Youtube video");
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
    video = new VideoPlayer();
    $("#time").html("0");
    $("#sliderpct").html("0");
    $("#pausepct").html("0");
}

function practiceConsumption(psiTurk, callback) {
    "use strict";
    var examples = [0, 0, 0],
        trials = [-3, -2, -1],
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
            $("#rewardintrotext").html("Example outcome: Slider task");
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

function videoChoice(psiTurk, callback) {
    psiTurk.showPage("videopicker.html");
    $("#continue").click(function () {
        var choice = $("#videochoice").val();
        if (choice !== "noresp") {
            if (choice === "planetearth") {
                videoChoice = {videoId: "EqxaanDEAHw", start: 25};
            } else if (choice === "bakeoff") {
                videoChoice = {videoId: "TOKv4dG8nQs", start: 230};
            } else if (choice === "mythbusters"){
                videoChoice = {videoId: "0zTtuuNK2N4", start: 118};
            } else {
                videoChoice = {videoId: "_W9JZkHdCdA", start: 95};
            }
            psiTurk.recordUnstructuredData("videoChoice", choice);

            callback();
        }
    });
}

function transitionScreen(page, psiTurk, callback) {
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
        pausepct = Math.floor(psiTurk.getQuestionData().pauses_consumption),
        losses = 0,
        bonus;

    recordResponses = function () {
        if ($("#sliderenjoyment").val() === "noresp" || $("#videoenjoyment").val() === "noresp" || $("technicalissues").val() === "noresp") {
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
    $("#pausepct").html(pausepct);
    if (misspct > 10) {
        losses += (misspct - 10) * .1;
    }
    if (pausepct > 20) {
        losses += (pausepct - 20) * .1;
    }
    losses = Math.min(losses, 3);
    bonus = 3 - losses;
    $("#losses").html(losses.toFixed(2));
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
        nChoices = [18, 60],
        nPreWorkPeriods = [6, 10],
        // nPreWorkPeriods = [0, 0],
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
                          "videopicker.html",
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
            videoChoice(psiTurk, next);
        },
        function () {
            transitionScreen("transition_practicedecision.html", psiTurk, next);
        },
        function () {
            phaseDriver(nChoices[0], nPreWorkPeriods[0], ExploreExploitTask, PracticeRewards, "practice", psiTurk, next); },
        function () {
            transitionScreen("transition_practiceconsumption.html", psiTurk, next);
        },
        function () {
            practiceConsumption(psiTurk, next); },
        function () {
            transitionScreen("transition_fulltask.html", psiTurk, next);
        },
        function () {
            phaseDriver(nChoices[1], nPreWorkPeriods[1], ExploreExploitTask, ConsumptionRewards, "consumption", psiTurk, next); },
        function () {
            endingQuestions(psiTurk, next); },
        function () {
            questionnaire(psiTurk); }];
    next();
}


function onYouTubeIframeAPIReady() {
    $(window).load(function () {
        "use strict";
        experimentDriver();
    });
}
