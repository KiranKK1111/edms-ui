import * as redux from "react-redux";
import { configure, shallow, sleep, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import { Descriptions } from "antd";
import HeaderPanel from "../../../components/headerPanel/HeaderPanel";

configure({ adapter: new Adapter() });
const license = {
  licenseById: {
    licenseNumberOfLicensesPurchaised: "",
    licenseNumberOfLicensesUsed: "",
    licenseNoInheritanceFlag: "",
    licenseExpiryDate: "",
    licenseType: "",
  },
};
const contract = {
  agreementById: {
    agreementExpiryDate: "",
    agreementScbAgreementMgrBankId: "",
  },
};
const state = { contract, license };

jest
  .spyOn(redux, "useSelector")
  .mockImplementation((callback) => callback(state));

jest.mock("react-router-dom", () => ({
  __esModule: true,
  useLocation: jest.fn().mockReturnValue({
    pathname: "/another-route",
    search: "",
    hash: "",
    state: null,
    key: "5nvxpbdafa",
  }),
}));

const wrapper = shallow(<HeaderPanel />);

it("wrapper", () => {
  const element = wrapper.find(Descriptions);
  expect(element.length).toBe(1);
});