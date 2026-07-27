import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useLocation } from "react-router-dom";

import Usage from "../../../components/requestAccess/Usage";

jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});

let mockDispatch = jest.fn();
let mockState = {};

jest.mock("react-redux", () => ({
  useSelector: (cb) => cb(mockState),
  useDispatch: () => mockDispatch,
}));

jest.mock("react-router-dom", () => ({
  useLocation: jest.fn(),
}));

const mockUsageAction = jest.fn();
const mockUpdateUsage = jest.fn();
jest.mock("../../../store/actions/requestAccessActions", () => ({
  usage: (...args) => mockUsageAction(...args),
  updateUsage: (...args) => mockUpdateUsage(...args),
}));

beforeAll(() => {
  // The Expiration Date field renders a MUI DatePicker which subscribes via
  // useMediaQuery (addEventListener). The global setup mock only provides the
  // legacy addListener API, so provide a fuller matchMedia here. Reporting a
  // fine pointer keeps the picker on its desktop variant so the calendar can
  // be opened from the adornment button.
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query) => ({
      matches: /pointer: fine/.test(query),
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }),
  });
});

const buildState = (overrides = {}) => ({
  requestAccess: {
    tableInfo: { contractExpDate: "", licenseStatus: "" },
    usage: [],
    businessRequirements: [{ subscriptionId: "" }],
    ...overrides,
  },
});

const baseProps = () => ({ formData: false, next: jest.fn() });

describe("Usage", () => {
  beforeEach(() => {
    mockDispatch = jest.fn();
    mockUsageAction.mockReturnValue("usage");
    mockUpdateUsage.mockReturnValue("updateUsage");
    mockState = buildState();
    useLocation.mockReturnValue({ state: { data: {} } });
  });

  it("should render the usage form", () => {
    const { container } = render(<Usage {...baseProps()} />);
    expect(container.querySelector("form[name='usage-one']")).toBeInTheDocument();
  });

  it("should render the Billing Model field", () => {
    render(<Usage {...baseProps()} />);
    expect(screen.getByPlaceholderText("Billing Model")).toBeInTheDocument();
  });

  it("should default the cost to 1 when the licence has no cost", () => {
    render(<Usage {...baseProps()} />);
    expect(screen.getByPlaceholderText("Est.Cost Per Annum")).toHaveValue("1");
  });

  it("should derive the cost per subscriber from the licence cost", () => {
    useLocation.mockReturnValue({
      state: { data: { license: { licenseCost: 1000 }, totalSubscribers: 3 } },
    });
    render(<Usage {...baseProps()} />);
    // ceil(1000 / 3 + 1) === 335
    expect(screen.getByPlaceholderText("Est.Cost Per Annum")).toHaveValue("335");
  });

  it("should prefill the form from the redux usage data", () => {
    mockState = buildState({
      usage: [
        {
          subscriptionCycle: "Monthly",
          billingModel: "Shared cost",
          estRechargeCostPerAnnum: "900",
          alertsAndNotifications: "No",
          subscriptionStatus: "Active",
        },
      ],
      businessRequirements: [{ subscriptionId: "S1" }],
    });
    render(<Usage {...baseProps()} />);
    expect(screen.getByPlaceholderText("Est.Cost Per Annum")).toHaveValue("900");
    expect(screen.getByLabelText("Subscription Cycle")).toHaveTextContent(
      "Monthly"
    );
    expect(screen.getByLabelText("Alerts & Notifications")).toHaveTextContent(
      "No"
    );
  });

  it("should disable the subscription status until a subscription exists", () => {
    render(<Usage {...baseProps()} />);
    expect(screen.getByLabelText("Subscription Status")).toHaveAttribute(
      "aria-disabled",
      "true"
    );
  });

  it("should enable the subscription status once a subscription exists", () => {
    mockState = buildState({ businessRequirements: [{ subscriptionId: "S1" }] });
    render(<Usage {...baseProps()} />);
    expect(screen.getByLabelText("Subscription Status")).not.toHaveAttribute(
      "aria-disabled"
    );
  });

  it("should push the subscription cycle change into the store", () => {
    render(<Usage {...baseProps()} />);
    fireEvent.mouseDown(screen.getByLabelText("Subscription Cycle"));
    fireEvent.click(screen.getByRole("option", { name: "Monthly" }));
    expect(mockUpdateUsage).toHaveBeenCalledWith({
      subscriptionCycle: "Monthly",
    });
    expect(mockDispatch).toHaveBeenCalledWith("updateUsage");
  });

  it("should push the alerts change into the store", () => {
    render(<Usage {...baseProps()} />);
    fireEvent.mouseDown(screen.getByLabelText("Alerts & Notifications"));
    fireEvent.click(screen.getByRole("option", { name: "No" }));
    expect(mockUpdateUsage).toHaveBeenCalledWith({
      alertsAndNotifications: "No",
    });
  });

  it("should push the subscription status change into the store", () => {
    mockState = buildState({ businessRequirements: [{ subscriptionId: "S1" }] });
    render(<Usage {...baseProps()} />);
    fireEvent.mouseDown(screen.getByLabelText("Subscription Status"));
    fireEvent.click(screen.getByRole("option", { name: "Suspended" }));
    expect(mockUpdateUsage).toHaveBeenCalledWith({
      subscriptionStatus: "Suspended",
    });
  });

  it("should push the cost on blur into the store", () => {
    render(<Usage {...baseProps()} />);
    const cost = screen.getByPlaceholderText("Est.Cost Per Annum");
    fireEvent.change(cost, { target: { value: "250" } });
    fireEvent.blur(cost);
    expect(mockUpdateUsage).toHaveBeenCalledWith({
      estRechargeCostPerAnnum: "250",
    });
  });

  it("should render the currency selector adornment", () => {
    render(<Usage {...baseProps()} />);
    expect(document.querySelector(".select-before")).toBeInTheDocument();
  });

  it("should store the picked expiration date and honour the disabled range", async () => {
    mockState = buildState({
      tableInfo: { contractExpDate: "2030-12-31", licenseStatus: "Active" },
    });
    render(<Usage {...baseProps()} />);
    fireEvent.click(screen.getByRole("button", { name: /choose date/i }));
    const day = (
      await screen.findAllByRole("gridcell")
    ).find((cell) => cell.textContent === "15");
    fireEvent.click(day);
    await waitFor(() =>
      expect(mockUpdateUsage).toHaveBeenCalledWith(
        expect.objectContaining({ expirationDate: expect.anything() })
      )
    );
  });

  it("should disable dates that fall outside the contract window", async () => {
    mockState = buildState({
      tableInfo: { contractExpDate: "2030-12-31", licenseStatus: "Active" },
    });
    render(<Usage {...baseProps()} />);
    fireEvent.click(screen.getByRole("button", { name: /choose date/i }));
    // navigate back far enough that every rendered day is in the past
    const cells = await screen.findAllByRole("gridcell");
    expect(cells.length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: /previous month/i }));
    const previous = await screen.findAllByRole("gridcell");
    expect(previous.length).toBeGreaterThan(0);
  });

  it("should dispatch the usage details and advance when the form is valid", async () => {
    mockState = buildState({
      tableInfo: { contractExpDate: "2030-12-31", licenseStatus: "Active" },
    });
    const props = baseProps();
    const { rerender } = render(<Usage {...props} />);
    rerender(<Usage {...props} formData={true} />);
    await waitFor(() =>
      expect(mockUsageAction).toHaveBeenCalledWith(
        expect.objectContaining({
          subscriptionCycle: "Weekly",
          billingModel: "Shared cost",
          alertsAndNotifications: "Yes",
          subscriptionStatus: "Active",
        })
      )
    );
    expect(mockDispatch).toHaveBeenCalledWith("usage");
    await waitFor(() => expect(props.next).toHaveBeenCalledWith(true));
    expect(props.next).toHaveBeenCalledWith(false);
  });

  it("should not advance when a mandatory field is empty", async () => {
    mockState = buildState({
      tableInfo: { contractExpDate: "2030-12-31", licenseStatus: "Active" },
    });
    const props = baseProps();
    const { rerender } = render(<Usage {...props} />);
    fireEvent.change(screen.getByPlaceholderText("Est.Cost Per Annum"), {
      target: { value: "" },
    });
    rerender(<Usage {...props} formData={true} />);
    await waitFor(() =>
      expect(
        screen.getByText("Est. cost per annum cycle is mandatory.")
      ).toBeInTheDocument()
    );
    expect(mockUsageAction).not.toHaveBeenCalled();
    expect(props.next).toHaveBeenCalledWith(false);
    expect(props.next).not.toHaveBeenCalledWith(true);
  });

  it("should reject a non numeric cost", async () => {
    const props = baseProps();
    const { rerender } = render(<Usage {...props} />);
    fireEvent.change(screen.getByPlaceholderText("Est.Cost Per Annum"), {
      target: { value: "abc" },
    });
    rerender(<Usage {...props} formData={true} />);
    await waitFor(() =>
      expect(
        screen.getByText("Please enter a valid Est. cost per annum")
      ).toBeInTheDocument()
    );
    expect(mockUsageAction).not.toHaveBeenCalled();
  });

  it("should not run the submit effect while formData stays false", () => {
    const props = baseProps();
    render(<Usage {...props} />);
    expect(props.next).not.toHaveBeenCalled();
    expect(mockUsageAction).not.toHaveBeenCalled();
  });
});
