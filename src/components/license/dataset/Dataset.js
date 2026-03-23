import { QuestionCircleOutlined } from "@ant-design/icons";
import { Button, Col, Form, Radio, Row, Select } from "antd";
import React, { createRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { dataset } from "../../../store/actions/licensedataAction";
import { bindData } from "../bindData/bindData";
import { useParams } from "react-router-dom";

const layout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 18,
  },
};

function Dataset(props) {
  const { Option } = Select;
  const reduxData1 = useSelector((state) => state.license);
  const [personalData] = useState(props.personalData);
  const [dataValidity] = useState(props.dataValidity);
  const [metaData] = useState(props.metaData);
  const params = useParams();

  const [securityRating, setSecurityRating] = useState(null);

  const [metaDataViewPermission] = useState(props.metaDataViewPermission);
  const [form] = Form.useForm();

  const dispatch = useDispatch();
  const reduxData = useSelector((state) => state.licenseReq);

  const formRef = createRef();
 
  const button = createRef();

  const { formData } = props;

  let formFinalData = [];
  const onFinish = (values) => {
    formFinalData.push(values);
    if (formFinalData.length === 1) {
      dispatch(dataset(formFinalData));
      props.next(true);
    }
  };

  useEffect(() => {
    if (!params.id) {
      
      formRef.current.setFieldsValue({
        ["personalData"]: "yes",
        ["dataValidity"]: "yes",
        ["metaData"]: "yes",
        ["metaDataViewPermission"]: "yes",
      });
    }

    const selectedData =
      reduxData.dataset && reduxData.dataset.length
        ? reduxData.dataset
        : reduxData1.selectedLicense;

    if (typeof selectedData === "object" && Object.keys(selectedData).length) {
      bindData(selectedData, formRef.current);
      setSecurityRating(
        selectedData[0] && selectedData[0].securityRating
          ? selectedData[0].securityRating
          : null
      );
    } else {
      bindData([], formRef.current);
      
      formRef.current.setFieldsValue({
        ["personalData"]: "yes",
        ["dataValidity"]: "yes",
        ["metaData"]: "yes",
        ["metaDataViewPermission"]: "yes",
      });
    }
    
  }, []);

  useEffect(() => {
    if (formData) {
      button.current.click();
      
      props.next(false);
    }
    
  }, [formData]);

  return (
    <div>
      <Form
        form={form}
        layout="horizontal"
        {...layout}
        labelCol={{ span: 10 }}
        ref={formRef}
        onFinish={onFinish}
      >
        <Row gutter={[72, 0]}>
          <Col className="gutter-row" span={12}>
            <Form.Item
              name="radio-group1"
              label="Dataset contains Personal Data"
              tooltip={{
                title: "Dataset contains Personal Data",
                icon: <QuestionCircleOutlined style={{ color: "#1890ff" }} />,
              }}
            >
              <Radio.Group
                name="personalData"
                defaultValue={personalData}
                onChange={(e) => props.handleChange(e)}
              >
                <Radio.Button value="yes">Yes</Radio.Button>
                <Radio.Button value="no">No</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={12}>
            <Form.Item
              name="securityRating"
              label="Information Security Rating"
              tooltip={{
                title: "Information Security Rating",
                icon: <QuestionCircleOutlined style={{ color: "#1890ff" }} />,
              }}
              rules={[
                {
                  required: true,
                  message: "Information Security Rating is mandatory !",
                },
              ]}
            >
              <Select
                
                name="securityRating"
                defaultValue={securityRating}
                onChange={(e) => props.handleInformationSecurityRating(e)}
                placeholder="Select your security rating"
                allowClear
              >
                <Option value="C1-Public data">Public data</Option>
                <Option value="C2-Internal data">Internal data</Option>
                <Option value="C3-Confidential data">Confidential data</Option>
                <Option value="C4-Restrcited data">Restricted data</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={12}>
            <Form.Item
              name="dataValidity"
              label="Data Validity"
              tooltip={{
                title: "Data Validity",
                icon: <QuestionCircleOutlined style={{ color: "#1890ff" }} />,
              }}
            >
              <Radio.Group
                name="dataValidity"
                defaultValue={dataValidity}
                onChange={(e) => props.handleChange(e)}
              >
                <Radio.Button value="yes">Yes</Radio.Button>
                <Radio.Button value="no">No</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={12}>
            <Form.Item
              name="metaData"
              label="Metadata Available"
              tooltip={{
                title: "Metadata Available",
                icon: <QuestionCircleOutlined style={{ color: "#1890ff" }} />,
              }}
            >
              <Radio.Group
                name="metaData"
                defaultValue={metaData}
                onChange={(e) => props.handleChange(e)}
              >
                <Radio.Button value="yes">Yes</Radio.Button>
                <Radio.Button value="no">No</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={12}>
            <Form.Item
              name="metaDataViewPermission"
              label="Metadata Viewing Permission"
              tooltip={{
                title: "Metadata Viewing Permission",
                icon: <QuestionCircleOutlined style={{ color: "#1890ff" }} />,
              }}
            >
              <Radio.Group
                name="metaDataViewPermission"
                defaultValue={metaDataViewPermission}
                onChange={(e) => props.handleChange(e)}
              >
                <Radio.Button value="yes">Yes</Radio.Button>
                <Radio.Button value="no">No</Radio.Button>
              </Radio.Group>
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

export default Dataset;