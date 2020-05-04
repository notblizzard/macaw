import React, { useState, useEffect } from "react";
import axios from "axios";
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
const Profile = (): JSX.Element => {
  const color: string = Cookies.get("color") || "default";

  const { username } = useParams();
  const [user, setUser] = useState<UserData>(defaultUserData);

  useEffect(() => {
    axios
      .get(`/api/user/profile?username=${username}`)
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
        <UserMessage dashboard={false} username={username} color={color} />
      </Grid>
    </Grid>
  );
};

export default Profile;
