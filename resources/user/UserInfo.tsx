import React from "react";
import Gravatar from "../util/Gravatar";
import Moment from "../util/Moment";
import { Box, Typography } from "@material-ui/core";
import {
  CalendarToday as CalendarTodayIcon,
  Room as RoomIcon,
} from "@material-ui/icons";
import UserTooltip from "./UserTooltip";
import PropTypes from "prop-types";

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
  color: string;
}
const UserInfo = ({ user, color }: UserInfoProps): JSX.Element => {
  return (
    <Box>
      <Gravatar email={user.email} size={14}></Gravatar>
      <Typography variant="h5">{user.displayname}</Typography>
      <p className="grey">@{user.username}</p>
      <p className="text-break">
        {user.description
          ? user.description.split(" ").map((word) => {
              if (word.includes("@")) {
                return <UserTooltip username={word.slice(1)} color={color} />;
              } else {
                return ` ${word} `;
              }
            })
          : null}
      </p>
      <p className="grey">
        <CalendarTodayIcon /> <Moment time={user.createdAt} profile={true} />
      </p>
      {user.location ? (
        <p className="grey">
          <RoomIcon /> {user.location}
        </p>
      ) : null}
      {user.link ? (
        <p className="grey">
          <i className="fas fa-link"></i>{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={user.link}
            className={"link-" + color}
          >
            {user.link}
          </a>
        </p>
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
