library("ggplot2")
library("dplyr")
library("tidyr")

optimal_values <- function(ntrials, maxreward=6, pbad=.5, badcost=0) {
  explore_values <- matrix(0, nrow=ntrials, ncol=maxreward+1)
  exploit_values <- matrix(0, nrow=ntrials, ncol=maxreward+1)
  exploit_rewards <- t(replicate(ntrials, c(badcost, 1:maxreward)))
  explore_rewards <- matrix((maxreward + 1) / 2 * (1-pbad) + (pbad * badcost), nrow=ntrials, ncol=maxreward+1)
  values <- matrix(0, nrow=ntrials, ncol=maxreward+1)
  explore_values[ntrials,] <- explore_rewards[ntrials,]
  exploit_values[ntrials,] <- exploit_rewards[ntrials,]
  values[ntrials,] <- pmax(exploit_values[ntrials,], explore_values[ntrials,])
  for (i in (ntrials-1):1) {
    exploit_values[i,] <- c(badcost, 1:maxreward) + values[i+1,]
    explore_values[i,] <- sapply(0:maxreward, function (x) {
      pbad * (badcost + values[i+1, x+1]) + (1-pbad) * mean(1:maxreward + values[i+1, pmax(x, 1:maxreward)+1])
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

optimal_values_indefinite <- function (discount, minreward=4, maxreward=12, pbad=.5, badcost=0, tol=.00001) {
  ngood <- maxreward - minreward + 1
  n <- ngood + 1
  ptrans <- 1/ngood * (1-pbad)
  trans_explore <- matrix(0, n, n)
  trans_exploit <- diag(n)
  rew_explore <- matrix(0, n, n)
  rew_exploit <- diag(n) * c(badcost, minreward:maxreward)
  reward_exploit <- c(badcost, minreward:maxreward)

  for (i in 1:n) {
    for (j in 1:n) {
      if (j > i) {
        trans_explore[i, j] <- ptrans
        rew_explore[i, j] <- reward_exploit[j]
      } else if (i == j){
        trans_explore[i,j] <- 1 - ptrans * (n - i)
        rew_explore[i, j] <- (badcost * pbad + sum(reward_exploit[2:i])* ptrans)/(pbad + length(1:(i-1))*ptrans)
      }
    }
  }
  rew_explore[1,1] <- badcost

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
  reward_explore <- rep(pbad*badcost + ptrans*sum(minreward:maxreward), n)
  reward_diff <- reward_explore - reward_exploit
  VoI_diff <- values_explore - values_exploit - reward_diff
  list(values_explore=values_explore,
       values_exploit=values_exploit,
       reward_explore=reward_explore,
       reward_exploit=reward_exploit,
       values=values,
       reward_diff=reward_diff,
       VoI_diff=VoI_diff
       )

}

test <- optimal_values_indefinite(7/8, minreward=4, maxreward=12, pbad=.5, badcost=0)

df <- data.frame(reward_exploit=test$reward_exploit)
df$v_diff <- test$reward_diff + test$VoI_diff
df$v_diff_9 <- test$reward_diff + .9 * test$VoI_diff
df$v_diff_7 <- test$reward_diff + .7 * test$VoI_diff
df$v_diff_5 <- test$reward_diff + .5 * test$VoI_diff
df$v_diff_0 <- test$reward_diff

df <- df %>% gather(bias, diff, -reward_exploit) %>%
  filter(reward_exploit > 0)

ggplot(df, aes(x=reward_exploit, y=diff, group=bias)) + geom_line(aes(color=bias))
