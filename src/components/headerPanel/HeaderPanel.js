import { useDispatch, useSelector } from "react-redux";
import { Descriptions, PageHeader, Spin, Tag, Badge } from "antd";
import { withRouter, useLocation, useHistory } from "react-router-dom";
import moment from "moment";

const HeaderPanel = () => {
  const location = useLocation();
  let catalogueObj =
    location.state && location.state.data ? location.state.data : {};
  const { dataFeedStatus: datafeedStatus, entityShortName } = catalogueObj;
  const { licenseById: licenseInfo } = useSelector((state) => state.license);
  const { agreementById: agreementInfo } = useSelector(
    (state) => state.contract
  );
  const {
    licenseNumberOfLicensesPurchaised,
    licenseNumberOfLicensesUsed,
    licenseNoInheritanceFlag,
    licenseExpiryDate,
    licenseType = "",
  } = licenseInfo ? licenseInfo : {};
  const { agreementExpiryDate, agreementScbAgreementMgrBankId } = agreementInfo
    ? agreementInfo
    : {};

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
    return <div className="label-bold">{lable}</div>;
  };

  let status;
  if (datafeedStatus && datafeedStatus.toLowerCase() === "active") {
    status = "success";
  }
  if (datafeedStatus && datafeedStatus.toLowerCase() === "pending") {
    status = "warning";
  }
  if (datafeedStatus && datafeedStatus.toLowerCase() === "inactive") {
    status = "error";
  }
  return (
    <Descriptions
      size="small"
      column={{ lg: 3, md: 2, sm: 1, xs: 1 }}
      bordered={false}
    >
      <Descriptions.Item label={lablelFn("Number of available Licences")}>
        {availableLicenses}
      </Descriptions.Item>
      <Descriptions.Item label={lablelFn("Expiration date")}>
        {licenseExpiryDateDisplay}
      </Descriptions.Item>
      <Descriptions.Item label={lablelFn("Data source")}>
        {entityShortName ? entityShortName : "NA"}
      </Descriptions.Item>
      <Descriptions.Item label={lablelFn("Status")}>
        {status ? <Badge status={status} text={datafeedStatus} /> : "NA"}
      </Descriptions.Item>
      <Descriptions.Item label={lablelFn("SCB Data Owner")}>
        {agreementScbAgreementMgrBankId ? agreementScbAgreementMgrBankId : "NA"}
      </Descriptions.Item>
    </Descriptions>
  );
};

export default HeaderPanel;