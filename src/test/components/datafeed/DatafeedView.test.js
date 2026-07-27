import React from "react";
import * as redux from "react-redux";
import { render, screen } from "@testing-library/react";

import DatafeedView, {
  DatafeedViewEditButton,
} from "../../../components/datafeed/DatafeedView";

const mockDispatch = jest.fn();

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

jest.mock("react-router-dom", () => ({
  __esModule: true,
  useLocation: () => ({
    pathname: "/masterData/DS1/viewDatafeed",
    state: {
      datafeedRecord: { feedUpdateFlag: "N", feedStatus: "Active" },
      dataset: { shortName: "DS1" },
    },
  }),
  useHistory: () => ({ push: jest.fn() }),
  Link: ({ children }) => <a>{children}</a>,
}));

jest.mock("../../../utils/accessObject", () =>
  jest.fn().mockReturnValue({ permission: "RW" })
);

const state = {
  datafeedInfo: {
    formData: { feedId: "DF1", longName: "Feed One", feedStatus: "Active" },
  },
};

describe("DatafeedView (read-only body)", () => {
  beforeEach(() => {
    jest
      .spyOn(redux, "useSelector")
      .mockImplementation((cb) => cb(state));
  });

  it("renders the General Details section", () => {
    render(<DatafeedView />);
    expect(screen.getByText("General Details")).toBeInTheDocument();
  });

  it("renders the Data Feed configuration link", () => {
    render(<DatafeedView />);
    expect(screen.getByText("Data Feed configuration")).toBeInTheDocument();
  });

  it("shows the feed values from the store", () => {
    render(<DatafeedView />);
    expect(screen.getByText(/Feed One/)).toBeInTheDocument();
  });

  it("renders an Edit button via DatafeedViewEditButton", () => {
    render(<DatafeedViewEditButton />);
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });
});
