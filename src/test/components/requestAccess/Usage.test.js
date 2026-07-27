import React from "react";
import * as redux from "react-redux";
import { render } from "@testing-library/react";
import { useLocation } from "react-router-dom";

import Usage from "../../../components/requestAccess/Usage";

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
}));
jest.mock("react-router-dom", () => ({
  useLocation: jest.fn(),
}));

const requestAccess = {
  tableInfo: {
    contractExpDate: "",
    licenseStatus: "",
  },
  usage: [],
  businessRequirements: [{ subscriptionId: "" }],
};
const state = { requestAccess };

beforeAll(() => {
  // The Expiration Date field renders a MUI DatePicker which subscribes via
  // useMediaQuery (addEventListener). The global setup mock only provides the
  // legacy addListener API, so provide a fuller matchMedia here.
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }),
  });
});

beforeEach(() => {
  jest
    .spyOn(redux, "useSelector")
    .mockImplementation((callback) => callback(state));
  useLocation.mockReturnValue({ state: { data: {} } });
});

describe("Usage", () => {
  it("should render the usage form", () => {
    const { container } = render(<Usage />);
    expect(container.querySelector("form[name='usage-one']")).toBeInTheDocument();
  });

  it("should render the Billing Model field", () => {
    const { getByPlaceholderText } = render(<Usage />);
    expect(getByPlaceholderText("Billing Model")).toBeInTheDocument();
  });
});
