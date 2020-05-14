import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import Cookies from "js-cookie";
const Register = (): JSX.Element => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const history = useHistory();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    fetch("/register", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": Cookies.get("XSRF-TOKEN")!,
      },
      body: JSON.stringify({
        username,
        password,
        email,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          history.push("/dashboard");
        }
      });
  };

  return (
    <div className="register m-4">
      <div className="row d-flex justify-content-center">
        <div className="col-6">
          <h1>Register</h1>
          <form method="POST" action="/register" onSubmit={onSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input
                className="form-control"
                name="username"
                value={username}
                onChange={(e): void => setUsername(e.target.value)}
              ></input>
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                className="form-control"
                type="email"
                name="email"
                value={email}
                onChange={(e): void => setEmail(e.target.value)}
              ></input>
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                className="form-control"
                type="password"
                name="password"
                onChange={(e): void => setPassword(e.target.value)}
              ></input>
            </div>
            <button className="btn btn-outline-light" type="submit">
              Register
            </button>
            <h2>Register with a 3rd party account</h2>
            <a
              href="/auth/google"
              className="btn btn-outline-primary btn-google"
            >
              <i className="fab fa-google"></i> Google
            </a>
            <a
              href="/auth/github"
              className="btn btn-outline-primary btn-github"
            >
              <i className="fab fa-github"></i> Github
            </a>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
