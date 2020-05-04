import React, { useState, useEffect } from "react";
import axios from "axios";
import UserMessage from "../message/UserMessage";
import UserInfo from "./UserInfo";
import UserStat from "./UserStat";
import { Grid } from "@material-ui/core";
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
const defaultUserData: UserData = {
  id: "",
  displayname: "",
  username: "",
  messageCount: 0,
  followers: [],
  following: [],
  color: "",
  description: "",
};
const Dashboard = (): JSX.Element => {
  const [user, setUser] = useState<UserData>(defaultUserData);
  const color: string = Cookies.get("color") || "default";

  useEffect(() => {
    axios
      .get("/api/user/dashboard")
      .then((res) => {
        if (res.data.success) {
          setUser(res.data.user);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <Grid container spacing={4}>
      <Grid item xs={2}>
        <UserInfo user={user} color={color} />
      </Grid>
      <Grid item xs={10}>
        <UserStat user={user} color={color} />
        <UserMessage dashboard={true} username={undefined} color={color} />
      </Grid>
    </Grid>
  );
};

export default Dashboard;
