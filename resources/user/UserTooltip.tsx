import React, { useState } from "react";
import { Theme, makeStyles, Typography, Tooltip } from "@material-ui/core";
import UserInfoCard from "./UserInfoCard";
import PropType from "prop-types";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";

const useStyles = makeStyles((theme: Theme) => ({
  tooltip: {
    width: theme.spacing(40),
    padding: "0 !important",
  },
  greyText: {
    color: "#b8c5d9bd",
  },
}));

interface UserData {
  username: string;
  displayname: string;
  messages: [];
  followers: [];
  following: [];
  id: string;
  description: string;
  email: string;
  createdAt: string;
  location: string;
  link: string;
  color: string;
  isFollowingUser?: boolean;
  isDifferentUser?: boolean;
}

const defaultUserData: UserData = {
  id: "",
  username: "",
  displayname: "",
  messages: [],
  followers: [],
  following: [],
  email: "",
  color: "",
  createdAt: "",
  location: "",
  link: "",
  description: "",
};

interface UserTooltipProp {
  username: string;
}

const UserTooltip = ({ username }: UserTooltipProp): JSX.Element => {
  const color = Cookies.get("color") || "default";
  const classes = useStyles();
  const [user, setUser] = useState<UserData>(defaultUserData);

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
    <Tooltip
      onOpen={handleOpen}
      interactive={true}
      classes={{ tooltip: classes.tooltip }}
      placement="left-start"
      title={<UserInfoCard user={user} />}
    >
      <Link to={`/@${username}`}>
        <Typography className={`colored-tooltip-${color}`} display="inline">
          @{username}
        </Typography>
      </Link>
    </Tooltip>
  );
};

UserTooltip.propTypes = {
  username: PropType.string,
  color: PropType.string,
};

export default UserTooltip;
