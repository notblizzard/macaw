import React, { useState, useEffect, useContext } from "react";
import UserInfo from "./UserInfo";
import UserHeader from "./UserHeader";
import { useParams } from "react-router-dom";
import {
  Grid,
  Hidden,
  SwipeableDrawer,
  makeStyles,
  Theme,
} from "@material-ui/core";
import UserMessage from "../message/UserMessage";
import Cookies from "js-cookie";
import DarkModeContext from "../DarkMode";
import { Helmet } from "react-helmet-async";
interface StyleProps {
  darkMode: boolean;
}

interface ProfileProps {
  socket: SocketIOClient.Socket;
  dashboard: boolean;
}
interface User {
  id: number;
  color: string;
  createdAt: string;
  username: string;
  displayname: string;
  email: string;
  description: string;
  location: string;
  link: string;
  messageCount: number;
  //pinned: Message;
  followers: [];
  following: [];
  isDifferentUser?: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  drawer: (props: StyleProps) => ({
    backgroundColor: props.darkMode ? "#080b17" : "#dff0f7",
    color: props.darkMode ? "#dff0f7" : "#080b17",
    padding: theme.spacing(1),
  }),
}));

const Profile = ({ socket, dashboard }: ProfileProps): JSX.Element => {
  const darkMode = useContext(DarkModeContext);
  const classes = useStyles({ darkMode });
  const { username } = useParams();
  const [user, setUser] = useState<User>(null!);
  let url: string;
  if (dashboard) {
    url = "/api/user/dashboard";
  } else {
    url = `/api/user/profile?username=${username}`;
  }

  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    fetch(url, {
      headers: { "X-CSRF-TOKEN": Cookies.get("XSRF-TOKEN")! },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUser(data.user);
        }
      });
  }, [url]);

  const toggleDrawer = (e: React.MouseEvent<HTMLButtonElement>): void => {
    setDrawer(!drawer);
  };
  return (
    <>
      {user && (
        <>
          <Helmet>
            <title>{username}</title>
          </Helmet>
          <Hidden smUp>
            <Grid container spacing={4}>
              <SwipeableDrawer
                anchor={"left"}
                open={drawer}
                onClose={toggleDrawer}
                onOpen={toggleDrawer}
                classes={{ paper: classes.drawer }}
              >
                <UserInfo user={user} />
                <UserHeader user={user} />
              </SwipeableDrawer>
              <Grid item xs={12}>
                <UserMessage
                  dashboard={dashboard}
                  username={username}
                  socket={socket}
                />
              </Grid>
            </Grid>
          </Hidden>
          <Hidden xsDown>
            <Grid container spacing={4}>
              <Grid item xs={2}>
                <UserInfo user={user} />
              </Grid>
              <Grid item xs={10}>
                <UserHeader user={user} />
                <UserMessage
                  dashboard={dashboard}
                  username={username}
                  socket={socket}
                />
              </Grid>
            </Grid>
          </Hidden>
        </>
      )}
    </>
  );
};

export default Profile;
