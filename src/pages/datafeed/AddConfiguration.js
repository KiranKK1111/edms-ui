import RecordFormPage from "../../components/recordForm/RecordFormPage";
import "./addConfiguration.css";

/*
  Data Feed Configuration Create / Edit / View screen — now a thin wrapper over
  the generic <RecordFormPage> controller via the "delegated" driver. The
  configuration wizard's logic (non-linear step navigation, change-detection
  submit guard, permission-based read-only and the heavy submit flow) lives in
  ConfigurationSteps; the controller renders the shared chrome (breadcrumb,
  title, meta, stepper, Cancel/Submit, pinned Prev/Next) and delegates the
  actions back to the body. Create / Edit / View are determined inside the body
  from the loaded configuration + the user's permission (read = View).
*/
const AddConfiguration = () => {
  return <RecordFormPage resource="datafeedConfig" />;
};

export default AddConfiguration;
