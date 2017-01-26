data {
  int<lower=0> N; //rows of observations
  int<lower=1> L; //# of subjects
  int<lower=0,upper=1> y[N]; //responses
  int<lower=1, upper=L> ll[N]; //subject producing each response
  vector[N] currentVal;
  vector[N] lastOutcome;
  vector[N] condition;
}

parameters {
  real intercept_mean;
  real<lower=0> intercept_sd;

  real currentVal_mean;
  real<lower=0> currentVal_sd;

  real lastOutcome_mean;
  real<lower=0> lastOutcome_sd;

  real condition_intercept;
  real condition_slope;
  real condition_lastOutcome;

  vector[L] subj_intercept_raw;
  vector[L] subj_currentVal_raw;
  vector[L] subj_lastOutcome_raw;
}

transformed parameters {
  vector[L] subj_intercept;
  vector[L] subj_currentVal;
  vector[L] subj_lastOutcome;

  subj_intercept <- subj_intercept_raw * intercept_sd + intercept_mean;
  subj_currentVal <- subj_currentVal_raw * currentVal_sd + currentVal_mean;
  subj_lastOutcome <- subj_lastOutcome_raw * lastOutcome_sd + lastOutcome_mean;
}

model {
  int subj;
  vector[N] predictor;
  vector[N] p;
  vector[N] b_intercept;
  vector[N] b_currentVal;
  vector[N] b_lastOutcome;

  intercept_mean ~ normal(0, 5);
  intercept_sd ~ normal(0, 5);
  currentVal_mean ~ normal(0, 5);
  currentVal_sd ~ normal(0, 5);
  lastOutcome_mean ~ normal(0, 5);
  lastOutcome_sd ~ normal(0, 5);

  condition_intercept ~ normal(0, 5);
  condition_slope ~ normal(0, 5);
  condition_lastOutcome ~ normal(0, 5);

  subj_intercept_raw ~ normal(0, 1);
  subj_currentVal_raw ~ normal(0, 1);

  for (n in 1:N) {
    subj <- ll[n];
    b_intercept[n] <- subj_intercept[subj];
    b_currentVal[n] <- subj_currentVal[subj];
    b_lastOutcome[n] <- subj_lastOutcome[subj];
  }
  predictor <- b_intercept + condition_intercept * condition  + b_currentVal .* currentVal + b_lastOutcome .* lastOutcome + condition_lastOutcome * condition .* lastOutcome +  condition_slope * condition .* currentVal;
  p <- 1 ./ (1 + exp(-predictor));
  y ~ bernoulli(p);
}
