import React, { useContext } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  DialogActions,
  darken,
} from "@material-ui/core";
import { makeStyles, Theme } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import Cookies from "js-cookie";
import DarkModeContext from "../DarkMode";

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

interface DeleteMessageProps {
  open: boolean;
  handleClose: () => void;
  messageId: string;
}
const DeleteMessage = ({
  open,
  handleClose,
  messageId,
}: DeleteMessageProps): JSX.Element => {
  const darkMode = useContext(DarkModeContext);
  const classes = useStyles({ darkMode });

  const handleMessageDelete = async (): Promise<void> => {
    await fetch("/api/message/data", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": Cookies.get("XSRF-TOKEN")!,
      },
      body: JSON.stringify({ id: messageId }),
    });
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
        Are you sure you want to delete this message?
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

DeleteMessage.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  messageId: PropTypes.string,
};

export default DeleteMessage;
