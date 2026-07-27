import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Panel from "../../../components/requestAccess/Panel";

jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});
jest.spyOn(console, "log").mockImplementation(() => {});

let mockDispatch = jest.fn();
let mockState = {};

jest.mock("react-redux", () => ({
  useSelector: (cb) => cb(mockState),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

const mockHistoryPush = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  Link: ({ children }) => <span>{children}</span>,
  withRouter: (x) => x,
  useHistory: () => ({ push: mockHistoryPush }),
  __esModule: true,
  useLocation: () => ({
    pathname: "/another-route",
    search: "",
    hash: "",
    state: {
      data: {
        dataFeedLongName: "Test Feed Long Name",
        dataFamilyId: "DF1",
      },
    },
    key: "5nvxpbdafa",
  }),
}));

const mockSendData = jest.fn();
const mockApproveReject = jest.fn();
const mockSaveAsDraftRequest = jest.fn();
const mockDeleteSubscription = jest.fn();
jest.mock("../../../store/actions/requestAccessActions", () => ({
  sendData: (...args) => mockSendData(...args),
  approveReject: (...args) => mockApproveReject(...args),
  saveAsDraftRequest: (...args) => mockSaveAsDraftRequest(...args),
  deleteSubscription: (...args) => mockDeleteSubscription(...args),
}));

jest.mock("../../../store/services/ContractService", () => ({
  auditlogSubscriptionLevel: jest.fn(),
}));

jest.mock("../../../design-system/toast", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  },
}));

const { toast: mockToast } = require("../../../design-system/toast");

const baseMockState = () => ({
  dataset: {
    subscriptionInfo: { status: "pending" },
  },
  license: {},
  contract: {},
  requestAccess: {
    businessRequirements: [{ department: "IT", clarityId: "CL1" }],
    usage: [],
    tableInfo: {
      dataFamilyId: "DF1",
      dataFamilyName: "Data Family",
      noOfLicenses: 10,
      dataCoverage: "Global",
      contractExpDate: "2024-12-31",
      name: "Test",
      createdBy: "user1",
      licensesUsed: 5,
    },
    saveFinalData: {},
    response: { loading: false },
    dataByIdResponse: {},
  },
});

const baseMockProps = {
  subId: "",
  allowSubmit: true,
  history: { push: jest.fn() },
};

describe("Panel", () => {
  beforeEach(() => {
    mockDispatch = jest.fn();
    mockSendData.mockClear();
    mockApproveReject.mockClear();
    mockSaveAsDraftRequest.mockClear();
    mockDeleteSubscription.mockClear();
    baseMockProps.history.push.mockClear();
    mockHistoryPush.mockClear();
    mockDispatch.mockReturnValue(
      Promise.resolve({
        data: { subscriptionManagement: { subscriptionId: "SUB1" } },
        status: 200,
      })
    );
    localStorage.clear();
    localStorage.setItem("psid", "current_user");
    mockState = baseMockState();
  });

  it("should render the panel container", () => {
    const { container } = render(<Panel {...baseMockProps} />);
    expect(container.querySelector(".panel")).toBeInTheDocument();
  });

  it("should render the data feed long name in the header", () => {
    render(<Panel {...baseMockProps} />);
    expect(screen.getAllByText(/Test Feed Long Name/).length).toBeGreaterThan(0);
  });

  it("should render the Subscription breadcrumb", () => {
    render(<Panel {...baseMockProps} />);
    expect(screen.getByText("Subscription")).toBeInTheDocument();
  });

  it("should render Cancel and Submit buttons when subId is empty", () => {
    render(<Panel {...baseMockProps} />);
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
  });

  it("should not render Cancel/Submit buttons when subId is not empty", () => {
    render(<Panel {...baseMockProps} subId="SUB1" />);
    expect(screen.queryByRole("button", { name: "Cancel" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Submit" })).not.toBeInTheDocument();
  });

  it("should disable Submit when allowSubmit is false", () => {
    render(<Panel {...baseMockProps} allowSubmit={false} />);
    expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled();
  });

  it("should call sendData on submit when data has no subscriptionId", async () => {
    render(<Panel {...baseMockProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => expect(mockSendData).toHaveBeenCalled());
  });

  it("should call approveReject on submit when data has subscriptionId", async () => {
    mockState = baseMockState();
    mockState.requestAccess.saveFinalData = { subscriptionId: "EXISTING_SUB" };
    render(<Panel {...baseMockProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => expect(mockApproveReject).toHaveBeenCalled());
  });

  it("should navigate to catalog on cancel when location has data", () => {
    render(<Panel {...baseMockProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(baseMockProps.history.push).toHaveBeenCalledWith("/catalog");
  });

  it("should toast success and redirect with the new subscription after submit", async () => {
    render(<Panel {...baseMockProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() =>
      expect(mockToast.success).toHaveBeenCalledWith(
        "SUB1 submitted successfully."
      )
    );
    await waitFor(
      () =>
        expect(baseMockProps.history.push).toHaveBeenCalledWith({
          pathname: "/catalog/details",
          state: {
            data: {
              dataFeedLongName: "Test Feed Long Name",
              dataFamilyId: "DF1",
              subscription: {
                subscriptionStatus: "Pending",
                subscriptionId: "SUB1",
              },
            },
            activeTab: 1,
          },
        }),
      { timeout: 2000 }
    );
  });

  it("should toast the generic update message when no subscription is returned", async () => {
    mockDispatch.mockReturnValue(Promise.resolve({ data: {}, status: 200 }));
    render(<Panel {...baseMockProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() =>
      expect(mockToast.success).toHaveBeenCalledWith("Updated successfully.")
    );
    // redirect without a subscription payload keeps the original catalogue data
    await waitFor(
      () =>
        expect(baseMockProps.history.push).toHaveBeenCalledWith({
          pathname: "/catalog/details",
          state: {
            data: {
              dataFeedLongName: "Test Feed Long Name",
              dataFamilyId: "DF1",
            },
            activeTab: 1,
          },
        }),
      { timeout: 2000 }
    );
  });

  it("should toast an error when the submit response contains a message", async () => {
    mockDispatch.mockReturnValue(
      Promise.resolve({ message: "Save failed" })
    );
    render(<Panel {...baseMockProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() =>
      expect(mockToast.error).toHaveBeenCalledWith("Save failed")
    );
    expect(mockToast.success).not.toHaveBeenCalled();
  });

  it("should toast an error when approveReject rejects", async () => {
    mockState = baseMockState();
    mockState.requestAccess.saveFinalData = { subscriptionId: "EXISTING_SUB" };
    mockDispatch.mockReturnValue(
      Promise.reject({ message: "Approve failed" })
    );
    render(<Panel {...baseMockProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() =>
      expect(mockToast.error).toHaveBeenCalledWith("Approve failed")
    );
  });

  it("should warn to fill the form when allowSubmit is not set", async () => {
    render(<Panel {...baseMockProps} allowSubmit={undefined} />);
    const submit = screen.getByRole("button", { name: "Submit" });
    expect(submit).not.toBeDisabled();
    fireEvent.click(submit);
    await waitFor(() =>
      expect(mockToast.warning).toHaveBeenCalledWith("Please fill the form!")
    );
    expect(mockSendData).not.toHaveBeenCalled();
    expect(mockApproveReject).not.toHaveBeenCalled();
  });

  it("should navigate back to the catalog from the page header", () => {
    render(<Panel {...baseMockProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(baseMockProps.history.push).toHaveBeenCalledWith("/catalog");
  });

  it("should render a dash when the data feed long name is missing", () => {
    // memo()d component — a fresh render with different location data
    const spy = jest.requireMock("react-router-dom");
    const original = spy.useLocation;
    spy.useLocation = () => ({
      pathname: "/another-route",
      search: "",
      hash: "",
      state: { data: { dataFamilyId: "DF1" } },
      key: "abc123",
    });
    render(<Panel {...baseMockProps} />);
    expect(screen.getByText("-")).toBeInTheDocument();
    spy.useLocation = original;
  });
});
