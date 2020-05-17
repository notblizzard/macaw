import React, { useState, useEffect, useRef, useContext } from "react";
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
} from "@material-ui/core";
import { Link } from "react-router-dom";
//import io from "socket.io-client";
import PropTypes from "prop-types";
import { User } from "../../models";
import Cookies from "js-cookie";
import DarkModeContext from "../DarkMode";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFeatherAlt } from "@fortawesome/free-solid-svg-icons";
import { People as PeopleIcon } from "@material-ui/icons";

//const socketio = io();

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
  open: boolean;
  onClose: () => void;
  socketio: SocketIOClient.Socket;
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
    height: 400,
    overflow: "hidden",
  },
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  tabPanels: (props: StyleProps) => ({
    overflow: "auto",
    height: 380,
    width: "100%",
    padding: props.breakpoint ? "32px" : "0px",
  }),
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  tab: (props: StyleProps) => ({
    color: props.darkMode ? "#dfe9f4" : "#192a3d",
  }),
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  modal: (props: StyleProps) => ({
    backgroundColor: props.darkMode ? "#192a3d" : "#dfe9f4",
    background: props.darkMode ? "#192a3d" : "#dfe9f4",
    color: props.darkMode ? "#dfe9f4" : "#192a3d",
    fontSize: "10rem",
    textAlign: "center",
  }),
  tabs: {
    color: "#eee",
  },
  tabColor: {
    backgroundColor: "#0a1b26",
  },
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  message: (props: StyleProps) => ({
    backgroundColor: lighten(props.darkMode ? "#192a3d" : "#dfe9f4", 0.1),
    color: props.darkMode ? "#dfe9f4" : "#192a3d",
    borderRadius: "8px",
    margin: theme.spacing(1),
    wordWrap: "break-word",
    padding: theme.spacing(1),
  }),
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  messageBox: (props: StyleProps) => ({
    maxWidth: props.breakpoint ? "40%" : "80%",
  }),

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  toggleDrawer: (props: StyleProps) => ({
    color: props.darkMode ? "#dfe9f4" : "#192a3d",
  }),

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  tabPanel: (props: StyleProps) => ({
    width: props.breakpoint ? "40%" : "100%",
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
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
  // eslint-disable-next-line react/prop-types
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

const PrivateMessage = ({
  open,
  onClose,
  socketio,
}: PrivateMessageProps): JSX.Element => {
  const color = Cookies.get("color") || "default";
  const theme = useTheme();
  // true = desktop, false = mobile

  const breakpoint = useMediaQuery(theme.breakpoints.up("sm"));
  const [drawer, setDrawer] = useState(false);
  const darkMode = useContext(DarkModeContext);
  const { current: socket } = useRef(socketio);
  const [value, setValue] = useState(0);
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");
  const [newUser, setNewUser] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>(
    [] as Conversation[],
  );
  const messageRef = useRef<HTMLInputElement>(null);
  const classes = useStyles({ darkMode, color, breakpoint });

  const scrollToBottom = (): void => {
    if (messageRef.current !== null) {
      //messageRef.current.scrollIntoView({ behavior: "smooth" });
      window.scrollTo(0, messageRef?.current?.offsetTop);
    }
  };

  useEffect(() => {
    fetch("/api/conversation/conversations", {
      headers: { "X-CSRF-TOKEN": Cookies.get("XSRF-TOKEN")! },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setConversations(data.user.conversations);
          setUsername(data.user.username);
          setUserId(data.user.id);
        }
      });
  }, []);

  useEffect(() => {
    socket.on("new private message", (data: NewMessage) => {
      const updatedConversations = conversations.map((conversation) => {
        if (conversation.id === data.conversation.id) {
          conversation.messages.push(data);
        }
        return conversation;
      });

      setConversations(updatedConversations);
      scrollToBottom();
    });
    return (): void => {
      socket.off("new private message");
    };
  }, [conversations]);

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
    scrollToBottom();
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
    const conversationId: string = e.currentTarget.getAttribute(
      "data-id",
    ) as string;
    socket.emit("new private message", {
      conversationId,
      userId,
      data: newMessage,
    });
  };

  const handleNewConversationSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    await fetch("/api/conversation/new-conversation", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": Cookies.get("XSRF-TOKEN")!,
      },
      body: JSON.stringify({ username: newUser }),
    });
  };

  return (
    <Dialog
      open={open}
      maxWidth="lg"
      fullWidth={true}
      onClose={onClose}
      scroll="body"
      onEnter={scrollToBottom}
      classes={{
        paper: classes.modal,
      }}
    >
      <Hidden smUp>
        <DialogTitle className={classes.dialogTitle}>
          <IconButton onClick={toggleDrawer} className={classes.toggleDrawer}>
            <PeopleIcon />
          </IconButton>
        </DialogTitle>
      </Hidden>
      <DialogContent className={classes.root}>
        <Hidden xsDown>
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
            </form>
          </Tabs>
          {conversations.map((conversation, index) => (
            <TabPanel value={value} index={index} key={conversation?.id}>
              {conversation?.messages?.map((message) => (
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
                      <Typography variant="body1" className={classes.message}>
                        {" "}
                        {message?.data}
                      </Typography>
                      <Moment time={message?.createdAt} profile={false} />
                      <div ref={messageRef}></div>
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
                  className={`button-${color}`}
                >
                  Send <FontAwesomeIcon icon={faFeatherAlt} />
                </Button>
              </form>
            </TabPanel>
          ))}
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
              {conversations.map((conversation, index) => (
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
              </form>
            </Tabs>
          </Drawer>

          {conversations.map((conversation, index) => (
            <TabPanel value={value} index={index} key={conversation?.id}>
              {conversation?.messages?.map((message) => (
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
                      <Typography variant="body1" className={classes.message}>
                        {" "}
                        {message?.data}
                      </Typography>
                      <Moment time={message?.createdAt} profile={false} />
                      <div ref={messageRef}></div>
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
                  className={`button-${color}`}
                  fullWidth
                >
                  Send <FontAwesomeIcon icon={faFeatherAlt} />
                </Button>
              </form>
            </TabPanel>
          ))}
        </Hidden>
      </DialogContent>
    </Dialog>
  );
};

PrivateMessage.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
};

export default PrivateMessage;
