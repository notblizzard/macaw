import React, { useState, useRef } from "react";
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
} from "@material-ui/core";
import { makeStyles, fade } from "@material-ui/core/styles";
import Cookies from "js-cookie";
import PropTypes from "prop-types";

const useStyles = makeStyles(() => ({
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
    borderRadius: "2%", //theme.shape.borderRadius,
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
const NewMessage = ({ open, onClose, color }): JSX.Element => {
  const [text, setText] = useState("");
  const fileRef = useRef(null);
  const classes = useStyles();
  const textClass =
    text.length <= 260 ? classes.messageLengthGood : classes.messageLengthBad;
  const handleChange = (e): void => {
    if (text.length <= 280) {
      e.preventDefault();
    }
    setText(e.target.value);
  };

  const handleSubmit = async (e): Promise<void> => {
    e.preventDefault();
    const formData = new FormData();

    formData.append("data", text);
    formData.append("file", fileRef.current.files[0]);

    await fetch("/api/message/new", {
      credentials: "include",
      headers: {
        "X-XSRF-TOKEN": Cookies.get("XSRF-TOKEN"),
      },
      method: "POST",
      body: formData,
    });
  };

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth={true}
      onClose={onClose}
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
              className={"button-" + color}
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
  onClose: PropTypes.func,
  color: PropTypes.string,
  setNewMessage: PropTypes.func,
};

export default NewMessage;
