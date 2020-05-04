import { passport, register } from "../authorization";
import { Router, Request } from "express";
import jwt from "jsonwebtoken";

const router = Router();

interface RequestUser extends Request {
  user: any;
}
router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["https://www.googleapis.com/auth/plus.login", "profile", "email"],
  }),
);
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req: RequestUser, res) => {
    const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET_KEY);
    res.cookie("token", token, {
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1),
      secure: false,
      httpOnly: true,
    });
    return res.json({ success: true, token, email: req.user.email });
  },
);

router.get(
  "/auth/github",
  passport.authenticate("github", {
    scope: ["user"],
  }),
);

router.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  (req: RequestUser, res) => {
    const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET_KEY);
    res.cookie("token", token, {
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1),
      secure: false,
      httpOnly: true,
    });
    return res.json({ success: true, token, email: req.user.email });
  },
);

export default router;
