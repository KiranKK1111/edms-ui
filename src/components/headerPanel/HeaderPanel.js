import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { Chip } from "@mui/material";
import dayjs from "../../design-system/dayjs";

const StatusChip = ({ status, text }) => {
  if (!status) return <span>NA</span>;
  const color =
    status === "success" ? "success" : status === "warning" ? "warning" : "error";
  return <Chip size="small" color={color} variant="outlined" label={text} />;
};

const HeaderField = ({ label, children }) => (
  <div className="page-form-meta-item">
    <span className="page-form-meta-label">{label}</span>
    <span className="page-form-meta-value">{children}</span>
  </div>
);

const HeaderPanel = () => {
  const location = useLocation();
  const catalogueObj =
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

  let status;
  if (datafeedStatus && datafeedStatus.toLowerCase() === "active") status = "success";
  if (datafeedStatus && datafeedStatus.toLowerCase() === "pending") status = "warning";
  if (datafeedStatus && datafeedStatus.toLowerCase() === "inactive") status = "error";

  return (
    <div className="page-form-meta">
      <HeaderField label="Number of available Licences">
        {availableLicenses || "NA"}
      </HeaderField>
      <HeaderField label="Expiration date">{licenseExpiryDateDisplay}</HeaderField>
      <HeaderField label="Data source">{entityShortName || "NA"}</HeaderField>
      <HeaderField label="Status">
        {status ? <StatusChip status={status} text={datafeedStatus} /> : "NA"}
      </HeaderField>
      <HeaderField label="SCB Data Owner">
        {agreementScbAgreementMgrBankId || "NA"}
      </HeaderField>
    </div>
  );
};

export default HeaderPanel;
