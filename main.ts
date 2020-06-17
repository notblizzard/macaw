import "reflect-metadata";
import express from "express";
import { passport } from "./authorization";
import http from "http";
/*
import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";
*/
import body from "body-parser";
import { message, auth, oauth, user, conversation } from "./routes";
import cookie from "cookie-parser";
import path from "path";
import helmet from "helmet";
import csurf from "csurf";
import connectFlash from "connect-flash";
import websocket from "./websocket";
import socketio from "socket.io";
import fs from "fs";
import { createConnection } from "typeorm";

const PORT = process.env.PORT || 7000;

createConnection().then(() => {
  const app = express();

  // const RedisStore = connectRedis(session);
  // const redisClient = redis.createClient(process.env.REDIS_URL || "");

  app.use(cookie());
  app.use(body.urlencoded({ extended: false }));
  app.use(body.json());

  /*
  app.use(
    session({
      store: new RedisStore({ client: redisClient }),
      secret: process.env.SECRET_KEY as string,
      resave: false,
      cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 1,
      },
      saveUninitialized: true,
    }),
  );
  */

  app.use(csurf({ cookie: true }));

  app.use(helmet());
  app.use(passport.initialize());
  app.use(passport.session());

  const server = http.createServer(app);
  const io = socketio(server);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(connectFlash());
  app.set("views", path.join(__dirname, "views/"));

  app.use(oauth);
  app.use(user);
  app.use(auth);
  app.use(message);
  app.use(conversation);

  app.use(express.static("dist"));
  app.use("/uploads", express.static("uploads"));

  app.get("*", (req, res) => {
    res.cookie("XSRF-TOKEN", req.csrfToken(), {
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14 * 1),
      secure: false,
      httpOnly: false,
      sameSite: "strict",
    });
    res.sendFile("/views/index.html", { root: path.join(__dirname, ".") });
  });

  websocket(io);

  // create uploads directory.
  if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
  }

  server.listen(PORT, () => console.log(`Running on port ${PORT}.`));
});
