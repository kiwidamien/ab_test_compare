import React from 'react';
import jStat from 'jStat';

// From Evan Miller's simplified sequential analysis
// https://www.evanmiller.org/sequential-ab-testing.html


var number_ahead = 0;
var MAX_BARRIER = 5000;
var MAX_CONVERSIONS = 800000;

var log_factorial_cache_buffer = new ArrayBuffer(8 * MAX_CONVERSIONS);
var log_factorial_cache = new Float64Array(log_factorial_cache_buffer);

var max_gamma_index = 0;

const log_factorial = (N) => {
  if (N < MAX_CONVERSIONS) {
    if (N > max_gamma_index){
      for (var i = max_gamma_index + 1; i <= N; i++) {
        log_factorial_cache[i] = jStat.gammaln(i + 1);
      }
    }
    return log_factorial_cache[N];
  }
  return jStat.gammaln(N + 1); // Gamma(N+1) = N!
}

const log_n_choose_k = (N, k) => {
  return log_factorial(N) - log_factorial(k) - log_factorial(N-k);
}
/*
relativeLift is the *relative* bias in the flips.
i.e. p_treatment/p_control = 1 + relativeLift
*/
const prob_bankrupt_in_first_N_rounds = (N, initial_bankroll, relativeLift) => {
  // make sure the parity is right, so that we are able to hit zero in n rounds.
  const log_2_plus_lift = Math.log(2 + relativeLift);
  const log_1_plus_lift = Math.log(1 + relativeLift);

  let sum = 0;
  for (var n = initial_bankroll ; n <= N; n += 2){
    let term = initial_bankroll / n;
    let avg  = (n + initial_bankroll) / 2;
    let logHighPowers = log_n_choose_k(n, avg) - n*log_2_plus_lift + avg*log_1_plus_lift;
    sum += term * Math.exp(logHighPowers);
    if (isNaN(sum)){
      console.log(`isNaN(sum), avg is ${avg}, relativeLift = ${relativeLift}, log_1_plus_lift is ${log_1_plus_lift}`);
    }
  }
  return sum;
};

/*
relativeLift is the *relative* bias in the flips.
i.e. p_treatment/p_control = 1 + relativeLift
*/
const prob_bankrupt_in_first_N_rounds_in_bounds = (N, initial_bankroll, relativeLift, alpha, power_level) => {
  // make sure the parity is right, so that we are able to hit zero in n rounds.
  const log_2_plus_lift = Math.log(2 + relativeLift);
  const log_1_plus_lift = Math.log(1 + relativeLift);

  let sum = 0;
  for (var n = initial_bankroll ; n <= N; n += 2){
    let term = initial_bankroll / n;
    let avg  = (n + initial_bankroll) / 2;
    let logHighPowers = log_n_choose_k(n, avg) - n*log_2_plus_lift + avg*log_1_plus_lift;
    sum += term * Math.exp(logHighPowers);
    if (isNaN(sum) || (sum > alpha)){
      if (isNaN(sum)){
        console.log(`isNaN(sum), avg is ${avg} and logHighPowers is ${logHighPowers}`);
      }
      return false;
    }
  }
  return (sum > power_level);
};

const binary_search = (initial_bankroll_low, initial_bankroll_high, alpha, power_level, baserate, alt_p) => {

  var relativeLift = Math.abs(alt_p - baserate) / baserate ;
  var numberOfTurns;
  var MAXTURNS = 5000;
  var count = 0;
  while ((initial_bankroll_high - initial_bankroll_low > 1) && (count < 10)) {
    var initial_bankroll = initial_bankroll_low + 2*Math.floor((initial_bankroll_high - initial_bankroll_low)/4);
    console.log(initial_bankroll);
    console.log('hi');
    for (numberOfTurns = initial_bankroll; numberOfTurns < MAXTURNS; numberOfTurns += 2) {
      var nullProbTest = prob_bankrupt_in_first_N_rounds_in_bounds(numberOfTurns, initial_bankroll, 0, alpha, -2.0);
      var altProbTest  = prob_bankrupt_in_first_N_rounds_in_bounds(numberOfTurns, initial_bankroll, relativeLift, 2.0, power_level);
      console.log('hi ' + initial_bankroll_low + ' ' + initial_bankroll_high + ' ' + nullProbTest + ' ' + altProbTest + ' ' + count + ' ' + relativeLift);
      if (!nullProbTest || !altProbTest){
        break;
      }

      if (altProbTest) {
        if (nullProbTest) {
          initial_bankroll_high = initial_bankroll;
        } else {
          initial_bankroll_low += 2;
        }
        break;
      } else if (!nullProbTest) {
        initial_bankroll_low += 2;
        break;
      }
      count += 1;

    }

    var nullProb = prob_bankrupt_in_first_N_rounds(numberOfTurns, initial_bankroll, 0);
    var altProb  = prob_bankrupt_in_first_N_rounds(numberOfTurns, initial_bankroll, relativeLift);
    console.log('altProb = ' + altProb);
    console.log('nullProb= ' + nullProb);
    if (isNaN(nullProb) || isNaN(altProb) || numberOfTurns >= MAX_CONVERSIONS) {
      console.log(altProbTest);
      console.log(prob_bankrupt_in_first_N_rounds(numberOfTurns, initial_bankroll, relativeLift));
      break;
    }
  }

  return initial_bankroll;
}
/*
const binary_search = (initial_bankroll_low, initial_bankroll_high, alpha, power_level, baserate, delta) => {
  var [ log_null_p, log_null_1_p ] = [ Math.log(baserate), Math.log(1-baserate) ];
  var [ log_alt_p, log_alt_1_p ] = [ Math.log(baserate + delta), Math.log(1 - baserate - delta)];

  var initial_bankroll = initial_bankroll_low + 2*Math.floor((initial_bankroll_high - initial_bankroll_low)/4);
  var numberOfTurns;
  while (initial_bankroll_low < initial_bankroll_high) {
    let { null_cdf, alt_cdf } = [0.0, 0.0];
    //var { old_low, old_high } = {initial_bankroll_low, initial_bankroll_high};

    for (numberOfTurns = initial_bankroll; numberOfTurns <= 800000; numberOfTurns += 2) {
      let avg = (numberOfTurns + initial_bankroll) / 2;
      let prefix = initial_bankroll / numberOfTurns;
      let log_n_choose_avg = log_n_choose_k(numberOfTurns, avg);
      null_cdf += prefix * Math.exp(log_n_choose_avg + (avg - initial_bankroll) * log_null_p + avg * log_null_1_p);
      alt_cdf += prefix * Math.exp(log_n_choose_avg + (avg - initial_bankroll) * log_alt_p + avg * log_alt_1_p);
      if (isNaN(null_cdf) || (isNaN(alt_cdf))) {
        break;
      }

      if (alt_cdf > power_level) {
        if (null_cdf < alpha) {
          initial_bankroll_high = initial_bankroll;
        } else {
          initial_bankroll_low += 2;
        }
        break;
      }
    }

    if (isNaN(null_cdf) || isNaN(alt_cdf) || numberOfTurns >= 800000) {
      break;
    }
    initial_bankroll = initial_bankroll_low + 2*Math.floor((initial_bankroll_high - initial_bankroll_low)/4);
  }

  return initial_bankroll;
}
*/
const linear_scan_for_N = (initial_bankroll, alpha, power_level, null_p, alt_p) => {
  let numberOfTurns = initial_bankroll;

  let [ null_cdf, alt_cdf ] = [ 0.0, 0.0 ];
  const [ log_null_p, log_null_1_p ] = [ Math.log(null_p), Math.log(1.0 - null_p) ];
  const [ log_alt_p, log_alt_1_p ] = [ Math.log(alt_p), Math.log(1.0 - alt_p) ];

  for (; numberOfTurns <= 8000; numberOfTurns+=2) {
    let avg = Math.floor((numberOfTurns + initial_bankroll) / 2);
    let prefix = initial_bankroll / numberOfTurns;
    let log_n_choose_avg = log_n_choose_k(numberOfTurns, avg);
    null_cdf += prefix * Math.exp(log_n_choose_avg + (avg-initial_bankroll) * log_null_p + avg * log_null_1_p);
    alt_cdf += prefix * Math.exp(log_n_choose_avg + (avg-initial_bankroll) * log_alt_p + avg * log_alt_1_p);

    if (isNaN(null_cdf) || isNaN(alt_cdf)) {
      return NaN;
    }

    if (alt_cdf > power_level) {
      return (null_cdf < alpha) ? numberOfTurns : NaN;
    }
  }

  return NaN;
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

function num_subjects(alpha, power_level, p, delta) {
  const MAX_BARRIER = 3000;
  var number_ahead = 0;
    var null_p = 0.5;
    var alt_p = 1.0/(1.0+(p+delta)/p);

    var n, z;

    var z_lo = 1;
    var z_hi = MAX_BARRIER;
    var best_odd_z = binary_search(1, MAX_BARRIER-1, alpha, power_level, null_p, alt_p);
    var best_even_z = binary_search(2, MAX_BARRIER, alpha, power_level, null_p, alt_p);
    var odd_n = linear_scan_for_N(best_odd_z, alpha, power_level, null_p, alt_p);
    var even_n = linear_scan_for_N(best_even_z, alpha, power_level, null_p, alt_p);
    if (isNaN(odd_n) || even_n < odd_n) {
        number_ahead = best_even_z;
        return even_n;
    }
    number_ahead = best_odd_z;
    return odd_n;
}

const SimpleSequential = ({props}) => {
  const {alpha, beta, baseRate, differenceThreshold, rate} = props;

  var name = "SimpleSequential";
  const nTests = num_subjects(alpha, 1-beta, baseRate, differenceThreshold);
  const weeks = Math.ceil(nTests/rate);

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
