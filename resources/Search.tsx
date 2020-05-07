import React, { useState, useEffect } from "react";
import axios from "axios";
import UserInfoCard from "./user/UserInfoCard";
import {
  Grid,
  makeStyles,
  CircularProgress,
  Container,
  Box,
  Theme,
  Card,
  CardContent,
  Typography,
  CardMedia,
  IconButton,
  Tooltip,
  TextField,
  fade,
} from "@material-ui/core";
import {
  Repeat as RepeatIcon,
  StarBorder as StarBorderIcon,
  Star as StarIcon,
  Delete as DeleteIcon,
} from "@material-ui/icons";
import InfiniteScroll from "react-infinite-scroller";
import Cookies from "js-cookie";
import Gravatar from "./util/Gravatar";
import Moment from "./util/Moment";
import UserTooltip from "./user/UserTooltip";

import { Link } from "react-router-dom";
import ViewMessage from "./message/ViewMessage";
import DeleteMessage from "./message/DeleteMessage";
import ViewImage from "./message/ViewImage";

const useStyles = makeStyles((theme: Theme) => ({
  input: {
    color: "#eee",
    borderColor: "#eee !important",

    "& .MuiFormLabel-root": {
      color: "#79838a",
    },

    "& .MuiOutlinedInput-root": {
      marginBottom: "4rem",
      color: "#eee",
      borderColor: "#eee !important",
      backgroundColor: fade("#66d0f9", 0.1),

      "&.Mui-focused fieldset": {
        borderColor: "#09a6f4",
        color: "#eee",
      },
    },
    //width: "20rem",
    "&:focus": {
      borderColor: "#eee",
    },
  },
  mediaToggles: {
    padding: "1rem",
    cursor: "pointer",
  },
  card: {
    //padding: theme.spacing(2),
    backgroundColor: "#193344",
    //maxWidth: "20rem",
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
}));
interface User {
  id: string;
  color: string;
  createdAt: string;
  username: string;
  displayname: string;
  email: string;
  description: string;
  location: string;
  link: string;
  pinned: Message;
  followers: [];
  following: [];
  isDifferentUser?: boolean;
  messages: [];
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
const Search = (): JSX.Element => {
  const classes = useStyles();
  // so the user can toggle between all messages and media only without having to call the api every time
  const color: string = Cookies.get("color") || "default";
  const urlParams: URLSearchParams = new URLSearchParams(
    document.location.search.substring(1),
  );
  const [openImage, setOpenImage] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [messageId, setMessageId] = useState("");
  const [imageName, setImageName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [messages, setMessages] = useState<Message[]>([] as Message[]);
  const [users, setUsers] = useState<User[]>([] as User[]);
  const [page, setPage] = useState(1);
  const [user, setUser] = useState<User>({} as User);
  const [dialog, setDialog] = useState<Message>({} as Message);
  useEffect(() => {
    axios(`/api/message/search${location.search}&page=${page}`).then((res) => {
      if (res.data.success) {
        setMessages(res.data.messages);
        setUsers(res.data.users);
        setPage(page + 1);
      }
    });
  }, []);

  const loadMoreMessages = (): void => {
    axios
      .get(`/api/message/search${location.search}&page=${page}`)
      .then((res) => {
        if (res.data.success) {
          setPage(page + 1);
          setUser(res.data.user);
          setMessages(messages.concat(res.data.messages));
        } else {
          setHasMore(false);
        }
        setIsLoading(false);
      });
  };

  const handleLike = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ): void => {
    const messageId = e.currentTarget.getAttribute("data-id");
    //e.preventDefault();
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

  const handlePin = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ): Promise<void> => {
    const messageId: string = e.currentTarget.getAttribute("data-id")!;
    await axios.post("/api/message/pin", {
      id: messageId,
    });
  };

  const handleDelete = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ): void => {
    const messageId = e.currentTarget.getAttribute("data-id")!;
    setMessageId(messageId);
    setOpenDelete(true);
  };

  const handleRepost = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ): void => {
    const messageId = e.currentTarget.getAttribute("data-id")!;
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

  const handleDialogOpen = (e: any): void | boolean => {
    const tagNames: string[] = ["a", "button", "i", "path", "svg", "span"];
    const imageClassName = "MuiCardMedia-root";
    // prevent dialog on clicking like/repost/etc
    if (tagNames.includes(e.target.tagName.toLowerCase())) return false;
    // prevent dialog on clicking image
    if (e.target.classList.contains(imageClassName)) return false;
    const messageId: string = e.currentTarget.getAttribute("data-id");
    axios.get(`/api/message/dialog?id=${messageId}`).then((res) => {
      if (res.data.success) {
        setDialog(res.data.message);
        setOpenView(true);
      }
    });
  };

  const handleImage = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ): void => {
    e.preventDefault();
    setImageName(e.currentTarget.getAttribute("data-image-name")!);
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
      <form method="GET" action="/search">
        <TextField
          name="qs"
          id="outlined-basic"
          label="Search"
          fullWidth
          variant="outlined"
          classes={{
            root: classes.input,
          }}
        />
      </form>
      <Typography variant="h4" style={{ paddingBottom: "4rem" }}>
        Search Results for {`"${urlParams.get("qs")}"`}{" "}
      </Typography>
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
        {users ? (
          <Grid container spacing={8}>
            {users.map((user) => (
              <Grid item xs={3} key={user.id}>
                <UserInfoCard user={user} color={color} />
              </Grid>
            ))}
          </Grid>
        ) : null}
        {messages.map((message) => (
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
                            ? message.messageCreatedAt!
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
                          title="test"
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
        ))}
      </div>
    </InfiniteScroll>
  );
};

export default Search;
