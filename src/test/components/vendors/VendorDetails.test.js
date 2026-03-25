import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { Button, PageHeader, Form } from "antd";
import VendorDetails from "../../../components/vendors/VendorDetails/VendorDetails";
import { RequestModal } from "../../../components/myTasks";
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
const mockUseParams = jest.fn().mockReturnValue({ id: "V1", taskId: "T1" });
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => mockUseParams(),
  useHistory: () => ({ push: mockHistoryPush }),
}));

jest.mock("../../../store/actions/VendorActions", () => ({
  getDetailsByChangeRequestId: jest.fn((x) => "getDetailsByChangeRequestId_" + x),
  getVendorDetailsById: jest.fn((x) => "getVendorDetailsById_" + x),
}));

jest.mock("../../../store/actions/MyTasksActions", () => ({
  updateTaskAction: jest.fn((x) => "updateTaskAction"),
}));

jest.mock("../../../utils/accessMyTask", () => {
  const fn = jest.fn().mockReturnValue(false);
  return fn;
});

const mockFormCurrent = {
  setFieldsValue: jest.fn(),
  getFieldsValue: jest.fn().mockReturnValue({ reason: "test reason" }),
};
const mockFormRef = { current: mockFormCurrent };
Object.defineProperty(mockFormRef, "current", {
  get: () => mockFormCurrent,
  set: () => {},
  configurable: true,
});
jest.spyOn(require("react"), "createRef").mockReturnValue(mockFormRef);

const { getVendorDetailsById, getDetailsByChangeRequestId } = require("../../../store/actions/VendorActions");
const { updateTaskAction } = require("../../../store/actions/MyTasksActions");
const isAcessDisabled = require("../../../utils/accessMyTask");

mockState = {
  vendor: {
    data: {
      entityId: "V1",
      longName: "Vendor One",
      shortName: "V1Short",
      entityType: "External",
      website: "example.com",
      entityStatus: "Active",
      entityDescription: "Test vendor description",
    },
  },
};

const baseMockProps = {
  location: {
    state: {
      myTaskData: {
        taskListId: "T1",
        taskListObjectAction: "Create",
        taskListTaskStatus: "Pending",
        taskListCreatedBy: "other_user",
        taskListObject: "Entity",
      },
    },
  },
  history: { push: jest.fn() },
};

describe("VendorDetails", () => {
  let wrapper;

  beforeEach(() => {
    mockDispatch.mockClear();
    mockHistoryPush.mockClear();
    mockFormCurrent.setFieldsValue.mockClear();
    mockFormCurrent.getFieldsValue.mockReset();
    mockFormCurrent.getFieldsValue.mockReturnValue({ reason: "test reason" });
    getVendorDetailsById.mockClear();
    getDetailsByChangeRequestId.mockClear();
    updateTaskAction.mockClear();
    isAcessDisabled.mockReturnValue(false);
    mockUseParams.mockReturnValue({ id: "V1", taskId: "T1" });
    mockDispatch.mockReturnValue(Promise.resolve({ data: { statusMessage: { message: "Success" } } }));
    localStorage.clear();
    localStorage.setItem("psid", "current_user");
    localStorage.setItem("entitlementType", "Admin");
    baseMockProps.history.push.mockClear();
    wrapper = shallow(<VendorDetails {...baseMockProps} />);
  });

  it("should render without crashing", () => {
    expect(wrapper.exists()).toBe(true);
  });

  it("should render entity-main container", () => {
    expect(wrapper.find(".entity-main").length).toBe(1);
  });

  it("should render Approve and Reject buttons", () => {
    const buttons = wrapper.find(Button);
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it("should render Entity Details heading", () => {
    expect(wrapper.find("h3").text()).toContain("Entity Details");
  });

  it("should render Form component", () => {
    expect(wrapper.find(Form).length).toBeGreaterThanOrEqual(1);
  });

  it("should render breadcrumb area", () => {
    expect(wrapper.find(".breadcrumb-area").length).toBe(1);
  });

  // ---- btnDisable: Pending => buttons not disabled (only checking isBtnDisplay other conditions) ----
  it("should not disable buttons when taskListTaskStatus is Pending and access allowed", () => {
    const rejectBtn = wrapper.find(".btn-parent").find(Button).at(0);
    const approveBtn = wrapper.find(".btn-parent").find(Button).at(1);
    expect(rejectBtn.prop("disabled")).toBe(false);
    expect(approveBtn.prop("disabled")).toBe(false);
  });

  // ---- isBtnDisplay when isAcessDisabled returns true ----
  it("should disable buttons when isAcessDisabled returns true", () => {
    isAcessDisabled.mockReturnValue(true);
    const w = shallow(<VendorDetails {...baseMockProps} />);
    const rejectBtn = w.find(".btn-parent").find(Button).at(0);
    expect(rejectBtn.prop("disabled")).toBe(true);
  });

  // ---- isBtnDisplay when createdBy === psid ----
  it("should disable buttons when taskListCreatedBy equals psid", () => {
    localStorage.setItem("psid", "other_user");
    const w = shallow(<VendorDetails {...baseMockProps} />);
    const rejectBtn = w.find(".btn-parent").find(Button).at(0);
    expect(rejectBtn.prop("disabled")).toBe(true);
  });

  // ---- useEffect: component renders correctly with Create action ----
  it("should render with Create action props", () => {
    const w = shallow(<VendorDetails {...baseMockProps} />);
    expect(w.exists()).toBe(true);
  });

  // ---- useEffect: component renders correctly with Update action ----
  it("should render with Update action props", () => {
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
    const w = shallow(<VendorDetails {...updateProps} />);
    expect(w.exists()).toBe(true);
  });

  it("should render with Deactivate action props", () => {
    const deactivateProps = {
      ...baseMockProps,
      location: {
        state: {
          myTaskData: {
            ...baseMockProps.location.state.myTaskData,
            taskListObjectAction: "Deactivate",
          },
        },
      },
    };
    const w = shallow(<VendorDetails {...deactivateProps} />);
    expect(w.exists()).toBe(true);
  });

  // ---- showApproveModal handler ----
  it("should open approve modal when Approve button is clicked", () => {
    const approveBtn = wrapper.find(".btn-parent").find(Button).at(1);
    approveBtn.prop("onClick")();
    wrapper.update();
    expect(wrapper.find(RequestModal).at(0).prop("isModalVisible")).toBe(true);
  });

  // ---- showRejectModal handler ----
  it("should open reject modal when Reject button is clicked", () => {
    const rejectBtn = wrapper.find(".btn-parent").find(Button).at(0);
    rejectBtn.prop("onClick")();
    wrapper.update();
    expect(wrapper.find(RequestModal).at(1).prop("isModalVisible")).toBe(true);
  });

  // ---- handleApprove dispatches and navigates ----
  it("should call handleApprove, dispatch updateTaskAction, and navigate on success", async () => {
    mockDispatch.mockReturnValue(
      Promise.resolve({ data: { statusMessage: { message: "Approved!" } } })
    );
    // Open approve modal first
    wrapper.find(".btn-parent").find(Button).at(1).prop("onClick")();
    wrapper.update();
    // Trigger handleApprove
    await wrapper.find(RequestModal).at(0).prop("handleOk")();
    expect(updateTaskAction).toHaveBeenCalled();
    expect(mockHistoryPush).toHaveBeenCalledWith("/myTasks");
  });

  // ---- handleApprove with no statusMessage ----
  it("should handle approve when response has no statusMessage", async () => {
    mockDispatch.mockReturnValue(Promise.resolve({ data: {} }));
    wrapper.find(".btn-parent").find(Button).at(1).prop("onClick")();
    wrapper.update();
    await wrapper.find(RequestModal).at(0).prop("handleOk")();
    expect(updateTaskAction).toHaveBeenCalled();
    // Should not push since no statusMessage
    expect(mockHistoryPush).not.toHaveBeenCalledWith("/myTasks");
  });

  // ---- handleApprove with null response ----
  it("should handle approve when response is null", async () => {
    mockDispatch.mockReturnValue(Promise.resolve(null));
    wrapper.find(".btn-parent").find(Button).at(1).prop("onClick")();
    wrapper.update();
    await wrapper.find(RequestModal).at(0).prop("handleOk")();
    expect(updateTaskAction).toHaveBeenCalled();
    expect(mockHistoryPush).not.toHaveBeenCalledWith("/myTasks");
  });

  // ---- handleApproveCancel ----
  it("should handle approve cancel and close modal", () => {
    // Open modal first
    wrapper.find(".btn-parent").find(Button).at(1).prop("onClick")();
    wrapper.update();
    expect(wrapper.find(RequestModal).at(0).prop("isModalVisible")).toBe(true);
    // Cancel
    wrapper.find(RequestModal).at(0).prop("handleCancel")();
    wrapper.update();
    expect(wrapper.find(RequestModal).at(0).prop("isModalVisible")).toBe(false);
  });

  // ---- submitReason / reject modal structure ----
  it("should have handleOk prop on reject modal for submitReason", () => {
    const rejectModal = wrapper.find(RequestModal).at(1);
    expect(typeof rejectModal.prop("handleOk")).toBe("function");
  });

  it("should render reject modal with reason form", () => {
    const rejectModal = wrapper.find(RequestModal).at(1);
    expect(rejectModal.find(Form).length).toBe(1);
    expect(rejectModal.find(Form.Item).length).toBe(1);
  });

  it("should render reason form field with required rule", () => {
    const rejectModal = wrapper.find(RequestModal).at(1);
    const reasonField = rejectModal.find(Form.Item);
    expect(reasonField.prop("name")).toBe("reason");
    expect(reasonField.prop("rules")).toEqual([{ required: true, message: "reason is mandatory !" }]);
  });

  it("should render reject modal with children content", () => {
    const rejectModal = wrapper.find(RequestModal).at(1);
    expect(rejectModal.children().length).toBeGreaterThan(0);
  });

  // ---- handleRejectCancel ----
  it("should handle reject cancel and close modal", () => {
    wrapper.find(".btn-parent").find(Button).at(0).prop("onClick")();
    wrapper.update();
    expect(wrapper.find(RequestModal).at(1).prop("isModalVisible")).toBe(true);
    wrapper.find(RequestModal).at(1).prop("handleCancel")();
    wrapper.update();
    expect(wrapper.find(RequestModal).at(1).prop("isModalVisible")).toBe(false);
  });

  // ---- Renders entity field labels ----
  it("should render Entity ID label", () => {
    const formItems = wrapper.find(Form.Item);
    const entityIdItem = formItems.filterWhere(n => n.prop("name") === "entityId");
    expect(entityIdItem.length).toBe(1);
  });

  it("should render Long Name label", () => {
    const formItems = wrapper.find(Form.Item);
    const longNameItem = formItems.filterWhere(n => n.prop("name") === "longName");
    expect(longNameItem.length).toBe(1);
  });

  it("should render Short Name label", () => {
    const formItems = wrapper.find(Form.Item);
    const shortNameItem = formItems.filterWhere(n => n.prop("name") === "shortName");
    expect(shortNameItem.length).toBe(1);
  });

  it("should render Entity Type label", () => {
    const formItems = wrapper.find(Form.Item);
    const entityTypeItem = formItems.filterWhere(n => n.prop("name") === "entityType");
    expect(entityTypeItem.length).toBe(1);
  });

  it("should render Website label", () => {
    const formItems = wrapper.find(Form.Item);
    const websiteItems = formItems.filterWhere(n => n.prop("name") === "website");
    expect(websiteItems.length).toBeGreaterThanOrEqual(1);
  });

  it("should render vendorDescription label", () => {
    const formItems = wrapper.find(Form.Item);
    const descItem = formItems.filterWhere(n => n.prop("name") === "vendorDescription");
    expect(descItem.length).toBe(1);
  });

  // ---- PageHeader onBack ----
  it("should call history.push on PageHeader back", () => {
    wrapper.find(PageHeader).prop("onBack")();
    expect(baseMockProps.history.push).toHaveBeenCalledWith("/myTasks");
  });

  // ---- Breadcrumb data ----
  it("should pass correct breadcrumb data", () => {
    const bc = wrapper.find(Breadcrumb);
    expect(bc.prop("breadcrumb")).toEqual([
      { name: "My Tasks", url: "/myTasks" },
      { name: "V1Short" },
    ]);
  });

  // ---- Two RequestModals rendered ----
  it("should render two RequestModal components", () => {
    expect(wrapper.find(RequestModal).length).toBe(2);
  });

  // ---- Initial modal state ----
  it("should have approve modal not visible initially", () => {
    expect(wrapper.find(RequestModal).at(0).prop("isModalVisible")).toBe(false);
  });

  it("should have reject modal not visible initially", () => {
    expect(wrapper.find(RequestModal).at(1).prop("isModalVisible")).toBe(false);
  });

  // ---- Approve modal title ----
  it("should have correct title on approve modal", () => {
    expect(wrapper.find(RequestModal).at(0).prop("title")).toBe("Approve Task");
  });

  // ---- Reject modal title ----
  it("should have correct title on reject modal", () => {
    expect(wrapper.find(RequestModal).at(1).prop("title")).toBe("Reject Task");
  });

  // ---- Divider rendered ----
  it("should render a Divider", () => {
    expect(wrapper.find("Divider").length).toBe(1);
  });
});
