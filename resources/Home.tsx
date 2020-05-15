import React from "react";
import { Link } from "react-router-dom";
import { Button, Box, Typography, Theme, darken } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

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
const Home = (): JSX.Element => {
  const classes = useStyles();
  return (
    <Box textAlign="center">
      <Typography className={classes.title} variant="h2">
        Macaw
      </Typography>
      <Button
        component={Link}
        className={classes.button}
        to="/login"
        variant="contained"
      >
        Login
      </Button>

      <Button
        component={Link}
        className={classes.button}
        to="/register"
        variant="contained"
      >
        Register
      </Button>
    </Box>
  );
};

export default Home;
