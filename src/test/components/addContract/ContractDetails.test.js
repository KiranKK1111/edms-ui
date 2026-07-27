import React from "react";
import * as redux from "react-redux";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import ContractDetails, {
  CamelText,
} from "../../../components/addContract/ContractDetails";
import { contractDetails as contractDetailsAction } from "../../../store/actions/contractAction";

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
// Mutable so individual tests can switch between the addAgreement and the
// vendor-scoped routes (they resolve `dataSource` from different params).
let mockParams = { vendorId: "123", id: "" };
let mockPathname = "/addAgreement/123";
jest.mock("react-router-dom", () => ({
  useParams: () => mockParams,
  useHistory: () => ({
    push: jest.fn(),
    get location() {
      return { pathname: mockPathname };
    },
  }),
  useLocation: () => ({ pathname: mockPathname }),
}));

jest.mock("../../../store/actions/contractAction", () => ({
  contractDetails: jest.fn(),
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
    mockParams = { vendorId: "123", id: "" };
    mockPathname = "/addAgreement/123";
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

  // Guards the edit-mode prefill race: the selected record is dispatched by
  // the parent AFTER this component mounts, so the bind effect must re-run
  // when the record lands (a mount-only effect left the edit form blank).
  it("should bind the record when selectedContract arrives after mount", async () => {
    setupSelector(); // record not loaded yet
    // The component is memo()d and useSelector is mocked (no store
    // subscription), so change a prop between renders to force a re-render.
    const { rerender } = render(<ContractDetails bump={1} />);
    expect(screen.queryByDisplayValue("AG-1")).not.toBeInTheDocument();

    setupSelector({
      selectedContract: [
        {
          agreementId: "AG-1",
          agreementName: "TestVendor_01012024_ref",
          agreementValue: "500",
          agreementType: "Vendor contract",
          agreementReferenceText: "ref",
          agreementReferenceId: "RID-9",
          agreementPartyId: "123",
          agreementScbAgreementMgrBankId: "MB1",
          agreementSignedOn: "2024-01-02",
          agreementStartDate: "2024-01-03",
          agreementExpiryDate: "2024-12-31",
          agreementStatus: "Active",
        },
      ],
      data: [[]],
      contractDetails: [],
    });
    rerender(<ContractDetails bump={2} />);

    expect(await screen.findByDisplayValue("AG-1")).toBeInTheDocument();
    expect(screen.getByDisplayValue("500")).toBeInTheDocument();
    expect(screen.getByDisplayValue("RID-9")).toBeInTheDocument();
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

const DUP_NAME_MESSAGE = "Agreement name already exists under this entity";

describe("ContractDetails — checkboxes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParams = { vendorId: "123", id: "" };
    mockPathname = "/addAgreement/123";
    setupSelector();
  });

  it("should clear and disable the expiration date when No Expiry is ticked", async () => {
    render(<ContractDetails />);
    // x-date-pickers renders the field as a role=group of editable sections;
    // the disabled state lands on that group as Mui-disabled.
    const expiryField = () =>
      screen.getByRole("group", { name: "Expiration Date" });
    const noExpiry = screen.getByLabelText("No Expiry");
    expect(noExpiry).not.toBeChecked();
    expect(expiryField()).not.toHaveClass("Mui-disabled");

    fireEvent.click(noExpiry);

    expect(noExpiry).toBeChecked();
    await waitFor(() => expect(expiryField()).toHaveClass("Mui-disabled"));

    // and back off again re-enables it
    fireEvent.click(noExpiry);
    expect(noExpiry).not.toBeChecked();
    await waitFor(() =>
      expect(expiryField()).not.toHaveClass("Mui-disabled")
    );
  });

  it("should copy the route id into Data Source when Same as Agreement Party is ticked (addAgreement route)", async () => {
    mockParams = { vendorId: "123", id: "AG-ROUTE" };
    mockPathname = "/addAgreement/AG-ROUTE";
    setupSelector();
    render(<ContractDetails />);

    const sameAs = screen.getByLabelText("Same as Agreement Party");
    fireEvent.click(sameAs);

    expect(sameAs).toBeChecked();
    expect(await screen.findByDisplayValue("AG-ROUTE")).toBeInTheDocument();
  });

  it("should copy the vendorId into Data Source outside the addAgreement route", async () => {
    mockParams = { vendorId: "VEND-9", id: "" };
    mockPathname = "/editAgreement/VEND-9";
    setupSelector();
    render(<ContractDetails />);

    fireEvent.click(screen.getByLabelText("Same as Agreement Party"));

    expect(await screen.findByDisplayValue("VEND-9")).toBeInTheDocument();
  });
});

describe("ContractDetails — agreement name composition", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParams = { vendorId: "123", id: "" };
    mockPathname = "/addAgreement/123";
    setupSelector();
  });

  it("should auto-compose the agreement name from entity and reference text", async () => {
    render(<ContractDetails />);
    fireEvent.change(screen.getByPlaceholderText("Reference Text"), {
      target: { value: "myref" },
    });
    expect(await screen.findByDisplayValue("123__myref")).toBeInTheDocument();
  });

  it("should flag a composed name that already exists for the entity", async () => {
    setupSelector(
      {
        selectedContract: [],
        data: [[{ agreementId: "OTHER", agreementName: "123__taken" }]],
        contractDetails: [],
      },
      vendor
    );
    render(<ContractDetails />);
    fireEvent.change(screen.getByPlaceholderText("Reference Text"), {
      target: { value: "taken" },
    });
    expect(await screen.findByText(DUP_NAME_MESSAGE)).toBeInTheDocument();

    // typing something unique clears the manual error again
    fireEvent.change(screen.getByPlaceholderText("Reference Text"), {
      target: { value: "free" },
    });
    await waitFor(() =>
      expect(screen.queryByText(DUP_NAME_MESSAGE)).not.toBeInTheDocument()
    );
  });

  it("should exclude the record being edited from the duplicate check", async () => {
    setupSelector(
      {
        selectedContract: [],
        data: [[{ agreementId: "AG-1", agreementName: "123__taken" }]],
        contractDetails: [
          { agreementId: "AG-1", referenceText: "taken", dataSource: "123" },
        ],
      },
      vendor
    );
    render(<ContractDetails />);
    await screen.findByDisplayValue("AG-1");

    fireEvent.change(screen.getByPlaceholderText("Reference Text"), {
      target: { value: "taken" },
    });
    await waitFor(() =>
      expect(screen.getByDisplayValue("123__taken")).toBeInTheDocument()
    );
    expect(screen.queryByText(DUP_NAME_MESSAGE)).not.toBeInTheDocument();
  });
});

describe("ContractDetails — submission", () => {
  const filled = {
    agreementId: "AG-1",
    agreementName: "123__ref",
    referenceId: "RID-1",
    referenceText: "ref",
    agreementType: "Vendor contract",
    dataSource: "TestVendor",
    agreementValue: "500",
    signedOn: "2024-01-02",
    startDate: "2024-01-03",
    expirationDate: "2024-12-31",
    ScbAgreementManagerBankId: "MB-1",
    status: "Pending",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockParams = { vendorId: "123", id: "" };
    mockPathname = "/addAgreement/123";
    setupSelector();
  });

  const renderAndSubmit = (next) => {
    const utils = render(<ContractDetails next={next} formData={false} />);
    return {
      ...utils,
      submit: () =>
        utils.rerender(<ContractDetails next={next} formData={true} />),
    };
  };

  it("should persist the values and advance when the parent asks for the data", async () => {
    setupSelector(
      { selectedContract: [], data: [[]], contractDetails: [filled] },
      vendor
    );
    const next = jest.fn();
    const { submit } = renderAndSubmit(next);
    await screen.findByDisplayValue("AG-1");

    submit();

    await waitFor(() => expect(next).toHaveBeenCalledWith(true));
    expect(contractDetailsAction).toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalled();
    const [payload] = contractDetailsAction.mock.calls[0];
    expect(payload[0].agreementValue).toBe("500");
    expect(payload[0].ScbAgreementManagerBankId).toBe("MB-1");
    expect(next).toHaveBeenCalledWith(false);
  });

  it("should surface validation errors and not persist an incomplete form", async () => {
    const next = jest.fn();
    const { submit } = renderAndSubmit(next);

    submit();

    await waitFor(() => expect(next).toHaveBeenCalledWith(false));
    expect(
      await screen.findByText("Agreement value is mandatory !")
    ).toBeInTheDocument();
    expect(screen.getByText("Reference Text is mandatory !")).toBeInTheDocument();
    expect(
      screen.getByText("SCB Manager Bank ID is required !")
    ).toBeInTheDocument();
    expect(screen.getByText("Signed on is required !")).toBeInTheDocument();
    expect(contractDetailsAction).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalledWith(true);
  });

  it("should reject a non-numeric agreement value", async () => {
    const next = jest.fn();
    const { submit } = renderAndSubmit(next);
    fireEvent.change(screen.getByPlaceholderText("Enter Agreement Value"), {
      target: { value: "abc" },
    });

    submit();

    expect(
      await screen.findByText("Only numbers and positive numbers are allowed")
    ).toBeInTheDocument();
    expect(contractDetailsAction).not.toHaveBeenCalled();
  });

  it("should not persist while the composed name is a duplicate", async () => {
    setupSelector(
      {
        selectedContract: [],
        // signedOn 2024-01-02 formats to 02012024 in the composed name
        data: [[{ agreementId: "OTHER", agreementName: "123_02012024_ref" }]],
        contractDetails: [{ ...filled, agreementId: "" }],
      },
      vendor
    );
    const next = jest.fn();
    const { submit } = renderAndSubmit(next);
    expect(await screen.findByText(DUP_NAME_MESSAGE)).toBeInTheDocument();

    submit();

    await waitFor(() => expect(next).toHaveBeenCalledWith(false));
    expect(next).not.toHaveBeenCalledWith(true);
    expect(contractDetailsAction).not.toHaveBeenCalled();
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
