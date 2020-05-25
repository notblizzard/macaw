import React, { useState, useContext } from "react";
import {
  Toolbar,
  AppBar,
  InputBase,
  Typography,
  IconButton,
  Box,
} from "@material-ui/core";
import { fade, makeStyles, Theme } from "@material-ui/core/styles";
import { Link, useHistory } from "react-router-dom";
import {
  Search as SearchIcon,
  Settings as SettingsIcon,
  ExitToApp as ExitToAppIcon,
} from "@material-ui/icons";
import Gravatar from "./util/Gravatar";
import PrivateMessage from "./message/PrivateMessage";
import Cookies from "js-cookie";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment } from "@fortawesome/free-solid-svg-icons";
import DarkModeContext from "./DarkMode";
interface StyleProps {
  darkMode: boolean;
}

interface NavbarProps {
  color: string;
  socketio: SocketIOClient.Socket;
}

const useStyles = makeStyles((theme: Theme) => ({
  icons: (props: StyleProps) => ({
    color: props.darkMode ? "#eee" : "#222",
  }),
  navBar: (props: StyleProps) => ({
    backgroundColor: props.darkMode ? "#080b17" : "#dff0f7",
    boxShadow: "none",
    marginBottom: theme.spacing(4),
  }),
  toolBar: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
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

const Navbar = ({ color, socketio }: NavbarProps): JSX.Element => {
  const darkMode = useContext(DarkModeContext);
  const history = useHistory();
  const classes = useStyles({ darkMode });
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const handleOpen = (): void => {
    setOpen(true);
  };

  const handleClose = (): void => {
    setOpen(false);
  };

  const handleLogout = (): void => {
    fetch("/logout", {
      headers: { "X-CSRF-TOKEN": Cookies.get("XSRF-TOKEN")! },
    }).then(() => {
      Cookies.remove("email");
      history.push("/");
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    history.push(`/search?qs=${search}`);
    setSearch("");
  };

  return (
    <>
      <PrivateMessage open={open} onClose={handleClose} socketio={socketio} />
      <AppBar className={classes.navBar} position="fixed">
        <Toolbar className={classes.toolBar}>
          <Box display="flex" alignItems="center">
            <Link to="/" className={`no-text-decoration-link-${color}`}>
              <Typography>Macaw</Typography>
            </Link>
            <Box className={classes.search}>
              <Box className={classes.searchIcon}>
                <SearchIcon />
              </Box>
              <form onSubmit={handleSearchSubmit}>
                <InputBase
                  placeholder="Search...."
                  classes={{
                    input: classes.input,
                  }}
                  name="qs"
                  onChange={handleSearchChange}
                  inputProps={{ "aria-label": "search" }}
                />
              </form>
            </Box>
          </Box>
          {Cookies.get("email") ? (
            <Box display="flex" flexDirection="row">
              <Box display="flex" alignItems="center">
                <Link to="/dashboard">
                  <Gravatar email={Cookies.get("email")!} size={5} />
                </Link>
              </Box>

              <IconButton onClick={handleOpen}>
                <FontAwesomeIcon
                  icon={faComment}
                  className={`navbar-button-${color} ${classes.icons}`}
                />
              </IconButton>

              <Link to="/settings">
                <IconButton>
                  <SettingsIcon
                    className={`navbar-button-${color} ${classes.icons}`}
                  />
                </IconButton>
              </Link>

              <IconButton>
                <ExitToAppIcon
                  onClick={handleLogout}
                  className={`navbar-button-${color} ${classes.icons}`}
                />
              </IconButton>
            </Box>
          ) : null}
        </Toolbar>
      </AppBar>
    </>
  );
};

export default Navbar;
