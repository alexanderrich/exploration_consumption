library("dplyr")
## library("RSQLite")
library("RMySQL")
library("jsonlite")

## for mysql
con <- dbConnect(MySQL(),
         user="lab", password="fishneversink",
         dbname="mt_experiments", host="gureckislab.org")
on.exit(dbDisconnect(con))
rs = dbSendQuery(con, "select * from exploration_consumption")
data = fetch(rs, n=-1)

## for sqlite
## my_db <- src_sqlite("../experiment/participants.db")
## data <- collect(tbl(my_db, "exploration_consumption"))

## data <- data[data$status %in% c(4, 7),]
data <- data[data$status %in% c(3, 4, 7),]
data <- data[data$codeversion %in% c("2.3"),]

datastrings <- data$datastring
datastrings_json <- sapply(datastrings, fromJSON, simplify=F)

trialdata <- sapply(datastrings_json,
                    function (x) {
                      y <- x[["data"]][["trialdata"]]
                      y$templates <- NULL
                      y$action <- NULL
                      y$template <- NULL
                      y$indexOf <- NULL
                      y$viewTime <- NULL
                      y;
                    },
                    simplify=F)

## trialdata <- datastrings_json[[1]][["data"]][["trialdata"]]

## trialdata$templates <- NULL
## trialdata$action <- NULL
## trialdata$template <- NULL
## trialdata$indexOf <- NULL
## trialdata$viewTime <- NULL
names(trialdata) <- NULL

trialdata <- do.call("rbind", trialdata)



trialdata <- trialdata %>% filter(phase == "EXPERIMENT")
trialdata$question <- NULL
trialdata$answer <- NULL
trialdata$loop <- NULL
trialdata$status <- NULL
## trialdata$phase <- NULL

consumptiondata <- trialdata %>% filter(trialType == "consumption")
exploredata <- trialdata %>% filter(trialType == "exploreexploit")

consumptiondata <- Filter(function(x)!all(is.na(x)), consumptiondata)

exploredata <- Filter(function(x)!all(is.na(x)), exploredata)


write.csv(exploredata, file="../data/exploration_data_v2_3.csv")
write.csv(consumptiondata, file="../data/consumption_data_v2_3.csv")


questiondata <- sapply(datastrings_json,
                    function (x) {
                      y=x[["questiondata"]]
                      if (is.null(y[["age"]])) {
                        y$age <- -1
                      }
                      y
                    },
                    simplify=F)
names(questiondata) <- NULL
questiondata <- as.data.frame(do.call("rbind.data.frame", questiondata))
rownames(questiondata) <- NULL

write.csv(questiondata, file="../data/question_data_v2_3.csv")
