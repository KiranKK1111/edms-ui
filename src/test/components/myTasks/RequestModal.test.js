import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { Modal, Button } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import RequestModal from "../../../components/myTasks/RequestModal";

configure({ adapter: new Adapter() });

describe("RequestModal", () => {
  const defaultProps = {
    isModalVisible: true,
    handleOk: jest.fn(),
    handleCancel: jest.fn(),
    title: "Approve Task",
  };

  it("should render a Modal component", () => {
    const wrapper = shallow(
      <RequestModal {...defaultProps}>Content</RequestModal>
    );
    expect(wrapper.find(Modal).length).toBe(1);
  });

  it("should pass visible prop from isModalVisible", () => {
    const wrapper = shallow(
      <RequestModal {...defaultProps}>Content</RequestModal>
    );
    expect(wrapper.find(Modal).prop("visible")).toBe(true);
  });

  it("should render children content", () => {
    const wrapper = shallow(
      <RequestModal {...defaultProps}>Test Content</RequestModal>
    );
    expect(wrapper.find(Modal).children().text()).toContain("Test Content");
  });

  it("should render Cancel and Submit buttons in footer", () => {
    const wrapper = shallow(
      <RequestModal {...defaultProps}>Content</RequestModal>
    );
    const footer = wrapper.find(Modal).prop("footer");
    expect(footer.length).toBe(2);
  });

  it("should show Approve button text for Approve Task title", () => {
    const wrapper = shallow(
      <RequestModal {...defaultProps}>Content</RequestModal>
    );
    const footer = wrapper.find(Modal).prop("footer");
    expect(footer[1].props.children).toBe("Approve");
  });

  it("should show Reject button text for Reject Task title", () => {
    const wrapper = shallow(
      <RequestModal {...defaultProps} title="Reject Task">
        Content
      </RequestModal>
    );
    const footer = wrapper.find(Modal).prop("footer");
    expect(footer[1].props.children).toBe("Reject");
  });

  it("should show Delete button text for Delete title", () => {
    const wrapper = shallow(
      <RequestModal {...defaultProps} title="Delete Records">
        Content
      </RequestModal>
    );
    const footer = wrapper.find(Modal).prop("footer");
    expect(footer[1].props.children).toBe("Delete");
  });

  it("should render CheckCircleOutlined icon for Approve Task", () => {
    const wrapper = shallow(
      <RequestModal {...defaultProps}>Content</RequestModal>
    );
    const titleProp = wrapper.find(Modal).prop("title");
    const titleWrapper = shallow(titleProp);
    expect(titleWrapper.find(CheckCircleOutlined).length).toBe(1);
  });

  it("should render CloseCircleOutlined icon for Reject Task", () => {
    const wrapper = shallow(
      <RequestModal {...defaultProps} title="Reject Task">
        Content
      </RequestModal>
    );
    const titleProp = wrapper.find(Modal).prop("title");
    const titleWrapper = shallow(titleProp);
    expect(titleWrapper.find(CloseCircleOutlined).length).toBe(1);
  });

  it("should render ExclamationCircleOutlined icon for Delete title", () => {
    const wrapper = shallow(
      <RequestModal {...defaultProps} title="Delete Records">
        Content
      </RequestModal>
    );
    const titleProp = wrapper.find(Modal).prop("title");
    const titleWrapper = shallow(titleProp);
    expect(titleWrapper.find(ExclamationCircleOutlined).length).toBe(1);
  });

  it("should have primary type button for Approve Task", () => {
    const wrapper = shallow(
      <RequestModal {...defaultProps}>Content</RequestModal>
    );
    const footer = wrapper.find(Modal).prop("footer");
    expect(footer[1].props.type).toBe("primary");
  });

  it("should have default type button for Reject Task", () => {
    const wrapper = shallow(
      <RequestModal {...defaultProps} title="Reject Task">
        Content
      </RequestModal>
    );
    const footer = wrapper.find(Modal).prop("footer");
    expect(footer[1].props.type).toBe("default");
  });

  it("should set danger for non-Approve Task", () => {
    const wrapper = shallow(
      <RequestModal {...defaultProps} title="Reject Task">
        Content
      </RequestModal>
    );
    const footer = wrapper.find(Modal).prop("footer");
    expect(footer[1].props.danger).toBe(true);
  });

  it("should not set danger for Approve Task", () => {
    const wrapper = shallow(
      <RequestModal {...defaultProps}>Content</RequestModal>
    );
    const footer = wrapper.find(Modal).prop("footer");
    expect(footer[1].props.danger).toBe(false);
  });

  it("should render modal as not visible when false", () => {
    const wrapper = shallow(
      <RequestModal {...defaultProps} isModalVisible={false}>
        Content
      </RequestModal>
    );
    expect(wrapper.find(Modal).prop("visible")).toBe(false);
  });

  it("should display title text in modal title", () => {
    const wrapper = shallow(
      <RequestModal {...defaultProps} title="Replace File">
        Content
      </RequestModal>
    );
    const titleProp = wrapper.find(Modal).prop("title");
    const titleWrapper = shallow(titleProp);
    expect(titleWrapper.text()).toContain("Replace File");
  });
});
