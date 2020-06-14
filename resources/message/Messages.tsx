import React, { useState, useEffect, useContext } from "react";
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
  useMediaQuery,
} from "@material-ui/core";
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
import Cookies from "js-cookie";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbtack } from "@fortawesome/free-solid-svg-icons";
import DarkModeContext from "../DarkMode";
import { useTheme } from "@material-ui/core/styles";

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
  followers: [];
  following: [];
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

interface MessagesProps {
  path: "dashboard" | "profile" | "explore";
  username?: string;
  socket: SocketIOClient.Socket;
}

const useStyles = makeStyles({
  caption: {
    fontFamily: "'Open Sans', sans-serif",
  },
  mediaToggles: {
    padding: "1rem",
    cursor: "pointer",
  },
  message: (props: StyleProps) => ({
    backgroundColor: props.darkMode ? "#192a3d" : "#e3edf7",
    border: 0,
    color: props.darkMode ? "#eee" : "#222",
    marginTop: "1rem",
  }),
  image: {
    height: "400px",
  },
  inline: {
    display: "inline",
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
  messageGrid: {
    wordWrap: "break-word",
  },
});

const Messages = ({ path, username, socket }: MessagesProps): JSX.Element => {
  const color = Cookies.get("color") || "default";
  const theme = useTheme();
  // true = desktop, false = mobile
  const breakpoint = useMediaQuery(theme.breakpoints.up("sm"));
  const darkMode = useContext(DarkModeContext);
  const classes = useStyles({ darkMode });
  const tagNames: string[] = ["a", "button", "i", "path", "svg", "span"];
  const [messageId, setMessageId] = useState(0);
  const [page, setPage] = useState(1);
  const [openDelete, setOpenDelete] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [image, setImage] = useState({
    name: "",
    open: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [mediaOnly, setMediaOnly] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [user, setUser] = useState<User>(null!);
  const [dialog, setDialog] = useState<Message>(null!);

  const urlPath = ["dashboard", "explore"].includes(path)
    ? `${path}?`
    : `profile?username=${username}&`;
  const urlForMessages = `/api/message/${urlPath}page=${page}`;

  const loadMoreMessages = (): void => {
    setIsLoading(true);
    fetch(urlForMessages, {
      headers: { "X-CSRF-TOKEN": Cookies.get("XSRF-TOKEN")! },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          console.log(data.user);
          setPage(page + 1);
          setUser(data.user ?? null!);
          setMessages(messages.concat(data.messages));
          setHasMore(data.messages.length >= 10);
        }
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadMoreMessages();
  }, []);

  useEffect(() => {
    socket.on("new message", (message: Message) => {
      message.likes = [];
      message.reposts = [];
      // todo: fix if message count is currently 0
      // current will fail if user has ZERO messages when this fires
      if (messages[0]?.id === user?.pinned?.id) {
        setMessages([messages[0], message, ...messages.slice(1)]);
      } else {
        setMessages([message, ...messages]);
      }
    });

    socket.on("delete message", (data: { id: number }) => {
      setMessages(messages.filter((message) => message.id !== data.id));
    });

    return (): void => {
      socket.off("new message");
      socket.off("delete message");
    };
  }, [messages, socket, user?.pinned?.id]);

  const formatText = (word: string): JSX.Element | string => {
    if (word.startsWith("@")) {
      return <UserTooltip username={word.slice(1)} />;
    } else if (word.startsWith("#")) {
      return (
        <Link to={`/search?qs=%23${word.slice(1)}`}>
          <Box component="span" className={`link-${color}`}>
            {word}
          </Box>
        </Link>
      );
    } else {
      return ` ${word} `;
    }
  };

  const handleLike = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ): void => {
    const messageId = Number(e.currentTarget.getAttribute("data-id"));
    fetch("/api/message/like", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": Cookies.get("XSRF-TOKEN")!,
      },
      body: JSON.stringify({ id: messageId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMessages(
            messages.map((message) => {
              if (message.id === messageId) {
                if (data.liked) {
                  message.liked = true;
                  message.likes.push(data.like);
                } else {
                  message.liked = false;
                  message.likes = message.likes.filter(
                    (like) => like.id !== data.likeId,
                  );
                }
              }
              return message;
            }),
          );
        }
      });
  };

  const handlePin = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ): void => {
    const messageId = Number(e.currentTarget.getAttribute("data-id"));
    fetch("/api/message/pin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": Cookies.get("XSRF-TOKEN")!,
      },
      body: JSON.stringify({ id: messageId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUser({
            ...user,
            pinned: { ...user?.pinned, id: data.pinned.id },
          });
          const messageIndex = messages
            .map((message) => message.id)
            .indexOf(messageId);
          setMessages([
            ...messages.slice(messageIndex),
            ...messages.slice(0, messageIndex),
          ]);
        }
      });
  };

  const handleDelete = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ): void => {
    const messageId = Number(e.currentTarget.getAttribute("data-id"));
    setMessageId(messageId);
    setOpenDelete(true);
  };

  const handleRepost = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ): void => {
    const messageId = Number(e.currentTarget.getAttribute("data-id"));
    fetch("/api/message/repost", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": Cookies.get("XSRF-TOKEN")!,
      },
      body: JSON.stringify({ id: messageId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMessages(
            messages.map((message) => {
              if (message.id === messageId) {
                if (data.reposted) {
                  message.reposted = true;
                  message.reposts.push(data.repost);
                } else {
                  message.reposted = false;
                  message.reposts = message.reposts.filter(
                    (repost) => repost.id !== data.repostId,
                  );
                }
              }
              return message;
            }),
          );
        }
      });
  };

  const handleDialogOpen = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ): void | boolean => {
    // prevent dialog on clicking like/repost/etc
    const event = e.target as any;
    if (tagNames.includes(event.tagName.toLowerCase())) {
      return false;
    }
    // prevent dialog on clicking image
    if (event.classList.contains("MuiCardMedia-root")) return false;

    const messageId: string = e.currentTarget.getAttribute("data-id")!;
    fetch(`/api/message/dialog?id=${messageId}`, {
      headers: { "X-CSRF-TOKEN": Cookies.get("XSRF-TOKEN")! },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          data.message.id = data.message.id.toString();
          setDialog(data.message);
          setOpenView(true);
        }
      });
  };

  const handleImage = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ): void => {
    e.preventDefault();
    setImage({
      name: e.currentTarget.getAttribute("data-image-name") as string,
      open: true,
    });
  };

  const handleDialogClose = (): void => {
    setOpenView(false);
  };

  const handleImageClose = (): void => {
    setImage({ ...image, open: false });
  };

  const handleDeleteClose = (): void => {
    setOpenDelete(false);
  };

  const showMessagesWithMediaOnly = (): void => {
    setMediaOnly(true);
  };

  const showAllMessages = (): void => {
    setMediaOnly(false);
  };

  return (
    <>
      {messages && (
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
          <ViewMessage
            color={color}
            message={dialog}
            open={openView}
            user={user}
            handleClose={handleDialogClose}
          />
          <DeleteMessage
            open={openDelete}
            socket={socket}
            handleClose={handleDeleteClose}
            messageId={messageId}
          />
          <ViewImage
            open={image.open}
            handleClose={handleImageClose}
            imageName={image.name}
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
          {messages
            .filter((message) => {
              if (mediaOnly) {
                if (message.file) {
                  return message;
                }
              } else {
                return message;
              }
            })
            .map((message: Message) => (
              <Card
                className={classes.message}
                key={message.id}
                raised={true}
                onClick={handleDialogOpen}
                data-id={message.id}
              >
                <CardContent>
                  <Grid container spacing={1}>
                    <Grid item xs={breakpoint ? 1 : 2}>
                      <Gravatar
                        size={breakpoint ? 8 : 6}
                        email={message.user.email}
                      />
                    </Grid>
                    <Grid item xs={breakpoint ? 11 : 10}>
                      <Grid container spacing={1}>
                        <Grid item xs={12}>
                          {user?.pinned?.id === message.id ? (
                            <Typography
                              variant="body2"
                              className={classes.caption}
                            >
                              <FontAwesomeIcon
                                icon={faThumbtack}
                                className={`color-${color}`}
                              />{" "}
                              Pinned Message
                            </Typography>
                          ) : null}
                          {message.reposted ? (
                            <Typography
                              variant="body2"
                              className={classes.caption}
                            >
                              <RepeatIcon className={`color-${color}`} />
                              {user?.displayname} Reposted
                            </Typography>
                          ) : null}
                          <Typography display="inline">
                            <Link
                              to={`/@${message.user.username}`}
                              className={`username-link-${color}`}
                            >
                              <Box
                                component="span"
                                className={classes.displayname}
                              >
                                {message.user.displayname === undefined
                                  ? message.user.username
                                  : message.user.displayname}
                              </Box>{" "}
                              <Box
                                component="span"
                                className={classes.username}
                              >
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
                            {message.data
                              .split(" ")
                              .map((word: string) => formatText(word))}
                          </Typography>
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
                            <Box>
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
                              <Typography className={classes.inline}>
                                {message.likes.length}
                              </Typography>
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
                              <Typography className={classes.inline}>
                                {message.reposts.length}
                              </Typography>
                            </Box>
                            <Box>
                              {user?.isDifferentUser ? null : (
                                <Tooltip title={"Pin"} arrow>
                                  <IconButton
                                    onClick={handlePin}
                                    data-id={message.id}
                                    className={`pin-${color}`}
                                  >
                                    <FontAwesomeIcon icon={faThumbtack} />
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
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
        </InfiniteScroll>
      )}
    </>
  );
};

export default Messages;
