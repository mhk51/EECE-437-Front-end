import './Home.css';
import { useState, useEffect, useCallback } from "react";
import { clearUserToken, saveUserToken, getUserToken } from "./localStorage";
import { NavLink, Route, Routes } from 'react-router-dom';
import { jsonToWallet,walletToChart} from './models/wallet';
import { jsonToPerformance } from './models/performance';
import { PieChart } from 'react-minimal-pie-chart';
import { jsonToExchangeRate } from './models/exchangeRate';

import {
  LineChart,
  ResponsiveContainer,
  Legend, Tooltip,
  Line,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import LoginDialog from './UserCredentialsDialog/LoginDialog';
import CreateUserDialog from './UserCredentialsDialog/CreateUserDialog';

var SERVER_URL = "http://127.0.0.1:5000";

const States = {
  PENDING: "PENDING",
  USER_CREATION: "USER_CREATION",
  USER_LOG_IN: "USER_LOG_IN",
  USER_AUTHENTICATED: "USER_AUTHENTICATED",
};

function Home(){
  let [wallet,setWallet] = useState(null);
  let [exchangeRate,setExchangeRate] = useState(null)
  let [performanceList,setPerformanceList] = useState([])
  let [userToken, setUserToken] = useState(getUserToken());
  let [walletAmount,setWalletAmount] = useState(0)
  let [firstWalletAmount,setFirstWalletAmount] = useState(0)
  let [oneDayWalletAmount,setoneDayWalletAmount] = useState(0)
  let [sevenDayWalletAmount,setsevenDayWalletAmount] = useState(0)
  let [authState, setAuthState] = useState(States.PENDING);
  let [usdFunds, setUsdFunds] = useState("null");
  let [lbpFunds, setLbpFunds] = useState("null");

  let [graph, setGraph] = useState([]);
  let [graphDays,setGraphDays] = useState(1)


  function fetchWallet() {
    fetch(`${SERVER_URL}/wallet`, {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        "Authorization": 'Bearer ' + getUserToken(),
      },
    })
      .then((response) => response.json())
      .then((walletData) => setWallet(jsonToWallet(walletData)));
  }
  useEffect(fetchWallet, []);


  function fetchRate() {
    fetch(`${SERVER_URL}/exchangeRate`, {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => setExchangeRate(jsonToExchangeRate(data)));
  }
  useEffect(fetchRate, []);



  function getAmountFromDays(list,days){
    let d = new Date()
    d.setDate(d.getDate()-days);
    for(let i =0;i<list.length;i++){
      if(Date.parse(list[i].date) > d)
        return list[i].amount
    }
    return list.length != 0 ? list[list.length-1].amount : 0
  }
  function setGraphfromDays(graph,days){
    let d = new Date()
    let list = []
    d.setDate(d.getDate()-days);
    for(let i =0;i<graph.length;i++){
      list.push(graph[i])
      if(Date.parse(graph[i].date) > d){
        return graph[i].amount
      }
    }
    return 
  }

  function fetchGraph(days=1) {
    fetch(`${SERVER_URL}/performance`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        "Authorization": 'Bearer ' + getUserToken(),
      },
      body: JSON.stringify({'days':parseInt(days)})
    })
      .then((response) => response.json())
      .then((graph) => {
        setGraph(graph);
      });
  }
  useEffect(fetchGraph,[])


  function fetchPerformance() {
    fetch(`${SERVER_URL}/performance`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        "Authorization": 'Bearer ' + getUserToken(),
      },
      body: JSON.stringify({'days':30})
    })
      .then((response) => response.json())
      .then((graph) => {
        setPerformanceList(jsonToPerformance(graph)); 
        graph.length !=0 ? setWalletAmount(graph[graph.length-1].amount) : setWalletAmount(0);
        graph.length !=0 ? setoneDayWalletAmount(getAmountFromDays(graph,1)) : setoneDayWalletAmount(0);
        graph.length !=0 ? setsevenDayWalletAmount(getAmountFromDays(graph,3)) : setsevenDayWalletAmount(0);
        graph.length !=0 ? setFirstWalletAmount(graph[0].amount) : setFirstWalletAmount(0);
      });
  }
  useEffect(fetchPerformance,[])


  async function addFunds() {
    const data = {
      usd_amount: usdFunds,
      lbp_amount: lbpFunds
    };

    await fetch(`${SERVER_URL}/addFunds`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        "Authorization": 'Bearer ' + getUserToken(),
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  function login(username, password) {
    return fetch(`${SERVER_URL}/authentication`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    })
      .then((response) => response.json())
      .then((body) => {
        setAuthState(States.USER_AUTHENTICATED);
        setUserToken(body.token);
        saveUserToken(body.token);
      });
  }

  function createUser(username, password,email,date) {
    return fetch(`${SERVER_URL}/add_user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
        mail:email,
        dob: date
      }),
    }).then((response) => login(username, password));
  }

  function logout() {
    setUserToken(null);
    clearUserToken();
  }


  function calculateLastAmount(){
    let previousAmount = (performanceList.length > 1) ? performanceList[performanceList.length-2].amount : 0;
    let difference = walletAmount - previousAmount;
    return difference
  }

  function calculatePercentage(oldAmount){
    let difference = walletAmount - oldAmount;
    let pctChange = difference/oldAmount * 100;
    return pctChange
  }


    return(
        <div className='transactions'>
            {authState === States.USER_CREATION && 
        <CreateUserDialog
          open={true}
          title={"Register"}
          submitText={"Register"}
          onSubmit={createUser}
          onClose={() => setAuthState(States.PENDING)}
          
        />
      }
      {authState === States.USER_LOG_IN && (
        <LoginDialog
          open={true}
          title={"Log in"}
          submitText={"Log in"}
          onSubmit={login}
          onClose={() => setAuthState(States.PENDING)}
          
        />
      )}
    <div>
      <nav className="navbar navbar-inverse bringToFrontDiv">
        <div className="container-fluid">
          <div className="navbar-header">
            <a className="navbar-brand" href="/" 
              >REMEX Trading</a>
          </div>
          <ul className="nav navbar-nav">
            <li><NavLink activeClassName="current" to="/">Home</NavLink></li>
            <li><NavLink activeClassName="current" to="/transactions">Bot</NavLink></li>
            <li><NavLink activeClassName="current" to="/statistics">Statistics</NavLink></li>
          </ul>

          <div className="nav navbar-nav navbar-right">
          {userToken !== null ? (
            <button type="button" class="navbar-buttons" onClick={logout}>Logout</button>
            ) : (
              <div>
            <button type="button" class="navbar-buttons" onClick={() => setAuthState(States.USER_LOG_IN)}>Login</button>
            <button type="button" class="navbar-buttons" onClick={() => setAuthState(States.USER_CREATION)}>
              Sign up
            </button>
            </div>
            )}
          </div>
        </div>
      </nav>
    </div>
        <div className="row">
      <div className="col-lg-12">
        <div className="jumbotron bg-cover">
          <h1>Overview</h1>
        </div>
      </div>
    </div>
    <div className="row">
      <div className="col-lg-5">
        <div className="my-container left" >
          <h1>Account Value</h1>
          <div className="row">
            <div className='center-block'>
              <h3>
                {`$${walletAmount.toFixed(2)}`}
              </h3>
            </div>
            <div className='center-block'>
              <h3 style={{color: calculateLastAmount() >= 0 ? '#77DD77' : 'red'}}>
                {'('+(calculateLastAmount() >= 0 ? '+' : "-") + `$${Math.abs(calculateLastAmount()).toFixed(2)})`}
              </h3>
          </div>
          </div>
          <div className='walletTable'>
          <div className='row'>
           
          <div className='center-block'>1 Day</div>
          <div className='center-block'>3 Day</div>
          <div className='center-block'>All Time</div>
          </div>
          </div>
          <div className='row'>
          <div className='center-block' style={{color: calculatePercentage(oneDayWalletAmount) > 0 ? '#77DD77' : 'red'}}>
            <h6>{(calculatePercentage(oneDayWalletAmount)>=0 ? '+' : '-')+`${calculatePercentage(oneDayWalletAmount).toFixed(2)}%`}</h6></div>
          <div className='center-block' style={{color: calculatePercentage(sevenDayWalletAmount) > 0 ? '#77DD77' : 'red'}}>
            <h6>{(calculatePercentage(sevenDayWalletAmount)>=0 ? '+' : '-')+`${calculatePercentage(sevenDayWalletAmount).toFixed(2)}%`}</h6></div>
          <div className='center-block' style={{color: calculatePercentage(firstWalletAmount) > 0 ? '#77DD77' : 'red'}}>
            <h6>{(calculatePercentage(firstWalletAmount)>=0 ? '+' : '-')+`${calculatePercentage(firstWalletAmount).toFixed(2)}%`}</h6></div>
          </div>
        </div>
      </div>
      <div className="col-lg-2 vertical-line">
        <div className="vl"></div>
      </div>
      <div className="col-lg-5">
        <div className="my-container right">
          <h1 style={{paddingBottom:'40px'}}> Wallet Composition </h1>
          <PieChart
            data={(wallet != null && exchangeRate != null) ? walletToChart(wallet,exchangeRate): []}
            label={({ dataEntry }) =>  {return dataEntry.percentage > 40 ? dataEntry.title +" "+ dataEntry.percentage.toFixed() + "%": ''}}
            labelPosition = {0}
          />
        </div>
      </div>
    </div>



    <div className="top-container">
      <div className="radio-buttons" onChange={(val) => fetchGraph(val.target.value)}>
        <input type="radio" value="1" name="gender" />1 Day  
        <input type="radio" value="3" name="gender" />3 Days      
        <input type="radio" value="7" name="gender" />1 Week      
        <input type="radio" value="30" name="gender" />1 Month     
      </div>
      <ResponsiveContainer width="120%" aspect={3}>
				<LineChart data={graph} margin={{ right: 300 }}>
					<CartesianGrid />
					<XAxis dataKey="date"
						interval={'preserveStartEnd'} />
					<YAxis></YAxis>
					<Legend />
					<Tooltip />
					<Line dataKey="amount"
						stroke="blue" activeDot={{ r: 8 }} />
				</LineChart>
			</ResponsiveContainer>
      </div>
      <div className="row">
      <div className="calculator-container">
        <h1>ADD FUNDS</h1>
        <div className="row inputs">
          <div className="col-lg-5">
            <div className="input-group">
              <input
                className="form-control"
                aria-label="Amount"
                placeholder="LBP amount"
                id="funds-lbp"
                variant="filled"
                type="number"
                min="0"
                value={lbpFunds}
                onChange={(val) => {
                    setLbpFunds(val.target.value);                
                }}
              />
            </div>
          </div>
          <div className="col-lg-2 offset-lg-6">
          </div>
          <div className="col-lg-5">
            <div className="input-group">
              <input
                className="form-control"
                aria-label="Amount"
                placeholder="USD amount"
                id="funds-usd"
                variant="filled"
                type="number"
                min="0"
                value={usdFunds}
                onChange={(val) => {
                    setUsdFunds(val.target.value);                
                }}
              />
            </div>
          </div>
        </div>
        <div className="row">
            <button type="button" className="button-funds" onClick={addFunds}>ADD FUNDS</button>
        </div>
      </div>
    </div>


    </div>

  


    );
}
    

export default Home;

