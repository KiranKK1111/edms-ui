//______________Lib imports begin_____________
import {
  Col,
  Form,
  Input,
  Layout,
  PageHeader,
  Radio,
  Row,
  Space,
  Table,
  Tag,
  Tooltip,
  Breadcrumb,
  message,
  Spin,
  Badge,
  Button,
} from "antd";
/*________________antD library imports begin*/
import {
  HomeOutlined,
  MessageOutlined,
  MessageFilled,
  MessageTwoTone,
  InfoCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import "antd/dist/antd.css";
import React, { createRef, useEffect, useState, memo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import moment from "moment";
import { camelText } from "../../components/stringConversion";
import RequestModal from "../../components/myTasks/RequestModal";
import {
  getAllTasks,
  getOverViewRecordsList,
  updateTaskAction,
} from "../../store/actions/MyTasksActions.js";
//______________ component imports begin_________
import Headers from "../header/Header";
//________________css imports*/
import "./MyTasksDashboard.css";
import ApproveRejectModal from "../../components/Modals/ApproveRejectModal";
import { startGetDatafeeds } from "../../store/actions/datafeedAction";
import {
  MY_TASK_PAGE,
  APPROVE_REJECT_BTN,
  APPROVE_REJECT_BTN_SUBS,
  APPROVE_REJECT_BTN_REMAINING,
  DATASET_OWNER,
} from "../../utils/Constants";
import { checkForString } from "../../utils/warningUtils.js";

const MyTasksDashboardNew = (props) => {
  const { Content } = Layout;

  const [taskListStatus, setTaskListStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [countObj, setCountObj] = useState({});
  const [disabledSubmitBtn, setDisabledSubmitBtn] = useState(false);
  const [approveModal, setApproveModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [columns, setColumns] = useState([]);
  const [currentActionData, setCurrentActionData] = useState({});

  const [data, setData] = useState([]);
  const dispatch = useDispatch();
  const list = useSelector((state) => state.myTasks);
  const [pendingList, setPendingList] = useState([]);
  const [completedList, setCompletedList] = useState([]);
  let disabledCheckForRecord = true;
  let approvedReject;
  let approvedRejectSubs;
  let approvedRejectRemain;
  const history = useHistory();
  const [isActionSubmitted, setisActionSubmitted] = useState(false);
  const [disableButton, setDisableButton] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);

  const objectMatrix = JSON.parse(localStorage.getItem("objectMatrix")) || [];
  if (objectMatrix && objectMatrix.length > 0) {
    approvedReject = objectMatrix.filter(
      (item) =>
        item.category.toLowerCase().includes(MY_TASK_PAGE.toLowerCase()) &&
        item.objectName.toLowerCase() === APPROVE_REJECT_BTN.toLowerCase()
    );
    approvedRejectSubs = objectMatrix.filter(
      (item) =>
        item.category.toLowerCase().includes(MY_TASK_PAGE.toLowerCase()) &&
        item.objectName.toLowerCase() === APPROVE_REJECT_BTN_SUBS.toLowerCase()
    );
    approvedRejectRemain = objectMatrix.filter(
      (item) =>
        item.category.toLowerCase().includes(MY_TASK_PAGE.toLowerCase()) &&
        item.objectName.toLowerCase() ===
          APPROVE_REJECT_BTN_REMAINING.toLowerCase()
    );
  }
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
    console.log(selectedKeys[0]);
  };
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: "block",
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
            style={{ visibility: "hidden" }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
            style={{ visibility: "hidden" }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? "#1890ff" : undefined,
        }}
      />
    ),
    onFilter: (value, record) => {
      let filterData;
      if (record[dataIndex] !== null) {
        filterData = record[dataIndex]
          .toString()
          .toLowerCase()
          .includes(value.toLowerCase());
      }
      return filterData;
    },
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) => text,
  });

  const navigateToView = (event) => {
    if (event.taskListObjectAction === "Create") {
      if (event.taskListObject === "Entity") {
        history.push({
          pathname: `vendorDetails/${event.taskListPkey}/${event.taskListId}`,
          state: { myTaskData: event },
        });
      } else if (event.taskListObject === "Licence") {
        history.push({
          pathname: `licenseDetails/${event.taskListPkey}/${event.taskListId}`,
          state: { myTaskData: event },
        });
      } else if (event.taskListObject === "Agreement") {
        history.push({
          pathname: `AgreementDetails/${event.taskListPkey}/${event.taskListId}`,
          state: { myTaskData: event },
        });
      } else if (
        event.taskListObject === "Datafeed" ||
        event.taskListObject.toLowerCase() === "data feed"
      ) {
        history.push({
          pathname: `DatafeedDetails/${event.taskListPkey}/${event.taskListId}`,
          state: { myTaskData: event },
        });
      } else if (event.taskListObject === "Dataset") {
        history.push({
          pathname: `DatasetDetails/${event.taskListPkey}/${event.taskListId}`,
          state: { myTaskData: event },
        });
      } else if (event.taskListObject === "RecurrenceScheduler") {
        history.push(`schedulerDetails/${event.key}/${event.taskId}`);
      } else if (event.taskListObject === "Subscription") {
        history.push({
          pathname: `requestDetails/${event.taskListPkey}/${event.taskListId}`,
          state: { myTaskData: event },
        });
      } else if (event.taskListObject === "SourceConfiguration") {
        history.push(`sourceConfigDetails/${event.key}/${event.taskId}`);
      }
    } else if (
      event.taskListObjectAction === "Update" ||
      event.taskListObjectAction === "Deactivate"
    ) {
      if (event.taskListObject === "Entity") {
        history.push({
          pathname: `vendorDetails/${event.crId}/${event.taskListId}`,
          state: { myTaskData: event },
        });
      } else if (event.taskListObject === "Licence") {
        history.push({
          pathname: `licenseDetails/${event.crId}/${event.taskListId}`,
          state: { myTaskData: event },
        });
      } else if (event.taskListObject === "Agreement") {
        history.push({
          pathname: `AgreementDetails/${event.crId}/${event.taskListId}`,
          state: { myTaskData: event },
        });
      } else if (
        event.taskListObject === "Datafeed" ||
        event.taskListObject.toLowerCase() === "data feed"
      ) {
        history.push({
          pathname: `DatafeedDetails/${event.crId}/${event.taskListId}`,
          state: { myTaskData: event },
        });
      } else if (event.taskListObject === "Dataset") {
        history.push({
          pathname: `DatasetDetails/${event.crId}/${event.taskListId}`,
          state: { myTaskData: event },
        });
      } else if (event.taskListObject === "RecurrenceScheduler") {
        history.push(`schedulerDetails/${event.key}/${event.taskId}`);
      } else if (event.taskListObject === "Subscription") {
        history.push({
          pathname: `requestDetails/${event.crId}/${event.taskListId}`,
          state: { myTaskData: event },
        });
      } else if (event.taskListObject === "SourceConfiguration") {
        history.push(`sourceConfigDetails/${event.key}/${event.taskId}`);
      }
    }
  };
  function onlyUnique(value, index, array) {
    return array.indexOf(value) === index;
  }
  const onStatusChange = (event) => {
    setTaskListStatus(event.target.value);
  };

  const showApproveModal = (event) => {
    setDisabledSubmitBtn(true);
    if (event) {
      const payload = {
        ...event,
        taskListId: event.taskListId,
        taskListTaskStatus: "APPROVED",
        taskListApproveBy: localStorage.getItem("psid"),
        roleName: localStorage.getItem("entitlementType"),
      };
      setCurrentActionData(payload);
      setApproveModal(true);
      setRejectModal(false);
    }
  };

  const showRejectModal = (event) => {
    if (event) {
      const payload = {
        ...event,
        taskListId: event.taskListId,
        taskListTaskStatus: "REJECTED",
        taskListApproveBy: localStorage.getItem("psid"),
        roleName: localStorage.getItem("entitlementType"),
      };
      setCurrentActionData(payload);
      setRejectModal(true);
      setApproveModal(false);
    }
  };

  const loginedRold = localStorage.getItem("entitlementType");

  let loadingContent;
  const refreshPage = () => {
    //window.location.reload();
    setLoading(true);
    setDisabledSubmitBtn(false);
    //toggleData(taskListStatus);
  };
  useEffect(() => {
    setColumns([
      /*{
                title: "ID",
                dataIndex: "taskListId",
                ellipsis: false,
                width: '25%',
                sorter: (a, b) =>
                    a.taskListId.localeCompare(b.taskListId),
                
            },*/
      {
        title: "Object name",
        dataIndex: "taskListDescription",
        ellipsis: false,
        width: "29%",
        ...getColumnSearchProps("taskListDescription"),
        sorter: (a, b) =>
          a.taskListDescription != null
            ? a.taskListDescription.localeCompare(b.taskListDescription)
            : b.taskListDescription != null
            ? b.taskListDescription.localeCompare(a.taskListDescription)
            : null,
        render: (text, record) => (
          <Space size="middle">
            <button
              type="button"
              className="link-button talign"
              onClick={() => navigateToView(record)}
              alt={text}
            >
              {text}
            </button>
          </Space>
        ),
      },
      {
        title: "Object type",
        dataIndex: "taskListObject",
        sorter: (a, b) => a.taskListObject.localeCompare(b.taskListObject),
        ellipsis: true,
        filters: [
          {
            text: "Entity",
            value: "entity",
          },
          {
            text: "Agreement",
            value: "agreement",
          },
          {
            text: "Licence",
            value: "licence",
          },
          {
            text: "Dataset",
            value: "dataset",
          },
          {
            text: "Data Feed",
            value: "data feed",
          },
          {
            text: "Subscription",
            value: "subscription",
          },
        ],
        onFilter: (value, record) =>
          record.taskListObject.toString().toLowerCase().includes(value),
      },
      {
        title: "Operation",
        dataIndex: "taskListObjectAction",
        sorter: (a, b) =>
          a.taskListObjectAction.localeCompare(b.taskListObjectAction),
        ellipsis: true,
        filters: [
          {
            text: "Create",
            value: "create",
          },
          {
            text: "Update",
            value: "update",
          },
          {
            text: "Deactivate",
            value: "deactivate",
          },
        ],
        onFilter: (value, record) =>
          record.taskListObjectAction.toString().toLowerCase().includes(value),
      },
      {
        title: "Submitted by",
        dataIndex: "taskListCreatedBy",
        ellipsis: true,
        ...getColumnSearchProps("taskListCreatedBy"),
        sorter: (a, b) => {
          if (a.taskListCreatedBy && b.taskListCreatedBy)
            return a.taskListCreatedBy - b.taskListCreatedBy;
        },
      },
      {
        title: "Submitted on",
        dataIndex: "taskListCreatedOn",
        sorter: (a, b) => {
          return new Date(a.taskListCreatedOn) - new Date(b.taskListCreatedOn);
        },
        ellipsis: true,
        render: (value, record) => {
          return moment(record.taskListCreatedOn).format("DD MMM YYYY");
        },
      },
      {
        title: "Action by",
        dataIndex: "taskListApproveBy",
        ellipsis: true,
        ...getColumnSearchProps("taskListApproveBy"),
        sorter: (a, b) => {
          if (a.taskListApproveBy && b.taskListApproveBy) {
            return a.taskListApproveBy - b.taskListApproveBy;
          }
        },
        render: (value, record) => {
          return record.taskListApproveBy != null
            ? record.taskListApproveBy
            : "";
        },
      },
      {
        title: "Action on",
        dataIndex: "taskListApproveOn",
        ellipsis: true,
        sorter: (a, b) => {
          return new Date(a.taskListApproveOn) - new Date(b.taskListApproveOn);
        },
        render: (value, record) => {
          return record.taskListApproveOn != null
            ? moment(record.taskListApproveOn).format("DD MMM YYYY")
            : "";
        },
      },
      {
        title: "Action",
        key: "taskId",
        width: "11%",
        sorter: (a, b) => {
          return a.taskListTaskStatus.localeCompare(b.taskListTaskStatus);
        },
        filters: [
          {
            text: "Approved",
            value: "approved",
          },
          {
            text: "Rejected",
            value: "rejected",
          },
          {
            text: "Pending",
            value: "pending",
          },
        ],
        onFilter: (value, record) =>
          record.taskListTaskStatus.toString().toLowerCase().includes(value),

        render: (text, record) => {
          let taskListObject = record && record.taskListObject;
          if (
            approvedReject.length > 0 &&
            approvedReject[0].permission === "RW"
          ) {
            disabledCheckForRecord = false;
          } else if (
            approvedRejectSubs.length > 0 &&
            approvedRejectRemain.length > 0
          ) {
            if (
              taskListObject.toLowerCase() === "subscription" &&
              approvedRejectSubs[0].permission === "RW"
            ) {
              disabledCheckForRecord = false;
            } else {
              disabledCheckForRecord = true;
            }
          }
          let isDisabled =
            disabledSubmitBtn ||
            disabledCheckForRecord ||
            !checkForString("currentUserRole", DATASET_OWNER)
          return (
            <div>
              <Space size="middle">
                {record.taskListTaskStatus.toLowerCase() == "approved" ? (
                  <Tag color="green">
                    {" "}
                    {camelText(record.taskListTaskStatus)}{" "}
                  </Tag>
                ) : record.taskListTaskStatus.toLowerCase() == "rejected" ? (
                  <Tag color="red">
                    <span style={{ color: "#007AFF" }}>
                      <Tooltip title={record.taskListRejectionReason}>
                        <InfoCircleOutlined
                          style={{ fontSize: "10px", color: "red" }}
                        />{" "}
                      </Tooltip>
                    </span>
                    {camelText(record.taskListTaskStatus)}
                  </Tag>
                ) : record.taskListTaskStatus.toLowerCase() == "pending" ? (
                  <>
                    <button
                      type="button"
                      className="link-button"
                      onClick={() => showApproveModal(record)}
                      disabled={isDisabled}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="link-button"
                      onClick={() => showRejectModal(record)}
                      disabled={isDisabled}
                    >
                      {" "}
                      Reject
                    </button>
                  </>
                ) : (
                  ""
                )}
              </Space>
            </div>
          );
        },
      },
    ]);
  }, []);

  useEffect(() => {
    if (!isPageLoaded || !list || !list.list || !list.list.length) {
      dispatch(getAllTasks());
      dispatch(startGetDatafeeds());
      setIsPageLoaded(true);
    } else {
      if (!data || !data.length || list.list.length) {
        let sortedData = list.list.sort(function (a, b) {
          // Turn your strings into dates, and then subtract them
          // to get a value that is either negative, positive, or zero.
          return new Date(b.taskListCreatedOn) - new Date(a.taskListCreatedOn);
        });
        setData(sortedData);
        setLoading(false);
        setCountObj(list.data);
        setCompletedList(list.completedList);
        setPendingList(list.pendingList);
      } else if (
        list.completedList.length == 0 ||
        list.pendingList.length == 0
      ) {
        setCompletedList(list.completedList);
        setPendingList(list.pendingList);
        setLoading(false);
      } else if (Object.keys(countObj).length === 0) {
        setCountObj(list.data);
      }
    }
  }, [
    list,
    dispatch,
    list && list.list,
    list && list.pendingList,
    list && list.completedList,
  ]);

  if (loading) {
    loadingContent = (
      <Col
        span={24}
        style={{
          textAlign: "center",
          background: "#f0f2f5",
          paddingTop: "8%",
        }}
        id="spinner"
      >
        <Spin tip="Loading..." />
      </Col>
    );
  } else {
    loadingContent = (
      <>
        <div className="dashboard-layout" id="main">
          <div>
            <div className="content-wrapper">
              <div className="header-utlis">
                <h3>My Tasks ({data && data.length == 0 ? 0 : data.length})</h3>
              </div>

              <Radio.Group
                className="sider-radio-group-button"
                defaultValue="all"
                onChange={onStatusChange}
                value={taskListStatus}
              >
                <Radio.Button
                  className="sider-radio-button"
                  value="pending"
                  id="btn-pending"
                >
                  Pending
                </Radio.Button>
                <Radio.Button className="sider-radio-button" value="completed">
                  Completed
                </Radio.Button>
                <Radio.Button className="sider-radio-button" value="all">
                  All
                </Radio.Button>
              </Radio.Group>
            </div>
            {columns.length > 0 ? (
              <Table
                size="small"
                rowKey={(record) => record.taskListId}
                style={{ padding: 24 }}
                columns={columns}
                dataSource={
                  taskListStatus == "pending"
                    ? pendingList
                    : taskListStatus == "completed"
                    ? completedList
                    : data
                }
                //onChange={onChange123}
              />
            ) : null}
          </div>
        </div>
      </>
    );
  }

  let myTasksTitle = (
    <span>
      My Tasks
      <Badge
        color="#52c41a"
        style={{ verticalAlign: "-webkit-baseline-middle", left: "2.8%" }}
      />
    </span>
  );
  return (
    <>
      <Headers />
      <Row>
        <Layout>
          <Content>
            <div className="dashboard-header" id="header-panel">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Breadcrumb style={{ margin: "16px 0" }}>
                  <Breadcrumb.Item href="/catalog">
                    <HomeOutlined />
                  </Breadcrumb.Item>
                  <Breadcrumb.Item>My Tasks</Breadcrumb.Item>
                </Breadcrumb>
              </div>
              <div>
                <PageHeader title={myTasksTitle} ghost={false}></PageHeader>
              </div>
            </div>

            {loadingContent}
          </Content>
        </Layout>{" "}
        {/*---------------Ends */}
        <ApproveRejectModal
          approveModal={approveModal}
          currentActionData={currentActionData}
          getStatus={null}
          rejectModal={rejectModal}
          setDisabledSubmitBtn={setDisabledSubmitBtn}
          disabledSubmitBtn={disabledSubmitBtn}
          refreshPage={refreshPage}
          data={data}
          setData={setData}
        />
      </Row>
    </>
  );
};

export default memo(MyTasksDashboardNew);