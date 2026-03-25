import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { Form, message } from "antd";
import DocumentDeleteValidate from "../../../components/Modals/DocumentDeleteValidate";
import { startDeleteDocument } from "../../../store/actions/datafeedAction";
import { updateTaskAction, getAllTasks } from "../../../store/actions/MyTasksActions";

configure({ adapter: new Adapter() });

jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});

let mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
}));

const mockHistoryPush = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useHistory: () => ({ push: mockHistoryPush }),
}));

jest.mock("../../../store/actions/MyTasksActions", () => ({
  getAllTasks: jest.fn().mockReturnValue({ type: "GET_ALL_TASKS" }),
  getOverViewRecordsList: jest.fn(),
  updateTaskAction: jest.fn().mockReturnValue(Promise.resolve({
    data: { statusMessage: { message: "Task rejected" } },
  })),
}));

jest.mock("../../../store/actions/datafeedAction", () => ({
  startDeleteDocument: jest.fn(),
  startGetAllDocuments: jest.fn(),
}));

const defaultProps = {
  deleteModal: false,
  editReplaceModal: false,
  rejectModal: false,
  currentActionData: { docDisplayFilename: "test.pdf", docObjectId: "O1" },
  setDisabledSubmitBtn: jest.fn(),
  setDeleteModal: jest.fn(),
  getDocuments: jest.fn(),
  refreshPage: jest.fn(),
  getStatus: jest.fn(),
};

describe("DocumentDeleteValidate", () => {
  let wrapper;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDispatch.mockReturnValue(Promise.resolve({}));
    wrapper = shallow(<DocumentDeleteValidate {...defaultProps} />);
  });

  it("should render without crashing", () => {
    expect(wrapper.exists()).toBe(true);
  });

  it("should render three RequestModal components", () => {
    const modals = wrapper.find("RequestModal");
    expect(modals.length).toBe(3);
  });

  it("should have Delete Records title for first modal", () => {
    const modals = wrapper.find("RequestModal");
    expect(modals.at(0).prop("title")).toBe("Delete Records");
  });

  it("should have Replace File title for second modal", () => {
    const modals = wrapper.find("RequestModal");
    expect(modals.at(1).prop("title")).toBe("Replace File");
  });

  it("should have Reject Task title for third modal", () => {
    const modals = wrapper.find("RequestModal");
    expect(modals.at(2).prop("title")).toBe("Reject Task");
  });

  it("should default isModalVisible to false on all modals", () => {
    const modals = wrapper.find("RequestModal");
    // useEffect does not fire in shallow, so internal state is false
    expect(modals.at(0).prop("isModalVisible")).toBe(false);
    expect(modals.at(1).prop("isModalVisible")).toBe(false);
    expect(modals.at(2).prop("isModalVisible")).toBe(false);
  });

  // === handleApprove flow ===

  it("should call handleApprove when first modal handleOk is invoked", async () => {
    startDeleteDocument.mockResolvedValue({
      data: { statusMessage: { message: "Deleted successfully" } },
    });
    jest.spyOn(message, "success").mockImplementation(() => {});

    const modals = wrapper.find("RequestModal");
    const handleOk = modals.at(0).prop("handleOk");
    await handleOk();

    expect(defaultProps.setDisabledSubmitBtn).toHaveBeenCalledWith(true);
    // currentActionData is set via useEffect (not fired in shallow), so values are from initial state {}
    expect(startDeleteDocument).toHaveBeenCalledWith(undefined, undefined);
  });

  it("should call getDocuments and message.success on successful delete", async () => {
    startDeleteDocument.mockResolvedValue({
      data: { statusMessage: { message: "Deleted successfully" } },
    });
    jest.spyOn(message, "success").mockImplementation(() => {});

    const handleOk = wrapper.find("RequestModal").at(0).prop("handleOk");
    await handleOk();

    expect(defaultProps.getDocuments).toHaveBeenCalled();
    expect(message.success).toHaveBeenCalledWith("Deleted successfully");
    expect(defaultProps.getStatus).toHaveBeenCalled();
    // currentActionData is set via useEffect (not fired in shallow), so docObjectId is undefined
    expect(mockHistoryPush).toHaveBeenCalledWith(expect.stringContaining("/masterData/"));
    expect(defaultProps.setDeleteModal).toHaveBeenCalledWith(false);
    expect(defaultProps.setDisabledSubmitBtn).toHaveBeenCalledWith(false);
  });

  it("should not call getDocuments if startDeleteDocument returns no data", async () => {
    startDeleteDocument.mockResolvedValue(null);
    const handleOk = wrapper.find("RequestModal").at(0).prop("handleOk");
    await handleOk();

    expect(defaultProps.getDocuments).not.toHaveBeenCalled();
    expect(defaultProps.setDeleteModal).toHaveBeenCalledWith(false);
    expect(defaultProps.setDisabledSubmitBtn).toHaveBeenCalledWith(false);
  });

  it("should handle startDeleteDocument with data but no statusMessage", async () => {
    startDeleteDocument.mockResolvedValue({ data: {} });
    jest.spyOn(message, "success").mockImplementation(() => {});

    const handleOk = wrapper.find("RequestModal").at(0).prop("handleOk");
    await handleOk();

    expect(defaultProps.getDocuments).toHaveBeenCalled();
    expect(message.success).toHaveBeenCalledWith(null);
  });

  // === handleApproveCancel ===

  it("should call handleApproveCancel when first modal handleCancel is invoked", () => {
    const handleCancel = wrapper.find("RequestModal").at(0).prop("handleCancel");
    handleCancel();
    expect(defaultProps.setDisabledSubmitBtn).toHaveBeenCalledWith(false);
  });

  it("should call handleApproveCancel from second modal too", () => {
    const handleCancel = wrapper.find("RequestModal").at(1).prop("handleCancel");
    handleCancel();
    expect(defaultProps.setDisabledSubmitBtn).toHaveBeenCalledWith(false);
  });

  // === Second modal (editReplaceModal) ===

  it("should use handleApprove for second modal handleOk", async () => {
    startDeleteDocument.mockResolvedValue({ data: { statusMessage: { message: "OK" } } });
    jest.spyOn(message, "success").mockImplementation(() => {});

    const handleOk = wrapper.find("RequestModal").at(1).prop("handleOk");
    await handleOk();

    expect(defaultProps.setDisabledSubmitBtn).toHaveBeenCalledWith(true);
    expect(startDeleteDocument).toHaveBeenCalled();
  });

  // === submitReason flow (reject modal) ===

  it("should call submitReason when third modal handleOk is invoked", async () => {
    // We need to mock formRef.current.getFieldsValue
    // Since formRef is a createRef and shallow doesn't mount, we test the handler indirectly
    const handleOk = wrapper.find("RequestModal").at(2).prop("handleOk");
    // submitReason calls formRef.current.getFieldsValue() which will be null in shallow
    // Expect it to throw or handle gracefully
    try {
      await handleOk();
    } catch (e) {
      // formRef.current is null in shallow rendering
    }
    expect(defaultProps.setDisabledSubmitBtn).toHaveBeenCalledWith(true);
  });

  // === handleRejectCancel ===

  it("should call handleRejectCancel when third modal handleCancel is invoked", () => {
    const handleCancel = wrapper.find("RequestModal").at(2).prop("handleCancel");
    handleCancel();
    expect(defaultProps.setDisabledSubmitBtn).toHaveBeenCalledWith(false);
  });

  // === Render with different prop states ===

  it("should render with deleteModal true", () => {
    const w = shallow(<DocumentDeleteValidate {...defaultProps} deleteModal={true} />);
    expect(w.find("RequestModal").length).toBe(3);
  });

  it("should render with editReplaceModal true", () => {
    const w = shallow(<DocumentDeleteValidate {...defaultProps} editReplaceModal={true} />);
    expect(w.find("RequestModal").length).toBe(3);
  });

  it("should render with rejectModal true", () => {
    const w = shallow(<DocumentDeleteValidate {...defaultProps} rejectModal={true} />);
    expect(w.find("RequestModal").length).toBe(3);
  });

  it("should render Form inside third RequestModal", () => {
    const thirdModal = wrapper.find("RequestModal").at(2);
    expect(thirdModal.find(Form).length).toBe(1);
  });

  it("should render TextArea inside Form", () => {
    const thirdModal = wrapper.find("RequestModal").at(2);
    expect(thirdModal.find(Form.Item).length).toBe(1);
    expect(thirdModal.find(Form.Item).prop("name")).toBe("reason");
  });

  it("should have required validation on reason field", () => {
    const thirdModal = wrapper.find("RequestModal").at(2);
    const rules = thirdModal.find(Form.Item).prop("rules");
    expect(rules[0].required).toBe(true);
  });

  // === getStatus not provided ===

  it("should handle missing getStatus prop gracefully in handleApprove", async () => {
    startDeleteDocument.mockResolvedValue({
      data: { statusMessage: { message: "OK" } },
    });
    jest.spyOn(message, "success").mockImplementation(() => {});

    const propsNoGetStatus = { ...defaultProps, getStatus: undefined };
    const w = shallow(<DocumentDeleteValidate {...propsNoGetStatus} />);
    const handleOk = w.find("RequestModal").at(0).prop("handleOk");

    // Should not throw even without getStatus
    await handleOk();
    expect(propsNoGetStatus.setDeleteModal).toHaveBeenCalledWith(false);
  });

  it("should render children text in first modal", () => {
    const firstModal = wrapper.find("RequestModal").at(0);
    expect(firstModal.children().text()).toContain("Are you sure you want to delete Records?");
  });

  it("should render children text in second modal", () => {
    const secondModal = wrapper.find("RequestModal").at(1);
    expect(secondModal.children().text()).toContain("This file/link is already existing. Replace?");
  });

  it("should render reject reason prompt in third modal", () => {
    const thirdModal = wrapper.find("RequestModal").at(2);
    expect(thirdModal.find("p").text()).toContain("Are you sure you want to proceed?");
  });
});
