import React from "react";
import { render } from "@testing-library/react";
import TermsConditions from "../../../components/requestAccess/TermsConditions";

const mockDispatch = jest.fn();
let mockState = {
  requestAccess: { businessRequirements: [] },
  datafeedInfo: { congigUi: { vendorRequestConfig: "N" } },
};

jest.mock("react-redux", () => ({
  useSelector: (cb) => cb(mockState),
  useDispatch: () => mockDispatch,
}));

describe("TermsConditions", () => {
  it("should render the terms-and-conditions container", () => {
    const { container } = render(<TermsConditions view="tc" />);
    expect(container.querySelector(".terms-and-conditions")).toBeInTheDocument();
  });

  it("should render the DisplayTC child", () => {
    const { container } = render(<TermsConditions view="tc" />);
    expect(
      container.querySelector(".display-terms-and-conditions")
    ).toBeInTheDocument();
  });
});
