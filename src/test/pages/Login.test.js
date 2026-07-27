import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import Login from "../../pages/Login";

jest.spyOn(console, "error").mockImplementation(() => {});

const mockDispatch = jest.fn().mockResolvedValue(undefined);
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
  Provider: ({ children }) => children,
}));

jest.mock("../../store/services/AuthService", () => ({
  fetchUserMatrix: jest.fn().mockResolvedValue({ data: { objectMatrix: {} } }),
}));

jest.mock("../../store/actions/loginActions", () => ({
  startUserLogin: jest.fn(),
  startUserLoginForgerock: jest.fn(),
}));

const renderPage = (props = {}) =>
  render(
    <MemoryRouter>
      <Login {...props} />
    </MemoryRouter>
  );

describe("Login Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    delete window.location;
    window.location = {
      href: "http://localhost:3000",
      host: "localhost:3000",
      assign: jest.fn(),
      search: "",
    };
  });

  it("should render the main container", () => {
    const { container } = renderPage();
    expect(container.querySelector("#main")).toBeInTheDocument();
  });

  it("should render the login-wrapper", () => {
    const { container } = renderPage();
    expect(container.querySelector(".login-wrapper")).toBeInTheDocument();
  });

  it("should render the login-box", () => {
    const { container } = renderPage();
    expect(container.querySelector(".login-box")).toBeInTheDocument();
  });

  it("should render the welcome heading", () => {
    const { container, getByText } = renderPage();
    expect(getByText("Welcome to")).toBeInTheDocument();
    expect(container.querySelector("h3")).toHaveTextContent(
      "External Data Platform"
    );
  });

  it("should render the Continue to Catalogue button", () => {
    const { container } = renderPage();
    const btn = container.querySelector("#btn-forgeRock");
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveTextContent("Continue to Catalogue");
  });

  it("should render the login quote", () => {
    const { getByText } = renderPage();
    expect(
      getByText("One-stop shop for all external data feeds.")
    ).toBeInTheDocument();
  });

  it("should render env-info for non-edp environments", () => {
    const { container } = renderPage();
    expect(container.querySelector(".env-info")).toBeInTheDocument();
  });

  it("should render without crashing when history prop is provided", () => {
    const { container } = renderPage({ history: { push: jest.fn() } });
    expect(container.querySelector("#main")).toBeInTheDocument();
  });
});
