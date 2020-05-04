import { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Grid,
  makeStyles,
  Card,
  CardContent,
} from "@material-ui/core";
import Gravatar from "../util/Gravatar";
import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import axios from "axios";

const useStyles = makeStyles(() => ({
  tooltip: {
    padding: "1rem",
    backgroundColor: "#193344",
    maxWidth: "20rem",
  },
  greyText: {
    color: "#b8c5d9bd",
  },
  username: {
    color: "#eee !important",
  },
  card: {
    //padding: theme.spacing(2),
    color: "#eee",
    backgroundColor: "#193344",
    //maxWidth: "20rem",
  },
}));

const UserInfoCard = ({ user, color }): JSX.Element => {
  const classes = useStyles();
  const [isFollowingUser, setIsFollowingUser] = useState(user.isFollowingUser);
  const handleFollow = async (e) => {
    const userId = e.currentTarget.getAttribute("data-id");
    axios.post("/api/user/follow", { id: userId }).then((res) => {
      if (res.data.success) {
        setIsFollowingUser(res.data.following);
      }
    });
  };
  return (
    <Card classes={{ root: classes.card }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between">
          <Gravatar email={user.email} size={2} />
          {user.isDifferentUser ? (
            <Button
              variant={isFollowingUser ? "contained" : "outlined"}
              data-id={user.id}
              className={`button-${isFollowingUser ? "" : "outline-"}${color}`}
              onClick={handleFollow}
            >
              {isFollowingUser ? "Following" : "Follow"}
            </Button>
          ) : null}
        </Box>
        <Typography variant="h6" className={classes.username}>
          <Link to={"/@" + user.username} className={classes.username}>
            {user.displayname}
          </Link>
        </Typography>
        <Typography variant="subtitle1" className={classes.greyText}>
          @{user.username}
        </Typography>
        <Typography variant="body1" style={{ marginBottom: "1rem" }}>
          {user.description}
        </Typography>
        <Grid container style={{ textAlign: "center" }}>
          <Grid item xs={4}>
            <Typography variant="body2" className="grey">
              Messages
            </Typography>
            <Typography variant="h2" className={"colored-tooltip-" + color}>
              {user.messages.length}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body2" className="grey">
              Following
            </Typography>
            <Typography variant="h2" className={"colored-tooltip-" + color}>
              {user.following.length}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body2" className="grey">
              Followers
            </Typography>
            <Typography variant="h2" className={"colored-tooltip-" + color}>
              {user.followers.length}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

UserInfoCard.propTypes = {
  user: {
    email: PropTypes.string,
    displayname: PropTypes.string,
    username: PropTypes.string,
    description: PropTypes.string,
    createdAt: PropTypes.any,
    location: PropTypes.string,
    link: PropTypes.string,
    followers: PropTypes.array,
    following: PropTypes.array,
    messages: PropTypes.array,
    isDifferentUser: PropTypes.bool,
    isFollowingUser: PropTypes.bool,
  },
  color: PropTypes.string,
};

export default UserInfoCard;
