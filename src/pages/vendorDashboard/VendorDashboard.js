//__________Lib imports begin_____________
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

//__________ component imports begin__________
import Headers from "../../pages/header/Header";
import VendorData from "./VendorData";
import {
  startGetVendors,
  startDeleteVendor,
} from "../../store/actions/VendorActions";
import { startGetContracts } from "../../store/actions/contractAction";
import { startGetLicenses } from "../../store/actions/licenseAction";

//___________CSS imports_______________
import "./VendorDashboard.css";

//_____________AntD library imports begin_____________
import "antd/dist/antd.css";
import {
  Menu,
  Badge,
  Alert,
  Empty,
  Dropdown,
  Modal,
  Layout,
  Breadcrumb,
  Button,
  Divider,
  Descriptions,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  HomeOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
const { Sider, Content, Header } = Layout;

//_________________ VendorDashboard ___________________________________________________
const VendorDashboard = (props) => {
  const [vendorID, setVendorId] = useState(0);
  const dispatch = useDispatch();

  let VendorDeleteMessage = "";
  let numOfContracts = 0;
  let vendorDetails = {};
  let fixingVendorKey = sessionStorage.getItem("dashKey")
    ? sessionStorage.getItem("dashKey")
    : 0;

  //*FETCHING ALL VENDOR RECORDS (Fixing Vendor Key for Persistence on page refresh )
  useEffect(() => {
    const getData = async () => {
      const resp = await props.dispatch(startGetVendors());
    };
    getData().then((response) => {
      if (vendorID === 0) {
        if (Number(fixingVendorKey) === 0 && props.vendors.length > 0) {
          setVendorId(props.vendors[0].entityId);
        } else {
          setVendorId(sessionStorage.getItem("vendorid"));
        }
      }
    });
  }, [props.vendors.length]);

  //*FETCHING ALL CONTRACTS
  useEffect(() => {
    const response = dispatch(startGetContracts());
    return response;
  }, []);

  //*FETCHING ALL LICENSES
  useEffect(() => {
    dispatch(startGetLicenses());
  }, []);

  //SETTING VENDOR ID FOR SIDER
  if (props.vendors) {
    vendorDetails = props.vendors.find((ele) => ele.entityId === vendorID);
  }

  //VENDORDETAILS FOR DASHBOARD PAGE
  if (props.vendors.length > 0 && !vendorDetails) {
    const paramID = props.vendors[0].vendorId;
    vendorDetails = props.vendors.find((ele) => ele.entityId === paramID);
  }

  numOfContracts = props.contracts
    ? props.contracts.filter((ele) => ele.vendorId === vendorID).length
    : 0;

  //SETTING NESTED TABLE KEYS ON VENDOR RECORD CLICK
  const handleVendorClick = (paramId, i) => {
    sessionStorage.setItem("dashKey", [`${i}`]);
    sessionStorage.setItem("vendorid", paramId);
    setVendorId(paramId);
  };

  //DELETE VENDOR BUTTON
  const handleDeleteVendor = (Data) => {
    let dataObj = { ...Data };
    dataObj["createdBy"] = localStorage.getItem("psid");
    if (numOfContracts > 0) {
      VendorDeleteMessage = `You cannot complete this action until all contracts and
        licences associated with this vendor are removed.`;
    } else {
      VendorDeleteMessage = `Your request to Delete Vendor will be submitted for approval.
        Do you want to proceed ?`;
    }
    Modal.confirm({
      title: (
        <h3>
          <b>Delete Vendor ? </b>{" "}
        </h3>
      ),
      content: VendorDeleteMessage,
      okText: "Delete",
      okType: "danger",
      onOk() {
        if (numOfContracts === 0) {
          dispatch(startDeleteVendor(dataObj))
            .then(() => {
              sessionStorage.removeItem("vendorid");
              sessionStorage.removeItem("dashkey");
              return Data;
            })
            .catch((error) => {
              return error;
            });
        }
      },
    });
  };

  //"MANAGE BUTTON" ON VENDOR DETAILS
  const manageVendorMenu = (Data) => {
    const manageMenu = (
      <Menu className="more-vendor-menu">
        <Menu.Item className="edit-vendor-menu">
          <EditOutlined />
          <Link to={`/vendorDashboard/modifyVendor/${Data.vendorId}`}>
            {" "}
            <b>Edit</b>{" "}
          </Link>
        </Menu.Item>
        <Menu.Item
          className="warn-vendor-menu"
          onClick={() => handleDeleteVendor(Data)}
        >
          <span>
            <DeleteOutlined /> <b>Delete</b>
          </span>
        </Menu.Item>
      </Menu>
    );
    return manageMenu;
  };

  //ENABLING & DISABLING OF BUTTONS ON VENDOR DASHBOARD
  let disableAddContract = false;
  let disableManage = false;
  let disableAll = false;

  if (vendorDetails) {
    let venStatus =
      vendorDetails && vendorDetails.taskStatus
        ? vendorDetails.taskStatus.toLowerCase()
        : "";

    if (venStatus === "approved") {
      disableAddContract = false;
      disableManage = false;
    }
    if (venStatus === "pending") {
      disableAddContract = true;
      disableManage = true;
      disableAll = true;
    }
    if (venStatus === "rejected") {
      disableAddContract = true;
      disableManage = false;
      disableAll = true;
    }
  }

  return (
    <div className="dashboard-main">
      <Headers />

      <Layout className="dashboard-page">
        <Header className="dashboard-header">
          <div className="dashboard-header-line1">
            <Breadcrumb className="dashboard-header-link">
              <Breadcrumb.Item>
                <Link to="/catalog">
                  {" "}
                  <HomeOutlined />{" "}
                </Link>{" "}
              </Breadcrumb.Item>
              <Breadcrumb.Item> VendorDashboard</Breadcrumb.Item>
            </Breadcrumb>

            <Button className="dashboard-header-button" type="primary">
              <Link to="/vendorDashboard/addVendor"> + Add entity </Link>
            </Button>
          </div>

          <div className="dashboard-header-title">
            <h2>
              <Link to="/catalog">
                <ArrowLeftOutlined size="small" style={{ color: "black" }} />{" "}
              </Link>{" "}
              <b> Vendors </b>
            </h2>
            <p>
              {" "}
              On your vendor dashboard, you can see the vendors, contracts and
              licences under your management. Additionally, add any newly
              onboarded contracts here for users to access its datasets.{" "}
            </p>
          </div>
        </Header>

        <Layout className="dashboard-content">
          <Header className="dashboard-content-title">
            <h2>
              <b> All Vendors </b>
            </h2>
            <Divider />
          </Header>

          {/*SIDER DISPLAYED ON DASHBOARD */}
          {vendorDetails ? (
            <Layout className="dashboard-vendors">
              <Sider
                className="dashboard-vendors-sider"
                width={216}
                style={{
                  height: "100%",
                  left: 0,
                  overflow: "auto",
                  position: "relative",
                }}
              >
                <Menu
                  mode="inline"
                  defaultSelectedKeys={
                    fixingVendorKey ? [`${fixingVendorKey}`] : ["0"]
                  }
                  style={{ height: "auto" }}
                >
                  {props.vendors &&
                    props.vendors.map((ele, i) => {
                      return (
                        <Menu.Item
                          key={i}
                          onClick={() => {
                            handleVendorClick(ele.entityId, i);
                          }}
                        >
                          {ele.shortName}
                        </Menu.Item>
                      );
                    })}
                </Menu>
              </Sider>

              {/*VENDOR DETAILS DISPLAYED ON DASHBOARD */}
              <Content className="dashboard-vendors-data">
                {vendorDetails &&
                  vendorDetails.entityStatus &&
                  vendorDetails.entityStatus.toLowerCase() === "pending" && (
                    <Alert
                      className="dashboard-vendors-alert"
                      message='This vendor has been submitted for review.
                         You will be able to add contracts and licences once the vendor is approved.
                         See "Status" below for details.'
                      type="warning"
                      showIcon
                      closable
                    />
                  )}

                <Descriptions
                  className="dashboard-vendors-descriptions"
                  size="small"
                  title="Entity Details"
                  extra={
                    <Dropdown.Button
                      overlay={() => {
                        const Data = {
                          vendorId: vendorDetails.entityId,
                          name: vendorDetails.longName,
                          taskStatus: vendorDetails.entityStatus,
                        };
                        return manageVendorMenu(Data);
                      }}
                      disabled={disableManage}
                    >
                      <b>Manage</b>
                    </Dropdown.Button>
                  }
                >
                  <Descriptions.Item label={<b>Entity ID</b>}>
                    {vendorDetails.entityId}
                  </Descriptions.Item>

                  <Descriptions.Item label={<b>Long Name</b>}>
                    {vendorDetails.longName}
                  </Descriptions.Item>

                  <Descriptions.Item label={<b>Short Name</b>}>
                    {vendorDetails.shortName}
                  </Descriptions.Item>

                  <Descriptions.Item label={<b>Entity Type</b>}>
                    {vendorDetails.entityType}
                  </Descriptions.Item>

                  <Descriptions.Item label={<b>Website</b>}>
                    <a href={`http://${vendorDetails.website}`} target="_blank">
                       {vendorDetails.website} 
                    </a>
                  </Descriptions.Item>

                  <Descriptions.Item label={<b>Status</b>}>
                    {vendorDetails &&
                      vendorDetails.entityStatus &&
                      (vendorDetails.entityStatus.toLowerCase() === "active" ? (
                        <Badge
                          className="style-badge"
                          status="success"
                          text="Active"
                        />
                      ) : (
                        <Badge
                          className="style-badge"
                          status="warning"
                          text={vendorDetails.entityStatus}
                        />
                      ))}
                  </Descriptions.Item>

                  <Descriptions.Item>
                    {vendorDetails.entityDescription}{" "}
                  </Descriptions.Item>
                </Descriptions>

                {/*CONTRACT & LICENSES */}
                <div className="dashboard-contract-table-heading">
                  <div className="dashboard-contract-table-line1">
                    <h4>
                      <b>Contract & Licences </b>
                    </h4>
                    <Button
                      className="dashboard-add-contract-button"
                      type="primary"
                      disabled={disableAddContract}
                    >
                      <Link
                        to={`/vendorDashboard/${vendorDetails.vendorId}/addContract`}
                      >
                        + Add Contract
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* CALLING VENDOR DATA COMPONENT FOR DISPLAYING CONTRACT & LICENSES USING EXPANDABLE TABLE */}
                <Layout className="dash-dash-dash">
                  <Content className="dashboard-vendors-contracts">
                    {props.contracts ? (
                      props.contracts.length > 0 ? (
                        <VendorData
                          className="dashboard-data-table"
                          vendorId={vendorID}
                          disableAllButtons={disableAll}
                        />
                      ) : (
                        <Content className="dashboard-vendors-contracts-empty">
                          <h2> No contracts</h2>
                        </Content>
                      )
                    ) : (
                      <Layout>
                        {" "}
                        {/*NO CONTRACTS FOR THE VENDOR CLICKED*/}
                        <Content className="dashboard-contracts-empty-page">
                          <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            imageStyle={{
                              height: 60,
                            }}
                            description={
                              <span>
                                There are no contracts for this vendor
                              </span>
                            }
                          >
                            {vendorDetails &&
                            vendorDetails.taskStatus &&
                            vendorDetails.taskStatus.toLowerCase() ===
                              "approved" ? (
                              <Button type="primary">
                                <Link
                                  to={`/vendorDashboard/${vendorDetails.vendorId}/addContract`}
                                >
                                  + Add Contract
                                </Link>
                              </Button>
                            ) : (
                              <Button type="primary" disabled>
                                {" "}
                                + Add Contract{" "}
                              </Button>
                            )}
                          </Empty>
                          ,
                        </Content>
                      </Layout>
                    )}
                  </Content>
                </Layout>
              </Content>
            </Layout>
          ) : (
            <Layout>
              {" "}
              {/*NO VENDORS IN DATABASE*/}
              <Content className="dashboard-vendors-empty-page">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  imageStyle={{
                    height: 60,
                  }}
                  description={<span>There are no active vendors</span>}
                >
                  <Button type="primary">
                    <Link to="/vendorDashboard/addVendor">+ Add entity</Link>
                  </Button>
                </Empty>
                ,
              </Content>
            </Layout>
          )}
        </Layout>
      </Layout>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    contracts: state.contract.data[0],
    licenses: state.license.data,
    vendors: state.vendor.list,
  };
};

export default connect(mapStateToProps)(VendorDashboard);