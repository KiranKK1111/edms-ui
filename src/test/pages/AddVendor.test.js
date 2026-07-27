import React from "react";
import * as redux from "react-redux";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";

import AppProviders from "../../design-system/AppProviders";
import AddVendor from "../../pages/addVendor/AddVendor";
import {
  startAddVendor,
  startGetVendors,
  saveLocalData,
} from "../../store/actions/VendorActions";

jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});

const mockDispatch = jest.fn().mockReturnValue(Promise.resolve({}));

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

let mockParams = {};
const mockHistoryPush = jest.fn();
jest.mock("react-router-dom", () => ({
  __esModule: true,
  useParams: () => mockParams,
  useHistory: () => ({ push: mockHistoryPush, replace: jest.fn() }),
  Link: ({ children }) => <a>{children}</a>,
}));

jest.mock("../../store/actions/VendorActions", () => ({
  startAddVendor: jest.fn().mockReturnValue(Promise.resolve({})),
  startGetVendors: jest.fn().mockReturnValue(Promise.resolve({})),
  saveLocalData: jest.fn(),
}));

jest.mock("../../components/vendors/AddVendor/NewVendorForm", () => () => (
  <div data-testid="mock-new-vendor-form" />
));
jest.mock("../../components/vendors/AddVendor/ReviewSubmit", () => () => (
  <div data-testid="mock-review-submit" />
));

const defaultState = { vendor: { list: [] } };

// Mutable per-test redux state — reset to `defaultState` in beforeEach.
let mockState = defaultState;

const pendingVendor = {
  entityId: "V1",
  entityType: "External",
  longName: "Vendor One",
  shortName: "V1",
  entityStatus: "Pending",
  website: "example.com",
  entityDescription: "A pending vendor",
};

const renderPage = () =>
  render(
    <AppProviders>
      <AddVendor history={{ push: jest.fn() }} />
    </AppProviders>
  );

describe("AddVendor", () => {
  beforeEach(() => {
    mockParams = {};
    mockState = defaultState;
    mockDispatch.mockImplementation(() => Promise.resolve({}));
    startAddVendor.mockImplementation((payload) => ({
      type: "ADD_VENDOR",
      payload,
    }));
    startGetVendors.mockImplementation(() => ({ type: "GET_VENDORS" }));
    saveLocalData.mockImplementation((values) => ({
      type: "SAVE_LOCAL",
      values,
    }));
    jest.spyOn(redux, "useSelector").mockImplementation((cb) => cb(mockState));
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("should render the entity form step", () => {
    renderPage();
    expect(screen.getByTestId("mock-new-vendor-form")).toBeInTheDocument();
  });

  it("should render the Next button on the first step", () => {
    renderPage();
    expect(screen.getByRole("button", { name: /Next/i })).toBeInTheDocument();
  });

  it("should render the Cancel button", () => {
    renderPage();
    expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();
  });

  it("should render the Submit button disabled on the first step", () => {
    renderPage();
    expect(screen.getByRole("button", { name: /Submit/i })).toBeDisabled();
  });

  it("should render in edit mode without crashing", () => {
    mockParams = { id: "V1" };
    renderPage();
    expect(screen.getByTestId("mock-new-vendor-form")).toBeInTheDocument();
  });

  /* ---------------------------------------------------------------- *
   * Step navigation                                                   *
   * ---------------------------------------------------------------- */
  describe("step navigation", () => {
    const goToReviewStep = async () => {
      fireEvent.click(screen.getByRole("button", { name: /Next/i }));
      expect(await screen.findByTestId("mock-review-submit")).toBeInTheDocument();
    };

    it("should advance to the review step and persist the draft locally", async () => {
      renderPage();
      await goToReviewStep();

      expect(saveLocalData).toHaveBeenCalledWith(
        expect.objectContaining({ existingVendorWithScb: "yes" })
      );
      expect(mockDispatch).toHaveBeenCalled();
    });

    it("should swap Next for Previous on the last step and go back", async () => {
      renderPage();
      await goToReviewStep();

      expect(screen.queryByRole("button", { name: /Next/i })).toBeNull();
      fireEvent.click(screen.getByRole("button", { name: /Previous/i }));

      expect(
        await screen.findByTestId("mock-new-vendor-form")
      ).toBeInTheDocument();
    });

  });

  /* ---------------------------------------------------------------- *
   * Submit                                                            *
   * ---------------------------------------------------------------- */
  describe("submit", () => {
    const submit = async () => {
      fireEvent.click(screen.getByRole("button", { name: /Next/i }));
      await screen.findByTestId("mock-review-submit");
      const submitBtn = screen.getByRole("button", { name: /Submit/i });
      await waitFor(() => expect(submitBtn).not.toBeDisabled());
      fireEvent.click(submitBtn);
    };

    it("should create a vendor and navigate to the dashboard", async () => {
      localStorage.setItem("psid", "1234567");
      mockDispatch.mockImplementation(() =>
        Promise.resolve({ data: { entityManagement: { entityId: "V9" } } })
      );
      renderPage();
      await submit();

      await waitFor(() =>
        expect(mockHistoryPush).toHaveBeenCalledWith("/vendorDashboard")
      );
      expect(startAddVendor).toHaveBeenCalledWith(
        expect.objectContaining({ createdBy: "1234567", isUpdate: false })
      );
      expect(
        await screen.findByText(/Form entity Id V9 submitted successfully!/i)
      ).toBeInTheDocument();
    });

    it("should update an existing vendor and navigate to the dashboard", async () => {
      mockParams = { id: "V1" };
      mockState = {
        vendor: { list: [{ ...pendingVendor, entityStatus: "Active" }] },
      };
      localStorage.setItem("psid", "7654321");
      mockDispatch.mockImplementation(() =>
        Promise.resolve({ data: { statusMessage: "updated" } })
      );
      renderPage();
      await submit();

      await waitFor(() =>
        expect(mockHistoryPush).toHaveBeenCalledWith("/vendorDashboard")
      );
      expect(startAddVendor).toHaveBeenCalledWith(
        expect.objectContaining({
          entityId: "V1",
          isUpdate: true,
          lastUpdatedBy: "7654321",
        })
      );
      expect(
        await screen.findByText(/Form entity Id V1 Updated successfully!/i)
      ).toBeInTheDocument();
    });

    it("should keep Submit disabled while the entity is still pending", async () => {
      mockParams = { id: "V1" };
      mockState = { vendor: { list: [pendingVendor] } };
      renderPage();

      fireEvent.click(screen.getByRole("button", { name: /Next/i }));
      await screen.findByTestId("mock-review-submit");
      expect(screen.getByRole("button", { name: /Submit/i })).toBeDisabled();
    });

    it("should surface a warning when the submit response carries a message", async () => {
      mockDispatch.mockImplementation(() =>
        Promise.resolve({ message: "Entity already exists" })
      );
      renderPage();
      await submit();

      expect(
        await screen.findByText("Entity already exists")
      ).toBeInTheDocument();
      expect(mockHistoryPush).not.toHaveBeenCalled();
    });

    it("should stay put when the submit response is empty", async () => {
      mockDispatch.mockImplementation(() => Promise.resolve(undefined));
      renderPage();
      await submit();

      await waitFor(() => expect(startAddVendor).toHaveBeenCalled());
      expect(mockHistoryPush).not.toHaveBeenCalled();
    });
  });

  /* ---------------------------------------------------------------- *
   * Cancel confirmation                                               *
   * ---------------------------------------------------------------- */
  describe("cancel", () => {
    it("should navigate back to masterData when the discard is confirmed", async () => {
      renderPage();
      fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));

      const dialog = await screen.findByRole("dialog");
      expect(within(dialog).getByText("Discard changes?")).toBeInTheDocument();
      fireEvent.click(within(dialog).getByRole("button", { name: "Discard" }));

      await waitFor(() =>
        expect(mockHistoryPush).toHaveBeenCalledWith("/masterData")
      );
    });

    it("should stay on the form when the discard is dismissed", async () => {
      renderPage();
      fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));

      const dialog = await screen.findByRole("dialog");
      fireEvent.click(within(dialog).getByRole("button", { name: "Stay" }));

      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
      );
      expect(mockHistoryPush).not.toHaveBeenCalled();
    });
  });

  /* ---------------------------------------------------------------- *
   * Edit mode mapping                                                 *
   * ---------------------------------------------------------------- */
  describe("edit mode", () => {
    it("should show the pending banner for a pending vendor and allow dismissing it", async () => {
      mockParams = { id: "V1" };
      mockState = { vendor: { list: [pendingVendor] } };
      renderPage();

      const alert = await screen.findByRole("alert");
      expect(alert).toBeInTheDocument();

      fireEvent.click(within(alert).getByRole("button", { name: /close/i }));
      await waitFor(() =>
        expect(screen.queryByRole("alert")).not.toBeInTheDocument()
      );
    });

    it("should not show the pending banner for an approved vendor", () => {
      mockParams = { id: "V1" };
      mockState = {
        vendor: { list: [{ ...pendingVendor, entityStatus: "Active" }] },
      };
      renderPage();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("should ignore a vendor id that is not in the list", () => {
      mockParams = { id: "MISSING" };
      mockState = { vendor: { list: [pendingVendor] } };
      renderPage();
      expect(startGetVendors).not.toHaveBeenCalled();
      expect(screen.getByTestId("mock-new-vendor-form")).toBeInTheDocument();
    });

    it("should fetch the vendor list when it has not been loaded yet", () => {
      mockParams = { id: "V1" };
      mockState = { vendor: { list: [] } };
      renderPage();
      expect(startGetVendors).toHaveBeenCalled();
    });
  });
});
