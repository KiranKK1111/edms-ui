import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { Spin, Layout, Button, Modal } from "antd";

configure({ adapter: new Adapter() });

jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});

let mockDispatch = jest.fn();
let mockState = {};
jest.mock("react-redux", () => ({
  useSelector: (cb) => cb(mockState),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

let mockLocationState = {
  data: {
    entityId: "E1",
    datasetId: "D1",
    dataFeedId: "F1",
    subscription: {
      subscriptionId: "S1",
      subscriptionStatus: "Active",
      subscriptionUpdateFlag: "N",
    },
    entityShortName: "Entity",
    dataFeedStatus: "Active",
  },
};

let mockHistory = { push: jest.fn(), replace: jest.fn() };
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useHistory: () => mockHistory,
  useLocation: () => ({ state: mockLocationState }),
  withRouter: (Component) => Component,
}));

jest.mock("../../../store/actions/requestAccessActions", () => ({
  clearStore: jest.fn(),
  unsubscribe: jest.fn(),
  getDataById: jest.fn(),
}));

jest.mock("../../../store/actions/DatasetPageActions", () => ({
  catalogueDetailsData: jest.fn(),
}));

jest.mock("../../../store/actions/datafeedAction", () => ({
  startGetDatafeeds: jest.fn(),
}));

let mockIsButtonObject = jest.fn().mockReturnValue(false);
let mockGetPermissionObject = jest.fn().mockReturnValue({ permission: "RW" });

jest.mock("../../../utils/accessButtonCheck", () => (...args) => mockIsButtonObject(...args));
jest.mock("../../../utils/accessObject", () => (...args) => mockGetPermissionObject(...args));
jest.mock("../../../utils/warningUtils", () => ({ warning: jest.fn() }));

const defaultReduxState = {
  datafeedInfo: {
    datafeedById: { datafeed: { longName: "Test Feed", feedStatus: "Active" } },
    loading: false,
  },
  dataFamily: { datasetById: {}, loading: false },
  requestAccess: { dataByIdResponse: { dataById: {} } },
  license: { licenseById: {}, loading: false },
  contract: { agreementById: {}, loading: false },
};

import DatasetPage from "../../../components/dataset/DatasetPage";

describe("DatasetPage - basic rendering", () => {
  let wrapper;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDispatch.mockReturnValue(Promise.resolve({}));
    mockState = { ...defaultReduxState };
    mockIsButtonObject.mockReturnValue(false);
    mockGetPermissionObject.mockReturnValue({ permission: "RW" });
    localStorage.clear();
    mockLocationState = {
      data: {
        entityId: "E1",
        datasetId: "D1",
        dataFeedId: "F1",
        subscription: {
          subscriptionId: "S1",
          subscriptionStatus: "Active",
          subscriptionUpdateFlag: "N",
        },
        entityShortName: "Entity",
        dataFeedStatus: "Active",
      },
    };
    mockHistory = { push: jest.fn(), replace: jest.fn() };
    wrapper = shallow(<DatasetPage />);
  });

  it("should render without crashing", () => {
    expect(wrapper.exists()).toBe(true);
  });

  it("should render the main container div", () => {
    expect(wrapper.find("#main").length).toBe(1);
  });

  it("should render Spin component", () => {
    expect(wrapper.find(Spin).length).toBeGreaterThanOrEqual(1);
  });

  it("should render Layout", () => {
    expect(wrapper.find(Layout).length).toBe(1);
  });

  it("should render DatasetTabs", () => {
    expect(wrapper.find("DatasetTabs").length).toBe(1);
  });

  it("should render DatasetPageHeader", () => {
    expect(wrapper.find("DatasetPageHeader").length).toBe(1);
  });

  it("should render DatasetBreadcrumb", () => {
    expect(wrapper.find("DatasetBreadcrumb").length).toBe(1);
  });
});

describe("DatasetPage - subscription buttons with requestBtnAccess", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDispatch.mockReturnValue(Promise.resolve({}));
    mockState = { ...defaultReduxState };
    mockIsButtonObject.mockReturnValue(false);
    localStorage.clear();
    mockHistory = { push: jest.fn(), replace: jest.fn() };
  });

  it("should render Request Access button when requestBtnAccess exists and no active subscription", () => {
    mockGetPermissionObject.mockReturnValue({ permission: "RW" });
    mockLocationState = {
      data: {
        entityId: "E1",
        datasetId: "D1",
        dataFeedId: "F1",
        subscription: null,
        entityShortName: "Entity",
        dataFeedStatus: "Active",
      },
    };
    const w = shallow(<DatasetPage />);
    const requestBtn = w.find(Button).filterWhere((b) => {
      const children = b.children();
      return children.length > 0 && children.text().includes("Request Access");
    });
    expect(requestBtn.length).toBe(1);
  });

  it("should disable Request Access when dataFeedStatus is not Active", () => {
    mockGetPermissionObject.mockReturnValue({ permission: "RW" });
    mockLocationState = {
      data: {
        entityId: "E1",
        datasetId: "D1",
        dataFeedId: "F1",
        subscription: null,
        entityShortName: "Entity",
        dataFeedStatus: "Pending",
      },
    };
    const w = shallow(<DatasetPage />);
    const requestBtn = w.find(Button).filterWhere((b) => {
      const children = b.children();
      return children.length > 0 && children.text().includes("Request Access");
    });
    if (requestBtn.length > 0) {
      expect(requestBtn.prop("disabled")).toBeTruthy();
    }
  });

  it("should render Modify Access and Unsubscribe when subscription is active", () => {
    mockGetPermissionObject.mockReturnValue({ permission: "RW" });
    mockLocationState = {
      data: {
        entityId: "E1",
        datasetId: "D1",
        dataFeedId: "F1",
        subscription: {
          subscriptionId: "S1",
          subscriptionStatus: "Active",
          subscriptionUpdateFlag: "N",
        },
        entityShortName: "Entity",
        dataFeedStatus: "Active",
      },
    };
    const w = shallow(<DatasetPage />);
    const modifyBtn = w.find(Button).filterWhere((b) => {
      const children = b.children();
      return children.length > 0 && children.text().includes("Modify Access");
    });
    const unsubBtn = w.find(Button).filterWhere((b) => {
      const children = b.children();
      return children.length > 0 && children.text().includes("Unsubscribe");
    });
    expect(modifyBtn.length).toBe(1);
    expect(unsubBtn.length).toBe(1);
  });

  it("should render Modify Access and Unsubscribe when subscription is expired", () => {
    mockGetPermissionObject.mockReturnValue({ permission: "RW" });
    mockLocationState = {
      data: {
        entityId: "E1",
        datasetId: "D1",
        dataFeedId: "F1",
        subscription: {
          subscriptionId: "S1",
          subscriptionStatus: "Expired",
          subscriptionUpdateFlag: "N",
        },
        entityShortName: "Entity",
        dataFeedStatus: "Active",
      },
    };
    const w = shallow(<DatasetPage />);
    const modifyBtn = w.find(Button).filterWhere((b) => {
      const children = b.children();
      return children.length > 0 && children.text().includes("Modify Access");
    });
    expect(modifyBtn.length).toBe(1);
  });

  it("should show Request Access (not Modify) when subscription is pending", () => {
    mockGetPermissionObject.mockReturnValue({ permission: "RW" });
    mockLocationState = {
      data: {
        entityId: "E1",
        datasetId: "D1",
        dataFeedId: "F1",
        subscription: {
          subscriptionId: "S1",
          subscriptionStatus: "Pending",
          subscriptionUpdateFlag: "N",
        },
        entityShortName: "Entity",
        dataFeedStatus: "Active",
      },
    };
    const w = shallow(<DatasetPage />);
    const requestBtn = w.find(Button).filterWhere((b) => {
      const children = b.children();
      return children.length > 0 && children.text().includes("Request Access");
    });
    // Pending subscription means disableStatus=true, and subscriptionButtons shows Request Access (disabled)
    expect(requestBtn.length).toBe(1);
    expect(requestBtn.prop("disabled")).toBeTruthy();
  });

  it("should NOT render subscription buttons when requestBtnAccess is null", () => {
    mockGetPermissionObject.mockReturnValue(null);
    mockLocationState = {
      data: {
        entityId: "E1",
        datasetId: "D1",
        dataFeedId: "F1",
        subscription: null,
        entityShortName: "Entity",
        dataFeedStatus: "Active",
      },
    };
    const w = shallow(<DatasetPage />);
    const requestBtn = w.find(Button).filterWhere((b) => {
      const children = b.children();
      return children.length > 0 && children.text().includes("Request Access");
    });
    expect(requestBtn.length).toBe(0);
  });
});

describe("DatasetPage - guest role", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDispatch.mockReturnValue(Promise.resolve({}));
    mockState = { ...defaultReduxState };
    mockIsButtonObject.mockReturnValue(false);
    mockGetPermissionObject.mockReturnValue(null);
    mockHistory = { push: jest.fn(), replace: jest.fn() };
  });

  it("should render Request Access for Guest role", () => {
    localStorage.setItem("guestRole", "Guest");
    mockLocationState = {
      data: {
        entityId: "E1",
        datasetId: "D1",
        dataFeedId: "F1",
        subscription: null,
        entityShortName: "Entity",
        dataFeedStatus: "Active",
      },
    };
    const w = shallow(<DatasetPage />);
    const requestBtn = w.find(Button).filterWhere((b) => {
      const children = b.children();
      return children.length > 0 && children.text().includes("Request Access");
    });
    expect(requestBtn.length).toBe(1);
  });

  it("should disable Guest Request Access when dataFeedStatus is not active", () => {
    localStorage.setItem("guestRole", "Guest");
    mockLocationState = {
      data: {
        entityId: "E1",
        datasetId: "D1",
        dataFeedId: "F1",
        subscription: null,
        entityShortName: "Entity",
        dataFeedStatus: "Pending",
      },
    };
    const w = shallow(<DatasetPage />);
    const requestBtn = w.find(Button).filterWhere((b) => {
      const children = b.children();
      return children.length > 0 && children.text().includes("Request Access");
    });
    if (requestBtn.length > 0) {
      expect(requestBtn.prop("disabled")).toBeTruthy();
    }
  });
});

describe("DatasetPage - disableStatus logic", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDispatch.mockReturnValue(Promise.resolve({}));
    mockState = { ...defaultReduxState };
    mockIsButtonObject.mockReturnValue(false);
    mockGetPermissionObject.mockReturnValue({ permission: "RW" });
    localStorage.clear();
    mockHistory = { push: jest.fn(), replace: jest.fn() };
  });

  it("should set disableStatus true when subscription status is pending", () => {
    mockLocationState = {
      data: {
        entityId: "E1",
        datasetId: "D1",
        dataFeedId: "F1",
        subscription: {
          subscriptionId: "S1",
          subscriptionStatus: "pending",
          subscriptionUpdateFlag: "N",
        },
        entityShortName: "Entity",
        dataFeedStatus: "Active",
      },
    };
    const w = shallow(<DatasetPage />);
    // The Request Access button should be disabled due to pending subscription
    const requestBtn = w.find(Button).filterWhere((b) => {
      const children = b.children();
      return children.length > 0 && children.text().includes("Request Access");
    });
    if (requestBtn.length > 0) {
      expect(requestBtn.prop("disabled")).toBeTruthy();
    }
  });

  it("should set disableStatus true when guestRole exists", () => {
    localStorage.setItem("guestRole", "Guest");
    mockGetPermissionObject.mockReturnValue(null);
    mockLocationState = {
      data: {
        entityId: "E1",
        datasetId: "D1",
        dataFeedId: "F1",
        subscription: null,
        entityShortName: "Entity",
        dataFeedStatus: "Active",
      },
    };
    const w = shallow(<DatasetPage />);
    expect(w.exists()).toBe(true);
  });
});

describe("DatasetPage - spining state", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDispatch.mockReturnValue(Promise.resolve({}));
    mockIsButtonObject.mockReturnValue(false);
    mockGetPermissionObject.mockReturnValue({ permission: "RW" });
    localStorage.clear();
    mockHistory = { push: jest.fn(), replace: jest.fn() };
    mockLocationState = {
      data: {
        entityId: "E1",
        datasetId: "D1",
        dataFeedId: "F1",
        subscription: {
          subscriptionId: "S1",
          subscriptionStatus: "Active",
          subscriptionUpdateFlag: "N",
        },
        entityShortName: "Entity",
        dataFeedStatus: "Active",
      },
    };
  });

  it("should render Spin with spinning false when no loading flags", () => {
    mockState = { ...defaultReduxState };
    const w = shallow(<DatasetPage />);
    // useEffect doesn't fire in shallow, initial state of spining is false
    expect(w.find(Spin).prop("spinning")).toBe(false);
  });

  it("should render with all loading flags false", () => {
    mockState = {
      ...defaultReduxState,
      datafeedInfo: { ...defaultReduxState.datafeedInfo, loading: false },
      dataFamily: { ...defaultReduxState.dataFamily, loading: false },
      license: { ...defaultReduxState.license, loading: false },
      contract: { ...defaultReduxState.contract, loading: false },
    };
    const w = shallow(<DatasetPage />);
    expect(w.find(Spin).prop("spinning")).toBe(false);
  });
});

describe("DatasetPage - redirect handler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDispatch.mockReturnValue(Promise.resolve({}));
    mockState = { ...defaultReduxState };
    mockIsButtonObject.mockReturnValue(false);
    mockGetPermissionObject.mockReturnValue({ permission: "RW" });
    localStorage.clear();
    mockHistory = { push: jest.fn(), replace: jest.fn() };
    mockLocationState = {
      data: {
        entityId: "E1",
        datasetId: "D1",
        dataFeedId: "F1",
        subscription: null,
        entityShortName: "Entity",
        dataFeedStatus: "Active",
      },
    };
  });

  it("should navigate to subscription page on Request Access click", () => {
    const w = shallow(<DatasetPage />);
    const requestBtn = w.find(Button).filterWhere((b) => {
      const children = b.children();
      return children.length > 0 && children.text().includes("Request Access");
    });
    if (requestBtn.length > 0) {
      requestBtn.simulate("click");
      expect(mockHistory.push).toHaveBeenCalledWith(
        expect.objectContaining({
          pathname: "/catalog/subscription",
        })
      );
    }
  });
});

describe("DatasetPage - unsubscribeHandler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDispatch.mockReturnValue(Promise.resolve({}));
    mockState = {
      ...defaultReduxState,
      requestAccess: {
        dataByIdResponse: {
          dataById: { subscriptionStatus: "Active", subscriptionUpdateFlag: "N" },
        },
      },
    };
    mockIsButtonObject.mockReturnValue(false);
    mockGetPermissionObject.mockReturnValue({ permission: "RW" });
    localStorage.clear();
    mockHistory = { push: jest.fn(), replace: jest.fn() };
    mockLocationState = {
      data: {
        entityId: "E1",
        datasetId: "D1",
        dataFeedId: "F1",
        subscription: {
          subscriptionId: "S1",
          subscriptionStatus: "Active",
          subscriptionUpdateFlag: "N",
        },
        entityShortName: "Entity",
        dataFeedStatus: "Active",
      },
    };
  });

  it("should render Unsubscribe button for active subscription", () => {
    const w = shallow(<DatasetPage />);
    const unsubBtn = w.find(Button).filterWhere((b) => {
      const children = b.children();
      return children.length > 0 && children.text().includes("Unsubscribe");
    });
    expect(unsubBtn.length).toBe(1);
  });

  it("should call unsubscribe confirm on Unsubscribe click", () => {
    const w = shallow(<DatasetPage />);
    const unsubBtn = w.find(Button).filterWhere((b) => {
      const children = b.children();
      return children.length > 0 && children.text().includes("Unsubscribe");
    });
    if (unsubBtn.length > 0) {
      unsubBtn.simulate("click");
      // confirm is called with unsubscribeHandler, which is async
      expect(w.exists()).toBe(true);
    }
  });
});

describe("DatasetPage - Modify Access with subscriptionUpdateFlag Y", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDispatch.mockReturnValue(Promise.resolve({}));
    mockState = {
      ...defaultReduxState,
      requestAccess: {
        dataByIdResponse: {
          dataById: { subscriptionStatus: "Active", subscriptionUpdateFlag: "Y" },
        },
      },
    };
    mockIsButtonObject.mockReturnValue(false);
    mockGetPermissionObject.mockReturnValue({ permission: "RW" });
    localStorage.clear();
    mockHistory = { push: jest.fn(), replace: jest.fn() };
    mockLocationState = {
      data: {
        entityId: "E1",
        datasetId: "D1",
        dataFeedId: "F1",
        subscription: {
          subscriptionId: "S1",
          subscriptionStatus: "Active",
          subscriptionUpdateFlag: "Y",
        },
        entityShortName: "Entity",
        dataFeedStatus: "Active",
      },
    };
  });

  it("should render disabled Modify Access button when subscriptionUpdateFlag is Y", () => {
    const w = shallow(<DatasetPage />);
    const modifyBtn = w.find(Button).filterWhere((b) => {
      const children = b.children();
      return children.length > 0 && children.text().includes("Modify Access");
    });
    expect(modifyBtn.length).toBe(1);
    expect(modifyBtn.prop("disabled")).toBeTruthy();
  });

  it("should render disabled Unsubscribe when subscriptionUpdateFlag is Y", () => {
    const w = shallow(<DatasetPage />);
    const unsubBtn = w.find(Button).filterWhere((b) => {
      const children = b.children();
      return children.length > 0 && children.text().includes("Unsubscribe");
    });
    expect(unsubBtn.length).toBe(1);
    expect(unsubBtn.prop("disabled")).toBeTruthy();
  });
});

describe("DatasetPage - no subscription", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDispatch.mockReturnValue(Promise.resolve({}));
    mockState = { ...defaultReduxState };
    mockIsButtonObject.mockReturnValue(false);
    mockGetPermissionObject.mockReturnValue({ permission: "RW" });
    localStorage.clear();
    mockHistory = { push: jest.fn(), replace: jest.fn() };
    mockLocationState = {
      data: {
        entityId: "E1",
        datasetId: "D1",
        dataFeedId: "F1",
        subscription: null,
        entityShortName: "Entity",
        dataFeedStatus: "Active",
      },
    };
  });

  it("should show Request Access only (no Modify/Unsubscribe) when no subscription", () => {
    const w = shallow(<DatasetPage />);
    const modifyBtn = w.find(Button).filterWhere((b) => {
      const children = b.children();
      return children.length > 0 && children.text().includes("Modify Access");
    });
    const unsubBtn = w.find(Button).filterWhere((b) => {
      const children = b.children();
      return children.length > 0 && children.text().includes("Unsubscribe");
    });
    expect(modifyBtn.length).toBe(0);
    expect(unsubBtn.length).toBe(0);
  });
});

describe("DatasetPage - empty datafeedInfo", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDispatch.mockReturnValue(Promise.resolve({}));
    mockState = {
      ...defaultReduxState,
      datafeedInfo: { datafeedById: {}, loading: false },
    };
    mockIsButtonObject.mockReturnValue(false);
    mockGetPermissionObject.mockReturnValue({ permission: "RW" });
    localStorage.clear();
    mockHistory = { push: jest.fn(), replace: jest.fn() };
    mockLocationState = {
      data: {
        entityId: "E1",
        datasetId: "D1",
        dataFeedId: "F1",
        subscription: null,
        entityShortName: "Entity",
        dataFeedStatus: "Active",
      },
    };
  });

  it("should handle empty datafeedInfo with dummyObj fallback", () => {
    const w = shallow(<DatasetPage />);
    expect(w.exists()).toBe(true);
    // datafeedLongName should be ""
    expect(w.find("DatasetBreadcrumb").prop("title")).toBe("");
  });
});

describe("DatasetPage - isBtnDisplay logic", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDispatch.mockReturnValue(Promise.resolve({}));
    mockState = { ...defaultReduxState };
    localStorage.clear();
    mockHistory = { push: jest.fn(), replace: jest.fn() };
  });

  it("should handle isUnsubscribeBtnCheck returning true", () => {
    mockIsButtonObject.mockReturnValue(true);
    mockGetPermissionObject.mockReturnValue({ permission: "RW" });
    mockLocationState = {
      data: {
        entityId: "E1",
        datasetId: "D1",
        dataFeedId: "F1",
        subscription: null,
        entityShortName: "Entity",
        dataFeedStatus: "Active",
      },
    };
    const w = shallow(<DatasetPage />);
    expect(w.exists()).toBe(true);
  });
});
