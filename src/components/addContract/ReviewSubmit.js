import { PaperClipOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Col, Divider, Row, Upload, Form } from "antd";
import React, { memo, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { saveFinalData } from "../../store/actions/contractAction";
import { normalText } from "../stringConversion";
import moment from "moment";

const ReviewSubmit = (props) => {
  let reduxData = useSelector((state) => state.contract);
  const [finalData, setFinalData] = useState(false);

  const dispatch = useDispatch();
  const [form] = Form.useForm();
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

  return (
    <div className="review-submit" id="main">
      <h3>Agreement Details </h3>
      <Row gutter={[2, 4]}>
        {agDetailsData.map((item, i) => (
          <Col span={8} key={i}>
            <span className="label-review">
              {normalText(item).replace("Id", "ID")} :
            </span>
            {item === "signedOn" ||
            item === "startDate" ||
            (item === "expirationDate" &&
              contractDetails[0]["expirationDate"] !== null)
              ? moment(contractDetails[0][item]).format("DD MMM, YYYY")
              : item === "expirationDate" &&
                contractDetails[0]["expirationDate"] === null
              ? "No Expiry"
              : contractDetails[0][item]}
          </Col>
        ))}
      </Row>
      <Divider />
      <h3>Agreement Limitations </h3>
      <Row gutter={[2, 4]}>
        {Object.keys(vendorContacts[0]).map((item, i) => (
          <Col span={8} key={i}>
            <span className="label-review">{normalText(item)} :</span>
            {vendorContacts[0][item]}
          </Col>
        ))}
      </Row>
      <Divider />
      <h3>Agreement Document</h3>
      <Row gutter={[2, 4]}>
        {Object.keys(upload).map((item, i) => (
          <Col span={8} key={i}>
            <span className="label-review">{normalText(item)} :</span>
            {upload[item]}
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default memo(ReviewSubmit);