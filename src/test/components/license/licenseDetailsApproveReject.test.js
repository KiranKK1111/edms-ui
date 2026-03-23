import * as redux from "react-redux";
import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { Button } from "antd";

import LicenseDetailsApproveReject from "../../../components/license/licenseDetailsApproveReject/licenseDetailsApproveReject";

configure({ adapter: new Adapter() });

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

const mockPush = jest.fn();
jest.mock("react-router-dom", () => ({
  __esModule: true,
  useParams: jest.fn().mockReturnValue({ id: "123" }),
  useHistory: () => ({ push: mockPush }),
}));

const licenseState = {
  license: {
    data: [
      {
        licenseId: "L001",
        licenseLongName: "Test License",
        licenseShortName: "TL",
        licenseType: "Standard",
        licenseDataProcurementType: "API",
        licenseValuePerMonth: "100",
        licenseExpiryDate: "2026-12-31",
        licenseNumberOfLicensesPurchaised: "5",
        licenseNumberOfLicensesUsed: "2",
        licenseStatus: "Active",
        licenseLimitations: "None",
        usageModel: "api",
        subscriptionModel: null,
        subscriptionTypes: null,
        subscriptionLimits: null,
        subscriptionLimitsUsed: null,
        technicalDocument: "doc1.pdf,doc2.pdf",
      },
    ],
  },
};

jest
  .spyOn(redux, "useSelector")
  .mockImplementation((callback) => callback(licenseState));

const mockProps = {
  location: {
    state: {
      myTaskData: {
        taskListId: "T001",
        taskListObject: "license",
        taskListObjectAction: "Create",
        taskListTaskStatus: "Pending",
        taskListCreatedBy: "user1",
      },
    },
  },
  history: { push: mockPush },
};

const wrapper = shallow(<LicenseDetailsApproveReject {...mockProps} />);

describe("LicenseDetailsApproveReject", () => {
  it("should render the component", () => {
    expect(wrapper.exists()).toBe(true);
  });

  it("should render the main div", () => {
    expect(wrapper.find("#main").exists()).toBe(true);
  });

  it("should render Approve button", () => {
    const buttons = wrapper.find(Button);
    const approveBtn = buttons.filterWhere(
      (btn) => btn.children().text() === "Approve"
    );
    expect(approveBtn.length).toBe(1);
  });

  it("should render Reject button", () => {
    const buttons = wrapper.find(Button);
    const rejectBtn = buttons.filterWhere(
      (btn) => btn.children().text() === "Reject"
    );
    expect(rejectBtn.length).toBe(1);
  });

});
