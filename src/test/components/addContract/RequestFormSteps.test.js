import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import RequestFormSteps from "../../../components/addContract/RequestFormSteps";

/*
  RequestFormSteps is a legacy (pre MUI migration) wizard that is no longer
  wired into any route. It still imports `antd`, which is no longer a
  dependency of this project, so the module is mocked virtually here — that is
  the only way to exercise the component at all.

  CRA sets resetMocks:true, so every mock implementation is installed inside
  beforeEach rather than at module-factory scope.
*/

jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});

jest.mock(
  "antd",
  () => {
    const ReactLib = require("react");
    const Steps = ({ current, children }) =>
      ReactLib.createElement(
        "div",
        { "data-testid": "steps", "data-current": String(current) },
        children
      );
    Steps.Step = ({ title }) =>
      ReactLib.createElement("div", { className: "ant-step" }, title);

    return {
      __esModule: true,
      Steps,
      Button: ({ children, onClick, style }) =>
        ReactLib.createElement("button", { onClick, style, type: "button" }, children),
      Skeleton: () => ReactLib.createElement("div", { "data-testid": "skeleton" }),
      Alert: ({ message }) => ReactLib.createElement("div", { role: "alert" }, message),
      message: { success: jest.fn() },
    };
  },
  { virtual: true }
);

let mockVendorState = { list: [] };
// `connect` is stubbed out, so the module's mapStateToProps is captured here
// to keep it directly assertable. `var` is required: connect() runs while the
// component module is imported, before any `const` in this file is initialised.
var mockMapStateToProps;
jest.mock("react-redux", () => ({
  __esModule: true,
  connect: (mapStateToProps) => (Component) => {
    mockMapStateToProps = mockMapStateToProps || [];
    mockMapStateToProps.push(mapStateToProps);
    return Component;
  },
  useSelector: (selector) =>
    selector({ vendor: mockVendorState, contract: { selectedContract: {} } }),
}));

/* Each lazily loaded step is stubbed with a probe that exposes the `next`
   callback and the `formData` prop the wizard hands down. */
const stepStub = (testId) => ({
  __esModule: true,
  default: ({ next, formData }) => (
    <div data-testid={testId}>
      <span data-testid={`${testId}-formdata`}>{String(formData)}</span>
      <button type="button" onClick={() => next(true)}>
        {`${testId}-advance`}
      </button>
      <button type="button" onClick={() => next(false)}>
        {`${testId}-reset`}
      </button>
      <button type="button" onClick={() => next("payload")}>
        {`${testId}-dirty`}
      </button>
    </div>
  ),
});

jest.mock("../../../components/addContract/ContractDetails", () =>
  stepStub("contract-details")
);
jest.mock("../../../components/addContract/VendorContacts", () =>
  stepStub("vendor-contacts")
);
jest.mock("../../../components/addContract/UploadContractV2", () =>
  stepStub("upload-contract")
);
jest.mock("../../../components/addContract/ReviewSubmit", () => ({
  __esModule: true,
  default: ({ contractDetails, vendorList }) => (
    <div data-testid="review-submit">
      <span data-testid="review-contract">
        {contractDetails ? contractDetails.contractId : "none"}
      </span>
      <span data-testid="review-vendors">{(vendorList || []).length}</span>
    </div>
  ),
}));

const { message } = require("antd");

const renderWizard = (props = {}) =>
  render(
    <RequestFormSteps
      stepsLength={props.stepsLength || jest.fn()}
      contractDetails={props.contractDetails}
      {...props}
    />
  );

const advance = async (fromTestId, toTestId) => {
  fireEvent.click(screen.getByText(`${fromTestId}-advance`));
  return screen.findByTestId(toTestId);
};

describe("RequestFormSteps", () => {
  beforeEach(() => {
    mockVendorState = { list: [{ entityId: "V1" }, { entityId: "V2" }] };
  });

  it("should render the wizard shell once the steps callback is available", async () => {
    renderWizard();
    expect(await screen.findByTestId("steps")).toBeInTheDocument();
    expect(screen.queryByTestId("skeleton")).not.toBeInTheDocument();
  });

  it("should render every step title", async () => {
    const { container } = renderWizard();
    await screen.findByTestId("steps");
    const titles = Array.from(container.querySelectorAll(".ant-step")).map(
      (el) => el.textContent
    );
    expect(titles).toEqual([
      "Agreement Details",
      "Agreement Limitations",
      "Upload Agreement",
      "Review & Submit",
    ]);
  });

  it("should lazily render the first step", async () => {
    renderWizard();
    expect(await screen.findByTestId("contract-details")).toBeInTheDocument();
    expect(screen.getByTestId("contract-details-formdata")).toHaveTextContent(
      "false"
    );
  });

  it("should report the submit permission to the parent per step", async () => {
    const stepsLength = jest.fn();
    renderWizard({ stepsLength });
    await screen.findByTestId("contract-details");

    expect(stepsLength).toHaveBeenCalledWith(false);

    await advance("contract-details", "vendor-contacts");
    await advance("vendor-contacts", "upload-contract");
    await advance("upload-contract", "review-submit");

    expect(stepsLength).toHaveBeenLastCalledWith(true);
  });

  it("should walk forward through all four steps", async () => {
    renderWizard();
    await screen.findByTestId("contract-details");

    expect(await advance("contract-details", "vendor-contacts")).toBeInTheDocument();
    expect(await advance("vendor-contacts", "upload-contract")).toBeInTheDocument();
    expect(await advance("upload-contract", "review-submit")).toBeInTheDocument();
  });

  it("should pass the contract details and the vendor list to the review step", async () => {
    renderWizard({ contractDetails: { contractId: "C-100" } });
    await screen.findByTestId("contract-details");
    await advance("contract-details", "vendor-contacts");
    await advance("vendor-contacts", "upload-contract");
    await advance("upload-contract", "review-submit");

    expect(screen.getByTestId("review-contract")).toHaveTextContent("C-100");
    expect(screen.getByTestId("review-vendors")).toHaveTextContent("2");
  });

  it("should go back to the previous step", async () => {
    renderWizard();
    await screen.findByTestId("contract-details");
    await advance("contract-details", "vendor-contacts");

    fireEvent.click(screen.getByText("Previous"));
    expect(await screen.findByTestId("contract-details")).toBeInTheDocument();
    expect(screen.queryByText("Previous")).not.toBeInTheDocument();
  });

  it("should mark the form dirty when the toolbar Next button is used", async () => {
    renderWizard();
    await screen.findByTestId("contract-details");

    // The toolbar button forwards the click event, which is neither `true`
    // nor `false`, so it only flags the form as dirty — it does not advance.
    fireEvent.click(screen.getByText("Next"));

    await waitFor(() =>
      expect(screen.getByTestId("contract-details-formdata")).toHaveTextContent(
        "true"
      )
    );
    expect(screen.getByTestId("steps")).toHaveAttribute("data-current", "0");
  });

  it("should flag and then clear the dirty state from the step callbacks", async () => {
    renderWizard();
    await screen.findByTestId("contract-details");

    fireEvent.click(screen.getByText("contract-details-dirty"));
    await waitFor(() =>
      expect(screen.getByTestId("contract-details-formdata")).toHaveTextContent(
        "true"
      )
    );

    fireEvent.click(screen.getByText("contract-details-reset"));
    await waitFor(() =>
      expect(screen.getByTestId("contract-details-formdata")).toHaveTextContent(
        "false"
      )
    );
  });

  it("should hide Next and expose the hidden Done action on the last step", async () => {
    renderWizard();
    await screen.findByTestId("contract-details");
    await advance("contract-details", "vendor-contacts");
    await advance("vendor-contacts", "upload-contract");
    await advance("upload-contract", "review-submit");

    expect(screen.queryByText("Next")).not.toBeInTheDocument();
    const done = screen.getByText("Done");
    expect(done).toHaveStyle("display: none");

    fireEvent.click(done);
    expect(message.success).toHaveBeenCalledWith("Processing complete!");
  });

  it("should map the selected contract from the store", () => {
    expect(mockMapStateToProps).toHaveLength(1);
    expect(
      mockMapStateToProps[0]({
        contract: { selectedContract: { contractId: "C-1" } },
      })
    ).toEqual({ selectedContract: { contractId: "C-1" } });
  });

  it("should tolerate an empty vendor list", async () => {
    mockVendorState = { list: [] };
    renderWizard();
    await screen.findByTestId("contract-details");
    await advance("contract-details", "vendor-contacts");
    await advance("vendor-contacts", "upload-contract");
    await advance("upload-contract", "review-submit");

    expect(screen.getByTestId("review-vendors")).toHaveTextContent("0");
    expect(screen.getByTestId("review-contract")).toHaveTextContent("none");
  });
});
