import React, { useState, useRef, useContext } from "react";
import { Photo as PhotoButton } from "@material-ui/icons";
import {
  Button,
  Typography,
  InputBase,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  darken,
  Box,
} from "@material-ui/core";
import { makeStyles, fade } from "@material-ui/core/styles";
import Cookies from "js-cookie";
import { useLocation } from "react-router-dom";
import DarkModeContext from "../DarkMode";

interface DarkModeProps {
  darkMode: boolean;
}

interface NewMessageProps {
  open: boolean;
  handleClose: () => void;
  socket: SocketIOClient.Socket;
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
  input: {
    display: "none",
  },
  modalForm: (props: DarkModeProps) => ({
    color: props.darkMode ? "#dfe9f4" : "#192a3d",
    borderBottomColor: "#66d0f9",
    borderColor: "#66d0f9",
    backgroundColor: fade("#66d0f9", 0.1),
    borderRadius: "0",
    paddingInline: "1rem",
  }),
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
  newMessageButtons: {
    width: "100%",
  },
}));

const NewMessage = ({
  open,
  handleClose,
  socket,
}: NewMessageProps): JSX.Element => {
  const color = Cookies.get("color") || "default";
  const darkMode = useContext(DarkModeContext);
  const location = useLocation();
  const [text, setText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const classes = useStyles({ darkMode });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void | boolean => {
    if (e.target.value.length > 280) {
      e.preventDefault();
      setText(text.slice(0, 280));
      return false;
    }
    setText(e.target.value);
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("data", text);
    formData.append("file", (fileRef.current as any).files[0]);
    fetch("/api/message/new", {
      method: "POST",
      headers: {
        "X-CSRF-TOKEN": Cookies.get("XSRF-TOKEN")!,
      },
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          socket.emit("new message", {
            path: location.pathname,
            id: data.id,
          });
        }
      });
    setText("");
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
          <Box display="flex" flexDirection="column" alignItems="center">
            <InputBase
              fullWidth={true}
              id="standard-basic"
              onChange={handleChange}
              value={text}
              multiline
              rows="8"
              classes={{ root: classes.modalForm }}
            />
            <Box
              display="flex"
              flexDirection="row"
              alignItems="center"
              justifyContent="space-around"
              className={classes.newMessageButtons}
            >
              <input
                id="icon-button-file"
                type="file"
                name="file"
                accept="image/*"
                ref={fileRef}
                className={classes.input}
              />
              <label htmlFor="icon-button-file">
                <IconButton color="primary" component="span">
                  <PhotoButton className={classes.buttonUpload} />
                </IconButton>
              </label>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                value="Submit"
                className={`button-${color}`}
              >
                Submit
              </Button>
              <Typography variant="body1">{280 - text.length}</Typography>
            </Box>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewMessage;
