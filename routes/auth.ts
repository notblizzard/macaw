import { Router, Request } from "express";
import { passport, register } from "../authorization";
import jwt from "jsonwebtoken";

const router = Router();

interface RequestUser extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
    color: string;
  };
}

router.post(
  "/login",
  passport.authenticate("local"),
  (req: RequestUser, res) => {
    const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET_KEY);
    res.cookie("token", token, {
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14 * 1),
      secure: false,
      httpOnly: true,
    });
    res.cookie("email", req.user.email, {
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14 * 1),
      secure: false,
      httpOnly: false,
    });
    res.cookie("color", req.user.color, {
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14 * 1),
      secure: false,
      httpOnly: false,
    });
    return res.json({ success: true, token, email: req.user.email });
  },
);

router.get("/logout", (req, res) => {
  req.logout();
  res.clearCookie("token");
  res.clearCookie("email");
  return res.json({ success: true });
});

router.post("/register", (req: RequestUser, res) => {
  if (req.user) return res.json({ error: "already logged in" });
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;
  register(username, password, email, (err: any, user: Express.User) => {
    if (err) return res.json({ ok: "ok" });
    req.login(user, (err) => {
      if (err) return false;
      const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET_KEY);
      return res.json({ success: true, token });
    });
  });
});

export default router;
