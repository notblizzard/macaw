import React from "react";
import { Route, Redirect } from "react-router-dom";
import PropType from "prop-types";
import Cookies from "js-cookie";

const GuestRoute = ({ children, ...rest }): JSX.Element => {
  return (
    <Route
      {...rest}
      render={({ location }): JSX.Element =>
        !Cookies.get("email") ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/dashboard",
              state: { from: location },
            }}
          />
        )
      }
    />
  );
};

GuestRoute.propTypes = {
  children: PropType.element,
};

export default GuestRoute;
