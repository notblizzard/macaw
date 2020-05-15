import React, { useContext } from "react";
import Gravatar from "../util/Gravatar";
import Moment from "../util/Moment";
import { Box, Typography, makeStyles } from "@material-ui/core";
import {
  CalendarToday as CalendarTodayIcon,
  Room as RoomIcon,
} from "@material-ui/icons";
import UserTooltip from "./UserTooltip";
import PropTypes from "prop-types";
import DarkModeContext from "../DarkMode";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import Cookies from "js-cookie";
interface StyleProps {
  darkMode: boolean;
}
interface UserInfoProps {
  user: {
    email: string;
    displayname: string;
    username: string;
    description: string;
    createdAt: string;
    location: string;
    link: string;
  };
}

const useStyles = makeStyles(() => ({
  text: (props: StyleProps) => ({
    color: props.darkMode ? "#b8c5d9bd" : "#070b0fbd",
    fontSize: "1rem",
  }),
}));

const UserInfo = ({ user }: UserInfoProps): JSX.Element => {
  const color = Cookies.get("color") || "default";
  const darkMode = useContext(DarkModeContext);
  const classes = useStyles({ darkMode });
  return (
    <Box>
      <Gravatar email={user.email} size={14}></Gravatar>
      <Typography variant="h5" className={classes.text}>
        {user.displayname}
      </Typography>
      <Typography variant="body1" className={classes.text}>
        @{user.username}
      </Typography>
      <Typography variant="body1">
        {user.description
          ? user.description.split(" ").map((word) => {
              if (word.includes("@")) {
                return <UserTooltip username={word.slice(1)} />;
              } else {
                return ` ${word} `;
              }
            })
          : null}
      </Typography>
      <Typography className={classes.text}>
        <CalendarTodayIcon /> <Moment time={user.createdAt} profile={true} />
      </Typography>
      {user.location ? (
        <Typography className={classes.text}>
          <RoomIcon /> {user.location}
        </Typography>
      ) : null}
      {user.link ? (
        <Typography className={classes.text}>
          <FontAwesomeIcon icon={faLink} />{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={user.link}
            className={"link-" + color}
          >
            {user.link}
          </a>
        </Typography>
      ) : null}
    </Box>
  );
};
UserInfo.propTypes = {
  user: PropTypes.shape({
    email: PropTypes.string,
    displayname: PropTypes.string,
    username: PropTypes.string,
    description: PropTypes.string,
    createdAt: PropTypes.any,
    location: PropTypes.string,
    link: PropTypes.string,
    // isDifferentUser: PropTypes.bool,
    // isFollowingUser: PropTypes.bool,
  }),
  color: PropTypes.string,
};

export default UserInfo;
