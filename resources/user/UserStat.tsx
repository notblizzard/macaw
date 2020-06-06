import React, { useState } from "react";
import { Box, Typography, makeStyles, Button } from "@material-ui/core";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";

interface User {
  id: number;
  color: string;
  createdAt: string;
  username: string;
  displayname: string;
  email: string;
  description: string;
  location: string;
  //pinned: Message;
  followers: [];
  following: [];
  messageCount: number;
  isDifferentUser?: boolean;
  isFollowingUser?: boolean;
}

interface UserStatProps {
  user: User;
}

const useStyles = makeStyles(() => ({
  userStat: {
    margin: "4px",
  },
}));

const UserStat = ({ user }: UserStatProps): JSX.Element => {
  const classes = useStyles();
  const color = Cookies.get("color") || "default";
  const csrf = Cookies.get("XSRF-TOKEN");
  const [following, setFollowing] = useState(user.isFollowingUser);

  const followUser = (e: React.MouseEvent<HTMLButtonElement>): void => {
    fetch("/api/user/follow", {
      method: "POST",
      body: JSON.stringify({ id: user.id }),
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": csrf!,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setFollowing(data.following);
        }
      });
  };

  return (
    <Box
      display="flex"
      flexDirection="row"
      className={`border-bottom-${color}`}
    >
      <Box display="block" textAlign="center" className={classes.userStat}>
        <Typography variant="h5">Messages</Typography>
        <Typography variant="h3" className={`color-${color}`}>
          {user.messageCount}
        </Typography>
      </Box>
      <Box display="block" textAlign="center" className={classes.userStat}>
        <Typography variant="h5">Followers</Typography>
        <Link
          to={`/@${user.username}/followers`}
          className={`no-text-decoration-link-${color}`}
        >
          <Typography variant="h3">{user.followers.length}</Typography>
        </Link>
      </Box>
      <Box display="block" textAlign="center" className={classes.userStat}>
        <Typography variant="h5">Following</Typography>
        <Link
          to={`/@${user.username}/following`}
          className={`no-text-decoration-link-${color}`}
        >
          <Typography variant="h3">{user.following.length}</Typography>
        </Link>
      </Box>
      <Box>
        {user.isDifferentUser ? (
          <Button onClick={followUser}>
            {following ? "Following" : "Follow"}
          </Button>
        ) : null}
      </Box>
    </Box>
  );
};

export default UserStat;
