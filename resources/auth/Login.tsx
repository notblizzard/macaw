import React, { useState, useContext } from "react";
import {
  TextField,
  makeStyles,
  Theme,
  fade,
  Typography,
  Button,
  darken,
  Box,
} from "@material-ui/core";
import { useHistory } from "react-router-dom";
import { GitHub as GitHubIcon } from "@material-ui/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import Cookies from "js-cookie";
import DarkModeContext from "../DarkMode";

const useStyles = makeStyles((theme: Theme) => ({
  grid: {
    justifyContent: "center",
  },
  text: {
    textAlign: "center",
  },
  button: {
    backgroundColor: "#23f0c7",
    marginBottom: theme.spacing(1),
    "&:hover": {
      backgroundColor: darken("#23f0c7", 0.1),
    },
  },
  github: {
    //margin: theme.spacing(1),
    backgroundColor: "#24292e",
    color: "#eee",
    "&:hover": {
      backgroundColor: darken("#24292e", 0.1),
    },
  },
  google: {
    //margin: theme.spacing(1),
    backgroundColor: "#ea4335",
    color: "#eee",
    "&:hover": {
      backgroundColor: darken("#ea4335", 0.1),
    },
  },
  input: {
    margin: theme.spacing(1),
    width: "40%",
    "& .MuiFormLabel-root": {
      color: (props: { darkMode: boolean }): string =>
        props.darkMode ? "#eee" : "#222",
    },
    "& .MuiOutlinedInput-root": {
      color: (props: { darkMode: boolean }): string =>
        props.darkMode ? "#eee" : "#222",
      backgroundColor: fade("#66d0f9", 0.1),
      borderRadius: theme.shape.borderRadius,

      "&.Mui-focused fieldset": {
        borderColor: "#114B5F",
      },
    },
    "& .MuiFormHelperText-root": {
      fontWeight: "bold",
    },
    "&:focus": {
      borderColor: "#eee",
    },
  },
}));

const Login = (): JSX.Element => {
  const darkMode = useContext(DarkModeContext);

  const [data, setData] = useState({
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    username: [],
    password: [],
  });
  const history = useHistory();
  const classes = useStyles({ darkMode });

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const name = e.target.getAttribute("name")!;
    setData({ ...data, [name]: e.target.value });
  };

  const handleGithubOauth = (): void => {
    window.location.replace("/auth/github");
  };

  const handleGoogleOauth = (): void => {
    window.location.replace("/auth/google");
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
        } else {
          setErrors({ ...errors, ...data.errors });
        }
      });
  };

  return (
    <form onSubmit={onSubmit}>
      <Box display="flex" flexDirection="column" alignItems="center">
        <Typography variant="h1">Login</Typography>
        <TextField
          name="username"
          id="outlined-basic"
          label="Username"
          onChange={handleLoginChange}
          value={data.username}
          variant="outlined"
          error={errors.username.length > 0}
          helperText={errors.username.join("\n")}
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
          error={errors.password.length > 0}
          helperText={errors.password.join("\n")}
          variant="outlined"
          classes={{
            root: classes.input,
          }}
        />
        <Box display="flex" flexDirection="column">
          <Button type="submit" variant="contained" className={classes.button}>
            Login
          </Button>
          <Box display="flex">
            <Button
              variant="contained"
              className={classes.github}
              onClick={handleGithubOauth}
            >
              <GitHubIcon />
              {` Github`}
            </Button>
            <Button
              variant="contained"
              className={classes.google}
              onClick={handleGoogleOauth}
            >
              <FontAwesomeIcon icon={faGoogle} /> Google
            </Button>
          </Box>
        </Box>
      </Box>
    </form>
  );
};

export default Login;
