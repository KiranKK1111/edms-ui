/*Lib imports begin*/
import { useState, useEffect } from "react";
import { HomeOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, PageHeader, Modal, Table } from "antd";

/*css imports*/
/*antD library imports begin*/
import "antd/dist/antd.css";
import React from "react";
import { Link, useHistory } from "react-router-dom";
/*css imports*/
import "./NewVendorHead.css";
import { useParams } from "react-router-dom";
import { auditlogVendorOverview } from "../../../store/services/ContractService";

const NewVendorHead = (props) => {
  const [visible, setVisible] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [columns, setColumns] = useState([]);
  const [btnDisable, setBtnDisable] = useState(false);
  const history = useHistory();
  const params = useParams();
  const navigateToAddContract = () => {
    history.push("addContract");
  };
  const cancelHandler = () => {
    history.push("/masterData");
  };

  return (
    <div className="header-one">
      <Modal
        title="Audit Log"
        centered
        visible={visible}
        onOk={() => setVisible(false)}
        onCancel={() => setVisible(false)}
        width={1200}
      >
        <Table
          dataSource={dataSource}
          columns={columns}
          pagination={false}
          size="middle"
          scroll={{
            y: 500,
            x: 1800,
          }}
        />
      </Modal>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "2px",
        }}
      >
        <Breadcrumb style={{ margin: "16px 0" }}>
          <Breadcrumb.Item>
            <Link to="/catalog">
              <HomeOutlined />
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            {" "}
            <Link to="/masterData">Entities </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            {" "}
            {params.id ? "Edit entity" : "Add entity"}{" "}
          </Breadcrumb.Item>
        </Breadcrumb>
        <div>
          <Button type="default" onClick={() => cancelHandler()}>
            Cancel
          </Button>
          <Button
            onClick={props.handleSubmitSuccess}
            type="primary"
            style={{ margin: "11px 5px" }}
            disabled={props.activeSubmit || props.isSubmitted}
          >
            Submit
          </Button>
        </div>
      </div>
      <div>
        <PageHeader
          title={params.id ? "Edit Entity" : "Add Entity"}
          ghost={false}
          onBack={() => history.push("/masterData")}
          className="pt-10 pb-0  home-page"
        ></PageHeader>
      </div>
    </div>
  );
};

export default NewVendorHead;