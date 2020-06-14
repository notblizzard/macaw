import passport from "passport";
import { User } from "./models";
import bcrypt from "bcrypt";
import { Strategy as LocalStrategy } from "passport-local";
import passportGoogle from "passport-google-oauth20";
import Github, { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as JwtStrategy } from "passport-jwt";
import { validate } from "class-validator";
import { Request } from "express";

interface PassportUser {
  id: string;
}

interface GithubProfile extends Github.Profile {
  emails: [
    {
      value: string;
    },
  ];
  id: string;
  username: string;
  displayName: string;
}

interface GoogleProfile extends passportGoogle.Profile {
  emails?: { value: string; type?: string | undefined }[] | undefined;
  id: string;
  username?: string;
  displayName: string;
}

const GoogleStrategy = passportGoogle.Strategy;

function register(
  username: string,
  password: string,
  email: string,
  next: {
    (err: string[] | null, user: User | undefined): void;
  },
): void {
  const user: User = new User();
  user.username = username;
  user.password = password;
  user.email = email;
  validate(user, { validationError: { target: false } }).then(
    async (errors) => {
      if (errors.length > 0) {
        const errorList = errors.flatMap((x) => Object.values(x.constraints));
        return next(errorList, undefined);
      }
      bcrypt.hash(password, 10, async (_err, hash) => {
        user.password = hash;
        await user.save();
        return next(null, user);
      });
    },
  );
}

passport.serializeUser((user: PassportUser, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  const user = await User.findOne(id);
  done(null, user);
});

passport.use(
  new LocalStrategy(async (username, password, done) => {
    const user = await User.findOne({
      where: { username },
      select: ["username", "password", "id", "email", "color"],
    });
    if (!user) return done("User does not exist", false);
    bcrypt.compare(password, user.password, (err, result) => {
      if (err || !result) {
        return done("Invalid Password", false);
      }
      return done(null, user);
    });
  }),
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CLIENT_URL!,
      scope: ["openid profile email"],
    },
    async (_accessToken, _refreshToken, profile: GoogleProfile, done) => {
      let user: User | undefined = await User.findOne({ googleId: profile.id });
      if (!user) {
        user = new User();
        user.username = profile.displayName;
        user.email = profile.emails?.[0].value!;
        user.googleId = profile.id;
        await user.save();
      }
      return done(undefined, user);
    },
  ),
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: process.env.GITHUB_CLIENT_URL!,
      scope: ["user:email"],
    },
    async (
      accessToken: unknown,
      refreshToken: unknown,
      profile: GithubProfile,
      done: (arg0: null, arg1: User) => void,
    ) => {
      let user: User | undefined = await User.findOne({
        where: [
          { googleId: profile.id },
          {
            email: profile.emails[0].value,
          },
        ],
      });
      if (!user) {
        user = new User();
        user.username = profile.username;
        user.email = profile.emails[0].value;
        user.googleId = profile.id;
        await user.save();
      }
      return done(null, user);
    },
  ),
);
export { passport, register };

const options = {
  jwtFromRequest: (req: Request): string => req.cookies.token,
  secretOrKey: process.env.JWT_SECRET_KEY,
};

passport.use(
  new JwtStrategy(options, async (jwtPayload, done) => {
    const user: User | undefined = await User.findOne({ id: jwtPayload.id });
    if (!user) {
      done(null, false);
    } else {
      done(null, user);
    }
  }),
);
