import { memo, useState, lazy, Suspense, useEffect } from "react";
import { Stepper, Step, StepLabel, Button } from "@mui/material";
import { toast as message } from "../../design-system/toast";

const BusinessRequirements = lazy(() => import("./BusinessRequirements"));
const Usage = lazy(() => import("./Usage"));
const TermsConditions = lazy(() => import("./TermsConditions"));
const ReviewSubmit = lazy(() => import("./ReviewSubmit"));
const RequestFormSteps = (props) => {
  const [formData, setFormData] = useState(false);
  const [current, setCurrent] = useState(0);

  const [subForFlag, setSubForFlag] = useState();
  const [vendorRequestDetails, setVendorRequestDetails] = useState();
  const { contractManagement, stepsLength } = props;
  const next = (values) => {
    if (values === true) return setCurrent(current + 1);
    setFormData(values === false ? false : true);
  };
  const prev = () => {
    setCurrent(current - 1);
  };
  const getSubFor = (flag) => {
    setSubForFlag(flag);
  }

  const getVendorRequest = (vendorRequest) => {
    setVendorRequestDetails(vendorRequest);
  }
  const steps = [
    {
      title: "Business Requirements",
      content: (
        <Suspense fallback={<div>Loading...</div>}>
          <BusinessRequirements next={next} formData={formData} view={"br"} setSubscriptionFor={getSubFor} setVendorRequest={getVendorRequest}/>
        </Suspense>
      ),
    },
    {
      title: "Terms & Conditions",
      content: (
        <Suspense fallback={<div>Loading...</div>}>
          <TermsConditions next={next} formData={formData} view={"tc"} subForFlag={subForFlag} vendorRequest={vendorRequestDetails}/>
        </Suspense>
      ),
    },
    {
      title: "Review & Submit",
      content: (
        <Suspense fallback={<div>Loading...</div>}>
          <ReviewSubmit subForFlag={subForFlag} view={"rs"} vendorRequest={vendorRequestDetails}/>
        </Suspense>
      ),
    },
  ];

  useEffect(() => {
    const submitPermission = current === steps.length - 1;
    stepsLength(submitPermission);
  }, [current]);

  return (
    <>
      <Stepper activeStep={current} alternativeLabel>
        {steps.map((item) => (
          <Step key={item.title}>
            <StepLabel>{item.title}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <div className="steps-content">{steps[current].content}</div>
      <div className="steps-action">
        {current > 0 && (
          <Button style={{ margin: "0 8px" }} onClick={() => prev()}>
            Previous
          </Button>
        )}
        {current < steps.length - 1 && (
          <Button variant="contained" onClick={next}>
            Next
          </Button>
        )}
        {current === steps.length - 1 && (
          <Button
            variant="contained"
            onClick={() => message.success("Processing complete!")}
            style={{ display: "none" }}
          >
            Done
          </Button>
        )}
      </div>
    </>
  );
};

export default memo(RequestFormSteps);
