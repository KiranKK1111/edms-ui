import { createRef, useEffect, useState, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { withRouter } from "react-router-dom";
import { Row, Col, Form, Input, Button, Select, Checkbox, Divider, Radio } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import {
  businessRequirements,
} from "../../store/actions/requestAccessActions";
import { bindData } from "./bindData";
import {
  clarityIdValidation,
  checkValueExist,
  itamIdValidation,
} from "./validationsRequestAccess";

let layout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 16,
  },
};
let noOfSubscriptionsVal = "No. of Licences";
const mediaQuery = window.matchMedia("(min-width: 1400px)");
if (mediaQuery.matches) {
  noOfSubscriptionsVal = "No. of Licences";
}
const { Option } = Select;
const { TextArea } = Input;

export function ruleForSubscriptionFor(subFor, value) {
  if (!subFor) {
    if (!value) {
      return Promise.reject(new Error("Please enter a service account ID"));
    }
    if (value.includes(" ")) {
      return Promise.reject(new Error("Application service account ID cannot contain spaces"));
    }
    return Promise.resolve();
  }
  else {
    return Promise.resolve();
  }
}

const BusinessRequirements = (props) => {
  const [valObj, setValObj] = useState({});
  const [searchWord, setSearchWord] = useState("");
  const [itamIdWord, setItamIdWord] = useState("");
  const configValues = useSelector((state) => state.datafeedInfo.congigUi);

  const [subFor, setSubFor] = useState(null);
  const dispatch = useDispatch();
  const reduxData = useSelector((state) => state.requestAccess);
  const formRef = createRef();
  const button = createRef();
  const { formData } = props;
  const [flag, setFlag] = useState();

  const psid = localStorage.getItem("psid");

  useEffect(() => {
    formRef.current.setFieldsValue({
      subscriptionId:
        reduxData.businessRequirements > 0
          ? reduxData.businessRequirements[0].subscriptionId
          : "",
      subscriptionType: "Individual Subscription",
      status: "Pending",
      vendorRequest: configVal(formRef.current.getFieldValue("subscriptionType")) ? "N" : "N",
    });

    bindData(reduxData.businessRequirements, formRef.current);
    const fields = formRef.current.getFieldsValue();
    const keys = Object.keys(fields);
    const validationObj = keys.map((item) => {
      return {
        [item]: {
          error: false,
          message: "",
        },
      };
    });
    const merge1 = Object.assign({}, ...validationObj);
    setValObj(merge1);
  }, [reduxData]);

  const onFinish = (values) => {
    const errors = Object.keys(valObj).some(
      (item) => valObj[item].error === true
    );
    if (!errors) {
      dispatch(businessRequirements(values));
      props.next(true);
    }
  };

  useEffect(() => {
    if (formData) {
      button.current.click();
      props.next(false);
    }
  }, [formData]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      const val = await checkValueExist(searchWord, "clarityId");
      const myObj = clarityIdValidation(valObj, val);
      if (myObj !== undefined) setValObj(myObj);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchWord]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      const val = await checkValueExist(itamIdWord, "itamId");
      const myObj = itamIdValidation(valObj, val);
      if (myObj !== undefined) setValObj(myObj);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [itamIdWord]);

  const onBlurHandler = (e) => {
    let data = {};
    const { name, value } = e.target;
    data[name] = value;
  };

  const configVal = (val) => {
    return val && val.toLowerCase() === "individual subscription"
      ? true
      : false;
  };

  const configVRConfig = (val) => {
    return val && val.toLowerCase() === "y"
      ? true
      : false;
  };

  useEffect(() => {
    setSubFor(configVal(formRef.current.getFieldValue("subscriptionType")));
  }, []);
  useEffect(() => {
    if (subFor) {
      setFlag("N")
      formRef.current.setFieldsValue({
        subscriptionFor: psid,
      });
    }
    else {
      setFlag(formRef.current.getFieldValue("vendorRequest"))
    }
  }, [subFor]);

  const subTypeFn = (val) => {
    formRef.current.setFieldsValue({
      subscriptionFor: "",
      vendorRequest: 'N'
    });
    setSubFor(configVal(val));
  };
  useEffect(() => {
    setSubFor(configVal(formRef.current.getFieldValue("subscriptionType")));
  }, []);

  useEffect(() => {
    if (subFor) {
      setFlag("N")
      formRef.current.setFieldsValue({
        subscriptionFor: psid,
      });
    }
    else {
      setFlag(formRef.current.getFieldValue("vendorRequest"))
    }
  }, [subFor]);

  const getVendorRequestConfig = () => {
    if (configValues && configValues.vendorRequestConfig) {
      return configVRConfig(configValues.vendorRequestConfig)
    }
  }

  const handlePrecheck = () => {
    return (!subFor && getVendorRequestConfig()) ? true : false;
  }

  const handleVendorRequest = (e) => {
    setFlag(e.target.value);
  }

  props.setSubscriptionFor(subFor);
  props.setVendorRequest(flag);

  return (
    <div className="business">
      <Form {...layout} name="br-one" ref={formRef} onFinish={onFinish}>
        <Row gutter={[20, 0]}>
          <Col span={12}>
            <Form.Item name="subscriptionId" label="Subscription ID">
              <Input
                disabled
                placeholder="Subscription ID will be generated after submission"
              />
            </Form.Item>

            <Form.Item
              name="clarityId"
              label="Clarity ID"
              tooltip={{
                title:
                  "Enter the clarity ID of the project this subscription is under",
                icon: <QuestionCircleOutlined style={{ color: "#1890ff" }} />,
              }}
            >
              <Input placeholder="Clarity ID" name="clarityId" />
            </Form.Item>
            <Form.Item
              name="subscriptionType"
              label="Subscription type"
              rules={[
                {
                  required: true,
                  message: "Subscription Type is mandatory.",
                },
              ]}
            >
              <Select name="subscriptionType" onChange={subTypeFn}>
                <Option value="Individual Subscription">
                  Individual Subscription
                </Option>
                <Option value="Application Subscription">
                  Application Subscription
                </Option>
              </Select>
            </Form.Item>
            <Form.Item
              tooltip={{
                title:
                  "For application subscription, enter service account ID. For your own subscription, select 'Myself'.",
                icon: <QuestionCircleOutlined style={{ color: "#1890ff" }} />,
              }}
              label={<span className="asterisk-custom">Subscription for</span>}
              style={{ padding: 0, margin: 0 }}
            >
              <Row>
                <Col span={18}>
                  <Form.Item
                    name="subscriptionFor"
                    rules={[
                      {
                        validator(_, value) {
                          return ruleForSubscriptionFor(subFor, value);
                        }
                      }
                    ]}
                    {...(Object.keys(valObj).length > 0 &&
                      valObj["subscriptionFor"].error && {
                      validateStatus: "error",
                      help: valObj["subscriptionFor"].message,
                    })}
                  >
                    <Input
                      name="subscriptionFor"
                      placeholder="Subscription for"
                      onBlur={(e) => onBlurHandler(e)}
                      disabled={subFor}
                    />
                  </Form.Item>
                </Col>
                <Col span={6} style={{ textAlign: "right" }}>
                  <Form.Item>
                    Myself{" "}
                    <Checkbox
                      disabled={!subFor}
                      checked={subFor}
                      style={{ marginLeft: "5px" }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form.Item>
            {!subFor ? <Form.Item
              name="serviceAccountName"
              label={<span className="asterisk-custom">Service account name</span>}
              tooltip={{
                title:
                  "Enter the service account name",
                icon: <QuestionCircleOutlined style={{ color: "#1890ff" }} />,
              }}
            >
              <Input placeholder="Service account name" name="serviceAccountName" />
            </Form.Item> : null}
            <Form.Item
              name="reasonForSubscription"
              label="Reason for Subscription"
              rules={[
                {
                  required: true,
                  message:
                    "Reason for Subscription is mandatory(Max 500 characters)",
                },
                {
                  max: 500,
                  message:
                    "Reason for Subscription should not be more than 500 characters",
                },
              ]}
            >
              <TextArea
                name="reasonForSubscription"
                rows={4}
                placeholder="Reason for Subscription"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="numberOfEndUserSubscriptions"
              label={noOfSubscriptionsVal}
              tooltip={{
                title: "Number of Licences used in this Subscription.",
                icon: <QuestionCircleOutlined style={{ color: "#1890ff" }} />,
              }}
              rules={[
                {
                  required: true,
                  message: "No. of Licences is mandatory",
                },
                {
                  pattern: new RegExp("^[0-9]+$"),
                  message: "Only numbers are allowed",
                },
              ]}
            >
              <Input
                placeholder="No. of Licences"
                name="numberOfEndUserSubscriptions"
                onBlur={(e) => onBlurHandler(e)}
              />
            </Form.Item>
            <Form.Item
              name="projectName"
              label="Project name"
              rules={[
                {
                  pattern: new RegExp(/^[a-zA-Z0-9\s]+$/i),
                  message: "Only alphabets and numbers are allowed",
                },
              ]}
            >
              <Input
                placeholder="Project name"
                name="projectName"
                onBlur={(e) => onBlurHandler(e)}
              />
            </Form.Item>
            {/*<Form.Item
            rules={[
              {
                required: true,
                message: "Please select consumption mode.",
              },
            ]}
            name="consumptionMode"
            label="Consumption Mode"
          >
            <Select defaultValue="Select">
              <Option value="Records via API">Records via API</Option>
              <Option value="Raw File">Raw File</Option>
              <Option value="Query File">Query File</Option>
            </Select>
          </Form.Item>*/}
            <Form.Item
              name="department"
              label="Department"
              tooltip={{
                title:
                  "Please specify the department that this data feed will be subscribed for",
                icon: <QuestionCircleOutlined style={{ color: "#1890ff" }} />,
              }}
              rules={[
                {
                  required: true,
                  message: "Department is mandatory",
                },
                {
                  pattern: new RegExp(/^[a-z\d\-_\s]+$/i),
                  message: "Please enter a valid Department",
                },
              ]}
            >
              <Input
                placeholder="Department"
                name="department"
                onBlur={(e) => onBlurHandler(e)}
              />
            </Form.Item>
            <Form.Item
              name="status"
              label="Status"
              rules={[
                {
                  required: true,
                  message: "Please enter a valid status",
                },
              ]}
            >
              <Input placeholder="Status" name="status" disabled={true} />
            </Form.Item>
          </Col>
        </Row>

        <Divider />
        <h4 style={{ "fontWeight": "bold" }}>On-Demand Vendor request</h4>
        <Form.Item name="vendorRequest"
          label="Enable On-Demand Vendor request:"
        >
          <Radio.Group onChange={handleVendorRequest} value={flag} disabled={!handlePrecheck()}>
            <Radio value={"Y"}>Yes</Radio>
            <Radio value={"N"} defaultChecked={true}>No</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item style={{ display: "none" }}>
          <Button htmlType="submit" ref={button}></Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default memo(withRouter(BusinessRequirements));