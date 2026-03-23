import * as redux from "react-redux";
import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import { Card } from "antd";
import MetadataTab from "../../../components/dataset/MetadataTab";

configure({ adapter: new Adapter() });

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
}));
const datafeedInfo = {
  metadatadetail: {
    data: {
      schemaString: "",
      type: "",
    },
  },
};
const state = { datafeedInfo };

jest
  .spyOn(redux, "useSelector")
  .mockImplementation((callback) => callback(state));
const wrapper = shallow(<MetadataTab />);

it("wrapper", () => {
  const element = wrapper.find(Card);
  expect(element.length).toBe(1);
});