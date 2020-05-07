import React, { useState } from "react";
import axios from "axios";
import { Theme, makeStyles, Typography, Tooltip } from "@material-ui/core";
import UserInfoCard from "./UserInfoCard";
import PropType from "prop-types";
import { Link } from "react-router-dom";

const useStyles = makeStyles((theme: Theme) => ({
  tooltip: {
    // padding: theme.spacing(2),
    // backgroundColor: "#193344",
    // maxWidth: "20rem",
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
  color: string;
}

const UserTooltip = ({ username, color }: UserTooltipProp): JSX.Element => {
  const classes = useStyles();
  const [user, setUser] = useState<UserData>(defaultUserData);

  const handleOpen = (): void => {
    if (!user.username) {
      axios.get(`/api/user/tooltip?username=${username}`).then((res) => {
        if (res.data.success) {
          setUser(res.data.user);
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
      title={<UserInfoCard user={user} color={color} />}
    >
      <Link to={`/@${username}`}>
        <Typography className={"colored-tooltip-" + color} display="inline">
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
