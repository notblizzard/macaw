import React, { useState, useEffect } from "react";
import { Typography, Box, Grid, makeStyles, Theme } from "@material-ui/core";
import Gravatar from "../util/Gravatar";
import UserTooltip from "./UserTooltip";

interface Message {
  id: number;
  createdAt: Date;
  data: string;
  file?: string;
}

type Type = "follow" | "like" | "repost";
interface User {
  id: number;
  createdAt: Date;
  email: string;
  username: string;
}
interface Notification {
  id: number;
  message?: Message;
  createdAt: Date;
  originUser: User;
  targetUser: User;
  type: Type;
}

const useStyles = makeStyles((theme: Theme) => ({
  messageData: {
    color: "#525d60",
  },
  messageBox: {
    marginTop: theme.spacing(1),
  },
  notification: {
    borderBottom: `1px solid #525d60`,
    width: "50%",
  },
}));
const Notifications = (): JSX.Element => {
  const [notifications, setNotifications] = useState<Notification[]>(null!);
  const classes = useStyles();
  useEffect(() => {
    fetch("/api/user/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setNotifications(data.notifications);
        }
      });
  }, []);

  return (
    <>
      {notifications && (
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          <Typography variant="h2">Notifications</Typography>
          {notifications.map((notification) => (
            <Box
              key={notification.id}
              display="flex"
              flexDirection="row"
              className={classes.notification}
              justifyContent="center"
            >
              {notification.type === "follow" ? (
                <Typography>
                  {notification.originUser.username}
                  <Gravatar
                    email={notification.originUser.email}
                    size={4}
                  />{" "}
                  followed you.
                </Typography>
              ) : (
                <Box display="flex" flexDirection="column">
                  <Typography>
                    <Box display="flex" flexDirection="row" alignItems="center">
                      <Gravatar
                        email={notification.originUser.email}
                        size={4}
                      />
                      <UserTooltip
                        username={notification.originUser.username}
                      />
                      {`${notification.type}d`} your message
                    </Box>
                    <Box className={classes.messageBox}>
                      <Typography className={classes.messageData}>
                        {notification?.message?.data}
                      </Typography>
                    </Box>
                  </Typography>
                </Box>
              )}
            </Box>
          ))}
        </Box>
      )}
    </>
  );
};

export default Notifications;
