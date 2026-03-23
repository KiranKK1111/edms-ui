import { memo } from "react";
import "./terms.css";
import DisplayTC from "./DisplayTC";
const TermsConditions = (props) => {

  return (
    <div className="terms-and-conditions">
      <DisplayTC next={props.next} formData={props.formData} view={props.view} subForFlag={props.subForFlag} vendorRequest={props.vendorRequest}/>
    </div>
  );
};

export default memo(TermsConditions);