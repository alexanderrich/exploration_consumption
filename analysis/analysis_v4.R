
library('dplyr')
library('rstan')
library('tidyr')

## set stan to run in parallel
rstan_options(auto_write = TRUE);
options(mc.cores = parallel::detectCores())

## load data that been downloaded from database and filter out pre-task "practice" trails
choicedata <- read.csv('../data/choice_data_v4_0.csv')

## load questionaire data, including BIS answers
questiondata <-  read.csv('../data/question_data_v4_0.csv')

## exclude participants who failed instruction quiz more than twice,
## or missed more than 20% of sliders in negative-reward slider task
excluded_ids <- questiondata %>%
  filter(misses > 20 |
         instructionloops > 2) %>%
  .$uniqueid

choicedata <- choicedata %>% filter(!(uniqueid %in% excluded_ids))
questiondata <- questiondata %>% filter(!(uniqueid %in% excluded_ids))
choicedata$uniqueid <- factor(choicedata$uniqueid)

questiondata$enjoymentdiff <- questiondata$videoenjoyment - questiondata$sliderenjoyment
mean(questiondata$videoenjoyment)
mean(questiondata$sliderenjoyment)
t.test(questiondata$enjoymentdiff)

choicedata$envNum = choicedata$trial %/% 10

choicedata$waitDiff = 0
index = list(c(1,2,3), c(1,3,2), c(2,1,3), c(2,3,1), c(3,1,2), c(3,2,1))
for (i in 1:nrow(choicedata)) {
  choicedata[i, 'waitDiff'] = c(-5, 0, 5)[index[[1+choicedata[i, 'condition']]][1+choicedata[i, 'envNum']]]
}

choicedata %>% group_by(waitDiff) %>% summarize(mean(choiceOutcome))


waitmeans = choicedata %>% group_by(uniqueid) %>% filter(envTrial > 1) %>% summarize(waitmean=mean(choiceOutcome)) %>% .$waitmean

t.test(waitmeans, mu=.5)

N = nrow(choicedata)
L = nlevels(choicedata$uniqueid)
y = 1-choicedata$choiceOutcome
immAdd = -choicedata$waitDiff / 5
ll = as.integer(choicedata$uniqueid)

model <- stan_model(file="stan_models/regression_T_v4.stan")
fit <- sampling(model, data=c("N", "L", "y", "ll", "immAdd"), chains=4, iter=1000, seed=1234)

print(fit, pars=c("intercept_mean", "intercept_sd",
                  "immAdd_mean", "immAdd_sd"))

extracted = rstan::extract(fit, permuted=TRUE, pars=c('intercept_mean', 'intercept_sd',
                                                      'immAdd_mean', 'immAdd_sd'))

individuals = rstan::extract(fit, permuted=TRUE, pars=c('subj_intercept', 'subj_immAdd'))

extracted = lapply(extracted, as.numeric)
extracted = data.frame(extracted)
extracted$sample = 1:2000

params_w_predictions = extracted[rep(1:nrow(extracted), each=3),]
params_w_predictions = params_w_predictions %>%
  mutate(x = rep(c(-1, 0, 1), 2000),
         y = 1/(1+exp(-1 * (intercept_mean + x * immAdd_mean)))) %>%
  group_by(x) %>%
  summarize(lower=quantile(y, probs=.025),
            upper=quantile(y, probs=.975),
            y=mean(y))

individuals_w_predictions = data.frame()
for (i in 1:max(ll)) {
  subject_params = cbind.data.frame(subject=rep(i, 2000),
                                    intercept = as.numeric(individuals$subj_intercept[,i]),
                                    immAdd = as.numeric(individuals$subj_immAdd[,i]))
  subject_params = subject_params[rep(1:nrow(subject_params), each=3), ]
  subject_params = subject_params %>%
    mutate(x=rep(c(-1, 0, 1), 2000),
           y=1/(1 + exp(-1 * (intercept + immAdd * x)))) %>%
    group_by(x) %>%
    summarize(subject=first(subject), y=mean(y))
  individuals_w_predictions <- rbind(individuals_w_predictions, subject_params)
}

ggplot() + geom_line(data=individuals_w_predictions, aes(x=x, y=y, group=subject), size=.5, alpha=.3) +
  geom_line(data=params_w_predictions, aes(x=x, y=y), size=2) +
  geom_ribbon(data=params_w_predictions, aes(x=x, ymin=lower, ymax=upper), alpha=.3) +
  theme_minimal() +
  xlab("immediate video minus delayed video (seconds)") +
  ylab("Proportion immediate video choices") +
  scale_x_continuous(breaks=c(-1, 0, 1), labels=c("-10", "0", "+10"))

ggsave(filename="../doc/journal/figures/exp3results.pdf", width=5, height=3.5, useDingbats=F)
