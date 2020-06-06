import React, { useEffect, useState } from "react";
import { Grid } from "@material-ui/core";
import { useParams } from "react-router-dom";
import UserCard from "./UserCard";
import Cookies from "js-cookie";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { Helmet } from "react-helmet-async";

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
  pinned: Message;
  followers: [];
  following: [];
  isDifferentUser?: boolean;
  messages: [];
}
interface Message {
  id: number;
  createdAt: string;
  data: string;
  user: User;
  liked: boolean;
  file: string;
  //likes: Like[];
  reposted: boolean;
  reposts: Repost[];
  messageCreatedAt?: string;
}
interface Repost {
  id: number;
  createdAt: string;
  user: User;
  message: Message;
}

interface UserData {
  following: {
    isBeingFollowed?: boolean;
    id: number;
    following: User;
  }[];
}

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    padding: theme.spacing(2),
    backgroundColor: "#193344",
    maxWidth: "20rem",
  },
}));

const Following = (): JSX.Element => {
  const classes = useStyles();
  const { username } = useParams();
  const [user, setUser] = useState<UserData>(null!);

  useEffect(() => {
    fetch(`/api/user/following?username=${username}`, {
      headers: { "X-CSRF-TOKEN": Cookies.get("XSRF-TOKEN")! },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUser(data.user);
        }
      });
  }, [username]);

  return (
    <>
      {user && (
        <Grid container>
          <Helmet>{`${username}'s Follows`}</Helmet>
          {user.following.length === 0 ? (
            <h1>Following 0 Users</h1>
          ) : (
            user.following.map((data) => (
              <Grid item xs={3} key={data.id} className={classes.card}>
                <UserCard user={data.following} />
              </Grid>
            ))
          )}
        </Grid>
      )}
    </>
  );
};

export default Following;
