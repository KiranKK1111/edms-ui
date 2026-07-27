import React from "react";
import { render, screen, fireEvent, within, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppProviders } from "../../../design-system";
import LicenseDetailsApproveReject from "../../../components/license/licenseDetailsApproveReject/licenseDetailsApproveReject";

let mockState = {};
const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: (cb) => cb(mockState),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

const mockPush = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ id: "123" }),
  useHistory: () => ({ push: mockPush }),
}));

jest.mock("../../../store/actions/licenseAction", () => ({
  getLicenseDetailsById: jest.fn(() => "getLicenseDetailsById"),
  getLicenseDetailsByCrId: jest.fn(() => "getLicenseDetailsByCrId"),
}));

jest.mock("../../../store/actions/MyTasksActions", () => ({
  updateTaskAction: jest.fn(() => "updateTaskAction"),
}));

jest.mock("../../../utils/accessMyTask", () => jest.fn());

const { updateTaskAction } = require("../../../store/actions/MyTasksActions");
const isAcessDisabled = require("../../../utils/accessMyTask");

const buildState = () => ({
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
        technicalDocument: "doc1.pdf,doc2.pdf",
      },
    ],
  },
});

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

const renderComponent = () =>
  render(
    <AppProviders>
      <MemoryRouter>
        <LicenseDetailsApproveReject {...mockProps} />
      </MemoryRouter>
    </AppProviders>
  );

describe("LicenseDetailsApproveReject", () => {
  beforeEach(() => {
    isAcessDisabled.mockReturnValue(false);
    mockDispatch.mockReturnValue(Promise.resolve({ data: true }));
    localStorage.clear();
    localStorage.setItem("psid", "current_user");
    mockState = buildState();
  });

  it("should render the Licence Details section header", () => {
    renderComponent();
    expect(screen.getByText("Licence Details")).toBeInTheDocument();
  });

  it("should render the Licence Limitations section header", () => {
    renderComponent();
    expect(
      screen.getAllByText("Licence Limitations").length
    ).toBeGreaterThanOrEqual(1);
  });

  it("should render the licence short name as the title", () => {
    renderComponent();
    expect(screen.getAllByText("TL").length).toBeGreaterThanOrEqual(1);
  });

  it("should render Approve and Reject buttons", () => {
    renderComponent();
    expect(screen.getByRole("button", { name: "Approve" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reject" })).toBeInTheDocument();
  });

  it("should open the approve modal and dispatch on confirm", async () => {
    renderComponent();
    fireEvent.click(screen.getByRole("button", { name: "Approve" }));
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Approve" }));
    await waitFor(() => expect(updateTaskAction).toHaveBeenCalled());
  });
});
