import React from "react";
import { Link } from "react-router-dom";
import { Button, Box, Typography, Theme, darken } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Messages from "./message/Messages";

interface ExploreProps {
  socket: SocketIOClient.Socket;
}
const useStyles = makeStyles((theme: Theme) => ({
  button: {
    backgroundColor: "#97adc4",
    margin: theme.spacing(1),
    "&:hover": {
      backgroundColor: darken("#97adc4", 0.1),
    },
  },
  title: {
    "&::first-letter": {
      color: "#1e65a2",
    },
  },
}));
const Explore = ({ socket }: ExploreProps): JSX.Element => {
  const classes = useStyles();
  return (
    <Box>
      <Typography variant="h4" align="center">
        Explore Macaw
      </Typography>
      <Messages path="explore" socket={socket} />
    </Box>
  );
};

export default Explore;
