import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import jStat from 'jStat';
import Classical from './models/classical';
import SimpleSequential from './models/SimpleSequential';
import Agile from './models/agile';
import NumericControl from './widgets/NumericControl';

const invNormCDF = (x) => jStat.normal.inv(1-x,0,1);
const alpha = 0.05;



class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      alpha: 5,
      beta: 20,
      delta: 2,
      rate: 500,
      baserate: 3
    };
  }

  render() {
    let myprops = {
      name: 'Classical',
      alpha : this.state.alpha / 100,
      beta: this.state.beta / 100,
      differenceThreshold: this.state.delta / 100,
      rate: this.state.rate,
      baseRate: this.state.baserate / 100
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
        <NumericControl props={{value: this.state.alpha, name: 'α', min: 0, max:55, onValueChange: (num) => this.setState({alpha: num})}}/>
        <NumericControl props={{value: this.state.beta, name: 'β', min: 0, max:55, onValueChange: (num) => this.setState({beta: num})}}/>
        <NumericControl props={{value: this.state.delta, name: 'δ', min: 0, max:200, onValueChange: (num) => this.setState({delta: num})}}/>
        <Classical props={myprops}/>
        <SimpleSequential props={myprops}/>
        <Classical props={myprops}/>
      </div>
    );
  }
}

export default App;
