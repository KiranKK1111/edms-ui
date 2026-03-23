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
  Divider,
  Radio,
  message,
  Modal,
  Space,
  Upload,
} from "antd";
import {
  UploadOutlined,
  PaperClipOutlined,
  DeleteOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import "./SplittingConfiguration.css";
import { configUiFn, getSchemasID } from "../../store/actions/datafeedAction";
const { confirm } = Modal;

const SplittingConfiguration = (props) => {
  const formRef = createRef();
  const dispatch = useDispatch();
  const params = useParams();
  const configValues = useSelector((state) => state.datafeedInfo.congigUi);
  const [exitingSchema, setExitingSchema] = useState("No");
  const [schemaId, setSchemaId] = useState("NA");
  const [dataFeedType, setDataFeedType] = useState(
    "com.scb.edms.edmsdataflowsvc.routes.FundamentalsRoute"
  );
  const [uploadSchemaDataOn, setUploadSchemaDataOn] = useState(false);
  const [uploadSchemaMetaDataOn, setUploadSchemaMetaDataOn] = useState(false);

  const [editSchemaDataOn, setEditSchemaDataOn] = useState(false);
  const [editSchemaMetaDataOn, setEditSchemaMetaDataOn] = useState(false);
  const [showSchemaDataPdf, setShowSchemaDataPdf] = useState(false);
  const [showSchemaMetaDataPdf, setShowSchemaMetaDataPdf] = useState(false);
  const [showSchemaDataFileNew, setShowSchemaDataFileNew] = useState(false);
  const [showSchemaMetaDataFileNew, setShowSchemaMetaDataFileNew] =
    useState(false);
  const [schemaDataObj, setSchemaDataObj] = useState();
  const [schemaMetaDataObj, setSchemaMetaDataObj] = useState();
  const layout = {
    labelCol: {
      span: 8,
    },
    wrapperCol: {
      span: 16,
    },
    labelWrap: true,
  };
  useEffect(() => {
    if (!props.formData && Object.keys(configValues).length > 0) {
      let dataFeedTypeText =
        configValues.hasOwnProperty("splitterCanonicalClass") ||
          configValues.hasOwnProperty("dataFeedType")
          ? configValues["splitterCanonicalClass"] != undefined &&
            configValues["splitterCanonicalClass"] != "string"
            ? configValues["splitterCanonicalClass"]
            : configValues["dataFeedType"] != undefined &&
              configValues["dataFeedType"] != "string"
              ? configValues["dataFeedType"]
              : "com.scb.edms.edmsdataflowsvc.routes.FundamentalsRoute"
          : "com.scb.edms.edmsdataflowsvc.routes.FundamentalsRoute";
      formRef.current.setFieldsValue({
        exitingSchema:
          configValues["schemaId"] != undefined &&
            configValues["schemaId"] != "string" &&
            configValues["schemaId"] != "NA" &&
            configValues["schemaId"] != null
            ? "Yes"
            : "No",
        dataFeedType: dataFeedTypeText, //configValues.hasOwnProperty("splitterCanonicalClass") ? (configValues["splitterCanonicalClass"]!=undefined && configValues["splitterCanonicalClass"]!="string")?configValues["splitterCanonicalClass"] :"com.scb.edms.edmsdataflowsvc.routes.FundamentalsRoute": "com.scb.edms.edmsdataflowsvc.routes.FundamentalsRoute",
        schemaId: configValues.hasOwnProperty("schemaId")
          ? configValues["schemaId"] != undefined &&
            configValues["schemaId"] != "string"
            ? configValues["schemaId"]
            : "NA"
          : "NA",
      });
      setDataFeedType(dataFeedTypeText);
      //setDataFeedType((configValues["splitterCanonicalClass"]!=undefined && configValues["splitterCanonicalClass"]!="string")?configValues["splitterCanonicalClass"] :"com.scb.edms.edmsdataflowsvc.routes.FundamentalsRoute");
      setExitingSchema(
        configValues["schemaId"] != undefined &&
          configValues["schemaId"] != "string" &&
          configValues["schemaId"] != "NA" &&
          configValues["schemaId"] != null
          ? "Yes"
          : "No"
      );
      dispatch(getSchemasID());
    }
  }, []);
  const schemas = useSelector((state) => state.datafeedInfo.allSchemas);
  useEffect(() => {
    if (props.formData) {
      formRef.current.submit();
      props.next(false);
    }
  }, [props.formData]);

  const bindData = (data) => {
    const items = Object.keys(data);
    if (items.length) {
      items.forEach((subItem) => {
        if (subItem == "schemaDataObj") {
          setSchemaDataObj(data[subItem]);
          setShowSchemaDataFileNew(true);
        } else if (subItem == "schemaMetaDataObj") {
          setSchemaMetaDataObj(data[subItem]);
          setShowSchemaMetaDataFileNew(true);
        } else if (subItem == "splitterCanonicalClass") {
          setDataFeedType(data[subItem]);
        } else if (subItem == "schemaId") {
          setSchemaId(
            data[subItem] != "string" && data[subItem] != undefined
              ? data[subItem]
              : "NA"
          );
        }
        formRef.current.setFieldsValue({
          [subItem]:
            subItem == "schemaId"
              ? data[subItem] != "string" && data[subItem] != undefined
                ? data[subItem]
                : "NA"
              : data[subItem],
        });
      });
    }
  };

  useEffect(() => {
    if (Object.keys(configValues).length) {
      bindData(configValues);
      setExitingSchema(
        configValues["schemaId"] != undefined &&
          configValues["schemaId"] != "string" &&
          configValues["schemaId"] != "NA" &&
          configValues["schemaId"] != null
          ? "Yes"
          : "No"
      );
      setSchemaMetaDataObj(configValues.schemaMetaDataObj);
      setSchemaDataObj(configValues.schemaDataObj);
      setSchemaId(
        configValues["schemaId"] != undefined &&
          configValues["schemaId"] != "string"
          ? configValues.schemaId
          : "NA"
      );
    }
  }, [configValues]);

  const checkValidation = (rule, value) => {
    const RGX = /^\s+$/;
    if (RGX.test(value)) {
      return Promise.reject("Not a valid input");
    } else {
      return Promise.resolve("");
    }
  };

  const onFinish = (values) => {
    if (values["exitingSchema"] === "No") {
      values.schemaId = "NA";
    }
    if (values["exitingSchema"] === "Yes") {
      values.schemaId = schemaId;
    }
    values.schemaDataObj = schemaDataObj != undefined ? schemaDataObj : {};
    values.schemaMetaDataObj =
      schemaMetaDataObj != undefined ? schemaMetaDataObj : {};
    let finalData = { ...configValues, ...values };
    dispatch(configUiFn(finalData));
    props.next(true, finalData);
  };

  const isExitingSchema = (event) => {
    setExitingSchema(event.target.value);
    if (event.target.value == "No") {
      setSchemaId("NA");
    }
  };

  const handleSelect = (event, type) => {
    if (type == "schema") {
      setSchemaId(event);
    } else {
      setDataFeedType(event);
    }
  };

  const handleSchemaData = (e, type) => {
    if (type == "schemaData") {
      setSchemaDataObj(e.target.files[0]);
      setShowSchemaDataFileNew(true);
      setUploadSchemaDataOn(true);
    } else {
      setSchemaMetaDataObj(e.target.files[0]);
      setShowSchemaMetaDataFileNew(true);
      setUploadSchemaMetaDataOn(true);
    }
  };

  const propsSchemaDataFile = {
    showUploadList: false,
    name: "schemaData",
    maxCount: 1,
    accept: ".csv,.json,.xml,.xpath,.xsd",
    beforeUpload: (file, fileList) => {
      if (file.size > 100 * 1024 * 1024) {
        message.error(
          "File not uploaded due to: Max File size upload allowed is 100MB"
        );
      } else {
        // setFileObj(file);
      }
    },
    onRemove: () => {
      setUploadSchemaDataOn(false);
      setEditSchemaDataOn(true);
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
    }) { },
    onChange(info) { },
  };

  const propsSchemaMetaDataFile = {
    showUploadList: false,
    name: "schemaMetaData",
    maxCount: 1,
    accept: ".csv,.json,.xml,.xpath",
    beforeUpload: (file, fileList) => {
      if (file.size > 100 * 1024 * 1024) {
        message.error(
          "File not uploaded due to: Max File size upload allowed is 100MB"
        );
      } else {
        // setFileObj(file);
      }
    },
    onRemove: () => {
      setUploadSchemaMetaDataOn(false);
      setEditSchemaMetaDataOn(true);
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
    }) { },
    onChange(info) { },
  };

  const handleDeleteSchemaDataFileUpload = (data, objectType) => {
    if (objectType == "schemaData") {
      setUploadSchemaDataOn(false);
      setShowSchemaDataFileNew(false);
      setSchemaDataObj();
    } else {
      setUploadSchemaMetaDataOn(false);
      setShowSchemaMetaDataFileNew(false);
      setSchemaMetaDataObj();
    }
  };

  const handleDeleteSchemaDataFile = (record, type, objectType) => {
    if (type === "upload") {
      let objType =
        objectType === "schemaMetaData"
          ? ["showSchemaDataFileNew"]
          : ["showSchemaMetaDataFileNew"];
      let uploadOn =
        objectType === "schemaMetaData"
          ? ["schemaMetaDataUploadOn"]
          : ["schemaDataUploadOn"];
      let fileObj =
        objectType === "schemaMetaData"
          ? ["schemaDataFileObj"]
          : ["schemaMetaDataFileObj"];
      var data = {
        [objType]: false,
        [uploadOn]: false,
        [fileObj]: {},
      };
      confirm({
        title: "Do you want to replace the item",
        icon: <CloseCircleOutlined style={{ color: "red" }} />,
        okType: "danger",
        content: "This file/link is already existing. Replace? ",
        onOk() {
          handleDeleteSchemaDataFileUpload(data, objectType);
        },
        onCancel() {
          if (objectType === "schemaMetaData") {
            setUploadSchemaMetaDataOn(true);
            setShowSchemaMetaDataFileNew(true);
          } else {
            //setShowSchemaDataPdf(true);
            setUploadSchemaDataOn(true);
            setShowSchemaDataFileNew(true);
          }
        },
      });
    } else {
      confirm({
        title: "Do you want to replace the item",
        icon: <CloseCircleOutlined style={{ color: "red" }} />,
        okType: "danger",
        content: "This file/link is already existing. Replace? ",
        onOk() {
          setShowSchemaDataPdf(false);
          setUploadSchemaDataOn(false);
        },
        onCancel() {
          setShowSchemaDataPdf(true);
          setUploadSchemaDataOn(false);
        },
      });
    }
  };

  const {
    docTitle = "string",
    docDescription = "string",
    docDisplayFilename = "string",
  } = configValues || {
    docTitle: "",
    docDescription: "",
    docDisplayFilename: "",
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
            Splitting Configuration
          </h3>
        </Col>
      </Row>
      <Row gutter={[78, 0]}>
        <Col span={12}>
          <Form.Item
            label={
              <Tooltip
                title="Specify if the schema already exists or will a new schema data need to be created.  Yes = schema already exists.
              "
              >
                Existing schema
              </Tooltip>
            }
            name="exitingSchema"
            rules={[
              { required: true, message: "Existing schema is mandatory !" },
            ]}
          >
            <Radio.Group value={exitingSchema} onChange={isExitingSchema}>
              <Radio value={"Yes"}>Yes</Radio>
              <Radio value={"No"}>No</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={[78, 0]}>
        <Col span={12}>
          <Form.Item
            name="schemaId"
            label={
              <Tooltip title="Choose the existing schema id from the dropdown list if it's an existing schema.  For new schemas, this will be blank and will be auto-generated upon submission.">
                Schema ID
              </Tooltip>
            }
            rules={[{ required: true, message: "Schema ID is mandatory !" }]}
          >
            {exitingSchema === "Yes" ? (
              <Select
                defaultValue={schemaId}
                value={schemaId}
                onChange={(e) => handleSelect(e, "schema")}
                disabled={false}
                id="schema-select"
              >
                {schemas && schemas.length > 0 ? (
                  schemas.map((schemasData) => (
                    <Option value={schemasData.schemaName}>
                      {schemasData.schemaName}
                    </Option>
                  ))
                ) : (
                  <Option value={"NA"}>NA</Option>
                )}
              </Select>
            ) : (
              <Select defaultValue={schemaId} value={schemaId} disabled={true}>
                <Option value={"NA"}>NA</Option>
              </Select>
            )}
          </Form.Item>
        </Col>
        <Col span={12} style={{ paddingLeft: "0" }}>
          <Form.Item
            name="schemaData"
            label={"Schema data"}
            type="file"
            id="fileInput"
            onChange={(e) => handleSchemaData(e, "schemaData")}
            rules={
              exitingSchema === "Yes"
                ? ""
                : [
                  {
                    required: true,
                    message: "Please Upload a valid file",
                  },
                ]
            }
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
                  //marginLeft: 77,
                  //marginBottom: 15,
                  //marginTop:5
                }}
              >
                <Upload {...propsSchemaDataFile} maxCount={1}>
                  <Button
                    disabled={
                      exitingSchema == "Yes"
                        ? true
                        : false &&
                        (showSchemaDataPdf ||
                          uploadSchemaDataOn ||
                          showSchemaDataFileNew) &&
                        schemaDataObj &&
                        schemaDataObj?.name
                    }
                    icon={<UploadOutlined />}
                  >
                    Click to Upload
                  </Button>

                  <div
                    style={{
                      //textAlign: "left",
                      marginTop: "auto",
                      marginLeft: 0,
                    }}
                  >
                    <div
                      style={{
                        //marginBottom:5,
                        //marginLeft: 190,
                        fontSize: "10px",
                        fontWeight: "bold",
                        input: "read-only",
                        color: "gray",
                      }}
                    >
                      Supported formats : .json, .xsd
                    </div>
                  </div>
                </Upload>
                {showSchemaDataFileNew &&
                  schemaDataObj &&
                  schemaDataObj?.name && (
                    <Button
                      //disabled={isButtonDisabled}
                      type="button"
                      className="link-button talign"
                      alt={
                        schemaDataObj && schemaDataObj?.name
                          ? schemaDataObj?.name
                          : ""
                      }
                      //style={{ marginLeft: 30 }}
                      onClick={() =>
                        handleDeleteSchemaDataFile(
                          schemaDataObj,
                          "upload",
                          "schemaData"
                        )
                      }
                    >
                      <strong>
                        &nbsp;&nbsp; &nbsp;&nbsp; <PaperClipOutlined /> &nbsp;
                        {schemaDataObj && schemaDataObj?.name
                          ? schemaDataObj?.name
                          : ""}
                        &nbsp;&nbsp;
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
          {/*showSchemaDataPdf && (
            <Button
              //disabled={isButtonDisabled}
              type="button"
              className="link-button talign"
              alt={docDisplayFilename}
              style={{ marginLeft: 30 }}

            >
              <strong>
                &nbsp;&nbsp; &nbsp;&nbsp;{" "}
                <PaperClipOutlined /> &nbsp;
                                    {docDisplayFilename}&nbsp;&nbsp;
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
        </Col>
      </Row>
      <Row gutter={[78, 0]}>
        <Col span={12}>
          <Form.Item
            name="dataFeedType"
            label="Data format"
            rules={[
              { required: true, message: "Data Feed type is mandatory !" },
            ]}
          >
            <Select
              defaultValue={dataFeedType}
              value={dataFeedType}
              onChange={(e) => handleSelect(e, "dataFeedType")}
            >
              <Option value="com.scb.edms.edmsdataflowsvc.routes.FundamentalsRoute">
                xml
              </Option>
              <Option value="com.scb.edms.edmsdataflowsvc.routes.JSONSplitValidateRoute">
                json
              </Option>
              <Option value="com.scb.edms.edmsdataflowsvc.routes.XpathSplitValidateRoute">
                xpath
              </Option>
              <Option value="com.scb.edms.edmsdataflowsvc.routes.CSVInitialRoute">
                csv
              </Option>
            </Select>
          </Form.Item>
        </Col>

        <Col span={12} style={{ paddingLeft: "0" }}>
          <Form.Item
            name="schemaMetaData"
            label={"Schema metadata"}
            type="file"
            id="fileInput"
            onChange={handleSchemaData}
            rules={
              exitingSchema === "Yes"
                ? ""
                : [
                  {
                    required: true,
                    message: "Please Upload a valid file",
                  },
                ]
            }
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
                }}
              >
                <Upload {...propsSchemaMetaDataFile} maxCount={1}>
                  <Button
                    disabled={
                      exitingSchema == "Yes"
                        ? true
                        : false &&
                        (showSchemaMetaDataPdf ||
                          uploadSchemaMetaDataOn ||
                          showSchemaMetaDataFileNew) &&
                        schemaMetaDataObj &&
                        schemaMetaDataObj.name
                    }
                    icon={<UploadOutlined />}
                  >
                    Click to Upload
                  </Button>
                  <div
                    style={{
                      //textAlign: "left",
                      marginTop: "auto",
                      marginLeft: 0,
                    }}
                  >
                    <div
                      style={{
                        //marginBottom:5,
                        //marginLeft: 190,
                        fontSize: "10px",
                        fontWeight: "bold",
                        input: "read-only",
                        color: "gray",
                      }}
                    >
                      Supported format : .json
                    </div>
                  </div>
                </Upload>
                {showSchemaMetaDataFileNew &&
                  schemaMetaDataObj &&
                  schemaMetaDataObj.name && (
                    <Button
                      //disabled={isButtonDisabled}
                      type="button"
                      className="link-button talign"
                      alt={
                        schemaMetaDataObj && schemaMetaDataObj.name
                          ? schemaMetaDataObj.name
                          : ""
                      }
                      //style={{ marginLeft: 30 }}
                      onClick={() =>
                        handleDeleteSchemaDataFile(
                          schemaMetaDataObj,
                          "upload",
                          "schemaMetaData"
                        )
                      }
                    >
                      <strong>
                        &nbsp;&nbsp; &nbsp;&nbsp; <PaperClipOutlined /> &nbsp;
                        {schemaMetaDataObj && schemaMetaDataObj.name
                          ? schemaMetaDataObj.name
                          : ""}
                        &nbsp;&nbsp;
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
                {/*showSchemaDataPdf && (
            <Button
              //disabled={isButtonDisabled}
              type="button"
              className="link-button talign"
              alt={docDisplayFilename}
              style={{ marginLeft: 30 }}

            >
              <strong>
                &nbsp;&nbsp; &nbsp;&nbsp;{" "}
                <PaperClipOutlined /> &nbsp;
                                    {docDisplayFilename}&nbsp;&nbsp;
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
                )*/}
              </div>
            </Space>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={[78, 0]}>
        <Col span={12}>
          <Form.Item
            label={
              <Tooltip
                title="Camel expression for polling the source of the data for splitting.  Must be a valid camel expression.
              "
              >
                Splitting path expression
              </Tooltip>
            }
            name="splittingPathExpression"
            rules={
              dataFeedType ==
                "com.scb.edms.edmsdataflowsvc.routes.JSONSplitValidateRoute" ||
                dataFeedType == "json" ||
                dataFeedType == "xpath" ||
                dataFeedType ==
                "com.scb.edms.edmsdataflowsvc.routes.XpathSplitValidateRoute"
                ? [
                  {
                    required: true,
                    message: "Splitting path expression is mandatory !",
                  },
                  { validator: checkValidation },
                ]
                : ""
            }
          >
            <Input
              name="splittingPathExpression"
              type="text"
              id="splittingPathExp"
            />
          </Form.Item>
        </Col>
        <Col span={12} style={{ paddingLeft: "0px" }}>
          <Form.Item
            label={
              <Tooltip
                title={`Enter in this format: "direct://"+Vendor+"-"+ "dataset" + feedname+"splitting-queue"
            .`}
              >
                Splitting source expression
              </Tooltip>
            }
            name="splittingSourceExpression"
            rules={[
              {
                required: true,
                message: "Splitting source expression is mandatory !",
              },
              { validator: checkValidation },
            ]}
          >
            <Input
              name="splittingSourceExpression"
              type="text"
              id="splittingSourceExp"
            />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default memo(SplittingConfiguration);