import React, { useState, useContext } from "react";

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
import Cookies from "js-cookie";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbtack } from "@fortawesome/free-solid-svg-icons";
import DarkModeContext from "../DarkMode";

interface User {
  id: string;
  color: string;
  createdAt: string;
  username: string;
  displayname: string;
  email: string;
  description: string;
  location: string;
  pinned: Message;
  isDifferentUser?: boolean;
}
interface Message {
  id: string;
  createdAt: string;
  data: string;
  user: User;
  liked: boolean;
  file: string;
  likes: Like[];
  reposted: boolean;
  reposts: Repost[];
  messageCreatedAt?: string;
}
interface Repost {
  id: string;
  createdAt: string;
  user: User;
  message: Message;
}
interface Like {
  id: string;
  user: User;
  message: Message;
}

interface StyleProps {
  darkMode: boolean;
}

interface ViewMessageProp {
  open: boolean;
  user: User;
  message: Message;
  handleClose: () => void;
  color: string;
}

const useStyles = makeStyles({
  message: (props: StyleProps) => ({
    backgroundColor: props.darkMode ? "#192a3d" : "#e3edf7",
    border: 0,
    color: props.darkMode ? "#eee" : "#222",
    marginTop: "1rem",
  }),
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
  username: (props: StyleProps) => ({
    color: props.darkMode ? "#b8c5d9bd" : "#070b0fbd",
    fontSize: "1rem",
  }),
  displayname: (props: StyleProps) => ({
    color: props.darkMode ? "#eee" : "#222",
    fontSize: "1rem",
  }),
});

const ViewMessage = ({
  open,
  user,
  message,
  handleClose,
  color,
}: ViewMessageProp): JSX.Element => {
  const darkMode = useContext(DarkModeContext);
  const classes = useStyles({ darkMode });
  const [openDelete, setOpenDelete] = useState(false);
  const [openImage, setOpenImage] = useState(false);
  const [messageId, setMessageId] = useState("");
  const [imageName, setImageName] = useState("");

  const handleDelete = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ): void => {
    const messageId: string = e.currentTarget.getAttribute("data-id") as string;
    setMessageId(messageId);
    setOpenDelete(true);
  };

  const handleLike = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ): Promise<void> => {
    const messageId = e.currentTarget.getAttribute("data-id");
    await fetch("/api/message/like", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": Cookies.get("XSRF-TOKEN")!,
      },
      body: JSON.stringify({ id: messageId }),
    });
  };

  const handlePin = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ): Promise<void> => {
    const messageId = e.currentTarget.getAttribute("data-id");
    await fetch("/api/message/pin", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": Cookies.get("XSRF-TOKEN")!,
      },
      body: JSON.stringify({ id: messageId }),
    });
  };

  const handleRepost = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ): Promise<void> => {
    const messageId = e.currentTarget.getAttribute("data-id");
    await fetch("/api/message/repost", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": Cookies.get("XSRF-TOKEN")!,
      },
      body: JSON.stringify({ id: messageId }),
    });
  };

  const handleImage = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ): void => {
    e.preventDefault();
    setImageName(e.currentTarget.getAttribute("data-image-name") as string);
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
          {Object.keys(message).length !== 0 ? (
            <div key={message.id}>
              <Grid container spacing={1}>
                <Grid item xs={1}>
                  <Gravatar size={8} email={message.user.email} />
                </Grid>
                <Grid item xs={11}>
                  <Grid container spacing={1}>
                    <Grid item xs={12}>
                      <Link
                        to={"/@" + message.user.username}
                        className={`profile-link-${color}`}
                      >
                        <span className={classes.displayname}>
                          {message.user.displayname === undefined ? (
                            <span>{message.user.username}</span>
                          ) : (
                            <span>{message.user.displayname}</span>
                          )}
                        </span>{" "}
                        <span className={classes.username}>
                          @{message.user.username}
                        </span>
                      </Link>{" "}
                      <Moment time={message.createdAt} profile={false} />
                    </Grid>
                    <Grid item xs={12}>
                      {message.data.split(" ").map((word) => {
                        if (word.includes("@")) {
                          return <UserTooltip username={word.slice(1)} />;
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
                              message.reposted
                                ? classes.reposted
                                : classes.repost
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
                              className={`pin-${color}`}
                            >
                              <FontAwesomeIcon icon={faThumbtack} />
                            </IconButton>
                          )}

                          <IconButton
                            onClick={handleDelete}
                            data-id={message.id}
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
          ) : null}
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
