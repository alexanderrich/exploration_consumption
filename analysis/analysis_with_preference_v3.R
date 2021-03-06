library('dplyr')
library('rstan')
library('tidyr')

## set stan to run in parallel
rstan_options(auto_write = TRUE);
options(mc.cores = parallel::detectCores())

## load data that been downloaded from database and filter out pre-task "practice" trails
exploredata <- read.csv('../data/exploration_data_v3_0.csv')
exploredata <- exploredata %>% filter(taskType != "practice")

## load questionaire data, including BIS answers
questiondata <-  read.csv('../data/question_data_v3_0.csv')

## exclude participants who failed instruction quiz more than twice,
## or missed more than 20% of sliders in negative-reward slider task
excluded_ids <- questiondata %>%
  filter(misses_consumption > 20 |
         instructionloops > 2) %>%
  .$uniqueid

exploredata <- exploredata %>% filter(!(uniqueid %in% excluded_ids))
questiondata <- questiondata %>% filter(!(uniqueid %in% excluded_ids))
exploredata$uniqueid <- factor(exploredata$uniqueid)

## reverse some columns of BIS, following standard coding procedure
reverse_columns <- c('bis9', 'bis20', 'bis30', 'bis1', 'bis7', 'bis8', 'bis12',
                     'bis13', 'bis10', 'bis15', 'bis29')
for(c in reverse_columns) {
  questiondata[,c] <- -questiondata[,c]
}

## get sum of raw BIS scores, and merge into experiment data
questiondata$bis <-  rowSums(select(questiondata, bis1:bis30))
questiondata = questiondata %>% mutate(enjoymentdiff = videoenjoyment - sliderenjoyment)
exploredata <- merge(exploredata, select(questiondata, uniqueid, bis, enjoymentdiff), by="uniqueid")

mean(questiondata$videoenjoyment)
mean(questiondata$sliderenjoyment)
t.test(questiondata$enjoymentdiff)

chosenValues = exploredata %>%
  mutate(chosenValue=ifelse(response, .333, currentValue)) %>%
  group_by(condition, uniqueid) %>%
  summarize(chosenValue = mean(chosenValue))



## create variables for stan model, normalize current task state (currentValue) and enjoyment diff.
N <- nrow(exploredata)
L <- nlevels(exploredata$uniqueid)
y <- exploredata$response
currentVal <- (exploredata$currentValue - mean(exploredata$currentValue))/sd(exploredata$currentValue)
condition <- exploredata$condition * 2 - 1
## bis <- (exploredata$bis - mean(exploredata$bis))/sd(exploredata$bis)
enjdiff <- (exploredata$enjoymentdiff - mean(exploredata$enjoymentdiff))/sd(exploredata$enjoymentdiff)
ll <- as.integer(exploredata$uniqueid)

## run stan model
model <- stan_model(file="stan_models/regression_enjdiffT.stan")
fit <- sampling(model, data=c("N", "L", "y", "ll", "currentVal", "condition", "enjdiff"), chains=4, iter=1000, seed=1234)

## Print summary statistics of population-level parameters.
## Parameter is "significantly" different from 0 if 95% credible interval excludes 0.
print(fit, pars=c("intercept_mean", "intercept_sd",
                  "slope_mean", "slope_sd",
                  "b_delay",
                  "b_delay_slope",
                  "b_enjdiff",
                  "b_enjdiff_delay"))

extracted= rstan::extract(fit, permuted=TRUE, pars=c("intercept_mean", "intercept_sd",
                  "slope_mean", "slope_sd",
                  "b_delay", "b_delay_slope",
                  "b_enjdiff", "b_enjdiff_delay"))

individuals = rstan::extract(fit, permuted=TRUE, pars=c('subj_intercept', 'subj_slope'))

extracted <- lapply(extracted, as.numeric)

extracted <- data.frame(extracted)

extracted$sample <- 1:2000


b_delay<- mean(extracted$b_delay)
b_delay_slope <- mean(extracted$b_delay_slope)

params_w_predictions <- extracted[rep(1:nrow(extracted), each=21), ]
params_w_predictions <- params_w_predictions %>%
  mutate(x=rep(seq(from=0, to=1, length.out=21), 2000),
         x_norm=(x-mean(exploredata$currentValue))/sd(exploredata$currentValue),
         cond0=1/(1 + exp(-1 * (intercept_mean - 0.5 * b_delay + slope_mean * x_norm  - 0.5 * b_delay_slope * x_norm))),
         cond1=1/(1 + exp(-1 * (intercept_mean + 0.5 * b_delay + slope_mean * x_norm  + 0.5 * b_delay_slope * x_norm)))) %>%
  gather(condition, y, cond0, cond1) %>%
  group_by(x, condition) %>%
  summarize(lower=quantile(y, probs=.025),
            upper=quantile(y, probs=.975),
            y=mean(y))

ggplot() + geom_line(data=params_w_predictions, aes(x=x, y=y, color=condition)) +
  geom_ribbon(data=params_w_predictions, aes(x=x, ymin=lower, ymax=upper, group=condition), alpha=.3)
