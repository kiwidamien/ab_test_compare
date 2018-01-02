import React from 'react';
import jStat from 'jStat';

/*
 Taken from Chris Stuccio's "Agile A/B testing with Bayesian Statistics and Python"

 Link: https://web.archive.org/web/20150419163005/http://www.bayesianwitch.com/blog/2014/bayesian_ab_test.html

 Chris worked for VWO/Optimizely. One of his other models is included in this list, and he has
  - a whitepaper (https://cdn2.hubspot.net/hubfs/310840/VWO_SmartStats_technical_whitepaper.pdf)
  - a blog post (https://www.chrisstucchio.com/blog/2014/bayesian_ab_decision_rule.html)
 about them.
*/



const analyse_experiment = ( control_experiment, treatment_experiment, threshold_of_caring = 0.001) => {
  // Default to a non-informative prior unless explicitly set
  const prior_params = [ [control_experiment.alpha || 1, control_experiment.beta || 1],
                         [treatment_experiment.alpha || 1, treatment_experiment.beta || 1]];

  const N = [control_experiment.N, treatment_experiment.N];
  const s = [control_experiment.successes, treatment_experiment.successes];

  let posteriors = [];

  let rate = N.map( (n,index) => s[index] / n );

  for (let i = 0; i < 2; i++){
    posteriors.push( {
      alpha: prior_params[i][0] + s[i] - 1,
      beta: prior_params[i][1] + N[i] - s[i] - 1
    });
  }

  let grid_size = 1024;
  let pdf_for_control = jStat(0, 1, grid_size, (x) => jStat.beta.pdf(x, posteriors[0].alpha, posteriors[0].beta) );
  let pdf_for_treatment=jStat(0, 1, grid_size, (x) => jStat.beta.pdf(x, posteriors[1].alpha, posteriors[1].beta) );

  let pdf_joint = jStat(jStat.outer(pdf_for_treatment[0], pdf_for_control[0]));

  let norm_constant = pdf_joint.sumrow(true);  // sums all elements in pdf_joint
  pdf_joint = pdf_joint.multiply(1/norm_constant);
  let expectedError = 0;
  let probError = 0.0;

  if (rate[1] > rate[0]){
    for (let controlIndex = 0; controlIndex < grid_size; controlIndex++){
      for (let variantIndex = controlIndex + 1; variantIndex < grid_size; variantIndex++){
        // these are all the variant rate are larger
        expectedError += (Math.abs(controlIndex - variantIndex) / grid_size) * pdf_joint[controlIndex][variantIndex];
        probError += pdf_joint[controlIndex][variantIndex];
      }
    }
  } else {
    for (let variantIndex = 0; variantIndex < grid_size; variantIndex++){
      for (let controlIndex = variantIndex + 1; controlIndex < grid_size; controlIndex++){
        // these are all the variant rate are larger
        expectedError += (Math.abs(controlIndex - variantIndex) / grid_size) * pdf_joint[controlIndex][variantIndex];
        probError += pdf_joint[controlIndex][variantIndex];
      }
    }
  }

  let winner = '';

  if (expectedError < threshold_of_caring){
    if (rate[1] > rate[0]){
      winner = 'treatment';
    } else {
      winner = 'control';
    }
  }

  if (winner){
    console.log("Probability that " + winner + " is larger is " + probError);
    console.log("Terminate test. Choose " + winner +". Expected error is " + expectedError);
  } else {
    console.log("Probability that treatment is larger is " + probError);
    console.log("Continue test. Expected error is " + expectedError );
  }

  return {
    winner: winner,
    prob: probError,
    expectedError: expectedError
  };
}


var result = analyse_experiment( { N: 200, successes: 16, alpha: 1, beta: 1},
                                 { N: 204, successes: 36} );

console.log(result);

const AgileModel = ({props}) => {
  const {alpha, beta, baseRate, differenceThreshold, rate} = props;

  var name = "Agile A/B Testing";
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

export default AgileModel;
