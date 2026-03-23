import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { Alert } from "antd";
import ErrorAlert from "../../../components/error/ErrorAlert";

configure({ adapter: new Adapter() });

describe("ErrorAlert", () => {
  it("should render an Alert component", () => {
    const wrapper = shallow(<ErrorAlert message="Something went wrong" />);
    expect(wrapper.find(Alert).length).toBe(1);
  });

  it("should display the error message", () => {
    const wrapper = shallow(<ErrorAlert message="Test error" />);
    expect(wrapper.find(Alert).prop("message")).toBe("Test error");
  });

  it("should have type error", () => {
    const wrapper = shallow(<ErrorAlert message="Error" />);
    expect(wrapper.find(Alert).prop("type")).toBe("error");
  });

  it("should show icon", () => {
    const wrapper = shallow(<ErrorAlert message="Error" />);
    expect(wrapper.find(Alert).prop("showIcon")).toBe(true);
  });

  it("should handle empty message", () => {
    const wrapper = shallow(<ErrorAlert message="" />);
    expect(wrapper.find(Alert).prop("message")).toBe("");
  });
});
