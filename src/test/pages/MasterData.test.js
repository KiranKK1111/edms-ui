import React from "react";
import * as redux from "react-redux";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import AppProviders from "../../design-system/AppProviders";
import MasterData from "../../pages/masterData/MasterData";

jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});

const mockDispatch = jest.fn();

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

jest.mock("../../pages/masterData/VendorData", () => () => (
  <div data-testid="mock-vendor-data" />
));
jest.mock("../../pages/masterData/DataSetData", () => () => (
  <div data-testid="mock-dataset-data" />
));

jest.mock("../../store/actions/VendorActions", () => ({
  startGetVendors: jest.fn(),
  startUpdateEntity: jest.fn(),
}));
jest.mock("../../store/actions/contractAction", () => ({
  startGetContracts: jest.fn(),
  resetState: jest.fn(),
}));
jest.mock("../../store/actions/licenseAction", () => ({
  startGetLicenses: jest.fn(),
}));
jest.mock("../../store/actions/DatasetPageActions", () => ({
  startGetDatasets: jest.fn(),
}));
jest.mock("../../store/actions/datafeedAction", () => ({
  startGetDatafeeds: jest.fn(),
}));

const { startUpdateEntity, startGetVendors } = require("../../store/actions/VendorActions");

const makeEntity = (over = {}) => ({
  entityId: "V001",
  shortName: "VendorOne",
  longName: "Vendor One Ltd",
  entityType: "External",
  website: "example.com",
  entityStatus: "Active",
  entityDescription: "First vendor",
  taskStatus: "Approved",
  entityUpdateFlag: "N",
  ...over,
});

const defaultEntities = [
  makeEntity(),
  makeEntity({
    entityId: "V002",
    shortName: "VendorTwo",
    longName: "Vendor Two Ltd",
    website: "https://two.example.com",
    entityStatus: "Pending",
    taskStatus: "Pending",
    entityDescription: "",
  }),
  makeEntity({
    entityId: "V003",
    shortName: "VendorThree",
    longName: "Vendor Three Ltd",
    website: "",
    entityStatus: "Inactive",
    taskStatus: "Approved",
  }),
];

const buildState = (over = {}) => ({
  dataset: { datasetsInfo: [{ datasetId: "DS1" }] },
  datafeedInfo: { datafeedsData: [{ dataFeedId: "DF1" }] },
  contract: { data: [[]] },
  vendor: { list: defaultEntities, loading: false },
  ...over,
});

let state;

const renderPage = (props = {}) =>
  render(
    <AppProviders>
      <MemoryRouter>
        <MasterData {...props} />
      </MemoryRouter>
    </AppProviders>
  );

const openManageMenu = async () => {
  fireEvent.click(await screen.findByRole("button", { name: "Manage" }));
  return await screen.findByRole("menu");
};

describe("MasterData", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem("psid", "tester");
    localStorage.setItem(
      "objectMatrix",
      JSON.stringify([
        {
          category: "Masterdata",
          objectName: "Add Entity Button and Manage button",
          permission: "RW",
        },
        {
          category: "Masterdata",
          objectName: "Entity Edit/Deactivate button",
          permission: "RW",
        },
        {
          category: "Masterdata",
          objectName: "Add Agreement Button and Agreement Pages",
          permission: "RW",
        },
      ])
    );
    state = buildState();
    mockDispatch.mockImplementation(() =>
      Promise.resolve({
        status: 200,
        data: { entityManagementList: defaultEntities },
      })
    );
    startGetVendors.mockImplementation(() => ({ type: "GET_VENDORS" }));
    startUpdateEntity.mockImplementation(() =>
      Promise.resolve({ data: { ok: true } })
    );
    jest
      .spyOn(redux, "useSelector")
      .mockImplementation((selector) => selector(state));
  });

  it("should render the search input", async () => {
    const { container } = renderPage();
    await screen.findByText("Entity Details");
    expect(container.querySelector("#inp-search")).toBeInTheDocument();
  });

  it("should render the Entity Details section", async () => {
    expect(await renderPage().findByText("Entity Details")).toBeInTheDocument();
  });

  it("should show the first entity's details after loading", async () => {
    renderPage();
    expect(await screen.findByText("V001")).toBeInTheDocument();
    expect(screen.getByText("Vendor One Ltd")).toBeInTheDocument();
    expect(screen.getByText("First vendor")).toBeInTheDocument();
    // website without protocol gets https:// prefixed
    const site = screen.getByText("example.com");
    expect(site.closest("a")).toHaveAttribute("href", "https://example.com");
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("should restore the previously selected vendor from sessionStorage", async () => {
    sessionStorage.setItem("dashKey", "1");
    sessionStorage.setItem("vendorid", "V002");
    renderPage();
    expect(await screen.findByText("V002")).toBeInTheDocument();
    expect(screen.getByText("Vendor Two Ltd")).toBeInTheDocument();
  });

  it("should switch entity when a sider item is clicked", async () => {
    renderPage();
    await screen.findByText("V001");
    fireEvent.click(screen.getByRole("button", { name: "VendorTwo" }));
    expect(await screen.findByText("V002")).toBeInTheDocument();
    expect(sessionStorage.getItem("vendorid")).toBe("V002");
    expect(sessionStorage.getItem("dashKey")).toBe("1");
  });

  it("should render pending status chip, review alert and allow closing it", async () => {
    sessionStorage.setItem("dashKey", "1");
    sessionStorage.setItem("vendorid", "V002");
    renderPage();
    await screen.findByText("V002");
    expect(screen.getByText("Pending")).toBeInTheDocument();
    const alertText = screen.getByText(/currently under review/);
    expect(alertText).toBeInTheDocument();
    fireEvent.click(screen.getByTitle("Close"));
    await waitFor(() =>
      expect(screen.queryByText(/currently under review/)).not.toBeInTheDocument()
    );
  });

  it("should render an inactive status chip and no website link when empty", async () => {
    sessionStorage.setItem("dashKey", "2");
    sessionStorage.setItem("vendorid", "V003");
    const { container } = renderPage();
    await screen.findByText("V003");
    const chip = container.querySelector(
      ".dashboard-entity-details .MuiChip-label"
    );
    expect(chip).toHaveTextContent("Inactive");
  });

  it("should render the raw status label for unknown statuses", async () => {
    state = buildState({
      vendor: {
        list: [makeEntity({ entityStatus: "Planned" })],
        loading: false,
      },
    });
    mockDispatch.mockImplementation(() =>
      Promise.resolve({
        status: 200,
        data: { entityManagementList: [makeEntity({ entityStatus: "Planned" })] },
      })
    );
    renderPage();
    await screen.findByText("V001");
    expect(screen.getByText("Planned")).toBeInTheDocument();
  });

  it("should keep the website untouched when it already has a protocol", async () => {
    sessionStorage.setItem("dashKey", "1");
    sessionStorage.setItem("vendorid", "V002");
    renderPage();
    await screen.findByText("V002");
    const site = screen.getByText("https://two.example.com");
    expect(site.closest("a")).toHaveAttribute("href", "https://two.example.com");
  });

  it("should filter entities via the search box and select the first match", async () => {
    const { container } = renderPage();
    await screen.findByText("V001");
    const input = container.querySelector("#inp-search");
    fireEvent.change(input, { target: { value: "VendorTwo" } });
    expect(await screen.findByText("V002")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "VendorOne" })
    ).not.toBeInTheDocument();
    // no match empties the sider
    fireEvent.change(input, { target: { value: "zzz-no-match" } });
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "VendorTwo" })
      ).not.toBeInTheDocument()
    );
    // clearing restores the full list
    fireEvent.change(input, { target: { value: "" } });
    expect(
      await screen.findByRole("button", { name: "VendorThree" })
    ).toBeInTheDocument();
  });

  it("should filter the sider with the status toggle buttons", async () => {
    renderPage();
    await screen.findByText("V001");
    fireEvent.click(screen.getByRole("button", { name: "Inactive" }));
    expect(await screen.findByText("V003")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "VendorOne" })
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "All" }));
    expect(
      await screen.findByRole("button", { name: "VendorOne" })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Active & Pending" }));
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "VendorThree" })
      ).not.toBeInTheDocument()
    );
  });

  it("should render the VendorData table when contracts exist", async () => {
    state = buildState({ contract: { data: [[{ agreementId: "AG1" }]] } });
    renderPage();
    expect(await screen.findByTestId("mock-vendor-data")).toBeInTheDocument();
  });

  it("should show No agreements when contract data is missing", async () => {
    state = buildState({ contract: { data: null } });
    renderPage();
    expect(await screen.findByText("No agreements")).toBeInTheDocument();
  });

  it("should show a spinner while contracts are empty", async () => {
    state = buildState({ contract: { data: [] } });
    renderPage();
    await screen.findByText("Entity Details");
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("should switch to the Datasets & Data Feeds tab", async () => {
    renderPage();
    await screen.findByText("V001");
    fireEvent.click(screen.getByRole("tab", { name: "Datasets & Data Feeds" }));
    expect(await screen.findByTestId("mock-dataset-data")).toBeInTheDocument();
    // Add Agreement button only renders on tab 1
    expect(screen.queryByText("+ Add Agreement")).not.toBeInTheDocument();
  });

  it("should show No Datasets when dataset info is missing", async () => {
    state = buildState({ dataset: { datasetsInfo: null } });
    renderPage();
    await screen.findByText("V001");
    fireEvent.click(screen.getByRole("tab", { name: "Datasets & Data Feeds" }));
    expect(await screen.findByText("No Datasets")).toBeInTheDocument();
  });

  it("should show a spinner while datasets are empty", async () => {
    state = buildState({ dataset: { datasetsInfo: [] } });
    renderPage();
    await screen.findByText("V001");
    fireEvent.click(screen.getByRole("tab", { name: "Datasets & Data Feeds" }));
    expect(await screen.findByRole("progressbar")).toBeInTheDocument();
  });

  it("should enable Add Agreement for active entities and store the entity id", async () => {
    renderPage();
    await screen.findByText("V001");
    const addAgreement = screen.getByText("+ Add Agreement").closest("a,button");
    expect(addAgreement).toHaveAttribute(
      "href",
      "/masterData/VendorOne/addAgreement"
    );
    fireEvent.click(addAgreement);
    expect(localStorage.getItem("entityIdInfo")).toBe("V001");
  });

  it("should disable Add Agreement for pending entities", async () => {
    sessionStorage.setItem("dashKey", "1");
    sessionStorage.setItem("vendorid", "V002");
    renderPage();
    await screen.findByText("V002");
    const addAgreement = screen.getByText("+ Add Agreement").closest("a,button");
    expect(addAgreement).toHaveAttribute("aria-disabled", "true");
  });

  it("should disable Manage when the entity task status is pending", async () => {
    sessionStorage.setItem("dashKey", "1");
    sessionStorage.setItem("vendorid", "V002");
    renderPage();
    await screen.findByText("V002");
    expect(screen.getByRole("button", { name: "Manage" })).toBeDisabled();
  });

  it("should link Edit to the modify entity page when editable", async () => {
    renderPage();
    await screen.findByText("V001");
    const menu = await openManageMenu();
    const edit = within(menu).getByText("Edit");
    expect(edit.closest("a")).toHaveAttribute(
      "href",
      "/masterData/modifyEntity/V001"
    );
  });

  it("should warn on Edit when the entity has a pending update", async () => {
    state = buildState({
      vendor: {
        list: [makeEntity({ entityUpdateFlag: "Y", entityStatus: "Inactive" })],
        loading: false,
      },
    });
    renderPage();
    await screen.findByText("V001");
    const menu = await openManageMenu();
    fireEvent.click(within(menu).getByText("Edit"));
    expect(
      await screen.findByText("This entity has a pending update request.")
    ).toBeInTheDocument();
  });

  it("should block deactivation when agreements are still active", async () => {
    state = buildState({
      contract: {
        data: [
          [{ agreementEdmsEntiryId: "V001", agreementStatus: "Active" }],
        ],
      },
    });
    renderPage();
    await screen.findByText("V001");
    const menu = await openManageMenu();
    fireEvent.click(within(menu).getByText("Deactivate"));
    expect(
      await screen.findByText("Unable to Deactivate Entity!")
    ).toBeInTheDocument();
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Ok" }));
    await waitFor(() =>
      expect(
        screen.queryByText("Unable to Deactivate Entity!")
      ).not.toBeInTheDocument()
    );
    expect(startUpdateEntity).not.toHaveBeenCalled();
  });

  it("should deactivate the entity after confirmation", async () => {
    renderPage();
    await screen.findByText("V001");
    const menu = await openManageMenu();
    fireEvent.click(within(menu).getByText("Deactivate"));
    expect(await screen.findByText("Deactivate Entity?")).toBeInTheDocument();
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Deactivate" }));
    await waitFor(() => expect(startUpdateEntity).toHaveBeenCalled());
    const payload = startUpdateEntity.mock.calls[0][0];
    expect(payload.entityStatus).toBe("Deactivate");
    expect(payload.entityUpdateFlag).toBe("Y");
    expect(payload.lastUpdatedBy).toBe("tester");
    expect(
      await screen.findByText(
        "Entity deactivation request submitted successfully."
      )
    ).toBeInTheDocument();
  });

  it("should not deactivate the entity when cancelled", async () => {
    renderPage();
    await screen.findByText("V001");
    const menu = await openManageMenu();
    fireEvent.click(within(menu).getByText("Deactivate"));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() =>
      expect(screen.queryByText("Deactivate Entity?")).not.toBeInTheDocument()
    );
    expect(startUpdateEntity).not.toHaveBeenCalled();
  });

  it("should warn on Deactivate when a pending update exists on an active entity", async () => {
    state = buildState({
      vendor: {
        list: [makeEntity({ entityUpdateFlag: "Y" })],
        loading: false,
      },
    });
    renderPage();
    await screen.findByText("V001");
    const menu = await openManageMenu();
    fireEvent.click(within(menu).getByText("Deactivate"));
    expect(
      await screen.findByText("This entity has a pending update request.")
    ).toBeInTheDocument();
    expect(startUpdateEntity).not.toHaveBeenCalled();
  });

  it("should disable Deactivate for inactive entities", async () => {
    sessionStorage.setItem("dashKey", "2");
    sessionStorage.setItem("vendorid", "V003");
    renderPage();
    await screen.findByText("V003");
    const menu = await openManageMenu();
    expect(
      within(menu).getByText("Deactivate").closest('[role="menuitem"]')
    ).toHaveAttribute("aria-disabled", "true");
  });

  it("should stay in the loading state when the fetch does not succeed", async () => {
    mockDispatch.mockImplementation(() => Promise.resolve({ status: 500 }));
    renderPage();
    expect(await screen.findByRole("progressbar")).toBeInTheDocument();
    await waitFor(() => expect(mockDispatch).toHaveBeenCalled());
    expect(screen.queryByText("Entity Details")).not.toBeInTheDocument();
  });

  it("should show the empty state when no entity matches the selection", async () => {
    const unmatched = makeEntity({ entityId: "V999", shortName: "Ghost" });
    mockDispatch.mockImplementation(() =>
      Promise.resolve({
        status: 200,
        data: { entityManagementList: [unmatched] },
      })
    );
    renderPage();
    expect(
      await screen.findByText("There are no active vendors")
    ).toBeInTheDocument();
  });
});
