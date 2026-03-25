import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { Button, PageHeader, Breadcrumb as AntBreadcrumb } from "antd";
import ContractApproveRejectView, {
  conVertDateArrayToDate,
} from "../../../components/addContract/contractApproveRejectView";
import { RequestModal } from "../../../components/myTasks";

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

const mockMyTaskData = {
  taskListId: "T1",
  taskListObjectAction: "Create",
  taskListTaskStatus: "Pending",
  taskListObject: "Contract",
  taskListCreatedBy: "other_user",
};
const mockHistoryPush = jest.fn();
const mockHistory = {
  push: mockHistoryPush,
  location: { state: { myTaskData: mockMyTaskData } },
};
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ id: "C1" }),
  useHistory: () => mockHistory,
}));

jest.mock("../../../store/actions/contractAction", () => ({
  getContractDetailsByChangeRequestId: jest.fn((x) => "getContractDetailsByChangeRequestId_" + x),
  getContractDetailsById: jest.fn((x) => "getContractDetailsById_" + x),
}));

jest.mock("../../../store/actions/MyTasksActions", () => ({
  updateTaskAction: jest.fn(() => "updateTaskAction"),
}));

jest.mock("../../../utils/accessMyTask", () => {
  const fn = jest.fn().mockReturnValue(false);
  return fn;
});

const { updateTaskAction } = require("../../../store/actions/MyTasksActions");
const isAcessDisabled = require("../../../utils/accessMyTask");

const contractDetails = {
  agreementExpiryDate: null,
  agreementPartyId: "P1",
  agreementReferenceText: "Ref Text",
  agreementScbAgreementMgrBankId: "B1",
  agreementSignedOn: "2023-01-15",
  agreementStartDate: "2023-01-01",
  agreementStatus: "Active",
  agreementId: "A1",
  agreementLimitations: "Some limitations",
  agreementLink: "https://link.com",
  agreementName: "Test Agreement",
  agreementType: "Contract",
  agreementValue: "100",
  agreementReferenceId: "R1",
};

mockState = {
  contract: {
    contractDetails: { ...contractDetails },
  },
  vendor: [],
};

const baseMockProps = {
  location: {
    state: {
      myTaskData: { ...mockMyTaskData },
    },
  },
  history: { push: jest.fn() },
};

describe("ContractApproveRejectView", () => {
  let wrapper;

  beforeEach(() => {
    mockDispatch.mockClear();
    mockHistoryPush.mockClear();
    updateTaskAction.mockClear();
    isAcessDisabled.mockReturnValue(false);
    mockDispatch.mockReturnValue(Promise.resolve({ data: { success: true } }));
    localStorage.clear();
    localStorage.setItem("psid", "current_user");
    localStorage.setItem("entitlementType", "Admin");
    baseMockProps.history.push.mockClear();
    mockHistory.location = { state: { myTaskData: mockMyTaskData } };
    wrapper = shallow(<ContractApproveRejectView {...baseMockProps} />);
  });

  it("should render without crashing", () => {
    expect(wrapper.exists()).toBe(true);
  });

  it("should render Approve and Reject buttons", () => {
    const buttons = wrapper.find(".btn-parent").find(Button);
    expect(buttons.length).toBe(2);
  });

  it("should render the panel area", () => {
    expect(wrapper.find(".panel").length).toBe(1);
  });

  it("should render breadcrumb area", () => {
    expect(wrapper.find(".breadcrumb-area").length).toBe(1);
  });

  // ---- conVertDateArrayToDate utility ----
  it("should convert date array to formatted date", () => {
    const result = conVertDateArrayToDate([2023, 1, 15]);
    expect(result).toBeDefined();
  });

  it("should return undefined for null dateArray", () => {
    const result = conVertDateArrayToDate(null);
    expect(result).toBeUndefined();
  });

  it("should return undefined for undefined dateArray", () => {
    const result = conVertDateArrayToDate(undefined);
    expect(result).toBeUndefined();
  });

  // ---- Render with different actions ----
  it("should render with Create action props", () => {
    expect(wrapper.exists()).toBe(true);
  });

  it("should render with Update action props", () => {
    const updateMyTaskData = { ...mockMyTaskData, taskListObjectAction: "Update" };
    mockHistory.location = { state: { myTaskData: updateMyTaskData } };
    const w = shallow(<ContractApproveRejectView
      {...baseMockProps}
      location={{ state: { myTaskData: updateMyTaskData } }}
    />);
    expect(w.exists()).toBe(true);
    mockHistory.location = { state: { myTaskData: mockMyTaskData } };
  });

  it("should render with Deactivate action props", () => {
    const deactivateMyTaskData = { ...mockMyTaskData, taskListObjectAction: "Deactivate" };
    mockHistory.location = { state: { myTaskData: deactivateMyTaskData } };
    const w = shallow(<ContractApproveRejectView
      {...baseMockProps}
      location={{ state: { myTaskData: deactivateMyTaskData } }}
    />);
    expect(w.exists()).toBe(true);
    mockHistory.location = { state: { myTaskData: mockMyTaskData } };
  });

  // ---- Contract details rendering ----
  it("should render Agreement Details section headers", () => {
    expect(wrapper.find(".details-header-review").length).toBeGreaterThanOrEqual(1);
  });

  it("should render agreement limitations section", () => {
    const headers = wrapper.find(".details-header-review");
    const hasLimitations = headers.someWhere((n) => n.text().includes("Agreement Limitations"));
    expect(hasLimitations).toBe(true);
  });

  it("should render agreement document section", () => {
    const headers = wrapper.find(".details-header-review");
    const hasDocument = headers.someWhere((n) => n.text().includes("Agreement Document"));
    expect(hasDocument).toBe(true);
  });

  // ---- Null contract data renders nothing ----
  it("should not render details when contract data is null", () => {
    const savedState = { ...mockState };
    mockState = { contract: null, vendor: [] };
    const w = shallow(<ContractApproveRejectView {...baseMockProps} />);
    expect(w.find(".details-header-review").length).toBe(0);
    mockState = savedState;
  });

  // ---- isBtnDisplay ----
  it("should disable buttons when taskListTaskStatus is Approved", () => {
    const approvedMyTaskData = { ...mockMyTaskData, taskListTaskStatus: "Approved" };
    mockHistory.location = { state: { myTaskData: approvedMyTaskData } };
    const w = shallow(<ContractApproveRejectView
      {...baseMockProps}
      location={{ state: { myTaskData: approvedMyTaskData } }}
    />);
    expect(w.find(".btn-parent").find(Button).at(0).prop("disabled")).toBe(true);
    expect(w.find(".btn-parent").find(Button).at(1).prop("disabled")).toBe(true);
    mockHistory.location = { state: { myTaskData: mockMyTaskData } };
  });

  it("should not disable buttons when taskListTaskStatus is Pending", () => {
    const buttons = wrapper.find(".btn-parent").find(Button);
    expect(buttons.at(0).prop("disabled")).toBe(false);
    expect(buttons.at(1).prop("disabled")).toBe(false);
  });

  it("should disable buttons when isAcessDisabled returns true", () => {
    isAcessDisabled.mockReturnValue(true);
    const w = shallow(<ContractApproveRejectView {...baseMockProps} />);
    expect(w.find(".btn-parent").find(Button).at(0).prop("disabled")).toBe(true);
  });

  it("should disable buttons when taskListCreatedBy matches psid", () => {
    localStorage.setItem("psid", "other_user");
    const w = shallow(<ContractApproveRejectView {...baseMockProps} />);
    expect(w.find(".btn-parent").find(Button).at(0).prop("disabled")).toBe(true);
  });

  // ---- showApproveModal / handleApprove ----
  it("should have onClick handler on Approve button", () => {
    const approveBtn = wrapper.find(".btn-parent").find(Button).at(1);
    expect(typeof approveBtn.prop("onClick")).toBe("function");
    // Trigger onClick (memo may prevent state update visibility in shallow)
    approveBtn.prop("onClick")();
  });

  it("should dispatch updateTaskAction on handleApprove", async () => {
    wrapper.find(".btn-parent").find(Button).at(1).prop("onClick")();
    wrapper.update();
    await wrapper.find(RequestModal).at(0).prop("handleOk")();
    expect(updateTaskAction).toHaveBeenCalled();
  });

  it("should navigate on successful approve", async () => {
    mockDispatch.mockReturnValue(Promise.resolve({ data: true }));
    wrapper.find(".btn-parent").find(Button).at(1).prop("onClick")();
    wrapper.update();
    await wrapper.find(RequestModal).at(0).prop("handleOk")();
    expect(mockHistoryPush).toHaveBeenCalledWith("/myTasks");
  });

  it("should not navigate when approve response has no data", async () => {
    mockDispatch.mockReturnValue(Promise.resolve({}));
    wrapper.find(".btn-parent").find(Button).at(1).prop("onClick")();
    wrapper.update();
    await wrapper.find(RequestModal).at(0).prop("handleOk")();
    expect(mockHistoryPush).not.toHaveBeenCalledWith("/myTasks");
  });

  // ---- handleApproveCancel ----
  it("should have handleCancel on approve modal", () => {
    const approveModal = wrapper.find(RequestModal).at(0);
    expect(typeof approveModal.prop("handleCancel")).toBe("function");
    approveModal.prop("handleCancel")();
  });

  // ---- showRejectModal ----
  it("should have onClick handler on Reject button", () => {
    const rejectBtn = wrapper.find(".btn-parent").find(Button).at(0);
    expect(typeof rejectBtn.prop("onClick")).toBe("function");
    rejectBtn.prop("onClick")();
  });

  // ---- handleRejectCancel ----
  it("should handle reject cancel and close modal", () => {
    wrapper.find(".btn-parent").find(Button).at(0).prop("onClick")();
    wrapper.update();
    wrapper.find(RequestModal).at(1).prop("handleCancel")();
    wrapper.update();
    expect(wrapper.find(RequestModal).at(1).prop("isModalVisible")).toBe(false);
  });

  // ---- Reject modal structure ----
  it("should have handleOk on reject modal", () => {
    expect(typeof wrapper.find(RequestModal).at(1).prop("handleOk")).toBe("function");
  });

  // ---- Initial modal state ----
  it("should have approve modal not visible initially", () => {
    expect(wrapper.find(RequestModal).at(0).prop("isModalVisible")).toBe(false);
  });

  it("should have reject modal not visible initially", () => {
    expect(wrapper.find(RequestModal).at(1).prop("isModalVisible")).toBe(false);
  });

  // ---- PageHeader ----
  it("should call history.push on PageHeader back", () => {
    wrapper.find(PageHeader).prop("onBack")();
    expect(baseMockProps.history.push).toHaveBeenCalledWith("/myTasks");
  });

  it("should render PageHeader", () => {
    expect(wrapper.find(PageHeader).length).toBe(1);
  });

  // ---- Two RequestModals ----
  it("should render two RequestModal components", () => {
    expect(wrapper.find(RequestModal).length).toBe(2);
  });

  // ---- Modal titles ----
  it("should have correct title on approve modal", () => {
    expect(wrapper.find(RequestModal).at(0).prop("title")).toBe("Approve Task");
  });

  it("should have correct title on reject modal", () => {
    expect(wrapper.find(RequestModal).at(1).prop("title")).toBe("Reject Task");
  });

  // ---- Breadcrumb ----
  it("should render AntBreadcrumb", () => {
    expect(wrapper.find(AntBreadcrumb).length).toBe(1);
  });

  it("should render breadcrumb items", () => {
    expect(wrapper.find(AntBreadcrumb.Item).length).toBe(3);
  });

  // ---- Content areas ----
  it("should render content-area", () => {
    expect(wrapper.find(".content-area").length).toBe(1);
  });

  it("should render content-wrapper", () => {
    expect(wrapper.find(".content-wrapper").length).toBe(1);
  });

  // ---- label-review elements ----
  it("should render multiple label-review spans", () => {
    expect(wrapper.find(".label-review").length).toBeGreaterThan(5);
  });
});
