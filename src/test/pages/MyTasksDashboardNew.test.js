import React from "react";
import * as redux from "react-redux";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import MyTasksDashboardNew from "../../pages/myTasks/MyTasksDashboardNew";

jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});

const mockDispatch = jest.fn();

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

jest.mock("../../components/Modals/ApproveRejectModal", () => () => (
  <div data-testid="mock-approve-reject-modal" />
));

const state = {
  myTasks: { list: [], data: {}, pendingList: [], completedList: [] },
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <MyTasksDashboardNew />
    </MemoryRouter>
  );

describe("MyTasksDashboardNew", () => {
  beforeEach(() => {
    jest
      .spyOn(redux, "useSelector")
      .mockImplementation((selector) => selector(state));
  });

  it("should render the loading spinner initially", () => {
    const { container } = renderPage();
    expect(container.querySelector("#spinner")).toBeInTheDocument();
  });

  it("should render the ApproveRejectModal", () => {
    const { getByTestId } = renderPage();
    expect(getByTestId("mock-approve-reject-modal")).toBeInTheDocument();
  });
});
