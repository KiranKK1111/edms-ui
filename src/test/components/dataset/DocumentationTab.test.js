import * as redux from "react-redux";
import { configure, shallow, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import { Breadcrumb, Button } from "antd";
import DocumentationTab from "../../../components/dataset/DocumentationTab";

configure({ adapter: new Adapter() });

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
}));

const dataset = {
  subscriptionInfo: { data: { taskStatus: "", subscriptionId: "" } },
};
const fileUpload = {
  fileLists: {
    documentList: "",
  },
};
const state = { dataset, fileUpload };

jest
  .spyOn(redux, "useSelector")
  .mockImplementation((callback) => callback(state));

const wrapper = mount(<DocumentationTab />);

describe("Parent", () => {
  it("wrapper", () => {
    const element = wrapper.find("#main");
    expect(element.length).toBe(1);
  });
});