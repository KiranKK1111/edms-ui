import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import { Provider } from "react-redux";
import reduxThunk from "redux-thunk";
import { MemoryRouter } from "react-router-dom";
import { createMemoryHistory } from "history";
import App from "../App";
import {
  startGetRefreshToken,
  startLogOut,
  startLogOutForgerock,
} from "../store/actions/loginActions";
import isCatelogueAccessDisabled from "../utils/accessRequestCatelog";
import isAccesPageDisabled from "../utils/accessPageCheck";
import isButtonObject from "../utils/accessButtonCheck";
import getPermissionObject from "../utils/accessObject";

jest.setTimeout(60000);

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  Link: () => <div />,
  withRouter: (x) => x,
}));
jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});

/* ------------------------------------------------------------------ *
 * Route-level harness                                                 *
 *                                                                     *
 * `withRouter` is stubbed to the identity above, so the router props   *
 * App expects are handed in directly as ownProps (connect forwards     *
 * them). Every lazily loaded page is stubbed so the route elements     *
 * resolve instantly, and the permission helpers are mocked so the      *
 * conditional routes can be switched on per test.                      *
 * CRA sets resetMocks:true — implementations live in beforeEach.       *
 * ------------------------------------------------------------------ */

jest.mock("../layout/AppLayout", () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="app-layout">{children}</div>,
}));
jest.mock("../pages/Login", () => ({
  __esModule: true,
  default: (props) => (
    <div data-testid="login-page">
      <button type="button" onClick={() => props.viewAsGuest()}>
        view-as-guest
      </button>
    </div>
  ),
}));
jest.mock("../pages/error/ErrorPage", () => ({
  __esModule: true,
  default: () => <div data-testid="error-page" />,
}));

jest.mock("../components/dataset/DatasetPage", () => ({
  __esModule: true,
  default: () => <div data-testid="dataset-page" />,
}));
jest.mock(
  "../components/license/licenseDetailsApproveReject/licenseDetailsApproveReject",
  () => ({
    __esModule: true,
    default: () => <div data-testid="license-approve-reject" />,
  })
);
jest.mock("../components/requestAccess/RequestDetails", () => ({
  __esModule: true,
  default: () => <div data-testid="request-details" />,
}));
jest.mock("../components/vendors/VendorDetails/VendorDetails", () => ({
  __esModule: true,
  default: () => <div data-testid="vendor-details" />,
}));
jest.mock("../components/addContract/contractApproveRejectView", () => ({
  __esModule: true,
  default: () => <div data-testid="contract-approve-reject" />,
}));
jest.mock("../pages/addEntity/AddEntity", () => ({
  __esModule: true,
  default: () => <div data-testid="add-entity" />,
}));
jest.mock("../components/recordForm/RecordFormPage", () => ({
  __esModule: true,
  default: () => <div data-testid="record-form" />,
}));
jest.mock("../pages/datafeed/AddConfiguration", () => ({
  __esModule: true,
  default: () => <div data-testid="add-configuration" />,
}));
jest.mock("../pages/catalogPage/CatalogPage", () => ({
  __esModule: true,
  default: () => <div data-testid="catalog-page" />,
}));
jest.mock("../pages/contract/addContract", () => ({
  __esModule: true,
  default: () => <div data-testid="add-contract" />,
}));
jest.mock("../pages/license/Home", () => ({
  __esModule: true,
  default: () => <div data-testid="license-home" />,
}));
jest.mock("../pages/myTasks/MyTasksDashboardNew", () => ({
  __esModule: true,
  default: () => <div data-testid="my-tasks" />,
}));
jest.mock("../pages/RequestAccess", () => ({
  __esModule: true,
  default: () => <div data-testid="request-access" />,
}));
jest.mock("../pages/userProfile/UserProfile", () => ({
  __esModule: true,
  default: () => <div data-testid="user-profile" />,
}));
jest.mock("../pages/masterData/MasterData", () => ({
  __esModule: true,
  default: () => <div data-testid="master-data" />,
}));
jest.mock("../components/license/TechnicalDetails/SchedulerDetails", () => ({
  __esModule: true,
  default: () => <div data-testid="scheduler-details" />,
}));
jest.mock("../components/license/TechnicalDetails/SourceConfigDetails", () => ({
  __esModule: true,
  default: () => <div data-testid="source-config-details" />,
}));
jest.mock("../pages/datafeed/Datafeed", () => ({
  __esModule: true,
  default: () => <div data-testid="datafeed" />,
}));
jest.mock("../pages/datafeed/ViewDatafeed", () => ({
  __esModule: true,
  default: () => <div data-testid="view-datafeed" />,
}));
jest.mock("../components/datafeed/FeedDetails", () => ({
  __esModule: true,
  default: () => <div data-testid="feed-details" />,
}));
jest.mock("../pages/dataset/Dataset", () => ({
  __esModule: true,
  default: () => <div data-testid="dataset" />,
}));
jest.mock("../components/datasetForm/DatasetTasklistDetails", () => ({
  __esModule: true,
  default: () => <div data-testid="dataset-tasklist-details" />,
}));
jest.mock("../pages/subscriptionManagement/SubscriptionManagement", () => ({
  __esModule: true,
  default: () => <div data-testid="subscription-management" />,
}));
jest.mock("../pages/datafeed/AddEditDocuments", () => ({
  __esModule: true,
  default: () => <div data-testid="add-edit-documents" />,
}));

jest.mock("../store/actions/loginActions", () => ({
  startGetRefreshToken: jest.fn(),
  startLogOut: jest.fn(),
  startLogOutForgerock: jest.fn(),
}));
jest.mock("../utils/accessRequestCatelog", () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock("../utils/accessPageCheck", () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock("../utils/accessButtonCheck", () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock("../utils/accessObject", () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock("../utils/accessMasterData", () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Idle timer / countdown are replaced with probes so the session-expiry flow
// can be driven synchronously from the tests.
var mockIdleOptions;
jest.mock("react-idle-timer", () => ({
  __esModule: true,
  useIdleTimer: (options) => {
    mockIdleOptions = options;
    return { reset: () => {} };
  },
}));

var mockCountdownState;
jest.mock("react-countdown", () => ({
  __esModule: true,
  default: ({ renderer }) =>
    renderer(mockCountdownState || { seconds: 30, completed: false }),
}));

const rootReducer = combineReducers({});
const store = createStore(rootReducer, applyMiddleware(reduxThunk));

const history = createMemoryHistory({ initialEntries: ["/"] });
describe("Parent", () => {
  const { getByTestId } = render(
    <Provider store={store}>
      <MemoryRouter history={history}>
        <App />
      </MemoryRouter>
    </Provider>
  );
  test("Identify parent element", () => {
    expect(getByTestId("main")).toBeInTheDocument();
  });
  test("Router testing", () => {
    expect(history.location.pathname).toBe("/");
  });
});

describe("App routes", () => {
  let mockPush;

  const renderApp = (route = "/", props = {}) =>
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>
          <App history={{ push: mockPush }} {...props} />
        </MemoryRouter>
      </Provider>
    );

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    mockPush = jest.fn();
    mockIdleOptions = undefined;
    mockCountdownState = { seconds: 30, completed: false };

    // ProtectedRoute treats a stored code as an authenticated session.
    localStorage.setItem("code", "auth-code");
    localStorage.setItem("access_token", "token");
    localStorage.setItem("entitlementType", "Admin");

    startGetRefreshToken.mockImplementation(() => ({ type: "REFRESH_TOKEN" }));
    startLogOut.mockImplementation(() => ({ type: "LOG_OUT" }));
    startLogOutForgerock.mockImplementation(() => ({ type: "LOG_OUT_FR" }));

    isCatelogueAccessDisabled.mockReturnValue(false);
    isAccesPageDisabled.mockReturnValue(false);
    isButtonObject.mockReturnValue(false);
    getPermissionObject.mockReturnValue({ permission: "RW" });
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("should render the login page on the root route", async () => {
    renderApp("/");
    expect(await screen.findByTestId("login-page")).toBeInTheDocument();
    expect(screen.queryByTestId("app-layout")).not.toBeInTheDocument();
  });

  it("should render the error page for the static and images routes", async () => {
    const { unmount } = renderApp("/static/anything");
    expect(await screen.findByTestId("error-page")).toBeInTheDocument();
    unmount();

    renderApp("/images/logo.png");
    expect(await screen.findByTestId("error-page")).toBeInTheDocument();
  });

  it("should render unknown routes inside the app layout error page", async () => {
    renderApp("/definitely-not-a-route");
    expect(await screen.findByTestId("app-layout")).toBeInTheDocument();
    expect(await screen.findByTestId("error-page")).toBeInTheDocument();
  });

  it("should enter guest mode and navigate to the catalogue", async () => {
    renderApp("/");
    fireEvent.click(await screen.findByText("view-as-guest"));

    expect(localStorage.getItem("guestRole")).toBe("Guest");
    expect(mockPush).toHaveBeenCalledWith("/catalog");
  });

  /* ------------------------------------------------------------ *
   * Lazy route elements                                           *
   * ------------------------------------------------------------ */
  it.each([
    ["/catalog", "catalog-page"],
    ["/catalog/details", "dataset-page"],
    ["/userProfile", "user-profile"],
    ["/userProfile/PS123", "user-profile"],
    ["/license", "license-home"],
    ["/catalog/subscription", "request-access"],
    ["/schedulerDetails/1/2", "scheduler-details"],
    ["/addAgreement", "add-contract"],
    ["/addEntity", "add-entity"],
    ["/myTasks", "my-tasks"],
    ["/vendorDetails", "vendor-details"],
    ["/masterData", "master-data"],
    ["/masterData/addEntity", "add-entity"],
    ["/record/entity/create", "record-form"],
    ["/masterData/DS1/addDocuments", "add-edit-documents"],
    ["/masterData/DS1/editDocuments/DOC1", "add-edit-documents"],
    ["/masterData/E1/addConfiguration", "add-configuration"],
    ["/masterData/modifyEntity/E1", "add-entity"],
    ["/masterData/addAgreement", "add-contract"],
    ["/masterData/E1/addAgreement", "add-contract"],
    ["/masterData/E1/modifyAgreement", "add-contract"],
    ["/masterData/L1/modifyLicense", "license-home"],
    ["/masterData/C1/addLicense", "license-home"],
    ["/masterData/E1/datafeed", "datafeed"],
    ["/masterData/E1/viewDatafeed", "view-datafeed"],
    ["/masterData/E1/dataset", "dataset"],
    ["/vendorDetails/1/2", "vendor-details"],
    ["/licenseDetails/1/2", "license-approve-reject"],
    ["/AgreementDetails/1/2", "contract-approve-reject"],
    ["/DatafeedDetails/1/2", "feed-details"],
    ["/DatasetDetails/1/2", "dataset-tasklist-details"],
    ["/subscriptionManagement", "subscription-management"],
  ])("should resolve the lazy element for %s", async (route, testId) => {
    renderApp(route);
    expect(await screen.findByTestId(testId)).toBeInTheDocument();
    expect(screen.getByTestId("app-layout")).toBeInTheDocument();
  });

  it("should render the request details route when the catalogue button is granted", async () => {
    isButtonObject.mockReturnValue(true);
    renderApp("/requestDetails/1/2");
    expect(await screen.findByTestId("request-details")).toBeInTheDocument();
  });

  it("should redirect protected routes to the login page without a session", async () => {
    localStorage.removeItem("code");
    localStorage.removeItem("guestRole");
    // isAuthenticated() decodes the stored JWT — no token means no session.
    localStorage.removeItem("access_token");
    renderApp("/catalog");
    expect(await screen.findByTestId("login-page")).toBeInTheDocument();
  });

  it("should treat a guest role as an authenticated session", async () => {
    localStorage.removeItem("code");
    localStorage.setItem("guestRole", "Guest");
    renderApp("/catalog");
    expect(await screen.findByTestId("catalog-page")).toBeInTheDocument();
  });

  /* ------------------------------------------------------------ *
   * Permission gating                                             *
   * ------------------------------------------------------------ */
  it("should hide the gated routes for a subscriber", async () => {
    localStorage.setItem("entitlementType", "Subscriber");
    renderApp("/myTasks");
    expect(await screen.findByTestId("error-page")).toBeInTheDocument();
    expect(screen.queryByTestId("my-tasks")).not.toBeInTheDocument();
  });

  it("should hide the subscription route for a guest", async () => {
    localStorage.removeItem("entitlementType");
    localStorage.setItem("guestRole", "Guest");
    renderApp("/catalog/subscription");
    expect(await screen.findByTestId("error-page")).toBeInTheDocument();
  });

  it("should fall through to the error page when a permission is read-only elsewhere", async () => {
    getPermissionObject.mockReturnValue({ permission: "NONE" });
    renderApp("/DatasetDetails/1/2");
    expect(await screen.findByTestId("error-page")).toBeInTheDocument();
  });

  it("should fall through to the error page when master data access is disabled", async () => {
    isAccesPageDisabled.mockReturnValue(true);
    renderApp("/masterData");
    expect(await screen.findByTestId("error-page")).toBeInTheDocument();
  });

  /* ------------------------------------------------------------ *
   * Idle session dialog                                           *
   * ------------------------------------------------------------ */
  describe("idle session", () => {
    it("should open the countdown dialog when the user goes idle", async () => {
      renderApp("/");
      await screen.findByTestId("login-page");

      act(() => mockIdleOptions.onIdle());

      expect(await screen.findByText("Are you still there?")).toBeInTheDocument();
      expect(screen.getByText("30")).toBeInTheDocument();
    });

    it("should not open the dialog when there is no access token", async () => {
      localStorage.removeItem("access_token");
      renderApp("/");
      await screen.findByTestId("login-page");

      act(() => mockIdleOptions.onIdle());

      expect(screen.queryByText("Are you still there?")).not.toBeInTheDocument();
    });

    it("should dismiss the dialog through the Continue button", async () => {
      renderApp("/");
      await screen.findByTestId("login-page");

      act(() => mockIdleOptions.onIdle());
      await screen.findByText("Are you still there?");

      fireEvent.click(screen.getByRole("button", { name: "Continue" }));

      await waitFor(() =>
        expect(screen.queryByText("Are you still there?")).not.toBeInTheDocument()
      );
    });

    it("should log the user out when the countdown completes", async () => {
      mockCountdownState = { seconds: 0, completed: true };
      renderApp("/");
      await screen.findByTestId("login-page");

      await act(async () => {
        mockIdleOptions.onIdle();
        await Promise.resolve();
      });

      await waitFor(() =>
        expect(startLogOutForgerock).toHaveBeenCalled()
      );
      expect(mockPush).toHaveBeenCalledWith("/");
      expect(localStorage.getItem("code")).toBeNull();
      expect(localStorage.getItem("guestRole")).toBeNull();
    });
  });
});
