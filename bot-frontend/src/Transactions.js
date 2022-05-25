import './Transactions.css';
import { useState, useEffect, useCallback } from "react";
import { clearUserToken, saveUserToken, getUserToken } from "./localStorage";
import UserCredentialsDialog from "./UserCredentialsDialog/UserCredentialsDialog";
import { NavLink, Route, Switch } from 'react-router-dom';
import { DataGrid } from "@mui/x-data-grid";

var SERVER_URL = "http://127.0.0.1:5000";

const States = {
  PENDING: "PENDING",
  USER_CREATION: "USER_CREATION",
  USER_LOG_IN: "USER_LOG_IN",
  USER_AUTHENTICATED: "USER_AUTHENTICATED",
};


function Transactions(){
  let [lbpInput, setLbpInput] = useState("");
  let [usdInput, setUsdInput] = useState("");
  let [userToken, setUserToken] = useState(getUserToken());
  let [authState, setAuthState] = useState(States.PENDING);
  let [userTransactions, setUserTransactions] = useState([]);
  let [pendingTransactions, setPendingTransactions] = useState([]);
  const [selectionModel, setSelectionModel] = useState([]);
  let [Risk, setRisk] = useState("");
  let [buyUsdRate, setBuyUsdRate] = useState(null);
  let [sellUsdRate, setSellUsdRate] = useState(null);
  let [lbpCalcInp, setlbpCalcIn] = useState("");
  let [usdCalcInp, setusdCalcInp] = useState("");
  let [transTypeCalc, settransTypeCalc] = useState("usd-to-lbp");
  let [usdFunds, setUsdFunds] = useState("null");
  let [lbpFunds, setLbpFunds] = useState("null");
  let [graph, setGraph] = useState(null);
  let [coin_name, setCoin_name] = useState(null);


  async function addItem(transtype) {
    var type_trans_val = false;
    if (transtype === true) {
      type_trans_val = true;
    }

    const data = {
      usd_amount: usdInput,
      lbp_amount: lbpInput,
      usd_to_lbp: type_trans_val,
    };

    await fetch(`${SERVER_URL}/transaction`, {
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
        fetchPendingTransactions();
      })
      .catch((error) => {
        console.error("Error:", error);
      });

  }

  async function completeTransaction() {
    
    const data = {
      transaction_id: selectionModel
    };

    await fetch(`${SERVER_URL}/complete`, {
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
        fetchPendingTransactions();
        fetchUserTransactions();
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

  const fetchUserTransactions = useCallback(() => {
    fetch(`${SERVER_URL}/transaction`, {
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

  const fetchPendingTransactions = useCallback(() => {
    fetch(`${SERVER_URL}/pending`, {
    })
      .then((response) => response.json())
      .then((transactions) => setPendingTransactions(transactions));
  }, []);
  useEffect(() => {
    if (userToken) {
      fetchPendingTransactions();
    }
  }, [fetchPendingTransactions, userToken]);

  function Start_bot(){
    return fetch(`${SERVER_URL}/activateBot`, {
      method: "POST",
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
  }
  function Stop_bot(){
    return fetch(`${SERVER_URL}/deactivateBot`, {
      method: "POST",
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
  }
  function Change_param(){
    const data = {
      coin_name: coin_name,
      risk: usdCalcInp,
      percentage_change: lbpCalcInp
    };
    return fetch(`${SERVER_URL}/chnage_param`, {
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
        <UserCredentialsDialog
          open={true}
          title={"Register"}
          submitText={"Register"}
          onClose={() => setAuthState(States.PENDING)}
          onSubmit={createUser}
        />
      )}
      {authState === States.USER_LOG_IN && (
        <UserCredentialsDialog
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
              {field: "added_date", headerName: "Date added", width: 250 },
              {field: "lbp_amount", headerName: "LBP Amount", flex: 1 },
              {field: "usd_amount", headerName: "USD Amount", flex: 1 },
              {field: "usd_to_lbp", headerName: "USD to LBP", flex: 1 },
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
            <div>
            <i className="bi-currency-exchange" ></i>
            </div>
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
              value={lbpCalcInp}
              onChange={(val) => {
                  setlbpCalcIn(val.target.value);
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
              value={usdCalcInp}
              onChange={(val) => {
                  setusdCalcInp(val.target.value);
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
            <button type="button" className="btn btn-primary" onClick={Change_param()}>Submit</button>
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
      <div className="col-lg-5">
        <div className="my-container left" >
          <h1>Start {" "}</h1>
          <div class="btn-group">
            <button type="button" className="btn btn-primary" onClick={Start_bot()}>Start</button>
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
      </div>
    </div>
    </div>
    );
}

  export default Transactions;