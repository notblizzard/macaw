import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  DialogActions,
} from "@material-ui/core";
import { makeStyles, Theme, fade } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import Cookies from "js-cookie";

const useStyles = makeStyles((theme: Theme) => ({
  modal: {
    backgroundColor: "#192a3d",
    background: " #192a3d",
    color: "#eee",
    textAlign: "center",
  },
  modalForm: {
    color: "#eee",
    borderBottomColor: "#66d0f9",
    borderColor: "#66d0f9",
    backgroundColor: fade("#66d0f9", 0.1),
    borderRadius: theme.shape.borderRadius,
    paddingInline: "1rem",
  },
  messageLengthGood: {
    color: "#66ffb2",
    justifyContent: "center",
  },
  messageLengthBad: {
    color: "#db5e39",
    justifyContent: "center",
  },
  button: {
    backgroundColor: "#97adc4",
    "&:hover": {
      backgroundColor: "#70859b",
    },
  },
  buttonUpload: {
    color: "#97adc4",
    "&:focus": {
      color: "#70859b",
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
  const classes = useStyles();

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
        <Button onClick={handleMessageDelete}>ok</Button>
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
