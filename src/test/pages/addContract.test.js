import * as redux from "react-redux";
import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { Button, Breadcrumb } from "antd";

import AddContract from "../../pages/contract/addContract";

configure({ adapter: new Adapter() });

const mockDispatch = jest.fn();
const mockPush = jest.fn();

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

jest.mock("react-router-dom", () => ({
  __esModule: true,
  useParams: jest.fn().mockReturnValue({}),
  useHistory: () => ({
    push: mockPush,
    location: { pathname: "/addAgreement" },
  }),
  Link: ({ children }) => children,
}));

const contractState = {
  contract: {
    saveFinalData: {},
    data: [[]],
    contractDetails: null,
    selectedContract: [{ agreementStatus: "Active" }],
  },
  license: {
    licenseList: [],
  },
};

jest
  .spyOn(redux, "useSelector")
  .mockImplementation((callback) => callback(contractState));

const mockProps = {
  match: { params: {} },
};

const wrapper = shallow(<AddContract {...mockProps} />);

describe("AddContract", () => {
  it("should render the component", () => {
    expect(wrapper.exists()).toBe(true);
  });

  it("should render Breadcrumb", () => {
    expect(wrapper.find(Breadcrumb).length).toBeGreaterThanOrEqual(1);
  });

  it("should render Cancel button", () => {
    const buttons = wrapper.find(Button);
    const cancelBtn = buttons.filterWhere(
      (btn) => btn.children().text() === "Cancel"
    );
    expect(cancelBtn.length).toBe(1);
  });

  it("should render Submit button", () => {
    const buttons = wrapper.find(Button);
    const submitBtn = buttons.filterWhere(
      (btn) => btn.children().text() === "Submit"
    );
    expect(submitBtn.length).toBe(1);
  });

  it("Submit button should be disabled initially", () => {
    const buttons = wrapper.find(Button);
    const submitBtn = buttons.filterWhere(
      (btn) => btn.children().text() === "Submit"
    );
    expect(submitBtn.prop("disabled")).toBe(true);
  });
});
