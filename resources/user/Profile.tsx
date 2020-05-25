import React, { useState, useEffect, useContext } from "react";
import UserInfo from "./UserInfo";
import UserStat from "./UserStat";
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
  socketio: SocketIOClient.Socket;
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

const defaultUser: User = {
  id: 0,
  displayname: "",
  username: "",
  messageCount: 0,
  followers: [],
  email: "",
  following: [],
  color: "",
  description: "",
  link: "",
  createdAt: "",
  location: "",
  isDifferentUser: undefined,
};

const useStyles = makeStyles((theme: Theme) => ({
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  drawer: (props: StyleProps) => ({
    backgroundColor: props.darkMode ? "#080b17" : "#dff0f7",
    color: props.darkMode ? "#dff0f7" : "#080b17",
    padding: theme.spacing(1),
  }),
}));

const Profile = ({ socketio }: ProfileProps): JSX.Element => {
  const darkMode = useContext(DarkModeContext);
  const classes = useStyles({ darkMode });
  const { username } = useParams();
  const [user, setUser] = useState<User>(defaultUser);

  const [drawer, setDrawer] = useState(false);

  const toggleDrawer = (e: React.MouseEvent<HTMLButtonElement>): void => {
    setDrawer(!drawer);
  };

  useEffect(() => {
    fetch(`/api/user/profile?username=${username}`, {
      headers: { "X-CSRF-TOKEN": Cookies.get("XSRF-TOKEN")! },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUser(data.user);
        }
      });
  }, []);

  return (
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
            <UserStat user={user} />
          </SwipeableDrawer>
          <Grid item xs={12}>
            <UserMessage
              dashboard={false}
              username={username}
              socketio={socketio}
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
            <UserStat user={user} />
            <UserMessage
              dashboard={false}
              username={username}
              socketio={socketio}
            />
          </Grid>
        </Grid>
      </Hidden>
    </>
  );
};

export default Profile;
