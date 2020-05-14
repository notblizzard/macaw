import React, { useState } from "react";
import {
  TextField,
  makeStyles,
  Theme,
  fade,
  Typography,
  Button,
  Grid,
} from "@material-ui/core";
import { useHistory } from "react-router-dom";
import Cookies from "js-cookie";

const useStyles = makeStyles((theme: Theme) => ({
  search: {
    margin: theme.spacing(4),
    // backgroundColor: fade("#66d0f9", 0.1),
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    width: "20rem",
    "&:hover": {
      //   backgroundColor: fade("#66d0f9", 0.2),
    },
  },

  input: {
    color: "#eee",

    "& .MuiFormLabel-root": {
      color: "#79838a",
    },

    "& .MuiOutlinedInput-root": {
      color: "#eee",
      backgroundColor: fade("#66d0f9", 0.1),

      "&.Mui-focused fieldset": {
        borderColor: "#09a6f4",
        color: "#eee",
      },
    },
    width: "20rem",
    "&:focus": {
      borderColor: "#eee",
    },
  },
}));
const Login = (): JSX.Element => {
  const [data, setData] = useState({
    username: "",
    password: "",
  });
  // const [redirect] = useState(false);
  const history = useHistory();
  const classes = useStyles();

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const name = e.target.getAttribute("name")!;
    setData({ ...data, [name]: e.target.value });
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    fetch("/login", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": Cookies.get("XSRF-TOKEN")!,
      },
      body: JSON.stringify({
        username: data.username,
        password: data.password,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          history.push("/dashboard");
        }
      });
  };
  //if (redirect) return <Redirect to="/dashboard" />;

  return (
    <Grid container>
      <Grid item xs={12}>
        <Typography variant="h1" display="block">
          Login
        </Typography>
        <form onSubmit={onSubmit}>
          <TextField
            name="username"
            id="outlined-basic"
            label="Username"
            onChange={handleLoginChange}
            value={data.username}
            variant="outlined"
            classes={{
              root: classes.input,
            }}
          />
          <TextField
            name="password"
            id="outlined-basic"
            label="Password"
            type="password"
            onChange={handleLoginChange}
            value={data.password}
            variant="outlined"
            classes={{
              root: classes.input,
            }}
          />
          <Button type="submit" variant="contained">
            Submit
          </Button>
        </form>
        <h2>Login with a 3rd party account</h2>
        <a href="/auth/google" className="btn btn-outline-primary btn-google">
          <i className="fab fa-google"></i> Google
        </a>
        <a href="/auth/github" className="btn btn-outline-primary btn-github">
          <i className="fab fa-github"></i> Github
        </a>
      </Grid>
    </Grid>
  );
};

export default Login;
