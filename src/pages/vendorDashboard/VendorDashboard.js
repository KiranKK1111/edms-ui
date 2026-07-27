//__________Lib imports begin_____________
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

//__________ component imports begin__________
import VendorData from "../masterData/VendorData";
import {
  startGetVendors,
  startDeleteVendor,
} from "../../store/actions/VendorActions";
import { startGetContracts } from "../../store/actions/contractAction";
import { startGetLicenses } from "../../store/actions/licenseAction";

//___________CSS imports_______________
import "./VendorDashboard.css";

//_____________MUI + design-system imports begin_____________
import { SideNav, EmptyState, ActionsMenu } from "../../design-system";
import imperativeConfirm from "../../design-system/imperativeConfirm";
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Divider,
  Typography,
} from "@mui/material";
import {
  Edit as EditOutlined,
  Delete as DeleteOutlined,
  Home as HomeOutlined,
  ArrowBack as ArrowLeftOutlined,
} from "@mui/icons-material";

//_________________ VendorDashboard ___________________________________________________
const VendorDashboard = (props) => {
  const [vendorID, setVendorId] = useState(0);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const dispatch = useDispatch();

  let VendorDeleteMessage = "";
  let numOfContracts = 0;
  let vendorDetails = {};
  let fixingVendorKey = sessionStorage.getItem("dashKey")
    ? sessionStorage.getItem("dashKey")
    : 0;

  //*FETCHING ALL VENDOR RECORDS (Fixing Vendor Key for Persistence on page refresh )
  useEffect(() => {
    let mounted = true;
    const getData = async () => {
      const resp = await props.dispatch(startGetVendors());
    };
    getData().then((response) => {
      if (!mounted) return;
      if (vendorID === 0) {
        if (Number(fixingVendorKey) === 0 && props.vendors.length > 0) {
          setVendorId(props.vendors[0].entityId);
        } else {
          setVendorId(sessionStorage.getItem("vendorid"));
        }
      }
    });
    return () => {
      mounted = false;
    };
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
    imperativeConfirm({
      title: "Delete Vendor ?",
      content: VendorDeleteMessage,
      okText: "Delete",
      okColor: "error",
    }).then((ok) => {
      if (ok) {
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
      }
    });
  };

  //"MANAGE BUTTON" ON VENDOR DETAILS
  const manageVendorMenu = (Data) => [
    {
      key: "edit",
      icon: <EditOutlined fontSize="small" />,
      to: `/vendorDashboard/modifyVendor/${Data.vendorId}`,
      label: <b>Edit</b>,
    },
    {
      key: "delete",
      icon: <DeleteOutlined fontSize="small" />,
      danger: true,
      onClick: () => handleDeleteVendor(Data),
      label: <b>Delete</b>,
    },
  ];

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
      <Box className="dashboard-page">
        <Box className="dashboard-header">
          <div className="dashboard-header-line1">
            <Breadcrumbs
              className="dashboard-header-link"
              separator="/"
              aria-label="breadcrumb"
            >
              <Link
                to="/catalog"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  color: "inherit",
                }}
              >
                <HomeOutlined fontSize="small" />
              </Link>
              <Typography component="span">VendorDashboard</Typography>
            </Breadcrumbs>

            <Button
              className="dashboard-header-button"
              variant="contained"
              component={Link}
              to="/vendorDashboard/addVendor"
            >
              + Add entity
            </Button>
          </div>

          <div className="dashboard-header-title">
            <h2>
              <Link to="/catalog">
                <ArrowLeftOutlined
                  fontSize="small"
                  style={{ color: "var(--color-text)" }}
                />{" "}
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
        </Box>

        <Box className="dashboard-content">
          <Box className="dashboard-content-title">
            <h2>
              <b> All Vendors </b>
            </h2>
            <Divider />
          </Box>

          {/*SIDER DISPLAYED ON DASHBOARD */}
          {vendorDetails ? (
            <Box className="dashboard-vendors">
              <Box
                className="dashboard-vendors-sider"
                sx={{
                  width: 216,
                  height: "100%",
                  left: 0,
                  overflow: "auto",
                  position: "relative",
                }}
              >
                <SideNav
                  defaultSelectedKey={
                    fixingVendorKey ? `${fixingVendorKey}` : "0"
                  }
                  items={
                    props.vendors
                      ? props.vendors.map((ele, i) => ({
                          key: i,
                          label: ele.shortName,
                          onClick: () => handleVendorClick(ele.entityId, i),
                        }))
                      : []
                  }
                />
              </Box>

              {/*VENDOR DETAILS DISPLAYED ON DASHBOARD */}
              <Box className="dashboard-vendors-data">
                {vendorDetails &&
                  vendorDetails.entityStatus &&
                  vendorDetails.entityStatus.toLowerCase() === "pending" &&
                  !alertDismissed && (
                    <Alert
                      className="dashboard-vendors-alert"
                      severity="warning"
                      onClose={() => setAlertDismissed(true)}
                    >
                      This vendor has been submitted for review. You will be
                      able to add contracts and licences once the vendor is
                      approved. See "Status" below for details.
                    </Alert>
                  )}

                <Box className="dashboard-vendors-descriptions">
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Typography component="h4" sx={{ fontWeight: 600, m: 0 }}>
                      Entity Details
                    </Typography>
                    <ActionsMenu
                      label="Manage"
                      disabled={disableManage}
                      items={manageVendorMenu({
                        vendorId: vendorDetails.entityId,
                        name: vendorDetails.longName,
                        taskStatus: vendorDetails.entityStatus,
                      })}
                    />
                  </Box>

                  <p>
                    <b>Entity ID</b> : {vendorDetails.entityId}
                  </p>
                  <p>
                    <b>Long Name</b> : {vendorDetails.longName}
                  </p>
                  <p>
                    <b>Short Name</b> : {vendorDetails.shortName}
                  </p>
                  <p>
                    <b>Entity Type</b> : {vendorDetails.entityType}
                  </p>
                  <p>
                    <b>Website</b> :{" "}
                    <a
                      href={`http://${vendorDetails.website}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {vendorDetails.website}
                    </a>
                  </p>
                  <p>
                    <b>Status</b> :{" "}
                    {vendorDetails &&
                      vendorDetails.entityStatus &&
                      (vendorDetails.entityStatus.toLowerCase() === "active" ? (
                        <Chip
                          className="style-badge"
                          size="small"
                          color="success"
                          variant="outlined"
                          label="Active"
                        />
                      ) : (
                        <Chip
                          className="style-badge"
                          size="small"
                          color="warning"
                          variant="outlined"
                          label={vendorDetails.entityStatus}
                        />
                      ))}
                  </p>
                  <p>{vendorDetails.entityDescription} </p>
                </Box>

                {/*CONTRACT & LICENSES */}
                <div className="dashboard-contract-table-heading">
                  <div className="dashboard-contract-table-line1">
                    <h4>
                      <b>Contract & Licences </b>
                    </h4>
                    <Button
                      className="dashboard-add-contract-button"
                      variant="contained"
                      disabled={disableAddContract}
                      component={Link}
                      to={`/vendorDashboard/${vendorDetails.vendorId}/addContract`}
                    >
                      + Add Contract
                    </Button>
                  </div>
                </div>

                {/* CALLING VENDOR DATA COMPONENT FOR DISPLAYING CONTRACT & LICENSES USING EXPANDABLE TABLE */}
                <Box className="dash-dash-dash">
                  <Box className="dashboard-vendors-contracts">
                    {props.contracts ? (
                      props.contracts.length > 0 ? (
                        <VendorData
                          className="dashboard-data-table"
                          vendorId={vendorID}
                          disableAllButtons={disableAll}
                        />
                      ) : (
                        <Box className="dashboard-vendors-contracts-empty">
                          <h2> No contracts</h2>
                        </Box>
                      )
                    ) : (
                      <Box>
                        {" "}
                        {/*NO CONTRACTS FOR THE VENDOR CLICKED*/}
                        <Box className="dashboard-contracts-empty-page">
                          <EmptyState
                            title=""
                            description="There are no contracts for this vendor"
                            action={
                              vendorDetails &&
                              vendorDetails.taskStatus &&
                              vendorDetails.taskStatus.toLowerCase() ===
                                "approved" ? (
                                <Button
                                  variant="contained"
                                  component={Link}
                                  to={`/vendorDashboard/${vendorDetails.vendorId}/addContract`}
                                >
                                  + Add Contract
                                </Button>
                              ) : (
                                <Button variant="contained" disabled>
                                  {" "}
                                  + Add Contract{" "}
                                </Button>
                              )
                            }
                          />
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          ) : (
            <Box>
              {" "}
              {/*NO VENDORS IN DATABASE*/}
              <Box className="dashboard-vendors-empty-page">
                <EmptyState
                  title=""
                  description="There are no active vendors"
                  action={
                    <Button
                      variant="contained"
                      component={Link}
                      to="/vendorDashboard/addVendor"
                    >
                      + Add entity
                    </Button>
                  }
                />
              </Box>
            </Box>
          )}
        </Box>
      </Box>
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
