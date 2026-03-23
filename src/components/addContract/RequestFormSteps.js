import { memo, useState, lazy, Suspense, useEffect } from "react";
import { Steps, Button, message, Skeleton, Alert } from "antd";
import { connect, useSelector } from "react-redux";

const ContractDetails = lazy(() => import("./ContractDetails"));
const VendorContacts = lazy(() => import("./VendorContacts"));
const UploadContractV2 = lazy(() => import("./UploadContractV2"));
const ReviewSubmit = lazy(() => import("./ReviewSubmit"));

const { Step } = Steps;
const RequestFormSteps = (props) => {
  const [formData, setFormData] = useState(false);
  const [current, setCurrent] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const info = useSelector((state) => state.vendor);

  const { stepsLength, contractDetails } = props;

  const next = (values) => {
    if (values === true) return setCurrent(current + 1);
    setFormData(values === false ? false : true);
  };
  const prev = () => {
    setCurrent(current - 1);
  };
  const steps = [
    {
      title: "Agreement Details",
      content: (
        <Suspense fallback={<div>Loading...</div>}>
          <ContractDetails next={next} formData={formData} />
        </Suspense>
      ),
    },
    {
      title: "Agreement Limitations",
      content: (
        <Suspense fallback={<div>Loading...</div>}>
          <VendorContacts next={next} formData={formData} />
        </Suspense>
      ),
    },
    {
      title: "Upload Agreement",
      content: (
        <Suspense fallback={<div>Loading...</div>}>
          <UploadContractV2 next={next} formData={formData} />
        </Suspense>
      ),
    },
    {
      title: "Review & Submit",
      content: (
        <Suspense fallback={<div>Loading...</div>}>
          <ReviewSubmit
            contractDetails={contractDetails}
            vendorList={info.list}
          />
        </Suspense>
      ),
    },
  ];
  const submitPermission = current === steps.length - 1;
  stepsLength(submitPermission);
  useEffect(() => {
    if (stepsLength) {
      setIsLoading(false);
    }
  }, [stepsLength]);

  return (
    <>
      {isLoading ? (
        <Skeleton fallback={<div>Loading...</div>}></Skeleton>
      ) : (
        <div id="main">
          <Steps current={current} size="small">
            {steps.map((item) => (
              <Step key={item.title} title={item.title} />
            ))}
          </Steps>
          <div className="steps-content">{steps[current].content}</div>
          <div className="steps-action">
            {current > 0 && (
              <Button style={{ margin: "0 8px" }} onClick={() => prev()}>
                Previous
              </Button>
            )}
            {current < steps.length - 1 && (
              <Button type="primary" onClick={next}>
                Next
              </Button>
            )}
            {current === steps.length - 1 && (
              <Button
                type="primary"
                onClick={() => message.success("Processing complete!")}
                style={{ display: "none" }}
              >
                Done
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

const mapStateToProps = (state) => {
  return {
    selectedContract: state.contract.selectedContract,
  };
};

export default connect(mapStateToProps)(RequestFormSteps);