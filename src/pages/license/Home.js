import React from "react";
import { useLocation } from "react-router-dom";
import RecordFormPage from "../../components/recordForm/RecordFormPage";
import "./license.css";

/*
  Licence Create / Edit screen — now a thin wrapper over the generic
  <RecordFormPage> controller. The licence domain uses the "component" driver:
  OrderSteps owns the full wizard body + its own controlled state, while the
  generic controller supplies the page chrome, Cancel/Submit, and the async
  submit-response handling (see the `licence` descriptor in resourceRegistry).

  Routes that mount this screen:
    /masterData/:contractId/addLicense   (create — pathname includes addLicense)
    /masterData/:id/modifyLicense        (edit)
    /license                             (edit semantics)
*/
const Home = () => {
  const { pathname } = useLocation();
  const isCreate = pathname.includes("addLicense");
  return <RecordFormPage resource="licence" mode={isCreate ? "create" : "edit"} />;
};

export default Home;
