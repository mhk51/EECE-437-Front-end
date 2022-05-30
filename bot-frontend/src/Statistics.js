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
  let [graph, setGraph] = useState(null);



  
  async function fetchGraph(coin_name) {
    
    await fetch(`${SERVER_URL}/trend`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        coin_name : coin_name,
        hours: 24
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
      <div className="row">
        <div className="col-lg-12">
          <div className="jumbotron bg-cover">
            <h1>Cryptocurrency Trend</h1>
          </div>
        </div>
      </div>
      <div className="top-container">
      <div className="radio-buttons" onChange={(val) => fetchGraph(val.target.value)}>
        <input type="radio" value="bitcoin" name="gender" />Bitcoin   -
        <input type="radio" value="ethereum" name="gender" />Ethereum        
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
