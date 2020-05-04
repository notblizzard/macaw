import React, { useEffect, useState } from "react";
import { Grid } from "@material-ui/core";
import axios from "axios";
import { useParams } from "react-router-dom";
import UserInfoCard from "./UserInfoCard";
import Cookies from "js-cookie";

import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    padding: theme.spacing(2),
    backgroundColor: "#193344",
    maxWidth: "20rem",
  },
}));

interface UserData {
  following: {
    isBeingFollowed?: boolean;
    id: string;
    following: {
      username: string;
      messages: [];
      following: [];
      followers: [];
      email: string;
      displayname: string;
      description: string;
    };
  }[];
}
const Following = (): JSX.Element => {
  const classes = useStyles();
  const color = Cookies.get("color") || "default";
  const { username } = useParams();
  const [user, setUser] = useState<UserData>({
    following: [
      {
        isBeingFollowed: false,
        id: "",
        following: {
          email: "",
          username: "",
          messages: [],
          following: [],
          followers: [],
          displayname: "",
          description: "",
        },
      },
    ],
  });
  useEffect(() => {
    axios.get(`/api/user/following?username=${username}`).then((res) => {
      if (res.data.success) {
        setUser(res.data.user);
      }
    });
  }, []);

  return (
    <Grid container>
      {user.following.length === 0 ? (
        <h1>Following 0 Users</h1>
      ) : (
        user.following.map((data) => (
          <Grid item xs={3} key={data.id} className={classes.card}>
            <UserInfoCard user={data.following} color={color} />
          </Grid>
        ))
      )}
    </Grid>
  );
};

export default Following;
