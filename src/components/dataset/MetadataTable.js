import { useEffect, useState } from "react";
import { Table } from "antd";
import { metaTabTableData } from "../../store/services/ContractService";

const MetadataTable = (props) => {
  const [tblData, setTblData] = useState([]);
  const COLUMNS = [
    {
      title: "Attribute Schema Name",
      dataIndex: "attributeschemaname",
    },
    {
      title: "Attribute Table Name",
      dataIndex: "attributetablename",
    },
    {
      title: "Attribute Name",
      dataIndex: "attributename",
    },
    {
      title: "Data Type",
      dataIndex: "datatype",
    },
    {
      title: "Data Length",
      dataIndex: "datalength",
    },
    {
      title: "Parent Table Name",
      dataIndex: "parenttablename",
    },
    {
      title: "Table Rank",
      dataIndex: "tablerank",
    },
  ];
  

  return (
    <Table
      rowSelection={{
        type: "checkbox",
        onChange: (selectedRowKeys, selectedRows) => {},
      }}
      size="middle"
      pagination={true}
      columns={COLUMNS}
      dataSource={tblData}
      rowKey={(record, i) => i}
    />
  );
};

export default MetadataTable;