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

  real slope_mean;
  real<lower=0> slope_sd;

  real b_delay;
  real b_delay_slope;

  vector[L] subj_intercept_raw;
  vector[L] subj_slope_raw;
}

transformed parameters {
  vector[L] subj_intercept;
  vector[L] subj_slope;

  subj_intercept = subj_intercept_raw * intercept_sd + intercept_mean;
  subj_slope = subj_slope_raw * slope_sd + slope_mean;
}

model {
  int subj;
  vector[N] predictor;
  vector[N] p;
  vector[N] rand_intercept;
  vector[N] rand_slope;

  intercept_mean ~ normal(0, 5);
  intercept_sd ~ normal(0, 5);
  slope_mean ~ normal(0, 5);
  slope_sd ~ normal(0, 5);
  b_delay ~ normal(0, 5);
  b_delay_slope ~ normal(0, 5);

  subj_intercept_raw ~ normal(0, 1);
  subj_slope_raw ~ normal(0, 1);

  for (n in 1:N) {
    subj = ll[n];
    rand_intercept[n] = subj_intercept[subj];
    rand_slope[n] = subj_slope[subj];
  }
  predictor =
    rand_intercept +
    rand_slope .* currentVal +
    b_delay * condition  +
    b_delay_slope * condition .* currentVal;
  p = 1 ./ (1 + exp(-predictor));
  y ~ bernoulli(p);
}
