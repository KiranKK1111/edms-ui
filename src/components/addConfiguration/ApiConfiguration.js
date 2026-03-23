import React, { useState, useEffect, memo, createRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Select,
  Tooltip,
  Checkbox,
  Layout,
  Modal,
  Divider,
  Space,
  Upload,
  Radio,
  message,
} from "antd";
import TextArea from "antd/lib/input/TextArea";
import {
  HomeOutlined,
  DownOutlined,
  UploadOutlined,
  PaperClipOutlined,
  DeleteOutlined,
  LinkOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import "antd/dist/antd.css";
import moment from "moment";
import "./GeneralConfiguration.css";
import { configUiFn } from "../../store/actions/datafeedAction";
import { tokenEx } from "../../test/regEx";
const { Content } = Layout;
const { confirm } = Modal;

const ApiConfiguration = (props) => {
  const formRef = createRef();
  const dispatch = useDispatch();
  const params = useParams();
  const configValues = useSelector((state) => state.datafeedInfo.congigUi);
  const [requestMethod, setRequestMethod] = useState("POST");
  const [tokenReq, setTokenReq] = useState("No");

  const [uploadOn, setUploadOn] = useState(false);
  const [editOn, setEditOn] = useState(false);
  const [showPdf, setShowPdf] = useState(false);
  const [showFileNew, setShowFileNew] = useState(false);

  const [requestBodyObj, setRequestBodyObj] = useState();

  useEffect(() => {
    if (props.formData) {
      formRef.current.submit();
      props.next(false);
    }
  }, [props.formData]);

  const layout = {
    labelCol: {
      span: 8,
    },
    wrapperCol: {
      span: 16,
    },
    labelWrap: true,
  };

  const isTokenReq = (event) => {
    setTokenReq(event.target.value);
  };
  const isRequestMethod = (event) => {
    setRequestMethod(event.target.value);
  };
  const handleFile = (e) => {
    setRequestBodyObj(e.target.files[0]);
    setShowFileNew(true);
    setUploadOn(true);
  };

  const bindData = (data) => {
    const items = Object.keys(data);
    if (items.length) {
      items.forEach((subItem) => {
        if (subItem == "requestBodyObj") {
          setRequestBodyObj(data[subItem]);
          setShowFileNew(true);
        } else if (subItem == "requestMethod") {
          setRequestMethod(data[subItem] != "" ? data[subItem] : "POST");
        }
        formRef.current.setFieldsValue({
          [subItem]: data[subItem],
        });
      });
    }
  };

  useEffect(() => {
    if (!props.formData && Object.keys(configValues).length > 0) {
      formRef.current.setFieldsValue({
        requestMethod: configValues.hasOwnProperty("requestMethod")
          ? configValues["requestMethod"]
          : "POST",
        tokenReq: configValues.hasOwnProperty("tokenReq")
          ? configValues["tokenReq"]
          : "No",
      });
    }
  }, []);

  useEffect(() => {
    if (Object.keys(configValues).length) {
      bindData(configValues);
      setTokenReq(configValues.tokenReq);
      if (configValues.requestBody != "") {
        //let filename=configValues.requestBody
        setUploadOn(true);
      }
    }
  }, [configValues]);

  const onFinish = (values) => {
    if (values["tokenReq"] === "No") {
      values.tokenURL = "";
      values.username = "";
      values.passwordProperty = "";
    }
    values.requestBodyObj = requestBodyObj;
    let finalData = { ...configValues, ...values };
    dispatch(configUiFn(finalData));
    props.next(true, finalData);
  };

  const propsFile = {
    showUploadList: false,
    name: "requestBody",
    maxCount: 1,
    accept: ".txt,csv", //".pptx,.docx,.pdf,.xslx,.csv ",
    beforeUpload: (file, fileList) => {
      if (file.type !== "text/plain" && file.type !== "text/csv") {
        message.error("Please upload a supported format file.");
      } else {
        // setRequestBodyObj(file);
      }
    },
    onRemove: () => {
      setUploadOn(false);
      setEditOn(true);
    },
    async customRequest({
      action,
      data,
      file,
      filename,
      headers,
      onError,
      onProgress,
      onSuccess,
      withCredentials,
    }) {},
    onChange(info) {},
  };

  const handleDeleteFileUpload = () => {
    setUploadOn(false);
    setShowFileNew(false);
    setRequestBodyObj();
  };

  const handleDeleteFile = (record, type) => {
    if (type === "upload") {
      var data = {
        showFileNew: false,
        uploadOn: false,
        requestBodyObj: {},
      };
      confirm({
        title: "Do you want to replace the item",
        icon: <CloseCircleOutlined style={{ color: "red" }} />,
        okType: "danger",
        content: "This file is already existing. Replace? ",
        onOk() {
          handleDeleteFileUpload(data);
        },
        onCancel() {
          //setShowPdf(true);
          setUploadOn(true);
          setShowFileNew(true);
        },
      });
    } else {
      confirm({
        title: "Do you want to replace the item",
        icon: <CloseCircleOutlined style={{ color: "red" }} />,
        okType: "danger",
        content: "This file/link is already existing. Replace? ",
        onOk() {
          setShowPdf(false);
          setUploadOn(false);
        },
        onCancel() {
          setShowPdf(true);
          setUploadOn(false);
        },
      });
    }
  };

  return (
    <Form
      name="br-one"
      {...layout}
      onFinish={onFinish}
      className="label-wrap"
      style={{
        overflowWrap: "break-word",
        wordWrap: "break-word",
        whiteSpace: "normal",
      }}
      ref={formRef}
    >
      <Row gutter={[78, 0]}>
        <Col span={8}>
          <h3
            className="content-header"
            style={{ paddingBottom: "16px", fontWeight: "bold" }}
          >
            Request Details
          </h3>
        </Col>
      </Row>
      <Row gutter={[78, 0]}>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <Form.Item
            label={
              <Tooltip title="JSON request method.">Request method</Tooltip>
            }
            name="requestMethod"
            rules={[
              { required: true, message: "Request method is mandatory !" },
            ]}
          >
            <Radio.Group value={requestMethod} onChange={isRequestMethod}>
              <Radio value="GET">GET</Radio>
              <Radio defaultChecked value={"POST"}>
                POST
              </Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item label="Request parameters" name="requestParameter">
            <Input name="requestParameter" type="text" id="requestParameter" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <Form.Item
            label={
              <Tooltip title="Choose the file that contains the request body information.">
                Request body
              </Tooltip>
            }
            name="requestBody"
            type="file"
            id="fileInput"
            onChange={handleFile}
            rules={[
              {
                required: true,
                message: "Please Upload a valid file",
              },
            ]}
          >
            <Space
              direction="vertical"
              style={{
                width: "100%",
              }}
              size="large"
            >
              <div
                style={{
                  display: "flex",
                  //height: 30,
                  //marginLeft: 70,
                  //marginBottom: 15
                }}
              >
                <Upload {...propsFile} maxCount={1}>
                  <Button
                    disabled={
                      (showPdf || uploadOn || showFileNew) &&
                      requestBodyObj &&
                      requestBodyObj.name
                    }
                    icon={<UploadOutlined />}
                  >
                    Click to Upload
                  </Button>
                  <div
                    style={{
                      //marginLeft: '18%',
                      fontSize: "10px",
                      fontWeight: "bold",
                      input: "read-only",
                      color: "gray",
                    }}
                  >
                    Please upload a text file with JSON contents
                  </div>
                </Upload>
                {showFileNew && requestBodyObj && requestBodyObj.name && (
                  <Button
                    //disabled={isButtonDisabled}
                    type="button"
                    className="link-button talign"
                    alt={requestBodyObj.name}
                    onClick={() => handleDeleteFile(requestBodyObj, "upload")}
                  >
                    <strong>
                      &nbsp;&nbsp; &nbsp;&nbsp; <PaperClipOutlined /> &nbsp;
                      {requestBodyObj.name}&nbsp;&nbsp;
                      <DeleteOutlined
                        style={{
                          border: "1px solid red",
                          color: "red",
                          width: 20,
                          height: 20,
                          margin: 0,
                        }}
                      />
                    </strong>
                  </Button>
                )}
              </div>
            </Space>
          </Form.Item>
          {/*showPdf && (
            <Button
              //disabled={isButtonDisabled}
              type="button"
              className="link-button talign"
              alt={requestBodyObj}
              style={{ marginLeft: 30 }}
            >
              <strong>
                &nbsp;&nbsp; &nbsp;&nbsp;{" "}
                <PaperClipOutlined /> &nbsp;
                                    {requestBodyObj}&nbsp;&nbsp;
                                    <DeleteOutlined
                  style={{
                    border: "1px solid red",
                    color: "red",
                    width: 20,
                    height: 20,
                    margin: 0,
                  }}
                />
              </strong>
            </Button>
                )}*/}

          <Form.Item
            label="Request headers"
            name="requestHeaders"
            rules={[
              { required: true, message: "Request headers is mandatory !" },
            ]}
          >
            <TextArea
              name="requestHeaders"
              rows={3}
              showCount
              maxLength={1000}
            />
          </Form.Item>
        </Col>
      </Row>
      <Divider plain></Divider>
      <Row gutter={[78, 0]}>
        <Col span={8}>
          <h3
            className="content-header"
            style={{ paddingBottom: "16px", fontWeight: "bold" }}
          >
            Authentication Details
          </h3>
        </Col>
      </Row>
      <Row gutter={[78, 0]}>
        <Col span={12}>
          <Form.Item
            label={
              <Tooltip title="Enter yes if a token is required.">
                Token requirement
              </Tooltip>
            }
            name="tokenReq"
            rules={[
              { required: true, message: "Token requirement is mandatory !" },
            ]}
          >
            <Radio.Group value={tokenReq} onChange={isTokenReq}>
              <Radio value={"Yes"}>Yes</Radio>
              <Radio defaultChecked value={"No"}>
                No
              </Radio>
            </Radio.Group>
          </Form.Item>
          {tokenReq === "Yes" ? (
            <Form.Item
              label={
                <Tooltip
                  title="Username to be used for token authentication.
                "
                >
                  Username
                </Tooltip>
              }
              name="userName"
              rules={[{ required: true, message: "Username is mandatory !" }]}
            >
              <Input name="userName" type="text" id="userName" />
            </Form.Item>
          ) : (
            ""
          )}
        </Col>
        {tokenReq === "Yes" ? (
          <Col span={12}>
            <Form.Item
              label={
                <Tooltip
                  title={`The token URL to be used.  For example example: 
              "https://selectapi.datascope.refinitiv.com/RestApi/v1/Authentication/RequestToken"
            `}
                >
                  Token URL
                </Tooltip>
              }
              name="tokenURL"
              rules={[
                {
                  required: true,
                  message: "Token URL property is mandatory !",
                },
                {
                  pattern: new RegExp(tokenEx),
                  message: "Not a valid Token URL",
                },
              ]}
            >
              <Input name="tokenURL" type="text" id="tokenURL" />
            </Form.Item>
            <Form.Item
              label={
                <Tooltip
                  title="The password property used to connect to the password vault.  You will need to get this from the dev team.
                "
                >
                  Password property
                </Tooltip>
              }
              name="passwordProperty"
              rules={[
                { required: true, message: "Password property is mandatory !" },
              ]}
            >
              <Input
                name="passwordProperty"
                type="text"
                id="passwordProperty"
              />
            </Form.Item>
          </Col>
        ) : (
          ""
        )}
      </Row>
    </Form>
  );
};

export default memo(ApiConfiguration);