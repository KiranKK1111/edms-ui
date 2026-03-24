import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { Form, Input } from "antd";
import ApproveRejectModal from "../../components/Modals/ApproveRejectModal";
import RequestModal from "../../components/myTasks/RequestModal";

configure({ adapter: new Adapter() });

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

jest.mock("../../store/actions/MyTasksActions.js", () => ({
  getAllTasks: jest.fn(),
  getOverViewRecordsList: jest.fn(),
  updateTaskAction: jest.fn(),
}));

const defaultProps = {
  approveModal: false,
  rejectModal: false,
  currentActionData: {},
  setDisabledSubmitBtn: jest.fn(),
  refreshPage: jest.fn(),
};

describe("ApproveRejectModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render main container", () => {
    const wrapper = shallow(<ApproveRejectModal {...defaultProps} />);
    expect(wrapper.find("#main").length).toBe(1);
  });

  it("should render two RequestModal components", () => {
    const wrapper = shallow(<ApproveRejectModal {...defaultProps} />);
    expect(wrapper.find(RequestModal).length).toBe(2);
  });

  it("should render Approve Task modal", () => {
    const wrapper = shallow(<ApproveRejectModal {...defaultProps} />);
    const approveModal = wrapper
      .find(RequestModal)
      .filterWhere((m) => m.prop("title") === "Approve Task");
    expect(approveModal.length).toBe(1);
  });

  it("should render Reject Task modal", () => {
    const wrapper = shallow(<ApproveRejectModal {...defaultProps} />);
    const rejectModal = wrapper
      .find(RequestModal)
      .filterWhere((m) => m.prop("title") === "Reject Task");
    expect(rejectModal.length).toBe(1);
  });

  it("should render Form inside reject modal", () => {
    const wrapper = shallow(<ApproveRejectModal {...defaultProps} />);
    expect(wrapper.find(Form).length).toBe(1);
  });

  it("should render reason TextArea in reject form", () => {
    const wrapper = shallow(<ApproveRejectModal {...defaultProps} />);
    const textarea = wrapper.find(Input.TextArea || "TextArea");
    expect(textarea.length).toBe(1);
  });

  it("should render Form.Item for reason", () => {
    const wrapper = shallow(<ApproveRejectModal {...defaultProps} />);
    const formItem = wrapper
      .find(Form.Item)
      .filterWhere((fi) => fi.prop("name") === "reason");
    expect(formItem.length).toBe(1);
  });

  it("should show approve modal text", () => {
    const wrapper = shallow(<ApproveRejectModal {...defaultProps} />);
    const approveModal = wrapper
      .find(RequestModal)
      .filterWhere((m) => m.prop("title") === "Approve Task");
    expect(approveModal.children().text()).toContain(
      "Are you sure you want to proceed?"
    );
  });

  it("should show reject modal text", () => {
    const wrapper = shallow(<ApproveRejectModal {...defaultProps} />);
    expect(wrapper.find("p").text()).toContain("reason for rejecting");
  });

  it("should pass approve modal visibility", () => {
    const wrapper = shallow(
      <ApproveRejectModal {...defaultProps} approveModal={true} />
    );
    expect(wrapper.exists()).toBe(true);
  });

  it("should pass reject modal visibility", () => {
    const wrapper = shallow(
      <ApproveRejectModal {...defaultProps} rejectModal={true} />
    );
    expect(wrapper.exists()).toBe(true);
  });

  it("should render with currentActionData", () => {
    const wrapper = shallow(
      <ApproveRejectModal
        {...defaultProps}
        currentActionData={{ taskId: "T001", taskListTaskStatus: "Pending" }}
      />
    );
    expect(wrapper.exists()).toBe(true);
  });

  it("should have reason field with max 250 chars", () => {
    const wrapper = shallow(<ApproveRejectModal {...defaultProps} />);
    const textarea = wrapper.find(Input.TextArea || "TextArea");
    expect(textarea.prop("maxLength")).toBe(250);
  });
});
