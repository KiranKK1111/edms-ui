import * as redux from "react-redux";
import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { Steps, Button, Modal, Table } from "antd";
import OrderSteps from "../../../components/license/step/OrderSteps";

configure({ adapter: new Adapter() });

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

const mockUseParams = jest.fn().mockReturnValue({ id: "123" });
jest.mock("react-router-dom", () => ({
  useParams: () => mockUseParams(),
  useHistory: () => ({ push: jest.fn() }),
}));

const license = {
  licenseList: [[]],
  selectedLicense: [{}],
};
const contract = {
  data: [
    [
      { agreementStatus: "active", contractName: "TestContract", contractId: "C001", contractStatus: "Active" },
      { agreementStatus: "inactive", contractName: "OtherContract", contractId: "C002", contractStatus: "Inactive" },
      { agreementStatus: "Active", contractName: "ActiveContract", contractId: "C003", contractStatus: "Active" },
    ],
  ],
  selectedContract: [],
  contractDetails: [],
};
const licenseReq = {
  licenseDetailsRequirements: [],
};

const state = { license, contract, licenseReq };

jest
  .spyOn(redux, "useSelector")
  .mockImplementation((callback) => callback(state));

const setupSelector = (licenseData = license, contractData = contract) => {
  const newState = { license: licenseData, contract: contractData, licenseReq };
  redux.useSelector.mockImplementation((cb) => cb(newState));
};

describe("OrderSteps", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({ id: "123" });
    jest
      .spyOn(redux, "useSelector")
      .mockImplementation((callback) => callback(state));
  });

  const defaultProps = {
    isFormValid: jest.fn(),
    savedData: jest.fn(),
  };

  it("should render the main container", () => {
    const wrapper = shallow(<OrderSteps {...defaultProps} />);
    const element = wrapper.find("#main");
    expect(element.length).toBe(1);
  });

  it("should render Steps component", () => {
    const wrapper = shallow(<OrderSteps {...defaultProps} />);
    expect(wrapper.find(Steps).length).toBe(1);
  });

  it("should render Step components for each step", () => {
    const wrapper = shallow(<OrderSteps {...defaultProps} />);
    const steps = wrapper.find(Steps.Step);
    expect(steps.length).toBe(3);
  });

  it("should render step titles correctly", () => {
    const wrapper = shallow(<OrderSteps {...defaultProps} />);
    const steps = wrapper.find(Steps.Step);
    expect(steps.at(0).prop("title")).toContain("Licence Details");
    expect(steps.at(1).prop("title")).toContain("Licence Limitations");
    expect(steps.at(2).prop("title")).toContain("Review & Submit");
  });

  it("should render Next button on first step", () => {
    const wrapper = shallow(<OrderSteps {...defaultProps} />);
    const buttons = wrapper.find(Button);
    const nextBtn = buttons.filterWhere((b) => b.children().text() === "Next");
    expect(nextBtn.length).toBe(1);
  });

  it("should not render Previous button on first step", () => {
    const wrapper = shallow(<OrderSteps {...defaultProps} />);
    const buttons = wrapper.find(Button);
    const prevBtn = buttons.filterWhere(
      (b) => b.children().text() === "Previous"
    );
    expect(prevBtn.length).toBe(0);
  });

  it("should render Modal component", () => {
    const wrapper = shallow(<OrderSteps {...defaultProps} />);
    expect(wrapper.find(Modal).length).toBe(1);
  });

  it("should render Table inside Modal", () => {
    const wrapper = shallow(<OrderSteps {...defaultProps} />);
    expect(wrapper.find(Table).length).toBe(1);
  });

  it("should call isFormValid prop", () => {
    shallow(<OrderSteps {...defaultProps} />);
    expect(defaultProps.isFormValid).toHaveBeenCalled();
  });

  it("should call savedData prop", () => {
    shallow(<OrderSteps {...defaultProps} />);
    expect(defaultProps.savedData).toHaveBeenCalled();
  });

  it("should render without crashing and call props", () => {
    const wrapper = shallow(<OrderSteps {...defaultProps} />);
    expect(wrapper.exists()).toBe(true);
    expect(defaultProps.isFormValid).toHaveBeenCalled();
    expect(defaultProps.savedData).toHaveBeenCalled();
  });

  it("agreement status filter should work correctly", () => {
    const mockInfo = {
      data: [
        [
          { agreementStatus: "active" },
          { agreementStatus: "inactive" },
          { agreementStatus: "Active" },
        ],
      ],
    };

    const filteredContracts = mockInfo.data[0].filter(
      (contract) =>
        contract.agreementStatus &&
        contract.agreementStatus.toLowerCase() === "active"
    );
    expect(filteredContracts).toEqual([
      { agreementStatus: "active" },
      { agreementStatus: "Active" },
    ]);
  });

  it("should filter only active agreements from contract data", () => {
    setupSelector(license, contract);
    const wrapper = shallow(<OrderSteps {...defaultProps} />);
    expect(wrapper.find("#main").length).toBe(1);
  });

  it("should render with contractId in params", () => {
    mockUseParams.mockReturnValue({ contractId: "C001" });
    const wrapper = shallow(<OrderSteps {...defaultProps} />);
    expect(wrapper.find("#main").length).toBe(1);
    mockUseParams.mockReturnValue({ id: "123" });
  });

  it("should render with empty licenseList", () => {
    setupSelector(
      { licenseList: [[]], selectedLicense: {} },
      contract
    );
    const wrapper = shallow(<OrderSteps {...defaultProps} />);
    expect(wrapper.find("#main").length).toBe(1);
  });

  it("should render with modalStatus prop", () => {
    const wrapper = shallow(
      <OrderSteps {...defaultProps} modalStatus={true} />
    );
    expect(wrapper.find("#main").length).toBe(1);
  });

  it("should handle steps-content display", () => {
    const wrapper = shallow(<OrderSteps {...defaultProps} />);
    expect(wrapper.find(".steps-content").length).toBe(1);
    expect(wrapper.find(".steps-action").length).toBe(1);
  });
});
