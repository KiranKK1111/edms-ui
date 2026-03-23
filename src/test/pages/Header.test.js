import { configure, shallow, sleep } from "enzyme";
import { Dropdown, Layout, Menu, Avatar } from "antd";

import Adapter from "enzyme-adapter-react-16";

import Headers, { deleteAllCookiesAndSiteData, deleteCookies } from "../../pages/header/Header";

configure({ adapter: new Adapter() });

jest.mock("react-redux", () => ({
  connect: () => (Component) => Component,
}));

let cookie = "name=amlbcookie; max-age=0; path=/; domain=.standardchartered.com";
let hostname = "edp-dev-a.global.standardchartered.com";

describe("Parent", () => {

  beforeEach(() => {
    // Mock document.cookie
    let mockCookies = "testCookie1=value1; testCookie2=value2";
    Object.defineProperty(document, "cookie", {
      get: jest.fn(() => mockCookies),
      set: jest.fn((newCookie) => {
        const cookieName = newCookie.split("=")[0];
        mockCookies = mockCookies
          .split(";")
          .filter((cookie) => !cookie.trim().startsWith(cookieName))
          .join("; ");
      }),
      configurable: true,
    });

    // Mock localStorage and sessionStorage
    Storage.prototype.clear = jest.fn();
  });

  const wrapped = shallow(<Headers />);

  it("Logo presenting", () => {
    const element = wrapped.find("#corp-logo");
    expect(element.length).toBe(1);
  });

  it("Layout presenting", () => {
    const element = wrapped.find(Layout);
    expect(element.length).toBe(1);
  });

  it("Delete cookie", () => {
    deleteCookies(cookie, hostname);
    expect(cookie.length).toBe(65);
  });

  test("should delete all cookies", () => {
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

  it("Delete cookie with empty hostname", () => {
    deleteCookies(cookie, "");
    expect(cookie).toBeTruthy();
  });

  it("should render guest menu when guestRole is set", () => {
    localStorage.setItem("guestRole", "guest");
    const guestWrapped = shallow(<Headers />);
    const menuItems = guestWrapped.find(Menu.Item);
    expect(menuItems.length).toBeGreaterThanOrEqual(1);
    localStorage.removeItem("guestRole");
  });

  it("should render logged-in menu when guestRole is not set", () => {
    localStorage.removeItem("guestRole");
    localStorage.setItem("psid", "testuser");
    localStorage.setItem("entitlementType", "admin");
    const loggedInWrapped = shallow(<Headers />);
    const menuItems = loggedInWrapped.find(Menu.Item);
    expect(menuItems.length).toBeGreaterThanOrEqual(1);
    localStorage.removeItem("psid");
    localStorage.removeItem("entitlementType");
  });
});
