import React from "react";
import * as redux from "react-redux";
import { render, screen } from "@testing-library/react";

import VendorContacts from "../../../components/addContract/VendorContacts";

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
}));

jest.mock("../../../components/addContract/bindData", () => ({
  bindData: jest.fn(),
}));

const contract = {
  selectedContract: [{}],
  vendorContacts: [{}],
};
const state = { contract };

describe("VendorContacts", () => {
  beforeEach(() => {
    jest
      .spyOn(redux, "useSelector")
      .mockImplementation((callback) => callback(state));
  });

  it("should render the Agreement Limitations field", () => {
    render(<VendorContacts next={jest.fn()} />);
    expect(screen.getAllByText("Agreement Limitations").length).toBeGreaterThanOrEqual(1);
  });

  it("should render the agreement limitations textarea", () => {
    const { container } = render(<VendorContacts next={jest.fn()} />);
    expect(
      screen.getByPlaceholderText("Agreement Limitations")
    ).toBeInTheDocument();
    expect(container.querySelector("textarea")).toBeInTheDocument();
  });
});
