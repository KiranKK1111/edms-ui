import React from "react";
import { Route, Redirect } from "react-router-dom";
import { isAuthenticated } from "../../store/services/AuthService";

function ProtectedRoute(props) {
  const { component: Component, ...rest } = props;
  const guestRole = localStorage.getItem("guestRole");
  const code = localStorage.getItem("code");
  const isAuth = guestRole ? true : code ? true : isAuthenticated();

  return (
    <Route
      {...rest}
      render={(props) =>
        isAuth ? (
          <Component {...props} {...rest} />
        ) : (
          <Redirect to={{ pathname: "/" }} />
        )
      }
    />
  );
}

export default ProtectedRoute;