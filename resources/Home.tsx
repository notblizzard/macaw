import React from "react";
import { Link } from "react-router-dom";
import { Button, Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
  button: {
    backgroundColor: "#97adc4",
    "&:hover": {
      backgroundColor: "#70859b",
    },
  },
}));
const Home = (): JSX.Element => {
  const classes = useStyles();
  return (
    <Box paddingY={10} textAlign="center">
      <h1>Macaw</h1>
      <p>Social Network</p>
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
