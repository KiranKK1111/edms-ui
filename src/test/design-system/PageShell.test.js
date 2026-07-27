import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

import PageShell, { PageHeader } from "../../design-system/PageShell";

describe("PageShell", () => {
  it("renders the title, subtitle, tags, extra actions, children and footer", () => {
    render(
      <PageShell
        title="Dataset overview"
        subTitle="Everything about this dataset"
        tags={<span>Active</span>}
        extra={<button type="button">Edit</button>}
        footer={<div>Footer content</div>}
      >
        <div>Body content</div>
      </PageShell>
    );

    expect(screen.getByRole("heading", { name: "Dataset overview" })).toBeInTheDocument();
    expect(screen.getByText("Everything about this dataset")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    expect(screen.getByText("Body content")).toBeInTheDocument();
    expect(screen.getByText("Footer content")).toBeInTheDocument();
  });

  it("omits every optional slot when nothing is supplied", () => {
    const { container } = render(<PageShell />);
    expect(container.querySelector("h1")).toBeNull();
    expect(screen.queryByRole("button", { name: "Back" })).not.toBeInTheDocument();
    expect(container.querySelector("nav")).toBeNull();
    expect(container.querySelector(".ds-page-shell")).toBeInTheDocument();
  });

  it("renders a back button that calls onBack", () => {
    const onBack = jest.fn();
    render(<PageShell title="Detail" onBack={onBack} />);
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("renders an avatar only when it has a src", () => {
    const { container, unmount } = render(
      <PageShell title="With avatar" avatar={{ src: "/logo.png", alt: "Logo" }} />
    );
    expect(container.querySelector("img")).toBeInTheDocument();
    unmount();

    const { container: c2 } = render(
      <PageShell title="No avatar" avatar={{ alt: "Logo" }} />
    );
    expect(c2.querySelector("img")).toBeNull();
  });

  it("merges className and style, and drops the ghost background when ghost=false", () => {
    const { container } = render(
      <PageShell
        title="Solid"
        ghost={false}
        className="my-shell"
        style={{ marginTop: "10px" }}
      />
    );
    const root = container.firstChild;
    expect(root).toHaveClass("ds-page-shell");
    expect(root).toHaveClass("my-shell");
    expect(root).toHaveStyle({ marginTop: "10px" });
  });

  it("re-exports itself as PageHeader", () => {
    expect(PageHeader).toBe(PageShell);
    render(<PageHeader title="Legacy alias" />);
    expect(screen.getByRole("heading", { name: "Legacy alias" })).toBeInTheDocument();
  });
});

describe("PageShell — breadcrumb", () => {
  it("renders a React element breadcrumb verbatim", () => {
    render(<PageShell title="X" breadcrumb={<nav>custom crumb</nav>} />);
    expect(screen.getByText("custom crumb")).toBeInTheDocument();
  });

  it("renders an antd-shaped routes breadcrumb with separators", () => {
    const { container } = render(
      <PageShell
        title="X"
        breadcrumb={{
          routes: [
            { path: "/home", breadcrumbName: "Home" },
            { path: "/home/licences", title: "Licences" },
            { path: "/home/licences/1" },
          ],
        }}
      />
    );
    const nav = container.querySelector('nav[aria-label="Breadcrumb"]');
    expect(nav).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    // falls back to `title` then to `path`
    expect(screen.getByText("Licences")).toBeInTheDocument();
    expect(screen.getByText("/home/licences/1")).toBeInTheDocument();
    // one separator less than the number of routes
    expect(nav.textContent.split("/").length).toBeGreaterThan(1);
  });

  it("uses a custom itemRender when provided", () => {
    const itemRender = jest.fn((route) => <a href={route.path}>{route.breadcrumbName}</a>);
    render(
      <PageShell
        title="X"
        breadcrumb={{
          routes: [
            { path: "/a", breadcrumbName: "A" },
            { path: "/b", breadcrumbName: "B" },
          ],
          itemRender,
        }}
      />
    );
    expect(itemRender).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("link", { name: "A" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "B" })).toBeInTheDocument();
  });

  it("renders routes without a path using the array index as the key", () => {
    render(
      <PageShell
        title="X"
        breadcrumb={{ routes: [{ breadcrumbName: "One" }, { breadcrumbName: "Two" }] }}
      />
    );
    expect(screen.getByText("One")).toBeInTheDocument();
    expect(screen.getByText("Two")).toBeInTheDocument();
  });

  it("ignores breadcrumb shapes it does not understand", () => {
    const { container, unmount } = render(
      <PageShell title="X" breadcrumb={{ notRoutes: true }} />
    );
    expect(container.querySelector("nav")).toBeNull();
    unmount();

    const { container: c2 } = render(<PageShell title="X" breadcrumb="just a string" />);
    expect(c2.querySelector("nav")).toBeNull();
    expect(screen.queryByText("just a string")).not.toBeInTheDocument();
  });
});
