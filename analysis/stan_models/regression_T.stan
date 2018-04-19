data {
  int<lower=0> N; //rows of observations
  int<lower=1> L; //# of subjects
  int<lower=0,upper=1> y[N]; //responses
  int<lower=1, upper=L> ll[N]; //subject producing each response
  vector[N] currentVal;
  vector[N] condition;
}

parameters {
  real intercept_mean;
  real<lower=0> intercept_sd;

  real currentVal_mean;
  real<lower=0> currentVal_sd;

  real condition_intercept;
  real condition_slope;

  vector[L] subj_intercept_raw;
  vector[L] subj_currentVal_raw;
}

transformed parameters {
  vector[L] subj_intercept;
  vector[L] subj_currentVal;

  subj_intercept <- subj_intercept_raw * intercept_sd + intercept_mean;
  subj_currentVal <- subj_currentVal_raw * currentVal_sd + currentVal_mean;
}

model {
  int subj;
  vector[N] predictor;
  vector[N] p;
  vector[N] b_intercept;
  vector[N] b_currentVal;

  intercept_mean ~ normal(0, 5);
  intercept_sd ~ normal(0, 5);
  currentVal_mean ~ normal(0, 5);
  currentVal_sd ~ normal(0, 5);
  condition_intercept ~ normal(0, 5);
  condition_slope ~ normal(0, 5);

  subj_intercept_raw ~ student_t(5, 0, 1);
  subj_currentVal_raw ~ student_t(5, 0, 1);

  for (n in 1:N) {
    subj <- ll[n];
    b_intercept[n] <- subj_intercept[subj];
    b_currentVal[n] <- subj_currentVal[subj];
  }
  predictor <- b_intercept + condition_intercept * condition  + b_currentVal .* currentVal + condition_slope * condition .* currentVal;
  p <- 1 ./ (1 + exp(-predictor));
  y ~ bernoulli(p);
}
