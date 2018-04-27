---
title: Does present bias influence exploratory choice?
author: 
- Alexander S. Rich
- Todd M. Gureckis
institute: New York University
bibliography: /Users/alex/Documents/exploration_consumption/doc/journal/paperlib.bib
header-includes:
- \usepackage{soul}
- \usepackage{color}
geometry: margin=1in
---

# Does a present bias influence exploratory choice?

Decision makers that act in uncertain environments frequently face
dilemmas between exploiting options known to be rewarding and exploring options
that are uncertain. A child buying ice cream, for example, must select between
getting a cone of her favorite flavor and trying something new that might become
a new favorite but could also be disappointing. Researchers in reinforcement
learning have created a large body of knowledge about how people and
animals handle the explore&ndash;exploit dilemma [@Mehlhorn2015] as well as how the problem
should be approached computationally [@sutton1998reinforcement].

A key aspect of exploratory decision making is that it is spread over time. With
only a single decision, exploration makes little sense. If, heaven forbid, you only
have one remaining chance to buy ice cream in your life, you should buy your
favorite flavor, because that is the flavor you expect to enjoy the most. Exploring
new flavors has the possibility of introducing you to a new favorite, but it is
only when there will be many more chances to choose that new flavor in the future
that the risk of a disappointment starts to look worthwhile.

While research on exploratory choice acknowledges that the value of exploration
depends on its payoffs in the future [@Wilson2014a; @Rich2017], it has not
addressed how this might interact with the manner in which people value future
rewards. When considering rewards spread over time, people tend to be present
biased, overweighting immediate rewards in comparison to delayed rewards
[@myerson1995discounting; @Frederick2002]. In scenarios with explore&ndash;exploit
tradeoffs, this could lead to over-exploitation and under-exploration. While lab
experiments tend to be conducted in short sessions with non-consumable rewards,
preventing present bias from being a major factor, this preference for immediate
reward could be a major factor leading to under-exploration in more temporally
extended, real world settings.

In this paper, we discuss the potential connection between exploratory choice
and intertemporal choice. We report on a set of experiments using
directly consumable rewards in an exploratory choice task to test for effects of
present bias on exploration. While we did not find an effect of present bias on
exploratory choice, a follow-up experiment revealed that our consumable rewards
did not in fact produce a reliable present bias, despite evidence that they did
so in earier studies [@Solnick1980; @Navarick1998]. Nonetheless, we hope that
this work can serve as a useful first step towards unifying our
understanding of exploratory and intertemporal decision making.

# Exploration inside and outside the lab

Many researchers have examined patterns of exploration, both in
naturalistic settings and in the lab. Interestingly, differing findings have
emerged as to the nature and severity of biases in exploratory choice.

## Exploration outside the lab

Exploration has been studied outside the lab in a wide range of contexts. While
these domains vary greatly in their superficial characteristics, a bias towards
under-exploration has often been observed.

Learned helplessness, a phenomenon applicable to many behaviors and domains, has
been described as an example of insufficient exploration. In learned
helplessness, an organism experiences the absence of control over the
environment, learns that the environment is uncontrollable, and thus ceases to
take actions that might allow it to discover that it can in fact exert control.
Learned helplessness has been proposed to underly some forms of depression
[@Abramson1978; @Abramson1989] as well as problems ranging from difficulties in
school [@Diener1978] to poverty [@Evans2005]. While the cognitive appraisal of
experienced events affects the development of learned helplessness
[@Abramson1978], patterns of exploration clearly play a role as well [@Huys2009,
@Teodorescu2014a]. In the case of depression, interventions aimed at increasing
the exploration of activities that might be rewarding have been found to be as
effective as those with a more cognitive orientation [@Jacobson1996].

Under-exploration also seems to occur in the development of complex skills, such
as flying a plane or playing a sport [@Gopher1989]. In these settings, an "emphasis
change" training method that encourages people to continually explore the
performance space leads to greater performance gains than unguided practice or more complex
training methods.  Without this intervention, people often enter a "local
maximum" in which exploration decreases and performance plateaus [@Yechiam2001].

In many other areas under-exploration is less clearly
established, but is suspected to play a role in maladaptive behavior.
Insufficient exploratory interaction with outgroups may be one cause of
stereotypes and prejudice [@Denrell2005most], and interventions that
increase inter-group contact reduce stereotypes [@Shook2008]. The crowding
out of exploration by exploitation is a concern in organizational behavior as
well [@March1991; @Levinthal1993], prompting research into organizational
structures that may preserve exploration [@Fang2010].

## Exploration inside the lab

Lab studies of exploratory choice have allowed researchers to fully
control the reward structure of the environment and precisely measure behavior,
as well as compare behavior to optimal choice and other formal models.
These studies have yielded a number of insights into the factors leading to more
or less exploration, including aspiration levels [@Wulff2015], uncertainty
[@Speekenbrink2015], and the future value of information [@Rich2017; @Wilson2014a]

Interestingly, under-exploration has not emerged as a clear pattern in lab
experiments. Instead, results are mixed with people sometimes under-exploring,
sometimes over-exploring, and sometimes exploring close to an optimal amount. To
take two illustrative examples, [@Zwick2003] found that in a sequential
search task people under-searched when there were no information costs but
over-searched when there were information costs, and [@Teodorescu2014]
found that people explored unknown alternatives too often or not often enough
depending on whether rare outcomes were positive or negative. Similar results
have been obtained within and across a variety of other studies and paradigms
[@tversky1966information; @hertwig2004decisions; @Navarro2016; @Juni2016;
@Sang2011].

These experimental studies raise the question of why under-exploration appears
more widespread in the field, but not in the lab. One possibility is that both
forms of deviation from optimality are in fact prevalent, though perhaps in
different settings, and that the seemingly general bias toward under-exploration
is illusory. An alternative is that there are some important aspects of real-world
decisions&mdash;or peoples' cognitive and motivational states when making those
decisions&mdash;that makes differentiate them from decisions in the lab.
One clear possibility is that in real world exploration, choices and outcomes
are spread out over time in a manner that is rarely found in the lab, and that
people's bias towards immediate rewards might therefore account for a portion of
people's tendency to under-explore.

# Temporal discounting

Temporal discounting refers to the underweighting of temporally distant rewards
relative to close ones, and is a ubiquitous phenomenon across decision-making
agents including people, animals, and organizations. Temporal discounting is
rational if it occurs at an exponential rate $\delta$, where the value of a reward $r$
at time $t$ is

$$
V(r,t) = re^{-t\delta}
$$

In exponential discounting, each additional unit of waiting time decreases the
value of a reward by an equal proportion [@samuelson1937note, @Frederick2002]. This means that the
relative values of an early and a late rewards are the same no matter what time point they
are considered from, or equivalently that their relative values are unaffected by
adding an additional waiting time to both.

An extensive literature documents that people and animals violate exponential discounting.
Specifically, in the short term rewards are discounted at a steep rate with each
additional unit of waiting time, while in the long term rewards are discounted
at a shallow rate. This sort of non-exponential discounting leads to a present
bias, in which in the short term people excessively over-weight immediate over
future rewards. For example, people will often prefer a larger, later monetary
reward to a smaller, sooner reward when both rewards are in the future, but will
switch their preference when the time until both rewards is reduced so that the
sooner reward is immediate or nearly immediate [@Kirby1995]. With monetary rewards, the delay
or speed-up required to observe preference reversals is usually several days. With non-monetary rewards,
such as the cessation of an annoying noise [@Solnick1980], watching a video
when bored [@Navarick1998], or drinking soda
when thirsty [@Brown2009], a bias towards immediate rewards has been observed on the scale of
minutes or seconds.

There is debate about how to formally describe non-exponential discounting. Many
studies have found that humans and animals appear to discount future rewards at
a hyperbolic rate, allowing the value of a future reward to be written as

$$
V(r, t) = \frac{r}{1+kt}
$$

for appropriate constant $k$ [@myerson1995discounting]. This formulation often fits data well, but is
difficult to deal with analytically. An alternative is to posit that discounting
after the present proceeds exponentially, but that there is a one-time drop in
value when the reward goes from being immediate to being in the future [@Laibson1997]. In this
model, known as the beta&ndash;delta or quasi-hyperbolic model, the value of a future reward is

$$
V(r, t) = \begin{cases}
r & \text{if }t=0\\
\beta r e^{-t\delta} & \text{if }t>0
\end{cases}
$$

where $\delta$ is the rate of exponential discounting and $\beta$ is the degree
of present bias. This model suffers from ambiguity in when exactly the "present"
ends and the future begins. (E.g., should the value of reward received in 30
seconds be discounted by $\beta$, or should it be considered immediate?)
However, it captures in a simple and tractible way many of the qualities of
human intertemporal choice, and for this reason we will adopt it for our
additional analyses below.


# Exploration and temporal discounting

The rewards from exploratory choice are inherently distributed over time. In
expectation, an exploitative action yields the greatest reward in the present,
because it is the action *currently believed* to yield the highest reward.
An exploratory action is expected to yield less immediate reward, but it can
compensate for this by providing useful information. This information can allow
the decision-maker to make better choices in the future, leading to higher rewards later on.

Thus, temporal discounting plays a central role in determining the balance
between exploration and exploitation. Rational, exponential discounting ensures
that a decision-making agent explores neither too little nor too much given its
degree of interest in the future. Some degree of discounting is generally good,
because at some point the distant gains from continued exploration are not worth
their immediate costs [@LeMens2011].
But as past theoretical work has highlighted, discounting that is too steep or
that exhibits a present bias can lead to chronic over-exploitation and
under-exploration [@March1991; @Levinthal1993].

To understand how patterns of discounting affect exploration, consider a simple
scenario in which an agent must make a sequence of choices between
two actions. Action $A$ is to choose a sure-bet option that always provides a
payoff of 2. Action $B$ is to choose from a large set of uncertain
options. For each uncertain option, there is a 25% chance that it produces a
consistent payoff of 4, and a 75% chance that it produces a payoff of 0.
Once a high-payoff uncertain option is
found, it can be selected on every subsequent choice.

![Effects of exploration over time for different discount curves in a simple
exploratory choice task (see text for more details). The top row of panels show
the degree of discounting at each time step. The bottom row of panels show the
expected change of undiscounted (gray) and discounted (black) reward at each
time step from exploring at the *first* action. The left panels shows exponential
discounting, the center panels show quasi-hyperbolic discounting, and the right
panels show quasi-hyperbolic discounting with a front-end delay. Exploration
appears worthwhile to an agent with exponential discounting or quasi-hyperbolic
discounting with a delay, but not to an agent with quasi-hyperbolic discounting
and no delay.](figures/discounting.pdf){#fig:discounting}

This scenario presents an explore&ndash;exploit dilemma because as long as a
high-payoff option has not been found, the best immediate action is $A$, with an
expected payoff of $2$, rather than $B$, with an expected
payoff of $.25\cdot4=1$. Long term payoffs, in contrast, are increased by
exploring the options available through action $B$, because the agent may find a
high-payoff option that can be exploited on all future choices.

Whether the agent decides to forgo the immediate gains of exploiting $A$ in
order to explore $B$ will depend on how much it values the future. Figure
@fig:discounting shows the effects of various patterns of discounting on the
expected rewards over a sequence of five choices. The left column shows the case of
exponential discounting with $\delta=.9$. The top graph shows the exponential discounting curve,
with dots indicating the time and weight of each of the five choices. The bottom
graph shows the change in expected reward at each choice that is caused by
selecting action $B$ rather than $A$ at the *first* choice. (This analysis
assumes that all subsequent choices are made optimally in terms of undiscounted
rewards.) For mild exponential discounting, we see that at time 1, choosing $B$
over $A$ causes a steep decrease in expected reward, because it trades an
expected payoff of $2$ for an expected payoff of $1$. At times 2&ndash;5,
however, the expected payoff goes up; choosing $B$ at time 1 can only increase
payoffs at later times, by revealing an high-payoff option. At the far right of
the graph, we see that the summed discounted change in reward, in black, is positive, and thus that the
agent will choose to explore. The undiscounted reward, in gray, is larger, but
doesn't differ in sign from the reward after mild exponential discounting.

The center column shows the case of beta&ndash;delta, or psuedo-hyperbolic,
discounting, with $\delta=.9$ and $\beta=.5$. As the top graph shows, rewards from later time points are weighted
much less than in exponential discounting. Because of this, the expected gain in
future reward for choosing $B$ becomes smaller, while the immediate expected
loss remains the same. The summed discounted change in reward becomes negative, and the
agent adopts a completely exploitative policy of choosing $A$ instead of initially exploring the
uncertain action $B$.

To preview our experimental manipulation, the right column shows a case of
beta&ndash;delta discounting considered from a temporal distance. Now, the first
choice is at time 6, while the last is at time 5. Suppose the agent was given
the opportunity to commit to a first action from time 1. As shown in the bottom
graph, the sequence of rewards viewed from this distance is highly discounted,
but is no longer heavily biased towards the first outcome. Instead, the expected
discounted reward sequence is now a scaled version of the exponentially
discounted rewards, since beta&ndash;delta discounding is identical to
exponential discounting after the present. The summed expected rewards for
exploration are greater than those for exploitation, so the agent will choose
the exploratory action.

## Capturing present bias in exploratory choice

As alluded to earlier, several approached have been used to study present bias
in the lab. Many studies use monetary rewards, and offer participants various
one-off choices between different quantities of money at different delays to
determine their discounting curve [@myerson1995discounting]. However,
exploratory choice is inherently not "one-off." Choices can only be considered
exploratory or exploitative if they are embedded within an ordered sequence of
choices, where the knowledge gained from one choice can be used to inform the
next. Thus, to study present bias during exploratory choice, an experiment must
include a sequence of choices and outcomes, with enough time between them for
discounting of the future to be non-negligible. With monetary rewards, this
means the choices in an experiment would have to be spread out over weeks or
months. This leads us to consider non-monetary, directly consumable rewards.

While people tend to discount money relatively slowly, they often discount
primary rewards significantly for delays of minutes or seconds. This can be
measured in a number of ways. In some cases, an explicit choice between
a larger later and a smaller sooner reward is offered. @Mcclure2007, for
example, found that thirsty participants showed present bias when asked to
choose between larger and smaller juice rewards separated by a few minutes. In
other cases, the choice between a smaller-sooner and larger-later reward is
offered repeatedly, but without explicit description, and participants are
allowed to build a preference through experience. Using this approach, researchers have
found present biases on the scale of seconds for playing a video game, watching a movie, or relief from
an annoying noise [@Navarick1998; @Millar1984; @Solnick1980].

In the above studies, each choice is "one-off," creating rewards but not
affecting future choices. @Brown2009 provided evidence of present bias in a task
in which immediate consumption affected consumption from future choices. They
created a life-cycle savings game in which participants gained income and
decided how much to spend over 30 periods spaced a minute apart. They arrived to
the experiment thirsty, and were allowed to consume their spent income in the
form of soda. In the immediate-reward condition, participants made choices at
each period and then immediately consumed their soda reward. In the
delayed-reward condition, the experimenters imposed a 10 minute delay between
choices and reward consumption; thus, after a choice was made, the soda earned
from that choice was consumed 10 periods later. Participants in the
delayed-reward condition were able to consume more total soda on average,
suggesting that the temporal delay decreased their present bias and allowed them
to choose in a manner leading to greater long-term reward.

In the following two experiments, we use an intervention similar to that of
@Brown2009 to test for effects of present bias on exploratory choice. As
indicated in Figure @fig:discounting, if an exploratory choice task is paired
with immediate consumption we predict present bias to lead to underexploration.
However, if a temporal delay is introduced between decisions and outcomes, the
present bias will be decreased, leading to greater exploration.

We used videos as a positive outcome that could produce present bias [@Navarick1998], and a
boring slider task [@Gill2012],
along with, in Experiment 2, annoying noises [@Solnick1980], as negative outcomes. It is
worth noting that we also piloted an experiment using a video game as a positive
outcome [@Millar1984], but found that participants did not find the video game sufficiently
enjoyable. Experiment 1 represents a first attempt to test for effects of
present bias on exploratory choice, and Experiment 2 is a larger, preregistered
study that improves on Experiment 1 in several ways. After finding no evidence
of present bias producing an effect in Experiments 1 or 2, in Experiment 3 we
test directly, using a simpler design, whether our outcome stimuli in fact
produce a consistent preference towards immediate rewards.


# Experiment 1

## Methods

### Participants.
Forty participants completed the experiment, which was conducted over
Amazon Mechanical Turk (AMT) using the psiTurk framework [@Gureckis2015a].
The participants had a mean age of 37.7 (SD=10.6). Twenty eight self-reported female, twelve male.
Participants were paid $5.00 for their participation, with a performance-based
bonus of up to $3.00. The experiment and all following experiments were approved
by the Institutional Review Board at New York University. 
All participants received the full $3.00 bonus.
Participants were pseudo-randomly counterbalanced across two conditions.


### Design and procedure

#### Consumption tasks
Participants were informed that their job was to perform a monotonous slider task that
would be split into 30-second "work periods," but that they would be able to
make choices throughout the experiment that would give them a chance to watch a
YouTube video instead. The number of remaining work periods in the experiment was shown
at the top of the screen, as was the number of seconds left in the current work period.

![Examples of the Experiment 1 tasks. (a): an example of the slider task. Participants had to move all
  sliders to ``50'' in 30 seconds. (b): the video-watching task.
  Participants had to hold the space bar to watch their chosen video. (c):
  the decision-making task. Participants had to choose to run the machine with
  the current spinner or try a new spinner. If their chosen spinner landed on
  a gold wedge, they performed the video-watching task instead of the
  slider task.](figures/taskpictures.png){#fig:exp1task}

![The machine display seen by participants. The display allowed participants track
  the value of each machine and the next time each machine would be ready to
  make a choice or produce an outcome. Gray arrows have been added to depict the
  counterclockwise movement of machines around the display after each work
  period.
  (a): the display seen by participants in the immediate condition of Experiment 1.
  (b): the display seen by participants in the delayed condition of
  Experiment 1.](figures/machinemappictures.png){#fig:exp1machinemap}

The slider task was based of a task previously used by [@Gill2012]. In each
period of the slider task, five horizontal sliders appeared on the screen (Figure {@fig:exp1task}a). Each
started at a random setting between 0 and 100, with the slider's value
shown to its right, and with a random horizontal offset so that the
sliders were not aligned. The participant's task was to use the mouse to move
each slider to "50" before the work period ended. When a participant released
the mouse at the correct setting, the slider turned green to show it had been
completed. To ensure that the task took close to the allotted 30 seconds, at the
beginning of the task only the top slider was enabled, and the other four were
grayed out. Additional sliders were enabled at five-second intervals, such that
all five sliders were available after 20 seconds.

Before beginning the experiment, participants chose one of four videos available
on YouTube: an episode of "Planet Earth", and episode of "The Great British
Bakeoff", and episode of "Mythbusters", or an Ellen Degeneres comedy special.
The video was embedded in the experiment with all user controls (such as
skipping ahead) disabled (Figure {@fig:exp1task}b). When given access to the video, participants had to keep the
browser window open and hold down the space bar for the video to play. This allowed us to ensure that
participants maintained engagement with the content.

Participants completed a total of 70 work
periods. For the first 10 work periods, participants simply clicked a button to begin the
slider task. After these initial periods, participants gained access to six
machines that could potentially complete the slider task for the participant,
allowing the participant to watch their chosen video instead. However, the
machines did not always function, and participants had to make a decision about
how to set the machine before each use.

#### Decision-making task and conditions.
Following the initial 10 periods, participants were shown a machine before each
work period and,
as shown in Figure {@fig:exp1task}c, had to select
between two circular spinners with arrows at the top: the "current spinner"
(exploit) and the "new spinner" (explore).
The current spinner was split into
five black and five gold wedges. If a participant chose the
current spinner, it spun and, if the arrow landed on gold, the machine
worked and the participant could watch the video. Initially, the
current spinner's gold wedges were randomly set for each machine to cover between
1/3 and 2/3 of the spinner.

The new spinner initially showed a question mark. If a participant chose the
new spinner, then a new spinner was
created and appeared on the machine. The new spinner's gold wedge could cover anywhere from
0% to 100% of the spinner. The new spinner then
spun and, if the arrow landed on gold, the machine worked.

Critically, if the new spinner had a greater gold area than the current
spinner, the new spinner was "saved" and the current spinner was
updated to the new spinner.  This created an explore&ndash;exploit tradeoff in which 
choosing a new spinner carried immediate risk, but could carry long-term
benefits by improving the current spinner from its initial value.

The experiment's two conditions differed in what occured after the participant spun the spinner.
In the immediate condition, the machine ran immediately after the choice was made and affected the
next work period, as shown in Figure {@fig:exp1machinemap}a. It then "cooled off" for the
following five periods, as choices were made with the other five machines. In the delayed condition,
each machine was presented to the participant four work periods before it was scheduled to run, and the participant
made a choice at that time. The machine then had to "process" for four work periods, thus delaying the outcome by over
2 minutes (Figure {@fig:exp1machinemap}b). The participant then returned to the machine to observe its outcome and either perform the 
slider task or watch the video. The machine then cooled off for a single period before being ready for another
choice. 

Finally, in order to induce exploration throughout the entire experiment, the
six machines would occasionally "reset" after they ran. When this occurred,
the current spinner would be set to a new random value between 1/3 and 2/3 gold.
Participants were informed that this would occur randomly on
1/6 of trials. In fact, the procedure was designed so exactly one of the six
machines would reset on each cycle through the machines, and no machine would be
reset on two consecutive uses.

#### Training, incentives, and post-experiment questions
Before beginning the full experiment, participants completed two
practice phases. First, they performed several trials of practice using the
machines, with the actual work periods removed. Then, they performed two work
periods practicing the slider task and one work period practicing the video task.
During the machine choices, participants had access to an "info" button at the
bottom of the screen that provided reminders about the dynamics of the task.

Participants were given a performance-based bonus of $3.00 for completing the
consumption tasks accurately. If they missed fewer than 10% of sliders throughout
the experiment and left the video paused less than 20% of the time, they were
not penalized. However, if they missed more sliders or left the video paused for
longer, they lost 10 cents from their bonus for each additional percentage of
sliders missed or time with the video paused. The running percentage of sliders
missed and video pause time was displayed at the top of the screen throughout
the experiment.

Following the experiment, participants were asked to rate their enjoyment of the
slider task and of the video-watching task on a 1 to 7 scale.

## Results

As a basic check of our consumption tasks, we confirmed that participants rated
the video as more enjoyable on average (5.65 out of 7) than the
slider task (3.13 out of 7), $t(39)=9.26$, $p<.001$.

To analyze participants' trial-by-trial decision-making, we conducted a hierarchical
Bayesian logistic regression using the Stan modeling language [@stan-software:2015].
This approach allowed us to estimate population-level effects of the
current-spinner value and of condition, while also allowing for individual
differences. The regression model included an intercept term as well as terms
for the value of the current spinner, the participant's condition, and a
condition by value of current spinner interaction.
We included predictors for the value of the current spinner,
the participant's condition, and the interaction
between condition and current spinner value.
Condition was coded as -1 for the immediate condition and 1 for the delayed
condition; current spinner value was rescaled to have zero mean
and unit variance across participants. We assumed that individuals could vary in their overall tendency
to explore (i.e., intercept) as well as their responsiveness to current spinner
value (slope). Participants' individual-level parameters were assumed to be
drawn from a t distribution with $df=5$, making our population level estimates
robust to potential outliers. The priors on the
the population-level predictor coefficients, and on the standard
deviation of the t distributions from which individual-level parameters were drawn, were (truncated)
normal distributions with a mean of 0 and a standard deviation of 5.


![Model-based estimates of participants' probability of choosing a new
  spinner for different values of the current spinner in Experiment 1. Thick
  lines and shaded regions indicate the mean and 95\% posterior interval for the
  population-level parameters, while the thin lines indicate the mean posterior
  parameters for each of the 40 individual participants. Participants in the
  delayed-outcome condition were no more
  likely to explore at a given current-spinner value than those in the
  immediate-outcome condition.](figures/exp1results.pdf){#fig:exp1results}

The model posterior was estimated using the Stan modeling language
[@Carpenter2017]. We ran four chains of Hamiltonian Monte Carlo sampling, with
1000 samples per chain, the first half of which were discarded as burn-in. We
confirmed convergence using the $\hat{R}$ convergence criterion [@Gelman2014a].
In the results below, we report 95% credible intervals (CIs) on model
parameters of interest. An overview of the model posterior is displayed in Figure @fig:exp1results.

Participants were less likely to choose a new spinner when the current spinner
has a high value, $CI=[-4.13, -2.52]$. However, in this experiment we found no evidence of
an effect of condition, $CI=[-.58, .73]$. This means that participants were no more likely 
to explore a new spinner when there
was a temporal delay imposed between their choices and the received outcomes.
However, there may have been a small interaction between current spinner value and
condition, such that participants in the delayed condition were less sensitive
to the value of the spinner when making their choices $CI=[-.27, 1.42]$. This might indicate that
the delayed condition was confusing to some participants, as a few individuals
(as seen in Figure @fig:exp1results) changed their behavior very little
across current-spinner values. 


# Experiment 2

In Experiment 1, we found no evidence of the delay in rewards leading to an
increase in exploratory choice. However, there were several potential flaws in
the experiment design which may have prevented present bias from occurring or
its effects from being observed. In Experiment 2, we preregistered the design,
collected a larger sample, and attempted to improve on
Experiment 1 in several ways.

We conducted Experiment 2 in person, rather than using AMT. This ensured
that participants had few distractions from the consumption tasks, potentially
increasing their motivational effect. We also made the slider task more aversive
and the video task more pleasant. To do so, we added an intermittent static
noise during the slider tasks, and allowed people to switch among the four
videos at will, without having to hold down the space bar to keep the video
playing.

To simplify and improve the exploratory choice task, in Experiment 2 there was a
single machine, rather than six. Rather than the machine "processing" for four
trials in the delayed condition, outcomes were added to a "work queue" that
delayed the consumption task by eight trials. This was both simpler and increased
the delay length. The visual appearance of the exploratory choice task was also
redesigned to make the statistics of the task more transparent.

Finally, we measured participants' impulsivity, a potentially important
covariate, using the Barratt Impulsiveness Scale [@Patton1995]. There is
evidence that this scale correlates with present-focused behavior in repeated
choice tasks [@Otto2012], though other studies have not found a relationship [@Brown2009].

## Methods

The experiment was preregistered through the Open Science Framework. The
preregistration can be found at: osf.io/3r9ke.

### Participants.

One hundred people from the general community took part in the study in person
at New York University. The participants had a mean age of 23.9 (SD=6.1). Fifty
eight self-reported female, forty one male. Participants received $10 for
taking part in the study, which lasted approximately one hour, and received a
performance-based bonus of up to $5. All but one participant received a bonus of
$5, with the remaining participant receiving $4.4. Participants who
failed a post-instructions questionnaire more than twice were excluded from
further analyses. Ten participants were excluded in this manner.

### Design and procedure.

#### Barratt Impulsiveness Scale

Prior to reading the experiment instructions, participants completed the 30-item
Barratt Impulsiveness scale [@Patton1995] on the computer. 

#### Consumption tasks.

![Examples of the Experiment 2 tasks, which resemble the Experiment 1 tasks.
(a): the slider task. (b): the video task. (c): the decision-making task. After
making a choice in the decision-making task, the produced outcome was added to
the work queue, pictured at the bottom of (c).](figures/experiment2tasks.png){#fig:exp2tasks}

Participants were informed that there were two types of tasks, a "slider task"
and a "video task," that they would complete during 30-second "work periods."
The number of remaining work periods in the experiment was shown at the top of
the screen, as was the number of seconds left in the current work period.

The slider task was the same as the one described in Experiment 1, and is
pictured in Figure {@fig:exp2tasks}a. To make
the slider task more unpleasant, a short static noise was played through the computer
speakers at a moderate volume (78db) at irregular intervals of approximately
once every three seconds during the task.

As in Experiment 1, the video tasks consisted of simply watching one of four videos: an episode of
"Planet Earth", and episode of "The Great British Bakeoff", and episode of
"Unchained Reactions", or an Ellen Degeneres comedy special. Participants
watched the video through a player on the computer screen. Unlike in Experiment
1, they did not have to hold down a button to play the video. They were free to
fast forward or rewind the video at will, and could also switch among the videos
at any time by clicking one of four tabs above the player (see Figure {@fig:exp2tasks}b).

#### Choice task.

Participants completed a total of 56 work periods. The first eight were
automatically spent performing the slider task. For the remaining 48,
participants made a choice prior to each work period that determined whether the
work period would be devoted to the slider task or the video task. This choice
task resembled the choice task used in Experiment 1.

Participants were shown a "machine" that could create
slider or video tasks (Figure {@fig:exp2tasks}c). The machine consisted of a black-and-gold "best" spinner and a
panel of possible new spinners. Participants selected either "run best spinner"
or "run new spinner".
If the participant selected "run best spinner", the spinner would visually
rotate on the screen. If it landed on gold, the machine created a video task; if
it landed on black, the machine created a slider task. 

If the participant selected "run new spinner", the new spinners in the panel
were covered up and randomly shuffled. The participant then clicked one of the
gray squares, revealing the new spinner underneath. As was explained to the
particpants, and was visually apparent, one third of the possible new spinners
are completely black, while the remaining two thirds range from 5% to 100% gold,
in even increments of 5%.

After revealing a new spinner, it was spun, producing a video or slider task in
the same manner as the "best spinner". As in Experiment 1, if the new spinner selected had
a higher proportion gold than the best spinner, it would replace the best
spinner for future choices. 

Participants were also informed that after every work period there was a one in
six chance that the machine would reset itself. In fact, the experiment was
designed so that there was exactly one reset in every set of 6 trials (i.e.,
trials 1&ndash;6, 7&ndash;12, etc.). When the machine reset, the "best
spinner" was set to a new starting value. The starting values following resets
(including the intial starting value) were {20%, 25%, &hellip; 55%, 60%}, randomly
ordered.

#### Immediate and delayed conditions.

Participants were pseudo-randomly assigned to one of two conditions. In the
Immediate condition, participants completed the task produced by a choice in the
work period immediately following the choice. In the Delayed condition,
participants completed the task produced by a choice after eight intervening
work periods had passed, which was about five minutes after making the choice.
This means that participants in the Delayed condition began making choices
during the initial eight slider task work periods, in order to have outcomes
determined when they reached the ninth and later work periods.

To make this delay intuitive, participants were shown a work queue at the bottom
of the screen that contained eight tasks (see the bottom of Figure
{@fig:exp2tasks}c). In the Delayed condition, upon making a choice a 
new slider or video task icon was added to the right of the queue,
and then the leftmost task on the queue was performed and removed. In the
Immediate condition, participants were still shown the cue, but upon adding an
icon to the right of the queue that outcome was performed immediately. This
means that in the Immediate condition the queue acted simply as a history of the
past eight outcomes.

#### Training, incentives, and post-task questions.

As in Experiment 1, participants had opportunities to practice the decision
making and consumption tasks prior to the main task, and rated their enjoyment
of the slider and video tasks on a scale from 1 to 7.

To incentivize participants to attend to and perform the slider task, they were
penalized if they missed more than 10% of the sliders. For each percentage over
10% of sliders that were not set to 50 over the course of the experiment, $.20
was deducted from a bonus that started at $5.00. 


## Results

Our primary hypothesis was that participants in the delayed-outcome condition
would take more exploratory actions (that is, choose a new spinner more often)
than those in the immediate-outcome condition. A secondary hypothesis was that
this change would be moderated by participants' scores on the Barratt Impulsivity
Scale. Specifically, we expected that highly impulsive participants would
explore less and show a bigger difference in exploration between the delayed and
immediate conditions.

We tested these predictions via hierarchical Bayesian logistic regression on
participant choices. All aspects of this analyses were preregistered prior to
data collection. We included predictors for the value of the current spinner,
the participant's BIS score, the participant's condition, and interactions
between condition and current spinner value and condition and BIS score.
Condition was coded as -1 for the immediate condition and 1 for the delayed
condition; current spinner value and BIS score were rescaled to have zero mean
and unit variance across participants. We assumed that individuals could vary in their overall tendency
to explore (i.e., intercept) as well as their responsiveness to current spinner
value (slope). Participants' individual-level parameters were assumed to be
drawn from a t distribution with $df=5$, making our population level estimates
robust to potential outliers. The priors on the
the population-level predictor coefficients, and on the standard
deviation of the t distributions from which individual-level parameters were drawn, were (truncated)
normal distributions with a mean of 0 and a standard deviation of 5.

The model posterior was estimated using the Stan modeling language
[@Carpenter2017]. We ran four chains of Hamiltonian Monte Carlo sampling, with
1000 samples per chain, the first half of which were discarded as burn-in. We
confirmed convergence using the $\hat{R}$ convergence criterion [@Gelman2014a].
In the results below, we report 95% credible intervals (CIs) on model
parameters of interest. An overview of the model posterior is displayed in Figure @fig:results


![Model-based estimates of participants' probability of choosing a new
  spinner for different values of the current spinner in Experiment 2. Thick
  lines and shaded regions indicate the mean and 95\% posterior interval for the
  population-level parameters, while the thin lines indicate the mean posterior
  parameters for each of the 100 individual participants. Participants in the
  delayed-outcome condition were no more
  likely to explore at a given current-spinner value than those in the
  immediate-outcome condition.](figures/expresults.pdf){#fig:results}

We found a strongly negative effect of current spinner value on participant's
probability of selecting a new spinner, $CI=[-4.18, -3.08]$. This indicates that
participants understood the general structure of the task, and explored (i.e.,
selected a new spinner) only when it was advantageous to do so. While the
estimate was in the predicted direction, we found no clear effect of condition
on the tendency to explore $CI=[-.11, .61]$. Additionally, there was no effect of BIS
score on behavior $CI=[-.34, .36]$ and no interaction between BIS score and
condition $CI=[-.21, .51]$. We did find a positive interaction between condition
and current spinner value, $CI=[.07, 1.06]$. This means that while people in the
delayed condition were not more or less likely to explore in general, they were
more likely to explore for high current spinner values, and less likely to
explore for low current spinner values. In other words, they were less sensitive
to the current value of the spinner.

Our preregistered analyses provided no support for our hypotheses. As an
additional, exploratory analysis, we re-ran the Bayesian model replacing
participants' BIS scores with their ratings difference between the slider task
and the video task in post-experiment questionnaire. Over all, participants rated
the video task as more enjoyable (6.37 out of 7 on average) than the slider task,
(3.43 out of 7), $t(89)=16.3, p<.001$. Our intuition was that
participants who rated the video task much higher than the slider task may have
felt a greater motivational pull to immediately watch a video instead of move
slider, and may thus have been more susceptible to the delay manipulation.
However, we found no main effect of ratings difference on exploration $CI=[-.32,
.16]$, and no interaction between ratings difference and condition $CI=[-.33,
.38]$. All other effects remained qualitatively the same.

Finally, we examined whether the lower sensitivity to current spinner value in
the delay condition might indicate that a group of participants in that
condition were responding near-randomly, possibly due to confusion with the
task, and if this could affect our other results. We found that that the
individual-level effect of current spinner value did not differ significantly
from zero for 14 of 44 participants in the delayed condition, and only 2 of 46
participants in the immediate condition. To determine whether these near-random
participants influenced our results, we re-ran our preregistered regression,
including only the 30 participants with the highest-magnitude slopes in each
condition from the initial analysis. We did not find that this new selection
criterion affected our results. In particular, the credible interval for the
main effect of delay still included zero, $CI=[-.08, .72]$.

# Experiment 3

In both Experiments 1 and 2, we found no evidence that delaying rewards affected
the degree of exploratory behavior, and thus no evidence that exploratory choice
is influenced by present bias. Experiment 2 attempted to fix several flaws of
Experiment 1 by collecting data in person, making the consumption tasks more
pleasant or more aversive, increasing the reward delay, and simplifying the
exploratory choice task. This may indicate that there is truly no effect of
present bias on exploratory choice, but it remains possible that this null
effect is due to a weakness in our experiment design.

The most apparent potential weakness is that the consumption tasks did not
induce very much present bias, or that discounting of these stimuli occurred on
a scale much longer than the delay of a few minutes used in our experiments. Our
use of these stimuli was based on several past studies. Access to videos has
been shown to induce present bias with a delay of around a minute [@Navarick1998], and
cessation of annoying noises can induce present bias with a delay of around ten
seconds [@Solnick1980]. However, these studies were were small and differed from
the current setting in important ways. For example @Solnick1980 had participants
make choices about noise cessation while solving math problems, which prevented
them from focusing fully on the choice task. 

It may be that the consumption
tasks and setting we used did not, in fact induce present bias, which would mean
that inducing a delay would have no predicted effect. Therefore, in Experiment 3
we conducted a simple follow-up experiment using the two consumption tasks to
test whether people have a present bias for watching the videos and avoiding the
slider task and static noises,
based on the design of past experiments which studied time preferences for videos or video
games [@Millar1984; @Navarick1998].

## Methods

### Participants.

### Design and procedure.

![Examples of the Experiment 3 tasks. (a): an example of the slider task, in
which the numeric timer has been replaced by a red timer bar. (b): an example of
the video task. (c): an example of the decision-making task.](figures/experiment3tasks.png){#fig:exp3tasks}

As in Experiment 2, the Barratt Impulsiveness Scale was administered prior to
completing the main task.

In the main task, shown in Figure {@fig:exp3tasks}c, participants were instructed that they would have to make
a series of choices between two buttons. They were told that after selecting a
button they would spend some amount of time performing a boring slider task and
a fun video task, and that their choice could affect the amount of time spent on
each task and the order of the tasks. They were also instructed that for their
first two choices they would have to click first one button, then the other, to
ensure that they had experienced both outcomes, and that occasionally the
outcomes would change, at which point they would be instructed to try each of
the two buttons again. On all other trials, they were told to select whichever button
they preferred. Participants' previous choice was displayed at the bottom of the
screen as a memory aid.

The slider and video tasks were very similar to the tasks used in Experiment 2
(Figure {@fig:exp3tasks}a/b).
To prevent participants from explicitly measuring the amount of video and slider
time following a choice, the timer showing how many seconds remaining in the
consumption task was removed. For the slider task, it was replaced by horizontal
red "progress bar" that steadily shrank over the course of the task, thereby
indicating seconds remaining. For the video task, there was no indication of
seconds remaining. In addition, instead of always lasting 30 seconds, the
consumption tasks varied in length. For a slider task that lasted $s$ seconds,
there were $s/5-1$ sliders to complete.

After practicing the slider and video tasks, participants completed 30 trials of
the choice task. This was divided into three groups of ten trials, each of which
had a new pair of outcomes. The outcomes always lasted 90 seconds in total, and
for each group there was always one button that
produced the video task immediately, followed by the slider task, and one that
produced the slider task immediately, followed by the videos. The reward amounts
and reward orders of the three groups were as follows:

1. 30s videos/60s sliders vs. 60s sliders/30s videos
2. 35s videos/55s sliders vs. 65s sliders/25s videos
3. 25s videos/65s sliders vs. 55s sliders/35s videos

The ordering of the three pairs of outcomes was counterbalanced across
participants, and the pairing of outcomes the left and right button was
randomized. Absent discounting, participants should be indifferent between
the two options in pair 1, and prefer the options with more video time in pairs
2 and 3. However, we predicted that while amount of video time would also
matter, participants would display a bias towards selecting the option with the
immediate video task.

As in Experiments 1 and 2, participants were asked to rate their enjoyment of
the two consumption tasks following the experiment. They were also penalized for
missing sliders using the same scoring method as Experiment 2.

## Results

ASSUME THEY'RE VERY NULL

# Discussion

In this study, we set out to test whether people's well-documented bias towards
immediate rewards affects exploratory choice in a manner similar to other
intertemporal choices, thus producing a bias towards under-exploration
[@Frederick2002; @myerson1995discounting]. We
tested this using a paradigm in which we added a temporal delay to outcomes in
an exploratory choice task, following the design of many prior intertemporal
choice tasks [@Kirby1995; @Solnick1980; @Brown2009]. In two experiments we found
that adding a temporal delay did not affect exploration, suggesting that people
treat exploratory choices differently from intertemporal choices. However, a
followup study showed that the rewards used in our task did not consistently
produce present bias, making it difficult to draw clear conclusions from our
earlier results. In this section, we briefly discuss why our rewards may not
have been motivationally effective, as well as delve into the similarities and
differences between exploratory and intertemporal choice.

## Revisiting immediately consumable rewards

Experiments 2 and 3 used three types of consumable rewards to try to induce a
present bias: enjoyable videos, a boring slider task, and an annoying static
noise. The time difference within which we expected to observe a present bias
was about five minutes (Experiment 2) or one minute (Experiment 3).
While the slider task has not been used in the past to produce present bias,
both videos and static noises have. @Navarick1998 found that 40% of participant
showed a consistent strong bias towards watching an immediate shorter video, even
when a longer video could be obtained by waiting 30 seconds. @Solnick1980 found
that a 90 second cessation of noise was preferred over a 120 second sessation
with a 60 second wait, but found that this preference flipped when a front-end
delay of only 30 seconds was added. And in a similar vein, @Millar1984 found
that people strongly preferred 20 seconds playing a video game followed by a 40 second
wait to a 40 second wait followed by 20 seconds playing a video game, but that
this preference shrank when a 60 second front-end delay was added.

Assuming that these past results are indicative of a true underlying present
bias in the average populations, it may by that our experiment differed from
past experiments in ways that undermined present bias. For example, The
experiments of @Navarick1998 and @Millar1984 were conducted in a dark room,
which might have cut down on external distractions, while ours were not. The
experiments of @Solnick1980 used louder noises than ours, and were conducted with a distractor task of solving
math problems which might have caused people to make their choices with more
impulsivity and less cognitive reflection. We hoped that our combination of
multiple stimuli (videos, noises and sliders) would overcome any weaknesses in
the implementation of any one, but this may not have been the case.

It is also worth considering that these older experiments might
not meet current statistical standards, and that the motivational effectiveness of these sorts of
consumable rewards should be reconsidered. @Navarick1998, in fact, did not
report present bias at the population level, and focused his analyses on
individuals. @Solnick1980 and @Millar1984 did make claims of present bias over
short time scales on a group level, but used between-participant designs with
quite small groups of 10 to 15 people per condition. Their results in many cases
appear strong qualitatively but the statistics calculated are not clearly
reported. More recent tests of present bias with consumable rewards also reveal
some statistical weaknesses; in their experiments with soda as a reward,
@Brown2009 first ran 44 participants and then apparently increased their sample
size to 55 after reviewing the results, and also only found an effect of delaying
rewards (by 10 minutes) at the $p<.1$ significance level.

Unfortunately, collecting a large amount of decision-making data with immediately consumable
rewards is highly time consuming, because each consumption event takes time and
trials must be temporally distributed to induce temporal discounting. However,
given our findings in the current study, and the limitations of past studies, we
would strongly recommend that future researchers endeavor to replicate the
finding that present bias can be induced for videos or noises before attempting
to use these stimuli for novel research questions.

## Relating Exploratory and Intertemporal Choice

While our results in Experiments 1 and 2 do not provide strong evidence against
present bias influencing exploratory choice, it is still worth considering ways
in which exploratory choice may, in fact, differ from standard intertemporal
decision making. In some situations, exploratory decisions can look very much
like other intertemporal decisions, and thus it would be highly surprising if
the same qualities of temporal discounting were not involved. This would be
expected particularly in situations where an extended bout of exploration is
very likely to produce greater long term rewards. For example, going to college
and selecting classes could be considered a series of exploratory choice among a
variety of life paths. In this case, many students are likely highly confident that through
this exploration they will find a life path more rewarding than those available without
it, making college a more straightforward tradeoff between up-front costs
and long-term benefits [@Stange2012].

But while some exploratory choices are in practice very much like intertemporal
choices, and all exploratory choices *in theory* have aspects of intertemporal
choice, there are also important differences. Intertemporal choices, as they
appear in the lab and (sometimes) in real life, present a clear choice between
rewards now and later. In exploratory choice, the tradeoff between the present
and future is implicit, with exploring leading to a decreased probability of
high reward immediately and a greater probability of high reward in later
choices. While past work shows that people are able to consider these reward
tradeoffs in some situations[@Wilson2014a; @Rich2017], doing so might not be
natural or easy in all situations. Even in standard intertemporal choice tasks,
the effect of time delays on decision making seems to be fragile and sensitive
to contextual effects [@Ebert2007; @Lempert2015a].

Instead of treating exploratory choice like intertemporal choice, people may
rely on other motivational and cognitive factors to balance exploration and
exploitation. Curiosity acts as an innate drive towards information-seeking
[@Berlyne1966; @Loewenstein1994; @Kidd2015], and some researchers speculate that
curiousity may in fact have evolved to induce exploration [@Singh2004;
@Oudeyer2009]. If exploration is inherently rewarding due to its potential to
reveal information, then its rewards are moved from the future to the present
and temporal advantage of exploitation is removed. Even in situations where
people likely have low intrinsic curiousity about outcomes, people still appear
to have strategies for choosing when to explore that are based on heuristics, 
exploration "bonuses," or added decision noise, rather than a full consideration
of the future [@daw2006cortical; @Speekenbrink2015; @Wilson2014a]. To the extent
that people use these strategies, they may not change their behavior based on
the timing of rewards, even if doing so would be in line with their preferences.

The considerations of this discussion suggest that
continuing to study exploratory choice in the lab, in order to show that present
bias simply does or does not exist, may not be most fruitful path for future
research. A more rewarding route may be to further consider the range of
exploratory choices in their true, naturalistic settings, and seek to understand
when exploratory choice is treated similarly to intertemporal
choice,and when it is not. While field data do not allow the experimental
control available in the lab, they would allow researchers to collect data with
significant temporal spans and in situations where major motivational forces, from present bias
to curiosity, are at play.

# References
