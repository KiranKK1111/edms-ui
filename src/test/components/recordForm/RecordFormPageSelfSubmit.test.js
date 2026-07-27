import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, useLocation } from "react-router-dom";
import axios from "axios";

import { AppProviders } from "../../../design-system";
import store from "../../../store";
import { datasetInfo } from "../../../store/actions/datasetFormActions";
import RecordFormPage from "../../../components/recordForm/RecordFormPage";

/*
  Covers the "self" driver submit path of the generic controller against the
  REAL redux store: Next → Review → Submit (failure tone + success + goBack).

  The real dataset step components are stubbed here because ReviewSubmit's
  mount effect re-dispatches its final payload into the slice it also selects
  from; under act()'s synchronous passive-effect flushing that ping-pong
  overflows React's nested-update budget as soon as Submit keeps the step
  mounted. The store, thunks (with axios mocked) and the controller itself all
  stay real — this suite is about RecordFormPage's submit orchestration.
*/
jest.mock("axios");

jest.mock("../../../components/datasetForm/DatasetDetails", () => {
  const mockReact = require("react");
  const Stub = (props) => {
    mockReact.useEffect(() => {
      if (props.formData) props.next(true);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.formData]);
    return mockReact.createElement("div", null, "Dataset step stub");
  };
  return { __esModule: true, default: Stub };
});

jest.mock("../../../components/datasetForm/ReviewSubmit", () => ({
  __esModule: true,
  default: () => require("react").createElement("div", null, "Review stub"),
}));

jest.setTimeout(60000);

beforeEach(() => {
  axios.mockResolvedValue({ data: {} });
  axios.get.mockResolvedValue({ data: {} });
  localStorage.setItem("psid", "PS123");
  localStorage.setItem("entitlementType", "Admin");
  localStorage.setItem("access_token", "fake-value-for-tests");
});

const LocationProbe = () => {
  const location = useLocation();
  return <div data-testid="location-probe">{location.pathname}</div>;
};

const renderDatasetWizard = () =>
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/masterData/DS1/dataset"]}>
        <AppProviders>
          <RecordFormPage resource="dataset" mode="create" />
          <LocationProbe />
        </AppProviders>
      </MemoryRouter>
    </Provider>
  );

describe("RecordFormPage — self driver submit (dataset)", () => {
  it("submits the aggregated payload: warning tone on failure, snackbar + goBack on success", async () => {
    // The review payload the wizard body would have written into the slice.
    store.dispatch(
      datasetInfo({
        datasetId: "",
        longName: "Self driver dataset",
        shortName: "SelfDs",
        datasetStatus: "Active",
        datasetDescription: "self submit flow",
        datasetUpdateFlag: "N",
      })
    );

    renderDatasetWizard();
    expect(screen.getByText("Dataset step stub")).toBeInTheDocument();
    // Submit is disabled while not on the review step
    expect(screen.getByRole("button", { name: /^submit$/i })).toBeDisabled();

    // Next → the self driver flips the formData flag; the step self-advances
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(await screen.findByText("Review stub")).toBeInTheDocument();

    const submitBtn = screen.getByRole("button", { name: /^submit$/i });
    await waitFor(() => expect(submitBtn).not.toBeDisabled());

    // 1) Backend error → interpret returns { ok: false, tone: "error" } →
    //    error snackbar, no navigation.
    axios.mockResolvedValueOnce({ message: "Backend exploded" });
    fireEvent.click(submitBtn);
    expect(await screen.findByText("Backend exploded")).toBeInTheDocument();
    expect(screen.getByTestId("location-probe").textContent).toBe(
      "/masterData/DS1/dataset"
    );
    fireEvent.click(screen.getByRole("button", { name: /close/i }));

    // 2) Success → success snackbar + navigation back to Master Data.
    axios.mockResolvedValueOnce({
      data: { statusMessage: { code: 200 }, dataset: { datasetId: "DS-9" } },
    });
    fireEvent.click(screen.getByRole("button", { name: /^submit$/i }));
    expect(
      await screen.findByText(/The Dataset, DS-9 has been successfully created!/)
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByTestId("location-probe").textContent).toBe(
        "/masterData"
      )
    );
  });
});
