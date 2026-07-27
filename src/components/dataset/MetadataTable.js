import { useState } from "react";
import { DataTable } from "../../design-system";

const MetadataTable = () => {
  const [tblData] = useState([]);

  const columns = [
    { accessorKey: "attributeschemaname", header: "Attribute Schema Name" },
    { accessorKey: "attributetablename", header: "Attribute Table Name" },
    { accessorKey: "attributename", header: "Attribute Name" },
    { accessorKey: "datatype", header: "Data Type" },
    { accessorKey: "datalength", header: "Data Length" },
    { accessorKey: "parenttablename", header: "Parent Table Name" },
    { accessorKey: "tablerank", header: "Table Rank" },
  ];

  return (
    <DataTable
      columns={columns}
      data={tblData}
      enableRowSelection
      rowKey={(record, i) => i}
    />
  );
};

export default MetadataTable;
