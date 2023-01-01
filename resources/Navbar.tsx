import React, { useContext, useEffect, useState } from "react";
import {
  Toolbar,
  AppBar,
  Typography,
  IconButton,
  Box,
} from "@material-ui/core";
import { darken, fade, makeStyles, Theme } from "@material-ui/core/styles";
import { Link, useHistory, useLocation } from "react-router-dom";
import {
  Search as SearchIcon,
  Settings as SettingsIcon,
  ExitToApp as ExitToAppIcon,
  QuestionAnswer as ConversationIcon,
  Explore as ExploreIcon,
  Brightness2 as MoonIcon,
  Brightness5 as SunIcon,
  House as HouseIcon,
} from "@material-ui/icons";
import CreateIcon from "@material-ui/icons/CreateOutlined";

import Gravatar from "./util/Gravatar";
import Cookies from "js-cookie";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSignInAlt,
  faUserPlus,
  faBell,
} from "@fortawesome/free-solid-svg-icons";
import DarkModeContext from "./DarkMode";
interface StyleProps {
  darkMode: boolean;
}

interface NavbarProps {
  color: string;
  socket: SocketIOClient.Socket;
  toggleDarkMode: () => void;
  handleNewMessageOpen: () => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  icons: (props: StyleProps) => ({
    color: props.darkMode ? "#eee" : "#222",
    margin: theme.spacing(1),
  }),
  navBar: (props: StyleProps) => ({
    backgroundColor: props.darkMode ? "#080b17" : "#dff0f7",
    boxShadow: "none",
    marginBottom: theme.spacing(4),
    position: "fixed",
    width: "10%",
  }),
  toolBar: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  darkThemeButton: (props: StyleProps) => ({
    //backgroundColor: props.darkMode ? "#dff0f7" : "#080b17",
    //position: "fixed",
    //right: 0,
    //bottom: "4rem !important",
    //margin: "2rem !important",
    color: props.darkMode ? "#dff0f7" : "#080b17",
    /* "&:hover": {
      backgroundColor: darken(props.darkMode ? "#dff0f7" : "#080b17", 0.1),
    },*/
  }),
  input: (props: StyleProps) => ({
    color: "transparent", //props.darkMode ? "#080b17" : "#dff0f7",
    padding: theme.spacing(1, 1, 1, 4),
    transition: theme.transitions.create("width"),
    width: theme.spacing(0),
    "&:focus": {
      color: props.darkMode ? "#dff0f7" : "#080b17",
      width: theme.spacing(40),
    },
  }),
  search: (props: StyleProps) => ({
    //backgroundColor: props.darkMode ? "#eee" : "#222",
    backgroundColor: fade("#66d0f9", 0.1),

    position: "relative",
    borderRadius: theme.shape.borderRadius,
    "&:hover": {
      backgroundColor: fade("#66d0f9", 0.2),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(3),
      width: "auto",
    },
  }),
  searchIcon: (props: StyleProps) => ({
    padding: theme.spacing(0, 1),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: props.darkMode ? "#dff0f7" : "#080b17",
  }),
}));

const Navbar = ({
  color,
  socket,
  toggleDarkMode,
  handleNewMessageOpen,
}: NavbarProps): JSX.Element => {
  const [notificationCount, setNotificationCount] = useState(0);
  const darkMode = useContext(DarkModeContext);
  const history = useHistory();
  const classes = useStyles({ darkMode });
  const location = useLocation();

  useEffect(() => {
    socket.emit("path", location.pathname);
    if (Cookies.get("email")) {
      fetch("/api/user/notifications?count=true")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setNotificationCount(data.notifications);
          }
        });
    }
  }, [location, socket]);

  const handleLogout = (): void => {
    fetch("/logout", {
      headers: { "X-CSRF-TOKEN": Cookies.get("XSRF-TOKEN")! },
    }).then(() => {
      Cookies.remove("email");
      history.push("/");
    });
  };

  return (
    <>
      <AppBar className={classes.navBar} position="relative">
        <Toolbar className={classes.toolBar}>
          {Cookies.get("email") ? (
            <>
              <Box display="flex" alignItems="center" className={classes.icons}>
                <Link to="/dashboard">
                  <Gravatar email={Cookies.get("email")!} size={5} />
                </Link>
              </Box>
              <Link to="/dashboard" className="navbar-link">
                <Box display="flex" alignItems="center" alignContent={"center"}>
                  <HouseIcon
                    className={`navbar-button-${color} ${classes.icons}`}
                    fontSize="large"
                  />
                  <span className="navbar-text">Dashboard</span>
                </Box>
              </Link>
              <Link to="/private-messages" className="navbar-link">
                <Box display="flex" alignItems="center" alignContent="center">
                  <ConversationIcon
                    className={`navbar-button-${color} ${classes.icons}`}
                    fontSize="large"
                  />
                  <span className="navbar-text">Messages</span>
                </Box>
              </Link>
              <Link to="/notifications" className="navbar-link">
                {" "}
                <Box display="flex" alignItems="center" alignContent="center">
                  <span
                    className={`fa-layers fa-fw navbar-button-${color} ${classes.icons}`}
                  >
                    <FontAwesomeIcon
                      icon={faBell}
                      //className={`navbar-button-${color} ${classes.icons}`}
                      fontSize="large"
                    />
                    {notificationCount > 0 && (
                      <span
                        className="fa-layers-counter"
                        style={{ backgroundColor: "#2a99db" }}
                      >
                        {notificationCount}
                      </span>
                    )}
                  </span>
                  <span className="navbar-text">Notifications</span>
                </Box>
              </Link>
              <Link to="/search" className="navbar-link">
                <Box display="flex" alignItems="center" alignContent="center">
                  <SearchIcon
                    className={`navbar-button-${color} ${classes.icons}`}
                    fontSize="large"
                  />
                  <span className="navbar-text">Search</span>
                </Box>
              </Link>
              <Box display="flex" alignItems="center" alignContent="center">
                <Link to="/settings">
                  <SettingsIcon
                    className={`navbar-button-${color} ${classes.icons}`}
                    fontSize="large"
                  />
                  <span className="navbar-text">Settings</span>
                </Link>
              </Box>
              <IconButton title="Logout">
                <ExitToAppIcon
                  onClick={handleLogout}
                  className={`navbar-button-${color} ${classes.icons}`}
                  fontSize="large"
                />
              </IconButton>
            </>
          ) : (
            <>
              <Link to="/login">
                <IconButton title="Login">
                  <FontAwesomeIcon
                    icon={faSignInAlt}
                    className={`navbar-button-${color} ${classes.icons}`}
                    fontSize="large"
                  />
                </IconButton>
              </Link>
              <Link to="/register">
                <IconButton title="Register">
                  <FontAwesomeIcon
                    icon={faUserPlus}
                    className={`navbar-button-${color} ${classes.icons}`}
                    fontSize="large"
                  />
                </IconButton>
              </Link>
            </>
          )}
          <Link to="/explore">
            <IconButton>
              <ExploreIcon
                className={`navbar-button-${color} ${classes.icons}`}
                fontSize="large"
              />
            </IconButton>
          </Link>
          <IconButton>
            {darkMode ? (
              <MoonIcon
                className={`navbar-button-${color} ${classes.icons}`}
                onClick={toggleDarkMode}
                fontSize="large"
              />
            ) : (
              <SunIcon
                className={`navbar-button-${color} ${classes.icons}`}
                onClick={toggleDarkMode}
                fontSize="large"
              />
            )}
          </IconButton>
          {Cookies.get("email") ? (
            <IconButton>
              <CreateIcon
                className={`navbar-button-${color} ${classes.icons}`}
                onClick={handleNewMessageOpen}
                fontSize="large"
              />
            </IconButton>
          ) : null}
        </Toolbar>
      </AppBar>
    </>
  );
};

export default Navbar;
