import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";

import { buildMuiTheme } from "../../design-system/muiTheme";
import store from "../../store";

/*
  renderWithProviders — shared RTL helper for the test suite after the
  antd → MUI migration. Wraps the component under test in the providers
  the app relies on: Redux store, Router, and the MUI theme.

  Usage:
    import { renderWithProviders } from "../../utils/renderWithProviders";
    renderWithProviders(<MyComponent />);
    renderWithProviders(<MyComponent />, { route: "/masterData/E1/addAgreement" });
    renderWithProviders(<MyComponent />, { store: customStore });
*/

const theme = buildMuiTheme("light");

export function renderWithProviders(
  ui,
  { route = "/", store: customStore = store, ...renderOptions } = {}
) {
  const Wrapper = ({ children }) => (
    <Provider store={customStore}>
      <MemoryRouter initialEntries={[route]}>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </MemoryRouter>
    </Provider>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

export default renderWithProviders;
