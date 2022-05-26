import './Transactions.css';
import { useState, useEffect, useCallback } from "react";
import { clearUserToken, saveUserToken, getUserToken } from "./localStorage";
import { NavLink, Route, Switch } from 'react-router-dom';
import { DataGrid } from "@mui/x-data-grid";
import LoginDialog from './UserCredentialsDialog/LoginDialog';

var SERVER_URL = "http://127.0.0.1:5000";

const States = {
  PENDING: "PENDING",
  USER_CREATION: "USER_CREATION",
  USER_LOG_IN: "USER_LOG_IN",
  USER_AUTHENTICATED: "USER_AUTHENTICATED",
};


function Transactions(){
  let [userToken, setUserToken] = useState(getUserToken());
  let [authState, setAuthState] = useState(States.PENDING);
  let [userTransactions, setUserTransactions] = useState([]);
  let [risk, setRisk] = useState(null);
  let [buy_percentage,setBuyPercentage] = useState(null);
  let [coin_name, setCoin_name] = useState("bitcoin");
  let [bot_active,setBotActive] = useState(false);



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

  function createUser(username, password) {
    return fetch(`${SERVER_URL}/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    }).then((response) => login(username, password));
  }

 function logout() {
    setUserToken(null);
    clearUserToken();
  }

  const fetchUserTransactions = useCallback(() => {
    fetch(`${SERVER_URL}/transactions`, {
      headers: {
        Authorization: `bearer ${userToken}`,
      },
    })
      .then((response) => response.json())
      .then((transactions) => setUserTransactions(transactions));
  }, [userToken]);
  useEffect(() => {
    if (userToken) {
      fetchUserTransactions();
    }
  }, [fetchUserTransactions, userToken]);


  const fetchBotState = useCallback(() => {
    fetch(`${SERVER_URL}/bot`, {
      headers: {
        Authorization: `bearer ${userToken}`,
      },
    })
      .then((response) => response.json())
      .then((data) => setBotActive(data['is_active']));
  }, [userToken]);
  useEffect(() => {
    if (userToken) {
      fetchBotState();
    }
  }, [fetchBotState, userToken]);


  async function Switch_Activate(){
    await fetch(`${SERVER_URL}/switchActivate`, {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        "Authorization": 'Bearer ' + getUserToken(),
      }
    })
      .then((response) => response.json())
      .catch((error) => {
        console.error("Error:", error);
      });
    fetchBotState();
  }
  function Change_param(){
    const data = {
      coin_name: coin_name.toLowerCase(),
      risk: risk/100,
      buy_percentage: buy_percentage/100
    };
    return fetch(`${SERVER_URL}/change_param`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        "Authorization": 'Bearer ' + getUserToken(),
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .catch((error) => {
        console.error("Error:", error);
      });
  }
  return(
        <div className='transactions'>
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
            <a className="navbar-brand" href="/" >REMEX Trading</a>
          </div>
          <ul className="nav navbar-nav">
            <li><NavLink activeclassname="current" to="/">Home</NavLink></li>
            <li><NavLink activeclassname="current" to="/transactions">Bot</NavLink></li>
            <li><NavLink activeclassname="current" to="/statistics">Statistics</NavLink></li>
          </ul>

              <div className="nav navbar-nav navbar-right">
                    {userToken !== null ? (
                      <button type="button" className="navbar-buttons" onClick={logout}>Logout</button>
                      ) : (
                          <div>
                              <button type="button" className="navbar-buttons" onClick={() => setAuthState(States.USER_LOG_IN)}>Login</button>
                              <button type="button" className="navbar-buttons" onClick={() => setAuthState(States.USER_CREATION)}>Sign up</button>
                          </div>
                      )}
              </div>
        </div>
      </nav>
      </div>
      <div className="row">
      <div className="col-lg-12">
        <div className="jumbotron bg-cover">
          <h1>Bot</h1>
        </div>
      </div>
    </div>
    <div className="row available-trans">
      <div className="jumbotron available-trans">
        <h1>All available transactions</h1>
      </div>
    </div>
    <div className="table-container">
      <h2>User transactions</h2>
      <DataGrid
      id="table"
            columns={[
              {field: "date", headerName: "Date", width: 200 },
              {field: "coin_amount", headerName: "Coin Amount", flex: 1 },
              {field: "usd_amount", headerName: "USD Amount", flex: 1 },
              {field: "exchange_rate",headerName: "Exchange Name",flex: 1},
              {field: "coin_name",headerName: "Coin Name",flex: 1},
              {field: "buying", headerName: "Buy/Selling", flex: 1 },
            ]}
            rows={userTransactions}
            autoHeight

          />
    </div>
    <div className="row">
      <div className="calculator-container">
        <h1>Options</h1>
        <div className="row">
          <div className="col-lg-5">
            <h3>Risk</h3>
          </div>
          <div className="col-lg-2 offset-lg-6">

          </div>
          <div className="col-lg-5">
            <h3>Percentage of Use</h3>
          </div>
        </div>
        <div className="row inputs">
          <div className="col-lg-5">
            <div className="input-group">
              <input
                className="form-control"
                aria-label="Amount"
                placeholder="Risk"
                id="calc-lbp"
              variant="filled"
              type="number"
              min="0"
              // value={lbpCalcInp}
              onChange={(val) => {
                  setRisk(val.target.value);
              }}
              />
            </div>
          </div>
          <div className="col-lg-8">
          <div className="input-group">
              <select val="coin_name" value={coin_name} onChange={(val)=>{setCoin_name(val.target.value)}}>
                <option value="Bitcoin">Bitcoin</option>
                <option value="Ethereum">Ethereum</option>
                <option value="mercedes">Coin 3</option>
                <option value="audi">Coin 4</option>
              </select>
            </div>
            </div>
          <div className="col-lg-5">
            <div className="input-group">
              <input
                className="form-control"
                aria-label="Amount"
                placeholder="Percentage of Use"
                id="calc-usd"
              variant="filled"
              type="number"
              min="0"
              // value={usdCalcInp}
              onChange={(val) => {
                  setBuyPercentage(val.target.value);
              }}
              />
            </div>
          </div>
        </div>
        <br></br>
        <div className="row">
        <div>
              <h3>Amount of Risk the bot would take (0 to 100)</h3>
            </div>
          <div className="col-lg-2 offset-lg-6">
            <div>
            <div class="btn-group">
            <button type="button" className="btn btn-primary" onClick={Change_param}>Submit</button>
          </div>
            </div>
            </div>
            <div>
              <h3>Amount of Cash the bot would use (0 to 100)</h3>
            </div>
          </div>
      </div>
    </div>
    <div className="row">
    <div className="col-lg-12">
                      
    {bot_active === false ? (
                      <div className="my-container center" >
                        <h1>Bot Deactivated {" "}</h1>
                        <div class="btn-group">
                          <button type="button" className="btn btn-primary" onClick={Switch_Activate}>Activate</button>
                          </div>
                          </div>
                      ) : (
                        <div className="my-container center" >
                          <h1>Bot Activated {" "}</h1>
                          <div class="btn-group">
                            <button type="button" className="btn btn-primary" onClick={Switch_Activate}>Deactivate</button>
                            </div>
                        </div>
                      )}
              </div>
                    
      {/* <div className="col-lg-5">
        <div className="my-container left" >
          <h1>Start {" "}</h1>
          <div class="btn-group">
            <button type="button" className="btn btn-primary" onClick={Switch_Activate()}>Start</button>
            </div>
        </div>
      </div>
      <div className="col-lg-2 vertical-line">
        <div className="vl"></div>
      </div>
      <div className="col-lg-5">
        <div className="my-container right">
          <h1>Stop {" "}</h1>
          <div class="btn-group">
          <button type="button" className="btn btn-primary" onClick={Stop_bot()}>Stop</button>
            </div>
        </div>
      </div> */}
    </div>
    </div>
    );
}

  export default Transactions;