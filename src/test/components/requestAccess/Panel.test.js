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
});
