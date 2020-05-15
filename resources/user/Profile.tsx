import React, { useState, useEffect } from "react";
import UserInfo from "./UserInfo";
import UserStat from "./UserStat";
import { useParams } from "react-router-dom";
import { Grid } from "@material-ui/core";
import UserMessage from "../message/UserMessage";
import Cookies from "js-cookie";

interface UserData {
  id: string;
  username: string;
  displayname: string;
  followers: any[];
  following: any[];
  color: string;
  description: string;
  messageCount: number;
}

interface User {
  id: string;
  color: string;
  createdAt: string;
  username: string;
  displayname: string;
  email: string;
  description: string;
  location: string;
  link: string;
  messageCount: number;
  //pinned: Message;
  followers: [];
  following: [];
  isDifferentUser?: boolean;
}

const defaultUser: User = {
  id: "",
  displayname: "",
  username: "",
  messageCount: 0,
  followers: [],
  email: "",
  following: [],
  color: "",
  description: "",
  link: "",
  createdAt: "",
  location: "",
  isDifferentUser: undefined,
};

const Profile = (): JSX.Element => {
  const color: string = Cookies.get("color") || "default";

  const { username } = useParams();
  const [user, setUser] = useState<User>(defaultUser);

  useEffect(() => {
    fetch(`/api/user/profile?username=${username}`, {
      headers: { "X-CSRF-TOKEN": Cookies.get("XSRF-TOKEN")! },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUser(data.user);
        }
      });
  }, []);

  return (
    <Grid container spacing={4}>
      <Grid item xs={2}>
        <UserInfo user={user} />
      </Grid>
      <Grid item xs={10}>
        <UserStat user={user} />
        <UserMessage dashboard={false} username={username as string} />
      </Grid>
    </Grid>
  );
};

export default Profile;
