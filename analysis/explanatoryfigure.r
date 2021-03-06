library("ggplot2")
library("tidyr")
library("dplyr")
library("cowplot")

create_graphs = function(rewardseq, beta, delta, initialrewardtime, maxtime) {
  df = data.frame(time=seq(1, maxtime+2), discount=seq(1, maxtime+2))
  df$discount = beta*delta^(df$discount-1)
  df$discount[1] = 1/beta * df$discount[1]
  df$discount[c(maxtime + 1, maxtime + 2)] = NA
  df$rewards = 0
  df$rewards[initialrewardtime:(initialrewardtime+length(rewardseq) - 1)] = rewardseq
  df$discountedrewards = df$rewards * df$discount
  df$rewards[maxtime + 2] = sum(df$rewards, na.rm=TRUE)
  df$discountedrewards[maxtime + 2] = sum(df$discountedrewards, na.rm=TRUE)
  df = df %>% gather(rewardtype, reward, rewards, discountedrewards)
  df$rewardtype = factor(df$rewardtype, levels=c('rewards', 'discountedrewards'),
                         labels=c('undiscounted', 'discounted'))

  df$discountpoints = ifelse(df$reward != 0, df$discount, NA)

  colors = c('#BBBBBB', '#222222')

  discountplot = ggplot(df, aes(x=time, y=discount)) + geom_line() +
    geom_point(aes(x=time, y=discountpoints), size=3) +
    scale_x_continuous(breaks=seq(1, maxtime, 1), limits=c(0, maxtime+2.5)) +
    ylim(0, 1) +
    ylab("discount factor")

  rewardplot = ggplot(df, aes(x=time, y=reward, group=rewardtype, fill=rewardtype,
                                        width=ifelse(rewardtype=="discounted", .5, .75))) +
    geom_bar(stat='identity', position='identity', color="black", size=.3) +
    geom_hline(yintercept=0) +
    scale_fill_manual(name="reward type", values=colors) +
    scale_x_continuous(breaks=c(seq(1, maxtime, 1), maxtime+2),
                       labels=c(seq(1, maxtime, 1), "sum"), limits=c(0, maxtime+2.5)) +
    theme(legend.position="bottom") + ylab(expression(paste("explore ", Delta, " reward")))

  return( list(discountplot, rewardplot))
}


# Environment with sure bet of 2 or try to find a reward of 4 with chance .25
rewardseq = c(-1, .75, .5625, .28125, .28125)
exponential = create_graphs(rewardseq, 1, .9, 1, 10)
immediate = create_graphs(rewardseq, .5, .9, 1, 10)
delayed = create_graphs(rewardseq, .5, .9, 6, 10)

p = plot_grid(exponential[[1]], immediate[[1]], delayed[[1]], exponential[[2]], immediate[[2]], delayed[[2]], axis='r', align='v', nrow=2)

p

pdf("../doc/journal/figures/discounting.pdf", height=4, width=13, useDingbats = FALSE)
p
dev.off()
