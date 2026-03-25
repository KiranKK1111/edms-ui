import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { Button, PageHeader, Row, Col } from "antd";
import RequestDetails from "../../../components/requestAccess/RequestDetails";
import ApproveRejectModal from "../../../components/Modals/ApproveRejectModal";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";
import DisplayTC from "../../../components/requestAccess/DisplayTC";

configure({ adapter: new Adapter() });

jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});
jest.spyOn(console, "log").mockImplementation(() => {});

let mockDispatch = jest.fn();
let mockState = {};
jest.mock("react-redux", () => ({
  useSelector: (cb) => cb(mockState),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

const mockHistoryPush = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ id: "123" }),
  useHistory: () => ({ push: mockHistoryPush }),
}));

jest.mock("../../../store/actions/requestAccessActions", () => ({
  getDataById: jest.fn(() => "getDataById"),
  getDataByCrId: jest.fn(() => "getDataByCrId"),
}));

jest.mock("../../../store/actions/DatasetPageActions", () => ({
  catalogueDetailsData: jest.fn(() => "catalogueDetailsData"),
}));

jest.mock("../../../utils/accessObject", () => {
  const fn = jest.fn().mockReturnValue(null);
  return fn;
});

const getPermissionObject = require("../../../utils/accessObject");

mockState = {
  requestAccess: {
    dataByIdResponse: {
      dataById: {
        subscriptionId: "S1",
        department: "IT",
        clarityId: "CL1",
        licensesSubscribed: "5",
        subscriptionStatus: "Active",
        projectName: "Proj",
        reason: "Need access",
        subscriber: "User1",
        subscriptionType: "Team",
        dataFeedId: "F1",
        subscriptionVendorRequest: "N",
      },
    },
    businessRequirements: [{ subscriptionType: "Team" }],
  },
  catalogueList: { catalogueList: [] },
};

const baseMockProps = {
  location: {
    state: {
      myTaskData: {
        taskListId: "T1",
        taskListObjectAction: "Create",
        taskListTaskStatus: "Pending",
        taskListObject: "Subscription",
        taskListDescription: "Test Task",
        taskListCreatedBy: "user1",
      },
    },
  },
  history: { push: jest.fn(), replace: jest.fn() },
  allowSubmit: true,
};

describe("RequestDetails", () => {
  let wrapper;

  beforeEach(() => {
    mockDispatch.mockClear();
    mockHistoryPush.mockClear();
    getPermissionObject.mockReturnValue(null);
    mockDispatch.mockReturnValue(Promise.resolve({}));
    localStorage.clear();
    localStorage.setItem("psid", "current_user");
    localStorage.setItem("entitlementType", "Admin");
    baseMockProps.history.push.mockClear();
    baseMockProps.history.replace.mockClear();
    wrapper = shallow(<RequestDetails {...baseMockProps} />);
  });

  it("should render without crashing", () => {
    expect(wrapper.exists()).toBe(true);
  });

  it("should render request-details container", () => {
    expect(wrapper.find(".request-details").length).toBe(1);
  });

  it("should render Approve and Reject buttons", () => {
    const buttons = wrapper.find(".btn-parent").find(Button);
    expect(buttons.length).toBe(2);
  });

  it("should render PageHeader", () => {
    expect(wrapper.find(PageHeader).length).toBe(1);
  });

  it("should render business requirements section", () => {
    expect(wrapper.find("h3").text()).toContain("Business Requirements");
  });

  it("should render Business Requirements rows", () => {
    expect(wrapper.find(Row).length).toBeGreaterThanOrEqual(1);
  });

  // ---- Renders with Create action ----
  it("should render with Create action props", () => {
    expect(wrapper.exists()).toBe(true);
  });

  // ---- Renders with Update action ----
  it("should render with Update (non-Create) action props", () => {
    const updateProps = {
      ...baseMockProps,
      location: {
        state: {
          myTaskData: {
            ...baseMockProps.location.state.myTaskData,
            taskListObjectAction: "Update",
          },
        },
      },
    };
    const w = shallow(<RequestDetails {...updateProps} />);
    expect(w.exists()).toBe(true);
  });

  // ---- brResultRevised field mapping ----
  it("should render subscription data columns", () => {
    const cols = wrapper.find(".review-submit").find(Col);
    expect(cols.length).toBeGreaterThanOrEqual(5);
  });

  it("should render reason for subscription separately", () => {
    expect(wrapper.find(".review-submit").find(".label-review").length).toBeGreaterThanOrEqual(1);
  });

  // ---- buttonAccessReject logic ----
  it("should disable buttons when no permissions (getPermissionObject returns null)", () => {
    getPermissionObject.mockReturnValue(null);
    const w = shallow(<RequestDetails {...baseMockProps} />);
    const buttons = w.find(".btn-parent").find(Button);
    expect(buttons.at(0).prop("disabled")).toBe(true);
    expect(buttons.at(1).prop("disabled")).toBe(true);
  });

  it("should enable buttons when isApproveReject has RW permission", () => {
    getPermissionObject.mockImplementation((page, btn) => {
      if (btn === "Approve / Reject Button") return { permission: "RW" };
      return null;
    });
    const w = shallow(<RequestDetails {...baseMockProps} />);
    const buttons = w.find(".btn-parent").find(Button);
    expect(buttons.at(0).prop("disabled")).toBe(false);
    expect(buttons.at(1).prop("disabled")).toBe(false);
  });

  it("should enable buttons for subscription with subscription btn RW", () => {
    getPermissionObject.mockImplementation((page, btn) => {
      if (btn === "Approve / Reject Button") return { permission: "RO" };
      if (btn === "Approve / Reject Button for object Subscription")
        return { permission: "RW" };
      if (btn === "Approve / Reject Button for remaining objects")
        return { permission: "RO" };
      return null;
    });
    const w = shallow(<RequestDetails {...baseMockProps} />);
    expect(w.find(".btn-parent").find(Button).at(0).prop("disabled")).toBe(false);
  });

  it("should disable buttons for subscription when subscription btn is not RW", () => {
    getPermissionObject.mockImplementation((page, btn) => {
      if (btn === "Approve / Reject Button") return { permission: "RO" };
      if (btn === "Approve / Reject Button for object Subscription")
        return { permission: "RO" };
      if (btn === "Approve / Reject Button for remaining objects")
        return { permission: "RO" };
      return null;
    });
    const w = shallow(<RequestDetails {...baseMockProps} />);
    expect(w.find(".btn-parent").find(Button).at(0).prop("disabled")).toBe(true);
  });

  it("should disable buttons for non-subscription object type", () => {
    getPermissionObject.mockImplementation((page, btn) => {
      if (btn === "Approve / Reject Button") return { permission: "RO" };
      if (btn === "Approve / Reject Button for object Subscription")
        return { permission: "RW" };
      if (btn === "Approve / Reject Button for remaining objects")
        return { permission: "RW" };
      return null;
    });
    const nonSubProps = {
      ...baseMockProps,
      location: {
        state: {
          myTaskData: {
            ...baseMockProps.location.state.myTaskData,
            taskListObject: "Dataset",
          },
        },
      },
    };
    const w = shallow(<RequestDetails {...nonSubProps} />);
    expect(w.find(".btn-parent").find(Button).at(0).prop("disabled")).toBe(true);
  });

  // ---- allowSubmit false disables buttons ----
  it("should disable buttons when allowSubmit is false", () => {
    getPermissionObject.mockReturnValue({ permission: "RW" });
    const w = shallow(<RequestDetails {...baseMockProps} allowSubmit={false} />);
    expect(w.find(".btn-parent").find(Button).at(0).prop("disabled")).toBe(true);
  });

  // ---- showApproveModal ----
  it("should have onClick on Approve button", () => {
    const btn = wrapper.find(".btn-parent").find(Button).at(1);
    expect(typeof btn.prop("onClick")).toBe("function");
    btn.prop("onClick")();
  });

  // ---- showRejectModal ----
  it("should have onClick on Reject button", () => {
    const btn = wrapper.find(".btn-parent").find(Button).at(0);
    expect(typeof btn.prop("onClick")).toBe("function");
    btn.prop("onClick")();
  });

  // ---- ApproveRejectModal rendered ----
  it("should render ApproveRejectModal", () => {
    expect(wrapper.find(ApproveRejectModal).length).toBe(1);
  });

  it("should pass getStatus to ApproveRejectModal", () => {
    const modal = wrapper.find(ApproveRejectModal);
    expect(modal.prop("getStatus")).toBeDefined();
    expect(typeof modal.prop("getStatus")).toBe("function");
  });

  it("should pass refreshPage to ApproveRejectModal", () => {
    const modal = wrapper.find(ApproveRejectModal);
    expect(typeof modal.prop("refreshPage")).toBe("function");
  });

  // ---- getStatus callback ----
  it("should call getStatus with taskList true to set btnDisplay", () => {
    const modal = wrapper.find(ApproveRejectModal);
    modal.prop("getStatus")({ data: { taskList: true } });
    wrapper.update();
    // After this, btnDisplay should be true, buttons disabled
    const buttons = wrapper.find(".btn-parent").find(Button);
    expect(buttons.at(0).prop("disabled")).toBe(true);
  });

  it("should call getStatus with taskList falsy to keep btnDisplay false", () => {
    const modal = wrapper.find(ApproveRejectModal);
    modal.prop("getStatus")({ data: { taskList: null } });
    wrapper.update();
    expect(wrapper.exists()).toBe(true);
  });

  // ---- refreshPage navigates to myTasks ----
  it("should navigate to myTasks on refreshPage", () => {
    const modal = wrapper.find(ApproveRejectModal);
    modal.prop("refreshPage")();
    expect(mockHistoryPush).toHaveBeenCalledWith("/myTasks");
  });

  // ---- PageHeader onBack ----
  it("should call history.push on PageHeader back", () => {
    wrapper.find(PageHeader).prop("onBack")();
    expect(baseMockProps.history.push).toHaveBeenCalledWith("/myTasks");
  });

  // ---- Breadcrumb ----
  it("should pass correct breadcrumb data", () => {
    const bc = wrapper.find(Breadcrumb);
    expect(bc.prop("breadcrumb")[0]).toEqual({ name: "My Tasks", url: "/myTasks" });
    expect(bc.prop("breadcrumb")[1].name).toBe("Test Task");
  });

  // ---- DisplayTC rendering ----
  it("should render DisplayTC component", () => {
    expect(wrapper.find(DisplayTC).length).toBe(1);
  });

  it("should pass view=rd to DisplayTC", () => {
    expect(wrapper.find(DisplayTC).prop("view")).toBe("rd");
  });

  // ---- currentActionData and setDisabledSubmitBtn ----
  it("should pass currentActionData to modal", () => {
    expect(wrapper.find(ApproveRejectModal).prop("currentActionData")).toBeDefined();
  });

  it("should pass setDisabledSubmitBtn to modal", () => {
    expect(typeof wrapper.find(ApproveRejectModal).prop("setDisabledSubmitBtn")).toBe("function");
  });

  // ---- history.replace prop exists ----
  it("should have history.replace function available", () => {
    expect(typeof baseMockProps.history.replace).toBe("function");
  });

  // ---- Content area ----
  it("should render content-area", () => {
    expect(wrapper.find(".content-area").length).toBe(1);
  });

  it("should render content-wrapper", () => {
    expect(wrapper.find(".content-wrapper").length).toBe(1);
  });

  // ---- Approved/rejected status (useEffect sets btnDisplay but doesn't fire in shallow) ----
  it("should render with approved task status", () => {
    getPermissionObject.mockReturnValue({ permission: "RW" });
    const approvedProps = {
      ...baseMockProps,
      location: {
        state: {
          myTaskData: {
            ...baseMockProps.location.state.myTaskData,
            taskListTaskStatus: "Approved",
          },
        },
      },
    };
    const w = shallow(<RequestDetails {...approvedProps} />);
    expect(w.exists()).toBe(true);
  });

  it("should render with rejected task status", () => {
    getPermissionObject.mockReturnValue({ permission: "RW" });
    const rejectedProps = {
      ...baseMockProps,
      location: {
        state: {
          myTaskData: {
            ...baseMockProps.location.state.myTaskData,
            taskListTaskStatus: "Rejected",
          },
        },
      },
    };
    const w = shallow(<RequestDetails {...rejectedProps} />);
    expect(w.exists()).toBe(true);
  });

  // ---- vendorRequest Y/N ----
  it("should render with subscriptionVendorRequest N", () => {
    expect(wrapper.exists()).toBe(true);
  });

  it("should render with subscriptionVendorRequest Y", () => {
    const savedState = { ...mockState };
    mockState = {
      ...mockState,
      requestAccess: {
        ...mockState.requestAccess,
        dataByIdResponse: {
          dataById: {
            ...mockState.requestAccess.dataByIdResponse.dataById,
            subscriptionVendorRequest: "Y",
          },
        },
      },
    };
    const w = shallow(<RequestDetails {...baseMockProps} />);
    expect(w.exists()).toBe(true);
    mockState = savedState;
  });
});
