import React from "react";
import * as redux from "react-redux";
import { render } from "@testing-library/react";

import AppProviders from "../../design-system/AppProviders";
import AddEditDocuments from "../../pages/datafeed/AddEditDocuments";

jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});

const mockDispatch = jest.fn();

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

jest.mock("react-router-dom", () => ({
  __esModule: true,
  useParams: () => ({ dsDfId: "DS1", docObjectIds: "" }),
  useHistory: () => ({ push: jest.fn() }),
  useLocation: () => ({ pathname: "/addDocuments", state: {} }),
  Link: ({ children }) => <a>{children}</a>,
}));

jest.mock("../../components/Modals/DocumentDeleteValidate", () => () => (
  <div data-testid="mock-doc-delete-validate" />
));

const props = {
  location: {
    state: { editObj: {} },
    pathname: "/addDocuments",
  },
  history: { push: jest.fn() },
};

const state = {
  fileUpload: { fileLists: { documentList: "" } },
  dataset: { datasetsInfo: [] },
  datafeedInfo: { datafeedsData: [] },
};

describe("AddEditDocuments", () => {
  beforeEach(() => {
    jest
      .spyOn(redux, "useSelector")
      .mockImplementation((callback) => callback(state));
  });

  it("should render the main wrapper", () => {
    const { container } = render(
      <AppProviders>
        <AddEditDocuments {...props} />
      </AppProviders>
    );
    expect(container.querySelector("#main")).toBeInTheDocument();
  });

  it("should render the Document details heading", () => {
    const { getByText } = render(
      <AppProviders>
        <AddEditDocuments {...props} />
      </AppProviders>
    );
    expect(getByText("Document details")).toBeInTheDocument();
  });
});
