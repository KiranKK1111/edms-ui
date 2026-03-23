import { useState, useEffect, createRef, memo } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Button,
  PageHeader,
  message,
  Alert,
  Layout,
  Row,
  Col,
  Space,
  Input,
  Radio,
  Divider,
  Table,
  Form,
  Upload,
  Modal,
  Spin,
  Empty,
} from "antd";
import { useSelector, useDispatch } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import moment from "moment";
import Headers from "../header/Header";
import Breadcrumb from "../../components/breadcrumb/Breadcrumb";
import {
  startSubmittingDocumentsOrUrl,
  startGetAllDocuments,
  startDownloadDocument,
  startDeleteDocument,
  getAllDocs,
  startGetDatafeeds,
} from "../../store/actions/datafeedAction";
import "./datafeed.css";
import "./addDocument.css";
import {
  HomeOutlined,
  DownOutlined,
  UploadOutlined,
  PaperClipOutlined,
  DeleteOutlined,
  LinkOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import TextArea from "antd/lib/input/TextArea";
import DocumentDeleteValidate from "../../components/Modals/DocumentDeleteValidate";
import { startGetDatasets } from "../../store/actions/DatasetPageActions";
import {
  MASTERDATA_MANAGEMENT_PAGE,
  ADD_DATASET_DOCUMENTATION_PAGE_AND_BUTTON,
  ADD_DATAFEED_DOCUMENTATION_PAGE_AND_BUTTON,
} from "../../utils/Constants";
import isButtonObject from "../../utils/accessButtonCheck";

const { Content } = Layout;
const { confirm } = Modal;

const location = window.location.pathname;

const AddEditDocuments = (props) => {
  const editObj = (props.location.state && props.location.state.editObj) || {};
  const reduxData = useSelector((state) => state.fileUpload);
  const reduxDataset = useSelector((state) => state.dataset.datasetsInfo);
  const reduxDatafeed =
    useSelector((state) => state.datafeedInfo.datafeedsData) || [];
  const { dsDfId, docObjectIds } = useParams();

  const history = useHistory();
  const dispatch = useDispatch();
  const path = props.location.pathname.includes("addDocuments");
  const [columns, setColumns] = useState([]);
  const [radioSelectType, setRadioSelectType] = useState("fileUpload");
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState(
    props.location.state && props.location.state.data
  );

  const [goToEdit, setGoToEdit] = useState(
    props.location.state && props.location.state.goToEdit
  );

  const [tabConfig, setTabConfig] = useState({
    tabOne: true,
    tabTwo: false,
  });

  const onChangeRadio = (e) => {
    setRadioSelectType(e.target.value);
  };
  const [docObj, setDocObj] = useState({});
  const formRef = createRef();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState();
  const [disabledSubmitBtn, setDisabledSubmitBtn] = useState(false);
  const [currentActionData, setCurrentActionData] = useState({});
  const [deleteModal, setDeleteModal] = useState(false);
  const [uploadOn, setUploadOn] = useState(false);
  const [editOn, setEditOn] = useState(false);
  const [showPdf, setShowPdf] = useState(false);
  const [showFileNew, setShowFileNew] = useState(false);

  const [fileObj, setFileObj] = useState();
  const addDatasetDocPagesAndButton = isButtonObject(
    MASTERDATA_MANAGEMENT_PAGE,
    ADD_DATASET_DOCUMENTATION_PAGE_AND_BUTTON
  );

  const addDatafeedDocPagesAndButton = isButtonObject(
    MASTERDATA_MANAGEMENT_PAGE,
    ADD_DATAFEED_DOCUMENTATION_PAGE_AND_BUTTON
  );

  const isButtonDisabled = dsDfId.includes("DS")
    ? addDatasetDocPagesAndButton
    : addDatafeedDocPagesAndButton;

  let editRecordData;
  if (docObjectIds) {
    editRecordData = editObj;
  }

  const {
    docTitle = "string",
    docDescription = "string",
    docDisplayFilename = "string",
  } = editObj || {
    docTitle: "",
    docDescription: "",
    docDisplayFilename: "",
  };
  const [valDocDescription, setValDocDescription] = useState(docDescription);
  const [valDocTitle, setValDocTitle] = useState(docTitle);

  const getDSName = () => {
    let dsName = "";
    let dfName = "";
    const editDataVal = editObj.docObjectId;
    const dfDsIds = editDataVal ? editDataVal : dsDfId;
    if (dfDsIds.includes("DS")) {
      const dsdfNameArr =
        reduxDataset &&
        reduxDataset.filter((item) => item.datasetId === dfDsIds);
      dsName =
        dsdfNameArr && dsdfNameArr.length > 0 ? dsdfNameArr[0].shortName : "";
    } else {
      const dsdfNameArr =
        reduxDatafeed &&
        reduxDatafeed.length > 0 &&
        reduxDatafeed.filter((item) => item.feedId === dfDsIds);
      dfName =
        dsdfNameArr && dsdfNameArr.length > 0 ? dsdfNameArr[0].shortName : "";
      const dsArr =
        dsdfNameArr &&
        dsdfNameArr.length > 0 &&
        reduxDataset &&
        reduxDatafeed.length > 0 &&
        reduxDataset.filter(
          (item) => item.datasetId === dsdfNameArr[0].datasetId
        );
      dsName = dsArr && dsArr.length > 0 ? dsArr[0].shortName : "";
    }
    return dsName;
  };

  const getDFName = () => {
    let dfName = "";
    const editDataVal = editRecordData && editRecordData.docObjectId;
    const dfDsIds = editDataVal ? editDataVal : dsDfId;

    const dsdfNameArr =
      reduxDatafeed &&
      reduxDatafeed.length > 0 &&
      reduxDatafeed.filter((item) => item.feedId === dfDsIds);
    dfName =
      dsdfNameArr && dsdfNameArr.length > 0 ? dsdfNameArr[0].shortName : "";
    return dfName;
  };

  const isDfSelected = editObj ? editObj && editObj.docObjectId : dsDfId;

  const dsName = getDSName();
  const dfName = isDfSelected && isDfSelected.includes("DS") ? "" : getDFName();

  const propsFile = {
    showUploadList: false,
    name: "file",
    maxCount: 1,
    accept: ".pptx,.docx,.pdf,.xslx,.csv ",
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
    }) { },
    onChange(info) { },
  };

  const DSbreadcrumb = [
    { name: "Entities", url: "/masterData" },
    {
      name: dsName,
      url: {
        pathname: goToEdit
          ? `/masterData/${data.shortName}/dataset`
          : `/masterData`,
      },
      state: {
        data: data,
      },
    },
    {
      name: "Documents",
    },
  ];
  const DFbreadcrumb = [
    { name: "Entities", url: "/masterData" },
    {
      name: dsName,
      url: {
        pathname: `/masterData`,
      },
    },
    {
      name: dfName,
      url: {
        pathname: `/masterData`,
      },
      // state: {
      //   //dataset: row,
      //   isView: false,
      //   //datafeedRecord: record,
      // },
      isView: false,
    },
    {
      name: "Documents",
    },
  ];

  const breadcrumb = dfName ? DFbreadcrumb : DSbreadcrumb;

  const cancelUpload = () => {
    setShowFileNew(false);
    setEditOn(false);
    form.resetFields();
    setUploadOn(false);
    setShowPdf(false);
    setRadioSelectType("fileUpload");
    history.push(`/masterData/${dsDfId}/addDocuments`);
  };

  const getDocuments = async (values) => {
    setLoading(true);
    const res = await dispatch(startGetAllDocuments());
    if (res) {
      if (docObjectIds) {
        const dsDfVal =
          res.documentList &&
          res.documentList.filter((item) => item.docDid === docObjectIds);
        const filteredFileListData =
          res.documentList &&
          res.documentList.filter(
            (item) => item.docObjectId === dsDfVal[0].docObjectId
          );
        setFileList(sortedActivities(filteredFileListData));
      }
      setLoading(false);
    }
  };

  const sortedActivities = (val) => {
    return val.sort(
      (a, b) => new Date(b.docUpdatedOn) - new Date(a.docUpdatedOn)
    );
  };

  //*FETCHING ALL Datasets/Datafeed if edit refresh for bedcrumb
  useEffect(() => {
    if (dsDfId) {
      if (dsDfId.includes("DS") && !dsName) {
        dispatch(startGetDatasets());
      }
      if (dsDfId.includes("DF") && !dfName) {
        dispatch(startGetDatasets());
        dispatch(startGetDatafeeds());
      }
    }
  }, []);

  useEffect(() => {
    const editDataVal = editRecordData && editRecordData.docObjectId;
    let listsOfFiles = reduxData.fileLists.documentList || [];
    const filteredFileListData = listsOfFiles.filter(
      (item) => item.docObjectId === dsDfId
    );
    setFileList(sortedActivities(filteredFileListData));
  }, [reduxData.fileLists.documentList]);

  const submitDocument = async (values) => {
    setLoading(true);
    const dsId = dsDfId;
    const payload = {};
    const userPsid = localStorage.getItem("psid") || 1588229;
    if (docObjectIds) {
      if (radioSelectType === "fileUpload") {
        payload.file = fileObj;
      } else {
        docObj.newUrl = values.docDisplayFilename;
      }
      docObj.docDid = editRecordData.docDid;
      docObj.docObjectType = editRecordData.docObjectType;
      docObj.docObjectId = editRecordData.docObjectId;
      docObj.docTitle = values.docTitle;
      docObj.docDescription = values.docDescription;
      docObj.docUpdatedBy = userPsid;
      docObj.docDisplayFilename = editRecordData.docDisplayFilename;
    } else {
      if (radioSelectType === "fileUpload") {
        payload.file = fileObj;
        docObj.docDisplayFilename = fileObj?.name;
      } else {
        docObj.docDisplayFilename = values.docDisplayFilename;
      }
      docObj.docTitle = values.docTitle;
      docObj.docDescription = values.docDescription;
      docObj.docObjectType = dsId.includes("DS") ? "dataset" : "datafeed";
      docObj.docObjectId = dsId;
      docObj.docCreatedBy = userPsid;
      docObj.docUpdatedBy = userPsid;
    }
    payload.docObj = docObj;
    let res;
    if (radioSelectType === "fileUpload" && fileObj.size > 100 * 1024 * 1024) {
      message.error(
        "File not uploaded due to: Max File size upload allowed is 100MB"
      );
    } else {
      res = await dispatch(
        startSubmittingDocumentsOrUrl(payload, docObjectIds)
      );
    }

    if (res && res.statusMessage) {
      form.resetFields();
      message.success(
        docObjectIds
          ? ` The File/Link has been successfully updated!`
          : ` The File/Link has been successfully uploaded!`
      );

      history.push(`/masterData/${dsDfId}/addDocuments`);
      getDocuments();
      setLoading(false);
      setRadioSelectType("fileUpload");
    } else if (res && res.message) {
      docObjectIds
        ? message.error("File/Link not updated due to: " + res.message)
        : message.error("File/Link not uploaded due to: " + res.message);
      setLoading(false);
    }
    setUploadOn(false);
    setLoading(false);
    setShowFileNew(false);
    setFileObj();
    //form.resetFields();
  };

  const copyHandler = (value) => {
    navigator.clipboard.writeText(value);
    message.success("Link value copied successfully!");
  };

  const handleDeleteFileUpload = () => {
    setUploadOn(false);
    setShowFileNew(false);
    setFileObj();
  };

  const handleDeleteFile = (record, type) => {
    if (type === "upload") {
      var data = {
        showFileNew: false,
        uploadOn: false,
        fileObj: {},
      };
      confirm({
        title: "Do you want to replace the item",
        icon: <CloseCircleOutlined style={{ color: "red" }} />,
        okType: "danger",
        content: "This file/link is already existing. Replace? ",
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

  const deleteDocuments = async (value1, value2) => {
    setLoading(true);
    const res = await dispatch(startDeleteDocument(value1, value2));

    if (res && res.statusMessage) {
      setLoading(false);

      getDocuments();
      const message1 = res.statusMessage.message;
      message.success(message1);
    } else {
      setLoading(false);
      message.error("Error while delete file/Link");
    }
    history.push(`/masterData/${value2}/addDocuments`);
  };

  const deleteMessage = (record) => {
    const messageDel = `The document <Tooltip style={{ color: "#1890ff" }} title=${record.docDisplayFilename.replaceAll(
      " ",
      ""
    )}><a> ${record.docTitle}
    </a></Tooltip>will be deleted. Please confirm if you want to proceed.`;
    return <p dangerouslySetInnerHTML={{ __html: messageDel }} />;
  };

  const handleDeleteDocuments = (record) => {
    confirm({
      icon: <CloseCircleOutlined style={{ color: "red" }} />,
      title: deleteMessage(record),
      okType: "danger",
      onOk() {
        const res = deleteDocuments(record.docDid, record.docObjectId);
        setShowFileNew(false);
        setEditOn(false);
        form.resetFields();
        setUploadOn(false);
        setShowPdf(false);
        setRadioSelectType("fileUpload");
      },
      onCancel() { },
    });
  };

  useEffect(() => {
    form.resetFields();
    setShowPdf(false);
    //If Access this page
    !isButtonDisabled && getDocuments();
    setUploadOn(false);
    setRadioSelectType("fileUpload");
  }, []);
  useEffect(() => {
    if (docObjectIds && editObj) {
      setShowPdf(true);
    } else {
      setShowPdf(false);
    }
    handleMapping();
  }, []);

  useEffect(() => {
    if (docObjectIds && editObj) {
      setShowPdf(true);
      setFileObj();
      setShowFileNew(false);
      setUploadOn(false);
    } else {
      setShowPdf(false);
    }
    handleMapping();
  }, [editObj]);

  useEffect(() => {
    handleMapping();
    if (editRecordData) {
      if (
        editRecordData.docDisplayFilename &&
        editRecordData.docDisplayFilename.includes("http")
      ) {
        setRadioSelectType("uploadUrl");
      } else {
        setRadioSelectType("fileUpload");
      }
    }
  }, [editRecordData]);

  const showDeleteModal = (record) => { };

  useEffect(() => {
    setUploadOn(fileObj ? true : false);
    setEditOn(!fileObj && docObjectIds ? true : false);
  }, [fileObj]);

  const checkUrlValidation = (rule, value) => {
    if (value === undefined) {
      return Promise.reject("");
    }
    var res = value.match(
      /(http(s)?:\/\/.)(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
    );

    if (res == null) return Promise.reject("Url Validation failed");
    else return Promise.resolve();
  };

  useEffect(() => {
    setColumns([
      {
        title: "Document name",
        dataIndex: "docTitle",
        ellipsis: false,
        width: "15%",
        sorter: (a, b) => a.docTitle.localeCompare(b.docTitle),
        render: (value, record) => {
          return <p style={{ fontWeight: "normal" }}>{record.docTitle}</p>;
        },
      },
      {
        title: "File name / URL",
        dataIndex: "docDisplayFilename",
        ellipsis: false,
        width: "30%",
        render: (text, record) => (
          <Space size="middle">
            {!record.docDisplayFilename.includes("http") && (
              <>
                <PaperClipOutlined />
                <Button
                  disabled={isButtonDisabled}
                  type="button"
                  className="link-button talign"
                  alt={text}
                  onClick={() => downloadFiles(record)}
                  style={{ marginLeft: "-12px" }}
                >
                  <strong>{record.docDisplayFilename}</strong>
                </Button>
              </>
            )}
            {record.docDisplayFilename.includes("http") && (
              <div style={{ display: "flex" }}>
                <Form.Item>
                  <div
                    style={{
                      display: "flex",
                      verticalAlign: "middle",
                      wordBreak: "break-all",
                    }}
                  >
                    <LinkOutlined /> &nbsp;
                    <div>
                      <Link
                        to={{ pathname: record.docDisplayFilename }}
                        target="_blank"
                      >
                        <strong>{record.docDisplayFilename}</strong>
                      </Link>
                    </div>
                  </div>
                </Form.Item>
              </div>
            )}
          </Space>
        ),
      },
      {
        title: "Description",
        dataIndex: "docDescription",
        width: "35%",
        ellipsis: false,
        render: (value, record) => {
          return (
            <p style={{ fontWeight: "normal" }}>{record.docDescription}</p>
          );
        },
      },
      {
        title: (
          <>
            <div>Created on</div> Updated on
          </>
        ),
        dataIndex: "docCreatedOn",
        ellipsis: false,
        width: "10%",
        render: (value, record) => {
          return (
            <>
              <div style={{ fontWeight: "normal" }}>
                {moment(record.docCreatedOn).format("DD MMM YYYY")}
              </div>
              <div style={{ fontWeight: "normal" }}>
                {moment(record.docUpdatedOn).format("DD MMM YYYY")}
              </div>
            </>
          );
        },
      },

      {
        title: "Actions",
        dataIndex: "createdOn",
        width: "10%",
        render: (value, record) => {
          return (
            <div style={{ fontWeight: "normal" }}>
              <Link
                className="link-button talign"
                disabled={isButtonDisabled}
                to={{
                  pathname: `/masterData/${record.docObjectId}/editDocuments/${record.docDid}`,
                  state: {
                    editObj: record,
                  },
                }}
                onClick={() => setShowPdf(true)}
              >
                <strong>Edit</strong>
              </Link>

              <Button
                disabled={isButtonDisabled}
                style={{ marginLeft: 20 }}
                type="link"
                className="link-button talign"
                onClick={() => handleDeleteDocuments(record)}
              >
                <strong>Delete</strong>
              </Button>
            </div>
          );
        },
      },
    ]);
  }, []);

  const handleFile = (e) => {
    setFileObj(e.target.files[0]);
    setShowFileNew(true);
    setUploadOn(true);
  };

  const downloadFiles = async (record) => {
    setLoading(true);

    const res = await dispatch(
      startDownloadDocument(record.docDisplayFilename, record.docDid)
    );
    setTimeout(() => { }, 8000);
    if (res && res.includes("Successfully")) {
      setLoading(false);
      message.success(res);
    } else {
      setLoading(false);
      message.error(res);
    }
  };

  const handleMapping = () => {
    if (docObjectIds && formRef.current) {
      if (editRecordData) {
        const { docTitle, docObjectType, docDescription, docDisplayFilename } =
          editRecordData;
        formRef.current.setFieldsValue({
          fileObj,
          docTitle,
          radioSelectType,
          docDescription,
          docDisplayFilename: docDisplayFilename,
          docObjectType,
        });
      }
    }
  };

  const getVal = (val) => {
    const retVal =
      val && val.includes("http")
        ? val.split("//")[1].replaceAll(`\"`, ``)
        : val;
    return retVal;
  };

  return (
    <div id="main">
      <Headers />
      {loading ? (
        <Col
          span={24}
          style={{
            textAlign: "center",
            background: "#f0f2f5",
            paddingTop: "8%",
          }}
        >
          <Spin tip="Loading..." />
        </Col>
      ) : (
        <Layout style={{ width: "99%" }}>
          <Content>
            <div className="rectangleone">
              <div
                style={{
                  display: "flex",
                  marginBottom: "2px",
                  justifyContent: "space-between",
                  marginTop: 16,
                }}
              >
                <Breadcrumb breadcrumb={breadcrumb} />
              </div>

              <div style={{ marginTop: 16 }}>
                <PageHeader
                  title="Documents"
                  ghost={false}
                  onBack={() =>
                    props.history.push(
                      goToEdit
                        ? `/masterData/${data.shortName}/dataset`
                        : `/masterData`
                    )
                  }
                  className="pt-20 pb-0  home-page"
                ></PageHeader>
              </div>
              {props.location.state &&
                props.location.state.record &&
                props.location.state.record.licenseStatus.toLowerCase() ===
                "pending" ? (
                <div style={{ marginTop: "40px" }}>
                  <Alert
                    message="This Licence is currently under review. You will be able to add Datasets once the Licence is approved and the status is “Active” or “Planned”."
                    type="warning"
                    showIcon
                  />
                </div>
              ) : null}
              <div
                style={{
                  marginTop:
                    props.location.state &&
                      props.location.state.record &&
                      props.location.state.record.licenseStatus.toLowerCase() ===
                      "pending"
                      ? "10px"
                      : "50px",
                }}
              ></div>
              <Form form={form} ref={formRef} onFinish={submitDocument}>
                <Row style={{ backgroundColor: "white" }}>
                  <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <div
                      style={{
                        width: "100%",
                        marginTop: 30,
                        marginLeft: 30,
                        marginBottom: 15,
                      }}
                    >
                      <DownOutlined /> &nbsp; &nbsp; &nbsp;
                      <strong>Document details</strong>
                    </div>
                  </Col>
                  <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                    <Form.Item
                      name="docTitle"
                      label="Name"
                      initialValue={undefined}
                      value={valDocTitle}
                      style={{ width: "80%", marginLeft: 58 }}
                      rules={[
                        {
                          required: true,
                          message: "Please Enter Title",
                        },
                      ]}
                      className="err-adjust"
                    >
                      <Input
                        style={{ marginLeft: 50 }}
                        disabled={showPdf || isButtonDisabled}
                      />
                    </Form.Item>
                    <Form.Item
                      name="docDescription"
                      label="Description"
                      style={{ width: "87%", marginLeft: 58 }}
                      rules={[
                        {
                          required: true,
                          message: "Please add Description",
                        },
                      ]}
                    >
                      <TextArea
                        disabled={showPdf || isButtonDisabled}
                        style={{ minHeight: 109 }}
                        showCount
                        maxLength={1000}
                        value={valDocDescription}
                      />
                    </Form.Item>
                    &nbsp; &nbsp;
                    <Col xs={24} sm={24} md={24} lg={12} xl={12}></Col>
                  </Col>
                  <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                    <div
                      style={{
                        border: "3px solid #F9F8F8",
                        width: "97%",
                      }}
                    >
                      <Form.Item name="radioSelectType">
                        <p hidden>{radioSelectType}</p>
                        <Radio.Group
                          disabled={docObjectIds || isButtonDisabled}
                          onChange={onChangeRadio}
                          defaultValue="fileUpload"
                          value={radioSelectType}
                          style={{
                            width: "100%",
                            marginLeft: 20,
                            marginTop: 10,
                            height: 20,
                          }}
                        >
                          <Radio value="fileUpload" defaultChecked>
                            Add file
                          </Radio>
                          <Radio value="uploadUrl">Add URL</Radio>
                        </Radio.Group>
                      </Form.Item>
                      <Divider />
                      {radioSelectType === "fileUpload" ? (
                        <div>
                          <div>
                            {" "}
                            <div
                              style={{
                                display: "flex",
                                height: 30,
                                marginLeft: 30,
                              }}
                            >
                              <Form.Item
                                name="file"
                                type="file"
                                id="fileInput"
                                onChange={handleFile}
                                rules={[
                                  {
                                    required: true,
                                    message: "Please Upload a valid file",
                                  },
                                ]}
                                className="err1-adjust"
                              >
                                <Space
                                  direction="vertical"
                                  style={{
                                    width: "100%",
                                  }}
                                  size="large"
                                >
                                  <Upload {...propsFile} maxCount={1}>
                                    <Button
                                      disabled={
                                        showPdf ||
                                        uploadOn ||
                                        showFileNew ||
                                        isButtonDisabled
                                      }
                                      icon={<UploadOutlined />}
                                    >
                                      Click to Upload
                                    </Button>
                                  </Upload>
                                </Space>
                              </Form.Item>{" "}
                              {showFileNew &&
                                radioSelectType === "fileUpload" && (
                                  <Button
                                    disabled={isButtonDisabled}
                                    type="button"
                                    className="link-button talign"
                                    alt={fileObj.name}
                                    style={{ marginLeft: 30 }}
                                    onClick={() =>
                                      handleDeleteFile(fileObj, "upload")
                                    }
                                  >
                                    <strong>
                                      &nbsp;&nbsp; &nbsp;&nbsp;{" "}
                                      <PaperClipOutlined /> &nbsp;
                                      {fileObj.name}&nbsp;&nbsp;
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
                              {showPdf && radioSelectType === "fileUpload" && (
                                <Button
                                  disabled={isButtonDisabled}
                                  type="button"
                                  className="link-button talign"
                                  alt={docDisplayFilename}
                                  style={{ marginLeft: 30 }}
                                  onClick={() =>
                                    handleDeleteFile(editRecordData[0])
                                  }
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
                              )}
                            </div>
                            <div
                              style={{
                                //textAlign: "left",
                                marginTop: "auto",
                                marginLeft: 0,
                              }}
                            >
                              <div
                                style={{
                                  marginLeft: 30,
                                  fontSize: "12px",
                                  fontWeight: "bold",
                                  input: "read-only",
                                  color: "#ccc",
                                  paddingTop: "5px",
                                }}
                              >
                                Max file size : 100MB
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div
                            style={{ marginLeft: 30, height: 50 }}
                            className="link-input"
                          >
                            <Row gutter={[78, 0]} className="pt-head">
                              {showPdf && (
                                <Button
                                  type="button"
                                  className="link-button talign"
                                  //disabled={showPdf}
                                  alt={docDisplayFilename}
                                  style={{
                                    height: "auto",
                                    "white-space": "pre-wrap",
                                  }}
                                  onClick={() =>
                                    handleDeleteFile(editRecordData)
                                  }
                                >
                                  <strong>
                                    &nbsp;&nbsp; &nbsp;&nbsp; <LinkOutlined />{" "}
                                    &nbsp;
                                    <div
                                      style={{
                                        maxWidth: "450px",
                                        overflow: "hidden",
                                        display: "inline-block",
                                        verticalAlign: "top",
                                        "word-break": "break-all",
                                      }}
                                    >
                                      {docDisplayFilename}
                                    </div>
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
                              {!showPdf && (
                                <Col span={24}>
                                  <Form.Item
                                    name="docDisplayFilename"
                                    rules={[
                                      {
                                        required: true,
                                        message: "Please add a valid url",
                                      },
                                      { validator: checkUrlValidation },
                                    ]}
                                  >
                                    <Input
                                      prefix={<LinkOutlined />}
                                      placeholder="Add URL"
                                      name="docDisplayFilename"
                                      value={docDisplayFilename}
                                      type="text"
                                      style={{
                                        width: "95%",
                                      }}
                                    />
                                  </Form.Item>
                                </Col>
                              )}
                            </Row>
                          </div>
                        </div>
                      )}
                      {radioSelectType === "urlUpload" && (
                        <Button
                          type="button"
                          className="link-button talign"
                          alt={docDisplayFilename}
                          style={{
                            marginLeft: 30,
                          }}
                          onClick={() => handleDeleteFile(editRecordData)}
                        >
                          &nbsp;&nbsp; &nbsp;&nbsp; <LinkOutlined /> &nbsp;
                          {docDisplayFilename}
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
                        </Button>
                      )}
                      &nbsp; &nbsp;&nbsp; &nbsp;
                    </div>
                  </Col>
                  <Col
                    span={24}
                    style={{
                      display: "flex",
                      justifyContent: "right",
                      paddingRight: 20,
                      marginTop: 0,
                      paddingBottom: 20,
                    }}
                  >
                    <Button
                      type="ghost"
                      disabled={isButtonDisabled}
                      onClick={cancelUpload}
                    //disabled={docObjectIds}
                    >
                      Cancel
                    </Button>{" "}
                    &nbsp;
                    <Button
                      disabled={showPdf || isButtonDisabled}
                      type="primary"
                      htmlType="submit"
                    // disabled={docObjectIds}
                    >
                      Add
                    </Button>
                  </Col>
                </Row>
              </Form>
              <div
                style={{
                  backgroundColor: "white",
                  marginTop: 10,
                  minHeight: 300,
                }}
              >
                <Table
                  locale={{
                    emptyText: (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="No Documents / Link Uploaded"
                      />
                    ),
                  }}
                  size="small"
                  // rowKey={(record) => record.taskListId}
                  style={{ padding: 24 }}
                  columns={columns}
                  dataSource={fileList}
                  pagination={{
                    pageSize: 5,
                    hideOnSinglePage: true,
                    defaultCurrent: 1,
                  }}
                />
              </div>
            </div>
          </Content>
        </Layout>
      )}
      <DocumentDeleteValidate
        deleteModal={deleteModal}
        setDeleteModal={setDeleteModal}
        // editReplaceModal={editReplaceModal}
        currentActionData={currentActionData}
        // getStatus={null}
        getDocuments={getDocuments}
        setDisabledSubmitBtn={setDisabledSubmitBtn}
        disabledSubmitBtn={disabledSubmitBtn}
      // refreshPage={refreshPage}
      // data={data}
      // setData={setData}
      />
    </div>
  );
};

export default memo(AddEditDocuments);