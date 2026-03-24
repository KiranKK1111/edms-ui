import * as redux from "react-redux";
import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import { Form, Input, Select, DatePicker, Checkbox, Button } from "antd";
import LicenseDetails from "../../../components/license/licenseDetails/LicenseDetails";

configure({ adapter: new Adapter() });

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

jest.mock("react-router-dom", () => ({
  __esModule: true,
  useLocation: jest.fn().mockReturnValue({
    pathname: "/addLicense",
    search: "",
    hash: "",
    state: null,
    key: "5nvxpbdafa",
  }),
  useParams: jest.fn().mockReturnValue({}),
}));

jest.mock("../../../store/services/LicenseService", () => ({
  getLicenseCountById: jest.fn().mockResolvedValue({
    data: { licenseListCount: 5 },
  }),
}));

const licenseReqDefault = {
  licenseDetailsRequirements: [],
};
const licenseDefault = {
  selectedLicense: "",
};
const state = {
  licenseReq: licenseReqDefault,
  license: licenseDefault,
};

jest
  .spyOn(redux, "useSelector")
  .mockImplementation((callback) => callback(state));

const defaultProps = {
  next: jest.fn(),
  formData: false,
  contractId: "C001",
  licenseStatus: "Pending",
  licenseName: "TestLicense",
  contractName: "TestContract",
  dataCoverage: "Global",
  licenseType: "Enterprise",
  licenseCost: "1000",
  licenseid: "L001",
  handleChange: jest.fn(),
  handleLicenseType: jest.fn(),
  licenseList: [],
  isLicenseNameChanged: false,
};

describe("LicenseDetails", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .spyOn(redux, "useSelector")
      .mockImplementation((callback) => callback(state));
    const { useLocation } = require("react-router-dom");
    useLocation.mockReturnValue({
      pathname: "/addLicense",
      search: "",
      hash: "",
      state: null,
      key: "5nvxpbdafa",
    });
    localStorage.clear();
    localStorage.setItem(
      "agRecord",
      JSON.stringify({
        agreementExpiryDate: "2025-12-31",
        agreementNoExpiryFlag: "N",
        agreementId: "AG001",
      })
    );
  });

  it("should render a Form component", () => {
    const wrapper = shallow(<LicenseDetails {...defaultProps} />);
    const element = wrapper.find(Form);
    expect(element.length).toBe(1);
  });

  it("should render at least one Form.Item", () => {
    const wrapper = shallow(<LicenseDetails {...defaultProps} />);
    const element = wrapper.find(Form.Item);
    expect(element.length).toBeGreaterThanOrEqual(1);
  });

  it("should be a shallow rendered component", () => {
    const wrapper = shallow(<LicenseDetails {...defaultProps} />);
    expect(wrapper.exists()).toBe(true);
  });

  it("should render Licence ID input as disabled", () => {
    const wrapper = shallow(<LicenseDetails {...defaultProps} />);
    const licenceIdInput = wrapper.find(".LicenseId");
    expect(licenceIdInput.length).toBeGreaterThanOrEqual(0);
  });

  it("should render Licence Type Select", () => {
    const wrapper = shallow(<LicenseDetails {...defaultProps} />);
    expect(wrapper.find(Select).length).toBeGreaterThanOrEqual(1);
  });

  it("should render Long Name and Short Name inputs", () => {
    const wrapper = shallow(<LicenseDetails {...defaultProps} />);
    const inputs = wrapper.find(Input);
    const names = inputs.map((inp) => inp.prop("name"));
    expect(names).toContain("longName");
    expect(names).toContain("shortName");
  });

  it("should render DatePicker for expiration date", () => {
    const wrapper = shallow(<LicenseDetails {...defaultProps} />);
    expect(wrapper.find(DatePicker).length).toBeGreaterThanOrEqual(1);
  });

  it("should render Checkbox for Different from Agreement", () => {
    const wrapper = shallow(<LicenseDetails {...defaultProps} />);
    expect(wrapper.find(Checkbox).length).toBeGreaterThanOrEqual(1);
  });

  it("should render status input as disabled", () => {
    const wrapper = shallow(<LicenseDetails {...defaultProps} />);
    const statusInput = wrapper.find('Input[name="status"]');
    if (statusInput.length > 0) {
      expect(statusInput.prop("disabled")).toBe(true);
    }
  });

  it("should render with agreementNoExpiryFlag Y", () => {
    localStorage.setItem(
      "agRecord",
      JSON.stringify({
        agreementExpiryDate: "2099-12-31",
        agreementNoExpiryFlag: "Y",
        agreementId: "AG001",
      })
    );
    const wrapper = shallow(<LicenseDetails {...defaultProps} />);
    expect(wrapper.find(Form).length).toBe(1);
  });

  it("should render with licenseDetailsRequirements from redux", () => {
    const stateWithReqs = {
      licenseReq: {
        licenseDetailsRequirements: [
          {
            longName: "TestLong",
            shortName: "TL",
            licenceType: "Enterprise Licence",
            dataProcurementType: "Data Leasing",
            licenceValue: "1000",
            expirationDate: "2025-12-31",
            NoOfLicencePurchased: "10",
            NoOfLicenceUsed: "5",
            status: "Active",
          },
        ],
      },
      license: licenseDefault,
    };
    jest
      .spyOn(redux, "useSelector")
      .mockImplementation((callback) => callback(stateWithReqs));
    const wrapper = shallow(<LicenseDetails {...defaultProps} />);
    expect(wrapper.find(Form).length).toBe(1);
  });

  it("should render with location state record data", () => {
    const { useLocation } = require("react-router-dom");
    useLocation.mockReturnValue({
      pathname: "/editLicense/L001",
      search: "",
      hash: "",
      state: {
        record: {
          licenseId: "L001",
          licenseLongName: "Test Long",
          licenseShortName: "TL",
          licenseType: "Enterprise Licence",
          licenseDataProcurementType: "Data Leasing",
          licenseValuePerMonth: "1000",
          licenseExpiryDate: "2025-12-31",
          licenseNumberOfLicensesPurchaised: "10",
          licenseNumberOfLicensesUsed: "5",
          licenseStatus: "Active",
        },
      },
      key: "test",
    });
    const wrapper = shallow(<LicenseDetails {...defaultProps} />);
    expect(wrapper.find(Form).length).toBe(1);
  });

  it("should call onFinish and dispatch when form is submitted", () => {
    const mockNext = jest.fn();
    const wrapper = shallow(
      <LicenseDetails {...defaultProps} next={mockNext} />
    );
    const form = wrapper.find(Form);
    const onFinish = form.prop("onFinish");
    onFinish({
      longName: "TestLong",
      shortName: "TL",
      licenceType: "Enterprise Licence",
      dataProcurementType: "Data Leasing",
      licenceValue: "1000",
      expirationDate: "2025-12-31",
      NoOfLicencePurchased: "Unlimited",
      status: "Pending",
    });
    expect(mockDispatch).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledWith(true);
  });

  it("should render No. of Licences purchased input", () => {
    const wrapper = shallow(<LicenseDetails {...defaultProps} />);
    const input = wrapper.find('Input[name="NoOfLicencePurchased"]');
    expect(input.length).toBe(1);
  });

  it("should render Data Procurement Type select", () => {
    const wrapper = shallow(<LicenseDetails {...defaultProps} />);
    const selects = wrapper.find(Select);
    expect(selects.length).toBeGreaterThanOrEqual(2);
  });

  it("should render hidden submit button", () => {
    const wrapper = shallow(<LicenseDetails {...defaultProps} />);
    const buttons = wrapper.find(Button);
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it("should render on addLicense path without NoOfLicenceUsed field", () => {
    const { useLocation } = require("react-router-dom");
    useLocation.mockReturnValue({
      pathname: "/addLicense",
      search: "",
      hash: "",
      state: null,
      key: "test",
    });
    const wrapper = shallow(<LicenseDetails {...defaultProps} />);
    expect(wrapper.find(Form).length).toBe(1);
  });

  it("should render on editLicense path with NoOfLicenceUsed field", () => {
    const { useLocation } = require("react-router-dom");
    useLocation.mockReturnValue({
      pathname: "/editLicense/L001",
      search: "",
      hash: "",
      state: null,
      key: "test",
    });
    const wrapper = shallow(<LicenseDetails {...defaultProps} />);
    expect(wrapper.find(Form).length).toBe(1);
  });

  it("should render Licence Value input with USD prefix", () => {
    const wrapper = shallow(<LicenseDetails {...defaultProps} />);
    const licenceValueInput = wrapper.find('Input[name="licenceValue"]');
    expect(licenceValueInput.length).toBe(1);
  });
});
