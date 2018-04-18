
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

choicedata$envNum = choicedata$trial %/% 10

choicedata$waitDiff = 0
index = list(c(1,2,3), c(1,3,2), c(2,1,3), c(2,3,1), c(3,1,2), c(3,2,1))
for (i in 1:nrow(choicedata)) {
  choicedata[i, 'waitDiff'] = c(-5, 0, 5)[index[[choicedata[i, 'condition']]][1+choicedata[i, 'envNum']]]
}

choicedata %>% group_by(waitDiff) %>% summarize(mean(choiceOutcome))
