import * as redux from "react-redux";
import { configure, shallow, sleep, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import { Form } from "antd";
import ContractDetails from "../../../components/addContract/ContractDetails";

configure({ adapter: new Adapter() });

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));
jest.mock("react-router-dom", () => ({
  useParams: jest.fn().mockReturnValue({ vendorId: "123", id: "" }),
  useHistory: jest.fn(),
  useLocation: jest.fn(),
}));

const contract = {
  selectedContract: [],
  data: [{}],
};

const state = { contract };

jest
  .spyOn(redux, "useSelector")
  .mockImplementation((callback) => callback(state));

const wrapper = shallow(<ContractDetails />);
describe("Parent", () => {
  it("wrapper", () => {
    const element = wrapper.find(Form);
    expect(element.length).toBe(1);
  });
});