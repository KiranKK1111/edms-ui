import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import AppProviders from "../../design-system/AppProviders";
import UserProfile from "../../pages/userProfile/UserProfile";

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

const renderPage = () =>
  render(
    <AppProviders>
      <MemoryRouter>
        <UserProfile />
      </MemoryRouter>
    </AppProviders>
  );

describe("UserProfile", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("should render the profile page container", () => {
    const { container } = renderPage();
    expect(container.querySelector(".profile-page")).toBeInTheDocument();
  });

  it("should render the #main wrapper", () => {
    const { container } = renderPage();
    expect(container.querySelector("#main")).toBeInTheDocument();
  });

  it("should render the PSID label", () => {
    localStorage.setItem("psid", "user123");
    const { getByText } = renderPage();
    expect(getByText(/PSID :/)).toBeInTheDocument();
  });
});
