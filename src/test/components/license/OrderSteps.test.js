import * as redux from "react-redux";
import { configure, shallow, sleep, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import OrderSteps from "../../../components/license/step/OrderSteps";

configure({ adapter: new Adapter() });

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

jest.mock("react-router-dom", () => ({
  useParams: jest.fn().mockReturnValue({ id: "123" }),
  useHistory: jest.fn(),
}));

const license = {
  licenseList: [{}],
  selectedLicense: [{}],
};
const state = { license };

jest
  .spyOn(redux, "useSelector")
  .mockImplementation((callback) => callback(state));

const props = {
  isFormValid: jest.fn(),
  savedData: jest.fn(),
};

const wrapper = shallow(<OrderSteps {...props} />);

describe("Parent", () => {
  it("wrapper", () => {
    const element = wrapper.find("#main");
    expect(element.length).toBe(1);
  });

  it("agreement status", () => {
    const mockInfo = {
      data: [[
        { agreementStatus: 'active' },
        { agreementStatus: 'inactive' },
        { agreementStatus: 'Active' },
      ]],
    };

    const filteredContracts = mockInfo.data[0].filter(contract => 
      contract.agreementStatus && contract.agreementStatus.toLowerCase() === 'active'
    );
    expect(filteredContracts).toEqual([
      { agreementStatus: 'active' },
      { agreementStatus: 'Active' }
    ]);

  });
});