import { useEffect, memo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Spin, Alert } from "antd";
import { useSelector, useDispatch } from "react-redux";
import Header from "../pages/header/Header";
import Panel from "../components/requestAccess/Panel";

import { RequestFormSteps } from "../components/requestAccess";
import {
  loadDatasetPageData,
  subscriptionTabInfo,
} from "../store/actions/DatasetPageActions";
import { getDataById } from "../store/actions/requestAccessActions";
import {
  SAVE_AS_DRAFT,
  tableInfo,
} from "../store/actions/requestAccessActions";
import { catalogueDetailsData } from "../store/actions/DatasetPageActions";
import { getConfigById } from "../store/actions/datafeedAction";

const RequestAccess = () => {
  const [submitStatus, setSubmitStatus] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const dispatch = useDispatch();
  const { response, isSaveAsDraft } = useSelector(
    (state) => state.requestAccess
  );
  const location = useLocation();

  const locationObj = {};

  let reqTaskStatus = 0;
  let dfId;
  if (location.state) {
    dfId = locationObj.dataFamilyId;
  }
  const catalogueObj = location.state && location.state.data;
  const { dataFeedId, datasetId } = catalogueObj;
  useEffect(() => {
    dispatch(catalogueDetailsData(dataFeedId, datasetId));
    dispatch(getConfigById(dataFeedId));
  }, [dispatch, catalogueObj]);
  useEffect(() => {
    if (isInitialLoad) {
      dispatch({
        type: SAVE_AS_DRAFT,
        payload: [],
        isSaveAsDraft: false,
      });
      setIsInitialLoad(false);
    }
  }, [location, dispatch, dfId]);

  // Update the store based on the subscription ID.
  useEffect(() => {
    if (location.state.data.subscription) {
      let subid = location.state.data.subscription.subscriptionId;
      dispatch(getDataById(subid));
      dispatch(subscriptionTabInfo(subid));
    }
  }, [dispatch, location]);

  const dataFamily = useSelector((state) => state.dataFamily);
  const license = useSelector((state) => state.license);
  const contractManagement = useSelector((state) => state.contractManagement);
  const vendor = useSelector((state) => state.vendor);

  useEffect(() => {
    const { taskStatus, dataFamilyId, dataFamilyName, dataFamilyCreator } =
      dataFamily.data;
    const {
      noOfLicenses,
      dataCoverage,
      createdBy,
      licenseStatus,
      licensesUsed,
    } = license.data;
    const { contractExpDate } = contractManagement.data;
    const { name } = vendor.data;
    const tableValues = {
      taskStatus,
      dataFamilyId,
      dataFamilyName,
      dataFamilyCreator,
      noOfLicenses,
      dataCoverage,
      contractExpDate,
      name,
      createdBy,
      licenseStatus,
      licensesUsed,
    };

    reqTaskStatus = taskStatus;
  }, [dataFamily, license, contractManagement, vendor, dispatch]);

  const formatDate = (selectedDate) => {
    let dateFormat = "";
    if (selectedDate) {
      const date = new Date(selectedDate);

      var month = date.getMonth() + 1;

      var day = date.getDate();

      var year = date.getFullYear();

      dateFormat = day + "/" + month + "/" + year;
    }

    return dateFormat;
  };

  const stepsLength = (value) => {
    setSubmitStatus(value);
    return value;
  };

  const draftMsg = `This is a draft request created on ${formatDate(
    new Date()
  )}.Please  fill in all required fields before you submit for approval.`;
  return (
    <div id="main">
      <div
        className="spin-container"
        style={{ display: response.loading && "flex" }}
      >
        <Spin />
      </div>
      <Header />
      <Panel
        allowSubmit={submitStatus}
        reqTaskStatus={reqTaskStatus}
        subId={""}
      />

      {isSaveAsDraft ? <Alert message={draftMsg} banner /> : ""}
      <div className="content-area">
        <div className="content-wrapper">
          <RequestFormSteps
            contractManagement={contractManagement}
            stepsLength={stepsLength}
          />
        </div>
      </div>
    </div>
  );
};

export default memo(RequestAccess);