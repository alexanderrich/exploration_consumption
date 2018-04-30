data {
  int<lower=0> N; //rows of observations
  int<lower=1> L; //# of subjects
  int<lower=0,upper=1> y[N]; //responses
  int<lower=1, upper=L> ll[N]; //subject producing each response
  vector[N] immAdd;
}

parameters {
  real intercept_mean;
  real<lower=0> intercept_sd;

  real immAdd_mean;
  real<lower=0> immAdd_sd;

  vector[L] subj_intercept_raw;
  vector[L] subj_immAdd_raw;
}

transformed parameters {
  vector[L] subj_intercept;
  vector[L] subj_immAdd;

  subj_intercept = subj_intercept_raw * intercept_sd + intercept_mean;
  subj_immAdd = subj_immAdd_raw * immAdd_sd + immAdd_mean;
}

model {
  int subj;
  vector[N] predictor;
  vector[N] p;
  vector[N] b_intercept;
  vector[N] b_immAdd;

  intercept_mean ~ normal(0, 5);
  intercept_sd ~ normal(0, 5);
  immAdd_mean ~ normal(0, 5);
  immAdd_sd ~ normal(0, 5);

  subj_intercept_raw ~ student_t(5, 0, 1);
  subj_immAdd_raw ~ student_t(5, 0, 1);

  for (n in 1:N) {
    subj = ll[n];
    b_intercept[n] = subj_intercept[subj];
    b_immAdd[n] = subj_immAdd[subj];
  }
  predictor = b_intercept + b_immAdd .* immAdd;
  p = 1 ./ (1 + exp(-predictor));
  y ~ bernoulli(p);
}
