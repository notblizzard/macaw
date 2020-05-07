import React from "react";
import { DialogContent } from "@material-ui/core";
import { Dialog } from "@material-ui/core";
import { makeStyles, fade } from "@material-ui/core/styles";
import PropTypes from "prop-types";

const useStyles = makeStyles(() => ({
  message: {
    backgroundColor: "#192a3d",
    border: 0,
    color: "#eee",
    marginTop: "1rem",
  },
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
    borderRadius: "2%", // theme.shape.borderRadius,
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
  dialogRoot: {
    padding: "0 !important",
  },
}));

interface ViewImageProps {
  open: boolean;
  handleClose: () => void;
  imageName: string;
}
const ViewImage = ({
  open,
  handleClose,
  imageName,
}: ViewImageProps): JSX.Element => {
  const classes = useStyles();
  return (
    <Dialog
      scroll="body"
      open={open}
      keepMounted
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogContent classes={{ root: classes.dialogRoot }}>
        <img
          src={`/uploads/${imageName}`}
          style={{ maxWidth: "100%", maxHeight: "100%" }}
        ></img>
      </DialogContent>
    </Dialog>
  );
};

ViewImage.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  imageName: PropTypes.string,
};

export default ViewImage;
