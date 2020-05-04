import React, { useState } from "react";
import axios from "axios";

import {
  Repeat as RepeatIcon,
  StarBorder as StarBorderIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
} from "@material-ui/icons/";
import { Link } from "react-router-dom";
import {
  Typography,
  IconButton,
  Grid,
  DialogContent,
  Box,
  CardMedia,
  Dialog,
} from "@material-ui/core";
import Gravatar from "../util/Gravatar";
import Moment from "../util/Moment";
import UserTooltip from "../user/UserTooltip";
import { makeStyles } from "@material-ui/core/styles";
import DeleteMessage from "./DeleteMessage";
import ViewImage from "./ViewImage";
import PropTypes from "prop-types";

const useStyles = makeStyles({
  message: {
    backgroundColor: "#192a3d",
    border: 0,
    color: "#eee",
    marginTop: "1rem",
  },
  image: {
    height: "400px",
  },
  delete: {
    color: "#8aadbd",
    "&:hover": {
      color: "#e64848",
    },
  },
  like: {
    color: "#8aadbd",
    "&:hover": {
      color: "#fffc59",
    },
  },
  liked: {
    color: "#fffc59",
  },
  repost: {
    color: "#8aadbd",
    "&:hover": {
      color: "#81db6b",
    },
  },
  reposted: {
    color: "#81db6b",
  },
});

const ViewMessage = ({
  open,
  user,
  message,
  handleClose,
  color,
}): JSX.Element => {
  const classes = useStyles();
  const [openDelete, setOpenDelete] = useState(false);
  const [openImage, setOpenImage] = useState(false);
  const [messageId, setMessageId] = useState("");
  const [imageName, setImageName] = useState("");

  const handleDelete = (e): void => {
    const messageId: string = e.currentTarget.getAttribute("data-id");
    setMessageId(messageId);
    setOpenDelete(true);
  };

  const handleLike = async (e): Promise<void> => {
    const messageId = e.currentTarget.getAttribute("data-id");
    await axios.post("/api/message/like", { id: messageId });
  };

  const handlePin = async (e): Promise<void> => {
    const messageId = e.currentTarget.getAttribute("data-id");
    await axios.post("/api/message/pin", { id: messageId });
  };

  const handleRepost = async (e): Promise<void> => {
    const messageId = e.currentTarget.getAttribute("data-id");
    await axios.post("/api/message/repost", { id: messageId });
  };

  const handleImage = (e): void => {
    e.preventDefault();
    setImageName(e.currentTarget.getAttribute("data-image-name"));
    setOpenImage(true);
  };

  const handleImageClose = (): void => {
    setOpenImage(false);
  };

  const handleDeleteClose = (): void => {
    setOpenDelete(false);
  };

  return (
    <div className="message">
      <DeleteMessage
        open={openDelete}
        handleClose={handleDeleteClose}
        messageId={messageId}
      />
      <ViewImage
        open={openImage}
        handleClose={handleImageClose}
        imageName={imageName}
      />
      <Dialog
        scroll="body"
        open={open}
        keepMounted
        onClose={handleClose}
        fullWidth={true}
        maxWidth="md"
        classes={{
          paper: classes.message,
        }}
      >
        <DialogContent>
          <div key={message.id}>
            <Grid container spacing={1}>
              <Grid item xs={1}>
                <Gravatar size={8} email={message.user.email} />
              </Grid>
              <Grid item xs={11}>
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    {user?.pinned?.id === message.id ? (
                      <Typography display="block" variant="caption">
                        <i
                          className="fas fa-thumbtack"
                          style={{ color: "#ffbcbc" }}
                        ></i>{" "}
                        Pinned Message
                      </Typography>
                    ) : null}
                    {message.reposted ? (
                      <Typography variant="caption" display="block">
                        <RepeatIcon />
                        {user.displayname} Reposted
                      </Typography>
                    ) : null}
                    <Link
                      to={"/@" + message.user.username}
                      className={"profile-link-" + color}
                    >
                      <span className="message-displayname">
                        {message.user.displayname === undefined ? (
                          <span>{message.user.username}</span>
                        ) : (
                          <span>{message.user.displayname}</span>
                        )}
                      </span>{" "}
                      <span className="message-username">
                        @{message.user.username}
                      </span>
                    </Link>{" "}
                    <Moment time={message.createdAt} profile={false} />
                  </Grid>
                  <Grid item xs={12}>
                    {message.data.split(" ").map((word) => {
                      if (word.includes("@")) {
                        return (
                          <UserTooltip username={word.slice(1)} color={color} />
                        );
                      } else {
                        return ` ${word} `;
                      }
                    })}
                    {message.file ? (
                      <CardMedia
                        onClick={handleImage}
                        image={`/uploads/${message.file}`}
                        title="test"
                        data-image-name={message.file}
                        className={classes.image}
                      />
                    ) : null}
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" justifyContent="space-between">
                      <div>
                        <IconButton
                          onClick={handleLike}
                          edge="start"
                          data-id={message.id}
                          className={
                            message.liked ? classes.liked : classes.like
                          }
                        >
                          {message.liked ? <StarIcon /> : <StarBorderIcon />}{" "}
                        </IconButton>
                        {message.likes.length}
                        <IconButton
                          onClick={handleRepost}
                          data-id={message.id}
                          className={
                            message.reposted ? classes.reposted : classes.repost
                          }
                        >
                          {message.reposted ? (
                            <RepeatIcon className={"reposted"} />
                          ) : (
                            <RepeatIcon />
                          )}{" "}
                        </IconButton>
                        {message.reposts.length}
                      </div>
                      <div>
                        {user.isDifferentUser ? null : (
                          <IconButton
                            onClick={handlePin}
                            data-id={message.id}
                            className={`pin-message-button-${color}`}
                          >
                            <i className="fas fa-sm fa-thumbtack"></i>
                          </IconButton>
                        )}

                        <IconButton
                          onClick={handleDelete}
                          data-id={message.id}
                          data-conversation-id={message?.thread?.id}
                          className={classes.delete}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </div>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
ViewMessage.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  user: PropTypes.shape({
    pinned: PropTypes.any,
    username: PropTypes.string,
    displayname: PropTypes.string,
    messages: PropTypes.array,
    followers: PropTypes.array,
    following: PropTypes.array,
    email: PropTypes.string,
    isDifferentUser: PropTypes.bool,
  }),
  color: PropTypes.string,
  message: PropTypes.shape({
    data: PropTypes.string,
    id: PropTypes.string,
    createdAt: PropTypes.string,
    likes: PropTypes.array,
    reposts: PropTypes.array,
    messageCreatedAt: PropTypes.string,
    user: PropTypes.any,
    reposted: PropTypes.bool,
    liked: PropTypes.bool,
    file: PropTypes.any,
  }),
};

export default ViewMessage;
