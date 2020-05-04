import React, { useEffect, useState } from "react";
import Gravatar from "../util/Gravatar";
import { Grid, Box, Typography } from "@material-ui/core";
import axios from "axios";
import { Link, useParams } from "react-router-dom";

interface UserData {
  followers: {
    isBeingFollowed?: boolean;
    id: string;
    follower: {
      username: string;
      email: string;
      displayname: string;
      description: string;
    };
  }[];
}
const Followers = (): JSX.Element => {
  const { username } = useParams();
  const [user, setUser] = useState<UserData>({
    followers: [
      {
        isBeingFollowed: false,
        id: "",
        follower: {
          email: "",
          username: "",
          displayname: "",
          description: "",
        },
      },
    ],
  });
  useEffect(() => {
    axios
      .get(`/api/user/followers?username=${username}`)
      .then((res) => {
        if (res.data.success) {
          setUser(res.data.user);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <Grid container>
      {user.followers.length === 0 ? (
        <Typography variant="h1">0 Followers</Typography>
      ) : (
        user.followers.map((data) => (
          <Grid item xs={3} key={data.id}>
            <Box display="flex" justifyContent="space-between">
              <Gravatar email={data.follower.email} size={8} />
            </Box>
            <Typography variant="h6">
              <Link to={"/@" + data.follower.username}>
                {data.follower.displayname}
              </Link>
            </Typography>
            <Typography variant="subtitle1">
              @{data.follower.username}
            </Typography>
            <Typography variant="body1" style={{ marginBottom: "1rem" }}>
              {data.follower.description}
            </Typography>
          </Grid>
        ))
      )}
    </Grid>
  );
};

export default Followers;
