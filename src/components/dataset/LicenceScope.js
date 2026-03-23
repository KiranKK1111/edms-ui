import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { Divider, Col, Row } from "antd";
import moment from "moment";
import "./dataset.css";
import LSTable from "./LSTable";

const LicenceScope = () => {
  const [tblData, setTblData] = useState([]);
  const location = useLocation();
  let catalogueObj =
    location.state && location.state.data ? location.state.data : {};
  const { dataFeedStatus: datafeedStatus, entityShortName } = catalogueObj;
  const { licenseById: licenseInfo } = useSelector((state) => state.license);
  const datafeedsInfo = useSelector(
    (infoState) => infoState.datafeedInfo.datafeedsData
  );
  const { agreementById: agreementInfo } = useSelector(
    (state) => state.contract
  );
  const {
    licenseNumberOfLicensesPurchaised,
    licenseNumberOfLicensesUsed,
    licenseNoInheritanceFlag,
    licenseExpiryDate,
    licenseType,
    licenseLimitations,
    licenseLongName,
    licenseId,
  } = licenseInfo ? licenseInfo : {};
  const {
    agreementExpiryDate,
    agreementScbAgreementMgrBankId,
    agreementLimitations,
  } = agreementInfo ? agreementInfo : {};

  useEffect(() => {
    if (datafeedsInfo && datafeedsInfo.length) {
      let actualFeeds = datafeedsInfo.filter(
        (feed) => feed.licenseId === licenseId
      );
      setTblData(actualFeeds);
    }
  }, [datafeedsInfo]);

  let licensedPurchaised = /^\d+$/.test(licenseNumberOfLicensesPurchaised);
  let licenseLicensesUsed = /^\d+$/.test(
    licenseNumberOfLicensesUsed !== null ? licenseNumberOfLicensesUsed : 0
  );
  let availableLicenses =
    licenseType && licenseType.toLowerCase().includes("enterprise")
      ? "Unlimited"
      : "";
  if (
    licenseType &&
    !licenseType.toLowerCase().includes("enterprise") &&
    licensedPurchaised &&
    licenseLicensesUsed
  ) {
    let licenseNoOfLicUsed =
      licenseNumberOfLicensesUsed !== null ? licenseNumberOfLicensesUsed : 0;
    availableLicenses =
      parseInt(licenseNumberOfLicensesPurchaised) -
      parseInt(licenseNoOfLicUsed);
  }

  let licenseExpiryDateDisplay = "-";
  let str = /^\s*(true|1|on)\s*$/i.test(licenseNoInheritanceFlag);
  if (str) {
    licenseExpiryDateDisplay = moment(licenseExpiryDate).format("DD MMM YYYY");
  } else {
    licenseExpiryDateDisplay = agreementExpiryDate
      ? moment(agreementExpiryDate).format("DD MMM YYYY")
      : "31 Dec 2099";
  }

  const lablelFn = (lable) => {
    return <span className="label-bold">{lable}</span>;
  };

  return (
    <div className="content-wrapper" id="main">
      <h3 className="content-header" style={{ fontWeight: "bold" }}>
        Licence scope
      </h3>
      <Divider />
      <div className="cont-parent">
        <div className="cont-left">
          <ul className="left-list" id="list">
            <li className="header-longName">{licenseLongName}</li>
            <li>
              {lablelFn("Expiration date")} : {licenseExpiryDateDisplay}
            </li>
            {/* <li>
              {lablelFn("Licence type")}: {licenseType}
           </li>*/}
            <li>
              {lablelFn("Licence type")} : {licenseType}
            </li>
            <li>
              {lablelFn("No of available Licences")} : {availableLicenses}
            </li>
            <li>
              {lablelFn("SCB Data Owner")} :
              {agreementScbAgreementMgrBankId
                ? agreementScbAgreementMgrBankId
                : "NA"}
            </li>
            <li className="list-space">
              {lablelFn("Agreement conditions")} : {agreementLimitations}
            </li>
            <li>
              {lablelFn("Licence conditions")} : {licenseLimitations}
            </li>
          </ul>
        </div>
        <div className="cont-right">
          {lablelFn(`Data Feeds under the licence (${tblData.length})`)}
          <LSTable tblData={tblData} />
        </div>
      </div>
    </div>
  );
};

export default LicenceScope;