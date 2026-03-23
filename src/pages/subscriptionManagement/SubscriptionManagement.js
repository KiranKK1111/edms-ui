import { memo, useEffect, useState, useRef } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Badge,
  Spin,
  Divider,
  Modal,
  Tag,
  Table,
  Button,
  Row,
  Col,
  Input,
  Form,
  Select,
  AutoComplete,
  Empty,
  Space,
  Dropdown,
  Menu,
  message,
} from "antd";
import Headers from "../header/Header";
import Breadcrumb from "../../components/breadcrumb/Breadcrumb";
import { getAllSubscriptionDataList, getAllDataOwner } from "../../store/actions/SubscriptionDataActions";
import { EditOutlined, MinusCircleOutlined, ArrowLeftOutlined, SearchOutlined } from "@ant-design/icons";
import "./subscriptionData.css";
import "antd/dist/antd.css";
import moment from "moment";
import { camelText } from "../../components/stringConversion";
import { unsubscribe } from "../../store/actions/requestAccessActions";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { checkForString } from "../../utils/warningUtils";
import { DATASET_DELEGATE } from "../../utils/Constants";

export const getData = (list, feedId, type) => {
  if (list && list.length > 0) {
    const index = list.findIndex(item => item && item.feedId && item.feedId === feedId);
    return list && list[index] && list[index][type] ? list[index][type] : null;
  }
}

export const updateSubscription = (subscription) => {
  subscription.subscriptionStatus = "Inactive";
  subscription.lastUpdatedBy = localStorage.getItem("psid");
  subscription.roleName = localStorage.getItem("currentUserRole");
  delete subscription.dataOwner;
  delete subscription.datafeedName;
  return subscription;
}

const SubscriptionManagement = () => {
  const breadcrumb = [{ name: "Subscriptions" }];
  const greenStatus = ["approved", "live", "active", "setup"];
  const [loading, setLoading] = useState(false);
  const [filteredInfo, setFilteredInfo] = useState({});
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const dispatch = useDispatch();
  const [list, setList] = useState([]);
  const history = useHistory();

  //const list = useSelector((state) => state.allSubscriptionDataList);

  //Select Fields Values
  const [searchStatusValue, setSearchStatusValue] = useState(undefined);

  //For Options Arrays by name []
  const [searchStatus, setSearchStatus] = useState([
    "Active",
    "InActive",
    "Pending",
  ]);

  const getSubscriptionDataList = async () => {
    const res = await dispatch(getAllSubscriptionDataList());
    const dataOwners = await dispatch(getAllDataOwner());
    if (res) {
      if (res.subscriptions) {
        res.subscriptions = res.subscriptions.map(subscription => {
          var result = {} = subscription;
          result.dataOwner = getData(dataOwners.agreementMgrBankIds, subscription.dataFeedId, "agreementScbAgreementMgrBankId");
          result.datafeedName = getData(dataOwners.agreementMgrBankIds, subscription.dataFeedId, "datafeedShortName");
          return result;
        });
        return { subscriptions: res.subscriptions }
      }
    }
  };

  const margeData = async () => {
    return await getSubscriptionDataList();
  }

  const generate = () => {
    var isMounted = true;
    setLoading(true);
    margeData().then(data => {
      if (isMounted)
        setList(data && data.subscriptions && data.subscriptions.length > 0 ? data.subscriptions : null);
      setLoading(false);
    });
    return () => { isMounted = false };
  }

  useEffect(() => {
    generate();
  }, [])

  //*************************************************************************************************//
  const expandedRowRender = (row, expandable) => {
    let storingId = 0;
    const columns = [];
    return {};
    {
      /*<Table
        columns={columns}
        className="license-nested-table"
        dataSource={[]}//{agreementLicenses}
        pagination={false}
        rowKey={"dataFeedID"}//{agreementLicenses.key}
        title={() => {
          let licButtonDispflag =
            !isLicenceDisabled &&
            agreementNameDetails[0] &&
            agreementNameDetails[0].agreementStatus &&
            ((agreementNameDetails[0] &&
              agreementNameDetails[0].agreementStatus.toLowerCase() ===
                "active") ||
              (agreementNameDetails[0] &&
                agreementNameDetails[0].agreementStatus.toLowerCase() ===
                  "planned"))
              ? false
              : true;
          return <b>{"Expend Data"}</b>;
        }}
      />*/
    }
  };
  const searchInput = useRef(null);
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
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

  const handleSubscriptionDeactivation = (subscription) => {
    subscription.subscriptionUpdateFlag === 'N' ?
      Modal.confirm({
        title: (
          <h3>
            <b>Unsubscribe from Data Feed?</b>{" "}
          </h3>
        ),
        content: "This will revoke Subscriber's access to Data Feed. Are you sure you want to proceed?",
        okText: "Unsubscribe",
        okButtonProps: { style: { backgroundColor: "#FF4C4F", border: 0 } },
        onOk: async () => {
          const res = await unsubscribe(updateSubscription(subscription));
          if (res && res.data && res.data.statusMessage && res.data.statusMessage.code == 200) {
            message.success("Unsubscribe request submitted successfully");
          }
          generate();
        },
      }) :
      Modal.confirm({
        title: (
          <h3>
            <b>An unsubscribe request for this Data Feed is already pending approval</b>{" "}
          </h3>
        ),
        content: `The details remain unchanged until your request is approved.`,
        okButtonProps: { style: { display: "none" } },
        cancelText: "Ok",
      });
  }

  const moreSubscriptionMenu = (subscription) => {
    const moreLicense = (
      <Menu className="more-license-menu">
        <Menu.Item className="blue-menu">
          <span>
            <EditOutlined /> Edit
          </span>
        </Menu.Item>

        <Menu.Item
          className="warn-menu"
          onClick={() => handleSubscriptionDeactivation(subscription)}
          disabled={
            !greenStatus.includes(subscription.subscriptionStatus.toLowerCase())
            && subscription.subscriptionStatus.toLowerCase() !== 'pending'
          }
        >
          <span>
            <MinusCircleOutlined /> Unsubscribe
          </span>
        </Menu.Item>
      </Menu>
    );
    return moreLicense;
  };

  const columns = [
    {
      title: <b>Requestor</b>,
      dataIndex: "requester",
      key: "requester",
      //width: "10%",
      ellipsis: false,
      ...getColumnSearchProps("requester"),
      sorter: (a, b) => {
        return a.requester.localeCompare(b.requester);
      },
      render: (item) => {
        return <div>{item} </div>;
      },
    },
    {
      title: <b>Subscription type</b>,
      dataIndex: "subscriptionType",
      key: "subscriptionType",
      //width: "18%",
      ellipsis: false,
      filters: [
        {
          text: "Individual Subscription",
          value: "individual subscription",
        },
        {
          text: "Application Subscription",
          value: "application subscription",
        },
      ],
      onFilter: (value, record) =>
        record.subscriptionType.toString().toLowerCase().includes(value),
      sorter: (a, b) => a.subscriptionType.localeCompare(b.subscriptionType),
      render: (item) => {
        return <div>{item} </div>;
      },
    },

    {
      title: <b>Subscriber</b>,
      dataIndex: "subscriber",
      key: "subscriber",
      //width: "15%",
      ...getColumnSearchProps("subscriber"),
      ellipsis: false,
      sorter: (a, b) => a.subscriber.toString().localeCompare(b.subscriber),
      render: (item) => {
        return <div> {item}</div>;
      },
    },

    {
      title: <b>Data Feed ID</b>,
      dataIndex: "dataFeedId",
      key: "dataFeedId",
      //width: "18%",
      ellipsis: false,
      ...getColumnSearchProps("dataFeedId"),
      sorter: (a, b) => a.dataFeedId.toString().localeCompare(b.dataFeedId),
      render: (item) => {
        return <div> {item}</div>;
      },
    },
    {
      title: <b>Data Feed name</b>,
      dataIndex: "datafeedName",
      key: "datafeedName",
      //width: "20%",
      ellipsis: false,
      ...getColumnSearchProps("datafeedName"),
      sorter: (a, b) =>
        a.datafeedName
          .toString()
          .localeCompare(b.datafeedName),
      render: (item) => {
        return <div> {item}</div>;
      },
    },
    {
      title: <b>Number of Licences</b>,
      dataIndex: "licensesSubscribed",
      key: "licensesSubscribed",
      //width: "15%",
      ellipsis: false,
      sorter: (a, b) => a.licensesSubscribed - b.licensesSubscribed,
      render: (item) => {
        return <div> {item}</div>;
      },
    },
    {
      title: <b>Status</b>,
      dataIndex: "subscriptionStatus",
      key: "subscriptionStatus",
      //width: "10%",
      filters: [
        {
          text: "Active",
          value: "active",
        },
        {
          text: "Inactive",
          value: "inactive",
        },
        {
          text: "Pending",
          value: "pending",
        },
      ],
      onFilter: (value, record) =>
        record.subscriptionStatus.toString().toLowerCase() === value,

      sorter: (a, b) =>
        a.subscriptionStatus.localeCompare(b.subscriptionStatus),
      render: (subscriptionStatus) => {
        if (subscriptionStatus && greenStatus.includes(subscriptionStatus.toLowerCase())) {
          return <Tag color="green"> {subscriptionStatus} </Tag>;
        } else if (subscriptionStatus.toLowerCase() === 'pending') {
          return <Tag color="orange"> {subscriptionStatus} </Tag>;
        } else {
          return <Tag color="red"> {camelText(subscriptionStatus)} </Tag>;
        }
      },
    },
    {
      title: <b>Created on</b>,
      dataIndex: "createdOn",
      key: "createdOn",
      //width: "25%",
      ellipsis: false,
      defaultSortOrder: "descend",
      sorter: (a, b) => {
        return new Date(a.createdOn) - new Date(b.createdOn);
      },
      render: (createdOn) => {
        return (
          <div className="expDate-styling">
            {createdOn ? moment(createdOn).format("DD MMM YYYY") : "No Expiry"}
          </div>
        );
      },
    },
    {
      title: <b>Data Owner</b>,
      dataIndex: "dataOwner",
      key: "dataOwner",
      //width: "15%",
      ellipsis: false,
      ...getColumnSearchProps("dataOwner"),
      sorter: (a, b) => {
        if (a.dataOwner != null && b.dataOwner != null) {
          a.dataOwner.toString().localeCompare(b.dataOwner)
        }
      },
      render: (item) => {
        return <div> {item}</div>;
      },
    },
    {
      title: <b>Actions</b>,
      key: "actions",
      //width: "15%",
      render: (record) => {
        return (
          <Dropdown
            overlay={() => moreSubscriptionMenu(record)}
            placement="bottomLeft"
            arrow
            disabled={!checkForString("currentUserRole", DATASET_DELEGATE)}
          >
            <Button
              className="moreButton"
              type="link"
            >
              {" "}
              More
            </Button>
          </Dropdown>
        )
      },
    },
  ];

  const [form] = Form.useForm();

  const handleAllReset = async () => {
    form.resetFields();
  };

  const handleAllSearch = (e) => { };

  const onFocusRequester = (e) => { };

  return (
    <div>
      <Headers />
      <div className="panel-top">
        <Breadcrumb breadcrumb={breadcrumb} />
        <div className="dashboard-header-title">
          <h2 className="pad-revised">
            <Link to="/catalog">
              <ArrowLeftOutlined size="small" style={{ color: "black" }} />{" "}
            </Link>{" "}
            <b>
              {" "}
              Subscriptions
              <Badge
                color="#52c41a"
                style={{
                  verticalAlign: "-webkit-baseline-middle",
                  left: "0.25%",
                }}
              />{" "}
            </b>
          </h2>
        </div>
      </div>

      <div className="content-area">
        <div className="content-wrapper">
          <div className="header-utlis">
            <h3>
              Subscriptions ({list && list.length == 0 ? 0 : list.length})
            </h3>
          </div>
          <Divider />
          <Form form={form} labelCol={{ span: 24 }}>
            {/* <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
          <Col className="gutter-row dataset-content-search" span={4}>
            <Form.Item name="searchRequester" initialValue={undefined}>
              <AutoComplete
                suffix={<SearchOutlined />}
                name="searchRequester"
                //dataSource={dataSourceRequester}
                onChange={""}
                onSelect={""}
                //value={searchRequester}
                //optionLabelProp={searchRequester}
                filterOption={(inputValue, option) =>
                  option.props.children
                    .toUpperCase()
                    .indexOf(inputValue.toUpperCase()) !== -1
                }
              >
                <Input
                  suffix={<SearchOutlined />}
                  placeholder="Search Requester"
                  onBlur={onFocusRequester}
                ></Input>
              </AutoComplete>
            </Form.Item>
          </Col>
          <Col className="gutter-row dataset-content-search" span={5}>
            <Form.Item name="searchSubscriber" initialValue={undefined}>
              <AutoComplete
                //dataSource={dataSourceSubscriber}
                onChange={""}
                onSelect={""}
                //value={searchSubscriber}
                //optionLabelProp={searchSubscriber}
                filterOption={(inputValue, option) =>
                  option.props.children
                    .toLowerCase()
                    .indexOf(inputValue.toLowerCase()) !== -1
                }
              >
                <Input
                  suffix={<SearchOutlined />}
                  placeholder="Search Subscriber"
                  onBlur={onFocusRequester}
                ></Input>
              </AutoComplete>
            </Form.Item>
          </Col>
          <Col className="gutter-row dataset-content-search" span={5}>
            <Form.Item name="searchDataFeed" initialValue={undefined}>
              <AutoComplete
                //dataSource={dataSourceDatafeed}
                onChange={""}
                onSelect={""}
                //value={searchDatafeed}
                //optionLabelProp={searchDatafeed}
                filterOption={(inputValue, option) =>
                  option.props.children
                    .toLowerCase()
                    .indexOf(inputValue.toLowerCase()) !== -1
                }
              >
                <Input
                  suffix={<SearchOutlined />}
                  placeholder="Search Data Feed"
                  onBlur={onFocusRequester}
                ></Input>
              </AutoComplete>
            </Form.Item>
          </Col>
          <Col className="gutter-row dataset-content-search" span={4}>
            <Form.Item name="searchStatus" initialValue={undefined}>
              <Select
                placeholder="Search Status"
                value={searchStatusValue}
                //onSelect={handleSelect}
                // onBlur={onFocusAgreement}
              >
                {searchStatus.length &&
                  searchStatus.map((c) => (
                    <Option key={c} value={c}>
                      {c}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </Col>
          
          
          <Col span={2} style={{ marginLeft: "70px" }}>
            <Button type="secondary" onClick={handleAllReset}>
              Cancel
            </Button>
          </Col>
          <Col span={2} style={{ marginLeft: "20px" }}>
            <Button type="primary" onClick={handleAllSearch}>
              Apply
            </Button>
          </Col>
        </Row> */}
          </Form>
          <div className="dashboard-table">
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
              <Table
                locale={{
                  emptyText: (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="No Subscriptions"
                    />
                  ),
                }}
                columns={columns}
                rowKey={(record) => record.subscriptionId}
                size="small"
                expandedRowRender={expandedRowRender}
                dataSource={list}
                scroll={{ x: 1400 }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(SubscriptionManagement);