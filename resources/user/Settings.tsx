import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TextField,
  makeStyles,
  Theme,
  fade,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
  Container,
} from "@material-ui/core";
import { useHistory } from "react-router-dom";
import PropType from "prop-types";
import Cookies from "js-cookie";

const useStyles = makeStyles((theme: Theme) => ({
  search: {
    margin: theme.spacing(4),
    backgroundColor: fade("#66d0f9", 0.1),
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    width: "20rem",
    "&:hover": {
      backgroundColor: fade("#66d0f9", 0.2),
    },
  },

  inputInput: {
    color: "#eee",

    "& .MuiFormLabel-root": {
      color: "#79838a",
    },

    "& .MuiOutlinedInput-root": {
      color: "#eee",
      "&.Mui-focused fieldset": {
        borderColor: "#09a6f4",
        color: "#eee",
      },
    },
    width: "20rem",
    "&:focus": {
      borderColor: "#eee",
    },
  },
}));

interface UserSettings {
  description?: string;
  username?: string;
  email?: string;
  displayname?: string;
  location?: string;
  link?: string;
  color?: string;
}
const Settings = ({ handleColor }): JSX.Element => {
  const colors: string[] = [
    "red",
    "blue",
    "green",
    "purple",
    "yellow",
    "orange",
  ];
  // todo: condense
  const [settings, setSettings] = useState<UserSettings>({
    username: "",
    displayname: "",
    email: "",
    location: "",
    link: "",
    description: "",
    color: "",
  });
  const [] = useState("");
  const [, setErrors] = useState({});
  const classes = useStyles();
  const history = useHistory();

  const handleChangeUsername = (e) => {
    setSettings({ ...settings, username: e.target.value });
  };

  const handleChangeDisplayname = (e) => {
    setSettings({ ...settings, displayname: e.target.value });
  };
  const handleChangeEmail = (e) => {
    setSettings({ ...settings, email: e.target.value });
  };
  const handleChangeLocation = (e) => {
    setSettings({ ...settings, location: e.target.value });
  };
  const handleChangeLink = (e) => {
    setSettings({ ...settings, link: e.target.value });
  };
  const handleChangeDescription = (e) => {
    setSettings({ ...settings, description: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post("/api/user/settings/", settings).then((res) => {
      if (res.data.success) {
        setSettings({ ...(res.data.user as UserSettings) });
        Cookies.set("color", settings.color);
        history.push("/dashboard");
      } else {
        const errorsArray = res.data.errors.map((i) => {
          const errorObject = { property: "", constraints: "" };
          errorObject[i.property] =
            i.constraints[Object.keys(i.constraints)[0]];
          return errorObject;
        });
        setErrors(errorsArray);
      }
    });
  };

  const handleRadioChange = (e) => {
    setSettings({ ...settings, color: (e.target as HTMLInputElement).value });
  };

  const handleBoth = (e) => {
    handleRadioChange(e);
    handleColor(e);
  };

  useEffect(() => {
    axios.get("/api/user/settings/default").then((res) => {
      if (res.data.success) {
        setSettings(res.data.user);
      }
    });
  }, []);

  return (
    <Box display="flex" justifyContent="center" padding={4}>
      <form onSubmit={handleSubmit}>
        <Container>
          <FormControl component="fieldset">
            <FormLabel component="legend">Profile Color</FormLabel>
            <RadioGroup
              name="color"
              row={true}
              value={settings.color}
              onChange={handleBoth}
            >
              {colors.map((color) => (
                <FormControlLabel
                  value={color}
                  key={color}
                  control={<Radio className={"radio-" + color} />}
                  label=""
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Container>
        <div className={classes.search}>
          <TextField
            name="username"
            id="outlined-basic"
            label="Username"
            onChange={handleChangeUsername}
            value={settings.username}
            variant="outlined"
            InputLabelProps={{
              shrink: Boolean(settings.username?.length),
            }}
            classes={{
              root: classes.inputInput,
            }}
          />
        </div>
        <div className={classes.search}>
          <TextField
            name="displayname"
            id="outlined-basic"
            label="Display Name"
            onChange={handleChangeDisplayname}
            value={settings.displayname}
            variant="outlined"
            InputLabelProps={{
              shrink: Boolean(settings.displayname?.length),
            }}
            classes={{
              root: classes.inputInput,
            }}
          />
        </div>
        <div className={classes.search}>
          <TextField
            name="description"
            id="outlined-basic"
            label="Description"
            rows="4"
            multiline
            onChange={handleChangeDescription}
            value={settings.description}
            variant="outlined"
            InputLabelProps={{
              shrink: Boolean(settings.description?.length),
            }}
            classes={{
              root: classes.inputInput,
            }}
          />
        </div>
        <div className={classes.search}>
          <TextField
            name="email"
            id="outlined-basic"
            label="E-Mail"
            onChange={handleChangeEmail}
            value={settings.email}
            variant="outlined"
            InputLabelProps={{
              shrink: Boolean(settings.email?.length),
            }}
            classes={{
              root: classes.inputInput,
            }}
          />
        </div>
        <div className={classes.search}>
          <TextField
            name="location"
            id="outlined-basic"
            label="Location"
            onChange={handleChangeLocation}
            value={settings.location}
            variant="outlined"
            InputLabelProps={{
              shrink: Boolean(settings.location?.length),
            }}
            classes={{
              root: classes.inputInput,
            }}
          />
        </div>
        <div className={classes.search}>
          <TextField
            name="link"
            id="outlined-basic"
            label="Link"
            onChange={handleChangeLink}
            value={settings.link}
            variant="outlined"
            InputLabelProps={{
              shrink: Boolean(settings.link?.length),
            }}
            classes={{
              root: classes.inputInput,
            }}
          />
        </div>
        <Button
          type="submit"
          variant="contained"
          className={`button-${settings.color}`}
        >
          Submit
        </Button>
      </form>
    </Box>
  );
};

Settings.propTypes = {
  handleColor: PropType.func,
};

export default Settings;
