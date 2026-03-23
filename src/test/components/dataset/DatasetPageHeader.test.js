import * as redux from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configure, shallow, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import { PageHeader } from "antd";
import DatasetPageHeader from "../../../components/dataset/DatasetPageHeader";

configure({ adapter: new Adapter() });

const license = {
  licenseNumberOfLicensesPurchaised: "",
  licenseNumberOfLicensesUsed: "",
  licenseNoInheritanceFlag: "",
  licenseExpiryDate: "",
  licenseType: "",
};
const contract = {
  agreementExpiryDate: "",
  agreementScbAgreementMgrBankId: "",
};

const state = { license, contract };

jest
  .spyOn(redux, "useSelector")
  .mockImplementation((callback) => callback(state));
const wrapper = mount(
  <MemoryRouter>
    <DatasetPageHeader />
  </MemoryRouter>
);

it("wrapper", () => {
  const element = wrapper.find(PageHeader);
  //console.log(wrapper);
  //expect(element.length).toBe(1);
});