import React, { memo } from "react";
import { Grid } from "@mui/material";
import "./ReviewSubmit.css";
import { useSelector } from "react-redux";
import dayjs from "../../../design-system/dayjs";
import { useLocation } from "react-router-dom";
import { Section } from "../../../design-system";

function ReviewSubmit(props) {
  const reduxData = useSelector((state) => state.licenseReq);

  const {
    NoOfLicencePurchased,
    NoOfLicenceUsed,
    dataProcurementType,
    licenceId,
    licenceType,
    licenceValue,
    longName,
    shortName,
    status,
  } =
    reduxData.licenseDetailsRequirements &&
    reduxData.licenseDetailsRequirements.length
      ? reduxData.licenseDetailsRequirements[0]
      : {};

  const expirationDate = dayjs(
    new Date(reduxData.licenseDetailsRequirements[0].expirationDate)
  ).format("YYYY-MM-DD[T]HH:mm:ss");
  const { licenceLimitations } =
    reduxData.support && reduxData.support.length ? reduxData.support[0] : {};

  const {
    licenseName,
    productDescription,
    licenseCost,
    dataCoverage,
    contractName,
    contractId,
    licenseStatus,
    usageModel,
    subscriptionModel,
    subscriptionTypes,
    subscriptionLimits,
    subscriptionLimitsUsed,
    noOfLicenses,
    licensesUsed,
    projectSubscription,
    listSpecificProject,
    displayData,
    userData,
    allowedUserTypes,
    dataValidityAfterUsage,
    contractValidity,
    redistributionAllowed,
    redistributionLimit,
    sampleDataAllowed,
    distributeDerivedData,
    modifyOrDerivedData,
    storageAllowed,
    storageAfterExpiredDate,
    storageExpirationDate,
    sharingAllowed,
    cloudStorage,
    cacheAllowed,
    stagingAllowed,
    personalData,
    securityRating,
    dataValidity,
    metaData,
    metaDataViewPermission,
    issueManagement,
    notifications,
    datesCoveredStart,
    datesCoveredEnd,
    dataExpertFullName,
    dataExpertEmailAddress,
  } = props.stepsdata;
  const location = useLocation();
  const path = location.pathname.includes("addLicense");

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

  const allData = {
    license: [
      { name: "Licence ID", value: licenceId },
      { name: "Long Name", value: longName },
      { name: "Short Name", value: shortName },
      { name: "Licence Type", value: licenceType },
      { name: "Data Procurement Type", value: dataProcurementType },
      { name: "Licence Value", value: licenceValue },
      {
        name: "Expiration Date",
        value: expirationDate
          ? dayjs.utc(expirationDate).format("DD MMM, YYYY")
          : "",
      },
      { name: "No. of Licences Purchased", value: NoOfLicencePurchased },
      { name: "No. of Licence Used", value: NoOfLicenceUsed },
      { name: "Status", value: status },
    ],
    support: [
      {
        name: "Licence Limitations",
        value: licenceLimitations,
      },
    ],
  };

  //toggle No. of Licence Used for Create(hide) & Update(display)
  function checkFieldsDisplay(name) {
    if (name !== "No. of Licence Used") {
      return path ? true : true;
    } else {
      if (name === "No. of Licence Used" && path) {
        return false;
      }
      return true;
    }
  }

  const colSpan = { xs: 12, sm: 12, md: 6, lg: 4, xl: 4 };

  return (
    <div id="main" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {allData ? (
        <>
          <Section title="Licence Details">
            <Grid container spacing={2}>
              {allData.license.map((data, index) =>
                checkFieldsDisplay(data.name) === true ? (
                  <Grid size={colSpan} key={index}>
                    <div className="label-review">{data.name}</div>
                    <div className="name-review" style={{ wordBreak: "break-word" }}>
                      {data.value}
                    </div>
                  </Grid>
                ) : null
              )}
            </Grid>
          </Section>
          <Section title="Licence Limitations">
            <Grid container spacing={2}>
              {allData.support.map((data, index) => (
                <Grid size={12} key={index}>
                  <div className="label-review">{data.name}</div>
                  <div className="name-review" style={{ whiteSpace: "pre-wrap" }}>
                    {data.value}
                  </div>
                </Grid>
              ))}
            </Grid>
          </Section>
        </>
      ) : null}
    </div>
  );
}

export default memo(ReviewSubmit);