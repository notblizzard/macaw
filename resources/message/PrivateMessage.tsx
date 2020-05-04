import React, { useState, useEffect, useRef } from "react";
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
} from "@material-ui/core";
import axios from "axios";
import { Link } from "react-router-dom";
import io from "socket.io-client";
import PropTypes from "prop-types";

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
    display: "flex",
    height: 400,
    overflow: "hidden",
    backgroundColor: "#132436", //theme.palette.background.paper,
  },
  tabpanels: {
    overflow: "auto",
    height: 380,
    width: "100%",
  },
  dialog: {
    backgroundColor: "#132436",
    padding: 0,
  },
  tabs: {
    color: "#eee",
  },
  tabColor: {
    backgroundColor: "#0a1b26",
  },
  message: {
    backgroundColor: "#b3c1d0",
    color: "#222",
    borderRadius: "8px",
    marginLeft: "4px",
    marginRight: "4px",
    wordWrap: "break-word",
    padding: "8px",
  },
  messageBox: {
    maxWidth: "40%",
  },
  input: {
    color: "#eee",
    width: "80%",

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
}));

interface A11yProps {
  id: string;
  "aria-controls": string;
}
function TabPanel(props): JSX.Element {
  const classes = useStyles();
  // eslint-disable-next-line react/prop-types
  const { children, value, index, ...other } = props;
  return (
    <Typography
      component="div"
      role="tabpanel"
      style={{ width: "80%" }}
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={4} className={classes.tabpanels}>
          {children}
        </Box>
      )}
    </Typography>
  );
}

const socketio = io();
const PrivateMessage = ({ open, onClose, color }): JSX.Element => {
  const { current: socket } = useRef(socketio);
  const [value, setValue] = useState(0);
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState(0);
  const [newUser, setNewUser] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [conversations, setConversations] = useState([]);
  const messageRef = useRef(null);
  const classes = useStyles();

  const a11yProps = (index: number): A11yProps => {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  };

  const scrollToBottom = (): void => {
    if (messageRef.current !== null) {
      messageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  useEffect(() => {
    axios.get("/api/conversation/conversations").then((res) => {
      if (res.data.success) {
        socket.emit("authorized", { id: res.data.user.id });
        setConversations(res.data.user.conversations);
        setUsername(res.data.user.username);
        setUserId(res.data.user.id);
      }
    });
  }, []);

  useEffect(() => {
    socket.open();
    socket.on("new message", (data) => {
      const updatedConversations = conversations.map((conversation) => {
        if (conversation.id === data.conversation.id) {
          conversation.messages.push(data);
        }
        return conversation;
      });

      setConversations(updatedConversations);
      scrollToBottom();
    });
    return () => socket.off("new message");
  }, [conversations]);

  const handleTabChange = (e, newValue): void => {
    setValue(newValue);
    scrollToBottom();
  };

  const handleNewMessageChange = (e): void => {
    setNewMessage(e.target.value);
  };

  const handleNewUserChange = (e): void => {
    setNewUser(e.target.value);
  };

  const handleNewMessageSubmit = (e): void | boolean => {
    e.preventDefault();
    if (newMessage.trim().length === 0) return false;
    const conversationId: string = e.currentTarget.getAttribute("data-id");
    socket.emit("new message", { conversationId, userId, data: newMessage });
    //setNewMessage("");
  };
  const handleNewConversationSubmit = async (e): Promise<void> => {
    e.preventDefault();
    await axios.post("/api/conversation/new-conversation", {
      username: newUser,
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
        paper: classes.dialog,
      }}
    >
      <DialogContent className={classes.root}>
        <Tabs
          orientation="vertical"
          value={value}
          onChange={handleTabChange}
          className={classes.tabs}
          classes={{
            indicator: `private-message-tab-indicator-${color}`,
          }}
        >
          {conversations.map((conversation, index) => (
            <Tab
              key={conversation?.id}
              label={
                <Typography display="inline">
                  <Gravatar
                    email={
                      conversation?.users?.filter(
                        (x) => x?.username !== username,
                      )[0].email
                    }
                    size={2}
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
                    message?.user?.username === username ? "row-reverse" : "row"
                  }
                >
                  <Link to={`/@${message?.user?.username}`}>
                    <Gravatar email={message?.user?.email} size={2} />
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
                style={{ padding: "15px 24px" }}
              >
                Send <i className="fas fa-feather-alt"></i>
              </Button>
            </form>
          </TabPanel>
        ))}
      </DialogContent>
    </Dialog>
  );
};

PrivateMessage.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  color: PropTypes.string,
};

export default PrivateMessage;
