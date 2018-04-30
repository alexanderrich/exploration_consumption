questiondata <-  read.csv('../data/question_data_v2_3.csv')
## age
ages = questiondata$age
ages = ages[ages >= 18]
mean(ages)
sd(ages)
summary(ages)
## gender
table(questiondata$gender)

questiondata <-  read.csv('../data/question_data_v3_0.csv')
## age
ages = questiondata$age
ages = ages[ages >= 18]
mean(ages)
sd(ages)
summary(ages)
## gender
table(questiondata$gender)

questiondata <-  read.csv('../data/question_data_v4_0.csv')
## age
ages = questiondata$age
ages = ages[ages >= 18]
mean(ages)
sd(ages)
summary(ages)
## gender
table(questiondata$gender)
