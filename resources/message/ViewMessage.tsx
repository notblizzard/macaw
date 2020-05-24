import React, { useState, useContext } from "react";

import {
  Repeat as RepeatIcon,
  StarBorder as StarBorderIcon,
  Star as StarIcon,
} from "@material-ui/icons/";
import { Link } from "react-router-dom";
import {
  IconButton,
  Grid,
  DialogContent,
  Box,
  CardMedia,
  Dialog,
  useTheme,
  useMediaQuery,
  Typography,
} from "@material-ui/core";
import Gravatar from "../util/Gravatar";
import Moment from "../util/Moment";
import UserTooltip from "../user/UserTooltip";
import { makeStyles } from "@material-ui/core/styles";
import ViewImage from "./ViewImage";
import Cookies from "js-cookie";
import DarkModeContext from "../DarkMode";

interface User {
  id: number;
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
  id: number;
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
  id: number;
  createdAt: string;
  user: User;
  message: Message;
}
interface Like {
  id: number;
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
  messageGrid: {
    wordWrap: "break-word",
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
  message,
  handleClose,
  color,
}: ViewMessageProp): JSX.Element => {
  const theme = useTheme();
  // true = desktop, false = mobile
  const breakpoint = useMediaQuery(theme.breakpoints.up("sm"));
  const darkMode = useContext(DarkModeContext);
  const classes = useStyles({ darkMode });
  const [openImage, setOpenImage] = useState(false);
  const [imageName, setImageName] = useState("");

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

  return (
    <div className="message">
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
                <Grid item xs={breakpoint ? 1 : 2}>
                  <Gravatar
                    size={breakpoint ? 8 : 5}
                    email={message.user.email}
                  />
                </Grid>
                <Grid item xs={breakpoint ? 11 : 10}>
                  <Grid container spacing={1}>
                    <Grid item xs={12}>
                      <Typography display="inline">
                        <Link
                          to={`/@${message.user.username}`}
                          className={`username-link-${color}`}
                        >
                          <Box component="span" className={classes.displayname}>
                            {message.user.displayname === undefined
                              ? message.user.username
                              : message.user.displayname}
                          </Box>{" "}
                          <Box component="span" className={classes.username}>
                            @{message.user.username}
                          </Box>
                        </Link>{" "}
                        <Moment
                          time={
                            message.reposted
                              ? (message.messageCreatedAt as string)
                              : message.createdAt
                          }
                          profile={false}
                        />
                      </Typography>
                    </Grid>
                    <Grid item xs={12} className={classes.messageGrid}>
                      <Typography display="inline">
                        {message.data.split(" ").map((word: string) => {
                          if (word.startsWith("@")) {
                            return <UserTooltip username={word.slice(1)} />;
                          } else if (word.startsWith("#")) {
                            return (
                              <Link to={`/search?qs=%23${word.slice(1)}`}>
                                <Box
                                  component="span"
                                  className={`link-${color}`}
                                >
                                  {word}
                                </Box>
                              </Link>
                            );
                          } else {
                            return ` ${word} `;
                          }
                        })}
                      </Typography>
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

export default ViewMessage;
