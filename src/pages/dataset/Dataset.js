import { useLocation } from "react-router-dom";
import RecordFormPage from "../../components/recordForm/RecordFormPage";

/*
  Dataset Create / Edit / View screen — now a thin wrapper over the generic
  <RecordFormPage> controller. The dataset domain uses the "self" driver:
  DatasetDetails self-submits into state.dataset.formData via the formData/next
  flag and ReviewSubmit writes the final payload there; the controller owns the
  chrome (stepper + pinned Prev/Next footer + Cancel/Submit) and dispatches the
  submit. See the `dataset` descriptor in resourceRegistry.

  Mode comes from the navigation `location.state` (the route path is the same
  master-data dataset route for every mode):
    state.isView   -> view (read-only)
    state.isUpdate -> edit
    otherwise      -> create
*/
const Dataset = () => {
  const location = useLocation();
  const st = location.state || {};
  const mode = st.isView ? "view" : st.isUpdate ? "edit" : "create";
  return <RecordFormPage resource="dataset" mode={mode} />;
};

export default Dataset;
