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
        nsliders,
        noiseInterval,
        noiseFn,
        noise = new Audio("/static/audio/annoyingnoise.wav"),
        totalMisses = 0,
        total = 0,
        slidertemplate = _.template('<div class="sliderdiv" id="sliderdiv<%= num %>">' +
                                    '<input type="range" class="slider" id="slider<%= num %>">' +
                                    '<span class="sliderlabel" id="sliderlabel<%= num %>"></span>' +
                                    '</div>');

    noise.volume = .8;

    noiseFn = function () {
        if (Math.random() < .667) {
            noise.play();
        }
    };

    this.practiceRun = function () {
        for(var i = 0; i < 5; i++) {
            $("#slidersholder").append(slidertemplate({num: i}));
        }


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

        $("#sliders").show();
    };

    this.run = function (totalTime) {
        var i;

        nsliders = (totalTime - 5) / 5;

        $('#progress-bar').css('width', '100%');
        $('#progress-bar').animate({width: '0%'}, totalTime*1000, 'linear');
        for(i = 0; i < nsliders; i++) {
            $("#slidersholder").append(slidertemplate({num: i}));
        }


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

        $("#slider0").prop("disabled", false);
        $("#sliderdiv0").css("background-color", "");
        for(i = 1; i < nsliders; i++) {
            setTimeout((function(v) {return function () {
                $("#slider"+v).prop("disabled", false);
                $("#sliderdiv"+v).css("background-color", "");
            }; })(i), i*5000);
        }
        setTimeout(function () {
            noiseFn();
            noiseInterval = setInterval(noiseFn, 2000);
        }, 1000);

        $("#sliders").show();
    };

    this.getData = function () {
        //return number of sliders missed
        return {misses: misses, nsliders: nsliders};
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
        total += $(".slider").length;
        $("#sliders").hide();
        $("#slidersholder").html("");
    };
}

function MultiConsumptionRewards(psiTurk, callback) {
    "use strict";
    var next,
        rewardMaker,
        rewardSequence;

    this.setReward = function (_rewardSequence) {
        var r;
        rewardSequence = _rewardSequence;
        r = rewardSequence.shift();
        rewardMaker.setReward(r.reward, r.trial, r.time);
    };

    next = function () {
        var r;
        if(rewardSequence.length === 0) {
            callback();
        } else {
            r = rewardSequence.shift();
            setTimeout(function () {
                rewardMaker.setReward(r.reward, r.trial, r.time);
            }, 2000);
        }
    };

    rewardMaker = new ConsumptionRewards(psiTurk, next);
}


function ConsumptionRewards(psiTurk, callback) {
    "use strict";
    var video,
        trialNum,
        reward,
        sliderTask,
        currentTask,
        recordData;

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
            stat = sliderTask.getData();
            psiTurk.recordTrialData({phase: "EXPERIMENT",
                                     trialType: "consumption",
                                     trial: trialNum,
                                     uniqueid: uniqueId,
                                     condition: condition,
                                     outcome: reward,
                                     slidersTotal: stat.nsliders,
                                     slidersMissed: stat.misses,
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

    this.setReward = function(_reward, trial, totalTime) {
        reward = _reward;
        trialNum = trial;
        setTimeout(function () {
            currentTask.stop();
            recordData();
        }, totalTime * 1000);
        if (reward) {
            currentTask = video;
            currentTask.run();
        } else {
            currentTask = sliderTask;
            currentTask.run(totalTime);
        }
    };

    this.recordFinal = function() {
        psiTurk.recordUnstructuredData("misses", sliderTask.missPct().toString());
    };

    sliderTask = new SliderTask();
    video = new VideoPlayer();
    $("#sliderpct").html("0");
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
            if (reward === 0) {
                $("#rewardintrotext").html("Example outcome: <br/> Slider task");
            } else {
                $("#rewardintrotext").html("Example outcome: <br/> Video task");
            }
            $("#continue").off("click");
            $("#continue").click(
                function () {
                    $("#rewardintro").hide();
                    // rewards.setReward(reward, trials.shift(), 70);
                    rewards.setReward([{reward: 0, trial: -3, time: 30}, {reward: 1, trial: -3, time: 30}]);
                }
            );
        }
    };

    psiTurk.showPage("practice.html");
    $("#rewards").hide();
    $("#sliders").hide();
    // rewards = new ConsumptionRewards(psiTurk, next);
    rewards = new MultiConsumptionRewards(psiTurk, next);
    next();
}

function transitionScreen(page, psiTurk, callback) {
    psiTurk.showPage(page);
    $("#continue").click(callback);
}

function ChoiceTask(ntrials, psiTurk, rewardSetter) {
    var previousChoice = 0;

    this.run = function() {
        if (previousChoice === 0) {
            $('#lastchoicespan').html('');
        } else if (previousChoice === 1) {
            $('#lastchoicespan').html('Option A').removeClass('btn-danger').addClass('btn-primary');
        } else {
            $('#lastchoicespan').html('Option B').removeClass('btn-primary').addClass('btn-danger');
        }
        $('#exploreexploitdiv').show();
        $('.choicebutton').click(function () {
            $('.choicebutton').off('click');
            responseFn(this.id);
        });
    };

    function responseFn(id) {
        var choice = parseInt(id[id.length-1]),
            choseWait = (choice + counterbalance) % 2,
            waitAdd = choseWait * [-5, 0, 5][condition],
            randomAdd = [-5, 0, 5][Math.floor(Math.random()*3)],
            rewardsequence;

        previousChoice = choice;

        rewardsequence = [{reward: 0, trial: 0, time: 60 - randomAdd - waitAdd}, {reward: 1, trial: 0, time: 30 + randomAdd + waitAdd}];
        if (choseWait === 0) {
            rewardsequence = [rewardsequence[1], rewardsequence[0]];
        }

        $('#exploreexploitdiv').hide();
        rewardSetter(rewardsequence);
    }
}

function phaseDriver(nTrials, ChoiceFn, RewardFn, psiTurk, callback) {
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
            rewards.recordFinal();
            psiTurk.saveData({
                success: callback,
                error: callback});
        }
    };

    psiTurk.showPage("stage.html");
    $("#rewards").hide();
    $("#sliders").hide();

    rewards = new RewardFn(psiTurk, nextChoice);
    exploreExploit = new ChoiceFn(nTrials, psiTurk, rewards.setReward);
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
        misspct = Math.floor(psiTurk.getQuestionData().misses),
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
        nChoices = [30],
        functionList = [];

    // $(window).on("beforeunload", function(){
		//     psiTurk.saveData();
		//     $.ajax("quitter", {
		// 		    type: "POST",
		// 		    data: {uniqueId: psiTurk.taskdata.id}
		//     });
		//     return "By leaving or reloading this page, you opt out of the experiment.  Are you sure you want to leave the experiment?";
    // });

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
        // function () {
        //     bis(psiTurk, next); },
        // function () {
        //     instructionDriver(["instructions/instruct_1.html",
        //                        "instructions/instruct_2.html",
        //                        "instructions/instruct_3.html",
        //                        "instructions/instruct_4.html",
        //                        "instructions/instruct_5.html",
        //                        "instructions/instruct_6.html",
        //                        "instructions/instruct_7.html"],
        //                       "instructions/quiz.html",
        //                       {range: "five_onehundred",
        //                        reset: "1_6",
        //                        processnum: "8",
        //                        misspenalty: "20percentage"},
        //                       psiTurk, next); },
        // function () {
        //     transitionScreen("transition_practicedecision.html", psiTurk, next);
        // },
        // function () {
        //     phaseDriver(nChoices[0], nPreWorkPeriods[0], ExploreExploitTask, PracticeRewards, "practice", psiTurk, next);
        // },
        // function () {
        //     transitionScreen("transition_practiceconsumption.html", psiTurk, next);
        // },
        function () {
            phaseDriver(nChoices, ChoiceTask, MultiConsumptionRewards, psiTurk, next);
        },
        // function () {
        //     practiceConsumption(psiTurk, next); },
        // function () {
        //     transitionScreen("transition_fulltask.html", psiTurk, next);
        // },
        // function () {
        //     phaseDriver(nChoices[1], nPreWorkPeriods[1], ExploreExploitTask, ConsumptionRewards, "consumption", psiTurk, next); },
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
