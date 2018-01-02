import React from 'react';
import jStat from 'jStat';

// From Evan Miller's simplified sequential analysis
// https://www.evanmiller.org/sequential-ab-testing.html

const log_factorial = (N) => {
  return jStat.gammaln(N + 1); // Gamma(N+1) = N!
}

/*
delta is the *relative* bias in the flips.
i.e. p_treatment/p_control = 1 + delta
*/
const prob_bankrupt_in_first_N_rounds = (N, initial_bankroll, delta) => {
  // make sure the parity is right, so that we are able to hit zero in n rounds.
  const log_2_plus_delta = Math.log(2 + delta);
  const log_1_plus_delta = Math.log(1 + delta);

  let sum = 0;
  for (var n = initial_bankroll ; n <= N; n += 2){
    let term = initial_bankroll / n;
    let avg  = (n + initial_bankroll) / 2;
    let logHighPowers = log_factorial(n) - log_factorial(avg) - log_factorial(n-avg) - n*log_2_plus_delta + avg*log_1_plus_delta;
    sum += term * Math.exp(logHighPowers);
  }
  return sum;
};

const binary_search = (initial_bankroll_low, initial_bankroll_high, alpha, power_level, baserate, delta) => {

}

const expected_number_of_trials = (initial, goal, p) => {
  const q = 1 - p;
  if (q === p){
    return initial * (goal - initial);
  }
  const ratio   = q/p;
  const probWin = (1 - Math.pow(ratio, initial)) / (1 - Math.pow(ratio, goal));

  return initial / (q - p) - probWin * goal / (q - p);
}

const SimpleSequential = ({props}) => {
  const {alpha, beta, baseRate, differenceThreshold, rate} = props;

  var name = "SimpleSequential";
  var weeks = 1;
  var nTests = 100;

  return (
    <div className="modelBox">
      <h1>{name} &mdash; Baseline rate is {Math.round(baseRate * 100, 1)}%</h1>
      <div className="paramList">
      <ul>
        <li>&alpha;: {Math.round(alpha * 100, 0)}%</li>
        <li>&beta;: {Math.round(beta*100, 0)}%</li>
        <li>&delta;: {Math.round(differenceThreshold*100, 0)}%</li>
        <li>rate: {rate} visits per week</li>
      </ul>
      </div>
      You will need an estimated <b>{nTests}</b> visits total to distinguish between the variants. This will take <b>{weeks}</b> weeks (note we should not run tests for fractions of a buisness cycle)
    </div>
  );
}

export default SimpleSequential;
