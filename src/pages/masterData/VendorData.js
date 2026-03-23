//____________ Lib imports
import React, { useEffect, memo, useState } from "react";
import { connect, useDispatch } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { clearDataset } from "../../store/actions/datasetFormActions";

//______________CSS imports
import "./VendorData.css";

//______________Ant imports
import "antd/dist/antd.css";
import { Menu, Dropdown, message } from "antd";
import {
  Modal,
  Tag,
  Table,
  Button,
  Row,
  Col,
  Input,
  Form,
  Select,
  AutoComplete,
} from "antd";
import {
  EditOutlined,
  MinusCircleOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import moment from "moment";

import {
  startUpdateAgreement,
  startDeleteContract,
  startUpdateContract,
  resetState,
  startGetContracts,
} from "../../store/actions/contractAction";
// import { startGetContracts } from "../../store/actions/contractAction";
import {
  startDeleteLicense,
  startUpdateLicense,
  cleanResponse,
  startAddLicense,
  startGetLicenses,
} from "../../store/actions/licenseAction";
import { camelText, checkUrlSlash } from "../../components/stringConversion";
import isAcessMasterDataDisabled from "../../utils/accessMasterData";
import { CamelText } from "../../components/addContract/ContractDetails.js";
import isButtonObject from "../../utils/accessButtonCheck";
import {
  MASTERDATA_MANAGEMENT_PAGE,
  MASTERDATA_AGREMENT_PAGE_AND_BUTTON,
  MASTERDATA_LICENSE_PAGE_BUTTON,
  MASTERDATA_ADD_DATASET_PAGES_BUTTON,
} from "../../utils/Constants";
import { warning } from "../../utils/warningUtils.js";

const { Option } = Select;
//* VENDOR DATA - CALLED FROM VENDOR DASHBOARD TO DISPLAY CONTRACTS AND LICENSE FOR A VENDOR USING EXPANDABLE TABLE
const VendorData = (props) => {
  //* LOCAL VARIABLES
  let licenceList = props.licenses;
  let dataContract = [];
  let dataLicenses = [];
  let agreementLicenses = [];
  let agreementNameDetails = [];
  let vendorID = props.vendorId;
  let ContractDeleteMessage;
  let ContractSuspendMessage;

  let disableLicenseEdit = false;
  let disableLicenseMore = false;
  let disableContractEdit = false;
  let disableAddLicense = false;
  let disableContractMore = false;

  const history = useHistory();
  const greenStatus = ["approved", "live", "active", "setup"];
  const greenTaskStatus = ["approved"];
  const enableButton = ["approved", "rejected"];
  const dispatch = useDispatch();

  //Select Fields Values
  const [searchAgreement, setSearchAgreements] = useState(undefined);
  const [searchLicence, setSearchLicence] = useState(undefined);
  const [searchStatusValue, setSearchStatusValue] = useState(undefined);

  //For Options Arrays by name []
  const [dataSourceAgreements, setDataSourceAgreements] = useState([]);
  const [dataSourceLicence, setDataSourceLicence] = useState([]);
  const [searchStatus, setSearchStatus] = useState([
    "Active",
    "Inactive",
    "Pending",
  ]);

  // Filtered arrays for Apply
  const [searchLicenceValues, setSearchLicenceValues] = useState([]);

  useEffect(() => {
    dispatch(clearDataset());
    dispatch(cleanResponse());
  }, []);

  const isMasterDataDisabled = isAcessMasterDataDisabled();

  //*************************************************************************************************//

  const handleContractDelete = (Data) => {
    let dataObj = { ...Data };
    let licenceListByAgreement = licenceList.filter((id) => {
      return dataObj.agreementId === id.licenseAgreementId;
    });
    let licenceStatusArr = licenceListByAgreement.find((sub) => {
      return (
        sub.licenseStatus.toLowerCase() === "active" ||
        sub.licenseStatus.toLowerCase() === "pending"
      );
    });
    if (licenceStatusArr && licenceListByAgreement.length > 0) {
      Modal.confirm({
        title: (
          <h3>
            <b>Unable to Deactivate Agreement! </b>{" "}
          </h3>
        ),
        content: `Status of licence(s) under this Agreement is still active.`,
        okButtonProps: { style: { display: "none" } },
        cancelText: "Ok",
      });
    } else {
      Modal.confirm({
        title: (
          <h3>
            <b>Deactivate Agreement ? </b>{" "}
          </h3>
        ),
        content: "Are you sure you want to proceed?",
        okText: "Deactivate",
        okButtonProps: { style: { backgroundColor: "#FF4C4F", border: 0 } },
        onOk: async () => {
          dataObj.agreementStatus = "Deactivate";
          dataObj.agreementUpdateFlag = "Y";
          dataObj.agreementLastUpdatedBy = localStorage.getItem("psid");
          //For Extra-parameters removal
          delete dataObj.contractId;
          delete dataObj.key;
          delete dataObj.AGREEMENTEDMSENTIRYID;
          delete dataObj.contractName;
          delete dataObj.licenses;
          delete dataObj.expiryDate;
          delete dataObj.taskStatus;
          delete dataObj.vendorId;
          const res = await startUpdateAgreement(dataObj);
          if (res && res.data) {
            message.success(
              "Agreement deactivation request submitted successfully."
            );
          }
          props.dispatch(startGetContracts());
        },
      });
    }
  };

  const handleContractSuspend = (Data) => {
    let dataObj = { ...Data };
    dataObj["createdBy"] = localStorage.getItem("psid");
    dataObj["contractStatus"] = "Suspended";
    if (Data.licenses > 0) {
      ContractSuspendMessage = `There are Licences under this Contract. To complete this action,
        Please ensure there are no licences under this contract.`;
    } else {
      ContractSuspendMessage = `Your request to Suspend Contract will be submitted for approval.
        Do you want to proceed ?`;
    }
    Modal.confirm({
      title: (
        <h3>
          <b>Suspend Contract ? </b>{" "}
        </h3>
      ),
      content: ContractSuspendMessage,
      onOk() {
        Data.contractStatus = "suspended";
        props.dispatch(startUpdateContract(dataObj));
      },
    });
  };

  const handleLicenseDelete = (LicenseData) => {
    let dataObj = { ...LicenseData };
    dataObj["createdBy"] = localStorage.getItem("psid");
    Modal.confirm({
      title: (
        <h3>
          <b>Delete Licence ? </b>{" "}
        </h3>
      ),
      content: `This will delete the Licence under this contract.
        All subscribers will be impacted. Are you sure you want to proceed?.`,
      okText: "Delete",
      okType: "danger",
      onOk() {
        props.dispatch(startDeleteLicense(dataObj));
      },
    });
  };

  const handleLicenseSuspend = (LicenseData) => {
    let dataObj = { ...LicenseData };
    dataObj["createdBy"] = localStorage.getItem("psid");
    dataObj["licenseStatus"] = "Suspended";
    Modal.confirm({
      title: (
        <h3>
          <b>Suspend Licence ? </b>{" "}
        </h3>
      ),
      content: `This will Suspend the licence.
        All subscribers will be impacted. Are you sure you want to proceed?`,
      onOk() {
        LicenseData.taskStatus = "pending";
        props.dispatch(startUpdateLicense(dataObj));
      },
    });
  };

  //Deactivate License
  const handleLicenseDeactivate = (LicenseData) => {
    //console.log("Props = ",props);
    //console.log("Dataset = ", props.datasets);
    //console.log("LicenseData = ",LicenseData)

    let dataObj = { ...LicenseData };
    let datasetList = props.datasets;
    let datasetListByLicense = datasetList.filter((ds) => {
      return LicenseData.licenseId === ds.licenseId;
    });

    delete dataObj.key;
    delete dataObj.id;
    delete dataObj.name;
    delete dataObj.expiryDate;
    delete dataObj.status;
    delete dataObj.taskStatus;
    delete dataObj.LICECONTRACT;
    delete dataObj.datasets;
    delete dataObj.contractId;
    delete dataObj.licenseName;

    let dsStatusArr = datasetListByLicense.find((ds) => {
      return (
        ds.datasetStatus.toLowerCase() === "active" ||
        ds.datasetStatus.toLowerCase() === "pending"
      );
    });
    if (dsStatusArr && datasetListByLicense.length > 0) {
      Modal.confirm({
        title: (
          <h3>
            <b>Unable to deactivate Licence! </b>{" "}
          </h3>
        ),
        content: "Status of Dataset(s) under this Licence is still active.",
        okButtonProps: { style: { display: "none" } },
        cancelText: "Ok",
      });
    } else {
      Modal.confirm({
        title: (
          <h3>
            <b>Deactivate Licence? </b>{" "}
          </h3>
        ),
        content: "Are you sure you want to proceed?",
        okText: "Deactivate",
        okButtonProps: { style: { backgroundColor: "#FF4C4F", border: 0 } },
        onOk: async () => {
          dataObj.licenseStatus = "Deactivate";
          dataObj.licenseUpdateFlag = "Y";
          dataObj.licenseLastUpdatedBy = localStorage.getItem("psid");
          dataObj.isUpdate = true;
          const res = await dispatch(startAddLicense(dataObj));
          if (res && res.data) {
            message.success(
              "Licence deactivation request submitted successfully."
            );
          }
        },
      });
    }
    // console.log("Datasets belonging = ",datasetListByLicense);
  };

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

  const isAgreementDisabled = isButtonObject(
    MASTERDATA_MANAGEMENT_PAGE,
    MASTERDATA_AGREMENT_PAGE_AND_BUTTON
  );
  const isLicenceDisabled = isButtonObject(
    MASTERDATA_MANAGEMENT_PAGE,
    MASTERDATA_LICENSE_PAGE_BUTTON
  );

  const isDatasetDisabled = isButtonObject(
    MASTERDATA_MANAGEMENT_PAGE,
    MASTERDATA_ADD_DATASET_PAGES_BUTTON
  );

  const isDisableContractMore = isAgreementDisabled || disableContractMore;
  const isDisableLicenseEdit = isLicenceDisabled || disableLicenseEdit;
  const isDisableLicenseMore = isLicenceDisabled || disableLicenseMore;

  const moreLicensesMenu = (LicenseData, row, item) => {
    let liscShortName = checkUrlSlash(item.name);
    const moreLicense = (
      <Menu className="more-license-menu">
        <Menu.Item>
          <span>
            {item.licenseUpdateFlag.toLowerCase() === "n" ? (
              <Link
                to={{
                  pathname: `/masterData/${liscShortName}/modifylicense`,
                  state: { vendorId: vendorID, record: item },
                }}
              >
                <Button
                  className="linkButton"
                  type="link"
                  //disabled={isDisableLicenseEdit}
                  onClick={() =>
                    localStorage.setItem("agRecord", JSON.stringify(row))
                  }
                >
                  <EditOutlined /> Edit
                </Button>
              </Link>
            ) : (
              <Button
                className="linkButton"
                type="link"
                onClick={warning}
              //disabled={isDisableLicenseEdit}
              >
                <EditOutlined /> Edit
              </Button>
            )}
          </span>
        </Menu.Item>

        {LicenseData.licenseStatus.toLowerCase() === "active" &&
          LicenseData.licenseUpdateFlag.toString().toLowerCase() === "n" ? (
          <Menu.Item
            className="warn-menu"
            onClick={() => handleLicenseDeactivate(LicenseData)}
          >
            <span>
              <MinusCircleOutlined /> Deactivate
            </span>
          </Menu.Item>
        ) : LicenseData.licenseStatus.toLowerCase() === "active" &&
          LicenseData.licenseUpdateFlag.toString().toLowerCase() === "y" ? (
          <Menu.Item className="warn-menu" onClick={warning}>
            <span>
              <MinusCircleOutlined /> Deactivate
            </span>
          </Menu.Item>
        ) : (
          <Menu.Item className="warn-menu" disabled>
            <span>
              <MinusCircleOutlined /> Deactivate
            </span>
          </Menu.Item>
        )}
      </Menu>
    );
    return moreLicense;
  };
  //*************************************************************************************************//
  const expandedRowRender = (row, expandable) => {
    let storingId = 0;
    const columns = [
      {
        title: <b>Licence Name</b>,
        key: "licenseShortName",
        width: "20%",
        render: (item) => {
          let liscShortName = checkUrlSlash(item.name);
          return (
            <div>
              {item.licenseUpdateFlag.toLowerCase() === "n" ? (
                <Link
                  to={{
                    pathname: `/masterData/${liscShortName}/modifylicense`,
                    state: { vendorId: vendorID, record: item },
                  }}
                  onClick={() =>
                    localStorage.setItem("agRecord", JSON.stringify(row))
                  }
                >
                  {" "}
                  {item.licenseShortName}
                  {/*<Button
                    className="linkButton"
                    type="link"
                    //disabled={isDisableLicenseEdit}
                    onClick={() =>
                      localStorage.setItem("agRecord", JSON.stringify(row))
                    }
                  >
                    {item.licenseShortName}
                  </Button>*/}
                </Link>
              ) : (
                <Link onClick={warning}>
                  {item.licenseShortName}
                  {/*<Button
                  className="linkButton"
                  type="link"
                  onClick={warning}
                  //disabled={isDisableLicenseEdit}
                >
                  {item.licenseShortName}
                </Button>*/}
                </Link>
              )}
            </div>
          );
        },
      },
      {
        title: <b>Licence ID</b>,
        dataIndex: "id",
        key: "id",
        render: (id) => {
          storingId = id;
          return <div> {id} </div>;
        },
      },
      {
        title: <b>Datasets</b>,
        dataIndex: "datasets",
        key: "datasets",
      },

      {
        title: <b>Expiration Date</b>,
        dataIndex: "expiryDate",
        key: "expiryDate",
        render: (itemDate) => {
          return (
            <div>{itemDate ? moment(itemDate).format("DD MMM YYYY") : "-"}</div>
          );
        },
      },

      {
        title: (
          <div className="expDate-styling">
            <b>Status</b>{" "}
          </div>
        ),
        dataIndex: "status",
        key: "status",
        render: (status) => {
          if (status) {
            if (greenStatus.includes(status.toLowerCase())) {
              return (
                <div className="licenseStatus-styling">
                  <Tag color="green"> {status} </Tag>{" "}
                </div>
              );
            } else {
              return <Tag color="orange"> {camelText(status)} </Tag>;
            }
          }
        },
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
          return (
            <div>
              <Button
                type="link"
                disabled={
                  isDatasetDisabled ||
                  (LicenseData &&
                    LicenseData.licenseStatus &&
                    (LicenseData.licenseStatus.toLowerCase() === "pending" ||
                      LicenseData.licenseStatus.toLowerCase() === "inactive"))
                }
                onClick={() => {
                  history.push({
                    pathname: `/masterData/${LicenseData.licenseShortName}/dataset`,
                    state: {
                      licence: LicenseData,
                      isUpdate: false,
                      eid: row.agreementEdmsEntiryId,
                    },
                  });
                }}
              >
                <b>Add Dataset</b>
              </Button>
              <Dropdown
                overlay={() => moreLicensesMenu(LicenseData, row, record)}
                placement="bottomLeft"
                arrow
                disabled={isDisableLicenseMore}
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

    agreementLicenses = [];
    const FilteredLicenses = dataLicenses
      ? dataLicenses.filter((license, i) => {
        if (license.LICECONTRACT === row.agreementId) {
          const licenseCount = props.datasets.filter(
            (dataSet) => dataSet.licenseId === license.licenseId
          ).length;
          agreementLicenses.push({
            ...license,
            key: i,
            datasets: licenseCount,
          });
        }
      })
      : [];

    agreementNameDetails = [];
    /*const FilteredAgreement = dataContract
      ? dataContract.filter((agreement, i) => {
          if (agreement.contractId === row.agreementId) {
            agreementNameDetails.push({
              ...agreement,
              key: i,
            });
          }
        })
      : [];*/

    return (
      <Table
        columns={columns}
        className="license-nested-table"
        dataSource={agreementLicenses}
        pagination={false}
        rowKey={agreementLicenses.key}
        title={() => {
          let licButtonDispflag =
            !isLicenceDisabled &&
              agreementNameDetails[0] &&
              agreementNameDetails[0].agreementStatus &&
              ((agreementNameDetails[0] &&
                agreementNameDetails[0].agreementStatus.toLowerCase() ===
                "active") ||
                (agreementNameDetails[0] &&
                  agreementNameDetails[0].agreementStatus.toLowerCase() ===
                  "planned"))
              ? false
              : true;
          return <b>{"Licences"}</b>;
        }}
      />
    );
  };

  const checkAgreementUpdateFlag = (Data, flag) => {
    let returnCheck = false;
    if (Data !== null && Data.agreementUpdateFlag !== null && flag === "Y") {
      returnCheck =
        Data.agreementUpdateFlag.toString().toLowerCase() === "y" &&
          (Data.agreementStatus.toLowerCase() === "pending" ||
            Data.agreementStatus.toLowerCase() === "active")
          ? true
          : false;
    }
    return returnCheck;
  };
  //*************************************************************************************************//

  const moreContractMenu = (Data) => {
    localStorage.setItem("agId", Data.agreementId);
    localStorage.setItem("entityIdInfo", Data.agreementEdmsEntiryId);

    const moreInMenu = (
      <Menu className="more-menu">
        <Menu.Item
          className="edit-vendor-menu"
        // onClick={() => handleContractSuspend(Data)}
        >
          <span>
            {Data.agreementUpdateFlag.toLowerCase() === "n" ? (
              <Link
                disabled={isAgreementDisabled}
                to={`/masterData/${props.entityName}/modifyAgreement`}
                onClick={() => {
                  localStorage.setItem("agId", Data.agreementId);
                  localStorage.setItem(
                    "entityIdInfo",
                    Data.agreementEdmsEntiryId
                  );
                }}
                className="agreementname-disp"
              >
                <EditOutlined /> Edit{" "}
              </Link>
            ) : (
              <Link onClick={warning} disabled={isAgreementDisabled}>
                <EditOutlined /> Edit{" "}
              </Link>
            )}
          </span>
        </Menu.Item>
        {checkAgreementUpdateFlag(Data, "Y") ? (
          <Menu.Item className="warn-vendor-menu" onClick={warning}>
            <span>
              <MinusCircleOutlined /> <b>Deactivate</b>
            </span>
          </Menu.Item>
        ) : (
          <Menu.Item
            className="warn-vendor-menu"
            onClick={() => handleContractDelete(Data)}
            disabled={
              Data.agreementStatus.toLowerCase() === "inactive" ||
              (Data.agreementUpdateFlag.toString().toLowerCase() === "n" &&
                Data.agreementStatus.toLowerCase() === "pending") ||
              (Data.agreementUpdateFlag.toString().toLowerCase() === "y" &&
                Data.agreementStatus.toLowerCase() === "active")
            }
          >
            <span>
              <MinusCircleOutlined /> <b>Deactivate</b>
            </span>
          </Menu.Item>
        )}
      </Menu>
    );
    return moreInMenu;
  };

  const columns = [
    {
      title: <b>Agreement Name</b>,
      key: "agreementName",
      width: "20%",
      ellipsis: false,
      sorter: (a, b) => a.agreementName.localeCompare(b.agreementName),
      render: (item) => {
        return (
          <div>
            {item &&
              item.agreementUpdateFlag &&
              item.agreementUpdateFlag.toLowerCase() === "n" ? (
              <Link
                to={`/masterData/${props.entityName}/modifyAgreement`}
                onClick={() => {
                  localStorage.setItem("agId", item.agreementId);
                  localStorage.setItem(
                    "entityIdInfo",
                    item.agreementEdmsEntiryId
                  );
                }}
                className="agreementname-disp"
              >
                {item.agreementName}
              </Link>
            ) : (
              <Link
                to={`/masterData/${props.entityName}/modifyAgreement`}
                onClick={warning}
              // disabled={isAgreementDisabled}
              >
                {item.agreementName}
              </Link>
            )}
          </div>
        );
      },
    },
    {
      title: <b>Agreement ID</b>,
      dataIndex: "agreementId",
      key: "agreementId",
      width: "25%",
      ellipsis: false,
      sorter: (a, b) => a.agreementId.localeCompare(b.agreementId),
      render: (item) => {
        return <div>{item} </div>;
      },
    },

    {
      title: <b>Licences</b>,
      dataIndex: "licenses",
      key: "licenses",
      width: "12%",
      ellipsis: false,
      sorter: (a, b) => a.licenses.toString().localeCompare(b.licenses),
      render: (item) => {
        return <div> {item}</div>;
      },
    },

    {
      title: (
        <div className="expDate-styling">
          <b>Expiration Date</b>
        </div>
      ),
      dataIndex: "agreementExpiryDate",
      key: "agreementExpiryDate",
      width: "17%",
      ellipsis: false,
      sorter: (a, b) => {
        return (
          new Date(a.agreementExpiryDate) - new Date(b.agreementExpiryDate)
        );
      },
      render: (expiryDate) => {
        return (
          <div className="expDate-styling">
            {expiryDate
              ? moment(expiryDate).format("DD MMM YYYY")
              : "No Expiry"}
          </div>
        );
      },
    },

    {
      title: <b>Status</b>,
      dataIndex: "agreementStatus",
      key: "agreementStatus",
      width: "10%",
      sorter: (a, b) => a.agreementStatus.localeCompare(b.agreementStatus),
      render: (agreementStatus) => {
        if (greenStatus.includes(agreementStatus.toLowerCase())) {
          return <Tag color="green"> {agreementStatus} </Tag>;
        } else {
          return <Tag color="orange"> {CamelText(agreementStatus)} </Tag>;
        }
      },
    },

    {
      title: <b>Actions</b>,
      key: "actions",
      width: "15%",
      render: (record) => {
        const PassData = {
          ...record,
          contractId: record.contractId,
          contractName: record.contractName,
          vendorId: vendorID,
          taskStatus: "Pending",
          licenses: record.licenses,
          contractStatus: record.contractStatus,
        };
        let licenceButtonDispflag =
          !isLicenceDisabled &&
            record &&
            (record.agreementStatus.toLowerCase() === "active" ||
              record.agreementStatus.toLowerCase() === "planned")
            ? false
            : true;
        let addLicenceAgreementName = checkUrlSlash(record.agreementName);
        return (
          <div className="contract-actions">
            <Link
              to={{
                pathname: `/masterData/${addLicenceAgreementName}/addLicense`,
              }}
              onClick={() =>
                localStorage.setItem("agRecord", JSON.stringify(record))
              }
              disabled={isDisableLicenseEdit || licenceButtonDispflag}
            >
              <b>Add Licence</b>
            </Link>
            <Dropdown
              overlay={() => moreContractMenu(PassData)}
              placement="bottomLeft"
              arrow
              disabled={isDisableContractMore}
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

  const dataMyContract = props.contracts[0].filter((ele, i) => {
    let agreementLicenceCount = 0;
    //console.log("Props.Licenses = ",props.licenses);
    //console.log("Props = ",props)
    if (props.licenses) {
      agreementLicenceCount =
        props.licenses &&
        props.licenses.filter(
          (licInfo) => licInfo.licenseAgreementId === ele.agreementId
        ).length;
    }
    const Licenses =
      searchLicenceValues && searchLicenceValues.length > 0
        ? searchLicenceValues.filter(
          (lice) => lice.licenseAgreementId === ele.agreementId
        )
        : props && props.licenses && props.licenses.length
          ? props.licenses.filter(
            (lice) => lice.licenseAgreementId === ele.agreementId
          )
          : [];

    if (ele.agreementEdmsEntiryId === vendorID) {
      dataContract.push({
        ...ele,
        key: i,
        contractId: ele.agreementId,
        AGREEMENTEDMSENTIRYID: ele.agreementEdmsEntiryId,
        contractName: ele,
        licenses: agreementLicenceCount,
        expiryDate: ele.contractExpDate
          ? moment(ele.contractExpDate).format("DD MMM, YYYY")
          : moment().format("DD MMM, YYYY"),
        status: ele.contractStatus,
        taskStatus: ele.taskStatus,
      });

      if (Licenses.length > 0) {
        Licenses.map((lice, g) =>
          dataLicenses.push({
            ...lice,
            key: g,
            id: lice.licenseId,
            name: lice.licenseShortName,
            expiryDate: moment(lice.licenseExpiryDate).format("DD MMM, YYYY"),
            status: lice.licenseStatus,
            taskStatus: lice.licenseStatus,
            LICECONTRACT: lice.licenseAgreementId,
            datasets: 0,
          })
        );
      }
    }
  });

  const [form] = Form.useForm();

  const [searchDatasetDisp, setSearchDatasetDisp] = useState(
    dataContract || []
  );

  useEffect(() => {
    setSearchDatasetDisp(dataContract);
  }, [vendorID]);

  useEffect(() => {
    handleAllSearch();
    if (dataContract && dataContract.length > 0) {
      setSearchDatasetDisp(dataContract);
    }
  }, []);

  const handleAllReset = async () => {
    form.resetFields();
    setSearchLicence(undefined);
    setSearchStatusValue(undefined);
    setSearchAgreements(undefined);
    setSearchDatasetDisp(dataContract);
    setSearchLicenceValues(props.licenses);
  };

  useEffect(() => {
    handleAllReset();
  }, [props.licenses, vendorID, props.handleTabClick, props.contracts]);

  const initialDataSearchArray = () => {
    let arrayListAgreements = [];
    let arrayListLic = [];
    const licenceInfo =
      props.licenses && props.licenses.length > 0 ? props.licenses : [];
    searchDatasetDisp.length > 0 &&
      searchDatasetDisp.forEach((element) => {
        const licenceFilter = licenceInfo.filter(
          (item) => item.licenseAgreementId === element.agreementId
        );
        licenceFilter.length > 0 &&
          licenceFilter.map((item) => arrayListLic.push(item.licenseShortName));
        arrayListAgreements.push(element.agreementName);
      });
    setDataSourceAgreements([
      ...new Set(arrayListAgreements.map((item) => item)),
    ]);
    setDataSourceLicence([...new Set(arrayListLic.map((item) => item))]);
  };
  useEffect(() => {
    initialDataSearchArray();
  }, [searchDatasetDisp, props.licenses]);

  useEffect(() => {
    if (!searchAgreement && !searchLicence) {
      initialDataSearchArray();
    }
  }, [searchAgreement, searchLicence]);

  const onFocusAgreement = (e) => {
    let arrayListAgreementSet = [];
    let arrayListLic = [];
    const allLicInfo = props.licenses;
    if (e.currentTarget.id === "searchAgreement" && searchAgreement) {
      const agreementSetInfo = searchDatasetDisp.filter((item) =>
        item.agreementName.toLowerCase().includes(searchAgreement.toLowerCase())
      );
      agreementSetInfo.length > 0 &&
        allLicInfo.length > 0 &&
        agreementSetInfo.forEach((element) => {
          const licenceReduce = allLicInfo.filter(
            (item) => item.licenseAgreementId === element.agreementId
          );
          licenceReduce.length > 0 &&
            licenceReduce.map((item) =>
              arrayListLic.push(item.licenseShortName)
            );
        });
      setDataSourceLicence([...new Set(arrayListLic.map((item) => item))]);
    }
    if (e.currentTarget.id === "searchLicence" && searchLicence) {
      const licInfo =
        allLicInfo.length > 0 &&
        allLicInfo.filter((item) =>
          item.licenseShortName
            .toLowerCase()
            .includes(searchLicence.toLowerCase())
        );
      licInfo.length > 0 &&
        licInfo.forEach((element) => {
          const agreementInfo =
            searchDatasetDisp.length > 0 &&
            searchDatasetDisp.filter(
              (item) => item.agreementId === element.licenseAgreementId
            );
          agreementInfo.length > 0 &&
            agreementInfo.forEach((item) => {
              arrayListAgreementSet.push(item.agreementName);
              arrayListLic.push(element.licenseShortName);
            });
        });
      setDataSourceAgreements([
        ...new Set(arrayListAgreementSet.sort().map((item) => item)),
      ]);
      setDataSourceLicence([
        ...new Set(arrayListLic.sort().map((item) => item)),
      ]);
    }
  };

  const handleSelect = (e) => {
    setSearchStatusValue(e);
  };

  const handleAllSearch = (e) => {
    let filterValueAgreementDisplay = [];
    const allLicInfo = props.licenses;
    if (searchAgreement && searchLicence && searchStatusValue) {
      const licFilter = allLicInfo.filter(
        (item) =>
          item.licenseShortName
            .toLowerCase()
            .includes(searchLicence.toLowerCase()) &&
          item.licenseStatus
            .toLowerCase()
            .includes(searchStatusValue.toLowerCase())
      );
      setSearchLicenceValues(licFilter);
      setDataSourceLicence([
        ...new Set(licFilter.map((item) => item.licenseShortName)),
      ]);
      const agreementIds = [
        ...new Set(licFilter.map((item) => item.licenseAgreementId)),
      ];
      let agreementActual = [];
      dataContract.forEach((element, i) => {
        if (
          agreementIds.includes(element.agreementId) &&
          element.agreementName
            .toLowerCase()
            .includes(searchAgreement.toLowerCase())
        ) {
          agreementActual.push(element);
        }
      });
      setSearchDatasetDisp(agreementActual);
    } else if (searchAgreement && searchLicence && !searchStatusValue) {
      const licFilter = allLicInfo.filter((item) =>
        item.licenseShortName
          .toLowerCase()
          .includes(searchLicence.toLowerCase())
      );
      setSearchLicenceValues(licFilter);
      const agreementIds = [
        ...new Set(licFilter.map((item) => item.licenseAgreementId)),
      ];
      let agreementActual = [];
      dataContract.forEach((element, i) => {
        if (
          agreementIds.includes(element.agreementId) &&
          element.agreementName
            .toLowerCase()
            .includes(searchAgreement.toLowerCase())
        ) {
          agreementActual.push(element);
        }
      });
      setSearchDatasetDisp(agreementActual);
    } else if (searchAgreement && !searchLicence && searchStatusValue) {
      filterValueAgreementDisplay = dataContract.filter(
        (item) =>
          item.agreementStatus
            .toLowerCase()
            .includes(searchStatusValue.toLowerCase()) &&
          item.agreementName
            .toLowerCase()
            .includes(searchAgreement.toLowerCase())
      );
      setSearchDatasetDisp(filterValueAgreementDisplay);
    } else if (searchAgreement && !searchLicence && !searchStatusValue) {
      filterValueAgreementDisplay = dataContract.filter((item) =>
        item.agreementName.toLowerCase().includes(searchAgreement.toLowerCase())
      );
      setSearchDatasetDisp(filterValueAgreementDisplay);
    } else if (!searchAgreement && searchLicence && searchStatusValue) {
      const licFilter = allLicInfo.filter(
        (item) =>
          item.licenseShortName
            .toLowerCase()
            .includes(searchLicence.toLowerCase()) &&
          item.licenseStatus
            .toLowerCase()
            .includes(searchStatusValue.toLowerCase())
      );
      setSearchLicenceValues(licFilter);
      const agreementIds = [
        ...new Set(licFilter.map((item) => item.licenseAgreementId)),
      ];
      let agreementActual = [];
      dataContract.forEach((element, i) => {
        if (agreementIds.includes(element.agreementId)) {
          agreementActual.push(element);
        }
      });
      setSearchDatasetDisp(agreementActual);
    } else if (!searchAgreement && searchLicence && !searchStatusValue) {
      const licFilter = allLicInfo.filter((item) =>
        item.licenseShortName
          .toLowerCase()
          .includes(searchLicence.toLowerCase())
      );
      setSearchLicenceValues(licFilter);
      const agreementIds = [
        ...new Set(licFilter.map((item) => item.licenseAgreementId)),
      ];
      let agreementActual = [];
      dataContract.forEach((element, i) => {
        if (agreementIds.includes(element.agreementId)) {
          agreementActual.push(element);
        }
      });
      setSearchDatasetDisp(agreementActual);
    } else if (!searchAgreement && !searchLicence && searchStatusValue) {
      setSearchLicenceValues(allLicInfo);
      filterValueAgreementDisplay = dataContract.filter((item) =>
        item.agreementStatus
          .toLowerCase()
          .includes(searchStatusValue.toLowerCase())
      );
      setSearchDatasetDisp(filterValueAgreementDisplay);
    } else {
      handleAllReset();
    }
  };

  return (
    <div id="main">
      <Form form={form} labelCol={{ span: 24 }}>
        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
          <Col className="gutter-row dataset-content-search" span={6}>
            <Form.Item name="searchAgreement" initialValue={undefined}>
              <AutoComplete
                suffix={<SearchOutlined />}
                name="searchAgreement"
                dataSource={dataSourceAgreements}
                onChange={(val) => setSearchAgreements(val)}
                onSelect={(val) => setSearchAgreements(val)}
                value={searchAgreement}
                optionLabelProp={searchAgreement}
                filterOption={(inputValue, option) =>
                  option.props.children
                    .toUpperCase()
                    .indexOf(inputValue.toUpperCase()) !== -1
                }
              >
                <Input
                  suffix={<SearchOutlined />}
                  placeholder="Search Agreement"
                  onBlur={onFocusAgreement}
                ></Input>
              </AutoComplete>
            </Form.Item>
          </Col>
          <Col className="gutter-row dataset-content-search" span={6}>
            <Form.Item name="searchLicence" initialValue={undefined}>
              <AutoComplete
                dataSource={dataSourceLicence}
                onChange={(val) => setSearchLicence(val)}
                onSelect={(val) => setSearchLicence(val)}
                value={searchLicence}
                optionLabelProp={searchLicence}
                filterOption={(inputValue, option) =>
                  option.props.children
                    .toLowerCase()
                    .indexOf(inputValue.toLowerCase()) !== -1
                }
              >
                <Input
                  suffix={<SearchOutlined />}
                  placeholder="Search Licence"
                  onBlur={onFocusAgreement}
                ></Input>
              </AutoComplete>
            </Form.Item>
          </Col>
          <Col className="gutter-row dataset-content-search" span={5}>
            <Form.Item name="searchStatus" initialValue={undefined}>
              <Select
                placeholder="Search Status"
                value={searchStatusValue}
                onSelect={handleSelect}
              // onBlur={onFocusAgreement}
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

          <Col span={2} style={{ marginLeft: "70px" }}>
            <Button type="secondary" onClick={handleAllReset}>
              Cancel
            </Button>
          </Col>
          <Col span={2} style={{ marginLeft: "20px" }}>
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
          pagination={{
            pageSize: 8,
            hideOnSinglePage: true,
            defaultCurrent: 1,
          }}
          expandedRowRender={expandedRowRender}
          dataSource={searchDatasetDisp}
          scroll={{ y: 500 }}
        />
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    contracts: state.contract.data,
    licenses:
      state && state.license && state.license.data && state.license.data[0],
    vendors: state.vendor.list,
    datasets: state.dataset.datasetsInfo,
  };
};

export default connect(mapStateToProps)(memo(VendorData));