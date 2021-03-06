/*
 * Requires:
 * jquery.js
 * underscore.js
 * d3.js
 */

/*jslint browser: true*/
/*global condition, counterbalance, uniqueId, adServerLoc, mode, document, PsiTurk, $, _, d3, window, setTimeout, clearTimeout, setInterval, clearInterval, Audio*/

condition = parseInt(condition);
counterbalance = parseInt(counterbalance);

var videoInfo = [
    {id: 'planetearth',
     start: 25,
     volume: .2},
    {id: 'bakeoff',
     start: 48,
     volume: .4},
    {id: 'unchainedreaction',
     start: 104,
     volume: .8},
    {id: 'ellen',
     start: 95,
     volume: .65}
];

function VideoPlayer() {
    "use strict";
    var players = [],
        player,
        i,
        chosenPlayer = Math.floor(Math.random()*4),
        switches = 0,
        times = [0,0,0,0],
        switchTime;

    for(i = 0; i < videoInfo.length; i++){
        player = document.getElementById(videoInfo[i].id);
        player.addEventListener("loadedmetadata",(function (j) {
            return function() {
                if (this.hassettime === undefined) {
                    this.currentTime = videoInfo[j].start;
                    this.volume = videoInfo[j].volume;
                    this.hassettime = true;
                }
            };
        })(i));
        $('#'+videoInfo[i].id+'tab').click((function (j) {
            return function () {
                if (chosenPlayer !== j) {
                    var oldTime = switchTime;
                    $('.tab').css('background-color', '');
                    $(this).css('background-color', 'DeepSkyBlue');
                    players[chosenPlayer].pause();
                    $(players[chosenPlayer]).hide();
                    chosenPlayer = j;
                    $(players[chosenPlayer]).show();
                    players[chosenPlayer].play();
                    switches += 1;
                    switchTime = new Date().getTime();
                    times[j] = times[j] + switchTime - oldTime;
                }
            };
        })(i));
        $(player).hide();
        players.push(player);
    }
    $("#" + videoInfo[chosenPlayer].id + 'tab').css('background-color', 'DeepSkyBlue');
    $(players[chosenPlayer]).show();


    this.run = function () {
        $("#rewards").show();
        players[chosenPlayer].play();
        switches = 0;
        times = [0, 0, 0, 0];
        switchTime = new Date().getTime();
    };

    this.stop = function () {
        var oldTime = switchTime;
        switchTime = new Date().getTime();
        times[chosenPlayer] = times[chosenPlayer] + (switchTime - oldTime);
        $("#rewards").hide();
        players[chosenPlayer].pause();
    };

    this.getData = function () {
        return {'switches': switches,
                'planetearth': times[0],
                'bakeoff': times[1],
                'unchainedreaction': times[2],
                'ellen': times[3]};
    };

    this.practiceRun = function () {
        $("#rewards").show();
    };
}

function SliderTask() {
    "use strict";
    var misses,
        noiseInterval,
        noiseFn,
        noise = new Audio("/static/audio/annoyingnoise.wav"),
        totalMisses = 0,
        total = 0;

    noise.volume = .8;

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

    noiseFn = function () {
        if (Math.random() < .667) {
            noise.play();
        }
    };

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
        setTimeout(function () {
            noiseFn();
            noiseInterval = setInterval(noiseFn, 2000);
        }, 1000);
    };

    this.getMisses = function () {
        //return number of sliders missed (out of 5)
        return misses;
    };

    this.missPct = function () {
        return totalMisses / total * 100 || 0;
    };

    this.stop = function () {
        clearInterval(noiseInterval);
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
        resetArray,
        resetValues,
        i,
        trial = -1,
        choiceNum = -1,
        delayLength = 8 * condition,
        nTrials = nChoices + nPreWorkPeriods,
        functionList = [],
        runChoice,
        tau = 2 * Math.PI,
        arc = d3.arc().innerRadius(0).outerRadius(85).startAngle(0),
        updateMachine,
        spinMachine,
        upgradeMachine,
        resetMachine,
        pickNewSpinner,
        setOutcome,
        updateQueue,
        shiftQueue,
        getWorkQueueData,
        startOutcome,
        timeStamp,
        wedges = 5,
        value,
        outcome = 0,
        visibleQueueLength = 9,
        consumptionQueue = _.range(nTrials).fill("?"),
        queueIdx = 0;

    consumptionQueue.fill("slider", 0, nPreWorkPeriods);

    updateMachine = function (exploitVal, exploreVal) {
        var widthpct,
            exploitSvgGroup = d3.select("#exploitcirclegroup"),
            exploreSvgGroup = d3.select("#explorecirclegroup");
        exploitSvgGroup.attr("transform", "translate(90, 90)");
        exploreSvgGroup.attr("transform", "translate(90, 90)");
        exploitSvgGroup.selectAll(".winningArc")
            .datum({endAngle: exploitVal * tau / wedges})
            .attr("d", arc);
        if (exploreVal === "?") {
            exploreSvgGroup.select("#questionMark")
                .style("opacity", 1);
            exploreSvgGroup.selectAll(".winningArc")
                .style("opacity", 0);
        } else {
            exploreSvgGroup.select("#questionMark")
                .style("opacity", 0);
            exploreSvgGroup.selectAll(".winningArc")
                .style("opacity", 1);
            exploreSvgGroup.selectAll(".winningArc")
                .datum({endAngle: exploreVal * tau / wedges})
                .attr("d", arc);
        }
    };

    spinMachine = function (choiceId, choiceVal, outcome) {
        var group,
            r;
        if (choiceId === "explore") {
            group = d3.select("#explorecirclegroup");
        } else {
            group = d3.select("#exploitcirclegroup");
        }
        if (outcome) {
            r = 720 - 360 / wedges * choiceVal * Math.random();
        } else {
            r = 720 - 360 / wedges * (choiceVal + (1 - choiceVal) * Math.random());
        }
        group.transition()
            .duration(2000)
            .attrTween("transform", function() {
                var intrp = d3.interpolate(0, r);
                return function (t){
                    return "translate(90, 90) rotate(" + intrp(t) + ")";
                };
            });
    };

    upgradeMachine = function (newVal) {
        var exploitSvgGroup = d3.select("#exploitcirclegroup"),
            arcTween = function (newAngle) {
            return function(d) {
                var interpolate = d3.interpolate(d.endAngle, newAngle);
                return function(t) {
                    d.endAngle = interpolate(t);
                    return arc(d);
                };
            };
        };
        exploitSvgGroup.selectAll(".winningArc")
            .transition()
            .duration(1000)
            .attrTween("d", arcTween(newVal * tau / wedges));
    };


    responseFn = function (choiceId) {
        var nextValue;
        choiceNum++;
        $(".choicebutton").off("click");
        $("#" + choiceId).addClass("clicked");
        if (choiceId === "exploit") {
            $("#machinescreen").html("processing...");
            nextValue = value;
            $("#exploitsvg .spinnerbacking").css("opacity", 1);
            setTimeout(function () {
                setOutcome(choiceId, nextValue);
            }, 1500);
        } else {
            $("#exploresvg .spinnerbacking").css("opacity", 1);
            pickNewSpinner();
        }
    };

    pickNewSpinner = function () {
        var spinners = d3.selectAll(".spinnerpickeroption")
                .data(possibleSpinners);
        d3.selectAll(".spinnercover")
            .style("fill-opacity", 1);
        possibleSpinnerOrder = _.shuffle(_.range(30));
        spinners.attr("transform", function(d, i) {
            return "translate(" + (5 + Math.floor(possibleSpinnerOrder[i]/5) * 45) + "," +
                (5 +  (possibleSpinnerOrder[i] % 5) * 45) + ")scale(.25)";
        });
        $("#machinescreen").html("Spinners shuffled.<br/>Select a new spinner.");
        spinners.on("click", function(d, i) {
            spinners.on("click", null);
            $("#machinescreen").html("New spinner selected.");
            d3.select(this)
                .select(".spinnercover")
                .style("fill-opacity", 0);
            setTimeout(function () {
                $("#exploresvg").show();
                setOutcome("explore", d);
            }, 1500);
        });
    };

    setOutcome = function (choiceId, nextValue) {
        outcome = Math.random() < nextValue;
        consumptionQueue[trial + delayLength] = outcome ? "video" : "slider";
        psiTurk.recordTrialData({phase: "EXPERIMENT",
                                 trialType: "exploreexploit",
                                 taskType: taskType,
                                 outcomeNumFromChoice: trial + delayLength,
                                 outcomeNumImmediate: trial,
                                 choiceNum: choiceNum,
                                 uniqueid: uniqueId,
                                 condition: condition,
                                 response: choiceId === "explore" ? 1 : 0,
                                 rt: new Date().getTime() - timeStamp,
                                 currentValue: value,
                                 nextValue: nextValue,
                                 outcome: outcome,
                                 reset: resetArray[choiceNum - 1] || 0
                                });
        var extraTime = 0;
        if (choiceId === "explore") {
            extraTime = 1500;
            updateMachine(value, nextValue);
            if (nextValue > value) {
                $("#machinescreen").html("new spinner saved!");
                value = nextValue;
                upgradeMachine(value);
            } else {
                $("#machinescreen").html("new spinner not saved");
            }
        }
        setTimeout(function () {
            $("#machinescreen").html("running...");
            spinMachine(choiceId, nextValue, outcome);
        }, extraTime);
        setTimeout(function () {
            if (outcome) {
                $("#machinescreen").html("Machine succeeded!<br/>Video added to queue.");
            } else {
                $("#machinescreen").html("Machine failed.<br/>Slider task added to queue.");
            }
            d3.select(".choiceplaceinqueue")
                .select(".queueitempicture")
                .attr("xlink:href", function () {
                    if (outcome) {
                        return "static/images/videoicon.png";
                    } else {
                        return "static/images/slidericon.png";
                    }
                })
                .attr("y", -38)
                .transition()
                .duration(1000)
                .delay(500)
                .attr("y", 3);
            setTimeout(function () {
                $("#start").off("click");
                $("#exploreexploitdiv").hide();
                $(".choicebutton").removeClass("clicked");
                $(".spinnerbacking").css("opacity", 0);
                updateMachine(value, "?");
                functionList.pop()();
            }, 2000);
        }, 2000 + extraTime);
    };

    runChoice = function () {
        $(".machinebutton").removeClass("clicked");
        $("#start").prop("disabled", true);
        $("#machinescreen").html("Select button.");
        updateMachine(value, "?");
        $("#exploreexploitdiv").show();
        timeStamp = new Date().getTime();
        $(".choicebutton").click(function () {responseFn(this.id); });
    };

    resetMachine = function () {
        value = resetValues.pop();
        $("#machinescreen").html("Machine<br/>RESET");
        $("#start").prop("disabled", true);
        updateMachine(0, "?");
        setTimeout(function () {
            upgradeMachine(value);
        }, 1000);
        $("#exploreexploitdiv").show();
        setTimeout(functionList.pop(), 4000);
    };

    startOutcome = function () {
        $("#exploreexploitdiv").hide();
        $("#alternativecontents").show();
        d3.select("#taskpointer").style("fill-opacity", 1);
        $("#alternativestart").click(function () {$("#alternativecontents").hide();
                                                     $("#alternativestart").off("click");
                                                     if (consumptionQueue[trial] === "video") {
                                                         callback(1, trial);
                                                     } else {
                                                         callback(0, trial);
                                                     }});
    };

    getWorkQueueData = function () {
        var startIdx,
            endIdx,
            padding = 10,
            paddedQueue;
        paddedQueue = _.range(padding).fill("_")
            .concat(consumptionQueue)
            .concat(_.range(padding).fill("_"));
        if (condition) {
            startIdx = queueIdx + padding;
            endIdx = queueIdx + padding + visibleQueueLength + 1;
        } else {
            startIdx = queueIdx + padding - visibleQueueLength + 1;
            endIdx = queueIdx + padding + 2;
        }
        return paddedQueue.slice(startIdx, endIdx);
    };

    updateQueue = function () {
        d3.selectAll(".queueitempicture")
            .data(getWorkQueueData())
            .attr("xlink:href", function (d) {
                if (d === "video") {
                    return "static/images/videoicon.png";
                } else if (d === "slider") {
                    return "static/images/slidericon.png";
                } else {
                    return  "static/images/blankicon.png";
                }
            });
        d3.selectAll(".queueiteminner")
            .data(getWorkQueueData())
            .attr("transform", "translate(0)")
            .select("rect")
            .style("opacity", function(d) {
                if (d === "_") {
                    return 0;
                } else {
                    return 1;
                }
            });
    };

    shiftQueue = function () {
        var trialsUntilChoice = nPreWorkPeriods - delayLength - trial;
        if (trialsUntilChoice > 1) {
            $("#rightofqueue").html(trialsUntilChoice.toString() + " tasks until machine available");
        } else if (trialsUntilChoice === 1) {
            $("#rightofqueue").html("1 task until machine available");
        }
        else if (trialsUntilChoice === 0){
            $("#rightofqueue").html("");
        }
        if (trial === 0) {
            functionList.pop()();
        } else {
            d3.selectAll(".queueiteminner")
                .transition()
                .duration(1500)
                .attr("transform", "translate(-55)");
            setTimeout(function () {
                queueIdx++;
                updateQueue();
                functionList.pop()();
            }, 2000);
        }
    };

    this.run = function() {
        trial++;
        $("#exploreexploitdiv").hide();
        $("#exploresvg").hide();
        d3.select("#taskpointer").style("fill-opacity", 0);
        d3.selectAll(".spinnerpickeroption")
                .data(possibleSpinners)
            .attr("transform", function(d, i) {
                return "translate(" + (5 + Math.floor(i/5) * 45) + "," +
                    (5 + (i % 5) * 45) + ")scale(.25)";
            });
        d3.selectAll(".spinnercover")
            .style("fill-opacity", 0);
        functionList = [startOutcome];
        if (trial + delayLength >= nPreWorkPeriods && trial + delayLength < nTrials) {
            functionList.push(runChoice);
        }
        if (trial + delayLength > nPreWorkPeriods && resetArray[choiceNum]) {
            functionList.push(resetMachine);
        }
        functionList.push(shiftQueue);
        functionList.pop()();
    };

    (function () {
        var chosen;
        resetArray = [];
        for (i = 0; i < nChoices / 6; i++) {
            if (i === 0) {
                // make sure final reset isn't after the last choice
                chosen = Math.floor(Math.random() * 5);
            } else {
                chosen = Math.floor(Math.random() * 6);
            }
            resetArray = [0, 0, 0, 0, 0, 0].concat(resetArray);
            resetArray[chosen] = 1;
        }
    })();

    //spread reset values over an even range of percentages
    resetValues = _.shuffle([.2, .25, .3, .35, .4, .45, .5, .55, .6]);

    function arcTween (newAngle) {
        return function (d) {
            var interpolate = d3.interpolate(d.endAngle, newAngle);
            return function (t) {
                d.endAngle = interpolate(t);
                return arc(d);
            };
        };
    }

    function buildSpinner (container, id) {
        var circlegroup;
        circlegroup = container.append("g")
            .attr("class", "spinner")
            .attr("id", id)
            .attr("transform", "translate(90, 90)");
        circlegroup.append("path")
            .datum({endAngle: tau})
            .style("fill", "#222222")
            .attr("d", arc);
        _.range(wedges).map(function (x) {
            circlegroup.append("g")
                .attr("transform", "rotate(" + x / wedges * 360 + ")")
                .append("path")
                .datum({endAngle: 0})
                .attr("class", "winningArc")
                .style("fill", "orange")
                .attr("d", arc);
        });
        return circlegroup;
    }

    var entiregroup;
    entiregroup = d3.select("#exploitsvg");
    entiregroup.append("rect")
        .attr("class", "spinnerbacking")
        .attr("width",  180)
        .attr("height", 180)
        .style("opacity", 0)
        .style("fill", "#444444");
    buildSpinner(entiregroup, "exploitcirclegroup");
    entiregroup.append("polygon")
        .attr("points", "80 0, 100 0, 90 20")
        .style("fill", "black")
        .style("stroke", "gray")
        .style("stroke-width", 2);
    entiregroup = d3.select("#exploresvg");
    entiregroup.append("rect")
        .attr("class", "spinnerbacking")
        .attr("width",  180)
        .attr("height", 180)
        .style("opacity", 0)
        .style("fill", "#444444");
    buildSpinner(entiregroup, "explorecirclegroup").append("text")
        .attr("id", "questionMark")
        .text("?")
        .attr("text-anchor", "middle")
        .attr("y", "10px")
        .style("font-family", "sans-serif")
        .style("font-size", "30px")
        .style("fill", "lightgray");
    entiregroup.append("polygon")
        .attr("points", "80 0, 100 0, 90 20")
        .style("fill", "black")
        .style("stroke", "gray")
        .style("stroke-width", 2);

    var nextTaskMarker = d3.select("#consumptionqueue")
            .append("g")
            .attr("transform", !condition ? "translate(" + (55 * (visibleQueueLength-1)) + ", 35)" : "translate(0, 35)");

    nextTaskMarker.append("path")
        .attr("d", "M 25 -30 L 25 -10 L 20 -10 L 30 0 L 40 -10 L 35 -10 L 35 -30 Z")
        .style("fill-opacity", 0)
        .attr("id", "taskpointer")
        .style("stroke-opacity", 0);

    nextTaskMarker.append("path")
        .attr("d", "M 4 35 L 4 50 L 56 50 L56 35")
        .style("stroke", "black")
        .style("fill",  "none")
        .style("stroke-width", 2);

    nextTaskMarker.append("text")
        .attr("y", 70)
        .attr("x", condition ? 0 : -10)
        .text("next task");

    d3.select("#consumptionqueue")
        .attr("width", (visibleQueueLength * 55 + 7).toString() + "px")
        .selectAll(".queueitemframe")
        .data(getWorkQueueData())
        .enter()
        .append("g")
        .attr("class", "queueitemframe")
        .attr("transform", function(d, i) {return "translate(" + (10 + i*55) + ",40)";})
        .append("g")
        .attr("class", "queueiteminner")
        .each(function (d, i) {
            if (i === visibleQueueLength - 1) {
                d3.select(this).classed("choiceplaceinqueue", true);
                if (condition === 0) {
                    d3.select(this).classed("outcomeplaceinqueue", true);
                }
            } else if (i === 0 && condition === 1) {
                d3.select(this).classed("outcomeplaceinqueue", true);
            }
        })
        .append("image")
        .attr("class", "queueitempicture")
        .attr("x", "3px")
        .attr("y", "3px")
        .attr("width", "34px")
        .attr("height", "34px");

    d3.selectAll(".queueiteminner")
        .append("rect")
        .attr("width", "40px")
        .attr("height", "40px")
        .style("stroke-width", "3px")
        .style("stroke", "black")
        .style("fill", "#666666")
        .attr("fill-opacity", 0)
        .style("border-radius", "5px");

    var possibleSpinners = _.range(10).fill(0).concat(_.range(1, 21).map(function(x) {return x/20}));
    var possibleSpinnerOrder = _.shuffle(_.range(30));

    d3.select("#spinnerpickersvg")
        .attr("width", "280px")
        .attr("height", "235px")
        .append("rect")
        .attr("width", "280px")
        .attr("height", "235px")
        .style("fill", "lightgray");
    d3.select("#spinnerpickersvg")
        .selectAll("g")
        .data(possibleSpinners.map(function(x) {return {endAngle: x * tau / wedges}; }))
        .enter()
        .append("g")
        .attr("class", "spinnerpickeroption")
        .attr("id", function(d, i) {return "spinnerpickeroption" + i; })
        .attr("transform", function(d, i) {
            return "translate(" + (5 + Math.floor(possibleSpinnerOrder[i]/5) * 45) + "," +
                (5 + (possibleSpinnerOrder[i] % 5) * 45) + ")scale(.25)";
        })
        .each(function (d, i) {
            buildSpinner(d3.select(this), "spinner" + i);
        })
        .select(".spinner")
        .each(function (d,i) {
            d3.select(this)
                .selectAll(".winningArc")
                .datum(d)
                .attr("d", arc);
        });

    d3.select("#spinnerpickersvg")
        .selectAll(".spinnerpickeroption")
        .append("rect")
        .attr("class", "spinnercover")
        .attr("width", 180)
        .attr("height", 180)
        .style("fill", "lightgray")
        .style("stroke", "black")
        .style("fill-opacity", 0)
        .style("stroke-width", 3);


    value = resetValues.pop();
    updateQueue();
}

function ConsumptionRewards(psiTurk, callback) {
    "use strict";
    var video,
        trialNum,
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
            stat = video.getData();
            psiTurk.recordTrialData({phase: "EXPERIMENT",
                                     trialType: "consumption",
                                     trial: trialNum,
                                     uniqueid: uniqueId,
                                     condition: condition,
                                     outcome: reward,
                                     slidersMissed: -1,
                                     switches: stat.switches,
                                     planetearth: stat.planetearth,
                                     bakeoff: stat.bakeoff,
                                     unchainedreaction: stat.unchainedreaction,
                                     ellen: stat.ellen
                                    });
        } else {
            stat = sliderTask.getMisses();
            psiTurk.recordTrialData({phase: "EXPERIMENT",
                                     trialType: "consumption",
                                     trial: trialNum,
                                     uniqueid: uniqueId,
                                     condition: condition,
                                     outcome: reward,
                                     slidersMissed: stat,
                                     playTime: -1,
                                     switches: -1,
                                     planetearth: -1,
                                     bakeoff: -1,
                                     unchainedreaction: -1,
                                     ellen: -1
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

    this.setReward = function(_reward, trial) {
        reward = _reward;
        trialNum = trial;
        $("#time").html(30);
        timeLeft = totalTime;
        timeInterval = setInterval(decrementTime, 1000);
        setTimeout(function () {
            currentTask.stop();
            recordData();
        }, totalTime * 1000);
        if (reward) {
            currentTask = video;
        } else {
            currentTask = sliderTask;
        }
        currentTask.run();
    };

    this.recordFinal = function(taskType) {
        psiTurk.recordUnstructuredData("misses_" + taskType, sliderTask.missPct().toString());
    };

    decrementTime = function () {
        timeLeft--;
        if (timeLeft >= 0) {
            $("#time").html(timeLeft);
        }
        if (timeLeft === 0) {
            clearInterval(timeInterval);
        }
    };

    sliderTask = new SliderTask();
    video = new VideoPlayer();
    $("#time").html("0");
    $("#sliderpct").html("0");
}

function PracticeRewards (psiTurk, callback) {
    "use strict";
    var sliderTask,
        currentTask,
        video;

    this.setReward = function (reward, trial) {
        $("#consumptionblocker").show();
        if (reward) {
            currentTask = video;
            $("#consumptionblocker").html("Video task");
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
}

function practiceConsumption(psiTurk, callback) {
    "use strict";
    var examples = [1, 0, 0],
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
            if (reward === 0) {
                $("#rewardintrotext").html("Example outcome: <br/> Slider task");
            } else {
                $("#rewardintrotext").html("Example outcome: <br/> Video task");
            }
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
    $("#sliders").hide();
    rewards = new ConsumptionRewards(psiTurk, next, true);
    next();
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
                psiTurk.recordUnstructuredData("instructionloops", loop);
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
    if (misspct > 10) {
        losses += (misspct - 10) * .2;
    }
    losses = Math.min(losses, 5);
    bonus = 5 - losses;
    $("#losses").html(losses.toFixed(2));
    psiTurk.recordUnstructuredData("bonus", bonus);
    psiTurk.recordUnstructuredData("uniqueid", uniqueId);
    psiTurk.recordUnstructuredData("condition", condition);
    $("#totalbonus").html(bonus.toFixed(2));
    $("#continue").click(function () {
        recordResponses();
    });
}

function bis(psiTurk, callback) {
    "use strict";
    var recordResponses;

    recordResponses = function () {
        var i,
        allFilled = true;
        for (i = 1; i< 31; i++) {
            if($("input[name='bis" + i + "']:checked").val() === undefined) {
                allFilled = false;
            }
        }
        if(!allFilled) {
            $("#blankmessage").html("<strong>Please answer all questions before continuing.</strong>");
        } else {
            for (i = 1; i< 31; i++) {
                psiTurk.recordUnstructuredData("bis" + i, $("input[name='bis" + i + "']:checked").val());
            }
            callback();
        }
    };


    psiTurk.showPage("bis.html");
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
        nChoices = [12, 48],
        nPreWorkPeriods = [8, 8],
        functionList = [];

    $(window).on("beforeunload", function(){
		    psiTurk.saveData();
		    $.ajax("quitter", {
				    type: "POST",
				    data: {uniqueId: psiTurk.taskdata.id}
		    });
		    return "By leaving or reloading this page, you opt out of the experiment.  Are you sure you want to leave the experiment?";
    });

    next = function () {
        functionList.shift()();
    };

    psiTurk.preloadPages(["stage.html",
                          "practice.html",
                          "restart.html",
                          "extravideos.html",
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
                          "bis.html",
                          "postquestionnaire.html"]);
    functionList = [
        function () {
            bis(psiTurk, next); },
        function () {
            instructionDriver(["instructions/instruct_1.html",
                               "instructions/instruct_2.html",
                               "instructions/instruct_3.html",
                               "instructions/instruct_4.html",
                               "instructions/instruct_5.html",
                               "instructions/instruct_6.html",
                               "instructions/instruct_7.html"],
                              "instructions/quiz.html",
                              {range: "five_onehundred",
                               reset: "1_6",
                               processnum: "8",
                               misspenalty: "20percentage"},
                              psiTurk, next); },
        function () {
            transitionScreen("transition_practicedecision.html", psiTurk, next);
        },
        function () {
            phaseDriver(nChoices[0], nPreWorkPeriods[0], ExploreExploitTask, PracticeRewards, "practice", psiTurk, next);
        },
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


$(window).load(function () {
    "use strict";
    experimentDriver();
});
