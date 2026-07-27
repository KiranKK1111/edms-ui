import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, useLocation } from "react-router-dom";
import axios from "axios";

import { AppProviders } from "../../../design-system";
import store from "../../../store";
import RecordFormPage from "../../../components/recordForm/RecordFormPage";

// Mock ONLY the network layer — everything else (redux store, thunks,
// reducers, react-router) stays real, matching this suite's approach.
jest.mock("axios");

// The dataset ReviewSubmit's mount effect re-dispatches its final payload into
// the very slice it selects from. Under act()'s synchronous passive-effect
// flushing (and React 18's wall-clock time slicing) that ping-pong
// intermittently overflows React's nested-update budget and crashes the tree.
// Stub just this leaf: it renders the review heading + the values that
// DatasetDetails wrote into the REAL store, which is what the retention test
// asserts. Everything else in the dataset wizard stays real.
jest.mock("../../../components/datasetForm/ReviewSubmit", () => {
  const mockReact = require("react");
  const { useSelector } = require("react-redux");
  const Stub = () => {
    const data = useSelector(
      (s) => (s.dataset && s.dataset.formData) || {}
    );
    return mockReact.createElement(
      "div",
      { className: "review-submit" },
      mockReact.createElement("h3", null, "Dataset Details"),
      mockReact.createElement("div", null, data.longName || ""),
      mockReact.createElement("div", null, data.shortName || ""),
      mockReact.createElement("div", null, data.description || "")
    );
  };
  return { __esModule: true, default: Stub };
});

jest.setTimeout(60000);

// CRA sets resetMocks: true, so implementations must be (re)installed here.
beforeEach(() => {
  axios.mockResolvedValue({ data: {} });
  axios.get.mockResolvedValue({ data: {} });
  axios.post.mockResolvedValue({ data: {} });
  axios.put.mockResolvedValue({ data: {} });
  axios.delete.mockResolvedValue({ data: {} });

  localStorage.setItem("psid", "PS123");
  localStorage.setItem("entitlementType", "Admin");
  localStorage.setItem("access_token", "fake-value-for-tests");
  localStorage.setItem(
    "agRecord",
    JSON.stringify({
      agreementId: "AG-1",
      agreementExpiryDate: "2030-12-31",
      agreementNoExpiryFlag: "N",
    })
  );
});

// Renders the current pathname so tests can assert navigation performed via
// the REAL history (goBack / editRoute / delegated cancel).
const LocationProbe = () => {
  const location = useLocation();
  return <div data-testid="location-probe">{location.pathname}</div>;
};

const renderRFP = (ui, route = "/record/entity/create") =>
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <AppProviders>
          {ui}
          <LocationProbe />
        </AppProviders>
      </MemoryRouter>
    </Provider>
  );

const probePath = () => screen.getByTestId("location-probe").textContent;

// Open an MUI Select (rendered as a combobox div) and pick an option.
const pickSelectOption = async (comboboxName, optionText) => {
  fireEvent.mouseDown(screen.getByRole("combobox", { name: comboboxName }));
  const listbox = await screen.findByRole("listbox");
  fireEvent.click(within(listbox).getByText(optionText));
};

describe("RecordFormPage (generic controller)", () => {
  it("renders the entity create wizard with chrome + step", () => {
    renderRFP(<RecordFormPage resource="entity" mode="create" />);
    // Title from pageConfig (also appears in the breadcrumb, so allow >1)
    expect(screen.getAllByText("Add Entity").length).toBeGreaterThan(0);
    // Header actions
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
    // Step label from the entity descriptor
    expect(screen.getAllByText("Entity Details").length).toBeGreaterThan(0);
  });

  it("renders read-only View mode header (Edit button, no Submit)", () => {
    renderRFP(
      <RecordFormPage resource="entity" mode="view" id="UNKNOWN" />,
      "/record/entity/view/UNKNOWN"
    );
    expect(screen.getByText("View Entity")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /^submit$/i })
    ).not.toBeInTheDocument();
  });

  it("shows an error for an unknown resource", () => {
    renderRFP(<RecordFormPage resource="nope" mode="create" />);
    expect(screen.getByText(/Unknown record type/i)).toBeInTheDocument();
  });

  // Guards the "Maximum update depth exceeded" regression: the dataset
  // descriptor's selectedSelector must return a STABLE reference so the real
  // react-redux useSelector doesn't re-render infinitely. Rendered against the
  // real store so an unstable selector would throw here.
  it("renders the dataset create wizard against the real store without looping", () => {
    renderRFP(
      <RecordFormPage resource="dataset" mode="create" />,
      "/masterData/DS1/dataset"
    );
    expect(screen.getAllByText("Add Dataset").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  it("renders the datafeed view (custom rich body) against the real store", () => {
    render(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[
            {
              pathname: "/masterData/DS1/viewDatafeed",
              state: { datafeedRecord: {}, dataset: { shortName: "DS1" } },
            },
          ]}
        >
          <AppProviders>
            <RecordFormPage resource="datafeed" mode="view" />
          </AppProviders>
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getAllByText("View Data Feed").length).toBeGreaterThan(0);
    // the descriptor's custom ViewBody (not the generic field list)
    expect(screen.getByText("General Details")).toBeInTheDocument();
    expect(screen.getByText("Data Feed configuration")).toBeInTheDocument();
  });

  // Guards the retention requirement: values typed on step 1, Next to the
  // review step, Previous back — the fields must re-show the typed values
  // (step components remount and rebind from the store).
  it("keeps step values across Next → Previous in the dataset wizard", async () => {
    renderRFP(
      <RecordFormPage resource="dataset" mode="create" />,
      "/masterData/DS1/dataset"
    );
    fireEvent.change(screen.getByPlaceholderText("Long Name"), {
      target: { value: "My long dataset" },
    });
    fireEvent.change(screen.getByPlaceholderText("Short Name"), {
      target: { value: "MyShortDs" },
    });
    fireEvent.change(
      screen.getByPlaceholderText(/A description about the dataset/i),
      { target: { value: "Retention test description" } }
    );
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    // Review step shows the entered values
    expect(await screen.findByText("Dataset Details")).toBeInTheDocument();
    expect(screen.getByText("My long dataset")).toBeInTheDocument();
    // Previous → step 1 rebinds the typed values from the store
    fireEvent.click(screen.getByRole("button", { name: /previous/i }));
    expect(
      await screen.findByDisplayValue("My long dataset")
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("MyShortDs")).toBeInTheDocument();
  });

  it("renders the datafeed-configuration delegated wizard against the real store", () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/masterData/DF1/addConfiguration"]}>
          <AppProviders>
            <RecordFormPage resource="datafeedConfig" />
          </AppProviders>
        </MemoryRouter>
      </Provider>
    );
    // Title + Cancel/Submit chrome come from the delegated view-model
    expect(
      screen.getAllByText(/Data Feed Configuration/i).length
    ).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  // ---------------- Cancel confirm dialog ----------------

  it("Cancel → Stay keeps the user on the form", async () => {
    renderRFP(<RecordFormPage resource="entity" mode="create" />);
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(await screen.findByText("Discard changes?")).toBeInTheDocument();
    expect(
      screen.getByText("Your unsaved changes will be lost.")
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Stay" }));
    await waitFor(() =>
      expect(screen.queryByText("Discard changes?")).not.toBeInTheDocument()
    );
    expect(probePath()).toBe("/record/entity/create");
    expect(screen.getAllByText("Add Entity").length).toBeGreaterThan(0);
  });

  it("Cancel → Discard navigates back to the list screen", async () => {
    renderRFP(<RecordFormPage resource="entity" mode="create" />);
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(await screen.findByText("Discard changes?")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Discard" }));
    await waitFor(() => expect(probePath()).toBe("/masterData"));
  });

  // ---------------- Entity form-driver full flow ----------------

  it("entity wizard: fill → Next → Review → Previous → Next → Submit (failure then success)", async () => {
    renderRFP(<RecordFormPage resource="entity" mode="create" />);

    // Submit is disabled while not on the last step
    expect(screen.getByRole("button", { name: /^submit$/i })).toBeDisabled();

    await pickSelectOption(/entity type/i, "External Vendor");
    fireEvent.change(screen.getByPlaceholderText("Enter long name"), {
      target: { value: "Acme Corporation" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter short name"), {
      target: { value: "Acme" },
    });
    fireEvent.change(
      screen.getByPlaceholderText(/A description about the entity/i),
      { target: { value: "An entity for testing" } }
    );

    // Next → nextForm validates + syncToStore → Review step
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(await screen.findByText("Acme Corporation")).toBeInTheDocument();
    expect(screen.getByText("An entity for testing")).toBeInTheDocument();

    // Previous → the form-driver prev branch re-syncs and shows the form again
    fireEvent.click(screen.getByRole("button", { name: /previous/i }));
    expect(
      await screen.findByDisplayValue("Acme Corporation")
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("Acme")).toBeInTheDocument();

    // Back to Review
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(await screen.findByText("Acme Corporation")).toBeInTheDocument();

    const submitBtn = screen.getByRole("button", { name: /^submit$/i });
    await waitFor(() => expect(submitBtn).not.toBeDisabled());

    // 1) Backend rejects → interpret returns { ok: false, message } → warning
    //    snackbar, user stays on the wizard.
    axios.mockResolvedValueOnce({ message: "Entity exists already" });
    fireEvent.click(submitBtn);
    expect(
      await screen.findByText("Entity exists already")
    ).toBeInTheDocument();
    expect(probePath()).toBe("/record/entity/create");
    // dismiss the warning snackbar so the success one can show
    fireEvent.click(screen.getByRole("button", { name: /close/i }));

    // 2) Backend accepts → success snackbar + navigation back to the list.
    axios.mockResolvedValueOnce({
      data: { entityManagement: { entityId: "EN123" } },
    });
    fireEvent.click(screen.getByRole("button", { name: /^submit$/i }));
    expect(
      await screen.findByText(/Form entity Id EN123 submitted successfully!/)
    ).toBeInTheDocument();
    await waitFor(() => expect(probePath()).toBe("/masterData"));
  });

  it("entity edit: loads the record, binds the form and shows/closes the pending alert", async () => {
    axios.get.mockResolvedValue({
      data: {
        entityManagementList: [
          {
            entityId: "E-PEND",
            entityType: "External Vendor",
            longName: "Pending Long Name",
            shortName: "PendingShort",
            entityStatus: "Pending",
            website: "www.pending.com",
            entityDescription: "pending description",
          },
        ],
      },
    });
    renderRFP(
      <RecordFormPage resource="entity" mode="edit" id="E-PEND" />,
      "/record/entity/edit/E-PEND"
    );
    expect(screen.getAllByText("Edit Entity").length).toBeGreaterThan(0);

    // The record is fetched (real thunk + mocked axios), bound into the form…
    expect(
      await screen.findByDisplayValue("Pending Long Name")
    ).toBeInTheDocument();
    // …and its Pending status raises the warning alert and disables Submit.
    expect(
      await screen.findByText(/submitted for approval/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^submit$/i })).toBeDisabled();

    // Alert is dismissible
    const alert = screen.getByRole("alert");
    fireEvent.click(within(alert).getByRole("button", { name: /close/i }));
    await waitFor(() =>
      expect(
        screen.queryByText(/submitted for approval/i)
      ).not.toBeInTheDocument()
    );
  });

  it("entity view: Edit header action navigates to the edit route", async () => {
    axios.get.mockResolvedValue({
      data: {
        entityManagementList: [
          {
            entityId: "E9",
            entityType: "External Partner",
            longName: "Viewable Entity",
            shortName: "ViewMe",
            entityStatus: "Active",
            website: "www.viewme.com",
            entityDescription: "view description",
          },
        ],
      },
    });
    renderRFP(
      <RecordFormPage resource="entity" mode="view" id="E9" />,
      "/record/entity/view/E9"
    );
    // generic DetailView renders the descriptor's viewFields
    expect(await screen.findByText("Viewable Entity")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    await waitFor(() => expect(probePath()).toBe("/record/entity/edit/E9"));
  });

  // ---------------- Licence component-driver chrome ----------------

  it("licence create: renders the component-driver chrome with reported steps and gated Submit", async () => {
    // NB: the route must contain "addLicense" (like the real app route) so
    // LicenseDetails skips its licence-count lookup for existing records.
    renderRFP(
      <RecordFormPage resource="licence" mode="create" />,
      "/masterData/AG1/addLicense"
    );
    expect(screen.getAllByText("Add Licence").length).toBeGreaterThan(0);

    // OrderSteps reports its step list → the generic chrome renders the stepper
    expect(await screen.findByText("Licence Details")).toBeInTheDocument();
    expect(screen.getByText("Licence Limitations")).toBeInTheDocument();
    expect(screen.getByText("Review & Submit")).toBeInTheDocument();

    // bodyValid is false before the Review step → Submit disabled
    expect(screen.getByRole("button", { name: /^submit$/i })).toBeDisabled();
    // step 0 → no Previous, Next present
    expect(
      screen.queryByRole("button", { name: /previous/i })
    ).not.toBeInTheDocument();

    // Next fires the formData trigger; the empty step fails validation and
    // resets the trigger (stepNext(false) branch) — we stay on step 0.
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument()
    );
    expect(screen.getByRole("button", { name: /^submit$/i })).toBeDisabled();
  });

  it("licence edit of a pending record: shows the pending alert and keeps Submit disabled", async () => {
    render(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[
            {
              pathname: "/masterData/AG1/addLicense",
              state: {
                record: {
                  licenseStatus: "Pending",
                  licenseUpdateFlag: "N",
                },
              },
            },
          ]}
        >
          <AppProviders>
            <RecordFormPage resource="licence" mode="create" />
            <LocationProbe />
          </AppProviders>
        </MemoryRouter>
      </Provider>
    );
    expect(
      await screen.findByText(/This Licence is currently under review/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^submit$/i })).toBeDisabled();

    // The alert can be dismissed
    const alert = screen.getByRole("alert");
    fireEvent.click(within(alert).getByRole("button", { name: /close/i }));
    await waitFor(() =>
      expect(
        screen.queryByText(/This Licence is currently under review/i)
      ).not.toBeInTheDocument()
    );
  });

  // ---------------- Delegated driver actions ----------------

  it("delegated wizard: Cancel → Stay leaves the wizard mounted", async () => {
    renderRFP(
      <RecordFormPage resource="datafeedConfig" />,
      "/masterData/DF1/addConfiguration"
    );
    // Submit is gated by the body's reported canSubmit (false on step 0)
    expect(screen.getByRole("button", { name: /^submit$/i })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(await screen.findByText("Discard changes?")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Stay" }));
    await waitFor(() =>
      expect(screen.queryByText("Discard changes?")).not.toBeInTheDocument()
    );
    expect(probePath()).toBe("/masterData/DF1/addConfiguration");
    expect(
      screen.getAllByText(/Data Feed Configuration/i).length
    ).toBeGreaterThan(0);
  });

  it("delegated wizard: Next delegates to the body and Cancel → Discard runs the body's cleanup+navigate", async () => {
    renderRFP(
      <RecordFormPage resource="datafeedConfig" />,
      "/masterData/DF1/addConfiguration"
    );
    // The body reports showNext for step 0; clicking delegates act("next")
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(
      screen.getAllByText(/Data Feed Configuration/i).length
    ).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(await screen.findByText("Discard changes?")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Discard" }));
    // ConfigurationSteps' registered cancel action clears the slice and
    // navigates back to Master Data.
    await waitFor(() => expect(probePath()).toBe("/masterData"));
  });
});
