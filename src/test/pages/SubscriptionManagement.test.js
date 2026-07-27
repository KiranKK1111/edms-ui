import React from "react";
import { render } from "@testing-library/react";

import AppProviders from "../../design-system/AppProviders";
import SubscriptionManagement, {
  updateSubscription,
  getData,
} from "../../pages/subscriptionManagement/SubscriptionManagement";

jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});

const mockDispatch = jest.fn();

jest.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
  useSelector: jest.fn(),
  connect: () => (Component) => Component,
}));

jest.mock("react-router-dom", () => ({
  __esModule: true,
  useHistory: () => ({ push: jest.fn() }),
  Link: ({ children }) => <a>{children}</a>,
}));

describe("SubscriptionManagement component", () => {
  it("should render the subscriptions page", () => {
    const { container } = render(
      <AppProviders>
        <SubscriptionManagement />
      </AppProviders>
    );
    expect(container.querySelector(".subscriptions-page")).toBeInTheDocument();
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
    expect(getData(list, "DF202223021927841000", "datafeedShortName")).toBe(
      "/UVT test feed /R4/"
    );
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
    expect(getData(list, "DF202223021927841000", "nonExistentField")).toBe(null);
  });

  it("should return correct value for second item", () => {
    expect(getData(list, "DF202223021927841001", "datafeedShortName")).toBe(
      "/UVT test feed /R5/"
    );
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
    expect(updateSubscription({ subscriptionStatus: "Active" }).subscriptionStatus).toBe(
      "Inactive"
    );
  });

  it("should set lastUpdatedBy from localStorage", () => {
    expect(updateSubscription({ subscriptionStatus: "Active" }).lastUpdatedBy).toBe(
      "1234567"
    );
  });

  it("should set roleName from localStorage", () => {
    expect(updateSubscription({ subscriptionStatus: "Active" }).roleName).toBe("Admin");
  });

  it("should delete dataOwner property", () => {
    const result = updateSubscription({
      subscriptionStatus: "Active",
      dataOwner: "owner1",
    });
    expect(result.dataOwner).toBeUndefined();
  });

  it("should delete datafeedName property", () => {
    const result = updateSubscription({
      subscriptionStatus: "Active",
      datafeedName: "Feed1",
    });
    expect(result.datafeedName).toBeUndefined();
  });

  it("should return the modified subscription object", () => {
    const result = updateSubscription({
      subscriptionStatus: "Active",
      subscriptionId: "SUB001",
      dataOwner: "owner",
      datafeedName: "feed",
    });
    expect(result.subscriptionId).toBe("SUB001");
    expect(result.subscriptionStatus).toBe("Inactive");
    expect(result).not.toHaveProperty("dataOwner");
    expect(result).not.toHaveProperty("datafeedName");
  });

  it("should handle subscription with Pending status", () => {
    expect(
      updateSubscription({ subscriptionStatus: "Pending" }).subscriptionStatus
    ).toBe("Inactive");
  });

  it("should handle subscription with all properties", () => {
    const result = updateSubscription({
      subscriptionStatus: "Active",
      subscriptionId: "SUB002",
      requester: "user1",
      subscriber: "sub1",
      dataFeedId: "DF001",
      dataOwner: "owner1",
      datafeedName: "feed1",
    });
    expect(result.subscriptionStatus).toBe("Inactive");
    expect(result.requester).toBe("user1");
    expect(result.subscriber).toBe("sub1");
    expect(result).not.toHaveProperty("dataOwner");
    expect(result).not.toHaveProperty("datafeedName");
  });
});
