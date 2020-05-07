import React, { useState, useEffect } from "react";
import Gravatar from "../util/Gravatar";
import Moment from "../util/Moment";
import {
  Grid,
  makeStyles,
  IconButton,
  Typography,
  Card,
  CardContent,
  Box,
  Container,
  CircularProgress,
  CardMedia,
  Tooltip,
} from "@material-ui/core";
import axios from "axios";
import {
  Repeat as RepeatIcon,
  StarBorder as StarBorderIcon,
  Star as StarIcon,
  Delete as DeleteIcon,
} from "@material-ui/icons";

import { Link } from "react-router-dom";
import UserTooltip from "../user/UserTooltip";
import ViewMessage from "./ViewMessage";
import DeleteMessage from "./DeleteMessage";
import InfiniteScroll from "react-infinite-scroller";
import ViewImage from "./ViewImage";
import PropTypes from "prop-types";

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
  followers: [];
  following: [];
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

const useStyles = makeStyles({
  caption: {
    fontFamily: "'Open Sans', sans-serif",
  },
  mediaToggles: {
    padding: "1rem",
    cursor: "pointer",
  },
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
//e: React.ChangeEvent<HTMLInputElement>
interface UserMessageProps {
  dashboard: boolean;
  username: string | undefined;
  color: string;
}
const UserMessage = ({
  dashboard,
  username,
  color,
}: UserMessageProps): JSX.Element => {
  const classes = useStyles();
  const [openImage, setOpenImage] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [messageId, setMessageId] = useState("");
  const [imageName, setImageName] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [mediaOnly, setMediaOnly] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  // so the user can toggle between all messages and media only without having to call the api every time
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [user, setUser] = useState<User>({} as User);
  const [dialog, setDialog] = useState<Message>({} as Message);

  const urlForMessages = `/api/message/${
    dashboard ? `dashboard?` : `profile?username=${username}&`
  }page=${page}`;

  const loadMoreMessages = (): void => {
    axios.get(urlForMessages).then((res) => {
      if (res.data.success) {
        setPage(page + 1);
        setUser(res.data.user);
        setMessages(messages.concat(res.data.messages));
        if (mediaOnly) {
          const messagesFiltered = (res.data.messages as Message[]).filter(
            (message) => message.file,
          );
          setFilteredMessages(messagesFiltered);
        } else {
          setFilteredMessages(messages);
        }
      } else {
        setHasMore(false);
      }
      setIsLoading(false);
    });
  };

  useEffect(() => {
    axios
      .get(urlForMessages)
      .then((res) => {
        if (res.data.success) {
          // place to store messages, so api wont have to be called every time
          setUser(res.data.user);
          setMessages(res.data.messages);
          // used to actually map through the messages
          setFilteredMessages(res.data.messages);
          setPage(page + 1);
        }
        setIsLoading(false);
      })
      .catch(console.error);
  }, []);

  const handleLike = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ): void => {
    const messageId = e.currentTarget.getAttribute("data-id");
    axios.post("/api/message/like", { id: messageId }).then((res) => {
      if (res.data.success) {
        const messagesUpdated = messages.map((m) => {
          if (m.id === messageId) {
            if (res.data.liked) {
              m.liked = true;
              m.likes.push(res.data.like);
            } else {
              m.liked = false;
              m.likes = m.likes.filter((like) => like.id !== res.data.likeId);
            }
          }
          return m;
        });
        setMessages(messagesUpdated);
      }
    });
  };

  const handlePin = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ): void => {
    const messageId: string = e.currentTarget.getAttribute("data-id") as string;
    axios.post("/api/message/pin", { id: messageId }).then((res) => {
      if (res.data.success) {
        setUser({
          ...user,
          pinned: { ...user.pinned, id: res.data.pinned.id },
        });
        const messageIndex = messages
          .map((message) => message.id)
          .indexOf(messageId);
        const messagesReordered = [
          ...messages.slice(messageIndex),
          ...messages.slice(0, messageIndex),
        ];
        setMessages(messagesReordered);
        if (mediaOnly) {
          const messagesFiltered = messagesReordered.filter(
            (message) => message.file,
          );
          setFilteredMessages(messagesFiltered);
        } else {
          setFilteredMessages(messagesReordered);
        }
      }
    });
  };

  const handleDelete = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ): void => {
    const messageId: string = e.currentTarget.getAttribute("data-id") as string;
    setMessageId(messageId);
    setOpenDelete(true);
  };

  const handleRepost = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ): void => {
    const messageId: string = e.currentTarget.getAttribute("data-id") as string;
    axios.post("/api/message/repost", { id: messageId }).then((res) => {
      if (res.data.success) {
        const messagesUpdated = messages.map((m) => {
          if (m.id === messageId) {
            if (res.data.reposted) {
              m.reposted = true;
              m.reposts.push(res.data.repost);
            } else {
              m.reposted = false;
              m.reposts = m.reposts.filter(
                (repost) => repost.id !== res.data.repostId,
              );
            }
          }
          return m;
        });
        setMessages(messagesUpdated);
      }
    });
  };

  const handleDialogOpen = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ): void | boolean => {
    const tagNames: string[] = ["a", "button", "i", "path", "svg", "span"];
    const imageClassName = "MuiCardMedia-root";
    // prevent dialog on clicking like/repost/etc
    if (tagNames.includes((e.target as HTMLInputElement).tagName.toLowerCase()))
      return false;
    // prevent dialog on clicking image
    if ((e.target as HTMLInputElement).classList.contains(imageClassName))
      return false;
    const messageId: string = e.currentTarget.getAttribute("data-id") as string;
    axios.get(`/api/message/dialog?id=${messageId}`).then((res) => {
      if (res.data.success) {
        // todo: fix interface, expects string
        res.data.message.id = res.data.message.id.toString();

        setDialog(res.data.message);
        setOpenView(true);
      }
    });
  };

  const handleImage = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ): void => {
    e.preventDefault();
    setImageName(e.currentTarget.getAttribute("data-image-name") as string);
    setOpenImage(true);
  };

  const handleDialogClose = (): void => {
    setOpenView(false);
  };

  const handleImageClose = (): void => {
    setOpenImage(false);
  };

  const handleDeleteClose = (): void => {
    setOpenDelete(false);
  };

  const showMessagesWithMediaOnly = (): void => {
    const messagesFiltered = messages.filter((message) => message.file);
    setFilteredMessages(messagesFiltered);
    setMediaOnly(true);
  };

  const showAllMessages = (): void => {
    setFilteredMessages(messages);
    setMediaOnly(false);
  };

  return (
    <InfiniteScroll
      pageStart={1}
      loadMore={loadMoreMessages}
      hasMore={!isLoading && hasMore}
      loader={
        <Container>
          <CircularProgress />
        </Container>
      }
    >
      <div className="messages">
        <ViewMessage
          color={color}
          message={dialog}
          open={openView}
          user={user}
          handleClose={handleDialogClose}
        />
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
        <Box display="flex" flexDirection="row">
          <Typography
            variant="h5"
            onClick={showAllMessages}
            className={`${mediaOnly ? `link-${color}` : "'"} ${
              classes.mediaToggles
            }`}
          >
            Messages
          </Typography>
          <Typography
            variant="h5"
            onClick={showMessagesWithMediaOnly}
            className={`${mediaOnly ? "" : `link-${color}`} ${
              classes.mediaToggles
            }`}
          >
            Media Only
          </Typography>
        </Box>
        {filteredMessages.length > 0
          ? filteredMessages.map((message: Message) => (
              <Card
                className={classes.message}
                key={message.id}
                raised={true}
                onClick={handleDialogOpen}
                data-id={message.id}
              >
                <CardContent>
                  <Grid container spacing={1}>
                    <Grid item xs={1}>
                      <Gravatar size={8} email={message.user.email} />
                    </Grid>
                    <Grid item xs={11}>
                      <Grid container spacing={1}>
                        <Grid item xs={12}>
                          {user.pinned && user.pinned.id === message.id ? (
                            <Typography
                              display="block"
                              variant="caption"
                              className={classes.caption}
                            >
                              <i
                                className={`fas fa-thumbtack color-${color}`}
                              ></i>{" "}
                              Pinned Message
                            </Typography>
                          ) : null}
                          {message.reposted ? (
                            <Typography
                              variant="caption"
                              display="block"
                              className={classes.caption}
                            >
                              <RepeatIcon className={`color-${color}`} />
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
                          <Moment
                            time={
                              message.reposted
                                ? (message.messageCreatedAt as string)
                                : message.createdAt
                            }
                            profile={false}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          {message.data.split(" ").map((word: string) => {
                            if (word.startsWith("@")) {
                              return (
                                <UserTooltip
                                  username={word.slice(1)}
                                  color={color}
                                />
                              );
                            } else if (word.startsWith("#")) {
                              return (
                                <Link to={`/search?qs=%23${word.slice(1)}`}>
                                  <Typography
                                    variant="body1"
                                    display="inline"
                                    className={`link-${color}`}
                                  >
                                    {word}
                                  </Typography>
                                </Link>
                              );
                            } else {
                              return ` ${word} `;
                            }
                          })}
                          {message.file ? (
                            <CardMedia
                              onClick={handleImage}
                              image={`/uploads/${message.file}`}
                              data-image-name={message.file}
                              className={classes.image}
                            />
                          ) : null}
                        </Grid>
                        <Grid item xs={12}>
                          <Box display="flex" justifyContent="space-between">
                            <div>
                              <Tooltip title={"Like"} arrow>
                                <IconButton
                                  onClick={handleLike}
                                  edge="start"
                                  data-id={message.id}
                                  className={
                                    message.liked ? classes.liked : classes.like
                                  }
                                >
                                  {message.liked ? (
                                    <StarIcon />
                                  ) : (
                                    <StarBorderIcon />
                                  )}{" "}
                                </IconButton>
                              </Tooltip>

                              {message.likes.length}
                              <Tooltip title={"Repost"} arrow>
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
                              </Tooltip>
                              {message.reposts.length}
                            </div>
                            <div>
                              {user.isDifferentUser ? null : (
                                <Tooltip title={"Pin"} arrow>
                                  <IconButton
                                    onClick={handlePin}
                                    data-id={message.id}
                                    className={`pin-message-button-${color}`}
                                  >
                                    <i className="fas fa-sm fa-thumbtack"></i>
                                  </IconButton>
                                </Tooltip>
                              )}
                              <Tooltip title={"Delete"} arrow>
                                <IconButton
                                  onClick={handleDelete}
                                  data-id={message.id}
                                  className={classes.delete}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </div>
                          </Box>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))
          : null}
      </div>
    </InfiniteScroll>
  );
};

UserMessage.propTypes = {
  dashboard: PropTypes.bool,
  username: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // can be "undefined"
  color: PropTypes.string,
};

export default UserMessage;
