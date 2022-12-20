import React, { useEffect, useState } from "react";
import Gravatar from "../util/Gravatar";
import { Grid, Box, Typography } from "@material-ui/core";
import { Link, useParams } from "react-router-dom";
import Cookies from "js-cookie";
import { Helmet } from "react-helmet-async";

interface UserData {
  followers: {
    isBeingFollowed?: boolean;
    id: number;
    follower: {
      username: string;
      email: string;
      displayname: string;
      description: string;
    };
  }[];
}
const Followers = (): JSX.Element => {
  const { username } = useParams<{ username: string }>();
  const [user, setUser] = useState<UserData>(null!);

  useEffect(() => {
    fetch(`/api/user/followers?username=${username}`, {
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
    <>
      {user && (
        <>
          <Grid container>
            <Helmet>
              <title>{`${username}'s Followers`}</title>
            </Helmet>
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
        </>
      )}
    </>
  );
};

export default Followers;
