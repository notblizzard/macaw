import React, { useContext, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  DialogActions,
  darken,
  Typography,
} from "@material-ui/core";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { useLocation } from "react-router-dom";
import DarkModeContext from "../DarkMode";

interface DeleteMessageProps {
  open: boolean;
  handleClose: () => void;
  messageId: number;
  socketio: SocketIOClient.Socket;
}
interface DarkModeProps {
  darkMode: boolean;
}
const useStyles = makeStyles((theme: Theme) => ({
  modal: (props: DarkModeProps) => ({
    backgroundColor: props.darkMode ? "#192a3d" : "#dfe9f4",
    color: props.darkMode ? "#dfe9f4" : "#192a3d",
    textAlign: "center",
  }),
  button: {
    backgroundColor: "#97adc4",
    "&:hover": {
      backgroundColor: darken("#97adc4", 0.1),
    },
  },
  buttonDelete: {
    backgroundColor: "#D62839",
    "&:hover": {
      backgroundColor: darken("#D62839", 0.1),
    },
  },
}));

const DeleteMessage = ({
  open,
  handleClose,
  messageId,
  socketio,
}: DeleteMessageProps): JSX.Element => {
  const location = useLocation();
  const darkMode = useContext(DarkModeContext);
  const classes = useStyles({ darkMode });
  const { current: socket } = useRef(socketio);

  const handleMessageDelete = async (): Promise<void> => {
    socket.emit("delete message", { id: messageId, path: location.pathname });
  };

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      onClose={handleClose}
      classes={{ paper: classes.modal }}
      keepMounted
    >
      <DialogTitle>Delete Message</DialogTitle>
      <DialogContent>
        <Typography>Are you sure you want to delete this message?</Typography>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          onClick={handleMessageDelete}
          className={classes.buttonDelete}
        >
          Yes
        </Button>
        <Button
          variant="contained"
          onClick={handleClose}
          className={classes.button}
        >
          No
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteMessage;
