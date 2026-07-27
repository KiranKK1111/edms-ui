import React from "react";
import * as redux from "react-redux";
import { render, screen } from "@testing-library/react";

import ReviewSubmit from "../../../components/addContract/ReviewSubmit";

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
}));

jest.mock("react-router-dom", () => ({
  __esModule: true,
  useLocation: () => ({
    pathname: "/another-route",
    search: "",
    hash: "",
    state: null,
    key: "5nvxpbdafa",
  }),
}));

const contract = {
  contractDetails: [{}],
  vendorContacts: [{}],
  upload: {},
};
const state = { contract };

describe("ReviewSubmit (Contract)", () => {
  beforeEach(() => {
    jest
      .spyOn(redux, "useSelector")
      .mockImplementation((callback) => callback(state));
  });

  it("should render the main container", () => {
    const { container } = render(<ReviewSubmit />);
    expect(container.querySelector("#main")).toBeInTheDocument();
  });

  it("should render the review section headers", () => {
    render(<ReviewSubmit />);
    expect(screen.getByText("Agreement Details")).toBeInTheDocument();
    expect(screen.getByText("Agreement Limitations")).toBeInTheDocument();
    expect(screen.getByText("Agreement Document")).toBeInTheDocument();
  });
});
