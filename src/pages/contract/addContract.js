import React from "react";
import { useHistory } from "react-router-dom";

import RecordFormPage from "../../components/recordForm/RecordFormPage";
import "./addContract.css";

/*
  Add / Edit Agreement — thin wrapper over the generic RecordFormPage
  controller. Agreement keeps its existing routes (so the step components'
  param/localStorage flow is preserved) and is driven by the shared controller
  via the "agreement" descriptor in resourceRegistry.
*/
const AddContract = () => {
  const history = useHistory();
  const isEdit = history.location.pathname.includes("modifyAgreement");
  return <RecordFormPage resource="agreement" mode={isEdit ? "edit" : "create"} />;
};

export default AddContract;
