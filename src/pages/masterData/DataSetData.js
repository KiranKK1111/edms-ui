//____________ Lib imports
import React, { useEffect, memo, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";

//______________CSS imports
import "./VendorData.css";

//______________Ant imports
import "antd/dist/antd.css";
import {
  Modal,
  Tag,
  Table,
  Button,
  Input,
  Row,
  Col,
  Form,
  Select,
  AutoComplete,
} from "antd";
import { Menu, Dropdown, message } from "antd";
import {
  EditOutlined,
  MinusCircleOutlined,
  DeleteOutlined,
  SearchOutlined,
  FormOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";

import {
  startDeleteContract,
  startUpdateContract,
} from "../../store/actions/contractAction";
import {
  startDeleteLicense,
  startUpdateLicense,
} from "../../store/actions/licenseAction";
import {
  startGetDatafeeds,
  startUpdateDataFeed,
  getConfigById,
} from "../../store/actions/datafeedAction";
import {
  clearFeed,
  formDataFn,
  setSelectedDatafeed,
} from "../../store/actions/datafeedAction";
import {
  datasetInfo,
  startDataset,
} from "../../store/actions/datasetFormActions";
import { allSubscriptionList } from "../../store/actions/CatalogPageActions";
import isAcessMasterDataDisabled from "../../utils/accessMasterData";
import { startGetDatasets } from "../../store/actions/DatasetPageActions";
import {
  CamelText,
  //camelText,
} from "../../components/addContract/ContractDetails";
import {
  MASTERDATA_DATAFEED_PAGE_AND_BUTTON,
  MASTERDATA_MANAGEMENT_PAGE,
  MASTERDATA_DATAFEED_UPADTE_ACTIVE_DELETE_BUTTON,
  MASTERDATA_DATASET_DEACTIVATE_DELETE_BUTTON,
  ADD_DATA_CONFIG_PAGE_AND_BUTTON,
  ADD_DATASET_DOCUMENTATION_PAGE_AND_BUTTON,
  ADD_DATAFEED_DOCUMENTATION_PAGE_AND_BUTTON,
  MASTERDATA_ADD_DATASET_PAGES_BUTTON,
} from "../../utils/Constants";
import isButtonObject from "../../utils/accessButtonCheck";
import getPermissionObject from "../../utils/accessObject";
const { Option } = Select;

//* VENDOR DATA - CALLED FROM VENDOR DASHBOARD TO DISPLAY CONTRACTS AND LICENSE FOR A VENDOR USING EXPANDABLE TABLE
const DataSetData = (props) => {
  //* LOCAL VARIABLES
  let datasetDisp = [];
  let dataLicenses = [];
  let dataDatafeeds = [];
  let updatedDatafeedsInfo = [];
  let vendorID = props.vendorId;
  let datasetID = props.datasetId;
  let dataSetEntityId = props.dataSetEntityId;
  let ContractDeleteMessage;
  let ContractSuspendMessage;

  let disableLicenseEdit = false;
  let disableLicenseMore = false;
  let disableDatafeedsEdit = false;
  let disableDatafeedsMore = false;
  let disableContractEdit = false;
  let disableAddLicense = false;
  let disableContractMore = false;
  let subscriptionList = useSelector(
    (state) => state.allSubscriptionList.allSubscriptionList
  );

  const greenStatus = ["approved", "live", "active", "setup"];
  const greenTaskStatus = ["approved"];
  const enableButton = ["approved", "rejected"];
  const inActiveButton = ["inactive", "pending"];
  const inActiveButtonDF = ["inactive"];
  const inPendingButton = ["pending"];
  const expiredButton = ["expired"];
  const isDeactivateStatus = ["deactivate"];

  const [searchStatus, setSearchStatus] = useState([
    "Active",
    "Inactive",
    "Pending",
  ]);
  const [searchDataset, setSearchDataset] = useState(undefined);
  const [searchDatafeed, setSearchDatafeed] = useState(undefined);
  const [searchLicense, setSearchLicense] = useState(undefined);
  const [searchStatusValue, setSearchStatusValue] = useState(undefined);
  const [searchDatafeedValues, setSearchDatafeedValues] = useState([]);

  const [searchRowEpandable, setSearchRowEpandable] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearFeed());
  }, []);

  const history = useHistory();

  //*************************************************************************************************//
  const handleContractDelete = (Data) => {
    let dataObj = { ...Data };
    dataObj["createdBy"] = localStorage.getItem("psid");
    if (Data.licenses > 0) {
      ContractDeleteMessage = `There are Data Feeds under this Dataset.
              To complete this action, Please ensure there are no Data Feeds under this Dataset.`;
    } else {
      ContractDeleteMessage = `Your request to Delete Dataset. 
        Do you want to proceed ?`;
    }
    Modal.confirm({
      title: (
        <h3>
          <b>Delete Dataset ? </b>{" "}
        </h3>
      ),
      content: ContractDeleteMessage,
      okText: "Delete",
      okType: "danger",
      onOk() {
        if (Data.licenses === 0) {
          props.dispatch(startDeleteContract(dataObj));
        }
      },
    });
  };

  const handleContractSuspend = (Data) => {
    const feedList = [...props.datafeedsInfo];
    const dataObj = { ...Data };
    let feedStatusMatch = feedList.some((feed) => {
      return (
        (Data.datasetId === feed.datasetId &&
          feed.feedStatus.toLowerCase() === "active") ||
        (Data.datasetId === feed.datasetId &&
          feed.feedStatus.toLowerCase() === "pending")
      );
    });
    if (feedStatusMatch) {
      Modal.confirm({
        title: (
          <h3>
            <b>Unable to Deactivate Dataset! </b>{" "}
          </h3>
        ),
        content: `Status of Data Feed(s) under this Dataset is still active.`,
        okButtonProps: { style: { display: "none" } },
        cancelText: "Ok",
      });
    } else {
      Modal.confirm({
        title: (
          <h3>
            <b>Deactivate Dataset ? </b>{" "}
          </h3>
        ),
        content: "Are you sure you want to proceed?",
        okText: "Deactivate",
        okButtonProps: { style: { backgroundColor: "#FF4C4F", border: 0 } },
        onOk: async () => {
          dataObj.datasetStatus = "Deactivate";
          dataObj.datasetUpdateFlag = "N";
          dataObj.lastUpdatedBy = localStorage.getItem("psid");
          dataObj.isUpdate = true;
          delete dataObj.key;
          delete dataObj.licenseName;
          delete dataObj.dataFeeds;
          delete dataObj.status;
          delete dataObj.taskStatus;
          const res = await dispatch(startDataset(dataObj));
          if (res && res.data) {
            message.success("Dataset deactivated successfully.");
          }
          // refreshPage();
          dispatch(startGetDatasets());
        },
      });
    }
  };

  const handleLicenseDelete = (LicenseData) => {
    let dataObj = { ...LicenseData };
    dataObj["createdBy"] = localStorage.getItem("psid");
    Modal.confirm({
      title: (
        <h3>
          <b>Delete Data Feed ? </b>{" "}
        </h3>
      ),
      content: `This will delete the Data Feed under this Dataset.
        All subscribers will be impacted. Are you sure you want to proceed?.`,
      okText: "Delete",
      okType: "danger",
      onOk() {
        props.dispatch(startDeleteLicense(dataObj));
      },
    });
  };

  useEffect(() => {
    dispatch(allSubscriptionList());
  }, [dispatch]);

  const handleLicenseSuspend = (LicenseData) => {
    let dataObj = { ...LicenseData };
    let subscriptionListByDataFeed = subscriptionList.filter((sub) => {
      return sub.dataFeedId === dataObj.feedId;
    });
    let subscriptionStatusArr = subscriptionListByDataFeed.find((sub) => {
      return (
        sub.subscriptionStatus.toLowerCase() === "active" ||
        sub.subscriptionStatus.toLowerCase() === "pending"
      );
    });
    if (subscriptionStatusArr && subscriptionListByDataFeed.length > 0) {
      Modal.confirm({
        title: (
          <h3>
            <b>Unable to deactivate Data Feed! </b>{" "}
          </h3>
        ),
        content: `There are subscribers currently subscribed to this Data Feed.`,
        okButtonProps: { style: { display: "none" } },
        cancelText: "Ok",
      });
    } else {
      Modal.confirm({
        title: (
          <h3>
            <b>Deactivate Data Feed? </b>{" "}
          </h3>
        ),
        content: `Are you sure you want to proceed?`,
        okText: "Deactivate",
        okButtonProps: { style: { backgroundColor: "#FF4C4F", border: 0 } },
        onOk: async () => {
          dataObj.feedStatus = "Deactivate";
          dataObj.feedUpdateFlag = "Y";
          dataObj.lastUpdatedBy = localStorage.getItem("psid");
          delete dataObj.taskStatus;
          delete dataObj.key;
          const res = await startUpdateDataFeed(dataObj);
          if (res && res.data) {
            message.success(
              "Data Feed deactivation request submitted successfully."
            );
          }
          props.dispatch(startGetDatafeeds());
        },
      });
    }
  };

  // const isMasterDataDisabled = isAcessMasterDataDisabled();
  const isDisabledDatafeed = isButtonObject(
    MASTERDATA_MANAGEMENT_PAGE,
    MASTERDATA_DATAFEED_PAGE_AND_BUTTON
  );

  const isDatasetDisabled = isButtonObject(
    MASTERDATA_MANAGEMENT_PAGE,
    MASTERDATA_ADD_DATASET_PAGES_BUTTON
  );
  const isUpdateEditDeactiveDatafeed = isButtonObject(
    MASTERDATA_MANAGEMENT_PAGE,
    MASTERDATA_DATAFEED_UPADTE_ACTIVE_DELETE_BUTTON
  );

  const addDataConfigPagesAndButton = isButtonObject(
    MASTERDATA_MANAGEMENT_PAGE,
    ADD_DATA_CONFIG_PAGE_AND_BUTTON
  );

  const addDatasetDocPagesAndButton = isButtonObject(
    MASTERDATA_MANAGEMENT_PAGE,
    ADD_DATASET_DOCUMENTATION_PAGE_AND_BUTTON
  );

  const isDataSetDeactivateOrDelete = getPermissionObject(
    MASTERDATA_MANAGEMENT_PAGE,
    MASTERDATA_DATASET_DEACTIVATE_DELETE_BUTTON
  );

  const isAddDatasetDoc = getPermissionObject(
    MASTERDATA_MANAGEMENT_PAGE,
    ADD_DATASET_DOCUMENTATION_PAGE_AND_BUTTON
  );

  const isAddDatafeedDoc = getPermissionObject(
    MASTERDATA_MANAGEMENT_PAGE,
    ADD_DATAFEED_DOCUMENTATION_PAGE_AND_BUTTON
  );

  const handleEnableButton = (conStatus, appStatus) => {
    if (appStatus === "pending") {
      disableContractEdit = true;
      disableAddLicense = true;
      disableContractMore = true;
      disableLicenseEdit = true;
      disableContractMore = true;
      disableLicenseMore = true;
    } else if (appStatus === "approved") {
      disableContractEdit = false;
      disableAddLicense = false;
      disableContractMore = false;
      disableLicenseEdit = false;
      disableContractMore = false;
      disableLicenseMore = false;
    }
    if (
      conStatus === "expired" ||
      conStatus === "suspended" ||
      appStatus === "rejected"
    ) {
      disableContractEdit = false;
      disableAddLicense = true;
      disableContractMore = false;
      disableContractMore = false;
    }
    if (props.disableAllButtons === true) {
      disableContractEdit = true;
      disableAddLicense = true;
      disableContractMore = true;
      disableLicenseEdit = true;
      disableContractMore = true;
      disableLicenseMore = true;
    }
  };

  if (isDisabledDatafeed) {
    disableContractEdit = true;
    disableAddLicense = true;
    disableContractMore = true;
    disableLicenseEdit = true;
    disableContractMore = true;
    disableLicenseMore = true;
  }
  const isDisableContractMore = isDisabledDatafeed && disableContractMore;
  const isDisableLicenseMore = isDisabledDatafeed && disableLicenseMore;
  const moreLicensesMenu = (LicenseData, val1, val2) => {
    const moreLicense = (
      <Menu className="more-license-menu">
        {LicenseData.feedUpdateFlag.toLowerCase() === "y" &&
          (LicenseData.feedStatus.toLowerCase() === "pending" ||
            isDataSetDeactivateOrDelete.permission !== "RW" ||
            LicenseData.feedStatus.toLowerCase() === "active") ? (
          <Menu.Item className="warn-menu" onClick={warningPending}>
            <span>
              <MinusCircleOutlined /> Deactivate
            </span>
          </Menu.Item>
        ) : (
          <Menu.Item
            className="warn-menu"
            disabled={
              val1 ||
              val2 ||
              isDataSetDeactivateOrDelete.permission !== "RW" ||
              LicenseData.feedStatus.toLowerCase() === "inactive" ||
              (LicenseData.feedUpdateFlag.toString().toLowerCase() === "n" &&
                LicenseData.feedStatus.toLowerCase() === "pending")
            }
            onClick={() => handleLicenseSuspend(LicenseData)}
          >
            <span>
              <MinusCircleOutlined /> Deactivate
            </span>
          </Menu.Item>
        )}

        <Menu.Item onClick={() => { }}>
          <span>
            <FormOutlined />{" "}
            <Link
              to={`/masterData/${LicenseData.feedId}/addDocuments`}
              disabled={
                (isAddDatafeedDoc && isAddDatafeedDoc.permission !== "RW") ||
                !isAddDatafeedDoc ||
                (LicenseData.feedStatus.toLowerCase() === "inactive"
                  ? true
                  : false) ||
                (LicenseData.feedUpdateFlag.toString().toLowerCase() === "n" &&
                  LicenseData.feedStatus.toLowerCase() === "pending")
              }
            >
              Documents
            </Link>
          </span>
        </Menu.Item>
        <Menu.Item onClick={() => { }}>
          <span>
            <MenuUnfoldOutlined />{" "}
            <Link
              to={{
                pathname: `/masterData/${LicenseData.feedId}/addConfiguration`,
              }}
              disabled={
                (LicenseData.feedStatus.toLowerCase() === "inactive"
                  ? true
                  : false) ||
                  (LicenseData.feedUpdateFlag.toString().toLowerCase() === "n" &&
                    LicenseData.feedStatus.toLowerCase() === "pending")
                  ? true
                  : false
              }
              onClick={() => {
                sessionStorage.setItem("feedShortName", LicenseData.shortName);
                sessionStorage.setItem("feedStatus", LicenseData.feedStatus);
              }}
            >
              Configuration
            </Link>
          </span>
        </Menu.Item>
      </Menu>
    );
    return moreLicense;
  };

  //check shortName has '/'
  const checkUrlSlash = (frontSlashVar) => {
    return frontSlashVar.includes("/")
      ? frontSlashVar.replaceAll("/", "%2F")
      : frontSlashVar;
  };
  //*************************************************************************************************//
  const expandedRowRender = (row, expandable) => {
    let storingId = 0;
    const columns = [
      {
        title: <b>Data Feed Name</b>,
        // dataIndex: "shortName",
        key: "shortName",
        width: "22%",
        render: (record) => {
          storingId = record.shortName;
          let feedUpdateLink = checkUrlSlash(row.shortName);
          return (
            <>
              {record &&
                record.feedUpdateFlag &&
                record.feedUpdateFlag.toLowerCase() === "n" ? (
                <Link
                  to={{
                    pathname: `/masterData/${feedUpdateLink}/viewDatafeed`,
                    state: {
                      dataset: row,
                      isView: true,
                      datafeedRecord: record,
                    },
                  }}
                  onClick={() => dispatch(formDataFn(record))}
                // disabled={isDisabledDatafeed}
                >
                  {record.shortName}
                </Link>
              ) : (
                <Link
                  to={{
                    pathname: `/masterData`,
                  }}
                  onClick={warningPending}
                // disabled={isDisabledDatafeed}
                >
                  {record.shortName}
                </Link>
              )}
            </>
          );
        },
      },
      {
        title: <b>Data Feed ID</b>,
        dataIndex: "feedId",
        key: "feedId",
        width: "38.5%",
        render: (id) => {
          storingId = id;
          return <div> {id} </div>;
        },
      },
      {
        title: <b>Data Feed status</b>,
        dataIndex: "feedStatus",
        key: "feedStatus",
        width: "13%",
        render: (feedStatus) => {
          if (greenStatus.includes(feedStatus && feedStatus.toLowerCase())) {
            return <Tag color="green"> {feedStatus} </Tag>;
          } else if (
            inActiveButtonDF.includes(feedStatus && feedStatus.toLowerCase()) ||
            isDeactivateStatus.includes(feedStatus && feedStatus.toLowerCase())
          ) {
            return (
              <Tag className="inactive-tag"> {CamelText(feedStatus)} </Tag>
            );
          } else if (
            inPendingButton.includes(feedStatus && feedStatus.toLowerCase())
          ) {
            return <Tag color="orange"> {feedStatus} </Tag>;
          } else if (
            expiredButton.includes(feedStatus && feedStatus.toLowerCase())
          ) {
            return <Tag color="red"> {feedStatus} </Tag>;
          } else {
            return <Tag color="orange"> {feedStatus} </Tag>;
          }
        },
      },
      {
        title: <b>Configuration status</b>,
        dataIndex: "isEnabled",
        key: "isEnabled",
        width: "13%",
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
        title: <b>Actions</b>,
        key: "actions",
        render: (record) => {
          const LicenseData = {
            ...record,
            contractId: record.LICECONTRACT,
            licenseId: record.id,
            licenseName: record.name,
            taskStatus:
              record &&
                record.taskStatus &&
                record.taskStatus.toLowerCase() === "draft"
                ? "draft"
                : "pending",
          };
          let feedUpdateLink = checkUrlSlash(row.shortName);
          return (
            <div>
              {record &&
                record.feedUpdateFlag &&
                record.feedUpdateFlag.toLowerCase() === "n" ? (
                //
                <Link
                  to={{
                    pathname: `/masterData/${feedUpdateLink}/datafeed`,
                    state: {
                      dataset: row,
                      isUpdate: true,
                      fromLink: "updatePage",
                    },
                  }}
                  onClick={() => dispatch(formDataFn(record))}
                  disabled={isUpdateEditDeactiveDatafeed}
                >
                  Edit
                </Link>
              ) : (
                <Link
                to={{
                  pathname: `/masterData`,
                }}
                  onClick={warningPending}
                  disabled={isUpdateEditDeactiveDatafeed}
                >
                  Edit
                </Link>
              )}

              <Dropdown
                overlay={() =>
                  moreLicensesMenu(
                    LicenseData,
                    disableLicenseMore,
                    isUpdateEditDeactiveDatafeed
                  )
                }
                placement="bottomLeft"
                arrow
              // disabled={disableLicenseMore || isUpdateEditDeactiveDatafeed}
              >
                <Button
                  className="moreButton"
                  // disabled={disableLicenseMore || isUpdateEditDeactiveDatafeed}
                  type="link"
                >
                  {" "}
                  More
                </Button>
              </Dropdown>
            </div>
          );
        },
      },
    ];

    updatedDatafeedsInfo = [];
    const feedsInfo = props.datafeedsInfo
      ? searchDatafeedValues.length > 0
        ? searchDatafeedValues.filter((feed, i) => {
          if (feed.datasetId === row.datasetId) {
            setSearchRowEpandable(true);
            updatedDatafeedsInfo.push({
              ...feed,
              key: i,
            });
            return true;
          }
          return false;
        })
        : props.datafeedsInfo.filter((feed, i) => {
          if (feed.datasetId === row.datasetId) {
            updatedDatafeedsInfo.push({
              ...feed,
              key: i,
            });
            return true;
          }
          return false;
        })
      : [];
    return (
      <Table
        columns={columns}
        className="license-nested-table"
        dataSource={updatedDatafeedsInfo}
        pagination={false}
        title={() => {
          let feedButtonDispflag =
            !isDisabledDatafeed &&
              row &&
              (row.datasetStatus.toLowerCase() === "active" ||
                row.datasetStatus.toLowerCase() === "planned")
              ? false
              : true;
          return (
            <div>
              <b>{"Data Feeds"}</b>
            </div>
          );
        }}
        rowKey={updatedDatafeedsInfo.key}
      />
    );
  };

  function warningPending() {
    Modal.warning({
      title: "This is already submitted",
      content:
        "Your change request has been submitted for approval. The details will remain unchanged until your request is approved.",
    });
  }

  const moreContractMenu = (Data, isDeactivateOrDelete, record) => {
    localStorage.setItem("agId", Data.agreementId);
    localStorage.setItem("entityIdInfo", Data.agreementEdmsEntiryId);
    let datasetShortName = checkUrlSlash(record.licenseName);
    const moreInMenu = (
      <Menu className="more-menu">
        <Menu.Item>
          {/* {record.datasetStatus === "Active" ? ( */}
          <Link
            to={{
              pathname: `/masterData/${datasetShortName}/dataset`,
              state: { isUpdate: true, licence: record },
            }}
            onClick={() => dispatch(datasetInfo(record))}
          >
            <Button
              className="linkButton"
              type="link"
            //disabled={isDatasetDisabled}
            >
              <EditOutlined /> Edit
            </Button>
          </Link>
          {/* ) : (
              <Link onClick={warning} disabled={isDatasetDisabled}>
                <b>{record.shortName}</b>
              </Link>
            )} */}
        </Menu.Item>
        <Menu.Item
          className="warn-menu"
          onClick={() =>
            Data &&
              (Data.datasetStatus.toLowerCase() === "active" ||
                Data.datasetStatus.toLowerCase() === "pending") &&
              Data.datasetUpdateFlag.toLowerCase() === "y"
              ? warningPending()
              : handleContractSuspend(Data)
          }
          disabled={
            isDeactivateOrDelete ||
            isDataSetDeactivateOrDelete.permission !== "RW" ||
            (Data && Data.datasetStatus.toLowerCase() === "inactive") ||
            (Data &&
              Data.datasetUpdateFlag.toLowerCase() === "n" &&
              Data.datasetStatus.toLowerCase() === "pending")
          }
        >
          <span>
            {" "}
            <MinusCircleOutlined /> Deactivate{" "}
          </span>
        </Menu.Item>

        {/* <Menu.Item
          className="warn-menu"
          onClick={() => handleContractDelete(Data)}
          disabled={
            isDeactivateOrDelete ||
            isDataSetDeactivateOrDelete.permission !== "RW"
          }
        >
          <span>
            <DeleteOutlined /> Delete{" "}
          </span>
        </Menu.Item> */}
        <Menu.Item onClick={() => { }}>
          <span>
            <FormOutlined />{" "}
            <Link
              to={`/masterData/${Data.datasetId}/addDocuments`}
              disabled={
                (isAddDatasetDoc && isAddDatasetDoc.permission !== "RW") ||
                  !isAddDatasetDoc ||
                  addDatasetDocPagesAndButton ||
                  (Data &&
                    Data.datasetUpdateFlag.toLowerCase() === "n" &&
                    Data.datasetStatus.toLowerCase() === "pending")
                  ? true
                  : false
              }
            >
              Documents{" "}
            </Link>
          </span>
        </Menu.Item>
      </Menu>
    );
    return moreInMenu;
  };

  let storedContractId = 0;

  const columns = [
    {
      title: <b>Dataset Name</b>,
      key: "shortName",
      width: "22%",
      ellipsis: false,
      sorter: (a, b) => a.shortName.localeCompare(b.shortName),

      render: (record) => {
        let datasetShortName = checkUrlSlash(record.licenseName);
        return (
          <div className="contract-actions">
            {/* {record.datasetStatus === "Active" ? ( */}
            <Link
              to={{
                pathname: `/masterData/${datasetShortName}/dataset`,
                state: { isUpdate: true, licence: record },
              }}
              onClick={() => dispatch(datasetInfo(record))}
            //disabled={isDatasetDisabled}
            >
              <b>{record.shortName}</b>
            </Link>
            {/* ) : (
              <Link onClick={warning} disabled={isDatasetDisabled}>
                <b>{record.shortName}</b>
              </Link>
            )} */}
          </div>
        );
      },
    },
    {
      title: <b>Dataset ID</b>,
      dataIndex: "datasetId",
      key: "datasetId",
      width: "25%",
      ellipsis: false,
      sorter: (a, b) => a.datasetId.localeCompare(b.datasetId),
      render: (item) => {
        return <div>{item} </div>;
      },
    },
    {
      title: <b>Licence Name</b>,
      dataIndex: "licenseName",
      key: "licenseName",
      width: "20%",
      ellipsis: false,
      sorter: (a, b) => a.licenseName.localeCompare(b.licenseName),
    },

    {
      title: <b>Data Feeds</b>,
      dataIndex: "dataFeeds",
      key: "dataFeeds",
      width: "14%",
      ellipsis: false,
      sorter: (a, b) => a.dataFeeds.toString().localeCompare(b.dataFeeds),
    },

    {
      title: <b>Dataset status</b>,
      dataIndex: "datasetStatus",
      key: "datasetStatus",
      width: "13%",
      sorter: (a, b) => a.datasetStatus.localeCompare(b.datasetStatus),
      render: (datasetStatus) => {
        if (greenStatus.includes(datasetStatus.toLowerCase())) {
          return <Tag color="green"> {datasetStatus} </Tag>;
        } else {
          return <Tag color="orange"> {CamelText(datasetStatus)} </Tag>;
        }
      },
    },

    {
      title: <b>Actions</b>,
      key: "actions",
      width: "20%",
      render: (record) => {
        const PassData = {
          ...record,
          contractId: record.contractId,
          contractName: record.contractName,
          datasetID: datasetID,
          taskStatus: "Active",
          licenses: record.licenses,
          contractStatus: record.contractStatus,
        };

        let feedButtonDispflag =
          !isDisabledDatafeed &&
            record &&
            (record.datasetStatus.toLowerCase() === "active" ||
              record.datasetStatus.toLowerCase() === "planned")
            ? false
            : true;
        let datasetShortNameFeeds = checkUrlSlash(record.shortName);
        return (
          <div className="contract-actions">
            <Link
              to={{
                pathname: `/masterData/${datasetShortNameFeeds}/datafeed`,
                state: { isUpdate: false, dataset: record },
              }}
              disabled={feedButtonDispflag}
            >
              <b>Add Feeds</b>
            </Link>

            <Dropdown
              overlay={() =>
                moreContractMenu(PassData, isDatasetDisabled, record)
              }
              placement="bottomLeft"
              arrow
            // disabled={disableContractMore}
            // disabled={record.datasetStatus.toLowerCase() === "inactive"}
            >
              <Button className="moreButton" type="link">
                {" "}
                <b>More</b>
              </Button>
            </Dropdown>
          </div>
        );
      },
    },
  ];

  const myDatasets = props.datasetsInfo.forEach((ele, i) => {
    let dataFeedNsetCount;
    if (props.datafeedsInfo) {
      dataFeedNsetCount = props.datafeedsInfo.filter(
        (feedInfo, iuniq) => feedInfo.datasetId === ele.datasetId
      ).length;
    }

    const licensesList = props.licenses;
    if (ele.entityId === dataSetEntityId) {
      licensesList &&
        licensesList.forEach((license) => {
          if (license.licenseId === ele.licenseId) {
            datasetDisp.push({
              ...ele,
              key: i,
              datasetId: ele.datasetId,
              longName: ele.longName,
              licenseName: license.licenseShortName,
              dataFeeds: dataFeedNsetCount,
              status: ele.datasetStatus,
              taskStatus: ele.taskStatus,
            });
          }
        });
    }
  });

  const [form] = Form.useForm();
  const [searchDatasetDisp, setSearchDatasetDisp] = useState(datasetDisp || []);

  useEffect(() => {
    handleAllSearch();
    if (datasetDisp && datasetDisp.length > 0) {
      setSearchDatasetDisp(datasetDisp);
      setSearchDatafeedValues([]);
      setSearchRowEpandable(false);
    }
  }, []);

  const handleAllReset = async () => {
    form.resetFields();
    setSearchDatafeed(undefined);
    setSearchDataset(undefined);
    setSearchLicense(undefined);
    setSearchStatusValue(undefined);
    setSearchDatasetDisp(datasetDisp);
    setSearchDatafeedValues([]);
    setSearchRowEpandable(false);
  };

  useEffect(() => {
    handleAllReset();
  }, [vendorID, props.handleTabClick, props.datafeedsInfo]);

  const handleAllSearch = (e) => {
    let filterValueDatasetDisp = [];
    const feedsInfo = props.datafeedsInfo;
    if (searchDataset || searchDatafeed || searchLicense || searchStatusValue) {
      if (
        !searchDataset &&
        !searchDatafeed &&
        !searchLicense &&
        searchStatusValue
      ) {
        filterValueDatasetDisp = datasetDisp.filter((item) =>
          item.datasetStatus
            .toLowerCase()
            .includes(searchStatusValue.toLowerCase())
        );
        setSearchDatasetDisp(filterValueDatasetDisp);
      }

      if (
        searchDataset &&
        !searchDatafeed &&
        !searchLicense &&
        searchStatusValue
      ) {
        filterValueDatasetDisp = datasetDisp.filter(
          (item) =>
            item.datasetStatus
              .toLowerCase()
              .includes(searchStatusValue.toLowerCase()) &&
            item.shortName.toLowerCase().includes(searchDataset.toLowerCase())
        );
        setSearchDatasetDisp(filterValueDatasetDisp);
      }

      if (
        !searchDataset &&
        searchDatafeed &&
        !searchLicense &&
        searchStatusValue
      ) {
        setSearchRowEpandable(true);
        const datafeedFilter = feedsInfo.filter(
          (item) =>
            item.shortName
              .toLowerCase()
              .includes(searchDatafeed.toLowerCase()) &&
            item.feedStatus
              .toLowerCase()
              .includes(searchStatusValue.toLowerCase())
        );
        setSearchDatafeedValues(datafeedFilter);
        const datafeedIds = [
          ...new Set(datafeedFilter.map((item) => item.datasetId)),
        ];
        let datasetActual = [];
        datasetDisp.forEach((element, i) => {
          if (datafeedIds.includes(element.datasetId)) {
            datasetActual.push(element);
          }
        });
        setSearchDatasetDisp(datasetActual);
      }

      if (
        !searchDataset &&
        !searchDatafeed &&
        searchLicense &&
        searchStatusValue
      ) {
        filterValueDatasetDisp = datasetDisp.filter(
          (item) =>
            item.datasetStatus
              .toLowerCase()
              .includes(searchStatusValue.toLowerCase()) &&
            item.licenseName.toLowerCase().includes(searchLicense.toLowerCase())
        );
        setSearchDatasetDisp(filterValueDatasetDisp);
      }

      if (
        searchDataset &&
        searchDatafeed &&
        !searchLicense &&
        searchStatusValue
      ) {
        setSearchRowEpandable(true);
        const datafeedFilter = feedsInfo.filter(
          (item) =>
            item.shortName
              .toLowerCase()
              .includes(searchDatafeed.toLowerCase()) &&
            item.feedStatus
              .toLowerCase()
              .includes(searchStatusValue.toLowerCase())
        );
        setSearchDatafeedValues(datafeedFilter);
        const datafeedIds = [
          ...new Set(datafeedFilter.map((item) => item.datasetId)),
        ];
        let datasetActual = [];
        datasetDisp.forEach((element, i) => {
          if (
            datafeedIds.includes(element.datasetId) &&
            element.shortName
              .toLowerCase()
              .includes(searchDataset.toLowerCase())
          ) {
            datasetActual.push(element);
          }
        });
        setSearchDatasetDisp(datasetActual);
      }

      if (
        searchDataset &&
        !searchDatafeed &&
        searchLicense &&
        searchStatusValue
      ) {
        filterValueDatasetDisp = datasetDisp.filter(
          (item) =>
            item.status
              .toLowerCase()
              .includes(searchStatusValue.toLowerCase()) &&
            item.shortName
              .toLowerCase()
              .includes(searchDataset.toLowerCase()) &&
            item.licenseName.toLowerCase().includes(searchLicense.toLowerCase())
        );
        setSearchDatasetDisp(filterValueDatasetDisp);
      }

      if (
        !searchDataset &&
        searchDatafeed &&
        searchLicense &&
        searchStatusValue
      ) {
        setSearchRowEpandable(true);
        const datafeedFilter = feedsInfo.filter(
          (item) =>
            item.shortName
              .toLowerCase()
              .includes(searchDatafeed.toLowerCase()) &&
            item.feedStatus
              .toLowerCase()
              .includes(searchStatusValue.toLowerCase())
        );
        setSearchDatafeedValues(datafeedFilter);
        const datafeedIds = [
          ...new Set(datafeedFilter.map((item) => item.datasetId)),
        ];
        let datasetActual = [];
        datasetDisp.forEach((element, i) => {
          if (
            datafeedIds.includes(element.datasetId) &&
            element.licenseName
              .toLowerCase()
              .includes(searchLicense.toLowerCase())
          ) {
            datasetActual.push(element);
          }
        });
        setSearchDatasetDisp(datasetActual);
      }

      if (
        searchDataset &&
        searchDatafeed &&
        searchLicense &&
        searchStatusValue
      ) {
        setSearchRowEpandable(true);
        const datafeedFilter = feedsInfo.filter(
          (item) =>
            item.shortName
              .toLowerCase()
              .includes(searchDatafeed.toLowerCase()) &&
            item.feedStatus
              .toLowerCase()
              .includes(searchStatusValue.toLowerCase())
        );
        setSearchDatafeedValues(datafeedFilter);
        const datafeedIds = [
          ...new Set(datafeedFilter.map((item) => item.datasetId)),
        ];
        let datasetActual = [];
        datasetDisp.forEach((element, i) => {
          if (
            datafeedIds.includes(element.datasetId) &&
            element.shortName
              .toLowerCase()
              .includes(searchDataset.toLowerCase()) &&
            element.licenseName
              .toLowerCase()
              .includes(searchLicense.toLowerCase())
          ) {
            datasetActual.push(element);
          }
        });
        setSearchDatasetDisp(datasetActual);
      }

      if (
        searchDataset &&
        !searchDatafeed &&
        !searchLicense &&
        !searchStatusValue
      ) {
        filterValueDatasetDisp = datasetDisp.filter((item) =>
          item.shortName.toLowerCase().includes(searchDataset.toLowerCase())
        );
        setSearchDatasetDisp(filterValueDatasetDisp);
      }
      //

      if (
        !searchDataset &&
        searchDatafeed &&
        !searchLicense &&
        !searchStatusValue
      ) {
        setSearchRowEpandable(true);
        const datafeedFilter = feedsInfo.filter((item) =>
          item.shortName.toLowerCase().includes(searchDatafeed.toLowerCase())
        );
        setSearchDatafeedValues(datafeedFilter);
        const datafeedIds = [
          ...new Set(datafeedFilter.map((item) => item.datasetId)),
        ];
        let datasetActual = [];
        datasetDisp.forEach((element) => {
          if (datafeedIds.includes(element.datasetId)) {
            datasetActual.push(element);
          }
        });
        setSearchDatasetDisp(datasetActual);
      }

      if (
        !searchDataset &&
        !searchDatafeed &&
        searchLicense &&
        !searchStatusValue
      ) {
        filterValueDatasetDisp = datasetDisp.filter((item) =>
          item.licenseName.toLowerCase().includes(searchLicense.toLowerCase())
        );
        setSearchDatasetDisp(filterValueDatasetDisp);
      }
      if (
        searchDataset &&
        searchDatafeed &&
        !searchLicense &&
        !searchStatusValue
      ) {
        setSearchRowEpandable(true);
        const datafeedFilter = feedsInfo.filter((item) =>
          item.shortName.toLowerCase().includes(searchDatafeed.toLowerCase())
        );
        setSearchDatafeedValues(datafeedFilter);
        const datafeedIds = [
          ...new Set(datafeedFilter.map((item) => item.datasetId)),
        ];
        let datasetActual = [];
        datasetDisp.forEach((element, i) => {
          if (
            datafeedIds.includes(element.datasetId) &&
            element.shortName
              .toLowerCase()
              .includes(searchDataset.toLowerCase())
          ) {
            datasetActual.push(element);
          }
        });
        setSearchDatasetDisp(datasetActual);
      }

      if (
        searchDataset &&
        !searchDatafeed &&
        searchLicense &&
        !searchStatusValue
      ) {
        filterValueDatasetDisp = datasetDisp.filter(
          (item) =>
            item.shortName
              .toLowerCase()
              .includes(searchDataset.toLowerCase()) &&
            item.licenseName.toLowerCase().includes(searchLicense.toLowerCase())
        );
        setSearchDatasetDisp(filterValueDatasetDisp);
      }

      if (
        !searchDataset &&
        searchDatafeed &&
        searchLicense &&
        !searchStatusValue
      ) {
        setSearchRowEpandable(true);
        const datasetFiltered = datasetDisp.filter((item) =>
          item.licenseName.toLowerCase().includes(searchLicense.toLowerCase())
        );
        let finalDataSet = [];
        let finalDatafeed = [];
        datasetFiltered.forEach((element) => {
          let datasetActual = [];
          datasetActual = feedsInfo.filter(
            (item) =>
              item.datasetId === element.datasetId &&
              item.shortName
                .toLowerCase()
                .includes(searchDatafeed.toLowerCase())
          );
          if (datasetActual.length > 0) {
            finalDataSet.push(element);
            datasetActual.forEach((ele) => {
              finalDatafeed.push(ele);
            });
          }
        });
        setSearchDatasetDisp(finalDataSet);
        setSearchDatafeedValues(finalDatafeed);
      }

      if (
        searchDataset &&
        searchDatafeed &&
        searchLicense &&
        !searchStatusValue
      ) {
        setSearchRowEpandable(true);
        const datasetFiltered = datasetDisp.filter(
          (item) =>
            item.licenseName
              .toLowerCase()
              .includes(searchLicense.toLowerCase()) &&
            item.shortName.toLowerCase().includes(searchDataset.toLowerCase())
        );
        let finalDataSet = [];
        let finalDatafeed = [];
        datasetFiltered.forEach((element) => {
          let datasetActual = [];
          datasetActual = feedsInfo.filter(
            (item) =>
              item.datasetId === element.datasetId &&
              item.shortName
                .toLowerCase()
                .includes(searchDatafeed.toLowerCase())
          );
          if (datasetActual.length > 0) {
            finalDataSet.push(element);
            datasetActual.forEach((ele) => {
              finalDatafeed.push(ele);
            });
          }
        });
        setSearchDatasetDisp(finalDataSet);
        setSearchDatafeedValues(finalDatafeed);
      }
    } else {
      setSearchDatasetDisp(datasetDisp);
    }
  };

  const [dataSourceDataset, setDataSourceDataset] = useState([]);
  const [dataSourceFeed, setDataSourceFeed] = useState([]);
  const [dataSourceSearchLicense, setDataSourceSearchLicense] = useState([]);

  const initialDataSearchArray = () => {
    let arrayListDataset = [];
    let arrayListLic = [];
    let arrayListDatafeed = [];
    const feedsInfo = props.datafeedsInfo ? props.datafeedsInfo : [];
    searchDatasetDisp.length > 0 &&
      searchDatasetDisp.forEach((element) => {
        const datafeedFilter = feedsInfo.filter(
          (item) => item.datasetId === element.datasetId
        );
        datafeedFilter.length > 0 &&
          datafeedFilter.map((item) => arrayListDatafeed.push(item.shortName));
        arrayListDataset.push(element.shortName);
        arrayListLic.push(element.licenseName);
      });
    setDataSourceDataset([...new Set(arrayListDataset.map((item) => item))]);
    setDataSourceFeed([
      ...new Set(arrayListDatafeed.sort().map((item) => item)),
    ]);
    setDataSourceSearchLicense([...new Set(arrayListLic.map((item) => item))]);
  };

  useEffect(() => {
    initialDataSearchArray();
  }, [searchDatasetDisp]);

  useEffect(() => {
    if (!searchDataset && !searchDatafeed && !searchLicense) {
      initialDataSearchArray();
    }
  }, [searchDataset, searchDatafeed, searchLicense]);

  const onFocusDataSet = (e) => {
    let arrayListDataset = [];
    let arrayListLic = [];
    let arrayListDatafeed = [];
    let arrayOptionStatus = [];
    const feedsInfo = props.datafeedsInfo;
    if (e.currentTarget.id === "searchDataset" && searchDataset) {
      const dataSetInfo = searchDatasetDisp.filter((item) =>
        item.shortName.toLowerCase().includes(searchDataset.toLowerCase())
      );
      dataSetInfo.length > 0 &&
        feedsInfo.length > 0 &&
        dataSetInfo.forEach((element) => {
          const dataFeedReduce = feedsInfo.filter(
            (item) => item.datasetId === element.datasetId
          );
          dataFeedReduce.length > 0 &&
            dataFeedReduce.map((item) =>
              arrayListDatafeed.push(item.shortName)
            );
          arrayOptionStatus.push(element.status);
          arrayListLic.push(element.licenseName);
        });
      setDataSourceFeed([
        ...new Set(arrayListDatafeed.sort().map((item) => item)),
      ]);
      setDataSourceSearchLicense([
        ...new Set(arrayListLic.map((item) => item)),
      ]);
    }

    if (e.currentTarget.id === "searchDatafeed" && searchDatafeed) {
      const dataFeedInfo =
        feedsInfo.length > 0 &&
        feedsInfo.filter((item) =>
          item.shortName.toLowerCase().includes(searchDatafeed.toLowerCase())
        );
      dataFeedInfo.length > 0 &&
        dataFeedInfo.forEach((element) => {
          const dataSetInfo =
            searchDatasetDisp.length > 0 &&
            searchDatasetDisp.filter(
              (item) => item.datasetId === element.datasetId
            );
          dataSetInfo.length > 0 &&
            dataSetInfo.forEach((item) => {
              arrayListDataset.push(item.shortName);
              arrayListLic.push(item.licenseName);
              arrayOptionStatus.push(item.status);
            });
        });
      setDataSourceDataset([
        ...new Set(arrayListDataset.sort().map((item) => item)),
      ]);
      setDataSourceSearchLicense([
        ...new Set(arrayListLic.sort().map((item) => item)),
      ]);
    }
    if (e.currentTarget.id === "searchLicense" && searchLicense) {
      const dataSetInfo = searchDatasetDisp.filter((item) =>
        item.licenseName.toLowerCase().includes(searchLicense.toLowerCase())
      );
      dataSetInfo.length > 0 &&
        dataSetInfo.forEach((element) => {
          const dataSetReduce = dataSetInfo.filter(
            (item) => item.datasetId === element.datasetId
          );
          const datafeedReduce = feedsInfo.filter(
            (item) => item.datasetId === element.datasetId
          );
          dataSetReduce.length > 0 &&
            dataSetReduce.map((item) => arrayListDataset.push(item.shortName));
          datafeedReduce.length > 0 &&
            datafeedReduce.map((item) =>
              arrayListDatafeed.push(item.shortName)
            );
          arrayOptionStatus.push(element.status);
        });
      setDataSourceDataset([
        ...new Set(arrayListDataset.sort().map((item) => item)),
      ]);
      setDataSourceFeed([
        ...new Set(arrayListDatafeed.sort().map((item) => item)),
      ]);
    }
  };

  const handleSelect = (e) => {
    setSearchStatusValue(e);
  };

  return (
    <div id="main">
      <Form form={form} labelCol={{ span: 24 }}>
        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
          <Col className="gutter-row dataset-content-search" span={5}>
            <Form.Item name="searchDataset" initialValue={undefined}>
              <AutoComplete
                style={{ width: 180 }}
                suffix={<SearchOutlined />}
                name="searchDataset"
                dataSource={dataSourceDataset}
                onChange={(val) => setSearchDataset(val)}
                onSelect={(val) => setSearchDataset(val)}
                value={searchDataset}
                optionLabelProp={searchDataset}
                filterOption={(inputValue, option) =>
                  option.props.children
                    .toUpperCase()
                    .indexOf(inputValue.toUpperCase()) !== -1
                }
              >
                <Input
                  suffix={<SearchOutlined />}
                  placeholder="Search Dataset"
                  onBlur={onFocusDataSet}
                ></Input>
              </AutoComplete>
            </Form.Item>
          </Col>
          <Col className="gutter-row dataset-content-search" span={5}>
            <Form.Item name="searchDatafeed" initialValue={undefined}>
              <AutoComplete
                style={{ width: 180 }}
                dataSource={dataSourceFeed}
                onChange={(val) => setSearchDatafeed(val)}
                onSelect={(val) => setSearchDatafeed(val)}
                value={searchDatafeed}
                optionLabelProp={searchDatafeed}
                filterOption={(inputValue, option) =>
                  option.props.children
                    .toUpperCase()
                    .indexOf(inputValue.toUpperCase()) !== -1
                }
              >
                <Input
                  suffix={<SearchOutlined />}
                  placeholder="Search Data Feed"
                  onBlur={onFocusDataSet}
                ></Input>
              </AutoComplete>
            </Form.Item>
          </Col>
          <Col className="gutter-row dataset-content-search" span={5}>
            <Form.Item name="searchLicense" initialValue={undefined}>
              <AutoComplete
                style={{ width: 180 }}
                dataSource={dataSourceSearchLicense}
                onChange={(val) => setSearchLicense(val)}
                onSelect={(val) => setSearchLicense(val)}
                value={searchLicense}
                optionLabelProp={searchLicense}
                filterOption={(inputValue, option) =>
                  option.props.children
                    .toUpperCase()
                    .indexOf(inputValue.toUpperCase()) !== -1
                }
              >
                <Input
                  suffix={<SearchOutlined />}
                  placeholder="Search Licence"
                  onBlur={onFocusDataSet}
                ></Input>
              </AutoComplete>
            </Form.Item>
          </Col>
          <Col className="gutter-row dataset-content-search" span={5}>
            <Form.Item name="searchStatus" initialValue={undefined}>
              <Select
                placeholder="Search Status"
                style={{ width: "165px" }}
                value={searchStatusValue}
                onSelect={handleSelect}
                onBlur={onFocusDataSet}
              >
                {searchStatus.length > 0 &&
                  searchStatus.map((c) => (
                    <Option key={c} value={c}>
                      {c}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={2}>
            <Button type="secondary" onClick={handleAllReset}>
              Reset
            </Button>
          </Col>
          <Col span={2}>
            <Button type="primary" onClick={handleAllSearch}>
              Apply
            </Button>
          </Col>
        </Row>
      </Form>
      <div className="dashboard-table">
        <Table
          className="contract-nested-table"
          columns={columns}
          size="small"
          defaultExpandAllRows={searchRowEpandable}
          pagination={{
            pageSize: 8,
            hideOnSinglePage: true,
            defaultCurrent: 1,
          }}
          expandedRowRender={expandedRowRender}
          dataSource={searchDatasetDisp}
          scroll={{ y: 420 }}
        />
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    contracts: state.contract.data,
    licenses: state.license.data[0],
    datasets: state.datasetsInfo,
  };
};


export default connect(mapStateToProps)(memo(DataSetData));