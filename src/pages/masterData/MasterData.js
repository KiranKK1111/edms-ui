//__________Lib imports begin_____________
import React, { useState, useEffect, memo } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

//__________ component imports begin__________
import Headers from "../header/Header";
import VendorData from "./VendorData";
import DataSetData from "./DataSetData";
import {
  startGetVendors,
  startUpdateEntity,
} from "../../store/actions/VendorActions";
import { startGetContracts } from "../../store/actions/contractAction";
import { startGetLicenses } from "../../store/actions/licenseAction";
import { startGetDatasets } from "../../store/actions/DatasetPageActions";
import { startGetDatafeeds } from "../../store/actions/datafeedAction";

//___________CSS imports_______________
import "./VendorDashboard.css";

//_____________AntD library imports begin_____________
import "antd/dist/antd.css";
import { Tabs, Col, Spin } from "antd";
import {
  Menu,
  Badge,
  Alert,
  Empty,
  Dropdown,
  Modal,
  Layout,
  Button,
  Divider,
  Descriptions,
  Input,
  message,
  Radio,
} from "antd";
import {
  EditOutlined,
  SearchOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import { resetState } from "../../store/actions/contractAction";
import isAcessMasterDataDisabled from "../../utils/accessMasterData";
import isButtonObject from "../../utils/accessButtonCheck";
import {
  MASTERDATA_MANAGEMENT_ENTITY_BTN,
  MASTERDATA_MANAGEMENT_PAGE,
  MASTERDATA_ENTITY_EDIT_DEACTIVATE_BTN,
  MASTERDATA_AGREMENT_PAGE_AND_BUTTON,
} from "../../utils/Constants";
import { warning } from "../../utils/warningUtils";

const { Sider, Content, Header } = Layout;
const { TabPane } = Tabs;
//_________________ VendorDashboard ___________________________________________________
const MasterData = (props) => {
  const [vendorID, setVendorId] = useState(0);
  const dispatch = useDispatch();
  const datasetsInfo = useSelector(
    (infoState) => infoState.dataset.datasetsInfo
  );
  const datafeedsInfo = useSelector(
    (infoState) => infoState.datafeedInfo.datafeedsData
  );

  const contractInfo = useSelector(
    (infoState) => infoState && infoState.contract && infoState.contract.data
  );

  const state = useSelector(
    (infoState) => infoState
  );

  const [buttonShow, setButtonShow] = useState(true);
  const [entitySiderType, setEntitySiderType] = useState("activeAndPending");
  const [loading, setLoading] = useState(false);
  const [filterEntityList, setFilterEntityList] = useState([]);
  const [outerEntityList, setOuterEntityList] = useState([]);

  const isMasterDataDisabled = isAcessMasterDataDisabled();
  const isAddEntity = isButtonObject(
    MASTERDATA_MANAGEMENT_PAGE,
    MASTERDATA_MANAGEMENT_ENTITY_BTN
  );

  const isEditDeactivateEntity = isButtonObject(
    MASTERDATA_MANAGEMENT_PAGE,
    MASTERDATA_ENTITY_EDIT_DEACTIVATE_BTN
  );
  let agreementList = state && state.contract && state.contract.data[0];

  const masterDataMgmt = (dispEntity) => {
    return (
      <Header className="dashboard-header">
        <div className="dashboard-header-line1">
          <h1 className="mainHeader">
            Master Data Management
            <Badge
              color="#52c41a"
              style={{ verticalAlign: "-webkit-baseline-middle", left: "0.9%" }}
            />
          </h1>
          {dispEntity && dispEntity === true ? (
            <Button
              className="dashboard-header-button"
              type="primary"
              disabled={isAddEntity}
            >
              <Link to="/masterData/addEntity"> + Add entity </Link>
            </Button>
          ) : (
            " "
          )}
        </div>
      </Header>
    );
  };

  let vendorDetails = {};
  let fixingVendorKey = sessionStorage.getItem("dashKey")
    ? sessionStorage.getItem("dashKey")
    : 0;

  const getData = () => {
    let result = dispatch(startGetVendors(true));
    return result;
  };

  //Clear agreement fields & other fields
  useEffect(() => {
    dispatch(resetState());
  }, []);

  //*FETCHING ALL VENDOR RECORDS (Fixing Vendor Key for Persistence on page refresh );
  useEffect(() => {
    setLoading(true);

    //*FETCHING ALL CONTRACTS
    dispatch(startGetContracts());

    //*FETCHING ALL Datasets
    dispatch(startGetDatasets());

    //*FETCHING ALL Datafeeds
    dispatch(startGetDatafeeds());

    //*FETCHING ALL LICENSES
    dispatch(startGetLicenses());
    getData().then((res) => {
      if (res.status === 200) {
        if (vendorID === 0) {
          if (Number(fixingVendorKey) === 0 && res.data.entityManagementList.length > 0) {
            setVendorId(res.data.entityManagementList[0].entityId);
            setLoading(false);
          } else {
            setVendorId(sessionStorage.getItem("vendorid"));
            setLoading(false);
          }
        }
        let entList = [];
        entList = res.data.entityManagementList.filter((el) => {
          return (
            el.entityStatus.toLowerCase() === "active" ||
            el.entityStatus.toLowerCase() === "pending"
          );
        });
        setFilterEntityList(entList);
        setOuterEntityList(res.data.entityManagementList);
      }
    });
  }, []);

  //SETTING VENDOR ID FOR SIDER
  if (state && state.vendor && state.vendor.list && state.vendor.list.length > 0) {
    vendorDetails = state.vendor.list.find((ele) => ele.entityId === vendorID);
  }

  useEffect(() => {
    if (state && state.vendor && state.vendor.list && state.vendor.list.length > 0) {
      vendorDetails = state.vendor.list.find((ele) => ele.entityId === vendorID);
    }
  }, [state.vendors]);

  //VENDORDETAILS FOR DASHBOARD PAGE
  if (state && state.vendor && state.vendor.list && state.vendor.list.length > 0 && !vendorDetails) {
    const paramID = state.vendor.list[0].vendorId;
    vendorDetails = state.vendor.list.find((ele) => ele.entityId === paramID);
  }

  function renderEntityUrl(entityUrl) {
    return (entityUrl && entityUrl.includes("http://")) ||
      (entityUrl && entityUrl.includes("https://"))
      ? entityUrl
      : entityUrl && entityUrl.trim().length > 0
        ? "https://" + entityUrl
        : entityUrl;
  }

  //SETTING NESTED TABLE KEYS ON VENDOR RECORD CLICK
  const handleVendorClick = (paramId, i) => {
    sessionStorage.setItem("dashKey", [`${i}`]);
    sessionStorage.setItem("vendorid", paramId);
    setVendorId(paramId);
  };

  //DEACTIVATE ENTITY BUTTON
  const handleDeleteVendor = (Data) => {
    let dataObj = { ...Data };
    let agreementListByEntity = agreementList.filter((id) => {
      return dataObj.entityId === id.agreementEdmsEntiryId;
    });
    let agreementStatusArr = agreementListByEntity.find((sub) => {
      return (
        sub.agreementStatus.toLowerCase() === "active" ||
        sub.agreementStatus.toLowerCase() === "pending"
      );
    });
    if (agreementStatusArr && agreementListByEntity.length > 0) {
      Modal.confirm({
        title: (
          <h3>
            <b>Unable to Deactivate Entity! </b>{" "}
          </h3>
        ),
        content: `Status of Agreements(s) under this Entity is still active.`,
        okButtonProps: { style: { display: "none" } },
        cancelText: "Ok",
      });
    } else {
      Modal.confirm({
        title: (
          <h3>
            <b>Deactivate Entity ? </b>{" "}
          </h3>
        ),
        content: "Are you sure you want to proceed?",
        okText: "Deactivate",
        okButtonProps: { style: { backgroundColor: "#FF4C4F", border: 0 } },
        onOk: async () => {
          dataObj.entityStatus = "Deactivate";
          dataObj.entityUpdateFlag = "Y";
          dataObj.lastUpdatedBy = localStorage.getItem("psid");
          const res = await startUpdateEntity(dataObj);
          if (res && res.data) {
            message.success(
              "Entity deactivation request submitted successfully."
            );
          }
          dispatch(startGetVendors(false));
        },
      });
    }
  };

  const checkEntityUpdateFlag = (Data, flag) => {
    let returnCheck = false;
    if (Data !== null && Data.entityUpdateFlag !== null && flag === "N") {
      returnCheck =
        Data.entityUpdateFlag.toString().toLowerCase() === "n" ? true : false;
    } else if (
      Data !== null &&
      Data.entityUpdateFlag !== null &&
      flag === "Y"
    ) {
      returnCheck =
        Data.entityUpdateFlag.toString().toLowerCase() === "y" &&
          (Data.entityStatus.toLowerCase() === "pending" ||
            Data.entityStatus.toLowerCase() === "active")
          ? true
          : false;
    }
    return returnCheck;
  };

  //"MANAGE BUTTON" ON VENDOR DETAILS
  const manageVendorMenu = (Data) => {
    const manageMenu = (
      <Menu className="more-vendor-menu">
        <Menu.Item className="edit-vendor-menu">
          <EditOutlined />
          {checkEntityUpdateFlag(Data, "N") ? (
            <Link to={`/masterData/modifyEntity/${Data.entityId}`}>
              {" "}
              <b>Edit</b>{" "}
            </Link>
          ) : (
            <b onClick={warning}>Edit</b>
          )}
        </Menu.Item>
        {checkEntityUpdateFlag(Data, "Y") ? (
          <Menu.Item className="warn-vendor-menu" onClick={warning}>
            <span>
              <MinusCircleOutlined /> <b>Deactivate</b>
            </span>
          </Menu.Item>
        ) : (
          <Menu.Item
            className="warn-vendor-menu"
            onClick={() => handleDeleteVendor(Data)}
            disabled={
              (Data.entityStatus.toLowerCase() === "inactive" ? true : false) ||
              (Data.entityUpdateFlag.toString().toLowerCase() === "n" &&
                Data.entityStatus.toLowerCase() === "pending")
            }
          >
            <span>
              <MinusCircleOutlined /> <b>Deactivate</b>
            </span>
          </Menu.Item>
        )}
      </Menu>
    );
    return manageMenu;
  };

  //ENABLING & DISABLING OF BUTTONS ON VENDOR DASHBOARD
  let disableAddContract = false;
  let disableManage = false;
  let disableAll = false;

  if (vendorDetails) {
    const isAccess = !!isMasterDataDisabled;
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

  const isDisableManage = isEditDeactivateEntity || disableManage;

  const wordSearchHandler = (e) => {
    setEntitySiderType("all");
    if (e.target.value && e.target.value.length > 0) {
      let filterVendorsList = outerEntityList.filter(
        (element) =>
          element &&
          element.shortName &&
          element.shortName.toLowerCase().includes(e.target.value.toLowerCase())
      );
      if (filterVendorsList && filterVendorsList.length > 0) {
        setVendorId(filterVendorsList[0].entityId);
        setFilterEntityList(filterVendorsList);
      } else {
        setFilterEntityList([]);
      }
    } else if (e.target.value.length === 0) {
      setFilterEntityList(outerEntityList);
    }
  };

  const handleTabClick = (key) => {
    key === "1" ? setButtonShow(true) : setButtonShow(false);
  };

  function extraTabContent() {
    const isDisabled = !isButtonObject(
      MASTERDATA_MANAGEMENT_PAGE,
      MASTERDATA_AGREMENT_PAGE_AND_BUTTON
    );
    let agreementButtonDispFlag =
      isDisabled &&
        vendorDetails.entityStatus &&
        (vendorDetails.entityStatus.toLowerCase() === "active" ||
          vendorDetails.entityStatus.toLowerCase() === "planned")
        ? false
        : true;
    return buttonShow ? (
      <Button type="link" disabled={agreementButtonDispFlag}>
        <Link
          to={`/masterData/${vendorDetails.shortName}/addAgreement`}
          onClick={() =>
            localStorage.setItem("entityIdInfo", vendorDetails.entityId)
          }
        >
          + Add Agreement
        </Link>
      </Button>
    ) : (
      ""
    );
  }

  const handleEntitySiderType = (e) => {
    let entList = [];
    if (e && e.target.value === "activeAndPending") {
      entList = outerEntityList.filter(
        (el) =>
          el.entityStatus.toLowerCase() === "active" ||
          el.entityStatus.toLowerCase() === "pending"
      );
      setFilterEntityList(entList);
    } else if (e && e.target.value === "inactive") {
      entList = outerEntityList.filter(
        (el) => el.entityStatus.toLowerCase() === "inactive"
      );
      setFilterEntityList(entList);
    } else {
      entList = outerEntityList;
      setFilterEntityList(entList);
    }

    if (entList && entList.length > 0) {
      setVendorId(entList[0].entityId);
    }
    setEntitySiderType(e.target.value);
  };

  return loading !== undefined && loading === false ? (
    <div className="dashboard-main">
      <Headers />
      <Layout className="dashboard-page">
        {masterDataMgmt(true)}
        <Layout className="dashboard-content">
          <Header className="dashboard-content-title">
            <div className="dashboard-content-search">
              <Input
                name="Search entity"
                suffix={<SearchOutlined />}
                onChange={(e) => {
                  let InpValue = e.target.value;
                  InpValue = InpValue ? InpValue.toLowerCase() : InpValue;
                  const findVal = ["re", "reg"].includes(InpValue);
                  if (!findVal) {
                    wordSearchHandler(e);
                  }
                }}
                placeholder="Search entity"
                id="inp-search"
              />
            </div>
            <Divider />
          </Header>

          {/*SIDER DISPLAYED ON DASHBOARD */}
          {vendorDetails ? (
            <>
              <Layout className="dashboard-vendors">
                <div style={{ height: "100%" }}>
                  <Sider
                    className="dashboard-vendors-sider"
                    width={216}
                    style={{
                      height: "inherit",
                      left: 0,
                    }}
                  >
                    <Radio.Group
                      className="sider-radio-group"
                      value={entitySiderType}
                      onChange={handleEntitySiderType}
                    >
                      <Radio.Button
                        className="sider-radio"
                        value="activeAndPending"
                      >
                        Active & Pending
                      </Radio.Button>
                      <Radio.Button className="sider-radio" value="inactive">
                        Inactive
                      </Radio.Button>
                      <Radio.Button className="sider-radio" value="all">
                        All
                      </Radio.Button>
                    </Radio.Group>
                    <div
                      style={{
                        height: "100%",
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
                        {filterEntityList &&
                          filterEntityList.length > 0 &&
                          filterEntityList.map((ele, i) => {
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
                    </div>
                  </Sider>
                </div>
                {/*VENDOR DETAILS DISPLAYED ON DASHBOARD */}
                <Content className="dashboard-vendors-data">
                  {vendorDetails &&
                    vendorDetails.entityStatus &&
                    vendorDetails.entityStatus.toLowerCase() === "pending" && (
                      <Alert
                        className="dashboard-vendors-alert"
                        message="This Entity is currently under review. You will be able to add Agreements once the Entity is approved and the status is “Active” or “Planned”."
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
                          return manageVendorMenu(vendorDetails);
                        }}
                        disabled={isDisableManage}
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
                      <a
                        href={renderEntityUrl(
                          vendorDetails.website !== null
                            ? vendorDetails.website
                            : ""
                        )}
                        target="_blank"
                      >
                        {vendorDetails.website}
                      </a>
                    </Descriptions.Item>

                    <Descriptions.Item label={<b>Status</b>}>
                      {vendorDetails &&
                        vendorDetails.entityStatus &&
                        vendorDetails.entityStatus.toLowerCase() ===
                        "active" && (
                          <Badge
                            className="style-badge"
                            status="success"
                            text="Active"
                          />
                        )}
                      {vendorDetails &&
                        vendorDetails.entityStatus &&
                        vendorDetails.entityStatus.toLowerCase() ===
                        "pending" && (
                          <Badge
                            className="style-badge"
                            status="warning"
                            text="Pending"
                          />
                        )}
                      {vendorDetails &&
                        vendorDetails.entityStatus &&
                        vendorDetails.entityStatus.toLowerCase() ===
                        "inactive" && (
                          <Badge
                            className="style-badge"
                            color="#979797"
                            text="Inactive"
                          />
                        )}
                    </Descriptions.Item>

                    <Descriptions.Item>
                      {vendorDetails.entityDescription}{" "}
                    </Descriptions.Item>
                  </Descriptions>
                  <Descriptions className="dashboard-allmodules-descriptions">
                    <Descriptions.Item>
                      <b style={{ fontSize: "16px" }}>
                        Agreements, Licences, Datasets and Data Feeds
                      </b>
                    </Descriptions.Item>
                  </Descriptions>

                  <Tabs
                    defaultActiveKey="1"
                    onTabClick={handleTabClick}
                    tabBarExtraContent={extraTabContent()}
                    className="dashboard-vendors-tab1"
                    style={{ fontWeight: "bold" }}
                  >
                    <TabPane
                      tab="Agreements & Licences"
                      key="1"
                      style={{ fontWeight: "normal" }}
                    >
                      <Layout className="dash-dash-dash">
                        <Content className="dashboard-vendors-contracts">
                          {
                            contractInfo ? (
                              contractInfo.length > 0 ? (
                                <VendorData
                                  className="dashboard-data-table"
                                  vendorId={vendorID}
                                  disableAllButtons={disableAll}
                                  entityName={vendorDetails.shortName}
                                  entityId={vendorDetails.entityId}
                                />
                              ) : (
                                <Col
                                  span={24}
                                  style={{
                                    textAlign: "center",
                                    paddingTop: "8%",
                                    paddingBottom: "8%"
                                  }}
                                >
                                  <Spin tip="Loading..." />
                                </Col>
                              )
                            ) : (
                              <Content className="dashboard-vendors-contracts-empty">
                                <h2> No agreements</h2>
                              </Content>
                            )
                          }
                        </Content>
                      </Layout>
                    </TabPane>
                    <TabPane
                      tab="Datasets & Data Feeds"
                      key="2"
                      style={{ fontWeight: "normal" }}
                    >
                      <Layout className="dash-dash-dash">
                        <Content className="dashboard-vendors-contracts">
                          {
                            datasetsInfo ? (
                              datasetsInfo.length > 0 ? (
                                <DataSetData
                                  className="dashboard-data-table"
                                  dataSetEntityId={vendorDetails.entityId}
                                  datasetsInfo={datasetsInfo}
                                  datafeedsInfo={datafeedsInfo}
                                  vendorId={vendorID}
                                  handleTabClick={handleTabClick}
                                />
                              ) : (
                                <Col
                                  span={24}
                                  style={{
                                    textAlign: "center",
                                    paddingTop: "8%",
                                    paddingBottom: "8%"
                                  }}
                                >
                                  <Spin tip="Loading..." />
                                </Col>
                              )
                            ) : (
                              <Content className="dashboard-vendors-contracts-empty">
                                <h2> No Datasets</h2>
                              </Content>
                            )}
                        </Content>
                      </Layout>
                    </TabPane>
                  </Tabs>

                  {/* CALLING VENDOR DATA COMPONENT FOR DISPLAYING CONTRACT & LICENSES USING EXPANDABLE TABLE */}
                </Content>
              </Layout>
            </>
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
                  <Button type="primary" disabled={isAddEntity}>
                    <Link to="/masterData/addEntity">+ Add entity</Link>
                  </Button>
                </Empty>
                ,
              </Content>
            </Layout>
          )}
        </Layout>
      </Layout>
    </div>
  ) : (
    <div className="dashboard-main">
      <Headers />
      <Layout className="dashboard-page" style={{ background: "#f0f2f5" }}>
        {masterDataMgmt(false)}
        <Col
          span={24}
          style={{
            textAlign: "center",
            background: "#f0f2f5",
            paddingTop: "8%",
          }}
        >
          <Spin tip="Loading..." />
        </Col>
      </Layout>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    contracts: state.contract.data,
    licenses: state.license.data,
    vendors: state.vendor,
  };
};

export default connect(mapStateToProps)(memo(MasterData));