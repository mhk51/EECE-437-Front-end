import "./Statistics.css";
import { useState, useEffect, useCallback } from "react";
import { clearUserToken, saveUserToken, getUserToken } from "./localStorage";
import { NavLink, Route, Switch } from "react-router-dom";
import {
  LineChart,
  ResponsiveContainer,
  Legend, Tooltip,
  Line,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import LoginDialog from "./UserCredentialsDialog/LoginDialog";
var SERVER_URL = "http://127.0.0.1:5000";

const States = {
  PENDING: "PENDING",
  USER_CREATION: "USER_CREATION",
  USER_LOG_IN: "USER_LOG_IN",
  USER_AUTHENTICATED: "USER_AUTHENTICATED",
};

function Statistics() {
  let [userToken, setUserToken] = useState(getUserToken());
  let [authState, setAuthState] = useState(States.PENDING);

  let [change_buy_24, set_change_buy_24] = useState(null);
  let [change_buy_month, set_change_buy_month] = useState(null);
  let [change_sell_24, set_change_sell_24] = useState(null);
  let [change_sell_month, set_change_sell_month] = useState(null);
  let [num_pending, set_num_pending] = useState(null);
  let [num_trans_24, set_num_trans_24] = useState(null);
  let [num_trans_month, set_num_trans_month] = useState(null);
  let [graph, setGraph] = useState(null);


  function fetchStats() {
    fetch(`${SERVER_URL}/statistics`)
      .then((response) => response.json())
      .then((data) => {
        set_change_buy_24(data.change_buy_24);
        set_change_buy_month(data.change_buy_m);
        set_change_sell_24(data.change_sell_24);
        set_change_sell_month(data.change_sell_m);
        set_num_pending(data.num_pending);
        set_num_trans_24(data.num_trans_24);
        set_num_trans_month(data.num_trans_m);
      });

      fetchGraph();
  }
  useEffect(fetchStats, []);

  
  async function fetchGraph(val) {
    const data = parseInt(val);
    await fetch(`${SERVER_URL}/getTrend`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        coin_name : 'Bitcoin',
        hours: data
      }),
    })
      .then((response) => response.json())
      .then((graph) => setGraph(graph));
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
    setUserToken(null).then(clearUserToken);
  }


  
 

  return (
    <div className="statistics">
      {authState === States.USER_CREATION && (
        <LoginDialog
          open={true}
          title={"Register"}
          submitText={"Register"}
          onClose={() => setAuthState(States.PENDING)}
          onSubmit={createUser}
        />
      )}
      {authState === States.USER_LOG_IN && (
        <LoginDialog
          open={true}
          title={"Log in"}
          submitText={"Log in"}
          onClose={() => setAuthState(States.PENDING)}
          onSubmit={login}
        />
      )}
      <div>
        <nav className="navbar navbar-inverse bringToFrontDiv">
          <div className="container-fluid">
            <div className="navbar-header">
              <a className="navbar-brand" href="/">
              REMEX Trading
              </a>
            </div>
            <ul className="nav navbar-nav">
              <li>
                <NavLink activeClassName="current" to="/">
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink activeClassName="current" to="/transactions">
                  Bot
                </NavLink>
              </li>
              <li>
                <NavLink activeClassName="current" to="/statistics">
                  Statistics
                </NavLink>
              </li>
            </ul>

            <div className="nav navbar-nav navbar-right">
              {userToken !== null ? (
                <button type="button" class="navbar-buttons" onClick={logout}>
                  Logout
                </button>
              ) : (
                <div>
                  <button
                    type="button"
                    class="navbar-buttons"
                    onClick={() => setAuthState(States.USER_LOG_IN)}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    class="navbar-buttons"
                    onClick={() => setAuthState(States.USER_CREATION)}
                  >
                    Sign up
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>
      <div className="top-container">
        <div className="row">
          <div className="col-lg-4">
            <h2>Average selling rate</h2>
            <div className="row elements">
              <div className="col-lg-6">
                <h4>last 24 hours</h4>
              </div>
              <div className="col-lg-6">
                <h4>last month</h4>
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <h2>Average buying rate</h2>
            <div className="row elements">
              <div className="col-lg-6">
                <h4>last 24 hours</h4>
              </div>
              <div className="col-lg-6">
                <h4>last month</h4>
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <h2>Number of pending transactions</h2>
          </div>
        </div>
        <div className="row elements">
          <div className="col-lg-2">
            <h3>
              <span id="sell-usd-24">
                {change_sell_24 == null
                  ? "Rate not available"
                  : change_sell_24.toFixed(2)}
              </span>
            </h3>
          </div>
          <div className="col-lg-2">
            <h3>
              <span id="sell-usd-month">
                {change_sell_month == null
                  ? "Rate not available"
                  : change_sell_month.toFixed(2)}
              </span>
            </h3>
          </div>
          <div className="col-lg-2">
            <h3>
              <span id="buy-usd-24">
                {change_buy_24 == null
                  ? "Rate not available"
                  : change_buy_24.toFixed(2)}
              </span>
            </h3>
          </div>
          <div className="col-lg-2">
            <h3>
              <span id="buy-usd-month">
                {change_buy_month == null
                  ? "Rate not available"
                  : change_buy_month.toFixed(2)}
              </span>
            </h3>
          </div>
          <div className="col-lg-4">
            <h3><span id="num-pending">
                {num_pending == null
                  ? "Rate not available"
                  : num_pending.toFixed(2)}
              </span></h3>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-4">
            <h2>Number of transactions:</h2>
          </div>
          <div className="col-lg-2 align">
            <h4>last 24 hours:</h4>
            <h4>last month:</h4>
          </div>
          <div className="col-lg-2 align">
            <h3><span id="num-trans-24">
                {num_trans_24 == null
                  ? "Rate not available"
                  : num_trans_24.toFixed(2)}
              </span></h3>
            <h3><span id="num-trans-month">
                {num_trans_month == null
                  ? "Rate not available"
                  : num_trans_month.toFixed(2)}
              </span></h3>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-lg-12">
          <div className="jumbotron bg-cover">
            <h1>Cryptocurrency Trend</h1>
          </div>
        </div>
      </div>
      <div className="top-container">
      <div className="radio-buttons" onChange={(val) => fetchGraph(val.target.value)}>
        <input type="radio" value="12" name="gender" />12 Hours  -
        <input type="radio" value="24" name="gender" />1 Day  -    
        <input type="radio" value="72" name="gender" />3 Day  -    
        <input type="radio" value="168" name="gender" />1 Week     
      </div>
      <ResponsiveContainer width="120%" aspect={3}>
      <LineChart data={graph} margin={{ right: 300 }}>
					<CartesianGrid />
					<XAxis dataKey="date"
						interval={'preserveStartEnd'} />
					<YAxis></YAxis>
					<Legend />
					<Tooltip />
					<Line dataKey="price_close"
						stroke="blue" activeDot={{ r: 8 }} />
				</LineChart>
			</ResponsiveContainer>
      </div>
    </div>
  );
}

export default Statistics;
