import React, { useState, useRef, useContext } from "react";
import { Photo as PhotoButton } from "@material-ui/icons";
import {
  Button,
  Typography,
  DialogActions,
  InputBase,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  darken,
} from "@material-ui/core";
import { makeStyles, fade } from "@material-ui/core/styles";
import Cookies from "js-cookie";
import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import DarkModeContext from "../DarkMode";

interface DarkModeProps {
  darkMode: boolean;
}

interface NewMessageProps {
  open: boolean;
  handleClose: () => void;
  socketio: SocketIOClient.Socket;
}

const useStyles = makeStyles(() => ({
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  modal: (props: DarkModeProps) => ({
    backgroundColor: props.darkMode ? "#192a3d" : "#dfe9f4",
    background: props.darkMode ? "#192a3d" : "#dfe9f4",
    color: props.darkMode ? "#dfe9f4" : "#192a3d",
    //fontSize: "10rem",
    textAlign: "center",
  }),
  modalForm: {
    color: "#eee",
    borderBottomColor: "#66d0f9",
    borderColor: "#66d0f9",
    backgroundColor: fade("#66d0f9", 0.1),
    borderRadius: "0",
    paddingInline: "1rem",
  },
  messageGreen: {
    color: "#66ffb2",
    justifyContent: "center",
  },
  messageRed: {
    color: "#db5e39",
    justifyContent: "center",
  },
  button: {
    backgroundColor: "#97adc4",
    "&:hover": {
      backgroundColor: darken("#97adc4", 0.1),
    },
  },
  buttonUpload: {
    color: "#97adc4",
    "&:focus": {
      color: darken("#97adc4", 0.1),
    },
  },
}));

const NewMessage = ({
  open,
  handleClose,
  socketio,
}: NewMessageProps): JSX.Element => {
  const color = Cookies.get("color") || "default";
  const darkMode = useContext(DarkModeContext);
  const location = useLocation();
  const [text, setText] = useState("");
  const fileRef = useRef(null);
  const classes = useStyles({ darkMode });
  const textClass = classes[text.length <= 260 ? "messageGreen" : "messageRed"];
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (text.length <= 280) {
      e.preventDefault();
    }
    setText(e.target.value);
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    const formData = new FormData();
    console.log(location.pathname);
    formData.append("data", text);
    //formData.append("file", (fileRef?.current as HTMLFor?.files?.[0]);

    socketio.emit("new message", { text, path: location.pathname });
    handleClose();
  };

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth={true}
      onClose={handleClose}
      keepMounted
      classes={{
        paper: classes.modal,
      }}
    >
      <DialogTitle id="form-dialog-title">New Message</DialogTitle>
      <DialogContent>
        <form autoComplete="off" onSubmit={handleSubmit}>
          <InputBase
            fullWidth={true}
            id="standard-basic"
            onChange={handleChange}
            multiline
            rows="8"
            classes={{ root: classes.modalForm }}
          />
          <Typography>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              value="Submit"
              className={`button-${color}`}
            >
              Submit
            </Button>
            <input
              id="icon-button-file"
              type="file"
              name="file"
              ref={fileRef}
              //onChange={handleImageChange}
            />
            <label htmlFor="icon-button-file">
              <IconButton color="primary" component="span">
                <PhotoButton className={classes.buttonUpload} />
              </IconButton>
            </label>
          </Typography>
        </form>
      </DialogContent>
      <DialogActions className={textClass}>
        <Typography variant="h2" component="h2">
          {280 - text.length}
        </Typography>
      </DialogActions>
    </Dialog>
  );
};

NewMessage.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  color: PropTypes.string,
  setNewMessage: PropTypes.func,
};

export default NewMessage;
