import { passport } from "../authorization";
import { Router, Request } from "express";
import jwt from "jsonwebtoken";

const router = Router();

interface RequestUser extends Request {
  id: number;
  email: string;
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
  (req, res) => {
    const token = jwt.sign(
      { id: (req.user as RequestUser).id },
      process.env.JWT_SECRET_KEY as string,
    );
    res.cookie("token", token, {
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1),
      secure: false,
      httpOnly: true,
    });
    return res.json({
      success: true,
      token,
      email: (req.user as RequestUser).email,
    });
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
  (req, res) => {
    const token = jwt.sign(
      { id: (req.user as RequestUser).id },
      process.env.JWT_SECRET_KEY as string,
    );
    res.cookie("token", token, {
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1),
      secure: false,
      httpOnly: true,
    });
    return res.json({
      success: true,
      token,
      email: (req.user as RequestUser).email,
    });
  },
);

export default router;
