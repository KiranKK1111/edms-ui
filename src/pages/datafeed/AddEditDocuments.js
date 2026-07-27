import { useState, useEffect, memo } from "react";
import { useLocation, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  InputAdornment,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";
import { PageHeader, FormField, EmptyState } from "../../design-system";
import { toast as message } from "../../design-system/toast";
import imperativeConfirm from "../../design-system/imperativeConfirm";
import { useSelector, useDispatch } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import dayjs from "../../design-system/dayjs";
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
  KeyboardArrowDown as DownOutlined,
  UploadFile as UploadOutlined,
  AttachFile as PaperClipOutlined,
  Delete as DeleteOutlined,
  Link as LinkOutlined,
} from "@mui/icons-material";
import DocumentDeleteValidate from "../../components/Modals/DocumentDeleteValidate";
import { startGetDatasets } from "../../store/actions/DatasetPageActions";
import {
  MASTERDATA_MANAGEMENT_PAGE,
  ADD_DATASET_DOCUMENTATION_PAGE_AND_BUTTON,
  ADD_DATAFEED_DOCUMENTATION_PAGE_AND_BUTTON,
} from "../../utils/Constants";
import isButtonObject from "../../utils/accessButtonCheck";

const location = window.location.pathname;

const deleteIconStyle = {
  border: "1px solid var(--color-error)",
  color: "var(--color-error)",
  width: 20,
  height: 20,
  margin: 0,
};

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
  const [page, setPage] = useState(0);

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
  const { control, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      docTitle: "",
      docDescription: "",
      docDisplayFilename: "",
    },
    mode: "onChange",
  });
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
    reset();
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
      reset();
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
    //reset();
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
      imperativeConfirm({
        title: "Do you want to replace the item",
        content: "This file/link is already existing. Replace? ",
        okColor: "error",
      }).then((ok) => {
        if (ok) {
          handleDeleteFileUpload(data);
        } else {
          //setShowPdf(true);
          setUploadOn(true);
          setShowFileNew(true);
        }
      });
    } else {
      imperativeConfirm({
        title: "Do you want to replace the item",
        content: "This file/link is already existing. Replace? ",
        okColor: "error",
      }).then((ok) => {
        if (ok) {
          setShowPdf(false);
          setUploadOn(false);
        } else {
          setShowPdf(true);
          setUploadOn(false);
        }
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
    imperativeConfirm({
      title: "Delete document",
      content: deleteMessage(record),
      okColor: "error",
    }).then((ok) => {
      if (ok) {
        const res = deleteDocuments(record.docDid, record.docObjectId);
        setShowFileNew(false);
        setEditOn(false);
        reset();
        setUploadOn(false);
        setShowPdf(false);
        setRadioSelectType("fileUpload");
      }
    });
  };

  useEffect(() => {
    reset();
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

  const showDeleteModal = (record) => {};

  useEffect(() => {
    setUploadOn(fileObj ? true : false);
    setEditOn(!fileObj && docObjectIds ? true : false);
  }, [fileObj]);

  const checkUrlValidation = (value) => {
    if (value === undefined) {
      return "Please add a valid url";
    }
    var res = value.match(
      /(http(s)?:\/\/.)(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
    );

    if (res == null) return "Url Validation failed";
    else return true;
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
          <Stack direction="row" spacing={2} alignItems="center">
            {!record.docDisplayFilename.includes("http") && (
              <>
                <PaperClipOutlined />
                <Button
                  disabled={isButtonDisabled}
                  variant="text"
                  className="link-button talign"
                  onClick={() => downloadFiles(record)}
                  style={{ marginLeft: "-12px" }}
                >
                  <strong>{record.docDisplayFilename}</strong>
                </Button>
              </>
            )}
            {record.docDisplayFilename.includes("http") && (
              <div style={{ display: "flex" }}>
                <Box>
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
                </Box>
              </div>
            )}
          </Stack>
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
                {dayjs(record.docCreatedOn).format("DD MMM YYYY")}
              </div>
              <div style={{ fontWeight: "normal" }}>
                {dayjs(record.docUpdatedOn).format("DD MMM YYYY")}
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
                variant="text"
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
    const file = e.target.files[0];
    if (file && file.size > 100 * 1024 * 1024) {
      message.error(
        "File not uploaded due to: Max File size upload allowed is 100MB"
      );
    }
    setFileObj(e.target.files[0]);
    setShowFileNew(true);
    setUploadOn(true);
  };

  const downloadFiles = async (record) => {
    setLoading(true);

    const res = await dispatch(
      startDownloadDocument(record.docDisplayFilename, record.docDid)
    );
    setTimeout(() => {}, 8000);
    if (res && res.includes("Successfully")) {
      setLoading(false);
      message.success(res);
    } else {
      setLoading(false);
      message.error(res);
    }
  };

  const handleMapping = () => {
    if (docObjectIds) {
      if (editRecordData) {
        const { docTitle, docDescription, docDisplayFilename } = editRecordData;
        setValue("docTitle", docTitle);
        setValue("docDescription", docDescription);
        setValue("docDisplayFilename", docDisplayFilename);
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

  const rows = fileList || [];
  const rowsPerPage = 5;
  const pagedRows = rows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <div id="main">
      {loading ? (
        <Box
          sx={{
            textAlign: "center",
            background: "var(--color-bg-layout)",
            paddingTop: "8%",
          }}
        >
          <CircularProgress size={40} />
        </Box>
      ) : (
        <Box sx={{ width: "99%" }}>
          <Box>
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
                  <Alert severity="warning">
                    This Licence is currently under review. You will be able to
                    add Datasets once the Licence is approved and the status is
                    “Active” or “Planned”.
                  </Alert>
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
              <Box component="form" onSubmit={handleSubmit(submitDocument)}>
                <Grid container sx={{ backgroundColor: "var(--color-bg)" }}>
                  <Grid size={12}>
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
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ width: "80%", ml: "58px", mb: 2 }}>
                      <FormField
                        name="docTitle"
                        label="Name"
                        control={control}
                        required="Please Enter Title"
                        disabled={showPdf || isButtonDisabled}
                      />
                    </Box>
                    <Box sx={{ width: "87%", ml: "58px" }}>
                      <FormField
                        name="docDescription"
                        label="Description"
                        type="textarea"
                        rows={4}
                        control={control}
                        required="Please add Description"
                        disabled={showPdf || isButtonDisabled}
                        inputProps={{ maxLength: 1000 }}
                      />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <div
                      style={{
                        border: "3px solid var(--color-border-secondary)",
                        width: "97%",
                      }}
                    >
                      <Box sx={{ ml: 2.5, mt: 1.25 }}>
                        <RadioGroup
                          row
                          value={radioSelectType}
                          onChange={onChangeRadio}
                        >
                          <FormControlLabel
                            value="fileUpload"
                            control={<Radio />}
                            label="Add file"
                            disabled={!!docObjectIds || isButtonDisabled}
                          />
                          <FormControlLabel
                            value="uploadUrl"
                            control={<Radio />}
                            label="Add URL"
                            disabled={!!docObjectIds || isButtonDisabled}
                          />
                        </RadioGroup>
                      </Box>
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
                              <Button
                                variant="outlined"
                                component="label"
                                disabled={
                                  showPdf ||
                                  uploadOn ||
                                  showFileNew ||
                                  isButtonDisabled
                                }
                                startIcon={<UploadOutlined />}
                              >
                                Click to Upload
                                <input
                                  type="file"
                                  hidden
                                  accept=".pptx,.docx,.pdf,.xslx,.csv "
                                  onChange={handleFile}
                                />
                              </Button>{" "}
                              {showFileNew &&
                                radioSelectType === "fileUpload" && (
                                  <Button
                                    disabled={isButtonDisabled}
                                    variant="text"
                                    className="link-button talign"
                                    style={{ marginLeft: 30 }}
                                    onClick={() =>
                                      handleDeleteFile(fileObj, "upload")
                                    }
                                  >
                                    <strong>
                                      &nbsp;&nbsp; &nbsp;&nbsp;{" "}
                                      <PaperClipOutlined /> &nbsp;
                                      {fileObj.name}&nbsp;&nbsp;
                                      <DeleteOutlined style={deleteIconStyle} />
                                    </strong>
                                  </Button>
                                )}
                              {showPdf && radioSelectType === "fileUpload" && (
                                <Button
                                  disabled={isButtonDisabled}
                                  variant="text"
                                  className="link-button talign"
                                  style={{ marginLeft: 30 }}
                                  onClick={() =>
                                    handleDeleteFile(editRecordData[0])
                                  }
                                >
                                  <strong>
                                    &nbsp;&nbsp; &nbsp;&nbsp;{" "}
                                    <PaperClipOutlined /> &nbsp;
                                    {docDisplayFilename}&nbsp;&nbsp;
                                    <DeleteOutlined style={deleteIconStyle} />
                                  </strong>
                                </Button>
                              )}
                            </div>
                            <div
                              style={{
                                marginTop: "auto",
                                marginLeft: 0,
                              }}
                            >
                              <div
                                style={{
                                  marginLeft: 30,
                                  fontSize: "12px",
                                  fontWeight: "bold",
                                  color: "var(--color-text-quaternary)",
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
                            <Grid container className="pt-head">
                              {showPdf && (
                                <Button
                                  variant="text"
                                  className="link-button talign"
                                  style={{
                                    height: "auto",
                                    whiteSpace: "pre-wrap",
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
                                        wordBreak: "break-all",
                                      }}
                                    >
                                      {docDisplayFilename}
                                    </div>
                                    &nbsp;&nbsp;
                                    <DeleteOutlined style={deleteIconStyle} />
                                  </strong>
                                </Button>
                              )}
                              {!showPdf && (
                                <Grid size={12}>
                                  <FormField
                                    name="docDisplayFilename"
                                    control={control}
                                    placeholder="Add URL"
                                    required="Please add a valid url"
                                    rules={{ validate: checkUrlValidation }}
                                    startAdornment={
                                      <InputAdornment position="start">
                                        <LinkOutlined />
                                      </InputAdornment>
                                    }
                                    sx={{ width: "95%" }}
                                  />
                                </Grid>
                              )}
                            </Grid>
                          </div>
                        </div>
                      )}
                      {radioSelectType === "urlUpload" && (
                        <Button
                          variant="text"
                          className="link-button talign"
                          style={{
                            marginLeft: 30,
                          }}
                          onClick={() => handleDeleteFile(editRecordData)}
                        >
                          &nbsp;&nbsp; &nbsp;&nbsp; <LinkOutlined /> &nbsp;
                          {docDisplayFilename}
                          &nbsp;&nbsp;
                          <DeleteOutlined style={deleteIconStyle} />
                        </Button>
                      )}
                      &nbsp; &nbsp;&nbsp; &nbsp;
                    </div>
                  </Grid>
                  <Grid
                    size={12}
                    sx={{
                      display: "flex",
                      justifyContent: "right",
                      paddingRight: "20px",
                      marginTop: 0,
                      paddingBottom: "20px",
                    }}
                  >
                    <Button
                      variant="outlined"
                      disabled={isButtonDisabled}
                      onClick={cancelUpload}
                    >
                      Cancel
                    </Button>{" "}
                    &nbsp;
                    <Button
                      disabled={showPdf || isButtonDisabled}
                      variant="contained"
                      type="submit"
                    >
                      Add
                    </Button>
                  </Grid>
                </Grid>
              </Box>
              <div
                style={{
                  backgroundColor: "var(--color-bg)",
                  marginTop: 10,
                  minHeight: 300,
                }}
              >
                <TableContainer component={Paper} sx={{ padding: 3 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        {columns.map((col) => (
                          <TableCell
                            key={col.key || col.dataIndex || col.title}
                            sx={{ width: col.width }}
                          >
                            {col.title}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={columns.length}>
                            <EmptyState
                              title=""
                              description="No Documents / Link Uploaded"
                            />
                          </TableCell>
                        </TableRow>
                      ) : (
                        pagedRows.map((row, index) => (
                          <TableRow key={row.docDid || index}>
                            {columns.map((col) => (
                              <TableCell
                                key={col.key || col.dataIndex || col.title}
                              >
                                {col.render
                                  ? col.render(row[col.dataIndex], row)
                                  : row[col.dataIndex]}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                  {rows.length > rowsPerPage && (
                    <TablePagination
                      component="div"
                      count={rows.length}
                      page={page}
                      onPageChange={(e, p) => setPage(p)}
                      rowsPerPage={rowsPerPage}
                      rowsPerPageOptions={[rowsPerPage]}
                    />
                  )}
                </TableContainer>
              </div>
            </div>
          </Box>
        </Box>
      )}
      <DocumentDeleteValidate
        deleteModal={deleteModal}
        setDeleteModal={setDeleteModal}
        currentActionData={currentActionData}
        getDocuments={getDocuments}
        setDisabledSubmitBtn={setDisabledSubmitBtn}
        disabledSubmitBtn={disabledSubmitBtn}
      />
    </div>
  );
};

export default memo(AddEditDocuments);
