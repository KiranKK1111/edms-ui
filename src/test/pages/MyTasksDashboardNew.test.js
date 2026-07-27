import React from "react";
import * as redux from "react-redux";
import { render, screen, fireEvent, within, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import MyTasksDashboardNew from "../../pages/myTasks/MyTasksDashboardNew";

jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});

// DataTable wraps its real implementation in React.lazy + Suspense, which
// makes every table assertion race an async chunk resolution. Swap in the
// implementation directly so the table renders synchronously: the tests then
// wait on actual conditions rather than on elapsed time.
jest.mock("../../design-system/DataTable", () => ({
  __esModule: true,
  default: require("../../design-system/DataTableInner").default,
}));

const mockDispatch = jest.fn();
const mockPush = jest.fn();

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useHistory: () => ({ push: mockPush }),
}));

jest.mock("../../components/Modals/ApproveRejectModal", () => (props) => (
  <div
    data-testid="mock-approve-reject-modal"
    data-approve={String(props.approveModal)}
    data-reject={String(props.rejectModal)}
    data-status={
      (props.currentActionData && props.currentActionData.taskListTaskStatus) ||
      ""
    }
    data-approver={
      (props.currentActionData && props.currentActionData.taskListApproveBy) ||
      ""
    }
  >
    <button type="button" onClick={props.refreshPage}>
      mock-refresh
    </button>
  </div>
));

jest.mock("../../store/actions/MyTasksActions.js", () => ({
  getAllTasks: jest.fn(() => ({ type: "GET_ALL_TASKS" })),
  updateTaskAction: jest.fn(),
}));
jest.mock("../../store/actions/datafeedAction", () => ({
  startGetDatafeeds: jest.fn(() => ({ type: "GET_DATAFEEDS" })),
}));

const { getAllTasks } = require("../../store/actions/MyTasksActions.js");
const { startGetDatafeeds } = require("../../store/actions/datafeedAction");

const state = {
  myTasks: { list: [], data: {}, pendingList: [], completedList: [] },
};

const taskRows = [
  {
    taskListId: "t1",
    taskListDescription: "Entity row",
    taskListObject: "Entity",
    taskListObjectAction: "Create",
    taskListPkey: "PK1",
    crId: "CR1",
    taskListCreatedBy: "user1",
    taskListCreatedOn: "2026-01-10",
    taskListTaskStatus: "Pending",
  },
  {
    taskListId: "t2",
    taskListDescription: "Licence row",
    taskListObject: "Licence",
    taskListObjectAction: "Update",
    taskListPkey: "PK2",
    crId: "CR2",
    taskListCreatedBy: "user2",
    taskListCreatedOn: "2026-01-09",
    taskListApproveBy: "boss",
    taskListApproveOn: "2026-01-11",
    taskListTaskStatus: "Approved",
  },
  {
    taskListId: "t3",
    taskListDescription: "Agreement row",
    taskListObject: "Agreement",
    taskListObjectAction: "Deactivate",
    taskListPkey: "PK3",
    crId: "CR3",
    taskListCreatedBy: "user3",
    taskListCreatedOn: "2026-01-08",
    taskListTaskStatus: "Rejected",
    taskListRejectionReason: "Not valid",
  },
  {
    taskListId: "t4",
    taskListDescription: "Datafeed row",
    taskListObject: "Datafeed",
    taskListObjectAction: "Create",
    taskListPkey: "PK4",
    crId: "CR4",
    taskListCreatedOn: "2026-01-07",
    taskListTaskStatus: "Pending",
  },
  {
    taskListId: "t5",
    taskListDescription: "Dataset row",
    taskListObject: "Dataset",
    taskListObjectAction: "Update",
    taskListPkey: "PK5",
    crId: "CR5",
    taskListCreatedOn: "2026-01-06",
    taskListTaskStatus: "Pending",
  },
  {
    taskListId: "t6",
    taskListDescription: "Subscription row",
    taskListObject: "Subscription",
    taskListObjectAction: "Create",
    taskListPkey: "PK6",
    crId: "CR6",
    taskListCreatedOn: "2026-01-05",
    taskListTaskStatus: "Pending",
  },
  {
    taskListId: "t7",
    taskListDescription: "Scheduler row",
    taskListObject: "RecurrenceScheduler",
    taskListObjectAction: "Create",
    key: "RS1",
    taskId: "TID7",
    taskListCreatedOn: "2026-01-04",
    taskListTaskStatus: "Approved",
  },
  {
    taskListId: "t8",
    taskListDescription: "SourceConfig row",
    taskListObject: "SourceConfiguration",
    taskListObjectAction: "Update",
    key: "SC1",
    taskId: "TID8",
    taskListCreatedOn: "2026-01-03",
    taskListTaskStatus: "Approved",
  },
  {
    taskListId: "t9",
    taskListDescription: "Data feed lower row",
    taskListObject: "Data Feed",
    taskListObjectAction: "Update",
    taskListPkey: "PK9",
    crId: "CR9",
    taskListCreatedOn: "2026-01-02",
    taskListTaskStatus: "Approved",
  },
  {
    taskListId: "t10",
    taskListDescription: "Unknown row",
    taskListObject: "Unknown",
    taskListObjectAction: "Create",
    taskListPkey: "PK10",
    crId: "CR10",
    taskListCreatedOn: "2026-01-01",
    taskListTaskStatus: "",
  },
];

const viewOnlyRow = {
  taskListId: "t11",
  taskListDescription: "View only row",
  taskListObject: "Entity",
  taskListObjectAction: "View",
  taskListPkey: "PK11",
  crId: "CR11",
  taskListTaskStatus: "Approved",
};

const buildTasks = (overrides = {}) => ({
  list: taskRows,
  data: { pending: 4, completed: 6 },
  pendingList: [taskRows[0]],
  completedList: [taskRows[1], viewOnlyRow],
  ...overrides,
});

// The dashboard's data effect only re-runs when the selected myTasks slice
// changes identity: first render must dispatch (isPageLoaded=false), the
// second render must see a NEW reference so the effect runs the "bind data"
// branch, and every later render must see a STABLE reference so the effect
// settles instead of looping.
const mockLoadedTasks = (tasks) => {
  const first = { ...tasks };
  const stable = { ...tasks };
  let used = false;
  redux.useSelector.mockImplementation((selector) => {
    const current = used ? stable : first;
    used = true;
    return selector({ myTasks: current });
  });
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <MyTasksDashboardNew />
    </MemoryRouter>
  );

const renderLoaded = async (tasks = buildTasks()) => {
  mockLoadedTasks(tasks);
  const utils = renderPage();
  await screen.findByText("My Tasks (10)");
  // Wait for real rows to replace the lazy DataTable's skeleton fallback
  // before letting tests query the table (the module itself is preloaded in
  // beforeAll, so this settles on the next tick).
  await screen.findByText("Unknown row");
  return utils;
};

const rowFor = async (description) => {
  const cellButton = await screen.findByText(description);
  return cellButton.closest("tr");
};

describe("MyTasksDashboardNew", () => {
  beforeEach(() => {
    jest
      .spyOn(redux, "useSelector")
      .mockImplementation((selector) => selector(state));
    mockDispatch.mockClear();
    mockPush.mockClear();
    localStorage.clear();
    localStorage.setItem("psid", "P123");
    localStorage.setItem("entitlementType", "Dataset Owner");
    localStorage.setItem("currentUserRole", "Dataset Owner");
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should render the loading spinner initially", () => {
    const { container } = renderPage();
    expect(container.querySelector("#spinner")).toBeInTheDocument();
  });

  it("should render the ApproveRejectModal", () => {
    const { getByTestId } = renderPage();
    expect(getByTestId("mock-approve-reject-modal")).toBeInTheDocument();
  });

  it("should dispatch getAllTasks and startGetDatafeeds while loading", () => {
    renderPage();
    expect(getAllTasks).toHaveBeenCalled();
    expect(startGetDatafeeds).toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledTimes(2);
  });

  it("should render the task rows once the list loads", async () => {
    await renderLoaded();
    expect(screen.getByText("Entity row")).toBeInTheDocument();
    expect(screen.getByText("Licence row")).toBeInTheDocument();
    expect(screen.getByText("Agreement row")).toBeInTheDocument();
    // formatted submitted-on date
    expect(screen.getByText("10 Jan 2026")).toBeInTheDocument();
    // formatted action-on date for the approved row
    expect(screen.getByText("11 Jan 2026")).toBeInTheDocument();
  });

  it("should render status chips for approved and rejected tasks", async () => {
    await renderLoaded();
    expect(screen.getAllByText("Approved").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Rejected").length).toBeGreaterThanOrEqual(1);
  });

  it("should navigate to the right detail page for each object type", async () => {
    await renderLoaded();

    fireEvent.click(screen.getByText("Entity row"));
    expect(mockPush).toHaveBeenLastCalledWith(
      expect.objectContaining({ pathname: "vendorDetails/PK1/t1" })
    );

    fireEvent.click(screen.getByText("Licence row"));
    expect(mockPush).toHaveBeenLastCalledWith(
      expect.objectContaining({ pathname: "licenseDetails/CR2/t2" })
    );

    fireEvent.click(screen.getByText("Agreement row"));
    expect(mockPush).toHaveBeenLastCalledWith(
      expect.objectContaining({ pathname: "AgreementDetails/CR3/t3" })
    );

    fireEvent.click(screen.getByText("Datafeed row"));
    expect(mockPush).toHaveBeenLastCalledWith(
      expect.objectContaining({ pathname: "DatafeedDetails/PK4/t4" })
    );

    fireEvent.click(screen.getByText("Dataset row"));
    expect(mockPush).toHaveBeenLastCalledWith(
      expect.objectContaining({ pathname: "DatasetDetails/CR5/t5" })
    );

    fireEvent.click(screen.getByText("Subscription row"));
    expect(mockPush).toHaveBeenLastCalledWith(
      expect.objectContaining({ pathname: "requestDetails/PK6/t6" })
    );

    fireEvent.click(screen.getByText("Data feed lower row"));
    expect(mockPush).toHaveBeenLastCalledWith(
      expect.objectContaining({ pathname: "DatafeedDetails/CR9/t9" })
    );

    fireEvent.click(screen.getByText("Scheduler row"));
    expect(mockPush).toHaveBeenLastCalledWith("schedulerDetails/RS1/TID7");

    fireEvent.click(screen.getByText("SourceConfig row"));
    expect(mockPush).toHaveBeenLastCalledWith("sourceConfigDetails/SC1/TID8");
  });

  it("should not navigate for unknown objects or non-CRUD actions", async () => {
    await renderLoaded();

    fireEvent.click(screen.getByText("Unknown row"));
    expect(mockPush).not.toHaveBeenCalled();

    // completed tab contains a row whose action is "View"
    fireEvent.click(screen.getByRole("button", { name: "Completed" }));
    fireEvent.click(await screen.findByText("View only row"));
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("should switch between pending, completed and all views", async () => {
    await renderLoaded();

    fireEvent.click(screen.getByRole("button", { name: "Pending" }));
    expect(await screen.findByText("Entity row")).toBeInTheDocument();
    expect(screen.queryByText("Licence row")).not.toBeInTheDocument();

    // clicking the already-active toggle keeps the current filter
    fireEvent.click(screen.getByRole("button", { name: "Pending" }));
    expect(screen.getByText("Entity row")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Completed" }));
    expect(await screen.findByText("Licence row")).toBeInTheDocument();
    expect(screen.queryByText("Entity row")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "All" }));
    expect(await screen.findByText("Entity row")).toBeInTheDocument();
    expect(screen.getByText("Licence row")).toBeInTheDocument();
  });

  it("should show the empty state when the filtered list has no rows", async () => {
    await renderLoaded(buildTasks({ pendingList: [] }));
    fireEvent.click(screen.getByRole("button", { name: "Pending" }));
    expect(await screen.findByText("No tasks to show")).toBeInTheDocument();
  });

  it("should disable approve/reject when the user has no permission", async () => {
    // no objectMatrix in localStorage -> no RW permission anywhere
    await renderLoaded();
    const entityRow = await rowFor("Entity row");
    expect(within(entityRow).getByRole("button", { name: "Approve" })).toBeDisabled();
    expect(within(entityRow).getByRole("button", { name: "Reject" })).toBeDisabled();
  });

  it("should open the approve modal with an APPROVED payload", async () => {
    localStorage.setItem(
      "objectMatrix",
      JSON.stringify([
        {
          category: "My Tasks",
          objectName: "Approve / Reject Button",
          permission: "RW",
        },
      ])
    );
    await renderLoaded();
    const entityRow = await rowFor("Entity row");
    const approveBtn = within(entityRow).getByRole("button", { name: "Approve" });
    expect(approveBtn).toBeEnabled();
    fireEvent.click(approveBtn);

    const modal = screen.getByTestId("mock-approve-reject-modal");
    await waitFor(() => expect(modal).toHaveAttribute("data-approve", "true"));
    expect(modal).toHaveAttribute("data-reject", "false");
    expect(modal).toHaveAttribute("data-status", "APPROVED");
    expect(modal).toHaveAttribute("data-approver", "P123");

    // after starting an approval, remaining action buttons become disabled
    const datafeedRow = await rowFor("Datafeed row");
    expect(
      within(datafeedRow).getByRole("button", { name: "Approve" })
    ).toBeDisabled();
  });

  it("should open the reject modal with a REJECTED payload", async () => {
    localStorage.setItem(
      "objectMatrix",
      JSON.stringify([
        {
          category: "My Tasks",
          objectName: "Approve / Reject Button",
          permission: "RW",
        },
      ])
    );
    await renderLoaded();
    const datasetRow = await rowFor("Dataset row");
    fireEvent.click(within(datasetRow).getByRole("button", { name: "Reject" }));

    const modal = screen.getByTestId("mock-approve-reject-modal");
    await waitFor(() => expect(modal).toHaveAttribute("data-reject", "true"));
    expect(modal).toHaveAttribute("data-approve", "false");
    expect(modal).toHaveAttribute("data-status", "REJECTED");
  });

  it("should only enable subscription rows for subscription-scoped permission", async () => {
    localStorage.setItem(
      "objectMatrix",
      JSON.stringify([
        {
          category: "My Tasks",
          objectName: "Approve / Reject Button for object Subscription",
          permission: "RW",
        },
        {
          category: "My Tasks",
          objectName: "Approve / Reject Button for remaining objects",
          permission: "R",
        },
      ])
    );
    await renderLoaded();
    const subsRow = await rowFor("Subscription row");
    expect(within(subsRow).getByRole("button", { name: "Approve" })).toBeEnabled();
    const entityRow = await rowFor("Entity row");
    expect(
      within(entityRow).getByRole("button", { name: "Approve" })
    ).toBeDisabled();
  });

  it("should show the spinner again when the modal triggers a refresh", async () => {
    const { container } = await renderLoaded();
    expect(container.querySelector("#spinner")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "mock-refresh" }));
    await waitFor(() =>
      expect(container.querySelector("#spinner")).toBeInTheDocument()
    );
  });
});
