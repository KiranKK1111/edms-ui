import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Switch, Route } from "react-router-dom";
import ProtectedRoute from "../../../components/login/protectedRoute";

jest.mock("../../../store/services/AuthService", () => ({
  isAuthenticated: jest.fn(),
}));

const { isAuthenticated } = require("../../../store/services/AuthService");

const DummyComponent = (props) => (
  <div>Protected Content {props.extraProp}</div>
);

const renderRoute = (extraProps = {}, entry = "/test") =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <Switch>
        <ProtectedRoute component={DummyComponent} path="/test" {...extraProps} />
        <Route path="/">
          <div>Redirected Home</div>
        </Route>
      </Switch>
    </MemoryRouter>
  );

describe("ProtectedRoute", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it("should render the protected component when authenticated", () => {
    isAuthenticated.mockReturnValue(true);
    renderRoute();
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("should render the component when guestRole is set", () => {
    localStorage.setItem("guestRole", "guest");
    isAuthenticated.mockReturnValue(false);
    renderRoute();
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("should render the component when code is set in localStorage", () => {
    localStorage.setItem("code", "auth-code-123");
    isAuthenticated.mockReturnValue(false);
    renderRoute();
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("should redirect to / when not authenticated", () => {
    isAuthenticated.mockReturnValue(false);
    renderRoute();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    expect(screen.getByText("Redirected Home")).toBeInTheDocument();
  });

  it("should pass extra props to the component", () => {
    localStorage.setItem("guestRole", "guest");
    isAuthenticated.mockReturnValue(false);
    renderRoute({ extraProp: "value" });
    expect(screen.getByText(/Protected Content/)).toHaveTextContent(
      "Protected Content value"
    );
  });
});
