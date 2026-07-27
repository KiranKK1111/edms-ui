import RecordFormPage from "../../components/recordForm/RecordFormPage";
import "./datafeed.css";

/*
  View Data Feed screen — now a thin wrapper over the generic <RecordFormPage>
  controller in read-only ("view") mode. The datafeed descriptor supplies a
  custom rich body (DatafeedView: General Details with the configuration link,
  tooltips and status chips) and a conditional Edit header action, while the
  controller owns the chrome (breadcrumb/title/back). The feed is read from
  state.datafeedInfo.formData (pre-populated by the master-data navigation).
*/
const ViewDatafeed = () => {
  return <RecordFormPage resource="datafeed" mode="view" />;
};

export default ViewDatafeed;
