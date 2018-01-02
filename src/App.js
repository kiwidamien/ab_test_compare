import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import jStat from 'jStat';
import Classical from './models/classical';
import SimpleSequential from './models/SimpleSequential';
import Agile from './models/agile';

const invNormCDF = (x) => jStat.normal.inv(1-x,0,1);
const alpha = 0.05;



class App extends Component {
  render() {
    let myprops = {
      name: 'Classical',
      number: 3,
      alpha : 0.05,
      beta: 0.2,
      differenceThreshold: 0.02,
      rate: 500,
      weeks: 30,
      baseRate: 0.03
    };

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>

        <p>The value of erfcinv({alpha/2}) is {invNormCDF(alpha/2)}</p>
        <Classical props={myprops}/>
        <SimpleSequential props={myprops}/>
        <Classical props={myprops}/>
      </div>
    );
  }
}

export default App;
