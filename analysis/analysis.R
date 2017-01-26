library("dplyr")
library("ggplot2")
library("tidyr")
library("lme4")

exploredata <- read.csv('../data/exploration_data_v2_4.csv')
consumptiondata <- read.csv('../data/consumption_data_v2_4.csv')

questiondata <- read.csv('../data/question_data_v2_4.csv')

questiondata$enjoymentdiff <- questiondata$videoenjoyment - questiondata$sliderenjoyment

mean(questiondata$videoenjoyment)
mean(questiondata$sliderenjoyment)
t.test(questiondata$enjoymentdiff)

## exploredata$condition <-  as.factor(exploredata$condition)

exploredata$videoenjoyment <- 0
exploredata$sliderenjoyment <- 0
for (id in levels(exploredata$uniqueid)) {
  exploredata[exploredata$uniqueid == id,"videoenjoyment"] <- questiondata[questiondata$uniqueid == id, "videoenjoyment"]
  exploredata[exploredata$uniqueid == id,"sliderenjoyment"] <- questiondata[questiondata$uniqueid == id, "sliderenjoyment"]
  exploredata[exploredata$uniqueid == id,"instructionloops"] <- questiondata[questiondata$uniqueid == id, "instructionloops_instructions.quiz.html"]
}

exploredata$enjoymentdiff <- (exploredata$videoenjoyment - exploredata$sliderenjoyment) / 10

exploredata <- exploredata %>%
  mutate(outcome5back=dplyr::lag(outcome, n=5, default=0),
         outcome1back=dplyr::lag(outcome, n=1, default=0),
         lastoutcome=ifelse(condition == 1, outcome5back, outcome1back))

practicedata <- exploredata %>% filter(taskType == "practice")
exploredata <- exploredata %>% filter(taskType != "practice")

exploredata$binnedValue <- floor(exploredata$currentValue * 30)/30


exploredata %>% group_by(condition, binnedValue) %>%
  summarize(response=mean(response)) %>%
  ggplot(aes(x=binnedValue, y=response, color=as.factor(condition))) +
  geom_line()


ggplot(exploredata, aes(x=currentValue, y=response, group=uniqueid, color=as.factor(condition))) +
  geom_point(position = position_jitter(width = 0, height = 0.05)) +
  geom_smooth(method="glm", family="binomial", se=FALSE)

exploredata$condition_norm <- exploredata$condition - .5
exploredata$currentValue_norm <- exploredata$currentValue - mean(exploredata$currentValue)
currentValue_mean <- mean(exploredata$currentValue)

summary(glmer(response ~ currentValue_norm + condition_norm + condition_norm:currentValue_norm + (currentValue_norm | uniqueid), exploredata, family="binomial"))

## it seems like the estimates don't change much between first and last half of data, but variance goes up in last half
summary(glmer(response ~ currentValue + condition + (currentValue | uniqueid), exploredata %>% filter(choiceTrial < 30), family="binomial"))

summary(glmer(response ~ currentValue + condition + (currentValue | uniqueid), exploredata %>% filter(choiceTrial >=  30), family="binomial"))

## there's less good data in the second half because more of the machines are
## good already, hence less exploration. In first half all machines start fairly
## low, so ge to observe more interesting behavior.
ggplot(exploredata %>% filter(choiceTrial < 30), aes(x=currentValue, y=response, group=uniqueid, color=condition)) +
  geom_point(position = position_jitter(width = 0, height = 0.05)) +
  geom_smooth(method="glm", family="binomial", se=FALSE)

ggplot(exploredata %>% filter(choiceTrial >=  30), aes(x=currentValue, y=response, group=uniqueid, color=condition)) +
  geom_point(position = position_jitter(width = 0, height = 0.05)) +
  geom_smooth(method="glm", family="binomial", se=FALSE)

## questiondata analyses
qplot(questiondata$videoChoice)
qplot(questiondata$enjoymentdiff)

## stan analyses

library("rstan")

rstan_options(auto_write = TRUE);
options(mc.cores = parallel::detectCores());

exploredata$ll <- as.integer(factor(exploredata$uniqueid))

N <- nrow(exploredata)
L <- max(exploredata$ll)
y <- exploredata$response
currentVal <- exploredata$currentValue_norm
condition <- as.numeric(as.character(exploredata$condition_norm))
ll <- exploredata$ll
lastOutcome <- exploredata$lastoutcome
standata = c("N", "L", "y", "ll", "currentVal", "condition", "lastOutcome")


fit <- stan(file="stan_models/regression.stan", data=standata, iter=1000)
save(fit, file="model_fits/regression.RData")
extracted=extract(fit, permuted=FALSE, pars=c("intercept_mean", "intercept_sd",
                                              "currentVal_mean", "currentVal_sd",
                                              "condition_intercept", "condition_slope"))
monitor(extracted, digits_summary=2)

## load("model_fits/regression.RData")

extracted=extract(fit, permuted=TRUE, pars=c("intercept_mean", "intercept_sd",
                                              "currentVal_mean", "currentVal_sd",
                                              "condition_intercept", "condition_slope"))

individuals=extract(fit, permuted=TRUE, pars=c("subj_intercept", "subj_currentVal"))

extracted <- lapply(extracted, as.numeric)

extracted <- data.frame(extracted)

extracted$sample <- 1:2000

cond_intercept <- mean(extracted$condition_intercept)
cond_slope <- mean(extracted$condition_slope)

params_w_predictions <- extracted[rep(1:nrow(extracted), each=21), ]
params_w_predictions <- params_w_predictions %>%
  mutate(x=rep(seq(from=.333, to=1, length.out=21), 2000),
         x_norm=x-mean(exploredata$currentValue),
         cond0=1/(1 + exp(-1 * (intercept_mean - 0.5 * condition_intercept + currentVal_mean * x_norm  - 0.5 * condition_slope * x_norm))),
         cond1=1/(1 + exp(-1 * (intercept_mean + 0.5 * condition_intercept + currentVal_mean * x_norm  + 0.5 * condition_slope * x_norm)))) %>%
  gather(condition, y, cond0, cond1) %>%
  group_by(x, condition) %>%
  summarize(lower=quantile(y, probs=.025),
            upper=quantile(y, probs=.975),
            y=mean(y))


individuals_w_predictions <- data.frame()

for (i in 1:nrow(questiondata)) {
  c <- questiondata[i, "condition"] - 0.5
  subject_params <- cbind.data.frame(subject=rep(i, 2000), condition=rep(c, 2000), intercept=as.numeric(individuals$subj_intercept[,i]), slope=as.numeric(individuals$subj_currentVal[,i]))
  subject_params <- subject_params %>%
    mutate(intercept=intercept + c * cond_intercept, slope=slope + c * cond_slope)
  subject_params <- subject_params[rep(1:nrow(subject_params), each=21), ]
  subject_params <- subject_params %>%
    mutate(x=rep(seq(from=.333, to=1, length.out=21), 2000),
           x_norm=x - currentValue_mean,
           y=1/(1 + exp(-1 * (intercept + slope * x_norm)))) %>%
    group_by(x) %>%
    summarize(subject=first(subject),
              condition=first(condition),
              y=mean(y))
  individuals_w_predictions <- rbind(individuals_w_predictions, subject_params)
}

individuals_w_predictions$condition <- factor(individuals_w_predictions$condition, labels=c("cond0", "cond1"))

## ggplot(individuals_w_predictions, aes(x=x, y=y, group=subject, color=as.factor(condition))) + geom_line()

ggplot() + geom_line(data=individuals_w_predictions, aes(x=x, y=y, group=subject, color=condition), size=.5, alpha=.5) +
  geom_line(data=params_w_predictions, aes(x=x, y=y, color=condition), size=2) +
  geom_ribbon(data=params_w_predictions, aes(x=x, y=y, ymin=lower, ymax=upper, group=condition), alpha=.3) +
  scale_color_discrete(name="condition", labels=c("low-explore", "high-explore")) +
  scale_x_continuous(breaks=c(0.4, 0.6, 0.8, 1), labels=c("40%", "60%", "80%", "100%")) +
  xlab("current-spinner value") +
  ylab("p(choose new spinner)") +
  theme_minimal() +
  coord_cartesian(xlim = c(.333, 1))+
  theme(legend.position="bottom")
ggsave(filename="../doc/cogsci2017/figures/exp1results.pdf", width=5, height=3.5, useDingbats=F)


## fit <- stan(file="stan_models/regression_lastoutcome.stan", data=standata, iter=1000)
## save(fit, file="model_fits/regression_lastoutcome.RData")
## extracted=extract(fit, permuted=FALSE, pars=c("intercept_mean", "intercept_sd",
##                                               "currentVal_mean", "currentVal_sd",
##                                               "lastOutcome_mean", "lastOutcome_sd",
##                                               "condition_intercept", "condition_slope", "condition_lastOutcome"))
## monitor(extracted, digits_summary=2)
