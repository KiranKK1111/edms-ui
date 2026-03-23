import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory, useParams, useLocation, Link } from "react-router-dom";
import { Button, PageHeader, Steps, message, Alert } from "antd";
import Headers from "../header/Header";
import Breadcrumb from "../../components/breadcrumb/Breadcrumb";
import DatasetDetails from "../../components/datasetForm/DatasetDetails";
import ReviewSubmit from "../../components/datasetForm/ReviewSubmit";
import { startDataset } from "../../store/actions/datasetFormActions";
import {
  MASTERDATA_MANAGEMENT_PAGE,
  ADD_DATASET_DOCUMENTATION_PAGE_AND_BUTTON,
} from "../../utils/Constants";
import isButtonObject from "../../utils/accessButtonCheck";

const { Step } = Steps;

const Dataset = (props) => {
  const [formData, setFormData] = useState(false);
  const [current, setCurrent] = useState(0);
  const history = useHistory();
  const params = useParams();
  const dispatch = useDispatch();
  const data = useSelector((state) => state.dataset.formData);
  const location = useLocation();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const breadcrumb = [
    { name: "Entities", url: "/masterData" },
    {
      name: params[0],
      url: {
        pathname: `/masterData`,
      },
    },
    {
      name:
        location.state && location.state.isUpdate
          ? "Edit Dataset"
          : "Add Dataset",
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
      title: "Dataset details",
      content: <DatasetDetails next={next} formData={formData} />,
    },
    {
      title: "Review & Submit",
      content: <ReviewSubmit />,
    },
  ];

  const cancelHandler = () => {
    history.push("/masterData");
  };
  const submitdata = async () => {
    setIsSubmitted(true);
    const res = await dispatch(startDataset(data));
    if (res && res.data && res.data.statusMessage && location.state.isUpdate) {
      message.success(` The Dateset has been successfully updated!`);
      history.push("/masterData");
    } else if (
      res &&
      res.data &&
      res.data.statusMessage &&
      !location.state.isUpdate
    ) {
      message.success(
        ` The Dataset, ${res.data.dataset.datasetId} has been successfully created!`
      );
      history.push("/masterData");
    } else if (res && res.message) {
      message.error(res.message);
      history.push("/masterData");
    }
    setIsSubmitted(false);
  };

  const addDatasetDocPagesAndButton = isButtonObject(
    MASTERDATA_MANAGEMENT_PAGE,
    ADD_DATASET_DOCUMENTATION_PAGE_AND_BUTTON
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
              onClick={submitdata}
            >
              Submit
            </Button>
          </div>
        </div>
        <div>
          <PageHeader
            title={
              location.state && location.state.isUpdate
                ? "Edit Dataset"
                : "Add Dataset"
            }
            ghost={false}
            onBack={() => history.push("/masterData")}
            className="pt-10 pb-0  home-page"
          ></PageHeader>
        </div>
      </div>
      {data &&
        data.datasetStatus &&
        data.datasetId &&
        data.datasetStatus.toLowerCase() === "pending" && (
          <div style={{ margin: "10px 24px -10px 24px" }}>
            <Alert
              message="This Dataset is currently under review and approval. You will be able to add Data Feeds once the Dataset is approved and the status is “Active”."
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
        <div className="steps-action">
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

export default Dataset;