library("boot")
library("ggplot2")
library("lme4")


agentmaker <- function(intercept, slope) {
  function(value) {
    inv.logit(-(value-intercept)*slope)
  }
}


simulate_agent <- function (agent, id, condition) {
  n_trials <- 48
  responses <- rep(0, n_trials)
  current_value <- rep(0, n_trials)
  new_spinner_value <- sample(seq(.05, 1, .05), n_trials, replace=TRUE) * (runif(n_trials) > .333)
  resets <- rep(0, n_trials)
  resets[seq(0, 54, 6) + sample(1:6, 10, replace=TRUE)] <-  1
  resets <- c(1, resets[1:(n_trials-1)])
  reset_values <- sample(seq(.2, .6, .05), replace=FALSE)
  reset_idx <- 1

  for (i in 1:n_trials) {
    if (resets[i]) {
      current_value[i] <- reset_values[reset_idx]
      reset_idx <- reset_idx + 1
    }
    responses[i] <- runif(1) < agent(current_value[i])
    if (responses[i] * new_spinner_value[i] > current_value[i]) {
      current_value[i+1] <- new_spinner_value[i]
    } else {
      current_value[i+1] <- current_value[i]
    }
  }
  data.frame(condition=rep(condition, n_trials), id=rep(id, n_trials), response=responses, current_value=current_value[1:n_trials])
}

simulate_experiment <- function (n_per_condition, intercept_mean, intercept_sd, slope_mean, slope_sd, intercept_difference) {
  results <- data.frame()
  for (i in 1:(2*n_per_condition)) {
    condition <- ifelse(i > n_per_condition, 1, 0)
    agent <- agentmaker(rnorm(1, intercept_mean + condition*intercept_difference , intercept_sd),
                        rnorm(1, slope_mean, slope_sd))
    results <- rbind.data.frame(results, simulate_agent(agent, i, condition))
  }
  results
}

## x <- seq(0, 1, .05)
## agent <- agentmaker(.5, 24)
## y <- sapply(x, agent)
## qplot(x, y) + geom_line() + ylim(0, 1)
## data <- simulate_experiment(40, .5, .15, 15, 5, .075)

simulate_many_curves <- function (n_per_condition, intercept_mean, intercept_sd, slope_mean, slope_sd, intercept_difference) {
  x <- seq(0, 1, .05)
  results <- data.frame()
  for (i in 1:(2*n_per_condition)) {
    condition <- ifelse(i > n_per_condition, 1, 0)
    agent <- agentmaker(rnorm(1, intercept_mean + condition*intercept_difference , intercept_sd),
                        rnorm(1, slope_mean, slope_sd))
    y <- sapply(x, agent)
    id <- rep(i, 21)
    cond <- rep(condition, 21)
    results <- rbind.data.frame(results, data.frame(x=x, y=y, id=id, cond=cond))
  }
  results
}

## curves <- simulate_many_curves(30, .5, .15, 15, 7, .075)
## ggplot(curves, aes(x=x, y=y, group=id, color=as.factor(cond))) + geom_line()

## model <- glmer(response ~ current_value + condition + (current_value | id), data, family="binomial")
## summary(model)


simulate_many_experiments <- function (n_simulations, n_per_condition, intercept_mean, intercept_sd, slope_mean, slope_sd, intercept_difference) {
  output <-  c()
  model <- stan_model(file="stan_models/regression.stan")
  for (i in 1:n_simulations) {
    data <- simulate_experiment(n_per_condition, intercept_mean, intercept_sd, slope_mean, slope_sd, intercept_difference)
    N <- nrow(data)
    L <- n_per_condition*2
    y <- data$response
    currentVal <- data$current_value - mean(data$current_value)
    condition <- data$condition - 0.5
    ll <- data$id
    fit <- sampling(model, data=c("N", "L", "y", "ll", "currentVal", "condition"), chains=4, iter=1000)
    extracted=extract(fit, permuted=FALSE, pars=c("intercept_mean", "intercept_sd",
                                                  "currentVal_mean", "currentVal_sd",
                                                  "condition_intercept", "condition_slope"))
    mon <- monitor(extracted, print=FALSE)
    output <- rbind(output, mon[5,])
  }
  output
}


effects <- simulate_many_experiments(30, 40, .45, .15, 15, 7, .075)
save(effects, file="power_effects.RData")

mean(effects[,4] > 0)
