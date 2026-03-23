import { Table, Tag } from "antd";
import moment from "moment";

const LSTable = ({ tblData }) => {
  const columns = [
    {
      title: "Data Feed",
      dataIndex: "shortName",
      key: "shortName",
    },
    {
      title: "Dataset",
      dataIndex: "dataSetShortName",
      key: "dataSetShortName",
    },
    {
      title: <b>Status</b>,
      dataIndex: "isEnabled",
      key: "isEnabled",
      render: (isEnabled) => (
        <Tag
          color={
            isEnabled ? "green" : isEnabled === false ? "orange" : "default"
          }
        >
          {isEnabled ? "Active" : isEnabled === false ? "Inactive" : "NA"}
        </Tag>
      ),
    },
    {
      title: "Start date",
      dataIndex: "start",
      key: "start",
      render: (start) => start && moment(start).format("DD MMM YYYY"),
    },
  ];
  return (
    <Table
      columns={columns}
      rowKey={(record) => record.feedId}
      expandable={{
        expandedRowRender: (record) => (
          <p
            style={{
              margin: 0,
            }}
          >
            {record.feedDescription}
          </p>
        ),
      }}
      dataSource={tblData}
    />
  );
};

export default LSTable;