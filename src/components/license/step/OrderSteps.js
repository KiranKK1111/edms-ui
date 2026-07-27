import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { startGetContracts } from "../../../store/actions/contractAction";
import {
  setSelectedLicense,
  startGetLicenses,
} from "../../../store/actions/licenseAction";

import LicenseDetails from "../licenseDetails/LicenseDetails";
import ReviewSubmit from "../reviewSubmit/ReviewSubmit";

import { useParams } from "react-router-dom";
import { upload } from "../../../store/actions/licensedataAction";

import LicenseLimitations from "../licenseLimitations/LicenseLimitations";

/*
  OrderStep — the licence wizard body. It is a CONTROLLED component: the generic
  <RecordFormPage> controller (the "component" driver) owns the step index
  (`current`), the validation trigger flag (`formData`) and the step navigation
  (`next`), and renders the stepper + pinned Prev/Next footer + Cancel/Submit so
  the licence screen looks identical to the entity/agreement wizards.

  This component still owns the large shared form state and all the field
  handlers, and renders only the CURRENT step's content. It reports its step
  list to the controller via `onStepsReady`, and reports validity / the latest
  saved snapshot via `isFormValid` / `savedData` (in effects, never during
  render).

  Props (from controller):
    current       number  — active step index
    formData      bool    — when true, the active step validates + advances
    next          fn      — next(true) advance, next(false) reset the trigger
    onStepsReady  fn      — receives [{ key, title }] for the chrome stepper
    isFormValid   fn      — receives true on the last (Review) step
    savedData     fn      — receives the latest state snapshot for the payload
*/
const OrderStep = (props) => {
  const current = props.current || 0;
  const formData = props.formData || false;
  const next = props.next || (() => {});
  const [visible, setVisible] = useState(false);
  const dispatch = useDispatch();
  const info = useSelector((state) => state.contract);
  const licenseinfo = useSelector((state) => state.license);
  const [isLicenseLoaded, setIsLicenseLoaded] = useState(false);
  const didInitRef = React.useRef(false);
  const [isSelectedLicenseUpdated, setIsSelectedLicenseUpdated] =
    useState(false);
  const [isLicenseNameChanged, setIsLicenseNameChanged] = useState(false);
  const [approvedContractList, setApprovedContractList] = useState([]);
  const [columns] = useState([]);
  const [dataSource] = useState([]);

  const params = useParams();
  let selectedLicenseItem;
  const currentDate = new Date();

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
      // Fetch + wizard-slice reset must run exactly ONCE (on mount). Re-running
      // it on every licenseList identity change used to wipe the saved step
      // data mid-wizard — and loop forever when the contracts call was empty.
      if (!didInitRef.current) {
        didInitRef.current = true;
        dispatch(startGetContracts());
        dispatch(startGetLicenses());
        dispatch({ type: "LICENSE_DETAILS", payload: [] });
        dispatch({ type: "USAGE", payload: [] });
        dispatch({ type: "DATASET", payload: [] });
        dispatch({ type: "SUPPORT", payload: [] });
        dispatch({ type: "UPLOAD", payload: [] });
      }
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
        // The route carries the licence SHORT NAME (see VendorData
        // checkUrlSlash), not the id — match both so the fallback works.
        return item.licenseId === params.id || item.licenseShortName === params.id;
      });
      dispatch(setSelectedLicense(selectedLicenseItem));
      if (selectedLicenseItem[0] && selectedLicenseItem[0].technicalDocument) {
        const list = [];
        selectedLicenseItem[0].technicalDocument.split(",").forEach((name) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, setSelectedLicense, licenseinfo.licenseList, info.data]);

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
      content: (
        <LicenseLimitations
          next={next}
          formData={formData}
          registerDraftSaver={props.registerDraftSaver}
        />
      ),
    },
    {
      title: "Review & Submit",
      content: <ReviewSubmit stepsdata={state} />,
    },
  ];
  const stepTitles = ["Licence Details", "Licence Limitations", "Review & Submit"];

  // Report the step list to the controller once so the generic chrome can
  // render the stepper + pinned Prev/Next footer.
  const onStepsReady = props.onStepsReady;
  useEffect(() => {
    if (onStepsReady) onStepsReady(stepTitles.map((t) => ({ key: t, title: t })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Report validity (true only on the last/Review step) to the controller in
  // an effect — never during render (which triggered a React warning).
  const isFormValid = props.isFormValid;
  useEffect(() => {
    if (isFormValid) isFormValid(current === steps.length - 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  // Report the latest snapshot for the submit payload in an effect.
  const savedData = props.savedData;
  state.isUpdated = params.id ? true : false;
  useEffect(() => {
    if (savedData) savedData(state, !current);
  });

  useEffect(() => {
    if (props.modalStatus) setVisible(props.modalStatus);
  }, [props.modalStatus]);

  return (
    <div id="main">
      <Dialog
        open={visible}
        onClose={() => setVisible(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Audit Log</DialogTitle>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table size="small" sx={{ maxHeight: 500 }}>
              <TableHead>
                <TableRow>
                  {columns.map((col) => (
                    <TableCell key={col.key || col.dataIndex || col.title}>
                      {col.title}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {dataSource.map((row, index) => (
                  <TableRow key={row.key || index}>
                    {columns.map((col) => (
                      <TableCell key={col.key || col.dataIndex || col.title}>
                        {col.render
                          ? col.render(row[col.dataIndex], row)
                          : row[col.dataIndex]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVisible(false)}>OK</Button>
        </DialogActions>
      </Dialog>
      <div className="align-content-form">{steps[current].content}</div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    selectedLicense: state.license.selectedLicense,
  };
};

export default connect(mapStateToProps)(OrderStep);
