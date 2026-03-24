import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { Table } from "antd";
import SubscriptionManagement, {
  updateSubscription,
  getData,
} from "../../pages/subscriptionManagement/SubscriptionManagement";

configure({ adapter: new Adapter() });

const mockDispatch = jest.fn();

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: () => mockDispatch,
  useSelector: jest.fn(),
  connect: () => (Component) => Component,
}));

jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useState: jest.fn((initial) => [initial, jest.fn()]),
  useEffect: jest.fn((fn) => fn()),
}));

jest.mock("react-router-dom/cjs/react-router-dom.min", () => ({
  useHistory: () => ({ push: jest.fn() }),
}));

const wrapped = shallow(<SubscriptionManagement />);

describe("SubscriptionManagement", () => {
  it("should render the component", () => {
    expect(wrapped.exists()).toBe(true);
  });

  it("should render Table component", () => {
    const element = wrapped.find(Table);
    expect(element.length).toBe(1);
  });
});

describe("getData utility function", () => {
  const list = [
    {
      feedId: "DF202223021927841000",
      agreementScbAgreementMgrBankId: "1135744",
      datafeedShortName: "/UVT test feed /R4/",
    },
    {
      feedId: "DF202223021927841001",
      agreementScbAgreementMgrBankId: "1135756",
      datafeedShortName: "/UVT test feed /R5/",
    },
  ];

  it("should return correct datafeedShortName for matching feedId", () => {
    expect(
      getData(list, "DF202223021927841000", "datafeedShortName")
    ).toBe("/UVT test feed /R4/");
  });

  it("should return correct agreementScbAgreementMgrBankId for matching feedId", () => {
    expect(
      getData(list, "DF202223021927841000", "agreementScbAgreementMgrBankId")
    ).toBe("1135744");
  });

  it("should return null for non-matching feedId", () => {
    expect(getData(list, "DF_NONEXISTENT", "datafeedShortName")).toBe(null);
  });

  it("should handle empty list", () => {
    expect(getData([], "DF202223021927841000", "datafeedShortName")).toBeFalsy();
  });

  it("should return null for non-existent type property", () => {
    expect(
      getData(list, "DF202223021927841000", "nonExistentField")
    ).toBe(null);
  });

  it("should return correct value for second item", () => {
    expect(
      getData(list, "DF202223021927841001", "datafeedShortName")
    ).toBe("/UVT test feed /R5/");
  });

  it("should return correct value for second item bankId", () => {
    expect(
      getData(list, "DF202223021927841001", "agreementScbAgreementMgrBankId")
    ).toBe("1135756");
  });
});

describe("updateSubscription utility function", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("psid", "1234567");
    localStorage.setItem("currentUserRole", "Admin");
  });

  it("should set subscriptionStatus to Inactive", () => {
    const subscription = { subscriptionStatus: "Active" };
    const result = updateSubscription(subscription);
    expect(result.subscriptionStatus).toBe("Inactive");
  });

  it("should set lastUpdatedBy from localStorage", () => {
    const subscription = { subscriptionStatus: "Active" };
    const result = updateSubscription(subscription);
    expect(result.lastUpdatedBy).toBe("1234567");
  });

  it("should set roleName from localStorage", () => {
    const subscription = { subscriptionStatus: "Active" };
    const result = updateSubscription(subscription);
    expect(result.roleName).toBe("Admin");
  });

  it("should delete dataOwner property", () => {
    const subscription = {
      subscriptionStatus: "Active",
      dataOwner: "owner1",
    };
    const result = updateSubscription(subscription);
    expect(result.dataOwner).toBeUndefined();
  });

  it("should delete datafeedName property", () => {
    const subscription = {
      subscriptionStatus: "Active",
      datafeedName: "Feed1",
    };
    const result = updateSubscription(subscription);
    expect(result.datafeedName).toBeUndefined();
  });

  it("should return the modified subscription object", () => {
    const subscription = {
      subscriptionStatus: "Active",
      subscriptionId: "SUB001",
      dataOwner: "owner",
      datafeedName: "feed",
    };
    const result = updateSubscription(subscription);
    expect(result.subscriptionId).toBe("SUB001");
    expect(result.subscriptionStatus).toBe("Inactive");
    expect(result).not.toHaveProperty("dataOwner");
    expect(result).not.toHaveProperty("datafeedName");
  });

  it("should handle subscription with Pending status", () => {
    const subscription = { subscriptionStatus: "Pending" };
    const result = updateSubscription(subscription);
    expect(result.subscriptionStatus).toBe("Inactive");
  });

  it("should handle subscription with all properties", () => {
    const subscription = {
      subscriptionStatus: "Active",
      subscriptionId: "SUB002",
      requester: "user1",
      subscriber: "sub1",
      dataFeedId: "DF001",
      dataOwner: "owner1",
      datafeedName: "feed1",
    };
    const result = updateSubscription(subscription);
    expect(result.subscriptionStatus).toBe("Inactive");
    expect(result.requester).toBe("user1");
    expect(result.subscriber).toBe("sub1");
    expect(result).not.toHaveProperty("dataOwner");
    expect(result).not.toHaveProperty("datafeedName");
  });
});
