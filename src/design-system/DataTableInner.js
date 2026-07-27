import React, { forwardRef, useMemo } from "react";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { Box, Typography } from "@mui/material";
import EmptyState from "./EmptyState";

/*
  DataTableInner — the real Material React Table implementation.

  This module is loaded lazily (see DataTable.js) so that material-react-table
  and its TanStack table/virtual dependencies are emitted into their own chunk
  instead of the app's main bundle. Tables only appear on lazy routes, so the
  first paint (login + catalog card grid) never needs this code.

  See DataTable.js for the public API and usage docs.
*/

const isAntdShape = (col) =>
  col && typeof col === "object" && ("dataIndex" in col || "title" in col);

const renderAntdCell = (col, cellInfo) => {
  const value = cellInfo.cell.getValue();
  const record = cellInfo.row.original;
  const index = cellInfo.row.index;
  if (typeof col.render === "function") {
    const node = col.render(value, record, index);
    if (node && typeof node === "object" && "children" in node && "props" in node) {
      return node;
    }
    return node;
  }
  return value ?? "";
};

const normalizeColumn = (col) => {
  if (!isAntdShape(col)) return col;

  const accessorKey =
    Array.isArray(col.dataIndex)
      ? col.dataIndex.join(".")
      : col.dataIndex || col.key || col.title;

  const next = {
    accessorKey,
    header: col.title ?? "",
    id: col.key || (typeof accessorKey === "string" ? accessorKey : undefined),
    enableSorting: col.sorter !== false && col.sorter !== undefined ? true : col.sorter === true,
    size: col.width,
    minSize: col.minWidth,
    maxSize: col.maxWidth,
    Cell: (info) => renderAntdCell(col, info),
  };

  if (col.align) {
    next.muiTableHeadCellProps = { align: col.align };
    next.muiTableBodyCellProps = { align: col.align };
  }

  if (col.fixed === "left") {
    next.enablePinning = true;
    next.pin = "left";
  } else if (col.fixed === "right") {
    next.enablePinning = true;
    next.pin = "right";
  }

  if (col.children && Array.isArray(col.children)) {
    next.columns = col.children.map(normalizeColumn);
    delete next.accessorKey;
    delete next.Cell;
  }

  if (col.ellipsis) {
    next.muiTableBodyCellProps = {
      ...(next.muiTableBodyCellProps || {}),
      sx: {
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        maxWidth: col.width || 240,
      },
    };
  }

  if (col.sorter && typeof col.sorter === "function") {
    next.sortingFn = (rowA, rowB) =>
      col.sorter(rowA.original, rowB.original);
  }

  return next;
};

const buildRowKey = (rowKey) => {
  if (typeof rowKey === "function") return rowKey;
  if (typeof rowKey === "string") return (row) => row?.[rowKey];
  return null;
};

const DataTableInner = forwardRef(function DataTableInner(
  {
    columns,
    // antd-shaped props (back-compat)
    dataSource,
    rowKey,
    pagination,
    loading,
    locale,
    bordered,
    onRow,
    // MRT-native props
    data,
    state,
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,
    initialState,
    enableTopToolbar = true,
    enableBottomToolbar = true,
    enableColumnFilters = true,
    enableGlobalFilter = true,
    enableSorting = true,
    enableColumnResizing = true,
    enableRowSelection = false,
    enablePagination = true,
    enableStickyHeader = true,
    enableDensityToggle = true,
    enableFullScreenToggle = false,
    enableHiding = true,
    enableColumnActions = true,
    layoutMode = "semantic",
    title,
    onRowClick,
    emptyState,
    muiTableContainerProps,
    muiTablePaperProps,
    muiTableBodyRowProps,
    renderTopToolbarCustomActions,
    renderEmptyRowsFallback,
    ...rest
  },
  ref
) {
  const rows = useMemo(() => {
    const source = data ?? dataSource ?? [];
    return Array.isArray(source) ? source : [];
  }, [data, dataSource]);

  const normalizedColumns = useMemo(
    () => (columns || []).filter(Boolean).map(normalizeColumn),
    [columns]
  );

  const getRowId = useMemo(() => buildRowKey(rowKey), [rowKey]);

  const paginationDisabled = pagination === false;

  // initialState.pagination is read by MRT exactly once on mount, so we can
  // resolve it freely from the antd-shaped `pagination` prop without worrying
  // about turning into a controlled value.
  const initialPaginationFromProps = useMemo(() => {
    if (paginationDisabled) return undefined;
    if (pagination && typeof pagination === "object") {
      return {
        pageSize: pagination.pageSize ?? 10,
        pageIndex:
          pagination.current != null
            ? pagination.current - 1
            : pagination.pageIndex ?? 0,
      };
    }
    return undefined;
  }, [paginationDisabled, pagination]);

  const resolvedRowProps = useMemo(() => {
    if (muiTableBodyRowProps) return muiTableBodyRowProps;
    if (onRowClick || onRow) {
      return ({ row }) => {
        const userProps = typeof onRow === "function" ? onRow(row.original, row.index) : {};
        return {
          onClick: (event) => {
            if (typeof userProps.onClick === "function") userProps.onClick(event);
            if (typeof onRowClick === "function") onRowClick(row.original, row.index, event);
          },
          sx: { cursor: "pointer", ...(userProps.style || {}) },
          ...userProps,
        };
      };
    }
    return undefined;
  }, [muiTableBodyRowProps, onRow, onRowClick]);

  // Build the `state` arg only with values we actually want controlled.
  // Passing `state.isLoading: false` makes MRT treat that slice as controlled
  // and can interfere with internal state.
  const tableState = {};
  if (loading) tableState.isLoading = true;
  if (state) Object.assign(tableState, state);

  // Build initialState. MRT reads it once on mount, so reference changes are
  // OK. We only inject pagination from the antd-shaped prop when the caller
  // didn't already supply one in initialState.
  const tableInitialState = { density: "comfortable" };
  if (initialPaginationFromProps && !initialState?.pagination) {
    tableInitialState.pagination = initialPaginationFromProps;
  }
  if (initialState) Object.assign(tableInitialState, initialState);

  const tableOptions = {
    columns: normalizedColumns,
    data: rows,
    initialState: tableInitialState,
    enableTopToolbar,
    enableBottomToolbar,
    enableColumnFilters,
    enableGlobalFilter,
    enableSorting,
    enableColumnResizing,
    enableRowSelection,
    enablePagination: enablePagination && !paginationDisabled,
    enableStickyHeader,
    enableDensityToggle,
    enableFullScreenToggle,
    enableHiding,
    enableColumnActions,
    layoutMode,
  };

  if (Object.keys(tableState).length > 0) tableOptions.state = tableState;
  if (getRowId) {
    tableOptions.getRowId = (originalRow, index) => {
      const k = getRowId(originalRow, index);
      return k != null ? String(k) : String(index);
    };
  }
  if (onPaginationChange) tableOptions.onPaginationChange = onPaginationChange;
  if (onSortingChange) tableOptions.onSortingChange = onSortingChange;
  if (onColumnFiltersChange) tableOptions.onColumnFiltersChange = onColumnFiltersChange;

  const table = useMaterialReactTable({
    ...tableOptions,
    muiTablePaperProps: {
      elevation: 0,
      sx: {
        borderRadius: "var(--radius-lg)",
        border: bordered === false ? "none" : "1px solid var(--color-border-secondary)",
        boxShadow: "var(--shadow-sm)",
        background: "var(--color-bg)",
        overflow: "hidden",
        ...(muiTablePaperProps?.sx || {}),
      },
      ...muiTablePaperProps,
    },
    muiTableContainerProps: {
      sx: { maxHeight: enableStickyHeader ? "70vh" : undefined, ...(muiTableContainerProps?.sx || {}) },
      ...muiTableContainerProps,
    },
    muiTableHeadCellProps: {
      sx: {
        background: "var(--color-bg-subtle)",
        color: "var(--color-text-secondary)",
        fontWeight: 600,
        fontSize: 13,
        borderBottom: "1px solid var(--color-border-secondary)",
      },
    },
    muiTableBodyCellProps: {
      sx: {
        fontSize: 13,
        color: "var(--color-text)",
        borderBottom: "1px solid var(--color-border-secondary)",
      },
    },
    muiTableBodyRowProps: resolvedRowProps,
    renderTopToolbarCustomActions: title || renderTopToolbarCustomActions
      ? (props) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {title && (
              <Typography
                component="h2"
                sx={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "text.primary",
                  m: 0,
                  pl: 0.5,
                }}
              >
                {title}
              </Typography>
            )}
            {typeof renderTopToolbarCustomActions === "function" &&
              renderTopToolbarCustomActions(props)}
          </Box>
        )
      : undefined,
    renderEmptyRowsFallback: renderEmptyRowsFallback
      ? renderEmptyRowsFallback
      : () => (
          <Box sx={{ p: 4 }}>
            <EmptyState
              size="sm"
              title={(locale && locale.emptyText) || (emptyState && emptyState.title) || "No records to show"}
              description={
                (emptyState && emptyState.description) ||
                "Try changing your filters or search."
              }
              icon={emptyState && emptyState.icon}
              action={emptyState && emptyState.action}
            />
          </Box>
        ),
    localization: {
      noRecordsToDisplay: (locale && locale.emptyText) || "No records to show",
    },
    ...rest,
  });

  if (ref) {
    if (typeof ref === "function") ref(table);
    else ref.current = table;
  }

  return <MaterialReactTable table={table} />;
});

export default DataTableInner;
