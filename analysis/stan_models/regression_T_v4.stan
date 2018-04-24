data {
  int<lower=0> N; //rows of observations
  int<lower=1> L; //# of subjects
  int<lower=0,upper=1> y[N]; //responses
  int<lower=1, upper=L> ll[N]; //subject producing each response
  vector[N] waitAdd;
}

parameters {
  real intercept_mean;
  real<lower=0> intercept_sd;

  real waitAdd_mean;
  real<lower=0> waitAdd_sd;

  vector[L] subj_intercept_raw;
  vector[L] subj_waitAdd_raw;
}

transformed parameters {
  vector[L] subj_intercept;
  vector[L] subj_waitAdd;

  subj_intercept = subj_intercept_raw * intercept_sd + intercept_mean;
  subj_waitAdd = subj_waitAdd_raw * waitAdd_sd + waitAdd_mean;
}

model {
  int subj;
  vector[N] predictor;
  vector[N] p;
  vector[N] b_intercept;
  vector[N] b_waitAdd;

  intercept_mean ~ normal(0, 5);
  intercept_sd ~ normal(0, 5);
  waitAdd_mean ~ normal(0, 5);
  waitAdd_sd ~ normal(0, 5);

  subj_intercept_raw ~ student_t(5, 0, 1);
  subj_waitAdd_raw ~ student_t(5, 0, 1);

  for (n in 1:N) {
    subj = ll[n];
    b_intercept[n] = subj_intercept[subj];
    b_waitAdd[n] = subj_waitAdd[subj];
  }
  predictor = b_intercept + b_waitAdd .* waitAdd;
  p = 1 ./ (1 + exp(-predictor));
  y ~ bernoulli(p);
}
