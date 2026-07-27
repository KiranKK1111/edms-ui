import React from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import Login from "../../pages/Login";
import { startUserLoginForgerock } from "../../store/actions/loginActions";
import { fetchUserMatrix } from "../../store/services/AuthService";
import { LOCAL_STORAGE_OBJECT_MATRIX } from "../../utils/Constants";

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

  /* ------------------------------------------------------------------ *
   * Login flow — dispatch / user-matrix / error template / redirect     *
   * CRA sets resetMocks:true, so every implementation is (re)installed  *
   * inside beforeEach rather than at module-factory scope.              *
   * ------------------------------------------------------------------ */
  describe("login flow", () => {
    let loginResponse;
    let capturedRedirect;
    let capturedViewAsGuest;

    beforeEach(() => {
      loginResponse = { data: { role: ["Admin"] } };
      capturedRedirect = undefined;
      capturedViewAsGuest = undefined;

      startUserLoginForgerock.mockImplementation(
        (code, redirect, viewAsGuest) => {
          capturedRedirect = redirect;
          capturedViewAsGuest = viewAsGuest;
          return { type: "MOCK_LOGIN", code };
        }
      );
      mockDispatch.mockImplementation(() => Promise.resolve(loginResponse));
      fetchUserMatrix.mockResolvedValue({
        data: { objectMatrix: { catalog: "RW" } },
      });
    });

    it("should dispatch the forgerock login and store the object matrix on click", async () => {
      const viewAsGuest = jest.fn();
      const { container } = renderPage({
        history: { push: jest.fn() },
        viewAsGuest,
      });

      fireEvent.click(container.querySelector("#btn-forgeRock"));

      await waitFor(() => expect(fetchUserMatrix).toHaveBeenCalledWith("Admin"));
      expect(mockDispatch).toHaveBeenCalled();
      expect(capturedViewAsGuest).toBe(viewAsGuest);
      expect(localStorage.getItem(LOCAL_STORAGE_OBJECT_MATRIX)).toBe(
        JSON.stringify({ catalog: "RW" })
      );
    });

    it("should push to /catalog through the redirect callback handed to the action", async () => {
      const push = jest.fn();
      const { container } = renderPage({ history: { push } });

      fireEvent.click(container.querySelector("#btn-forgeRock"));
      await waitFor(() => expect(capturedRedirect).toBeDefined());

      capturedRedirect();
      expect(push).toHaveBeenCalledWith("/catalog");
    });

    it("should read the code from localStorage when it is already persisted", async () => {
      localStorage.setItem("code", "persisted-code");
      const { container } = renderPage({ history: { push: jest.fn() } });

      fireEvent.click(container.querySelector("#btn-forgeRock"));

      await waitFor(() => expect(fetchUserMatrix).toHaveBeenCalled());
      expect(startUserLoginForgerock).toHaveBeenCalledWith(
        "persisted-code",
        expect.any(Function),
        undefined
      );
    });

    it("should bail out when the user matrix response has no data", async () => {
      fetchUserMatrix.mockResolvedValue(null);
      const { container } = renderPage({ history: { push: jest.fn() } });

      fireEvent.click(container.querySelector("#btn-forgeRock"));

      await waitFor(() => expect(fetchUserMatrix).toHaveBeenCalled());
      expect(localStorage.getItem(LOCAL_STORAGE_OBJECT_MATRIX)).toBeNull();
    });

    it.each([
      ["a top level message", { message: "network down" }],
      ["an errorMsg payload", { response: { data: { errorMsg: "bad" } } }],
      ["an error payload", { response: { data: { error: "nope" } } }],
      ["a null role", { response: { data: { role: null } } }],
    ])("should skip the user matrix call when the response has %s", async (
      _label,
      response
    ) => {
      loginResponse = response;
      const { container } = renderPage({ history: { push: jest.fn() } });

      fireEvent.click(container.querySelector("#btn-forgeRock"));

      await waitFor(() => expect(mockDispatch).toHaveBeenCalled());
      expect(fetchUserMatrix).not.toHaveBeenCalled();
    });
  });

  /* ------------------------------------------------------------------ *
   * Mount-time auto login — triggered when ?code=... is on the URL      *
   * ------------------------------------------------------------------ */
  describe("auto login from the redirect url", () => {
    let loginResponse;

    beforeEach(() => {
      loginResponse = { data: { role: ["Admin"] } };
      startUserLoginForgerock.mockImplementation((code) => ({
        type: "MOCK_LOGIN",
        code,
      }));
      mockDispatch.mockImplementation(() => Promise.resolve(loginResponse));
      fetchUserMatrix.mockResolvedValue({ data: { objectMatrix: {} } });
      window.location.href = "http://localhost:3000/?code=abc123";
    });

    it("should persist the code and show the loading spinner", async () => {
      const { container } = renderPage({ history: { push: jest.fn() } });

      await waitFor(() =>
        expect(startUserLoginForgerock).toHaveBeenCalledWith(
          "abc123",
          expect.any(Function),
          undefined
        )
      );
      expect(localStorage.getItem("code")).toBe("abc123");
      expect(
        container.querySelector(".MuiCircularProgress-root")
      ).toBeInTheDocument();
      expect(container.querySelector(".login-wrapper")).not.toBeInTheDocument();
    });

    it("should drop the code and fall back to the login screen on failure", async () => {
      loginResponse = { message: "login failed" };
      renderPage({ history: { push: jest.fn() } });

      expect(await screen.findByText("Welcome to")).toBeInTheDocument();
      expect(localStorage.getItem("code")).toBeNull();
    });

    it.each([
      ["errorMsg", { response: { data: { errorMsg: "bad" } } }],
      ["error", { response: { data: { error: "nope" } } }],
      ["a null role", { response: { data: { role: null } } }],
    ])(
      "should show the error template when the mount time login returns %s",
      async (_label, response) => {
        loginResponse = response;
        renderPage({ history: { push: jest.fn() } });

        expect(
          await screen.findByText("One-stop shop for all external data feeds.")
        ).toBeInTheDocument();
        expect(localStorage.getItem("code")).toBeNull();
      }
    );
  });

  /* ------------------------------------------------------------------ *
   * Environment banner derived from the hostname                        *
   * ------------------------------------------------------------------ */
  describe("environment banner", () => {
    it("should show the deployed subdomain for a non local host", () => {
      window.location.href = "https://edp-dev-a.global.standardchartered.com/";
      const { container } = renderPage();
      expect(container.querySelector(".env-info")).toHaveTextContent(
        "Test Env: dev-a"
      );
    });

    it("should show the stage subdomain", () => {
      window.location.href = "https://edp-stage.global.standardchartered.com/";
      const { container } = renderPage();
      expect(container.querySelector(".env-info")).toHaveTextContent(
        "Test Env: stage"
      );
    });

    it("should hide the env banner on the production edp host", () => {
      window.location.href = "https://edp.global.standardchartered.com/";
      const { container } = renderPage();
      expect(container.querySelector(".env-info")).not.toBeInTheDocument();
      expect(container.querySelector(".login-box")).toBeInTheDocument();
    });
  });
});
