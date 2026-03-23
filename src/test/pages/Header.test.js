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
});
