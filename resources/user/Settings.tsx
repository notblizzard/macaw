import React, { useState, useEffect, useContext } from "react";
import {
  TextField,
  makeStyles,
  Theme,
  fade,
  Button,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Box,
} from "@material-ui/core";
import { useHistory } from "react-router-dom";
import Cookies from "js-cookie";
import DarkModeContext from "../DarkMode";
import { Helmet } from "react-helmet-async";

interface UserSettings {
  description?: string;
  username?: string;
  email?: string;
  displayname?: string;
  location?: string;
  link?: string;
  color?: string;
}

interface SettingsProps {
  handleColor: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  search: {
    "&:hover": {
      backgroundColor: fade("#66d0f9", 0.2),
    },
  },

  input: {
    color: "#eee",
    margin: theme.spacing(2),

    "& .MuiFormLabel-root": {
      color: (props: { darkMode: boolean }): string =>
        props.darkMode ? "#eee" : "#222",
    },

    "& .MuiOutlinedInput-root": {
      color: (props: { darkMode: boolean }): string =>
        props.darkMode ? "#eee" : "#222",
      //margin: theme.spacing(4),
      backgroundColor: fade("#66d0f9", 0.1),
      //position: "relative",
      borderRadius: theme.shape.borderRadius,
      //width: "20rem",
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

const Settings = ({ handleColor }: SettingsProps): JSX.Element => {
  const colors: string[] = [
    "green",
    "blue",
    "purple",
    "red",
    "yellow",
    "orange",
  ];
  const [settings, setSettings] = useState<UserSettings>({
    username: "",
    displayname: "",
    email: "",
    location: "",
    link: "",
    description: "",
    color: "",
  });
  const [errors, setErrors] = useState({
    username: [],
    displayname: [],
    email: [],
    location: [],
    link: [],
    description: [],
    color: [],
  });
  const darkMode = useContext(DarkModeContext);
  const classes = useStyles({ darkMode });
  const history = useHistory();

  useEffect(() => {
    fetch("/api/user/settings/default", {
      headers: { "X-CSRF-TOKEN": Cookies.get("XSRF-TOKEN")! },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSettings(data.user);
        }
      });
  }, []);

  const handleSettingsChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const target = e.target.getAttribute("name");
    setSettings({ ...settings, [target as string]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    fetch("/api/user/settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": Cookies.get("XSRF-TOKEN")!,
      },
      body: JSON.stringify(settings),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSettings({ ...(data.user as UserSettings) });
          Cookies.set("color", settings.color as string);
          history.push("/dashboard");
        } else {
          setErrors({ ...errors, ...data.errors });
        }
      });
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSettings({ ...settings, color: e.target.value });
  };

  const handleBoth = (e: React.ChangeEvent<HTMLInputElement>): void => {
    handleRadioChange(e);
    handleColor(e);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Helmet>
        <title>Settings</title>
      </Helmet>
      <Box display="flex" flexDirection="column" alignItems="center">
        <FormControl component="fieldset">
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
                control={<Radio className={`radio-${color}`} />}
                label=""
              />
            ))}
          </RadioGroup>
        </FormControl>

        <TextField
          name="username"
          id="outlined-basic"
          label="Username"
          onChange={handleSettingsChange}
          value={settings.username}
          variant="outlined"
          error={errors.username.length > 0}
          helperText={errors.username.join("\n")}
          InputLabelProps={{
            shrink: Boolean(settings.username?.length),
          }}
          classes={{
            root: classes.input,
          }}
        />

        <TextField
          name="displayname"
          id="outlined-basic"
          label="Display Name"
          onChange={handleSettingsChange}
          value={settings.displayname}
          variant="outlined"
          error={errors.displayname.length > 0}
          helperText={errors.displayname.join("\n")}
          InputLabelProps={{
            shrink: Boolean(settings.displayname?.length),
          }}
          classes={{
            root: classes.input,
          }}
        />

        <TextField
          name="description"
          id="outlined-basic"
          label="Description"
          rows="4"
          error={errors.description.length > 0}
          helperText={errors.description.join("\n")}
          multiline
          onChange={handleSettingsChange}
          value={settings.description}
          variant="outlined"
          InputLabelProps={{
            shrink: Boolean(settings.description?.length),
          }}
          classes={{
            root: classes.input,
          }}
        />

        <TextField
          name="email"
          id="outlined-basic"
          label="E-Mail"
          onChange={handleSettingsChange}
          value={settings.email}
          error={errors.email.length > 0}
          helperText={errors.email.join("\n")}
          variant="outlined"
          InputLabelProps={{
            shrink: Boolean(settings.email?.length),
          }}
          classes={{
            root: classes.input,
          }}
        />

        <TextField
          name="location"
          id="outlined-basic"
          label="Location"
          onChange={handleSettingsChange}
          value={settings.location}
          variant="outlined"
          error={errors.location.length > 0}
          helperText={errors.location.join("\n")}
          InputLabelProps={{
            shrink: Boolean(settings.location?.length),
          }}
          classes={{
            root: classes.input,
          }}
        />

        <TextField
          name="link"
          id="outlined-basic"
          label="Link"
          onChange={handleSettingsChange}
          value={settings.link}
          variant="outlined"
          InputLabelProps={{
            shrink: Boolean(settings.link?.length),
          }}
          error={errors.link.length > 0}
          helperText={errors.link.join("\n")}
          classes={{
            root: classes.input,
          }}
        />

        <Button
          type="submit"
          variant="contained"
          className={`button-${settings.color}`}
        >
          Submit
        </Button>
      </Box>
    </form>
  );
};

export default Settings;
