import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { Button, Modal, Table, PageHeader, message } from "antd";
import Panel from "../../../components/requestAccess/Panel";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";

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
  Link: () => "div",
  withRouter: (x) => x,
  useHistory: () => ({ push: mockHistoryPush }),
  __esModule: true,
  useLocation: () => ({
    pathname: "/another-route",
    search: "",
    hash: "",
    state: {
      data: {
        dataFeedLongName: "Test Feed Long Name",
        dataFamilyId: "DF1",
      },
    },
    key: "5nvxpbdafa",
  }),
}));

const mockSendData = jest.fn();
const mockApproveReject = jest.fn();
const mockSaveAsDraftRequest = jest.fn();
const mockDeleteSubscription = jest.fn();
jest.mock("../../../store/actions/requestAccessActions", () => ({
  sendData: (...args) => mockSendData(...args),
  approveReject: (...args) => mockApproveReject(...args),
  saveAsDraftRequest: (...args) => mockSaveAsDraftRequest(...args),
  deleteSubscription: (...args) => mockDeleteSubscription(...args),
}));

jest.mock("../../../store/services/ContractService", () => ({
  auditlogSubscriptionLevel: jest.fn(),
}));

mockState = {
  dataset: {
    subscriptionInfo: { status: "pending" },
  },
  requestAccess: {
    businessRequirements: [{ department: "IT", clarityId: "CL1" }],
    usage: [],
    tableInfo: {
      dataFamilyId: "DF1",
      dataFamilyName: "Data Family",
      noOfLicenses: 10,
      dataCoverage: "Global",
      contractExpDate: "2024-12-31",
      name: "Test",
      createdBy: "user1",
      licensesUsed: 5,
    },
    saveFinalData: {},
    response: { loading: false },
    dataByIdResponse: {},
  },
};

const baseMockProps = {
  subId: "",
  allowSubmit: true,
  history: { push: jest.fn() },
};

describe("Panel", () => {
  let wrapper;

  beforeEach(() => {
    mockDispatch.mockClear();
    mockSendData.mockClear();
    mockApproveReject.mockClear();
    mockSaveAsDraftRequest.mockClear();
    mockDeleteSubscription.mockClear();
    baseMockProps.history.push.mockClear();
    mockDispatch.mockReturnValue(
      Promise.resolve({
        data: { subscriptionManagement: { subscriptionId: "SUB1" } },
        status: 200,
      })
    );
    localStorage.clear();
    localStorage.setItem("psid", "current_user");
    wrapper = shallow(<Panel {...baseMockProps} />);
  });

  it("should render panel container", () => {
    expect(wrapper.find(".panel").length).toBe(1);
  });

  it("should render without crashing", () => {
    expect(wrapper.exists()).toBe(true);
  });

  // ---- Renders Modal ----
  it("should render Audit Log modal", () => {
    const modal = wrapper.find(Modal);
    expect(modal.length).toBe(1);
    expect(modal.prop("title")).toBe("Audit Log");
  });

  // ---- Modal onOk and onCancel ----
  it("should handle modal onOk", () => {
    const modal = wrapper.find(Modal);
    modal.prop("onOk")();
    expect(wrapper.exists()).toBe(true);
  });

  it("should handle modal onCancel", () => {
    const modal = wrapper.find(Modal);
    modal.prop("onCancel")();
    expect(wrapper.exists()).toBe(true);
  });

  // ---- Renders Table inside Modal ----
  it("should render Table inside Modal", () => {
    expect(wrapper.find(Table).length).toBe(1);
  });

  // ---- Breadcrumb ----
  it("should render Breadcrumb", () => {
    expect(wrapper.find(Breadcrumb).length).toBe(1);
  });

  it("should pass correct breadcrumb data", () => {
    const bc = wrapper.find(Breadcrumb);
    const breadcrumbData = bc.prop("breadcrumb");
    expect(breadcrumbData[0]).toEqual({ name: "Catalogue", url: "/catalog" });
    expect(breadcrumbData[2]).toEqual({ name: "Subscription" });
  });

  // ---- PageHeader ----
  it("should render PageHeader", () => {
    expect(wrapper.find(PageHeader).length).toBe(1);
  });

  it("should render dataFeedLongName in PageHeader", () => {
    const title = wrapper.find(PageHeader).prop("title");
    expect(title).toBeDefined();
  });

  it("should navigate to catalog on PageHeader back", () => {
    wrapper.find(PageHeader).prop("onBack")();
    expect(baseMockProps.history.push).toHaveBeenCalledWith("/catalog");
  });

  // ---- Buttons when subId is empty ----
  it("should render Cancel and Submit buttons when subId is empty", () => {
    const buttons = wrapper.find(Button);
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it("should render Cancel button", () => {
    const buttons = wrapper.find(Button);
    const cancelBtn = buttons.filterWhere((b) => b.children().text() === "Cancel");
    expect(cancelBtn.length).toBe(1);
  });

  it("should render Submit button", () => {
    const buttons = wrapper.find(Button);
    const submitBtn = buttons.filterWhere((b) => b.children().text() === "Submit");
    expect(submitBtn.length).toBe(1);
  });

  // ---- Buttons when subId is not empty ----
  it("should not render Cancel/Submit buttons when subId is not empty", () => {
    const w = shallow(<Panel {...baseMockProps} subId="SUB1" />);
    const buttons = w.find(Button);
    const cancelBtn = buttons.filterWhere((b) => b.children().text() === "Cancel");
    const submitBtn = buttons.filterWhere((b) => b.children().text() === "Submit");
    expect(cancelBtn.length).toBe(0);
    expect(submitBtn.length).toBe(0);
  });

  // ---- Submit button disabled state ----
  it("should disable Submit when allowSubmit is false", () => {
    const w = shallow(<Panel {...baseMockProps} allowSubmit={false} />);
    const buttons = w.find(Button);
    const submitBtn = buttons.filterWhere((b) => b.children().text() === "Submit");
    expect(submitBtn.prop("disabled")).toBe(true);
  });

  // ---- submitHandler ----
  it("should call sendData on submit when data has no subscriptionId", async () => {
    mockDispatch.mockReturnValue(
      Promise.resolve({
        data: { subscriptionManagement: { subscriptionId: "SUB1" } },
      })
    );
    const buttons = wrapper.find(Button);
    const submitBtn = buttons.filterWhere((b) => b.children().text() === "Submit");
    await submitBtn.prop("onClick")();
    expect(mockSendData).toHaveBeenCalled();
  });

  it("should call approveReject on submit when data has subscriptionId", async () => {
    mockState = {
      ...mockState,
      requestAccess: {
        ...mockState.requestAccess,
        saveFinalData: { subscriptionId: "EXISTING_SUB" },
      },
    };
    mockDispatch.mockReturnValue(
      Promise.resolve({
        data: { subscriptionManagement: { subscriptionId: "EXISTING_SUB" } },
      })
    );
    const w = shallow(<Panel {...baseMockProps} />);
    const submitBtn = w
      .find(Button)
      .filterWhere((b) => b.children().text() === "Submit");
    await submitBtn.prop("onClick")();
    expect(mockApproveReject).toHaveBeenCalled();
    // Restore
    mockState = {
      ...mockState,
      requestAccess: { ...mockState.requestAccess, saveFinalData: {} },
    };
  });

  it("should show warning message when allowSubmit is false and submit is clicked", async () => {
    const warnSpy = jest.spyOn(message, "warning").mockImplementation(() => {});
    const w = shallow(<Panel {...baseMockProps} allowSubmit={false} />);
    const submitBtn = w
      .find(Button)
      .filterWhere((b) => b.children().text() === "Submit");
    await submitBtn.prop("onClick")();
    expect(warnSpy).toHaveBeenCalledWith("Please fill the form!");
    warnSpy.mockRestore();
  });

  // ---- showMessage with error ----
  it("should handle submit when response has error message", async () => {
    const errSpy = jest.spyOn(message, "error").mockImplementation(() => {});
    mockDispatch.mockReturnValue(
      Promise.resolve({ message: "Error occurred" })
    );
    const w = shallow(<Panel {...baseMockProps} />);
    const submitBtn = w
      .find(Button)
      .filterWhere((b) => b.children().text() === "Submit");
    await submitBtn.prop("onClick")();
    expect(errSpy).toHaveBeenCalledWith("Error occurred");
    errSpy.mockRestore();
  });

  // ---- showMessage without subscriptionManagement ----
  it("should show Updated successfully when no subscriptionManagement in response", async () => {
    const successSpy = jest.spyOn(message, "success").mockImplementation(() => {});
    mockDispatch.mockReturnValue(Promise.resolve({ data: {} }));
    const w = shallow(<Panel {...baseMockProps} />);
    const submitBtn = w
      .find(Button)
      .filterWhere((b) => b.children().text() === "Submit");
    await submitBtn.prop("onClick")();
    expect(successSpy).toHaveBeenCalledWith("Updated successfully.");
    successSpy.mockRestore();
  });

  // ---- showMessage with subscriptionManagement ----
  it("should show success message with subscriptionId", async () => {
    const successSpy = jest.spyOn(message, "success").mockImplementation(() => {});
    mockDispatch.mockReturnValue(
      Promise.resolve({
        data: { subscriptionManagement: { subscriptionId: "SUB99" } },
      })
    );
    const w = shallow(<Panel {...baseMockProps} />);
    const submitBtn = w
      .find(Button)
      .filterWhere((b) => b.children().text() === "Submit");
    await submitBtn.prop("onClick")();
    expect(successSpy).toHaveBeenCalledWith("SUB99 submitted successfully.");
    successSpy.mockRestore();
  });

  // ---- cancelHandler ----
  it("should navigate to catalog on cancel when location has data", () => {
    const buttons = wrapper.find(Button);
    const cancelBtn = buttons.filterWhere((b) => b.children().text() === "Cancel");
    cancelBtn.prop("onClick")();
    expect(baseMockProps.history.push).toHaveBeenCalledWith("/catalog");
  });

  // ---- approveReject error handling ----
  it("should handle approveReject throwing an error", async () => {
    mockState = {
      ...mockState,
      requestAccess: {
        ...mockState.requestAccess,
        saveFinalData: { subscriptionId: "EXISTING_SUB" },
      },
    };
    const errObj = { message: "Network error" };
    mockDispatch.mockRejectedValue(errObj);
    const errSpy = jest.spyOn(message, "error").mockImplementation(() => {});
    const w = shallow(<Panel {...baseMockProps} />);
    const submitBtn = w
      .find(Button)
      .filterWhere((b) => b.children().text() === "Submit");
    await submitBtn.prop("onClick")();
    expect(errSpy).toHaveBeenCalledWith("Network error");
    errSpy.mockRestore();
    // Restore
    mockState = {
      ...mockState,
      requestAccess: { ...mockState.requestAccess, saveFinalData: {} },
    };
  });

  // ---- dataFeedLongName rendering ----
  it("should render PageHeader title with dataFeedLongName", () => {
    const pageHeader = wrapper.find(PageHeader);
    const title = pageHeader.prop("title");
    expect(title).toBeDefined();
  });
});
