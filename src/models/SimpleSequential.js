import React from 'react';
import jStat from 'jStat';

// From Evan Miller's simplified sequential analysis
// https://www.evanmiller.org/sequential-ab-testing.html

const prob_bankrupt_in_first_N_rounds = (N, initial_bankroll, delta) => {
  //for (var round = 1; round <= 3; round++){  }
};

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
