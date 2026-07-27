import React from "react";
import * as redux from "react-redux";
import { render } from "@testing-library/react";

import RequestAccess from "../../pages/RequestAccess";

const mockDispatch = jest.fn();

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

jest.mock("react-router-dom", () => ({
  __esModule: true,
  useLocation: () => ({
    pathname: "/requestAccess",
    search: "",
    hash: "",
    state: { data: { dataFeedId: "DF1", datasetId: "DS1" } },
    key: "abc",
  }),
}));

jest.mock("../../components/requestAccess/Panel", () => () => (
  <div data-testid="mock-panel" />
));

jest.mock("../../components/requestAccess", () => ({
  __esModule: true,
  RequestFormSteps: () => <div data-testid="mock-request-form-steps" />,
}));

const state = {
  requestAccess: { response: {}, isSaveAsDraft: false },
  dataFamily: { data: {} },
  license: { data: {} },
  contractManagement: { data: {} },
  vendor: { data: {} },
};

describe("RequestAccess", () => {
  beforeEach(() => {
    jest
      .spyOn(redux, "useSelector")
      .mockImplementation((callback) => callback(state));
  });

  it("should render the main wrapper", () => {
    const { container } = render(<RequestAccess />);
    expect(container.querySelector("#main")).toBeInTheDocument();
  });

  it("should render the Panel and form steps", () => {
    const { getByTestId } = render(<RequestAccess />);
    expect(getByTestId("mock-panel")).toBeInTheDocument();
    expect(getByTestId("mock-request-form-steps")).toBeInTheDocument();
  });
});
