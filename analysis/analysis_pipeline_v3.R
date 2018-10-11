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
exploredata <- merge(exploredata, select(questiondata, uniqueid, bis), by="uniqueid")


## create variables for stan model, normalize current task state (currentValue) and BIS.
N <- nrow(exploredata)
L <- nlevels(exploredata$uniqueid)
y <- exploredata$response
currentVal <- (exploredata$currentValue - mean(exploredata$currentValue))/sd(exploredata$currentValue)
condition <- exploredata$condition * 2 - 1
bis <- (exploredata$bis - mean(exploredata$bis))/sd(exploredata$bis)
ll <- as.integer(exploredata$uniqueid)

## run stan model
model <- stan_model(file="stan_models/regression_bisT.stan")
fit <- sampling(model, data=c("N", "L", "y", "ll", "currentVal", "condition", "bis"), chains=4, iter=1000, seed=1234)

save(fit, file='model_fits/regression_bisT.RData')

load(file='model_fits/regression_bisT.RData')

## Print summary statistics of population-level parameters.
## Parameter is "significantly" different from 0 if 95% credible interval excludes 0.
print(fit, pars=c("intercept_mean", "intercept_sd",
                  "slope_mean", "slope_sd",
                  "b_delay",
                  "b_delay_slope",
                  "b_bis",
                  "b_bis_delay"))

extracted= rstan::extract(fit, permuted=TRUE, pars=c("intercept_mean", "intercept_sd",
                  "slope_mean", "slope_sd",
                  "b_delay", "b_delay_slope",
                  "b_bis", "b_bis_delay"))

individuals = rstan::extract(fit, permuted=TRUE, pars=c('subj_intercept', 'subj_slope'))

extracted <- lapply(extracted, as.numeric)

extracted <- data.frame(extracted)

extracted$sample <- 1:2000


mean_intercept <- mean(extracted$intercept_mean)
mean_slope <- mean(extracted$slope_mean)
mean_delay<- mean(extracted$b_delay)
mean_delay_slope <- mean(extracted$b_delay_slope)
mean_bis <- mean(extracted$b_bis)
mean_bis_delay <- mean(extracted$b_bis_delay)

params_w_predictions <- extracted[rep(1:nrow(extracted), each=51), ]
params_w_predictions <- params_w_predictions %>%
  mutate(x=rep(seq(from=0, to=1, length.out=51), 2000),
         x_norm=(x-mean(exploredata$currentValue))/sd(exploredata$currentValue),
         cond0=1/(1 + exp(-1 * (intercept_mean - 1 * b_delay + slope_mean * x_norm  - 1 * b_delay_slope * x_norm))),
         cond1=1/(1 + exp(-1 * (intercept_mean + 1 * b_delay + slope_mean * x_norm  + 1 * b_delay_slope * x_norm)))) %>%
  gather(condition, y, cond0, cond1) %>%
  group_by(x, condition) %>%
  summarize(lower=quantile(y, probs=.025),
            upper=quantile(y, probs=.975),
            y=mean(y))
params_w_predictions$condition = factor(params_w_predictions$condition, levels=c('cond0','cond1'), labels=c('immediate', 'delayed'))

individuals_df = data.frame(ll=ll, condition=condition, bis=bis) %>% group_by(ll) %>% summarize_all(mean)

individuals_w_predictions = data.frame()
for (i in 1:nrow(individuals_df)) {
  c = individuals_df[[i, "condition"]]
  bis = individuals_df[[i, 'bis']]
  subject_params <- cbind.data.frame(subject=rep(i, 2000),
                                     condition=rep(c, 2000),
                                     intercept=as.numeric(individuals$subj_intercept[,i]),
                                     slope=as.numeric(individuals$subj_slope[,i]))
  subject_params <- subject_params %>%
    mutate(intercept=intercept + c * mean_delay + bis * mean_bis + c * bis * mean_bis_delay,
           slope=slope +  c * mean_delay_slope)
  subject_params <- subject_params[rep(1:nrow(subject_params), each=51), ]
  subject_params <- subject_params %>%
    mutate(x=rep(seq(from=0, to=1, length.out=51), 2000),
           x_norm=(x-mean(exploredata$currentValue))/sd(exploredata$currentValue),
           y=1/(1 + exp(-1 * (intercept + slope * x_norm)))) %>%
    group_by(x) %>%
    summarize(subject=first(subject),
              condition=first(condition),
              y=mean(y))
  individuals_w_predictions <- rbind(individuals_w_predictions, subject_params)
}
individuals_w_predictions$condition = factor(individuals_w_predictions$condition, levels=c(-1, 1), labels=c('immediate', 'delayed'))


ggplot() +
  geom_line(data=individuals_w_predictions, aes(x=x, y=y, group=subject, color=condition), size=.3, alpha=.3) +
  geom_ribbon(data=params_w_predictions, aes(x=x, ymin=lower, ymax=upper, group=condition), alpha=.3) +
  geom_line(data=params_w_predictions, aes(x=x, y=y, color=condition), size=1.5) +
  theme_minimal() +
  xlab("current spinner value") +
  ylab("p(choose new spinner)") +
  theme(legend.position="bottom") +
  scale_x_continuous(breaks=c(0, 0.25, 0.5, .75, 1), labels=c("0%", "25%", "50%", "75%", "100%"))

ggsave(filename="../doc/journal/figures/expresults.pdf", width=6, height=3, useDingbats=F)

summary(colMeans(individuals$subj_slope))

slopes = individuals$subj_slope

quants = c()

quants = colMeans(slopes)

slopequantdf = data.frame(uniqueid=questiondata$uniqueid, condition=questiondata$condition, quant=quants)

slopequantdf = slopequantdf %>%
  group_by(condition) %>%
  top_n(30, -quant)

exploredatapartial = exploredata %>% filter(uniqueid %in% slopequantdf$uniqueid)

## create variables for stan model, normalize current task state (currentValue) and BIS.
N <- nrow(exploredatapartial)
L <- nlevels(exploredatapartial$uniqueid)
y <- exploredatapartial$response
currentVal <- (exploredatapartial$currentValue - mean(exploredatapartial$currentValue))/sd(exploredatapartial$currentValue)
condition <- exploredatapartial$condition * 2 - 1
bis <- (exploredatapartial$bis - mean(exploredatapartial$bis))/sd(exploredatapartial$bis)
ll <- as.integer(exploredatapartial$uniqueid)

## run stan model
model <- stan_model(file="stan_models/regression_bisT.stan")
fit <- sampling(model, data=c("N", "L", "y", "ll", "currentVal", "condition", "bis"), chains=4, iter=1000, seed=1234)

print(fit, pars=c("intercept_mean", "intercept_sd",
                  "slope_mean", "slope_sd",
                  "b_delay",
                  "b_delay_slope",
                  "b_bis",
                  "b_bis_delay"))
