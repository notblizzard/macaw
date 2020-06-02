import React, { useState } from "react";
import { Theme, makeStyles, Typography, Tooltip } from "@material-ui/core";
import UserInfoCard from "./UserInfoCard";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";

interface UserTooltipProp {
  username: string;
}
interface UserData {
  username: string;
  displayname: string;
  messages: [];
  followers: [];
  following: [];
  id: number;
  description: string;
  email: string;
  createdAt: string;
  location: string;
  link: string;
  color: string;
  isFollowingUser?: boolean;
  isDifferentUser?: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  tooltip: {
    width: theme.spacing(40),
    padding: 0,
  },
  greyText: {
    color: "#b8c5d9bd",
  },
}));

const UserTooltip = ({ username }: UserTooltipProp): JSX.Element => {
  const color = Cookies.get("color") || "default";
  const classes = useStyles();
  const [user, setUser] = useState<UserData>(null!);

  const handleOpen = (): void => {
    if (!user.username) {
      fetch(`/api/user/tooltip?username=${username}`, {
        headers: { "X-CSRF-TOKEN": Cookies.get("XSRF-TOKEN")! },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setUser(data.user);
          }
        });
    }
  };

  return (
    <>
      {user && (
        <Tooltip
          onOpen={handleOpen}
          interactive={true}
          classes={{ tooltip: classes.tooltip }}
          placement="left-start"
          title={<UserInfoCard user={user} />}
        >
          <Link to={`/@${username}`}>
            <Typography
              className={`no-text-decoration-link-${color}`}
              display="inline"
            >
              @{username}
            </Typography>
          </Link>
        </Tooltip>
      )}
    </>
  );
};

export default UserTooltip;
