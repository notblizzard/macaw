import React from "react";
import { Route, Redirect } from "react-router-dom";
import PropType from "prop-types";
import Cookies from "js-cookie";
const PrivateRoute = ({ children, ...rest }): JSX.Element => {
  return (
    <Route
      {...rest}
      render={({ location }): JSX.Element =>
        Cookies.get("email") ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: location },
            }}
          />
        )
      }
    />
  );
};

PrivateRoute.propTypes = {
  children: PropType.element,
};

export default PrivateRoute;
