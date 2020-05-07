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
  Grid,
} from "@material-ui/core";
import { useHistory } from "react-router-dom";
import PropType from "prop-types";
import Cookies from "js-cookie";
import { ValidationError } from "class-validator";

const useStyles = makeStyles((theme: Theme) => ({
  search: {
    "&:hover": {
      backgroundColor: fade("#66d0f9", 0.2),
    },
  },

  inputInput: {
    color: "#eee",
    margin: theme.spacing(2),

    "& .MuiFormLabel-root": {
      color: "#79838a",
    },

    "& .MuiOutlinedInput-root": {
      color: "#eee",
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

interface UserSettings {
  description?: string;
  username?: string;
  email?: string;
  displayname?: string;
  location?: string;
  link?: string;
  color?: string;
}

interface SettingsError extends ValidationError {
  property: string;
  errors: string[];
}

interface SettingsProps {
  handleColor: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
const Settings = ({ handleColor }: SettingsProps): JSX.Element => {
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
  const [errors, setErrors] = useState({
    username: [],
    displayname: [],
    email: [],
    location: [],
    link: [],
    description: [],
    color: [],
  });
  const classes = useStyles();
  const history = useHistory();

  const handleSettingsChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const target = e.target.getAttribute("name");
    setSettings({ ...settings, [target as string]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    axios.post("/api/user/settings/", settings).then((res) => {
      if (res.data.success) {
        setSettings({ ...(res.data.user as UserSettings) });
        Cookies.set("color", settings.color as string);
        history.push("/dashboard");
      } else {
        setErrors({ ...errors, ...res.data.errors });
        /*const errorsArray = (res.data.errors as SettingsError[]).map((i) => {
          const errorObject = { property: "", constraints: "" };
          errorObject[i.property] =
            i.constraints[Object.keys(i.constraints)[0]];
          return errorObject;
        });
        setErrors(errorsArray);*/
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

  useEffect(() => {
    axios.get("/api/user/settings/default").then((res) => {
      if (res.data.success) {
        setSettings(res.data.user);
      }
    });
  }, []);

  return (
    <form onSubmit={handleSubmit}>
      <Grid container direction="column" alignItems="center" justify="center">
        <Grid item xs={12}>
          <Container>
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
                    control={<Radio className={"radio-" + color} />}
                    label=""
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Container>
        </Grid>
        <Grid item xs={12}>
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
              root: classes.inputInput,
            }}
          />
        </Grid>
        <Grid item xs={12}>
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
              root: classes.inputInput,
            }}
          />
        </Grid>
        <Grid item xs={12}>
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
              root: classes.inputInput,
            }}
          />
        </Grid>
        <Grid item xs={12}>
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
              root: classes.inputInput,
            }}
          />
        </Grid>
        <Grid item xs={12}>
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
              root: classes.inputInput,
            }}
          />
        </Grid>
        <Grid item xs={12}>
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
              root: classes.inputInput,
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            className={`button-${settings.color}`}
          >
            Submit
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

Settings.propTypes = {
  handleColor: PropType.func,
};

export default Settings;
