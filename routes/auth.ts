import { Router } from "express";
import { passport, register } from "../authorization";
import jwt from "jsonwebtoken";
import { User } from "../models";

interface RequestUser {
  id: number;
  username: string;
  email: string;
  color: string;
}

const router = Router();
//

router.post("/login", passport.authenticate("local"), (req, res) => {
  const token = jwt.sign(
    { id: (req.user as RequestUser).id },
    process.env.JWT_SECRET_KEY as string,
  );
  res.cookie("token", token, {
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14 * 1),
    secure: false,
    httpOnly: true,
  });
  res.cookie("email", (req.user as RequestUser).email, {
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14 * 1),
    secure: false,
    httpOnly: false,
  });
  res.cookie("color", (req.user as RequestUser).color, {
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14 * 1),
    secure: false,
    httpOnly: false,
  });
  return res.json({
    success: true,
    token,
    email: (req.user as RequestUser).email,
  });
});

router.get("/logout", (req, res) => {
  req.logout((done) => {
    return;
  });
  res.clearCookie("token");
  res.clearCookie("email");
  return res.json({ success: true });
});

router.post("/register", (req, res) => {
  if (req.user) return res.json({ error: "already logged in" });
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;
  register(
    username,
    password,
    email,
    (err: string[] | null, user: User | undefined) => {
      if (err) return res.json({ ok: "ok" });
      req.login(user as Express.User, (err) => {
        if (err) return false;
        const token = jwt.sign(
          { id: (req.user as RequestUser).id },
          process.env.JWT_SECRET_KEY as string,
        );
        return res.json({ success: true, token });
      });
    },
  );
});

export default router;
