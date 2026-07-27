import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { Box, Divider, Typography } from "@mui/material";
import dayjs from "dayjs";

import "./dataset.css";
import LSTable from "./LSTable";

const LicenceScope = () => {
  const [tblData, setTblData] = useState([]);
  const location = useLocation();
  const { licenseById: licenseInfo } = useSelector((state) => state.license);
  const datafeedsInfo = useSelector(
    (infoState) => infoState.datafeedInfo.datafeedsData
  );
  const { agreementById: agreementInfo } = useSelector((state) => state.contract);

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
  const { agreementExpiryDate, agreementScbAgreementMgrBankId, agreementLimitations } =
    agreementInfo ? agreementInfo : {};

  useEffect(() => {
    if (datafeedsInfo && datafeedsInfo.length) {
      const actualFeeds = datafeedsInfo.filter(
        (feed) => feed.licenseId === licenseId
      );
      setTblData(actualFeeds);
    }
  }, [datafeedsInfo]);

  const licensedPurchaised = /^\d+$/.test(licenseNumberOfLicensesPurchaised);
  const licenseLicensesUsed = /^\d+$/.test(
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
    const licenseNoOfLicUsed =
      licenseNumberOfLicensesUsed !== null ? licenseNumberOfLicensesUsed : 0;
    availableLicenses =
      parseInt(licenseNumberOfLicensesPurchaised, 10) -
      parseInt(licenseNoOfLicUsed, 10);
  }

  let licenseExpiryDateDisplay = "-";
  const isStr = /^\s*(true|1|on)\s*$/i.test(licenseNoInheritanceFlag);
  if (isStr) {
    licenseExpiryDateDisplay = dayjs(licenseExpiryDate).format("DD MMM YYYY");
  } else {
    licenseExpiryDateDisplay = agreementExpiryDate
      ? dayjs(agreementExpiryDate).format("DD MMM YYYY")
      : "31 Dec 2099";
  }

  const Bold = ({ children }) => (
    <Typography
      component="span"
      className="label-bold"
      sx={{ fontWeight: 600, color: "text.secondary" }}
    >
      {children}
    </Typography>
  );

  return (
    <Box className="content-wrapper" id="main">
      <Typography
        component="h3"
        className="content-header"
        sx={{ fontWeight: 700, fontSize: 18 }}
      >
        Licence scope
      </Typography>
      <Divider sx={{ my: 2 }} />
      <Box className="cont-parent" sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
        <Box className="cont-left" sx={{ flex: "1 1 320px", minWidth: 320 }}>
          <Box component="ul" className="left-list" id="list" sx={{ pl: 2, m: 0 }}>
            <Box component="li" className="header-longName" sx={{ fontWeight: 600, fontSize: 16, mb: 1 }}>
              {licenseLongName}
            </Box>
            <Box component="li"><Bold>Expiration date</Bold> : {licenseExpiryDateDisplay}</Box>
            <Box component="li"><Bold>Licence type</Bold> : {licenseType}</Box>
            <Box component="li"><Bold>No of available Licences</Bold> : {availableLicenses}</Box>
            <Box component="li"><Bold>SCB Data Owner</Bold> : {agreementScbAgreementMgrBankId || "NA"}</Box>
            <Box component="li" className="list-space" sx={{ mt: 1 }}>
              <Bold>Agreement conditions</Bold> : {agreementLimitations}
            </Box>
            <Box component="li"><Bold>Licence conditions</Bold> : {licenseLimitations}</Box>
          </Box>
        </Box>
        <Box className="cont-right" sx={{ flex: "2 1 480px", minWidth: 320 }}>
          <Bold>{`Data Feeds under the licence (${tblData.length})`}</Bold>
          <LSTable tblData={tblData} />
        </Box>
      </Box>
    </Box>
  );
};

export default LicenceScope;
