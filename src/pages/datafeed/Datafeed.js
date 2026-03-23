import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button, PageHeader, Steps, message, Alert } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import Headers from "../header/Header";
import Breadcrumb from "../../components/breadcrumb/Breadcrumb";
import DatafeedDetails from "../../components/datafeed/DatafeedDetails";
import ReviewSubmit from "../../components/datafeed/ReviewSubmit";
import { startAddDatafeed } from "../../store/actions/datafeedAction";
import "./datafeed.css";
import getPermissionObject from "../../utils/accessObject";
import {
  MASTERDATA_MANAGEMENT_PAGE,
  ADD_DATAFEED_DOCUMENTATION_PAGE_AND_BUTTON,
} from "../../utils/Constants";

const { Step } = Steps;

const Datafeed = () => {
  const [formData, setFormData] = useState(false);
  const [current, setCurrent] = useState(0);
  const [btnStatus, setBtnStatus] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const params = useParams();
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();
  const data = useSelector((state) => state.datafeedInfo.formData);
  const record = location.state.datafeedRecord;
  const fromLink = location.state.fromLink;
  const row = location.state.dataset;
  const { shortName } = row;

  //check shortName has '/'
  const checkUrlSlash = (frontSlashVar) => {
    return frontSlashVar.includes("/")
      ? frontSlashVar.replaceAll("/", "%2F")
      : frontSlashVar;
  };
  let feedUpdateLink = checkUrlSlash(shortName);
  const getOperationText = () => {
    let text = "Add Data Feed";
    if (location.state.isView || location.state.isUpdate) {
      return "Edit Data Feed";
    }
    return text;
  };
  const breadcrumb = [
    { name: "Entities", url: "/masterData" },
    {
      name: feedUpdateLink,
      url: {
        pathname: `/masterData/${feedUpdateLink}/viewDatafeed`,
        state: {
          dataset: row,
          isView: true,
          datafeedRecord: record,
        },
      },
    },
    {
      name: getOperationText(),
    },
  ];
  const next = (values) => {
    if (values) return setCurrent(current + 1);
    setFormData(values === false ? false : true);
  };
  const prev = () => {
    setCurrent(current - 1);
  };
  const steps = [
    {
      title: "General Details",
      content: <DatafeedDetails next={next} formData={formData} />,
    },
    {
      title: "Review & Submit",
      content: <ReviewSubmit />,
    },
  ];
  const cancelHandler = () => {
    history.push("/masterData");
  };

  const submitFeed = async () => {
    setIsSubmitted(true);
    const res = await dispatch(startAddDatafeed(data));
    if (res && res.data && res.data.statusMessage && location.state.isUpdate) {
      message.success(` The Data Feed has been successfully updated!`);
      history.push("/masterData");
    } else if (
      res &&
      res.data &&
      res.data.statusMessage &&
      !location.state.isUpdate
    ) {
      message.success(` The Data Feed, ${res.data.datafeed.feedId} has been successfully submitted and
            is pending for approval!`);
      history.push("/masterData");
    } else if (res && res.message) {
      message.error(res.message);
      history.push("/masterData");
    }
    setIsSubmitted(false);
  };

  const addDatafeedDocPagesAndButton = getPermissionObject(
    MASTERDATA_MANAGEMENT_PAGE,
    ADD_DATAFEED_DOCUMENTATION_PAGE_AND_BUTTON
  );

  return (
    <div>
      <Headers />
      <div className="header-one">
        <div className="breadcrumb-parent">
          <Breadcrumb breadcrumb={breadcrumb} />
          <div className="btn-top-parent">
            <Button type="default" onClick={() => cancelHandler()}>
              Cancel
            </Button>
            <Button
              type="primary"
              disabled={
                isSubmitted ||
                (data &&
                  data.feedStatus &&
                  data.feedId &&
                  data.feedStatus.toLowerCase() === "pending") ||
                (data &&
                  data.feedStatus &&
                  data.feedId &&
                  data.feedStatus.toLowerCase() === "inactive") ||
                steps.length - 1 !== current
              }
              onClick={submitFeed}
            >
              Submit
            </Button>
          </div>
        </div>
        <div>
          <PageHeader
            title={getOperationText()}
            ghost={false}
            onBack={() =>
              history.push({
                pathname:
                  getOperationText().includes("Add") ||
                  fromLink === "updatePage"
                    ? "/masterData"
                    : `/masterData/${feedUpdateLink}/viewDatafeed`,
                state: {
                  dataset: row,
                  isView: true,
                  datafeedRecord: record,
                },
              })
            }
            className="pt-10 pb-0  home-page"
          ></PageHeader>
        </div>
      </div>
      {data &&
        data.feedStatus &&
        data.feedId &&
        data.feedStatus.toLowerCase() === "pending" && (
          <div style={{ margin: "10px 24px -10px 24px" }}>
            <Alert
              message="This Data Feed is currently under review. You will be able to subscribe once the Data Feed is approved and the status is “Active”."
              type="warning"
              showIcon
            />
          </div>
        )}
      <div className="form-layout content-wrapper">
        <Steps current={current} size="small">
          {steps.map((item) => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>
        <div className="steps-content">{steps[current].content}</div>
        <div className="steps-action" style={{ marginTop: 10 }}>
          {current < steps.length - 1 && (
            <Button type="primary" onClick={() => next()}>
              Next
            </Button>
          )}
          {current > 0 && (
            <Button style={{ margin: "0 8px" }} onClick={() => prev()}>
              Previous
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Datafeed;