import React, { useState, useEffect } from "react";
import UserMessage from "../message/UserMessage";
import UserInfo from "./UserInfo";
import UserStat from "./UserStat";
import { Grid } from "@material-ui/core";
import Cookies from "js-cookie";

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
const Dashboard = (): JSX.Element => {
  const [user, setUser] = useState<User>(defaultUser);

  useEffect(() => {
    fetch("/api/user/dashboard", {
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
        <UserMessage dashboard={true} username={undefined} />
      </Grid>
    </Grid>
  );
};

export default Dashboard;
