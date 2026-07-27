import React, { forwardRef, lazy, Suspense } from "react";
import { Box, Skeleton } from "@mui/material";

/*
  DataTable — single reusable table built on Material React Table.

  The heavy implementation (material-react-table + its TanStack table/virtual
  deps, ~well over 100 KB) lives in ./DataTableInner and is loaded lazily here.
  This keeps that code out of the app's main bundle: it is only fetched the
  first time a page actually renders a table. The first screens the user sees
  (login, catalog card grid) render no table, so they no longer pay for it.

  The public API is unchanged. Two ways to use it:

  1. Native MRT API (preferred for new code):

      <DataTable
        columns={[
          { accessorKey: "name", header: "Name" },
          { accessorKey: "status", header: "Status", Cell: ({ cell }) => <StatusTag value={cell.getValue()} /> },
        ]}
        data={rows}
        // any other MRT prop is passed through
      />

  2. Antd-Table-shaped API (back-compat for existing pages):

      <DataTable
        columns={[
          { title: "Name", dataIndex: "name", key: "name", sorter: true },
          { title: "Status", dataIndex: "status", render: (v) => <Tag>{v}</Tag> },
        ]}
        dataSource={rows}
        rowKey="id"
        pagination={{ pageSize: 10, total: 1557 }}
      />

  Extras on top of MRT:
    title    : optional string rendered above the table (e.g. "Subscriptions (1557)")
    loading  : controls the built-in linear progress + skeleton state
    onRowClick : convenience for row click — wires MRT's muiTableBodyRowProps
    emptyState : { title, description, icon, action } for the no-data view
*/

const DataTableInner = lazy(() => import("./DataTableInner"));

// Lightweight placeholder shown only while the table chunk is being fetched
// (first table render of the session). It roughly matches the table footprint
// to avoid layout shift.
const TableFallback = () => (
  <Box
    sx={{
      p: 2,
      border: "1px solid var(--color-border-secondary)",
      borderRadius: "var(--radius-lg)",
      background: "var(--color-bg)",
    }}
  >
    <Skeleton variant="rounded" height={44} sx={{ mb: 1.25 }} />
    {Array.from({ length: 6 }).map((_, i) => (
      <Skeleton
        key={i}
        variant="rounded"
        height={34}
        sx={{ mb: 0.75, opacity: 1 - i * 0.12 }}
      />
    ))}
  </Box>
);

const DataTable = forwardRef(function DataTable(props, ref) {
  return (
    <Suspense fallback={<TableFallback />}>
      <DataTableInner {...props} ref={ref} />
    </Suspense>
  );
});

export default DataTable;
