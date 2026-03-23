import { render, screen } from "@testing-library/react";
import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import { Provider } from "react-redux";
import reduxThunk from "redux-thunk";
import { MemoryRouter } from "react-router-dom";
import { createMemoryHistory } from "history";
import App from "../App";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  Link: () => <div />,
  withRouter: (x) => x,
}));
jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});
const rootReducer = combineReducers({});
const store = createStore(rootReducer, applyMiddleware(reduxThunk));

const history = createMemoryHistory({ initialEntries: ["/"] });
describe("Parent", () => {
  const { getByTestId } = render(
    <Provider store={store}>
      <MemoryRouter history={history}>
        <App />
      </MemoryRouter>
    </Provider>
  );
  test("Identify parent element", () => {
    expect(getByTestId("main")).toBeInTheDocument();
  });
  test("Router testing", () => {
    expect(history.location.pathname).toBe("/");
  });
});
