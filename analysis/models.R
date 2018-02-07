library("ggplot2")
library("dplyr")
library("tidyr")
library("reshape2")

optimal_values <- function (discount, ntrials, minreward=4, maxreward=12, pbad=.333, badcost=0) {
  ngood <- maxreward - minreward + 1
  n <- ngood + 1
  explore_values <- matrix(0, nrow=ntrials, ncol=n)
  exploit_values <- matrix(0, nrow=ntrials, ncol=n)
  exploit_rewards <- t(replicate(ntrials, c(badcost, minreward:maxreward)))
  explore_rewards <- matrix((minreward + (maxreward - minreward) / 2) * (1-pbad) + badcost * pbad, nrow=ntrials, ncol=n)
  values <- matrix(0, nrow=ntrials, ncol=n)
  explore_values[ntrials,] <- explore_rewards[ntrials,]
  exploit_values[ntrials,] <- exploit_rewards[ntrials,]
  values[ntrials,] <- pmax(exploit_values[ntrials,], explore_values[ntrials,])
  for (i in (ntrials-1):1) {
    exploit_values[i,] <- c(badcost, minreward:maxreward) + discount * values[i+1,]
    explore_values[i,] <- sapply(1:n, function (x) {
      pbad * (badcost + discount * values[i+1, x]) + (1 - pbad) * mean(minreward:maxreward + discount * values[i+1, pmax(x, 2:n)])
    })
    values[i,] <- pmax(exploit_values[i,], explore_values[i,])
  }
  reward_diff <- explore_rewards - exploit_rewards
  VoI_diff <- explore_values - exploit_values - reward_diff
  return(list(exploit_values=exploit_values,
              explore_values=explore_values,
              reward_diff=reward_diff,
              VoI_diff=VoI_diff))
}

optimal_values_indefinite <- function (discount, outcomes=c(0:100), outcome_probs=c(), tol=.00001) {
  outcome_probs <- outcome_probs/sum(outcome_probs)
  n <- length(outcomes)
  trans_explore <- matrix(0, n, n)
  trans_exploit <- diag(n)
  rew_explore <- matrix(0, n, n)
  rew_exploit <- diag(n) * outcomes
  reward_exploit <- outcomes
  for (i in 1:n) {
    for (j in 1:n) {
      if (j > i) {
        trans_explore[i, j] <- outcome_probs[j]
        rew_explore[i, j] <- reward_exploit[j]
      } else if (i == j){
        trans_explore[i,j] <- sum(outcome_probs[1:i])
        rew_explore[i, j] <- (sum(reward_exploit[1:i]*outcome_probs[1:i]))/sum(outcome_probs[1:i])
      }
    }
  }
  values <- rep(0, n)
  delta <- tol + 1
  while (delta > tol ) {
    old_values <- values
    disc_values <- values * discount
    values_explore <- sweep(rew_explore, MARGIN=2, disc_values, `+`)
    values_explore <- trans_explore * values_explore
    values_explore <- apply(values_explore, MARGIN=1, sum)
    values_exploit <- sweep(rew_exploit, MARGIN=2, disc_values, `+`)
    values_exploit <- trans_exploit * values_exploit
    values_exploit <- apply(values_exploit, MARGIN=1, sum)
    values <- pmax(values_exploit, values_explore)
    delta <- max(abs(values - old_values))
  }
  reward_explore <- rep(sum(outcome_probs*outcomes), n)
  reward_diff <- reward_explore - reward_exploit
  VoI_diff <- values_explore - values_exploit - reward_diff
  data.frame(reward_idx=1:length(values_explore),
       values_explore=values_explore,
       values_exploit=values_exploit,
       reward_explore=reward_explore,
       reward_exploit=reward_exploit,
       values=values,
       reward_diff=reward_diff,
       VoI_diff=VoI_diff
       )
}

df <- optimal_values_indefinite(5/6, outcomes=c(rep(0, 10), seq(5, 100, 5)), outcome_probs=rep(1, 30))
df$v_diff <- df$reward_diff + df$VoI_diff
df$v_diff_8 <- df$reward_diff + .8 * df$VoI_diff
df$v_diff_6 <- df$reward_diff + .6 * df$VoI_diff
df$v_diff_4 <- df$reward_diff + .4 * df$VoI_diff
df$v_diff_2 <- df$reward_diff + .2 * df$VoI_diff
df$v_diff_0 <- df$reward_diff
df <- df %>%
  select(reward_idx, reward_exploit, v_diff, v_diff_8, v_diff_6, v_diff_4, v_diff_2, v_diff_0) %>%
  gather(bias, diff, -reward_idx, -reward_exploit)
ggplot(df, aes(x=reward_exploit, y=diff, group=bias)) + geom_hline(yintercept=0) + geom_line(aes(color=bias))

test <- optimal_values(5/6, 10, minreward=0, maxreward=100, pbad=0, badcost=0)
df <- melt(test$exploit_values)
df <- setNames(df, c("trial", "rewardIdx", "exploit_value"))
df$explore_value <- melt(test$explore_values)[,3]
df$reward_diff <- melt(test$reward_diff)[,3]
df$VoI_diff <- melt(test$VoI_diff)[,3]

df$v_diff <- df$reward_diff + df$VoI_diff
df$v_diff_8 <- df$reward_diff + .8 * df$VoI_diff
df$v_diff_6 <- df$reward_diff + .6 * df$VoI_diff
df$v_diff_4 <- df$reward_diff + .4 * df$VoI_diff
df$v_diff_2 <- df$reward_diff + .2 * df$VoI_diff
df$v_diff_0 <- df$reward_diff

df <- df %>%
  select(-reward_diff, -VoI_diff, -exploit_value, -explore_value) %>%
  gather(bias, diff, -trial, -rewardIdx) %>%
  filter(rewardIdx > 1) %>%
  filter(trial == 1)

## plot of how optimal effect changes as the end of the experiment is reached
ggplot(df, aes(x=rewardIdx, y=diff, group=bias)) + geom_hline(yintercept=0) + geom_line(aes(color=bias)) + xlim(0, 100) + ylim(-60, 60)+ facet_wrap(~trial)
