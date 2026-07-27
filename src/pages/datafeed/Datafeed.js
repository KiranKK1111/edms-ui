import { useLocation } from "react-router-dom";
import RecordFormPage from "../../components/recordForm/RecordFormPage";
import "./datafeed.css";

/*
  Data Feed Create / Edit screen — now a thin wrapper over the generic
  <RecordFormPage> controller. The datafeed domain uses the "self" driver:
  DatafeedDetails self-submits into state.datafeedInfo.formData via the
  formData/next flag and ReviewSubmit writes the final payload there; the
  controller owns the chrome (stepper + pinned Prev/Next footer + Cancel/Submit)
  and dispatches the submit. The dynamic breadcrumb/backTo (which link back to
  the feed's View screen) come from the datafeed descriptor's getChrome.

  Mode comes from the navigation location.state: state.isUpdate -> edit,
  otherwise create.
*/
const Datafeed = () => {
  const location = useLocation();
  const isUpdate = !!(location.state && location.state.isUpdate);
  return <RecordFormPage resource="datafeed" mode={isUpdate ? "edit" : "create"} />;
};

export default Datafeed;
