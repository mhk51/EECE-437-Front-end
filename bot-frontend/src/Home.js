import './Home.css';
import { useState, useEffect, useCallback } from "react";
import { clearUserToken, saveUserToken, getUserToken } from "./localStorage";
import UserCredentialsDialog from "./UserCredentialsDialog/UserCredentialsDialog";
import { NavLink, Route, Routes } from 'react-router-dom';
import Transactions from './Transactions';
import TradeViewChart from 'react-crypto-chart'

import {
  LineChart,
  ResponsiveContainer,
  Legend, Tooltip,
  Line,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

var SERVER_URL = "http://127.0.0.1:5000";

const States = {
  PENDING: "PENDING",
  USER_CREATION: "USER_CREATION",
  USER_LOG_IN: "USER_LOG_IN",
  USER_AUTHENTICATED: "USER_AUTHENTICATED",
};

function Home(){
  let [buyUsdRate, setBuyUsdRate] = useState(null);
  let [sellUsdRate, setSellUsdRate] = useState(null);
  let [userToken, setUserToken] = useState(getUserToken());
  let [authState, setAuthState] = useState(States.PENDING);
  let [lbpCalcInp, setlbpCalcIn] = useState("");
  let [usdCalcInp, setusdCalcInp] = useState("");
  let [transTypeCalc, settransTypeCalc] = useState("usd-to-lbp");
  let [usdFunds, setUsdFunds] = useState("null");
  let [lbpFunds, setLbpFunds] = useState("null");
  let [graph, setGraph] = useState(null);


  function fetchRates() {
    fetch(`${SERVER_URL}/exchangeRate`)
      .then((response) => response.json())
      .then((data) => {
        setBuyUsdRate(data.lbp_to_usd);
        setSellUsdRate(data.usd_to_lbp);
      });
  }
  useEffect(fetchRates, []);

  async function fetchGraph(val) {
    const data = parseInt(val);
    await fetch(`${SERVER_URL}/graph`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        start_range : data,
      }),
    })
      .then((response) => response.json())
      .then((graph) => setGraph(graph));
  }

  async function addFunds() {
    console.log(lbpFunds);
    console.log(usdFunds);
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
        user_name: username,
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

  function createUser(username, password) {
    return fetch(`${SERVER_URL}/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_name: username,
        password: password,
      }),
    }).then((response) => login(username, password));
  }

  function logout() {
    setUserToken(null);
    clearUserToken();
  }
    return(
        <div className='transactions'>
            {authState === States.USER_CREATION && 
        <UserCredentialsDialog
          open={true}
          title={"Register"}
          submitText={"Register"}
          onSubmit={createUser}
          onClose={() => setAuthState(States.PENDING)}
          
        />
      }
      {authState === States.USER_LOG_IN && (
        <UserCredentialsDialog
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
              >REMEX Trading</a
            >
          </div>
          <ul className="nav navbar-nav">
            <li><NavLink activeClassName="current" to="/">Home</NavLink></li>
            <li><NavLink activeClassName="current" to="/transactions">Transactions</NavLink></li>
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
          <h1>Today's Exchange Rate</h1>
        </div>
      </div>
    </div>
    <div className="row">
      <div className="col-lg-5">
        <div className="my-container left" >
          <h1>BUY USD {" "}</h1>
          <h3><span id="buy-usd-rate">
            {buyUsdRate == null ? "Rate not available" : buyUsdRate.toFixed(2)}
          </span></h3>
        </div>
      </div>
      <div className="col-lg-2 vertical-line">
        <div className="vl"></div>
      </div>
      <div className="col-lg-5">
        <div className="my-container right">
          <h1>SELL USD {" "}</h1>
          <h3><span id="sell-usd-rate">
            {sellUsdRate == null
              ? "Rate not available"
              : sellUsdRate.toFixed(2)}
          </span></h3>
        </div>
      </div>
    </div>

    <div className="row">
      <div className="calculator-container">
        <h1>CALCULATOR</h1>
        <div className="row">
          <div className="col-lg-5">
            <h3>LBP AMOUNT</h3>
          </div>
          <div className="col-lg-2 offset-lg-6">
            <div>
            <i className="bi-currency-exchange" ></i>
            </div>
          </div>
          <div className="col-lg-5">
            <h3>USD AMOUNT</h3>
          </div>
        </div>
        <div className="row inputs">
          <div className="col-lg-5">
            <div className="input-group">
              <input
                className="form-control"
                aria-label="Amount"
                placeholder="LBP amount"
                id="calc-lbp"
              variant="filled"
              type="number"
              min="0"
              value={lbpCalcInp}
              onChange={(val) => {
                if (transTypeCalc === "usd-to-lbp") {
                  setlbpCalcIn(val.target.value);
                  setusdCalcInp(val.target.value / sellUsdRate);
                } else {
                  setlbpCalcIn(val.target.value);
                  setusdCalcInp(val.target.value / buyUsdRate);
                }
              }}
              />
            </div>
          </div>
          <div className="col-lg-2 offset-lg-6">
            <div>
            <div class="btn-group">
            <button type="button" className="btn btn-primary" onClick={() => settransTypeCalc("usd-to-lbp")}>Sell USD</button>
            <button type="button" className="btn btn-primary" onClick={() => settransTypeCalc("lbp-to-usd")}>Buy USD</button>
          </div>
            </div>
          </div>
          <div className="col-lg-5">
            <div className="input-group">
              <input
                className="form-control"
                aria-label="Amount"
                placeholder="USD amount"
                id="calc-usd"
              variant="filled"
              type="number"
              min="0"
              value={usdCalcInp}
              onChange={(val) => {
                if (transTypeCalc === "usd-to-lbp") {
                  setusdCalcInp(val.target.value);
                  setlbpCalcIn(val.target.value * sellUsdRate);
                } else {
                  setusdCalcInp(val.target.value);
                  setlbpCalcIn(val.target.value * buyUsdRate);
                }
              }}
              />
            </div>
          </div>
        </div>
      </div>
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
    <div className="top-container">
      <div className="radio-buttons" onChange={(val) => fetchGraph(val.target.value)}>
        <input type="radio" value="1" name="gender" />1 Day  -
        <input type="radio" value="7" name="gender" />1 Week  -    
        <input type="radio" value="30" name="gender" />1 Month  -    
        <input type="radio" value="365" name="gender" />1 Year     
      </div>
      <ResponsiveContainer width="120%" aspect={3}>
				{/* <LineChart data={graph} margin={{ right: 300 }}>
					<CartesianGrid />
					<XAxis dataKey="date"
						interval={'preserveStartEnd'} />
					<YAxis></YAxis>
					<Legend />
					<Tooltip />
					<Line dataKey="lbp_to_usd_average"
						stroke="blue" activeDot={{ r: 8 }} />
					<Line dataKey="usd_to_lbp_average"
						stroke="yellow" activeDot={{ r: 8 }} />
				</LineChart> */}
        <TradeViewChart pair='BTCUSD'/>
			</ResponsiveContainer>
      </div>
    </div>
    );
}
    

export default Home;

