import { useState, useEffect, createRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { API_ADD_FILE_URL, FILE_BASE_ENDPOINT } from "../../utils/Config";
import {
  Button,
  Card,
  Divider,
  Input,
  List,
  Layout,
  Menu,
  Space,
  Form,
  Table,
  message,
  Spin,
  Col,
} from "antd";
import { fetchUrlsInfo } from "../../store/actions/DatasetPageActions";
import {
  SearchOutlined,
  PaperClipOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import moment from "moment";
import {
  startGetAllDocuments,
  startDownloadDocument,
} from "../../store/actions/datafeedAction";
import TextArea from "antd/lib/input/TextArea";

const { SubMenu } = Menu;
const { Content, Sider } = Layout;

const dataDummy = [{}];

const DocumentationTab = (props) => {
  const [taskStatus, setTaskStatus] = useState("pending");
  const [copy, setCopy] = useState({
    apiAddress: "Copy",
  });
  const { data } = useSelector((state) => state.dataset.subscriptionInfo);
  const license = useSelector((state) => state.license);
  const doc = (license && license.data.technicalDocument) || [];
  const documents = doc.length > 0 ? doc.split(",") : [];
  const dispatch = useDispatch();
  const ref = createRef();
  const [columns, setColumns] = useState([]);
  const reduxData = useSelector((state) => state.fileUpload);
  const [fileLists, setFileLists] = useState([]);
  const [loading, setLoading] = useState(false);

  const getDocuments = async (values) => {
    const res = await dispatch(startGetAllDocuments());
  };
  const catalogueObj = props.catalogueObj;

  useEffect(() => {
    let listsOfFiles = reduxData.fileLists.documentList || [];
    const filteredFileListData = listsOfFiles.filter(
      (item) =>
        item.docObjectId === catalogueObj.datasetId ||
        item.docObjectId === catalogueObj.dataFeedId
    );
    setFileLists(sortedActivities(filteredFileListData));
  }, [reduxData.fileLists]);

  useEffect(() => {
    getDocuments();
  }, []);

  const downloadFiles = async (record) => {
    console.log(record);
    setLoading(true);
    const res = await dispatch(
      startDownloadDocument(record.docDisplayFilename, record.docDid)
    );
    setTimeout(() => {}, 8000);
    if (res && res.includes("Successfully")) {
      message.success(res);
    } else {
      message.error(res);
    }
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);

    const res = async () => {
      const keys = Object.keys(data);
      let tStatus = data.taskStatus && data.taskStatus.toLowerCase();
      setTaskStatus(tStatus);
      if (keys.length > 0 && taskStatus === "approved") {
        const res1 = await dispatch(fetchUrlsInfo(data.subscriptionId));
        if (!res1.message && ref.current) {
          ref.current.setFieldsValue({
            apiAddress: res1.data[0].apiUrl,
          });
        }
      }
      setLoading(false);
    };
    res();
  }, [dispatch, data, taskStatus, ref]);

  const getVal = (val) => {
    const retVal = val.includes("http")
      ? val.split("//")[1].replaceAll(`\"`, ``)
      : val;
    return retVal;
  };

  const sortedActivities = (val) => {
    return val.sort(
      (a, b) => new Date(b.docUpdatedOn) - new Date(a.docUpdatedOn)
    );
  };

  const copyHandler = (value) => {
    navigator.clipboard.writeText(value);
    message.success("Link value copied successfully!");
  };
  useEffect(() => {
    setColumns([
      {
        title: "Object",
        dataIndex: "docObjectType",
        ellipsis: false,
        width: "10%",
        sorter: (a, b) => a.docObjectType.localeCompare(b.docObjectType),
        render: (value, record) => {
          return <p style={{ fontWeight: "normal" }}>{record.docObjectType}</p>;
        },
      },
      /* {
        title: "Title",
        dataIndex: "docTitle",
        width: "20%",
        sorter: (a, b) => a.docTitle.localeCompare(b.docTitle),
        ellipsis: true,
        render: (value, record) => {
          return <p style={{ fontWeight: "normal" }}>{record.docTitle}</p>;
        },
      },*/
      {
        title: "Document name",
        dataIndex: "docDisplayFilename",
        width: "30%",
        ellipsis: false,
        sorter: (a, b) =>
          a.docDisplayFilename.localeCompare(b.docDisplayFilename),
        render: (text, record) => (
          <Space size="middle">
            {!record.docDisplayFilename.includes("http") && (
              <>
                <PaperClipOutlined />
                <Button
                  type="button"
                  className="link-button talign"
                  alt={text}
                  onClick={() => downloadFiles(record)}
                  style={{ marginLeft: "-12px" }}
                >
                  <strong>{record.docTitle}</strong>
                </Button>
              </>
            )}
            {record.docDisplayFilename.includes("http") && (
              <div style={{ display: "flex" }}>
                <Form.Item>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      verticalAlign: "middle",
                      wordBreak: "break-all",
                    }}
                  >
                    <LinkOutlined />
                    &nbsp;
                    <div>
                      <Link to={{ pathname: text }} target="_blank">
                        {record.docTitle}
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
        width: "50%",

        //sorter: (a, b) => a.docDescription.localeCompare(b.docDescription),
        ellipsis: false,
        render: (value, record) => {
          return (
            <p style={{ fontWeight: "normal" }}>{record.docDescription}</p>
          );
        },
      },
      {
        title: "Updated on",
        dataIndex: "docUpdatedOn",
        width: "10%",
        align: "right",
        textAlign: "left",
        render: (value, record) => {
          return (
            <>
              <p style={{ fontWeight: "normal" }}>
                {moment(record.docUpdatedOn).format("DD MMM YYYY")}
              </p>
            </>
          );
        },
      },
    ]);
  }, []);

  return (
    <div id="main">
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
        <Card
          title={
            <h3
              className="content-header"
              style={{ fontWeight: "bold", paddingTop: "10px" }}
            >
              Documentation
            </h3>
          }
        >
          <Table
            size="small"
            style={{ padding: 24 }}
            columns={columns}
            dataSource={fileLists}
            pagination={{
              pageSize: 5,
              hideOnSinglePage: true,
              defaultCurrent: 1,
            }}
          />
        </Card>
      )}
    </div>
  );
};
export default DocumentationTab;