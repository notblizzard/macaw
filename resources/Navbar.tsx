import React, { useState } from "react";
import {
  Toolbar,
  AppBar,
  InputBase,
  Typography,
  IconButton,
  Box,
} from "@material-ui/core";
import { fade, makeStyles, Theme } from "@material-ui/core/styles";
import axios from "axios";
import { Link, useHistory } from "react-router-dom";
import {
  Chat as ChatIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  ExitToApp as ExitToAppIcon,
} from "@material-ui/icons";
import Gravatar from "./util/Gravatar";
import qs from "querystring";
import PropType from "prop-types";
import PrivateMessage from "./message/PrivateMessage";
import Cookies from "js-cookie";

const useStyles = makeStyles((theme: Theme) => ({
  icons: {
    marginLeft: "auto",
  },
  icon: {
    marginLeft: "0.4rem",
    marginRight: "0.4rem",
  },
  navBar: {
    backgroundColor: "#15212f",
    marginBottom: theme.spacing(4),
  },

  search: {
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
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  inputRoot: {
    color: " inherit",
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create("width"),
    width: "0rem",
    "&:focus": {
      width: "20ch",
    },
    /*[theme.breakpoints.up("md")]: {
      width: "20ch",
    },*/
  },
}));

interface NavbarProps {
  color: string;
}
const Navbar = ({ color }: NavbarProps): JSX.Element => {
  const history = useHistory();
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleOpen = (): void => {
    setOpen(true);
  };

  const handleClose = (): void => {
    setOpen(false);
  };

  const handleLogout = (): void => {
    axios.get("/logout").then(() => {
      history.push("/");
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    history.push(`/search?${qs.stringify({ qs: searchQuery })}`);
  };

  return (
    <>
      <PrivateMessage open={open} onClose={handleClose} color={color} />
      <AppBar className={classes.navBar} position="static">
        <Toolbar>
          <Link to="/">
            <Typography className={`navbar-button-${color}`}>Macaw</Typography>
          </Link>
          <div className={classes.search}>
            <div className={classes.searchIcon}>
              <SearchIcon />
            </div>
            <form method="GET" action="/search" onSubmit={handleSearchSubmit}>
              <InputBase
                placeholder="Search...."
                classes={{
                  root: classes.inputRoot,
                  input: classes.inputInput,
                }}
                name="qs"
                onChange={handleSearchChange}
                inputProps={{ "aria-label": "search" }}
              />
            </form>
          </div>
          {Cookies.get("email") ? (
            <Box display="flex" flexDirection="row" className={classes.icons}>
              <Link to="/dashboard">
                <Gravatar email={Cookies.get("email")!} size={5} />
              </Link>

              <IconButton onClick={handleOpen}>
                <ChatIcon
                  className={`navbar-button-${color} ${classes.icon}`}
                />
              </IconButton>

              <IconButton>
                <Link to="/settings">
                  <SettingsIcon
                    className={`navbar-button-${color || "default"} ${
                      classes.icon
                    }`}
                  />
                </Link>
              </IconButton>

              <IconButton>
                <ExitToAppIcon
                  onClick={handleLogout}
                  style={{ marginLeft: "0.4rem", marginRight: "0.4rem" }}
                  className={"navbar-button-" + (color || "default")}
                />
              </IconButton>
            </Box>
          ) : null}
        </Toolbar>
      </AppBar>
    </>
  );
};

Navbar.propTypes = {
  //classes: PropTypes.object.isRequired,
  color: PropType.string,
};

export default Navbar;
