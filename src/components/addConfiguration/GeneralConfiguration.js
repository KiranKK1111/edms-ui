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
} from "antd";
import moment from "moment";
import "./GeneralConfiguration.css";
import { configUiFn } from "../../store/actions/datafeedAction";
import { cornEx } from "../../test/regEx";

const GeneralConfiguration = (props) => {
  const [splittingRequirement, setSplittingRequirement] = useState("No");
  const [filenameDateSuffix, setFilenameDateSuffix] = useState("No");
  const [vendorRequestConfig, setVendorRequestConfig] = useState("N");
  const [routeType, setRouteType] = useState("Scheduled");
  const [proxyRequirement, setProxyRequirement] = useState("No");
  const [histLoad, setHistLoad] = useState("No");
  const [startDate, setStartDate] = useState({});
  const [historicLoadStartDate, setHistoricLoadStartDate] = useState({});
  const { TextArea } = Input;
  const formRef = createRef();
  const dispatch = useDispatch();
  const params = useParams();
  const configValues = useSelector((state) => state.datafeedInfo.congigUi);
  const isProxyReq = (event) => {
    setProxyRequirement(event.target.value);
  };
  const isVendorRequested = (event) => {
    setVendorRequestConfig(event.target.value);
  }
  const onChangeRadio = (event, type) => {
    if (type == "filenameDateSuffix") {
      setFilenameDateSuffix(event.target.value);
    } else {
      setRouteType(event.target.value);
    }
  };

  const isSplitReq = (event) => {
    setSplittingRequirement(event.target.value);
  };

  const isHistLoad = (event) => {
    setHistLoad(event.target.value);
  };

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
        if (subItem === "startDate" || subItem === "expiryDate") {
          formRef.current.setFieldsValue({
            [subItem]: moment(new Date(data[subItem])),
          });
        } else if (subItem === "routeType") {
          formRef.current.setFieldsValue({
            [subItem]:
              data[subItem] ==
                "com.scb.edms.edmsdataflowsvc.routes.ScheduledRoute" ||
                data[subItem] == "Scheduled"
                ? "Scheduled"
                : "One-time",
          });
        } else if (subItem === "configurationCreatedOn") {
          formRef.current.setFieldsValue({
            [subItem]: moment(new Date(data[subItem])).format("DD/MMM/YYYY"),
          });
        } else if (subItem === "filenameDateSuffix") {
          formRef.current.setFieldsValue({
            [subItem]: data[subItem]
          });
        } else if (subItem === "sourceProtocol") {
          formRef.current.setFieldsValue({
            [subItem]: data[subItem] == null ? "SFTP" : data[subItem],
          });
        } else {
          formRef.current.setFieldsValue({
            [subItem]: data[subItem],
          });
        }
      });
    }
  };

  const setDefaultValues = () => {
    formRef.current.setFieldsValue({
      createdBy: localStorage.getItem("psid"),
      storageLocation: "",
      configurationCreatedOn: moment(new Date()).format("DD/MMM/YYYY"),
      dataFeedId: params.id,
      routeName: (() => {
        const feedShortName = sessionStorage.getItem("feedShortName");
        return feedShortName ? feedShortName.replace(" ", "_") : "";
      })(),
      sourceProtocol: "SFTP",
      sourceProcessor: "sftpProcessor",
      asynchronousRoute: "False",
      splittingRequirement: "No",
      proxyRequirement: "No",
      histLoad: "No",
      routeType: "Scheduled",
      filenameFormat: "NotUsed",
      filenameDateSuffix: "No",
      filenameExtenion: "",
      startDate: "",
      expiryDate: "",
      cronScheduler: "",
      sourceHostName: "",
      sourcePortInteger: "",
      sourceUsername: "",
      sourcePasswordProperty: "",
      sourceFolder: "",
      destinationExpression: "",
      keyLocation: "",
      proxyHostname: "",
      proxyPort: "",
      isChecksum: false,
      vendorRequestConfig: "N"
    });
  };

  useEffect(() => {
    if (configValues && Object.keys(configValues).length > 0) {
      bindData(configValues);
      setFilenameDateSuffix(configValues.filenameDateSuffix)
      setProxyRequirement(configValues.proxyRequirement);
      setSplittingRequirement(configValues.splittingRequirement);
    } else {
      setDefaultValues();
    }
  }, [configValues]);

  const layout = {
    labelCol: {
      span: 10,
    },
    wrapperCol: {
      span: 14,
    },
    labelWrap: true,
  };

  const rowcolLayout = {
    style: {
      paddingLeft: "20px",
      paddingRight: "20px",
    },
  };

  const checkValidation = (rule, value) => {
    const RGX = /^\s+$/;
    if (RGX.test(value)) {
      return Promise.reject("Not a valid input");
    } else {
      return Promise.resolve("");
    }
  };

  const onFinish = (values) => {
    values.createdBy = localStorage.getItem("psid");
    values.dataFeedId = params.id;
    values.proxyHostname =
      values.proxyRequirement == "Yes" ? values.proxyHostname : "";
    values.proxyPort = values.proxyRequirement == "Yes" ? values.proxyPort : "";
    values.histLoad = histLoad;
    values.filenameDateSuffix = filenameDateSuffix;
    values.routeType = routeType;
    let finalData = { ...configValues, ...values };
    dispatch(configUiFn(finalData));
    props.next(true, finalData);
    props.passUpdates(values, true);
  };

  const startDateSetup = (event) => {
    // event ? console.log(moment(event).format("DDMMYYYY"),typeof(moment(event).format("DDMMYYYY"))) : console.log("NNOOOO");
    event ? setStartDate(moment(event).format("YYYY/MM/DD")) : setStartDate({});
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
      <Row gutter={[40, 0]}>
        <Col span={8}>
          <h3
            className="content-header"
            style={{ paddingBottom: "16px", fontWeight: "bold" }}
          >
            Main Configuration
          </h3>
        </Col>
      </Row>
      <Row gutter={[40, 0]}>
        <Col span={8}>
          <Form.Item
            name="startDate"
            label={
              <Tooltip title="Day from which the Configuration will take effect.  This will be when the route will start. This is only applicable when the Configuration is Active">
                Start date
              </Tooltip>
            }
            rules={[{ required: true, message: "Start date is mandatory !" }]}
          >
            <DatePicker
              name="startDate"
              format="DD/MMM/YYYY"
              onChange={startDateSetup}
              disabled={props.isUpdate}
              disabledDate={(current) => {
                return current && current < moment().startOf("day");
              }}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="expiryDate"
            label={
              <Tooltip title="Day from which the Configuration will be disabled.  Last day when the route will be used.">
                Expiry date
              </Tooltip>
            }
            rules={[{ required: true, message: "Expiry Date is mandatory !" }]}
          >
            <DatePicker
              name="expiryDate"
              format="DD/MMM/YYYY"
              disabledDate={(current) => {
                return current && current < moment(startDate).startOf("day");
              }}
            />
          </Form.Item>

          {/*<Form.Item label="Data Feed ID" name="dataFeedId">
            <Input
              placeholder="Auto-generated by system"
              name="dataFeedId"
              type="text"
              disabled
              id="dataFeedId"
            />
          </Form.Item>
          <Form.Item
            label="Configuration created on"
            name="configurationCreatedOn"
            rules={[
              {
                required: true,
                message: "Configuration created on is mandatory !",
              },
            ]}
          >
            <Input
              name="configurationCreatedOn"
              type="text"
              disabled
              id="configurationCreatedOn"
            />
          </Form.Item>
          <Form.Item
            label="Data Feed Configuration ID"
            name="dataFeedConfigurationId"
          >
            <Input
              placeholder="Auto-generated by system"
              name="dataFeedConfigurationId"
              type="text"
              disabled
              id="dataFeedConfigurationId"
            />
          </Form.Item>
          <Form.Item
            label="Created by"
            name="createdBy"
            rules={[{ required: true, message: "Created By is mandatory !" }]}
          >
            <Input name="createdBy" type="text" disabled id="createdBy" />
          </Form.Item>*/}
        </Col>
        <Col span={8}>
          <Form.Item
            label={
              <Tooltip title="If the key is available, enter the file location of EFS, otherwise null.">
                Key location
              </Tooltip>
            }
            name="keyLocation"
          >
            <Input disabled={props.isUpdate} name="keyLocation" type="text" id="keyLocation" />
          </Form.Item>
          {/*<Form.Item
            label={
              <Tooltip title="This will be where the Data Feeds downloaded from the vendor will be stored.">
                Storage location
              </Tooltip>
            }
            name="storageLocation"
          >
            <Input
              placeholder="Auto-generated by system"
              name="storageLocation"
              type="text"
              disabled
              id="storageLocation"
            />
          </Form.Item>*/}
        </Col>
      </Row>
      <Row gutter={[40, 0]}>
        <Col span={8}>
          <Form.Item
            label={
              <Tooltip title="This is a cron expression.  You can use a site  like http://www.cronmaker.com/?1 to generate cron.">
                Cron scheduler
              </Tooltip>
            }
            name="cronScheduler"
            rules={[
              { required: true, message: "Cron scheduler is mandatory !" },
              {
                pattern: new RegExp(cornEx.source),
                message: "Not a valid cron expression!",
              },
            ]}
          >
            <Input name="cronScheduler" type="text" id="cronScheduler" />
          </Form.Item>
        </Col>
        <Col span={16} className="storageLocation">
          <Form.Item
            label={
              <Tooltip title="This will be where the Data Feeds downloaded from the vendor will be stored.">
                Storage location
              </Tooltip>
            }
            name="storageLocation"
            rules={[
              {
                required: true,
                message: "Storage location property is mandatory !",
              },
              { validator: checkValidation },
            ]}
          >
            <Input disabled={props.isUpdate} name="storageLocation" type="text" id="storageLocation" />
          </Form.Item>
        </Col>
      </Row>
      <Divider
        plain
        style={{
          width: "auto",
          minWidth: "auto",
          marginTop: "24px",
          marginRight: "15%",
          marginLeft: "13%",
          marginBottom: "24px",
        }}
      ></Divider>
      <Row gutter={[40, 0]}>
        <Col span={8}>
          <Form.Item
            name="sourceProcessor"
            label="Source processor"
            rules={[
              { required: true, message: "Source processor is mandatory !" },
            ]}
          >
            {/* Introduced a new field - sftpProcessorMTime */}
            <Select disabled={props.isUpdate} defaultValue="Select">
              <Option value="sftpProcessor">sftpProcessor</Option>
              <Option value="sftpProcessorMTime">sftpProcessorMTime</Option>
              <Option value="httpProcessor">httpProcessor</Option>
              <Option value="ftpsProcessor">ftpsProcessor</Option>
              <Option value="DSSRestProcessor">DSSRestProcessor</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label={
              <Tooltip title="This will be the data source hostname or ip address, example: Refinitive: 10.192.191.25.">
                Source hostname
              </Tooltip>
            }
            name="sourceHostName"
            rules={[
              { required: true, message: "Source hostname is mandatory !" },
              {
                pattern: new RegExp(
                  "^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(https?:\\/\\/)?(www\\.|ftp\\.|sftp\\.)?[a-zA-Z0-9](?:[a-zA-Z0-9\\-]{0,61}[a-zA-Z0-9])?(\\.[a-zA-Z]{2,})+(\\/[a-zA-Z0-9\\-_.~+\\/=?]*)?$",
                  "i"
                ),
                message: "Not a valid host name",
              },
            ]}
          >
            <TextArea
              name="sourceHostName"
              rows={3}
              showCount
              maxLength={1000}
            />
            {/*<Input name="sourceHostName" type="text" id="sourceHostName" />*/}
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label={
              <Tooltip title="Port number of the source hostname.">
                Source port
              </Tooltip>
            }
            name="sourcePortInteger"
            rules={[
              { required: true, message: "Source port integer is mandatory !" },
              {
                pattern: new RegExp("^[0-9]+$"),
                message: "Only numbers and positive numbers are allowed",
              },
            ]}
          >
            <Input
              disabled={props.isUpdate}
              name="sourcePortInteger"
              type="text"
              id="sourcePortInteger"
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={[40, 0]} style={{ marginTop: "10px" }}>
        <Col span={8}>
          <Form.Item label="Source protocol" name="sourceProtocol">
            <Radio.Group buttonStyle="solid">
              <Radio.Button defaultChecked value={"SFTP"}>
                SFTP
              </Radio.Button>
              <Radio.Button disabled value={"HTTPS"}>
                HTTPS
              </Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label={
              <Tooltip title="User login to be used when connecting to the source hostname.">
                Source username
              </Tooltip>
            }
            name="sourceUsername"
            rules={[
              { required: true, message: "Source username is mandatory !" },
              { validator: checkValidation },
            ]}
          >
            <Input name="sourceUsername" type="text" id="sourceUsername" />
          </Form.Item>
        </Col>
        <Col span={8} className="ant-from-sourceProperty">
          <Form.Item
            label={
              <Tooltip title="The password property used to connect to the password vault.  You will need to get this from the Data Engineering team.">
                Source password property
              </Tooltip>
            }
            name="sourcePasswordProperty"
            rules={[
              {
                required: true,
                message: "Source password property is mandatory !",
              },
              { validator: checkValidation },
            ]}
          >
            <Input
              disabled={props.isUpdate}
              name="sourcePasswordProperty"
              type="text"
              id="sourcePasswordProperty"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[40, 0]}>
        <Col span={16} className="sourcefolder">
          <Form.Item
            label={
              <Tooltip title="Source folder with dynamic date template e.g. /inbox/ + formatDateString(yyyy-MM, 0)">
                Source folder
              </Tooltip>
            }
            name="sourceFolder"
            rules={[
              {
                required: true,
                message: "Source folder property is mandatory !",
              },
              { validator: checkValidation },
            ]}
          >
            <Input name="sourceFolder" type="text" id="sourceFolder" />
          </Form.Item>
        </Col>
      </Row>
      <Divider
        plain
        style={{
          width: "auto",
          minWidth: "auto",
          marginTop: "24px",
          marginRight: "15%",
          marginLeft: "13%",
          marginBottom: "24px",
        }}
      ></Divider>
      <Row gutter={[40, 0]}>
        <Col span={8}>
          <Form.Item
            label={
              <Tooltip title="Format of the filename.  This needs to be prepared based on the vendor file format.  Example: News\\.[A-Z0-9]+\\.([0-9]{8})\\.([0-9]{4})\\.txt\\.gz">
                Filename format
              </Tooltip>
            }
            name="filenameFormat"
            rules={[
              { required: true, message: "Filename format is mandatory !" },
              { validator: checkValidation },
              //{pattern:new RegExp("\\.[A-Z0-9]+\\.([0-9]{8})\\.([0-9]{4})\\.txt\\.gz"),message:"Not a valid file format."}
            ]}
          >
            <Input name="filenameFormat" type="text" id="filenameFormat" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label={
              <Tooltip title="If vendor filename format does not include the date, please choose No.">
                Filename date suffix
              </Tooltip>
            }
            name="filenameDateSuffix"
          >
            <Radio.Group
              disabled={props.isUpdate}
              value={filenameDateSuffix}
              defaultValue={filenameDateSuffix}
              onChange={(e) => onChangeRadio(e, "filenameDateSuffix")}
            >
              <Radio value={"Yes"}>Yes</Radio>
              <Radio value={"No"}>No</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label={
              <Tooltip title="If vendor filename must include the extension, please provide it here.">
                Filename extension
              </Tooltip>
            }
            name="filenameExtension"
          >
            <Input disabled={props.isUpdate} name="filenameExtension" type="text" id="filenameExtension" />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={[40, 0]}>
        <Col span={8}>
          <Form.Item
            label={
              <Tooltip title="The unique route name for the feed.">
                Route name
              </Tooltip>
            }
            name="routeName"
            rules={[
              { required: true, message: "Route name is mandatory !" },
              { validator: checkValidation },
            ]}
          >
            <Input disabled={props.isUpdate} name="routeName" type="text" id="routeName" />
          </Form.Item>

          {/*<Form.Item
            label={
              <Tooltip title="True if the configuration is active.">
                Configuration status
              </Tooltip>
            }
            name="configurationStatus"
            rules={[
              {
                required: true,
                message: "Configuration status is mandatory !",
              },
            ]}
          >
            <Radio.Group>
              <Radio defaultChecked value={"Active"}>
                Active
              </Radio>
              <Radio value={"Inactive"}>Inactive</Radio>
            </Radio.Group>
          </Form.Item>*/}
          <Form.Item
            label={
              <Tooltip title="Choose Applicable if the Data Feed will be split.">
                Splitting requirement
              </Tooltip>
            }
            name="splittingRequirement"
            rules={[
              {
                required: true,
                message: "Splitting requirement is mandatory !",
              },
            ]}
          >
            <Radio.Group
              disabled={props.isUpdate}
              deafultValue={splittingRequirement}
              onChange={isSplitReq}
            >
              <Radio value={"No"}>Not applicable</Radio>
              <Radio value={"Yes"}>Applicable</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="Route type"
            name="routeType"
            rules={[{ required: true, message: "Route type is mandatory !" }]}
          >
            <Radio.Group
              disabled={props.isUpdate}
              value={routeType}
              defaultValue={routeType}
              onChange={(e) => onChangeRadio(e, "routeType")}
            >
              <Radio value={"Scheduled"}>Scheduled</Radio>
              <Radio value={"One-time"}>One-time</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label={
              <Tooltip title="Please discuss with Data Engineering team before setting this is set to True.">
                Asynchronous route
              </Tooltip>
            }
            name="asynchronousRoute"
          >
            <Radio.Group disabled={props.isUpdate}>
              <Radio value={"True"}>True</Radio>
              <Radio defaultChecked value={"False"}>
                False
              </Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label={
              <Tooltip title="Camel expression for writing to the storage location, for example: bean:s3Processor?method=process.">
                Destination expression
              </Tooltip>
            }
            name="destinationExpression"
            rules={[
              {
                required: true,
                message: "Destination Expression is mandatory !",
              },
              { validator: checkValidation },
            ]}
          >
            <Input
              disabled={props.isUpdate}
              name="destinationExpression"
              type="text"
              id="destinationExpression"
            />
          </Form.Item>
          <Form.Item
            label={<Tooltip>Checksum</Tooltip>}
            name="isChecksum"
            rules={[
              {
                required: true,
                message: "Checksum is mandatory !",
              },
            ]}
          >
            <Radio.Group disabled={props.isUpdate}>
              <Radio value={true}>True</Radio>
              <Radio defaultChecked value={false}>
                False
              </Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>
      <Divider plain></Divider>
      <Row gutter={[40, 0]}>
        <Col span={8}>
          <h3
            className="content-header"
            style={{ paddingBottom: "16px", fontWeight: "bold" }}
          >
            Proxy
          </h3>
        </Col>
      </Row>
      <Row gutter={[40, 0]}>
        <Col span={8}>
          <Form.Item
            label={
              <Tooltip title="Enable if the Data Feed required a proxy host and proxy port to be entered.">
                Proxy requirement
              </Tooltip>
            }
            name="proxyRequirement"
          >
            <Radio.Group disabled={props.isUpdate} defaultValue={proxyRequirement} onChange={isProxyReq}>
              <Radio value={"Yes"}>Yes</Radio>
              <Radio value={"No"}>No</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
        {proxyRequirement === "Yes" && (
          <Col span={8}>
            <Form.Item
              label={
                <Tooltip title="This is the proxy host / ip">
                  Proxy hostname
                </Tooltip>
              }
              name="proxyHostname"
              rules={[
                { required: true, message: "Proxy hostname is mandatory !" },
                {
                  //pattern: new RegExp(/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^((ftp|https):\/\/)?(www.|ftp.|sftp.)?(?!.*(ftp|http|https|www.))[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)?\/?$/),
                  pattern: new RegExp(
                    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^((ftp|https):\/\/)?(www.|ftp.|sftp.)?(?!.*(ftp|http|https|www.))[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)?\/?$/
                  ),
                  message: "Not a valid host name",
                },
              ]}
            >
              <TextArea
                disabled={props.isUpdate}
                name="proxyHostname"
                rows={3}
                showCount
                maxLength={1000}
              />
              {/*<Input name="proxyHostname" type="text" id="proxyHostname" />*/}
            </Form.Item>
          </Col>
        )}
        {proxyRequirement === "Yes" && (
          <Col span={8}>
            <Form.Item
              label="Proxy port"
              name="proxyPort"
              rules={[
                { required: true, message: "Proxy port is mandatory !" },
                {
                  pattern: new RegExp("^[0-9]+$"),
                  message: "Only numbers and positive numbers are allowed",
                },
              ]}
            >
              <Input disabled={props.isUpdate} name="proxyPort" type="text" id="proxyPort" />
            </Form.Item>
          </Col>
        )}
      </Row>

      <Divider plain></Divider>
      <Row gutter={[40, 0]}>
        <Col span={8}>
          <h3
            className="content-header"
            style={{ paddingBottom: "16px", fontWeight: "bold" }}
          >
            On-Demand Vendor request
          </h3>
        </Col>
      </Row>
      <Row gutter={[40, 0]}>
        <Col span={10}>
          <Form.Item
            label={
              <Tooltip title="Enable if the Data Feed required a On-Demand Vendor request configuration">
                On-Demand Vendor request configuration
              </Tooltip>
            }
            name="vendorRequestConfig"
          >
            <Radio.Group value={vendorRequestConfig} defaultValue={vendorRequestConfig} onChange={isVendorRequested}>
              <Radio value={"Y"}>Yes</Radio>
              <Radio value={"N"}>No</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>
      {/*<Divider plain></Divider>
      {<><Row gutter={[40, 0]}><Col span={8}><h3 className="content-header" style={{ paddingBottom: "16px", fontWeight: "bold" }}>Historic Load</h3></Col></Row>
      <Row gutter={[40, 0]} >
        <Col span={8} >
          <Form.Item
            label={<Tooltip title="Are there history files?">History load required</Tooltip>}
            name="histLoad"
          >
            <Radio.Group defaultValue={histLoad} onChange={isHistLoad}>
              <Radio disabled value={"Yes"}>Yes</Radio>
              <Radio value={"No"}>No</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
        {histLoad === "Yes" ?<><Col span={16} className="histsourcefolder">
          <Form.Item
            label="Source Folder"
            name="historySourceFolder"
          >
            <Input
              name="historySourceFolder"
              type="text"
              id="historySourceFolder"
            />
            </Form.Item>
          </Col>
         </>:''}
        </Row>

        {histLoad === "Yes" ?<Row gutter={[40, 0]}  >
        <Col span={8} className="historyId">
          <Form.Item
            label="History load details ID"
            name="historyLoadDetailsID"
          >
            <Input
              placeholder="Auto-generated by system"
              name="historyLoadDetailsID"
              type="text"
              disabled
              id="historyLoadDetailsID"
            />
            </Form.Item>
          </Col>
         
          
          <Col span={16} className="listFiles">
          <Form.Item
            name="listOfFiles"
            label={<Tooltip title="Please write down the list of historic filenames separated by a comma">List of files</Tooltip>}
          >
            <TextArea
              name="listOfFiles"
              rows={3}
              showCount
              maxLength={1000}
            />
          </Form.Item>
          </Col>
         
         
      </Row>:''}
      <Row gutter={[40, 0]}>
      <Col span={8} >
          {histLoad === "Yes" && <Form.Item
            name="historicLoadStartDate"
            label="Historic load start date"
            rules={[{ required: true, message: "Historic load start date is mandatory !" }]}
          >
            <DatePicker
              name="historicLoadStartDate"
              format="DD/MMM/YYYY"
              onChange={startDateSetup}
              
            />
             
          </Form.Item>}
          </Col>
      </Row>
            </>*/}
    </Form>
  );
};

export default memo(GeneralConfiguration);