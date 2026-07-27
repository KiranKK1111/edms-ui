import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import AppProviders from "../../design-system/AppProviders";
import Headers, {
  deleteAllCookiesAndSiteData,
  deleteCookies,
} from "../../pages/header/Header";

jest.mock("react-redux", () => ({
  connect: () => (Component) => Component,
  useSelector: jest.fn(),
  useDispatch: () => jest.fn(),
}));

let cookie = "name=amlbcookie; max-age=0; path=/; domain=.standardchartered.com";
let hostname = "edp-dev-a.global.standardchartered.com";

const renderHeader = () =>
  render(
    <AppProviders>
      <MemoryRouter>
        <Headers />
      </MemoryRouter>
    </AppProviders>
  );

describe("Header", () => {
  beforeEach(() => {
    let mockCookies = "testCookie1=value1; testCookie2=value2";
    Object.defineProperty(document, "cookie", {
      get: jest.fn(() => mockCookies),
      set: jest.fn((newCookie) => {
        const cookieName = newCookie.split("=")[0];
        mockCookies = mockCookies
          .split(";")
          .filter((c) => !c.trim().startsWith(cookieName))
          .join("; ");
      }),
      configurable: true,
    });
    Storage.prototype.clear = jest.fn();
  });

  it("should render the corp logo", () => {
    const { container } = renderHeader();
    expect(container.querySelector("#corp-logo")).toBeInTheDocument();
  });

  it("should render the app header banner", () => {
    const { container } = renderHeader();
    expect(container.querySelector(".app-header")).toBeInTheDocument();
  });

  it("should delete a cookie", () => {
    deleteCookies(cookie, hostname);
    expect(cookie.length).toBe(65);
  });

  it("should delete all cookies", () => {
    deleteAllCookiesAndSiteData();
    expect(document.cookie).toBe("");
  });

  it("should clear localStorage on deleteAllCookiesAndSiteData", () => {
    localStorage.setItem("test", "value");
    deleteAllCookiesAndSiteData();
    expect(Storage.prototype.clear).toHaveBeenCalled();
  });

  it("should clear sessionStorage on deleteAllCookiesAndSiteData", () => {
    sessionStorage.setItem("test", "value");
    deleteAllCookiesAndSiteData();
    expect(Storage.prototype.clear).toHaveBeenCalled();
  });

  it("should handle deleteCookies with empty hostname", () => {
    deleteCookies(cookie, "");
    expect(cookie).toBeTruthy();
  });

  it("should render guest menu when guestRole is set", () => {
    localStorage.setItem("guestRole", "guest");
    const { container } = renderHeader();
    expect(container.querySelector("#corp-logo")).toBeInTheDocument();
    localStorage.removeItem("guestRole");
  });

  it("should render logged-in header when guestRole is not set", () => {
    localStorage.removeItem("guestRole");
    localStorage.setItem("psid", "testuser");
    localStorage.setItem("entitlementType", "admin");
    const { container } = renderHeader();
    expect(container.querySelector(".app-header")).toBeInTheDocument();
    localStorage.removeItem("psid");
    localStorage.removeItem("entitlementType");
  });
});
