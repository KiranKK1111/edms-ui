import { Box, Chip } from "@mui/material";
import dayjs from "dayjs";

import { DataTable } from "../../design-system";

const StatusChip = ({ value }) => (
  <Chip
    size="small"
    color={value ? "success" : value === false ? "warning" : "default"}
    variant="outlined"
    label={value ? "Active" : value === false ? "Inactive" : "NA"}
  />
);

const LSTable = ({ tblData }) => {
  const columns = [
    { accessorKey: "shortName", header: "Data Feed" },
    { accessorKey: "dataSetShortName", header: "Dataset" },
    {
      accessorKey: "isEnabled",
      header: "Status",
      Cell: ({ cell }) => <StatusChip value={cell.getValue()} />,
    },
    {
      accessorKey: "start",
      header: "Start date",
      Cell: ({ cell }) => {
        const v = cell.getValue();
        return v ? dayjs(v).format("DD MMM YYYY") : "";
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={tblData || []}
      rowKey="feedId"
      enableExpanding
      renderDetailPanel={({ row }) => (
        <Box sx={{ m: 0 }}>{row.original.feedDescription}</Box>
      )}
    />
  );
};

export default LSTable;
