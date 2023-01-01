import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import Explore from "./Explore";
import Register from "./auth/Register";
import ReactDOM from "react-dom";
import Login from "./auth/Login";
import PrivateRoute from "./auth/PrivateRoute";
import GuestRoute from "./auth/GuestRoute";
import Navbar from "./Navbar";
import Notifications from "./user/Notifications";
import {
  Container,
  makeStyles,
  Box,
  darken,
  Theme,
  Grid,
} from "@material-ui/core";
import NewMessage from "./message/NewMessage";
import Settings from "./user/Settings";
import Profile from "./user/Profile";
import Followers from "./user/Followers";
import Following from "./user/Following";
import Search from "./Search";
import Cookies from "js-cookie";
import io from "socket.io-client";
import DarkModeContext from "./DarkMode";
import { Helmet, HelmetProvider } from "react-helmet-async";
import PrivateMessage from "./message/PrivateMessage";
import Dashboard from "./user/Dashboard";

interface StyleProps {
  darkMode: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  container: (props: StyleProps) => ({
    backgroundColor: props.darkMode ? "#080b17" : "#dff0f7",
    color: props.darkMode ? "#dff0f7" : "#080b17",
    minHeight: `calc(100% - ${theme.spacing(10)}px)`,
    paddingTop: theme.spacing(10),
  }),
  moon: {
    color: "#dff0f7",
  },
  sun: {
    color: "#080b17",
  },
  button: {
    position: "absolute",
    bottom: "4rem",
    right: 0,
  },
  navBarGrid: {
    position: "fixed",
  },
  darkThemeButton: (props: StyleProps) => ({
    backgroundColor: props.darkMode ? "#dff0f7" : "#080b17",
    position: "fixed",
    right: 0,
    bottom: "4rem !important",
    margin: "2rem !important",
    color: props.darkMode ? "#080b17" : "#dff0f7",
    "&:hover": {
      backgroundColor: darken(props.darkMode ? "#dff0f7" : "#080b17", 0.1),
    },
  }),
}));

const App = (): JSX.Element => {
  //const socketio = io();

  const [color, setColor] = useState(Cookies.get("color") || "default");
  const { current: socket } = useRef(io());
  const [open, setOpen] = useState(false);
  const [darkTheme, setDarkTheme] = useState(
    Cookies.get("darkTheme") === "true" ? true : false,
  );
  const classes = useStyles({ darkMode: darkTheme });

  const handleOpen = (): void => {
    setOpen(true);
  };

  useEffect(() => {
    if (Cookies.get("email")) {
      fetch("/api/user/authenticate", {
        headers: {
          "X-CSRF-TOKEN": Cookies.get("XSRF-TOKEN")!,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success)
            socket.emit("authenticate", {
              id: data.id,
              username: data.username,
            });
        });
      fetch("/api/user/color", {
        headers: {
          "X-CSRF-TOKEN": Cookies.get("XSRF-TOKEN")!,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setColor(data.color);
        });
    }
  }, [socket]);

  // we pass down color to navbar and privatemessage through here
  // instead of with Cookies.get("color")
  // since those two are accessable from the settings page
  // so the color with update automatically, without having to set the cookie.
  const handleColor = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setColor(e.target.value);
  };

  const handleClose = (): void => {
    setOpen(false);
  };

  const toggleDarkMode = (): void => {
    const darkThemeCurrentValue = Cookies.get("darkTheme");
    Cookies.set(
      "darkTheme",
      darkThemeCurrentValue === "true" ? "false" : "true",
    );
    setDarkTheme(!darkTheme);
  };

  return (
    <HelmetProvider>
      <Helmet titleTemplate={"%s | Macaw"} defaultTitle="Macaw" />
      <Box className={classes.container}>
        <DarkModeContext.Provider value={darkTheme}>
          <BrowserRouter>
            <Grid container>
              <Grid item xs={1}>
                <NewMessage
                  open={open}
                  handleClose={handleClose}
                  socket={socket}
                />
                <Navbar
                  color={color}
                  socket={socket}
                  toggleDarkMode={toggleDarkMode}
                  handleNewMessageOpen={handleOpen}
                />
              </Grid>
              <Grid item xs={11}>
                <Container>
                  <Switch>
                    <Route
                      path="/explore"
                      render={(props) => <Explore {...props} socket={socket} />}
                    />
                    <Route path="/@:username/followers" component={Followers} />

                    <Route path="/@:username/following" component={Following} />

                    <Route
                      path="/@:username"
                      render={(props) => (
                        <Profile {...props} socket={socket} dashboard={false} />
                      )}
                    />

                    <Route
                      path="/search"
                      render={(props) => <Search {...props} socket={socket} />}
                    />

                    <GuestRoute path="/register">
                      <Register />
                    </GuestRoute>

                    <GuestRoute path="/login">
                      <Login />
                    </GuestRoute>

                    <PrivateRoute path="/dashboard">
                      <Dashboard dashboard={true} socket={socket} />
                    </PrivateRoute>

                    <PrivateRoute path="/notifications">
                      <Notifications />
                    </PrivateRoute>
                    <PrivateRoute path="/private-messages">
                      <PrivateMessage socket={socket} />
                    </PrivateRoute>

                    <PrivateRoute path="/settings">
                      <Settings handleColor={handleColor} />
                    </PrivateRoute>

                    <GuestRoute path="/">
                      <Redirect to="/explore" />
                    </GuestRoute>
                  </Switch>
                </Container>
              </Grid>
            </Grid>
          </BrowserRouter>
        </DarkModeContext.Provider>
      </Box>
    </HelmetProvider>
  );
};

ReactDOM.render(<App />, document.getElementById("app"));
