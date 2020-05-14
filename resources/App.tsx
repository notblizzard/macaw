import React, { useState, Fragment, useEffect } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Register from "./auth/Register";
import ReactDOM from "react-dom";
import Home from "./Home";
import Login from "./auth/Login";
import PrivateRoute from "./auth/PrivateRoute";
import GuestRoute from "./auth/GuestRoute";
import Dashboard from "./user/Dashboard";
import CreateIcon from "@material-ui/icons/CreateOutlined";
import Navbar from "./Navbar";
import { Fab, Container } from "@material-ui/core";
import NewMessage from "./message/NewMessage";
import Settings from "./user/Settings";
import Profile from "./user/Profile";
import Followers from "./user/Followers";
import Following from "./user/Following";
import Search from "./Search";
import Cookies from "js-cookie";

const App = (): JSX.Element => {
  const [color, setColor] = useState("");
  const [open, setOpen] = useState(false);

  const handleOpen = (): void => {
    setOpen(true);
  };

  useEffect(() => {
    fetch("/api/user/color", {
      credentials: "include",
      headers: {
        "X-CSRF-TOKEN": Cookies.get("XSRF-TOKEN")!,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setColor(data.color);
      });
  }, []);

  const handleColor = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setColor(e.target.value);
  };

  const handleClose = (): void => {
    setOpen(false);
  };

  return (
    <Fragment>
      <NewMessage open={open} onClose={handleClose} color={color} />
      <BrowserRouter>
        <Navbar color={color} />
        <Container>
          <Switch>
            <Route path="/@:username/followers">
              <Followers />
            </Route>
            <Route path="/@:username/following">
              <Following />
            </Route>
            <Route path="/@:username">
              <Profile />
            </Route>
            <Route path="/search">
              <Search />
            </Route>
            <GuestRoute path="/register">
              <Register />
            </GuestRoute>
            <GuestRoute path="/login">
              <Login />
            </GuestRoute>
            <PrivateRoute path="/dashboard">
              <Dashboard />
            </PrivateRoute>
            <PrivateRoute path="/settings">
              <Settings handleColor={handleColor} />
            </PrivateRoute>
            <GuestRoute path="/">
              <Home />
            </GuestRoute>
          </Switch>
        </Container>
      </BrowserRouter>
      {Cookies.get("email") ? (
        <Fab
          className={"floating-new-message-button-" + color}
          onClick={handleOpen}
        >
          <CreateIcon />
        </Fab>
      ) : null}
    </Fragment>
  );
};

ReactDOM.render(<App />, document.getElementById("app"));
