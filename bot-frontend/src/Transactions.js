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
            <li><NavLink activeclassname="current" to="/transactions">Transactions</NavLink></li>
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
            <div className="col-md-6">
                <div className="jumbotron-at-top"><h1 className="margin">RECORD YOUR TRANSACTIONS</h1></div>
            </div>
            <div className="col-md-6">
              <div className="my-container-top">
                <div className="row">
                  <div className="col-lg-6">
                    <h1>LBP AMOUNT</h1>
                  </div>
                  <div className="col-lg-6">
                    <h1>USD AMOUNT</h1>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-6">
                    <div className="input-group">
                      <input
                        className="form-control"
                        aria-label="Amount"
                        placeholder="LBP amount"
                        id="amount"
                        type="number"
                        value={lbpInput}
                        onChange={(e) => setLbpInput(e.target.value)}

                      />
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="input-group">
                      <input
                        className="form-control"
                        aria-label="Amount"
                        placeholder="USD amount"
                        id="amount"
                        type="number"
                        value={usdInput}
                        onChange={(e) => setUsdInput(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="btn-group">
                  <button type="button" className="btn btn-primary" onClick={() => addItem(true)}>Sell USD</button>
                  <button type="button" className="btn btn-primary" onClick={() => addItem(false)}>Buy USD</button>
                </div>
              </div>
            </div>
    </div>
    <div className="row available-trans">
      <div className="jumbotron available-trans">
        <h1>All available transactions</h1>
      </div>
    </div>

    <div className="table-container">
      <h2>Pending transactions</h2>
      <p>
        Choose by clicking on the button in the select column the transaction
        that you would like to complete
      </p>
      <DataGrid
      id="table"
            columns={[
              {field: "added_date", headerName: "Date added", width: 250 },
              {field: "lbp_amount", headerName: "LBP Amount", flex: 1 },
              {field: "usd_amount", headerName: "USD Amount", flex: 1 },
              {field: "usd_to_lbp", headerName: "USD to LBP", flex: 1 },
            ]}
            rows={pendingTransactions}
            autoHeight
            onSelectionModelChange={(newSelection) => {
              setSelectionModel(newSelection);}}

          />
      <button className="submit-btn" type="button" onClick={() => completeTransaction()}>Submit</button>
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
    </div>
    );
}

  export default Transactions;