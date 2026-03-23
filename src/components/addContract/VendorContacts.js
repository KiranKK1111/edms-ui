import { Button, Col, Form, Input, Row } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { createRef, memo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { vendorContacts } from "../../store/actions/contractAction";
import { bindData } from "./bindData";
import "./VendorContacts.css";

const { TextArea } = Input;
const layout = {
  labelCol: {
    span: 5,
  },
  wrapperCol: {
    span: 16,
  },
};

const VendorContacts = (props) => {
  const dispatch = useDispatch();
  const reduxData = useSelector((state) => state.contract);
  const formRef = createRef();
  const button = createRef();
  useEffect(() => {
    formRef.current.setFieldsValue({
      billingModel: "Shared cost",
    });
    bindData(
      reduxData.vendorContacts.length
        ? reduxData.vendorContacts
        : reduxData.selectedContract,
      formRef.current
    );
  }, [reduxData.vendorContacts, reduxData.selectedContract]);

  let formFinalData = [];
  const onFinish = (values) => {
    formFinalData.push(values);
    if (formFinalData.length === 1) {
      dispatch(vendorContacts(formFinalData));
      props.next(true);
    }
  };

  /*const checkValidation = (rule, value) => {
    const RGX =
      (rule && rule.field === "accountMgrEmail") ||
      rule.field === "techSupportMgrEmail"
        ? /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/
        : /^(?:[A-Za-z]+)(?:[A-Za-z0-9 _]*)$/;

    if (RGX.test(value)) {
      return Promise.resolve("");
    } else {
      const msg =
        (rule && rule.field === "accountMgrEmail") ||
        rule.field === "techSupportMgrEmail"
          ? "Invalid email id"
          : "Invalid characters";
      return Promise.reject(msg);
    }
  };*/

  useEffect(() => {
    if (props.formData) {
      button.current.click();
      props.next(false);
    }
  }, [props.formData]);

  return (
    <Form {...layout} name="usage-one" onFinish={onFinish} ref={formRef}>
      <Row gutter={[78, 0]}>
        <Col span={22}>
          <Form.Item
            name="agreementLimitations"
            label="Agreement Limitations"
            tooltip={{
              title: "Agreement Limitations",
              icon: <QuestionCircleOutlined style={{ color: "#1890ff" }} />,
            }}
          >
            <TextArea
              name="agreementLimitations"
              rows={6}
              showCount
              maxLength={1000}
              placeholder="Agreement Limitations"
            />
          </Form.Item>
          <Form.Item style={{ display: "none" }}>
            <Button htmlType="submit" ref={button}></Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default memo(VendorContacts);