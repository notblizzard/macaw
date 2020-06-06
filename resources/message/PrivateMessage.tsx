import React, { useState, useEffect, useContext } from "react";
import Gravatar from "../util/Gravatar";
import Moment from "../util/Moment";
import {
  makeStyles,
  Typography,
  Tabs,
  Tab,
  Dialog,
  DialogContent,
  Box,
  Button,
  TextField,
  fade,
  lighten,
  Theme,
  Hidden,
  Drawer,
  useTheme,
  useMediaQuery,
  IconButton,
  DialogTitle,
  Grid,
} from "@material-ui/core";
import { Link } from "react-router-dom";
import { User } from "../../models";
import Cookies from "js-cookie";
import DarkModeContext from "../DarkMode";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFeatherAlt } from "@fortawesome/free-solid-svg-icons";
import { People as PeopleIcon } from "@material-ui/icons";

interface StyleProps {
  darkMode: boolean;
  color?: string;
  breakpoint?: boolean;
}

interface A11yProps {
  id: string;
  "aria-controls": string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface PrivateMessageProps {
  socket: SocketIOClient.Socket;
}

interface Conversation {
  id: number;
  users: {
    username: string;
    email: string;
  }[];
  messages: {
    createdAt: string;
    data: string;
    user: {
      username: string;
      email: string;
    };
  }[];
}

interface NewMessage {
  user: User;
  data: string;
  conversation: Conversation;
  createdAt: string;
}
const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1,
    display: "flex",
    //height: 400,
    //paddingTop: theme.spacing(0),
    overflow: "hidden",
  },
  submitButton: {
    height: "3.4rem",
  },
  tabPanels: (props: StyleProps) => ({
    overflow: "auto",
    height: 380,
    width: "100%",
    padding: props.breakpoint ? "32px" : "0px",
  }),
  tab: (props: StyleProps) => ({
    color: props.darkMode ? "#dfe9f4" : "#192a3d",
  }),
  modal: (props: StyleProps) => ({
    backgroundColor: props.darkMode ? "#192a3d" : "#dfe9f4",
    background: props.darkMode ? "#192a3d" : "#dfe9f4",
    color: props.darkMode ? "#dfe9f4" : "#192a3d",
    fontSize: "10rem",
    textAlign: "center",
  }),
  tabs: {
    color: "#eee",
    width: "40%",
  },
  tabColor: {
    backgroundColor: "#0a1b26",
  },
  message: (props: StyleProps) => ({
    backgroundColor: lighten(props.darkMode ? "#192a3d" : "#dfe9f4", 0.1),
    color: props.darkMode ? "#dfe9f4" : "#192a3d",
    borderRadius: "8px",
    margin: theme.spacing(1),
    wordWrap: "break-word",
    padding: theme.spacing(1),
  }),
  messageBox: (props: StyleProps) => ({
    maxWidth: props.breakpoint ? "40%" : "80%",
  }),
  toggleDrawer: (props: StyleProps) => ({
    color: props.darkMode ? "#dfe9f4" : "#192a3d",
  }),
  input: (props: StyleProps) => ({
    color: "#eee",
    width: props.breakpoint ? "80%" : "100%",

    "& .MuiFormLabel-root": {
      color: "#79838a",
    },
    "& .MuiOutlinedInput-root": {
      backgroundColor: fade("#66d0f9", 0.1),
      color: "#eee",
      "&.Mui-focused fieldset": {
        borderColor: "#09a6f4",
        color: "#eee",
      },
    },
    "&:focus": {
      borderColor: "#eee",
    },
  }),
  tabPanel: (props: StyleProps) => ({
    width: props.breakpoint ? "60%" : "100%",
  }),
  newUser: {
    color: "#eee",
    "& .MuiFormLabel-root": {
      color: "#79838a",
    },
    "& .MuiOutlinedInput-root": {
      backgroundColor: fade("#66d0f9", 0.1),
      color: "#eee",
      "&.Mui-focused fieldset": {
        borderColor: "#09a6f4",
        color: "#eee",
      },
    },
    "&:focus": {
      borderColor: "#eee",
    },
  },
  dialogTitle: {
    padding: theme.spacing(0),
    display: "flex",
  },
  drawer: (props: StyleProps) => ({
    backgroundColor: props.darkMode ? "#080b17" : "#dff0f7",
    color: props.darkMode ? "#dff0f7" : "#080b17",
    padding: theme.spacing(1),
  }),
}));

const TabPanel = (props: TabPanelProps): JSX.Element => {
  const theme = useTheme();
  // true = desktop, false = mobile
  const breakpoint = useMediaQuery(theme.breakpoints.up("sm"));
  const darkMode = useContext(DarkModeContext);

  const classes = useStyles({ darkMode, breakpoint: breakpoint });
  const { children, value, index, ...other } = props;
  return (
    <Typography
      component="div"
      role="tabpanel"
      className={classes.tabPanel}
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={4} className={classes.tabPanels}>
          {children}
        </Box>
      )}
    </Typography>
  );
};

const PrivateMessage = ({ socket }: PrivateMessageProps): JSX.Element => {
  const color = Cookies.get("color") || "default";
  const theme = useTheme();
  // true = desktop, false = mobile

  const breakpoint = useMediaQuery(theme.breakpoints.up("sm"));
  const [drawer, setDrawer] = useState(false);
  const darkMode = useContext(DarkModeContext);
  const [value, setValue] = useState(0);
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");
  const [newUser, setNewUser] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>(null!);
  const classes = useStyles({ darkMode, color, breakpoint });

  const scrollToBottom = (): void => {
    const element: HTMLElement | null = document.getElementById("messageRef");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetch("/api/conversation/conversations", {
      headers: { "X-CSRF-TOKEN": Cookies.get("XSRF-TOKEN")! },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          console.log(data.user.conversations);
          setConversations(data.user.conversations);
          setUsername(data.user.username);
          setUserId(data.user.id);
        }
      });
    return (): void => {
      scrollToBottom();
    };
  }, [value, open]);

  useEffect(() => {
    socket.on("new private message", (data: NewMessage) => {
      const updatedConversations = conversations.map((conversation) => {
        if (conversation.id === data.conversation.id) {
          conversation.messages.push(data);
        }
        return conversation;
      });

      setConversations(updatedConversations);
    });
    return (): void => {
      socket.off("new private message");
      scrollToBottom();
    };
  }, [conversations, socket]);

  const toggleDrawer = (): void => {
    setDrawer(!drawer);
  };
  const a11yProps = (index: number): A11yProps => {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  };

  const handleTabChange = (
    e: React.ChangeEvent<{}>,
    newValue: number,
  ): void => {
    setValue(newValue);
  };

  const handleNewMessageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setNewMessage(e.target.value);
  };

  const handleNewUserChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setNewUser(e.target.value);
  };

  const handleNewMessageSubmit = (
    e: React.ChangeEvent<HTMLFormElement>,
  ): void | boolean => {
    e.preventDefault();
    if (newMessage.trim().length === 0) return false;
    const conversationId: string = e.currentTarget.getAttribute("data-id")!;
    socket.emit("new private message", {
      conversationId,
      userId,
      data: newMessage,
    });
    scrollToBottom();
  };

  const handleNewConversationSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    fetch("/api/conversation/new-conversation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": Cookies.get("XSRF-TOKEN")!,
      },
      body: JSON.stringify({ username: newUser }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setConversations([...conversations.concat(data.conversation)]);
        }
      });
  };

  return (
    <>
      {conversations && (
        <>
          <Hidden smUp>
            <IconButton onClick={toggleDrawer} className={classes.toggleDrawer}>
              <PeopleIcon />
            </IconButton>
          </Hidden>
          <Hidden xsDown>
            <Box className={classes.root}>
              <Tabs
                orientation="vertical"
                value={value}
                onChange={handleTabChange}
                className={classes.tabs}
                classes={{
                  indicator: `indicator-${color}`,
                }}
              >
                {conversations.map((conversation, index) => (
                  <Tab
                    key={conversation.id}
                    label={
                      <Box display="flex" flexDirection="row">
                        <Gravatar
                          email={
                            conversation.users.filter(
                              (user) => user.username !== username,
                            )[0].email
                          }
                          size={4}
                        />
                        <Typography className={classes.tab}>
                          {
                            conversation.users.filter(
                              (user) => user.username !== username,
                            )[0].username
                          }
                        </Typography>
                      </Box>
                    }
                    {...a11yProps(index)}
                  />
                ))}
                <form onSubmit={handleNewConversationSubmit}>
                  <Box display="flex" flexDirection="row" alignItems="center">
                    <TextField
                      name="newPrivateMessage"
                      onChange={handleNewUserChange}
                      variant="outlined"
                      fullWidth
                      label="New Conversation"
                      classes={{ root: classes.newUser }}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      className={`button-${color} ${classes.submitButton}`}
                    >
                      Submit
                    </Button>
                  </Box>
                </form>
              </Tabs>
              {conversations.map((conversation, index) => (
                <TabPanel value={value} index={index} key={conversation.id}>
                  {conversation.messages.map((message) => (
                    <>
                      <Box
                        display="flex"
                        style={{ margin: "8px" }}
                        flexDirection={
                          message?.user?.username === username
                            ? "row-reverse"
                            : "row"
                        }
                      >
                        <Link to={`/@${message?.user?.username}`}>
                          <Gravatar email={message?.user?.email} size={4} />
                        </Link>

                        <Box className={classes.messageBox} display="block">
                          <Typography
                            variant="body1"
                            className={classes.message}
                          >
                            {" "}
                            {message?.data}
                          </Typography>
                          <Moment time={message?.createdAt} profile={false} />
                        </Box>
                      </Box>
                    </>
                  ))}
                  <form
                    onSubmit={handleNewMessageSubmit}
                    data-id={conversation?.id}
                    style={{ padding: "8px" }}
                  >
                    <TextField
                      name="newPrivateMessage"
                      onChange={handleNewMessageChange}
                      variant="outlined"
                      label="Message"
                      value={newMessage}
                      classes={{ root: classes.input }}
                    />

                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      className={`button-${color} ${classes.submitButton}`}
                    >
                      Send <FontAwesomeIcon icon={faFeatherAlt} />
                    </Button>
                    <div id="messageRef"></div>
                  </form>
                </TabPanel>
              ))}
            </Box>
          </Hidden>
          <Hidden smUp>
            <Drawer
              anchor={"left"}
              open={drawer}
              onClose={toggleDrawer}
              classes={{
                paper: classes.drawer,
              }}
            >
              <Tabs
                orientation="vertical"
                value={value}
                onChange={handleTabChange}
                className={classes.tabs}
                classes={{
                  indicator: `indicator-${color}`,
                }}
              >
                {conversations?.map((conversation, index) => (
                  <Tab
                    key={conversation?.id}
                    label={
                      <Typography display="inline" className={classes.tab}>
                        <Gravatar
                          email={
                            conversation?.users?.filter(
                              (x) => x?.username !== username,
                            )[0].email
                          }
                          size={4}
                        />
                        {
                          conversation?.users?.filter(
                            (x) => x?.username !== username,
                          )[0].username
                        }
                      </Typography>
                    }
                    {...a11yProps(index)}
                  />
                ))}
                <form onSubmit={handleNewConversationSubmit}>
                  <TextField
                    name="newPrivateMessage"
                    onChange={handleNewUserChange}
                    variant="outlined"
                    fullWidth
                    label="New Conversation"
                    classes={{ root: classes.newUser }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    className={`button-${color} ${classes.submitButton}`}
                  >
                    Submit
                  </Button>
                </form>
              </Tabs>
            </Drawer>

            {conversations?.map((conversation, index) => (
              <TabPanel value={value} index={index} key={conversation?.id}>
                {conversation.messages.map((message) => (
                  <>
                    <Box
                      display="flex"
                      style={{ margin: "8px" }}
                      flexDirection={
                        message?.user?.username === username
                          ? "row-reverse"
                          : "row"
                      }
                    >
                      <Link to={`/@${message.user.username}`}>
                        <Gravatar email={message.user.email} size={4} />
                      </Link>

                      <Box className={classes.messageBox} display="block">
                        <Typography variant="body1" className={classes.message}>
                          {" "}
                          {message?.data}
                        </Typography>
                        <Moment time={message.createdAt} profile={false} />
                      </Box>
                    </Box>
                  </>
                ))}
                <form
                  onSubmit={handleNewMessageSubmit}
                  data-id={conversation?.id}
                  style={{ padding: "8px" }}
                >
                  <TextField
                    name="newPrivateMessage"
                    onChange={handleNewMessageChange}
                    variant="outlined"
                    label="Message"
                    value={newMessage}
                    classes={{ root: classes.input }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    className={`button-${color} ${classes.submitButton}`}
                    fullWidth
                  >
                    Send <FontAwesomeIcon icon={faFeatherAlt} />
                  </Button>
                  <div id="messageRef"></div>
                </form>
              </TabPanel>
            ))}
          </Hidden>
        </>
      )}
    </>
  );
};

export default PrivateMessage;
