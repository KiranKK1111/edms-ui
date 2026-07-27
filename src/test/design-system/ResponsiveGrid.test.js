import React from "react";
import { render, screen } from "@testing-library/react";

import ResponsiveGrid from "../../design-system/ResponsiveGrid";

const gridEl = (container) => container.querySelector('div[class^="ds-grid-"]');
const styleEl = (container) => container.querySelector("style");

describe("ResponsiveGrid", () => {
  it("renders its children inside a CSS grid", () => {
    const { container } = render(
      <ResponsiveGrid>
        <div>One</div>
        <div>Two</div>
      </ResponsiveGrid>
    );
    expect(screen.getByText("One")).toBeInTheDocument();
    expect(screen.getByText("Two")).toBeInTheDocument();
    expect(gridEl(container)).toHaveStyle({ display: "grid" });
  });

  it("emits an xs rule without a media query and media queries for the larger breakpoints", () => {
    const { container } = render(<ResponsiveGrid />);
    const css = styleEl(container).textContent;

    // xs → bare class rule
    expect(css).toMatch(/^\.ds-grid-[^{]*\{grid-template-columns:repeat\(1,minmax\(0,1fr\)\);\}/);
    expect(css).toContain("@media (min-width:576px)");
    expect(css).toContain("repeat(2,minmax(0,1fr))");
    expect(css).toContain("@media (min-width:768px)");
    expect(css).toContain("repeat(3,minmax(0,1fr))");
    expect(css).toContain("@media (min-width:992px)");
    expect(css).toContain("repeat(4,minmax(0,1fr))");
    // xl is not in the default columns map
    expect(css).not.toContain("@media (min-width:1280px)");
  });

  it("honours a custom columns map including xl", () => {
    const { container } = render(
      <ResponsiveGrid columns={{ xs: 2, xl: 6 }}>
        <div>child</div>
      </ResponsiveGrid>
    );
    const css = styleEl(container).textContent;
    expect(css).toContain("repeat(2,minmax(0,1fr))");
    expect(css).toContain("@media (min-width:1280px){");
    expect(css).toContain("repeat(6,minmax(0,1fr))");
    expect(css).not.toContain("@media (min-width:576px)");
  });

  it("skips breakpoints whose column count is falsy", () => {
    const { container } = render(
      <ResponsiveGrid columns={{ xs: 0, sm: undefined, md: 3 }}>
        <div>child</div>
      </ResponsiveGrid>
    );
    const css = styleEl(container).textContent;
    expect(css).toContain("@media (min-width:768px)");
    expect(css).toContain("repeat(3,minmax(0,1fr))");
    expect(css).not.toContain("@media (min-width:576px)");
    // xs was falsy → no bare class rule was emitted
    expect(css.startsWith("@media")).toBe(true);
  });

  it("produces an empty stylesheet when no breakpoint has columns", () => {
    const { container } = render(<ResponsiveGrid columns={{}}>x</ResponsiveGrid>);
    expect(styleEl(container).textContent).toBe("");
  });

  it("applies the default gap and allows overriding it", () => {
    const { container, unmount } = render(<ResponsiveGrid>x</ResponsiveGrid>);
    expect(gridEl(container).getAttribute("style")).toContain("var(--space-4)");
    unmount();

    const { container: c2 } = render(<ResponsiveGrid gap="24px">x</ResponsiveGrid>);
    expect(gridEl(c2)).toHaveStyle({ gap: "24px" });
  });

  it("merges a caller className and inline style", () => {
    const { container } = render(
      <ResponsiveGrid className="cards" style={{ marginTop: "8px", display: "flex" }}>
        x
      </ResponsiveGrid>
    );
    const el = container.querySelector(".cards");
    expect(el.className).toMatch(/^ds-grid-\S+ cards$/);
    expect(el).toHaveStyle({ marginTop: "8px" });
    // caller style wins over the built-in display
    expect(el).toHaveStyle({ display: "flex" });
  });

  it("scopes each instance to its own generated class name", () => {
    const { container } = render(
      <>
        <ResponsiveGrid>a</ResponsiveGrid>
        <ResponsiveGrid>b</ResponsiveGrid>
      </>
    );
    const grids = container.querySelectorAll('div[class^="ds-grid-"]');
    expect(grids.length).toBe(2);
    expect(grids[0].className).not.toBe(grids[1].className);
    // React's useId emits colons — they must be stripped for a valid selector
    expect(grids[0].className).not.toContain(":");
    expect(grids[1].className).not.toContain(":");
  });

  it("falls back to a random id when React.useId is unavailable", () => {
    const originalUseId = React.useId;
    // eslint-disable-next-line no-import-assign
    Object.defineProperty(React, "useId", { value: undefined, configurable: true });
    try {
      const { container } = render(<ResponsiveGrid>legacy</ResponsiveGrid>);
      expect(screen.getByText("legacy")).toBeInTheDocument();
      expect(gridEl(container).className).toMatch(/^ds-grid-rg-/);
    } finally {
      Object.defineProperty(React, "useId", {
        value: originalUseId,
        configurable: true,
      });
    }
  });
});
