import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";

import { buildMuiTheme } from "../../../design-system/muiTheme";
import VendorDetails from "../../../components/vendors/VendorDetails/VendorDetails";

jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});

// ---- redux (resetMocks safe: plain functions + module-level state) ----
let mockDispatch = jest.fn();
let mockState = {
  vendor: {
    data: {
      entityId: "V1",
      longName: "Vendor One",
      shortName: "V1Short",
      entityType: "External",
      website: "example.com",
      entityStatus: "Active",
      entityDescription: "Test vendor description",
    },
  },
};
jest.mock("react-redux", () => ({
  useSelector: (cb) => cb(mockState),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

// ---- router: stable useParams reference, real Link/MemoryRouter ----
const mockHistoryPush = jest.fn();
const mockUseParams = jest.fn();
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useParams: () => mockUseParams(),
    useHistory: () => ({ push: mockHistoryPush }),
  };
});

// ---- design-system: keep real exports, stub useSnackbar ----
jest.mock("../../../design-system", () => {
  const actual = jest.requireActual("../../../design-system");
  return {
    ...actual,
    useSnackbar: () => ({
      success: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      warning: jest.fn(),
      open: jest.fn(),
      close: jest.fn(),
    }),
  };
});

// ---- store actions ----
jest.mock("../../../store/actions/VendorActions", () => ({
  getDetailsByChangeRequestId: jest.fn((x) => "getDetailsByChangeRequestId_" + x),
  getVendorDetailsById: jest.fn((x) => "getVendorDetailsById_" + x),
}));
jest.mock("../../../store/actions/MyTasksActions", () => ({
  updateTaskAction: jest.fn(() => "updateTaskAction"),
}));
jest.mock("../../../utils/accessMyTask", () => jest.fn(() => false));

const { updateTaskAction } = require("../../../store/actions/MyTasksActions");
const isAcessDisabled = require("../../../utils/accessMyTask");

const theme = buildMuiTheme("light");

const baseMockProps = {
  location: {
    state: {
      myTaskData: {
        taskListId: "T1",
        taskListObjectAction: "Create",
        taskListTaskStatus: "Pending",
        taskListCreatedBy: "other_user",
        taskListObject: "Entity",
      },
    },
  },
  history: { push: jest.fn() },
};

const renderVendor = (props = baseMockProps) =>
  render(
    <MemoryRouter>
      <ThemeProvider theme={theme}>
        <VendorDetails {...props} />
      </ThemeProvider>
    </MemoryRouter>
  );

describe("VendorDetails", () => {
  beforeEach(() => {
    mockDispatch.mockReset();
    mockHistoryPush.mockReset();
    updateTaskAction.mockClear();
    isAcessDisabled.mockReturnValue(false);
    mockUseParams.mockReturnValue({ id: "V1", taskId: "T1" });
    mockDispatch.mockReturnValue(
      Promise.resolve({ data: { statusMessage: { message: "Success" } } })
    );
    localStorage.clear();
    localStorage.setItem("psid", "current_user");
    localStorage.setItem("entitlementType", "Admin");
  });

  it("should render without crashing", () => {
    renderVendor();
    expect(screen.getByText("Entity Details")).toBeInTheDocument();
  });

  it("should render the shared layout title/breadcrumb (short name)", () => {
    renderVendor();
    // short name appears in the hero title and the breadcrumb
    expect(screen.getAllByText("V1Short").length).toBeGreaterThanOrEqual(2);
  });

  it("should render the Entity Details heading", () => {
    renderVendor();
    expect(screen.getByText("Entity Details")).toBeInTheDocument();
  });

  it("should render the Approve and Reject action buttons", () => {
    renderVendor();
    expect(screen.getByRole("button", { name: "Approve" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reject" })).toBeInTheDocument();
  });

  it("should not disable actions when Pending and access allowed", () => {
    renderVendor();
    expect(screen.getByRole("button", { name: "Approve" })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "Reject" })).not.toBeDisabled();
  });

  it("should disable actions when isAcessDisabled returns true", () => {
    isAcessDisabled.mockReturnValue(true);
    renderVendor();
    expect(screen.getByRole("button", { name: "Approve" })).toBeDisabled();
  });

  it("should disable actions when taskListCreatedBy equals psid", () => {
    localStorage.setItem("psid", "other_user");
    renderVendor();
    expect(screen.getByRole("button", { name: "Approve" })).toBeDisabled();
  });

  it("should render with Update action props", () => {
    const updateProps = {
      ...baseMockProps,
      location: {
        state: {
          myTaskData: {
            ...baseMockProps.location.state.myTaskData,
            taskListObjectAction: "Update",
          },
        },
      },
    };
    renderVendor(updateProps);
    expect(screen.getByText("Entity Details")).toBeInTheDocument();
  });

  it("should render with Deactivate action props", () => {
    const deactivateProps = {
      ...baseMockProps,
      location: {
        state: {
          myTaskData: {
            ...baseMockProps.location.state.myTaskData,
            taskListObjectAction: "Deactivate",
          },
        },
      },
    };
    renderVendor(deactivateProps);
    expect(screen.getByText("Entity Details")).toBeInTheDocument();
  });

  it("should open the approve modal when Approve is clicked", async () => {
    renderVendor();
    fireEvent.click(screen.getByRole("button", { name: "Approve" }));
    expect(await screen.findByText("Approve Task")).toBeInTheDocument();
  });

  it("should open the reject modal when Reject is clicked", async () => {
    renderVendor();
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));
    expect(await screen.findByText("Reject Task")).toBeInTheDocument();
  });

  it("should dispatch updateTaskAction and navigate on approve confirm", async () => {
    mockDispatch.mockReturnValue(
      Promise.resolve({ data: { statusMessage: { message: "Approved!" } } })
    );
    renderVendor();
    fireEvent.click(screen.getByRole("button", { name: "Approve" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Approve" }));
    await waitFor(() => expect(updateTaskAction).toHaveBeenCalled());
    await waitFor(() =>
      expect(mockHistoryPush).toHaveBeenCalledWith("/myTasks")
    );
  });

  it("should not navigate when approve response has no statusMessage", async () => {
    mockDispatch.mockReturnValue(Promise.resolve({ data: {} }));
    renderVendor();
    fireEvent.click(screen.getByRole("button", { name: "Approve" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Approve" }));
    await waitFor(() => expect(updateTaskAction).toHaveBeenCalled());
    expect(mockHistoryPush).not.toHaveBeenCalledWith("/myTasks");
  });

  it("should not navigate when approve response is null", async () => {
    mockDispatch.mockReturnValue(Promise.resolve(null));
    renderVendor();
    fireEvent.click(screen.getByRole("button", { name: "Approve" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Approve" }));
    await waitFor(() => expect(updateTaskAction).toHaveBeenCalled());
    expect(mockHistoryPush).not.toHaveBeenCalledWith("/myTasks");
  });

  it("should close the approve modal via Cancel", async () => {
    renderVendor();
    fireEvent.click(screen.getByRole("button", { name: "Approve" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() =>
      expect(screen.queryByText("Approve Task")).not.toBeInTheDocument()
    );
  });

  it("should close the reject modal via Cancel", async () => {
    renderVendor();
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() =>
      expect(screen.queryByText("Reject Task")).not.toBeInTheDocument()
    );
  });

  it("should render the reject reason field inside the reject modal", async () => {
    renderVendor();
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));
    await screen.findByText("Reject Task");
    expect(screen.getAllByText("Reason").length).toBeGreaterThanOrEqual(1);
  });

  it("should render the entity field labels and values", () => {
    renderVendor();
    expect(screen.getByText("Entity ID")).toBeInTheDocument();
    expect(screen.getByText("Long Name")).toBeInTheDocument();
    expect(screen.getByText("Vendor One")).toBeInTheDocument();
    expect(screen.getByText("Test vendor description")).toBeInTheDocument();
  });

  it("should pass the entity-main className to the layout root", () => {
    const { container } = renderVendor();
    expect(container.querySelector(".entity-main")).toBeInTheDocument();
  });
});
