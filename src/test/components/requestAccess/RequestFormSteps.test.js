import React from "react";
import { render, screen } from "@testing-library/react";
import RequestFormSteps from "../../../components/requestAccess/RequestFormSteps";

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
}));

jest.mock("react-router-dom", () => ({
  withRouter: (component) => component,
  useLocation: jest.fn().mockReturnValue({
    state: { data: {} },
  }),
}));

// The step bodies are lazy-loaded; stub them so the stepper chrome renders
// synchronously and we do not pull in their redux/router dependencies here.
jest.mock("../../../components/requestAccess/BusinessRequirements", () => ({
  __esModule: true,
  default: () => <div>Business Requirements step</div>,
}));
jest.mock("../../../components/requestAccess/Usage", () => ({
  __esModule: true,
  default: () => <div>Usage step</div>,
}));
jest.mock("../../../components/requestAccess/TermsConditions", () => ({
  __esModule: true,
  default: () => <div>Terms step</div>,
}));
jest.mock("../../../components/requestAccess/ReviewSubmit", () => ({
  __esModule: true,
  default: () => <div>Review step</div>,
}));

describe("RequestFormSteps", () => {
  const mockStepsLength = jest.fn();

  it("should render the three step titles", () => {
    render(
      <RequestFormSteps contractManagement={false} stepsLength={mockStepsLength} />
    );
    expect(screen.getByText("Business Requirements")).toBeInTheDocument();
    expect(screen.getByText("Terms & Conditions")).toBeInTheDocument();
    expect(screen.getByText("Review & Submit")).toBeInTheDocument();
  });

  it("should render the Next button on the first step", () => {
    render(
      <RequestFormSteps contractManagement={false} stepsLength={mockStepsLength} />
    );
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
  });

  it("should not render the Previous button on the first step", () => {
    render(
      <RequestFormSteps contractManagement={false} stepsLength={mockStepsLength} />
    );
    expect(screen.queryByText("Previous")).not.toBeInTheDocument();
  });
});
