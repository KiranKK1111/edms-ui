import React from "react";
import { render } from "@testing-library/react";
import DisplayTC from "../../../components/requestAccess/DisplayTC";

const mockDispatch = jest.fn();
let mockState = {
  requestAccess: { businessRequirements: [] },
  datafeedInfo: { congigUi: { vendorRequestConfig: "N" } },
};

jest.mock("react-redux", () => ({
  useSelector: (cb) => cb(mockState),
  useDispatch: () => mockDispatch,
}));

describe("DisplayTC", () => {
  it("should render the display-terms-and-conditions container", () => {
    const { container } = render(<DisplayTC view="tc" />);
    expect(
      container.querySelector(".display-terms-and-conditions")
    ).toBeInTheDocument();
  });

  it("should render the general subscription terms heading", () => {
    const { getByText } = render(<DisplayTC view="tc" />);
    expect(
      getByText("Terms & Conditions general Subscription")
    ).toBeInTheDocument();
  });
});
