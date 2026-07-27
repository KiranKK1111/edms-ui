import React from "react";
import * as redux from "react-redux";
import { render, screen } from "@testing-library/react";

import ContractDetails, {
  CamelText,
} from "../../../components/addContract/ContractDetails";

// MUI's useMediaQuery (via the date picker) needs a full matchMedia mock.
window.matchMedia = (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
});

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));
jest.mock("react-router-dom", () => ({
  useParams: () => ({ vendorId: "123", id: "" }),
  useHistory: () => ({
    push: jest.fn(),
    location: { pathname: "/addAgreement/123" },
  }),
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

  it("should render the agreement form fields", () => {
    render(<ContractDetails />);
    expect(screen.getAllByText("Agreement Value").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Reference Text").length).toBeGreaterThanOrEqual(1);
  });

  it("should render the Agreement Type and Data Source selects", () => {
    render(<ContractDetails />);
    expect(screen.getAllByText("Agreement Type").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Data Source").length).toBeGreaterThanOrEqual(1);
  });

  it("should render the SCB Manager Bank ID and Status fields", () => {
    render(<ContractDetails />);
    expect(screen.getAllByText("SCB Manager Bank ID").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Status").length).toBeGreaterThanOrEqual(1);
  });

  it("should render the No Expiry and Same as Agreement Party checkboxes", () => {
    const { container } = render(<ContractDetails />);
    expect(screen.getByText("No Expiry")).toBeInTheDocument();
    expect(screen.getByText("Same as Agreement Party")).toBeInTheDocument();
    expect(
      container.querySelectorAll('input[type="checkbox"]').length
    ).toBeGreaterThanOrEqual(2);
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
      { selectedContract, data: [[]], contractDetails: [] },
      vendor
    );
    render(<ContractDetails />);
    expect(screen.getAllByText("Agreement Value").length).toBeGreaterThanOrEqual(1);
  });

  it("should render with contractDetails from redux", () => {
    setupSelector(
      {
        selectedContract: [],
        data: [[]],
        contractDetails: [
          { dataSource: "123", signedOn: "2025-01-01", referenceText: "Ref" },
        ],
      },
      vendor
    );
    render(<ContractDetails />);
    expect(screen.getAllByText("Reference Text").length).toBeGreaterThanOrEqual(1);
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
    render(<ContractDetails />);
    expect(screen.getByText("No Expiry")).toBeInTheDocument();
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
