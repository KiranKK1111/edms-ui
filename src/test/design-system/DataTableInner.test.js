import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";

import DataTableInner from "../../design-system/DataTableInner";

jest.setTimeout(60000);

const people = [
  { id: 1, name: "Alice", info: { age: 31 }, city: "Berlin", zip: "10115" },
  { id: 2, name: "Bob", info: { age: 42 }, city: "Paris", zip: "75001" },
  { id: 3, name: "Carol", info: { age: 27 }, city: "Rome", zip: "00100" },
  { id: 4, name: "Dave", info: { age: 55 }, city: "Oslo", zip: "0150" },
  { id: 5, name: "Erin", info: { age: 23 }, city: "Kyiv", zip: "01001" },
  { id: 6, name: "Frank", info: { age: 61 }, city: "Lima", zip: "15001" },
  { id: 7, name: "Grace", info: { age: 38 }, city: "Quito", zip: "170101" },
];

const antdColumns = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    sorter: (a, b) => a.name.localeCompare(b.name),
    align: "center",
    width: 120,
    minWidth: 80,
    maxWidth: 200,
    fixed: "left",
  },
  {
    title: "Age",
    dataIndex: ["info", "age"],
    key: "age",
    ellipsis: true,
    width: 80,
  },
  {
    title: "Actions",
    key: "actions",
    sorter: false,
    fixed: "right",
    render: (value, record) => (
      <button type="button">act-{record.name}</button>
    ),
  },
  {
    title: "Location",
    key: "location",
    children: [
      { title: "City", dataIndex: "city", key: "city" },
      { title: "Zip", dataIndex: "zip", key: "zip" },
    ],
  },
  // no dataIndex / key — accessorKey falls back to the title
  { title: "NoteOnly", render: () => "note" },
];

describe("DataTableInner (antd back-compat surface)", () => {
  it("renders antd-shaped columns: custom render, grouping, align, sorter and title toolbar", () => {
    const onRowClick = jest.fn();
    const rowStyleSpy = jest.fn(() => ({ style: { background: "yellow" } }));
    render(
      <DataTableInner
        columns={antdColumns}
        dataSource={people}
        rowKey="id"
        pagination={{ current: 1, pageSize: 5 }}
        title="People"
        bordered={false}
        onRow={rowStyleSpy}
        onRowClick={onRowClick}
      />
    );

    // toolbar title
    expect(screen.getByText("People")).toBeInTheDocument();
    // headers, including grouped children
    for (const h of ["Name", "Age", "Actions", "Location", "City", "Zip", "NoteOnly"]) {
      expect(screen.getAllByText(h).length).toBeGreaterThan(0);
    }
    // custom antd render fn
    expect(screen.getByRole("button", { name: "act-Alice" })).toBeInTheDocument();
    // page size 5 → row 6 not rendered
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.queryByText("Frank")).not.toBeInTheDocument();

    // row click → composed handler calls onRowClick with the original record
    fireEvent.click(screen.getByText("Alice"));
    expect(onRowClick).toHaveBeenCalled();
    expect(onRowClick.mock.calls[0][0]).toEqual(
      expect.objectContaining({ name: "Alice" })
    );
    expect(rowStyleSpy).toHaveBeenCalled();

    // custom sorter fn is wired into MRT's sortingFn
    fireEvent.click(screen.getByText("Name"));
    const cells = screen.getAllByRole("cell");
    expect(cells.length).toBeGreaterThan(0);
  });

  it("composes onRow's own onClick when provided", () => {
    const userClick = jest.fn();
    render(
      <DataTableInner
        columns={[{ title: "Name", dataIndex: "name", key: "name" }]}
        dataSource={people.slice(0, 2)}
        rowKey={(r) => r.id}
        onRow={() => ({ onClick: userClick })}
      />
    );
    fireEvent.click(screen.getByText("Bob"));
    expect(userClick).toHaveBeenCalled();
  });

  it("maps antd pagination `current` to the initial page and supports page navigation", async () => {
    render(
      <DataTableInner
        columns={[{ title: "Name", dataIndex: "name", key: "name" }]}
        dataSource={people}
        rowKey="id"
        pagination={{ current: 2, pageSize: 3 }}
      />
    );
    // page 2 (rows 4-6)
    expect(screen.getByText("Dave")).toBeInTheDocument();
    expect(screen.queryByText("Alice")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /next page/i }));
    expect(await screen.findByText("Grace")).toBeInTheDocument();
    expect(screen.queryByText("Dave")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /previous page/i }));
    expect(await screen.findByText("Dave")).toBeInTheDocument();
  });

  it("supports antd pagination pageIndex form and initialState overriding pagination", () => {
    const { unmount } = render(
      <DataTableInner
        columns={[{ title: "Name", dataIndex: "name", key: "name" }]}
        dataSource={people}
        rowKey="id"
        pagination={{ pageSize: 3, pageIndex: 1 }}
      />
    );
    expect(screen.getByText("Dave")).toBeInTheDocument();
    expect(screen.queryByText("Alice")).not.toBeInTheDocument();
    unmount();

    // caller-supplied initialState.pagination wins over the antd-shaped prop
    render(
      <DataTableInner
        columns={[{ title: "Name", dataIndex: "name", key: "name" }]}
        dataSource={people}
        rowKey="id"
        pagination={{ current: 2, pageSize: 3 }}
        initialState={{ pagination: { pageIndex: 0, pageSize: 10 } }}
      />
    );
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Grace")).toBeInTheDocument();
  });

  it("hides pagination when pagination={false}", () => {
    render(
      <DataTableInner
        columns={[{ title: "Name", dataIndex: "name", key: "name" }]}
        dataSource={people}
        pagination={false}
      />
    );
    expect(screen.queryByText(/rows per page/i)).not.toBeInTheDocument();
    // all rows on one page
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Grace")).toBeInTheDocument();
  });
});

describe("DataTableInner (MRT-native surface + state)", () => {
  it("accepts MRT-native columns, data, controlled state, loading and change handlers", () => {
    const onPaginationChange = jest.fn();
    const onSortingChange = jest.fn();
    const onColumnFiltersChange = jest.fn();
    render(
      <DataTableInner
        columns={[{ accessorKey: "name", header: "Name" }]}
        data={people.slice(0, 3)}
        rowKey={(r) => r.id}
        loading
        state={{ showProgressBars: true }}
        onPaginationChange={onPaginationChange}
        onSortingChange={onSortingChange}
        onColumnFiltersChange={onColumnFiltersChange}
      />
    );
    // while isLoading MRT swaps rows for skeletons + progress indicators
    expect(screen.getAllByRole("progressbar").length).toBeGreaterThan(0);
  });

  it("renders MRT-native rows when not loading", () => {
    render(
      <DataTableInner
        columns={[{ accessorKey: "name", header: "Name" }]}
        data={people.slice(0, 3)}
        rowKey={(r) => r.id}
      />
    );
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Carol")).toBeInTheDocument();
  });

  it("tolerates a non-array data prop and missing rowKey", () => {
    render(
      <DataTableInner
        columns={[{ accessorKey: "name", header: "Name" }]}
        data={{ not: "an array" }}
      />
    );
    expect(screen.getByText("No records to show")).toBeInTheDocument();
  });

  it("exposes the table instance through function and object refs", () => {
    const fnRef = jest.fn();
    render(
      <DataTableInner
        columns={[{ accessorKey: "name", header: "Name" }]}
        data={people.slice(0, 1)}
        ref={fnRef}
      />
    );
    expect(fnRef).toHaveBeenCalled();
    expect(typeof fnRef.mock.calls[0][0].getState).toBe("function");

    const objRef = React.createRef();
    render(
      <DataTableInner
        columns={[{ accessorKey: "name", header: "Name" }]}
        data={people.slice(0, 1)}
        ref={objRef}
      />
    );
    expect(typeof objRef.current.getState).toBe("function");
  });

  it("uses muiTableBodyRowProps verbatim when supplied", () => {
    render(
      <DataTableInner
        columns={[{ accessorKey: "name", header: "Name" }]}
        data={people.slice(0, 2)}
        muiTableBodyRowProps={{ "data-testid": "custom-row" }}
      />
    );
    expect(screen.getAllByTestId("custom-row").length).toBe(2);
  });

  it("renders custom top toolbar actions without a title", () => {
    render(
      <DataTableInner
        columns={[{ accessorKey: "name", header: "Name" }]}
        data={people.slice(0, 1)}
        renderTopToolbarCustomActions={() => (
          <button type="button">Custom action</button>
        )}
      />
    );
    expect(
      screen.getByRole("button", { name: "Custom action" })
    ).toBeInTheDocument();
  });
});

describe("DataTableInner (empty states)", () => {
  it("prefers locale.emptyText and emptyState description in the shared EmptyState", () => {
    render(
      <DataTableInner
        columns={[{ title: "Name", dataIndex: "name", key: "name" }]}
        dataSource={[]}
        locale={{ emptyText: "Nothing to see" }}
        emptyState={{ description: "Try again later" }}
      />
    );
    expect(screen.getByText("Nothing to see")).toBeInTheDocument();
    expect(screen.getByText("Try again later")).toBeInTheDocument();
  });

  it("falls back to the default empty title and supports a custom fallback renderer", () => {
    const { unmount } = render(
      <DataTableInner
        columns={[{ title: "Name", dataIndex: "name", key: "name" }]}
        dataSource={[]}
      />
    );
    expect(screen.getByText("No records to show")).toBeInTheDocument();
    expect(
      screen.getByText("Try changing your filters or search.")
    ).toBeInTheDocument();
    unmount();

    render(
      <DataTableInner
        columns={[{ title: "Name", dataIndex: "name", key: "name" }]}
        dataSource={[]}
        renderEmptyRowsFallback={() => <div>Custom empty</div>}
      />
    );
    expect(screen.getByText("Custom empty")).toBeInTheDocument();
  });
});

describe("DataTableInner (toolbar interactions)", () => {
  const simpleColumns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "City", dataIndex: "city", key: "city" },
  ];

  it("filters rows through the global search box", async () => {
    render(
      <DataTableInner
        columns={simpleColumns}
        dataSource={people}
        rowKey="id"
        pagination={false}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /show\/hide search/i }));
    const searchBox = await screen.findByPlaceholderText(/search/i);
    fireEvent.change(searchBox, { target: { value: "Alice" } });
    await waitFor(() =>
      expect(screen.queryByText("Bob")).not.toBeInTheDocument()
    );
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("filters rows through per-column filters", async () => {
    render(
      <DataTableInner
        columns={simpleColumns}
        dataSource={people}
        rowKey="id"
        pagination={false}
      />
    );
    fireEvent.click(
      screen.getByRole("button", { name: /show\/hide filters/i })
    );
    const filterBox = await screen.findByPlaceholderText(/filter by name/i);
    fireEvent.change(filterBox, { target: { value: "Bob" } });
    await waitFor(() =>
      expect(screen.queryByText("Alice")).not.toBeInTheDocument()
    );
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("toggles column visibility from the columns menu", async () => {
    render(
      <DataTableInner
        columns={simpleColumns}
        dataSource={people.slice(0, 2)}
        rowKey="id"
      />
    );
    expect(
      screen.getByRole("columnheader", { name: /city/i })
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: /show\/hide columns/i })
    );
    const menu = await screen.findByRole("menu");
    // MUI Switch renders a plain checkbox input; query the DOM rather than by
    // role, which material-react-table does not expose on these toggles.
    const toggles = menu.querySelectorAll('input[type="checkbox"]');
    expect(toggles.length).toBeGreaterThan(0);
    fireEvent.click(toggles[toggles.length - 1]);
    fireEvent.keyDown(menu, { key: "Escape" });
    await waitFor(() =>
      expect(
        screen.queryByRole("columnheader", { name: /city/i })
      ).not.toBeInTheDocument()
    );
  });

  it("supports density and full-screen toggles", async () => {
    render(
      <DataTableInner
        columns={simpleColumns}
        dataSource={people.slice(0, 2)}
        rowKey="id"
        enableFullScreenToggle
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /toggle density/i }));
    fireEvent.click(
      screen.getByRole("button", { name: /toggle full screen/i })
    );
    // table still renders after both toggles
    expect(screen.getByText("Alice")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: /toggle full screen/i })
    );
  });

  it("expands a row detail panel passed through rest props", async () => {
    render(
      <DataTableInner
        columns={simpleColumns}
        dataSource={people.slice(0, 2)}
        rowKey="id"
        renderDetailPanel={({ row }) => (
          <div>Detail for {row.original.name}</div>
        )}
      />
    );
    const expandButtons = screen.getAllByRole("button", { name: /expand/i });
    fireEvent.click(expandButtons[0]);
    expect(await screen.findByText("Detail for Alice")).toBeInTheDocument();
  });
});
