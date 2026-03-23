
import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { Table } from "antd";
import SubscriptionManagement, { updateSubscription } from "../../pages/subscriptionManagement/SubscriptionManagement";
import { getData } from "../../pages/subscriptionManagement/SubscriptionManagement";
configure({ adapter: new Adapter() });

const mockDispatch = jest.fn();

const subscription = {
  "subscriptionStatus": "Active"
}

jest.mock("react-redux", () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: jest.fn(),
  connect: () => (Component) => Component,
}));

jest.mock("react", () => ({
  ...jest.requireActual('react'),
  useState: jest.fn((initial) => [initial, jest.fn()]),
  useEffect: jest.fn((fn) => fn()),
}));


const wrapped = shallow(<SubscriptionManagement />);
describe("Parent", () => {
  it("table", () => {
    const element = wrapped.find(Table);
    expect(element.length).toBe(1);
  });

  it("should render the component", () => {
    expect(wrapped.exists()).toBe(true);
  });

  it("capture data", () => {
    const list = {
      agreementMgrBankIds: [
        {
          feedId:"DF202223021927841000",
          agreementScbAgreementMgrBankId:"1135744",
          datafeedShortName:"/UVT test feed /R4/"
        },
        {
          feedId:"DF202223021927841001",
          agreementScbAgreementMgrBankId:"1135756",
          datafeedShortName:"/UVT test feed /R5/"
        }
      ]
    }

    expect(getData(list.agreementMgrBankIds, 'DF202223021927841000', 'datafeedShortName')).toBe('/UVT test feed /R4/');
    expect(getData(list.agreementMgrBankIds, 'DF202223021927841000', 'agreementScbAgreementMgrBankId')).toBe('1135744');
    const updatedSubscription = updateSubscription(subscription);
    expect(updatedSubscription.subscriptionStatus).toBe("Inactive")
  });
});