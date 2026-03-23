import { Button, Steps, Modal, Table } from "antd";
import "antd/dist/antd.css";
import React, { useEffect, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { startGetContracts } from "../../../store/actions/contractAction";
import {
  setSelectedLicense,
  startGetLicenses,
} from "../../../store/actions/licenseAction";

import LicenseDetails from "../licenseDetails/LicenseDetails";
import ReviewSubmit from "../reviewSubmit/ReviewSubmit";

import { useParams, useHistory } from "react-router-dom";
import { upload } from "../../../store/actions/licensedataAction";

import LicenseLimitations from "../licenseLimitations/LicenseLimitations";

const OrderStep = (props) => {
  const [current, setCurrent] = React.useState(0);
  const [visible, setVisible] = useState(false);
  const dispatch = useDispatch();
  const info = useSelector((state) => state.contract);
  const licenseinfo = useSelector((state) => state.license);
  const [isLicenseLoaded, setIsLicenseLoaded] = useState(false);
  const [isSelectedLicenseUpdated, setIsSelectedLicenseUpdated] =
    useState(false);
  const [isLicenseNameChanged, setIsLicenseNameChanged] = useState(false);
  const [approvedContractList, setApprovedContractList] = useState([]);
  const [columns, setColumns] = useState([]);
  const [btnDisable, setBtnDisable] = useState(false);
  const [dataSource, setDataSource] = useState([]);

  const params = useParams();
  var currentDate = new Date();

  var month = currentDate.getMonth() + 1;

  var day = currentDate.getDate();

  var year = currentDate.getFullYear();

  let dates = day + "/" + month + "/" + year;
  let selectedLicenseItem;

  const [state, setState] = useState({
    licenseName: "",
    contractId: null,
    contractName: null,
    contractOwner: null,
    productDescription: "",
    dataCoverage: "",
    licenseType: null,
    usageModel: "Monthly",
    subscriptionModel: null,
    subscriptionTypes: "full stick",
    subscriptionLimits: "",
    subscriptionLimitsUsed: "",
    noOfLicenses: "",
    projectSubscription: "yes",
    displayData: "yes",
    dataValidityAfterUsage: "yes",
    contractValidity: "yes",
    licensesUsed: "",
    userData: "yes",
    allowedUserTypes: [],
    listSpecificProject: "",
    redistributionAllowed: "yes",
    sampleDataAllowed: "yes",
    redistributionLimit: "",
    modifyOrDerivedData: "yes",
    distributeDerivedData: "yes",
    distributionLimit: "",
    cacheAllowed: "yes",
    stagingAllowed: "yes",
    storageAllowed: "yes",
    storageAfterExpiredDate: "yes",
    sharingAllowed: "yes",
    cloudStorage: "yes",
    personalData: "yes",
    securityRating: "",
    dataValidity: "yes",
    metaData: "yes",
    metaDataViewPermission: "yes",
    issueManagement: "yes",
    notifications: "yes",
    licenseStatus: "",
    licenseCost: null,
    licensesAllowed: "235",
    storageExpirationDate: currentDate,
    datesCoveredStart: currentDate,
    datesCoveredEnd: currentDate,
    dataExpertFullName: "",
    dataExpertEmailAddress: "",
    technicalDocument: "",
  });

  const history = useHistory();

  String.prototype.capitalize = function () {
    return this.replace(/(^|\s)([a-z])/g, function (m, p1, p2) {
      return p1 + p2.toUpperCase();
    });
  };

  const handleTechnicalDocument = (e) => {
    setState((prevState) => ({
      ...prevState,
      technicalDocument: e && e.map((item) => item.name).toString(),
    }));
  };

  const handleStatusChange = (e) => {
    setState((prevState) => ({
      ...prevState,
      licenseStatus: e,
    }));
  };

  const handleContractChange = (e) => {
    let list = [...info.data[0]];
    const found = list.find((item) => item.contractName === e);
    let contractId = found.contractId;
    setState((prevState) => ({
      ...prevState,
      contractId: contractId,
      contractName: found.contractName ? found.contractName : null,
      licenseStatus: found.contractStatus ? found.contractStatus : null,
    }));
  };

  const handleInformationSecurityRating = (e) => {
    setState((prevState) => ({
      ...prevState,
      securityRating: e,
    }));
  };

  const handleExpiryDate = (e) => {
    setState((prevState) => ({
      ...prevState,
      storageExpirationDate: new Date(e),
    }));
  };
  const handledropChange = (e) => {
    setState((prevState) => ({
      ...prevState,
      contractOwner: e,
    }));
  };
  const usageModeldropchange = (e) => {
    setState((prevState) => ({
      ...prevState,
      usageModel: e,
    }));
  };
  const subscriptionModel = (e) => {
    setState((prevState) => ({
      ...prevState,
      subscriptionModel: e,
    }));
  };
  const allowedusertypes = (e) => {
    setState((prevState) => ({
      ...prevState,
      allowedUserTypes: e,
    }));
  };

  const handleLicenseCost = (e) => {
    setState((prevState) => ({
      ...prevState,
      licenseCost: e,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "licenseName") {
      setIsLicenseNameChanged(true);
    }
    setState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  const handleLicenseType = (e) => {
    setState((prevState) => ({
      ...prevState,
      licenseType: e,
    }));
  };

  const handleDataCoverage = (e) => {
    setState((prevState) => ({
      ...prevState,
      dataCoverage: e,
    }));
  };

  const handleCoverdate = (e, e1) => {
    setState((prevState) => ({
      ...prevState,
      datesCoveredStart: new Date(e),
      datesCoveredEnd: new Date(e1),
    }));
  };

  useEffect(() => {
    if (!isLicenseLoaded) {
      dispatch(startGetContracts());
      dispatch(startGetLicenses());
      dispatch({ type: "LICENSE_DETAILS", payload: [] });
      dispatch({ type: "USAGE", payload: [] });
      dispatch({ type: "DATASET", payload: [] });
      dispatch({ type: "SUPPORT", payload: [] });
      dispatch({ type: "UPLOAD", payload: [] });
      if (info && info.data && info.data[0]) {
        const list = info.data[0].filter((contract) => {
          return contract && contract.agreementStatus && contract.agreementStatus.toLowerCase() === "active";
        });
        setApprovedContractList(list);
        setIsLicenseLoaded(true);
      }
    }

    if (params.contractId) {
      dispatch(setSelectedLicense([]));
    } else if (
      (!isSelectedLicenseUpdated &&
        params.id &&
        licenseinfo.licenseList &&
        licenseinfo.licenseList.length &&
        licenseinfo.selectedLicense &&
        !Object.keys(licenseinfo.selectedLicense).length) ||
      (!isSelectedLicenseUpdated &&
        licenseinfo.selectedLicense &&
        licenseinfo.selectedLicense.length) ||
      (!isSelectedLicenseUpdated && !licenseinfo.selectedLicense)
    ) {
      selectedLicenseItem = licenseinfo.licenseList[0].filter((item) => {
        return item.licenseId === params.id;
      });
      dispatch(setSelectedLicense(selectedLicenseItem));
      if (selectedLicenseItem[0] && selectedLicenseItem[0].technicalDocument) {
        const list = [];
        selectedLicenseItem[0].technicalDocument.split(",").map((name) => {
          list.push({ name });
        });
        dispatch(upload(list));
      } else {
        dispatch(upload([]));
      }

      if (params.id) {
        setState((prevState) => ({
          ...prevState,
          ...selectedLicenseItem[0],
        }));
        setIsSelectedLicenseUpdated(true);
      }
    }
  }, [dispatch, setSelectedLicense, licenseinfo.licenseList]);

  const { Step } = Steps;
  const [formData, setFormData] = useState(false);
  const next = (values) => {
    if (current === 5) {
      return setCurrent(current + 1);
    }
    if (values === true) return setCurrent(current + 1);
    setFormData(values === false ? false : true);
  };
  const prev = () => {
    setCurrent(current - 1);
  };

  const steps = [
    {
      title: "Licence Details ",
      content: (
        <LicenseDetails
          next={next}
          formData={formData}
          cotList={approvedContractList}
          licensntraceid={props.licenseID}
          licenseName={state.licenseName}
          contractId={state.contractId}
          contractName={state.contractName}
          contractOwner={state.contractOwner}
          productDescription={state.productDescription}
          dataCoverage={state.dataCoverage}
          licenseType={state.licenseType}
          licenseStatus={state.licenseStatus}
          licenseCost={state.licenseCost}
          handledropChange={(e) => handledropChange(e)}
          handleChange={(e) => handleChange(e)}
          handleContractChange={(e) => handleContractChange(e)}
          handleLicenseType={(e) => handleLicenseType(e)}
          handleLicenseCost={(e) => handleLicenseCost(e)}
          handleDataCoverage={(e) => handleDataCoverage(e)}
          licenseList={licenseinfo.licenseList && licenseinfo.licenseList[0]}
          isLicenseNameChanged={isLicenseNameChanged}
          handleStatusChange={(e) => handleStatusChange(e)}
          licenseID={selectedLicenseItem}
        />
      ),
    },
    {
      title: "Licence Limitations",
      content: <LicenseLimitations next={next} formData={formData} />,
    },
    {
      title: "Review & Submit",
      content: <ReviewSubmit stepsdata={state} />,
    },
  ];
  state.isUpdated = params.id ? true : false;
  props.isFormValid(current === steps.length - 1 ? true : false);
  props.savedData(state, !current ? true : false);
  useEffect(() => {
    if (props.modalStatus) setVisible(props.modalStatus);
  }, [props.modalStatus]);
  return (
    <div id="main">
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
            x: 2000,
          }}
        />
      </Modal>
      <div className="content-wrapper">
        <Steps size="small" current={current}>
          {steps.map((item) => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>
        <div className="steps-content">
          <div className="align-content-form">{steps[current].content}</div>
          <div className="steps-action">
            {current > 0 && (
              <Button style={{ margin: "0 8px" }} onClick={() => prev()}>
                Previous
              </Button>
            )}
            {current < steps.length - 1 && (
              <Button type="primary" onClick={next}>
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    selectedLicense: state.license.selectedLicense,
  };
};

export default connect(mapStateToProps)(OrderStep);