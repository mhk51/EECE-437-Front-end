import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import React, { useState } from "react";
import "./CreateUserDialog.css";
// Component that presents a dialog to collect credentials from the user
export default function CreateUserDialog({
  open,
  onSubmit,
  onClose,
  title,
  submitText,
}) {
  let [username, setUsername] = useState("");
  let [password, setPassword] = useState("");
  let [email,setEmail] = useState("");
  let [date,setDate] = useState("");
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <div className="dialog-container">
        <DialogTitle>{title}</DialogTitle>
        <div className="form-item">
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={({ target: { value } }) => setEmail(value)}
          />
        </div>
        <div className="form-item">
          <TextField
            fullWidth
            label="Username"
            type="text"
            value={username}
            onChange={({ target: { value } }) => setUsername(value)}
          />
        </div>
        <div className="form-item">
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={({ target: { value } }) => setPassword(value)}
          />
        </div>
        <div className="form-item">
          <TextField
            fullWidth
            type="date"
            value={date}
            onChange={({ target: { value } }) => setDate(value)}
          />
        </div>
        <Button
          color="primary"
          variant="contained"
          onClick={() => onSubmit(username, password,email,date)}
        >
          {submitText}
        </Button>
      </div>
    </Dialog>
  );
}
