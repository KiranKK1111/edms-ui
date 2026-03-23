import { QuestionCircleOutlined } from "@ant-design/icons";
import { Button, Col, DatePicker, Form, Input, Radio, Row } from "antd";
import moment from "moment";
import React, { createRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { support } from "../../../store/actions/licensedataAction";
import { bindData } from "../bindData/bindData";
import { useParams, useLocation } from "react-router-dom";
const { TextArea } = Input;
const layout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 18,
  },
};

function LicenseLimitations(props) {
  const [issueManagement] = useState(props.issueManagement);
  const [notifications] = useState(props.notifications);
  const [dataExpertFullName] = useState(props.dataExpertFullName);
  const [dataExpertEmailAddress] = useState(props.dataExpertEmailAddress);
  const [datesCoveredStart] = useState(props.datesCoveredStart);
  const [datesCoveredEnd] = useState(props.datesCoveredEnd);
  const [form] = Form.useForm();
  const reduxData1 = useSelector((state) => state.license);
  const { RangePicker } = DatePicker;
  const location = useLocation();
  function onChange(dates, dateStrings) {
    props.handleCoverdate(dateStrings[0], dateStrings[1]);
  }

  const dispatch = useDispatch();
  const reduxData = useSelector((state) => state.licenseReq);
  const formRef = createRef();
  const button = createRef();
  const params = useParams();

  const { formData } = props;

  let formFinalData = [];
  const onFinish = (values) => {
    formFinalData.push(values);
    if (formFinalData.length === 1) {
      dispatch(support(formFinalData));
      props.next(true);
    }
  };

  const disabledDate = (current) => {
    // Can not select days before today and today
    // return current && current < moment().endOf("day");
  };

  useEffect(() => {
    const selectedData =
      reduxData.support && reduxData.support.length
        ? reduxData.support
        : reduxData1.selectedLicense;

    if (typeof selectedData === "object" && Object.keys(selectedData).length) {
      bindData(selectedData, formRef.current);
    } else if (location.state && location.state.record) {
      let data = [
        {
          licenceLimitations: location.state.record.licenseLimitations,
        },
      ];
      bindData(data, formRef.current);
    } else {
      bindData([], formRef.current);
    }
  }, [reduxData, reduxData1, location]);

  useEffect(() => {
    if (formData) {
      button.current.click();
      props.next(false);
    }
  }, [formData]);

  return (
    <div>
      <Form form={form} {...layout} ref={formRef} onFinish={onFinish}>
        <Row gutter={[72, 0]}>
          <Col span={20}>
            <Form.Item
              name="licenceLimitations"
              label="Licence Limitations"
              tooltip={{
                title: "Licence Limitations",
                icon: <QuestionCircleOutlined style={{ color: "#1890ff" }} />,
              }}
            >
              <TextArea
                name="licenceLimitations"
                rows={6}
                showCount
                maxLength={1000}
                placeholder="Licence Limitations"
              />
            </Form.Item>
            <Form.Item style={{ display: "none" }}>
              <Button htmlType="submit" ref={button}></Button>
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={12}>
            <Form.Item style={{ display: "none" }}>
              <Button htmlType="submit" ref={button}>
                Click
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
}

export default LicenseLimitations;