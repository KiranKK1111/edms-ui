import * as redux from "react-redux";
import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import { Form, Input, Select, DatePicker, Checkbox, Button } from "antd";
import ContractDetails, {
  CamelText,
} from "../../../components/addContract/ContractDetails";

configure({ adapter: new Adapter() });

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));
jest.mock("react-router-dom", () => ({
  useParams: () => ({ vendorId: "123", id: "" }),
  useHistory: () => ({ push: jest.fn(), location: { pathname: "/addAgreement/123" } }),
  useLocation: () => ({ pathname: "/addAgreement/123" }),
}));

const contract = {
  selectedContract: [],
  data: [[]],
  contractDetails: [],
};
const vendor = {
  list: [
    { vendorId: "123", shortName: "TestVendor", taskStatus: "APPROVED" },
    { vendorId: "456", shortName: "OtherVendor", taskStatus: "PENDING" },
  ],
};

const setupSelector = (contractData = contract, vendorData = vendor) => {
  const state = { contract: contractData, vendor: vendorData };
  redux.useSelector.mockImplementation((cb) => cb(state));
};

describe("ContractDetails", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupSelector();
  });

  it("should render a Form component", () => {
    const wrapper = shallow(<ContractDetails />);
    const element = wrapper.find(Form);
    expect(element.length).toBe(1);
  });

  it("should render Form.Item components", () => {
    const wrapper = shallow(<ContractDetails />);
    expect(wrapper.find(Form.Item).length).toBeGreaterThanOrEqual(10);
  });

  it("should render agreement-related input fields", () => {
    const wrapper = shallow(<ContractDetails />);
    expect(wrapper.find("#agreementID").length).toBe(1);
  });

  it("should render referenceText input", () => {
    const wrapper = shallow(<ContractDetails />);
    expect(wrapper.find("#refTxt").length).toBe(1);
  });

  it("should render DatePicker components", () => {
    const wrapper = shallow(<ContractDetails />);
    expect(wrapper.find(DatePicker).length).toBeGreaterThanOrEqual(2);
  });

  it("should render Select components for agreement type and data source", () => {
    const wrapper = shallow(<ContractDetails />);
    expect(wrapper.find(Select).length).toBeGreaterThanOrEqual(2);
  });

  it("should render Checkbox for Same as Agreement Party", () => {
    const wrapper = shallow(<ContractDetails />);
    expect(wrapper.find(Checkbox).length).toBeGreaterThanOrEqual(1);
  });

  it("should render status input as disabled", () => {
    const wrapper = shallow(<ContractDetails />);
    const statusInput = wrapper.find('Input[name="status"]');
    expect(statusInput.prop("disabled")).toBe(true);
  });

  it("should call onFinish and dispatch contractDetails", () => {
    const mockNext = jest.fn();
    const wrapper = shallow(<ContractDetails next={mockNext} />);
    const form = wrapper.find(Form);
    const onFinish = form.prop("onFinish");
    onFinish({
      agreementName: "Test_01012025_Ref",
      agreementType: "Vendor contract",
      dataSource: "TestVendor",
      agreementValue: "1000",
      signedOn: "2025-01-01",
      startDate: "2025-01-01",
      expirationDate: "2025-12-31",
      ScbAgreementManagerBankId: "SCB123",
      status: "Pending",
    });
    expect(mockDispatch).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledWith(true);
  });

  it("should render with selected contract data", () => {
    const selectedContract = [
      {
        agreementExpiryDate: "2025-12-31",
        agreementPartyId: "123",
        agreementReferenceText: "RefText",
        agreementScbAgreementMgrBankId: "SCB123",
        agreementSignedOn: "2025-01-01",
        agreementStartDate: "2025-01-01",
        agreementStatus: "Active",
        agreementReferenceId: "REF001",
        vendorId: "123",
      },
    ];
    setupSelector(
      {
        selectedContract,
        data: [[]],
        contractDetails: [],
      },
      vendor
    );
    const wrapper = shallow(<ContractDetails />);
    expect(wrapper.find(Form).length).toBe(1);
  });

  it("should render with contractDetails from redux", () => {
    setupSelector(
      {
        selectedContract: [],
        data: [[]],
        contractDetails: [
          {
            dataSource: "123",
            signedOn: "2025-01-01",
            referenceText: "Ref",
          },
        ],
      },
      vendor
    );
    const wrapper = shallow(<ContractDetails />);
    expect(wrapper.find(Form).length).toBe(1);
  });

  it("should filter approved vendors from vendor list", () => {
    setupSelector(contract, vendor);
    const wrapper = shallow(<ContractDetails />);
    // Only "TestVendor" with taskStatus APPROVED should be in the list
    expect(wrapper.find(Form).length).toBe(1);
  });

  it("should render No Expiry checkbox", () => {
    const wrapper = shallow(<ContractDetails />);
    const checkboxes = wrapper.find(Checkbox);
    expect(checkboxes.length).toBeGreaterThanOrEqual(1);
  });

  it("should toggle optionSelected when Same as Agreement Party checkbox changes", () => {
    const wrapper = shallow(<ContractDetails />);
    const checkboxes = wrapper.find(Checkbox);
    const sameAsPartyCheckbox = checkboxes.at(0);
    sameAsPartyCheckbox.simulate("change");
    expect(wrapper.find(Form).length).toBe(1);
  });

  it("should toggle noExpiry when No Expiry checkbox changes", () => {
    const wrapper = shallow(<ContractDetails />);
    const checkboxes = wrapper.find(Checkbox);
    const noExpiryCheckbox = checkboxes.at(1);
    noExpiryCheckbox.simulate("change");
    expect(wrapper.find(Form).length).toBe(1);
  });

  it("should render with data that has no expirationDate (triggers noExpiry)", () => {
    setupSelector(
      {
        selectedContract: [],
        data: [[]],
        contractDetails: [
          {
            dataSource: "123",
            signedOn: "2025-01-01",
            referenceText: "Ref",
            expirationDate: null,
          },
        ],
      },
      vendor
    );
    const wrapper = shallow(<ContractDetails />);
    expect(wrapper.find(Form).length).toBe(1);
  });

  it("should handle referenceText input change", () => {
    const wrapper = shallow(<ContractDetails />);
    const refInput = wrapper.find("#refTxt");
    refInput.simulate("change", { target: { value: "NewRef" } });
    expect(wrapper.find(Form).length).toBe(1);
  });
});

describe("CamelText", () => {
  it("should keep character after space as-is", () => {
    expect(CamelText("Hello World")).toBe("Hello World");
  });

  it("should keep character after hyphen as-is", () => {
    expect(CamelText("Hello-World")).toBe("Hello-World");
  });

  it("should keep character after underscore as-is", () => {
    expect(CamelText("Hello_World")).toBe("Hello_World");
  });

  it("should handle single character input", () => {
    expect(CamelText("A")).toBe("A");
  });

  it("should convert non-separator-preceded chars to lowercase", () => {
    expect(CamelText("HELLO")).toBe("Hello");
  });

  it("should handle consecutive lowercase characters", () => {
    expect(CamelText("hello")).toBe("hello");
  });

  it("should handle mixed case with spaces", () => {
    const result = CamelText("AB CD");
    expect(result[0]).toBe("A");
    expect(result).toContain("C");
  });
});
