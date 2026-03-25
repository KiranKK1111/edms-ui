import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { Button, PageHeader, Col } from "antd";
import DatasetTasklistDetails from "../../../components/datasetForm/DatasetTasklistDetails";
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
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ id: "DS1" }),
  useHistory: () => ({ push: mockHistoryPush }),
}));

jest.mock("../../../store/actions/DatasetPageActions", () => ({
  startGetDatasets: jest.fn(() => "startGetDatasets"),
  gerDatasetByCrId: jest.fn((x) => "gerDatasetByCrId_" + x),
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

const datasetRecord = {
  datasetId: "DS1",
  longName: "Dataset One",
  shortName: "DS1Short",
  datasetStatus: "Active",
  datasetDescription: "A dataset",
};

mockState = {
  dataset: {
    datasetsInfo: [datasetRecord],
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
        taskListObject: "Dataset",
      },
    },
  },
  history: { push: jest.fn() },
};

describe("DatasetTasklistDetails", () => {
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
    wrapper = shallow(<DatasetTasklistDetails {...baseMockProps} />);
  });

  it("should render without crashing", () => {
    expect(wrapper.exists()).toBe(true);
  });

  it("should render the main container", () => {
    expect(wrapper.find("#main").length).toBe(1);
  });

  it("should render Approve and Reject buttons", () => {
    const buttons = wrapper.find(".btn-parent").find(Button);
    expect(buttons.length).toBe(2);
  });

  it("should render PageHeader", () => {
    expect(wrapper.find(PageHeader).length).toBe(1);
  });

  it("should render dataset details heading", () => {
    expect(wrapper.find("h3").text()).toContain("Dataset details");
  });

  it("should render breadcrumb area", () => {
    expect(wrapper.find(".breadcrumb-area").length).toBe(1);
  });

  // ---- Buttons not disabled for Pending ----
  it("should not disable buttons when taskListTaskStatus is Pending", () => {
    const buttons = wrapper.find(".btn-parent").find(Button);
    expect(buttons.at(0).prop("disabled")).toBe(false);
    expect(buttons.at(1).prop("disabled")).toBe(false);
  });

  // ---- isBtnDisplay when isAcessDisabled is true ----
  it("should disable buttons when isAcessDisabled returns true", () => {
    isAcessDisabled.mockReturnValue(true);
    const w = shallow(<DatasetTasklistDetails {...baseMockProps} />);
    expect(w.find(".btn-parent").find(Button).at(0).prop("disabled")).toBe(true);
  });

  // ---- isBtnDisplay when createdBy === psid ----
  it("should disable buttons when taskListCreatedBy equals psid", () => {
    localStorage.setItem("psid", "other_user");
    const w = shallow(<DatasetTasklistDetails {...baseMockProps} />);
    expect(w.find(".btn-parent").find(Button).at(0).prop("disabled")).toBe(true);
  });

  // ---- Renders with Create action ----
  it("should render with Create action props", () => {
    const w = shallow(<DatasetTasklistDetails {...baseMockProps} />);
    expect(w.exists()).toBe(true);
  });

  // ---- Renders with Update action ----
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
    const w = shallow(<DatasetTasklistDetails {...updateProps} />);
    expect(w.exists()).toBe(true);
  });

  // ---- Renders with Deactivate action ----
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
    const w = shallow(<DatasetTasklistDetails {...deactivateProps} />);
    expect(w.exists()).toBe(true);
  });

  // ---- Breadcrumb shows dash when no data (useEffect doesn't fire in shallow) ----
  it("should show dash in breadcrumb when datasetObj is empty", () => {
    const bc = wrapper.find(Breadcrumb);
    // useEffect doesn't fire in shallow rendering, so datasetObj stays []
    expect(bc.prop("breadcrumb")[1].name).toBe("-");
  });

  // ---- Empty datasetsInfo ----
  it("should handle empty datasetsInfo", () => {
    const savedState = { ...mockState };
    mockState = { dataset: { datasetsInfo: [] } };
    const w = shallow(<DatasetTasklistDetails {...baseMockProps} />);
    expect(w.exists()).toBe(true);
    mockState = savedState;
  });

  // ---- Non-Create renders correctly ----
  it("should render correctly for non-Create action", () => {
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
    const w = shallow(<DatasetTasklistDetails {...updateProps} />);
    expect(w.exists()).toBe(true);
  });

  // ---- showApproveModal ----
  it("should open approve modal when Approve button clicked", () => {
    wrapper.find(".btn-parent").find(Button).at(1).prop("onClick")();
    wrapper.update();
    expect(wrapper.find(RequestModal).at(0).prop("isModalVisible")).toBe(true);
  });

  // ---- handleApprove ----
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
  it("should handle approve cancel and close modal", () => {
    wrapper.find(".btn-parent").find(Button).at(1).prop("onClick")();
    wrapper.update();
    expect(wrapper.find(RequestModal).at(0).prop("isModalVisible")).toBe(true);
    wrapper.find(RequestModal).at(0).prop("handleCancel")();
    wrapper.update();
    expect(wrapper.find(RequestModal).at(0).prop("isModalVisible")).toBe(false);
  });

  // ---- showRejectModal ----
  it("should open reject modal when Reject button clicked", () => {
    wrapper.find(".btn-parent").find(Button).at(0).prop("onClick")();
    wrapper.update();
    expect(wrapper.find(RequestModal).at(1).prop("isModalVisible")).toBe(true);
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

  // ---- Reject modal structure ----
  it("should have handleOk prop on reject modal", () => {
    expect(typeof wrapper.find(RequestModal).at(1).prop("handleOk")).toBe("function");
  });

  // ---- Initial modal state ----
  it("should have approve modal not visible initially", () => {
    expect(wrapper.find(RequestModal).at(0).prop("isModalVisible")).toBe(false);
  });

  it("should have reject modal not visible initially", () => {
    expect(wrapper.find(RequestModal).at(1).prop("isModalVisible")).toBe(false);
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

  // ---- PageHeader onBack ----
  it("should call history.push on PageHeader back", () => {
    wrapper.find(PageHeader).prop("onBack")();
    expect(baseMockProps.history.push).toHaveBeenCalledWith("/myTasks");
  });

  // ---- Breadcrumb with correct data ----
  it("should pass correct breadcrumb first item", () => {
    const bc = wrapper.find(Breadcrumb);
    expect(bc.prop("breadcrumb")[0]).toEqual({ name: "My Tasks", url: "/myTasks" });
  });

  // ---- Review submit section rendered ----
  it("should render review-submit section", () => {
    expect(wrapper.find(".review-submit").length).toBe(1);
  });

  // ---- form-layout rendered ----
  it("should render form-layout content-wrapper", () => {
    expect(wrapper.find(".form-layout").length).toBe(1);
  });
});
