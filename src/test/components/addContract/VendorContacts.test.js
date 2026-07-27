import React from "react";
import * as redux from "react-redux";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import VendorContacts from "../../../components/addContract/VendorContacts";
import { vendorContacts } from "../../../store/actions/contractAction";

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
}));

jest.mock("../../../components/addContract/bindData", () => ({
  bindData: jest.fn(),
}));

jest.mock("../../../store/actions/contractAction", () => ({
  vendorContacts: jest.fn(),
}));

const contract = {
  selectedContract: [{}],
  vendorContacts: [{}],
};
const state = { contract };

describe("VendorContacts", () => {
  beforeEach(() => {
    jest
      .spyOn(redux, "useSelector")
      .mockImplementation((callback) => callback(state));
  });

  it("should render the Agreement Limitations field", () => {
    render(<VendorContacts next={jest.fn()} />);
    expect(screen.getAllByText("Agreement Limitations").length).toBeGreaterThanOrEqual(1);
  });

  it("should render the agreement limitations textarea", () => {
    const { container } = render(<VendorContacts next={jest.fn()} />);
    expect(
      screen.getByPlaceholderText("Agreement Limitations")
    ).toBeInTheDocument();
    expect(container.querySelector("textarea")).toBeInTheDocument();
  });

  it("should prefill agreement limitations from the selected contract record", () => {
    jest.spyOn(redux, "useSelector").mockImplementation((cb) =>
      cb({
        contract: {
          selectedContract: [{ agreementLimitations: "No redistribution" }],
          vendorContacts: [],
        },
      })
    );
    render(<VendorContacts next={jest.fn()} />);
    expect(
      screen.getByDisplayValue("No redistribution")
    ).toBeInTheDocument();
  });

  it("should register a draft saver that persists current values for Previous", () => {
    const registerDraftSaver = jest.fn();
    render(
      <VendorContacts next={jest.fn()} registerDraftSaver={registerDraftSaver} />
    );
    expect(registerDraftSaver).toHaveBeenCalledWith(expect.any(Function));
    mockDispatch.mockClear();
    const saver = registerDraftSaver.mock.calls[0][0];
    saver();
    expect(mockDispatch).toHaveBeenCalled();
  });

  it("should unregister the draft saver on unmount", () => {
    const registerDraftSaver = jest.fn();
    const { unmount } = render(
      <VendorContacts next={jest.fn()} registerDraftSaver={registerDraftSaver} />
    );
    unmount();
    expect(registerDraftSaver).toHaveBeenLastCalledWith(null);
  });
});

const useState = (contract) =>
  jest.spyOn(redux, "useSelector").mockImplementation((cb) => cb({ contract }));

describe("VendorContacts — binding", () => {
  beforeEach(() => {
    useState(contract);
  });

  it("should default the billing model when nothing is stored", () => {
    useState({ selectedContract: [], vendorContacts: [] });
    render(<VendorContacts next={jest.fn()} />);
    expect(screen.getByPlaceholderText("Agreement Limitations")).toHaveValue("");
  });

  it("should prefer the vendorContacts slice over the selected contract", () => {
    useState({
      vendorContacts: [{ agreementLimitations: "From step data" }],
      selectedContract: [{ agreementLimitations: "From saved record" }],
    });
    render(<VendorContacts next={jest.fn()} />);
    expect(screen.getByDisplayValue("From step data")).toBeInTheDocument();
    expect(
      screen.queryByDisplayValue("From saved record")
    ).not.toBeInTheDocument();
  });

  it("should keep a stored billing model and carry it into the payload", async () => {
    useState({
      vendorContacts: [
        { agreementLimitations: "Limited", billingModel: "Direct cost" },
      ],
      selectedContract: [],
    });
    const next = jest.fn();
    const { rerender } = render(
      <VendorContacts next={next} formData={false} />
    );
    expect(screen.getByDisplayValue("Limited")).toBeInTheDocument();

    rerender(<VendorContacts next={next} formData={true} />);
    await waitFor(() => expect(next).toHaveBeenCalledWith(true));
    expect(vendorContacts).toHaveBeenCalledWith([
      { agreementLimitations: "Limited", billingModel: "Direct cost" },
    ]);
  });

  it("should tolerate a slice whose first entry is missing", () => {
    useState({ vendorContacts: [undefined], selectedContract: [] });
    expect(() => render(<VendorContacts next={jest.fn()} />)).not.toThrow();
    expect(screen.getByPlaceholderText("Agreement Limitations")).toHaveValue("");
  });
});

describe("VendorContacts — submission", () => {
  beforeEach(() => {
    useState({ selectedContract: [], vendorContacts: [] });
  });

  it("should persist the typed limitations and advance when Next is pressed", async () => {
    const next = jest.fn();
    const { rerender } = render(
      <VendorContacts next={next} formData={false} />
    );
    fireEvent.change(screen.getByPlaceholderText("Agreement Limitations"), {
      target: { value: "No onward distribution" },
    });

    rerender(<VendorContacts next={next} formData={true} />);

    await waitFor(() => expect(next).toHaveBeenCalledWith(true));
    expect(next).toHaveBeenCalledWith(false);
    expect(mockDispatch).toHaveBeenCalled();
    expect(vendorContacts).toHaveBeenCalledWith([
      {
        agreementLimitations: "No onward distribution",
        billingModel: "Shared cost",
      },
    ]);
  });

  it("should not persist anything while the parent has not asked for the data", () => {
    const next = jest.fn();
    render(<VendorContacts next={next} formData={false} />);
    expect(vendorContacts).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });
});
