import React from 'react';
import jStat from 'jStat';

// This is just the classic fixed experiment size A/B test

const numberOfTests= (alpha, beta, differenceThreshold, baseline) => {
      const z_alpha_over_2 = jStat.normal.inv(1 - alpha/2, 0, 1);
      const z_beta         = jStat.normal.inv(1 - beta, 0, 1);

      const sigma_null     = Math.sqrt(2 * baseline * (1-baseline));
      const sigma_diff     = Math.sqrt(baseline * (1-baseline) + (baseline + differenceThreshold) * (1 - (baseline + differenceThreshold)));
      // In Evan Miller's blog post, he assumes the sigmas are the same for null and other hypothesis, but he implements it properly in the calculator.
      const z_star         = z_alpha_over_2 * sigma_null + z_beta * sigma_diff;

      const z_star_over_effect = z_star / differenceThreshold;

      const N = z_star_over_effect*z_star_over_effect;

      return Math.round(N);
};


const Classical = ({props}) => {

  const {name, alpha, beta, differenceThreshold, rate, baseRate} = props;
  const nTests = numberOfTests(alpha, beta, differenceThreshold, baseRate);
  const weeks = Math.ceil(nTests/rate);

  return (
    <div className="modelBox">
      <h1>{name} &mdash; Baseline rate is {Math.round(baseRate * 100, 1)}%</h1>
      <div className="paramList">
      <ul>
        <li>&alpha;: {Math.round(alpha * 100, 0)}%</li>
        <li>&beta;: {Math.round(beta*100, 0)}%</li>
        <li>&delta;: {Math.round(differenceThreshold*100, 0)}%</li>
        <li>rate: {props.rate} visits per week</li>
      </ul>
      </div>
      You will need an estimated <b>{nTests}</b> visits total to distinguish between the variants. This will take <b>{weeks}</b> weeks (note we should not run tests for fractions of a buisness cycle)
    </div>
  );
}

export default Classical;
