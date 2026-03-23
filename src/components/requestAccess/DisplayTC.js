import { createRef, useEffect, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Form, Checkbox, Button } from "antd";
import { terms } from "../../store/actions/requestAccessActions";
import { TCGeneralSubscription } from "../termsAndConditions/tcGeneralSubscription";
import { TCApplicationSubscription } from "../termsAndConditions/tcApplicationSubscription";
import { TCVendorRequestSubscription } from "../termsAndConditions/tcVendorRequestSubscription";

const DisplayTC = (props) => {
  const formRef = createRef();
  const button = createRef();
  const dispatch = useDispatch();
  const reduxData = useSelector((state) => state.requestAccess);

  const vendorRequest = useSelector((state) => state.datafeedInfo.congigUi.vendorRequestConfig);

  useEffect(() => {
    if (
      reduxData.terms === true ||
      (reduxData.businessRequirements.length &&
        reduxData.businessRequirements[0].subscriptionId.length)
    ) {
      formRef.current.setFieldsValue({
        generalSubscription: true,
        applicationSubscription: true,
        vendorSubscription: true
      });
    }

  }, []);
  useEffect(() => {
    if (props.formData) {
      button.current.click();
      props.next(false);
    }

  }, [props.formData]);

  const onFinish = (values) => {
    if (values.generalSubscription === true) {
      dispatch(terms(values.generalSubscription));
      props.next(true);
    }
    if (values.applicationSubscription === true) {
      dispatch(terms(values.applicationSubscription));
      props.next(true);
    }
    if (values.vendorSubscription === true) {
      dispatch(terms(values.applicationSubscription));
      props.next(true);
    }
  };

  return (
    <div className="display-terms-and-conditions">
      <Form ref={formRef} onFinish={onFinish}>
        <TCGeneralSubscription view={props.view} />
        {props.view === "rd" && props.subForFlag ? <br /> : null}
        {props.view === "tc" ? <Form.Item
          name="generalSubscription"
          valuePropName="checked"
          rules={[
            {
              validator: (_, checked) =>
                checked
                  ? Promise.resolve()
                  : Promise.reject("Please accept the terms and conditions for general subscription."),
            },
          ]}
        >
          <Checkbox onChange={() => { }} className>
            I have read and accept the terms and conditions for general subscription
          </Checkbox>
        </Form.Item> : null}
        {props.view === "tc" || (props.view !== "tc" && !props.subForFlag) ?
          <> {props.view !== "tc" ? <br /> : null}
            <TCApplicationSubscription view={props.view} subForFlag={props.subForFlag} vendorRequest={props.vendorRequest} />
            {props.view === "rd" ? <br /> : null}
            {props.view === 'tc' ?
              <Form.Item
                name="applicationSubscription"
                valuePropName={!props.subForFlag ? "checked" : "unchecked"}
                rules={[
                  {
                    validator: async (_, checked) => {
                      if (!props.subForFlag && !checked) {
                        return Promise.reject("Please accept the terms and conditions for application subscription.")
                      }
                      return Promise.resolve();
                    }
                  },
                ]}
              >
                <Checkbox onChange={() => { }} className disabled={props.subForFlag}>
                  I have read and accept the terms and conditions for application subscription
                </Checkbox>
              </Form.Item> : null} </> : null}
        {(props.view === 'tc' && vendorRequest === 'Y') || (props.view !== 'tc' && props.vendorRequest === 'Y' && !props.subForFlag) ?
          <> {(props.view !== "rd" && props.view != "tc") ? <br /> : null} <TCVendorRequestSubscription view={props.view} subForFlag={props.subForFlag} vendorRequest={props.vendorRequest} dfVendor={vendorRequest} />
            {props.view === "rd" ? <br /> : null}
            {props.view === "tc" ?
              <Form.Item
                name="vendorSubscription"
                valuePropName={!props.subForFlag && vendorRequest === 'Y' && props.vendorRequest === 'Y' ? "checked" : "unchecked"}
                rules={[
                  {
                    validator: async (_, checked) => {
                      if (!props.subForFlag && vendorRequest === 'Y' && props.vendorRequest === 'Y' && !checked) {
                        return Promise.reject("Please accept the terms and conditions for for on-demand vendor request.")
                      }
                      return Promise.resolve();
                    }
                  },
                ]}
              >
                <Checkbox onChange={() => { }} className disabled={(props.subForFlag && vendorRequest === 'Y') || (!props.subForFlag && props.vendorRequest !== 'Y')}>
                  I have read and accept the terms and conditions for on-demand vendor request
                </Checkbox>
              </Form.Item> : null}
          </> : null}
        <Form.Item style={{ display: "none" }}>
          <Button type="primary" htmlType="submit" ref={button}></Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default memo(DisplayTC);