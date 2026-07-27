import React from "react";
import { useParams } from "react-router-dom";

import RecordFormPage from "../../components/recordForm/RecordFormPage";
import "./addEntity.css";

/*
  Add / Edit Entity — thin wrapper over the generic RecordFormPage controller.
  All wizard mechanics live in RecordFormPage + the "entity" descriptor in
  resourceRegistry. Edit is detected from the route :id param.
*/
const AddEntity = () => {
  const params = useParams();
  return (
    <RecordFormPage
      resource="entity"
      mode={params.id ? "edit" : "create"}
      id={params.id}
    />
  );
};

export default AddEntity;
