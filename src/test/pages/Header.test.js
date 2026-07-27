import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import AppProviders from "../../design-system/AppProviders";
import Headers, {
  deleteAllCookiesAndSiteData,
  deleteCookies,
} from "../../pages/header/Header";
import getPermissionObject from "../../utils/accessObject";

// `connect` is stubbed out, so the module's mapStateToProps is captured here to
// keep it directly assertable. `var` is required: connect() runs while the
// component module is imported, before any `const` in this file is initialised.
var mockMapStateToProps;
jest.mock("react-redux", () => ({
  connect: (mapStateToProps) => (Component) => {
    mockMapStateToProps = mockMapStateToProps || [];
    mockMapStateToProps.push(mapStateToProps);
    return Component;
  },
  useSelector: jest.fn(),
  useDispatch: () => jest.fn(),
}));

// Keep MemoryRouter/NavLink/Link real, but make history.push assertable.
var mockHistoryPush;
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useHistory: () => ({ push: mockHistoryPush }),
}));

jest.mock("../../utils/accessObject", () => ({
  __esModule: true,
  default: jest.fn(),
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
    // CRA sets resetMocks:true — install every implementation here.
    mockHistoryPush = jest.fn();
    getPermissionObject.mockReturnValue({ permission: "RW" });

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

  /* ---------------------------------------------------------------- *
   * Navigation links                                                  *
   * ---------------------------------------------------------------- */
  describe("navigation", () => {
    afterEach(() => {
      localStorage.removeItem("entitlementType");
      localStorage.removeItem("guestRole");
      localStorage.removeItem("psid");
    });

    it("should render every nav link for a fully permissioned user", () => {
      localStorage.setItem("entitlementType", "admin");
      renderHeader();
      expect(screen.getByText("Catalogue")).toBeInTheDocument();
      expect(screen.getByText("Master Data")).toBeInTheDocument();
      expect(screen.getByText("My Tasks")).toBeInTheDocument();
      expect(screen.getByText("Subscriptions")).toBeInTheDocument();
    });

    it("should only render the catalogue link for a subscriber", async () => {
      localStorage.setItem("entitlementType", "Subscriber");
      renderHeader();
      await waitFor(() =>
        expect(screen.queryByText("Master Data")).not.toBeInTheDocument()
      );
      expect(screen.getByText("Catalogue")).toBeInTheDocument();
      expect(screen.queryByText("My Tasks")).not.toBeInTheDocument();
      expect(screen.queryByText("Subscriptions")).not.toBeInTheDocument();
    });

    it("should drop the gated links when the permission is not readable", () => {
      localStorage.setItem("entitlementType", "admin");
      getPermissionObject.mockReturnValue({ permission: "NONE" });
      renderHeader();
      expect(screen.getByText("Catalogue")).toBeInTheDocument();
      expect(screen.queryByText("Master Data")).not.toBeInTheDocument();
    });

    it("should drop the gated links when no permission object exists", () => {
      localStorage.setItem("entitlementType", "admin");
      getPermissionObject.mockReturnValue(undefined);
      renderHeader();
      expect(screen.getByText("Catalogue")).toBeInTheDocument();
      expect(screen.queryByText("My Tasks")).not.toBeInTheDocument();
    });
  });

  /* ---------------------------------------------------------------- *
   * User dropdown                                                     *
   * ---------------------------------------------------------------- */
  describe("user menu", () => {
    const openMenu = () => {
      fireEvent.click(screen.getByRole("button", { name: "User menu" }));
      return screen.getByRole("menu");
    };

    beforeEach(() => {
      localStorage.setItem("psid", "PS12345");
      localStorage.setItem("entitlementType", "Administrator");
    });

    afterEach(() => {
      localStorage.removeItem("psid");
      localStorage.removeItem("entitlementType");
      localStorage.removeItem("guestRole");
    });

    it("should toggle the dropdown open and closed", () => {
      renderHeader();
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();

      const menu = openMenu();
      expect(within(menu).getByText(/PSID : PS12345/)).toBeInTheDocument();
      expect(within(menu).getByText("Administrator")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "User menu" }));
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("should navigate to the user profile from the identity row", () => {
      renderHeader();
      const menu = openMenu();
      fireEvent.click(within(menu).getByText(/PSID : PS12345/));

      expect(mockHistoryPush).toHaveBeenCalledWith("/userProfile/PS12345");
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("should navigate to the user profile from Settings", () => {
      renderHeader();
      const menu = openMenu();
      fireEvent.click(within(menu).getByText("Settings"));

      expect(mockHistoryPush).toHaveBeenCalledWith("/userProfile/PS12345");
    });

    it("should close the dropdown from the Help Center entry", () => {
      renderHeader();
      const menu = openMenu();
      fireEvent.click(within(menu).getByText("Help Center"));

      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
      expect(mockHistoryPush).not.toHaveBeenCalled();
    });

    it("should toggle the colour mode", () => {
      renderHeader();
      const menu = openMenu();
      expect(within(menu).getByText("Dark mode")).toBeInTheDocument();

      fireEvent.click(
        within(menu).getByRole("button", { name: "Switch to dark mode" })
      );

      expect(screen.getByText("Light mode")).toBeInTheDocument();
    });

    it("should close the dropdown on an outside click", async () => {
      renderHeader();
      openMenu();
      fireEvent.mouseDown(document.body);

      await waitFor(() =>
        expect(screen.queryByRole("menu")).not.toBeInTheDocument()
      );
    });

    it("should keep the dropdown open when the click is inside it", () => {
      renderHeader();
      const menu = openMenu();
      fireEvent.mouseDown(menu);
      expect(screen.getByRole("menu")).toBeInTheDocument();
    });

    it("should render the guest variant without the bell or Settings", () => {
      localStorage.removeItem("psid");
      localStorage.removeItem("entitlementType");
      localStorage.setItem("guestRole", "Guest");
      renderHeader();

      expect(
        screen.queryByRole("button", { name: "Notifications" })
      ).not.toBeInTheDocument();

      const menu = openMenu();
      expect(within(menu).getByText("Guest")).toBeInTheDocument();
      expect(within(menu).queryByText("Settings")).not.toBeInTheDocument();
      expect(within(menu).getByText("Login")).toBeInTheDocument();
      expect(within(menu).queryByText("Log out")).not.toBeInTheDocument();
    });
  });

  /* ---------------------------------------------------------------- *
   * Logout redirect — jsdom forbids assigning window.location, so the *
   * property is deleted and redefined for the duration of the test.   *
   * ---------------------------------------------------------------- */
  describe("logout", () => {
    const originalLocation = window.location;
    let assign;

    beforeEach(() => {
      assign = jest.fn();
      delete window.location;
      window.location = {
        host: "edp-dev-a.global.standardchartered.com",
        hostname: "edp-dev-a.global.standardchartered.com",
        href: "https://edp-dev-a.global.standardchartered.com/catalog",
        assign,
      };
    });

    afterEach(() => {
      window.location = originalLocation;
      localStorage.removeItem("psid");
      localStorage.removeItem("guestRole");
    });

    it("should wipe the site data and redirect to the entra logout screen", () => {
      localStorage.setItem("psid", "PS12345");
      renderHeader();

      fireEvent.click(screen.getByRole("button", { name: "User menu" }));
      fireEvent.click(screen.getByText("Log out"));

      expect(Storage.prototype.clear).toHaveBeenCalled();
      expect(assign).toHaveBeenCalledTimes(1);
      const url = assign.mock.calls[0][0];
      expect(url).toContain("/logout?post_logout_redirect_uri=");
      expect(url).toContain(
        "https://edp-dev-a.global.standardchartered.com/"
      );
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
  });

  /* ---------------------------------------------------------------- *
   * Responsive drawer                                                 *
   * ---------------------------------------------------------------- */
  describe("mobile layout", () => {
    const originalWidth = window.innerWidth;

    afterEach(() => {
      window.innerWidth = originalWidth;
      localStorage.removeItem("entitlementType");
    });

    it("should open the navigation drawer from the burger menu", async () => {
      window.innerWidth = 500;
      localStorage.setItem("entitlementType", "admin");
      renderHeader();

      const burger = screen.getByRole("button", { name: "Open navigation" });
      fireEvent.click(burger);

      expect(await screen.findByText("Menu")).toBeInTheDocument();
      // the drawer copy of the nav links closes the drawer on click
      const drawerLinks = screen.getAllByText("Catalogue");
      fireEvent.click(drawerLinks[drawerLinks.length - 1]);
      await waitFor(() =>
        expect(screen.queryByText("Menu")).not.toBeInTheDocument()
      );
    });

    it("should close the drawer from its backdrop", async () => {
      window.innerWidth = 500;
      renderHeader();
      fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));
      await screen.findByText("Menu");

      fireEvent.click(document.querySelector(".MuiBackdrop-root"));

      await waitFor(() =>
        expect(screen.queryByText("Menu")).not.toBeInTheDocument()
      );
    });

    it("should switch to the mobile layout on a window resize", async () => {
      renderHeader();
      expect(
        screen.queryByRole("button", { name: "Open navigation" })
      ).not.toBeInTheDocument();

      window.innerWidth = 480;
      fireEvent(window, new Event("resize"));

      expect(
        await screen.findByRole("button", { name: "Open navigation" })
      ).toBeInTheDocument();
    });
  });

  it("should map the login and user profile slices from the store", () => {
    expect(mockMapStateToProps).toHaveLength(1);
    expect(
      mockMapStateToProps[0]({
        login: { token: "t" },
        userProfile: { data: { psid: "PS1" } },
      })
    ).toEqual({ login: { token: "t" }, userProfile: { psid: "PS1" } });
  });
});
