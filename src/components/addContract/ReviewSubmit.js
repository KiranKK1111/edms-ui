import { Grid } from "@mui/material";
import React, { memo, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { saveFinalData } from "../../store/actions/contractAction";
import { normalText } from "../stringConversion";
import dayjs from "../../design-system/dayjs";
import { Section } from "../../design-system";

const ReviewSubmit = (props) => {
  let reduxData = useSelector((state) => state.contract);
  const [finalData, setFinalData] = useState(false);

  const dispatch = useDispatch();
  const { contractDetails, vendorContacts, upload } = reduxData;

  let agDetailsData = contractDetails && Object.keys(contractDetails[0]);
  const location = useLocation();
  let path = location.pathname.split("/").pop();
  path = path.toLowerCase() === "addagreement";

  useEffect(() => {
    if (!finalData && reduxData) {
      const finalValues = {
        agreementCreatedBy: localStorage.getItem("psid"),
        roleName: localStorage.getItem("entitlementType"),
        agreementEdmsEntiryId: localStorage.getItem("entityIdInfo"),
        agreementExpiryDate: contractDetails[0].expirationDate,
        agreementId: contractDetails[0].agreementId
          ? contractDetails[0].agreementId
          : "",
        agreementLastUpdatedBy: path ? "" : localStorage.getItem("psid"),
        agreementLimitations: vendorContacts[0].agreementLimitations,
        agreementLink: upload.urlToAgreement,
        agreementName: contractDetails[0].agreementName,
        agreementNoExpiryFlag:
          contractDetails[0].expirationDate === null ? "Y" : "N",
        agreementPartyId: contractDetails[0].dataSource,
        agreementReferenceId: contractDetails[0].referenceId,
        agreementReferenceText: contractDetails[0].referenceText,
        agreementScbAgreementMgrBankId:
          contractDetails[0].ScbAgreementManagerBankId,
        agreementSignedOn: contractDetails[0].signedOn,
        agreementStartDate: contractDetails[0].startDate,
        agreementStatus: contractDetails[0].status,
        agreementType: contractDetails[0].agreementType,
        agreementUpdateFlag: path ? "N" : "Y",
        agreementValue: contractDetails[0].agreementValue,
      };
      dispatch(saveFinalData(finalValues));
      setFinalData(true);
    }
  }, [reduxData, dispatch]);

  const colSpan = { xs: 12, sm: 12, md: 6, lg: 4, xl: 4 };

  return (
    <div className="review-submit" id="main" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Section title="Agreement Details">
        <Grid container spacing={2}>
          {agDetailsData.map((item, i) => (
            <Grid size={colSpan} key={i}>
              <div className="label-review">
                {normalText(item).replace("Id", "ID")}
              </div>
              <div style={{ color: "var(--color-text)", wordBreak: "break-word" }}>
                {item === "signedOn" ||
                item === "startDate" ||
                (item === "expirationDate" &&
                  contractDetails[0]["expirationDate"] !== null)
                  ? dayjs(contractDetails[0][item]).format("DD MMM, YYYY")
                  : item === "expirationDate" &&
                    contractDetails[0]["expirationDate"] === null
                  ? "No Expiry"
                  : contractDetails[0][item]}
              </div>
            </Grid>
          ))}
        </Grid>
      </Section>
      <Section title="Agreement Limitations">
        <Grid container spacing={2}>
          {Object.keys(vendorContacts[0]).map((item, i) => (
            <Grid size={12} key={i}>
              <div className="label-review">{normalText(item)}</div>
              <div style={{ color: "var(--color-text)", whiteSpace: "pre-wrap" }}>
                {vendorContacts[0][item]}
              </div>
            </Grid>
          ))}
        </Grid>
      </Section>
      <Section title="Agreement Document">
        <Grid container spacing={2}>
          {Object.keys(upload).map((item, i) => (
            <Grid size={colSpan} key={i}>
              <div className="label-review">{normalText(item)}</div>
              <div style={{ color: "var(--color-text)", wordBreak: "break-all" }}>
                {upload[item]}
              </div>
            </Grid>
          ))}
        </Grid>
      </Section>
    </div>
  );
};

export default memo(ReviewSubmit);