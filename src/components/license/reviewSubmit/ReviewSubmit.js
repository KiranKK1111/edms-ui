import React from "react";
import { PaperClipOutlined, UploadOutlined } from "@ant-design/icons";
import { Row, Col, Divider, Form } from "antd";
import "./ReviewSubmit.css";
import { useSelector } from "react-redux";
import moment, { utc } from "moment";
import { useLocation } from "react-router-dom";

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

  const expirationDate = moment(
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

  const [form] = Form.useForm();

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
          ? moment.utc(expirationDate).format("DD MMM, YYYY")
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

  return (
    <div id="main">
      {allData ? (
        <Form form={form} layout="inline" labelCol={{ span: 18 }}>
          <Row gutter={[5, 0]}>
            <Col className="gutter-row" span={24}>
              <span className="details-header-review">Licence Details</span>
            </Col>
            {/* <Row gutter={[2, 4]}> */}
            {allData.license.map((data, index) =>
              checkFieldsDisplay(data.name) === true ? (
                <Col className="gutter-row" span={8} key={index}>
                  <Form.Item
                    className="review-label"
                    name={data.name}
                    label={<strong>{data.name}</strong>}
                  >
                    <label className="name-review">{data.value}</label>
                  </Form.Item>
                </Col>
              ) : (
                ""
              )
            )}
            {/* </Row> */}
            <Divider />
            <Col className="gutter-row" span={24}>
              <span className="details-header-review">Licence Limitations</span>
            </Col>
            {/* <Row gutter={[5, 0]}>     */}
            {allData.support.map((data, index) => (
              <Col className="gutter-row" span={20} key={index}>
                <Form.Item
                  name={data.name}
                  label={<strong>{data.name}</strong>}
                  className="review-label"
                >
                  <label className="name-review">{data.value}</label>
                </Form.Item>
              </Col>
            ))}
            {/* </Row> */}
            <Divider />
          </Row>
        </Form>
      ) : null}
    </div>
  );
}

export default ReviewSubmit;