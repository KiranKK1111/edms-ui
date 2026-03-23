import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Col,
  Divider,
  Modal,
  Badge,
  Form,
  Input,
  Layout,
  Menu,
  Radio,
  Row,
  Select,
  Space,
  Spin,
  List,
  Card,
  message,
} from "antd";

import { FilterOutlined, ExclamationOutlined } from "@ant-design/icons";

import Headers from "../../pages/header/Header";

import "../../common.css";
import "./CatalogPage.css";

import Catalog from "../../components/catalog/Catalog";
import { newCataloguePageData } from "../../store/actions/CatalogPageActions";
//import { userDetailsLogin } from "../../store/actions/loginActions";

import { startGetVendors } from "../../store/actions/VendorActions";
import isButtonObject from "../../utils/accessButtonCheck";
import {
  CATELOG_MANAGEMENT_PAGE,
  CATELOG_MANAGEMENT_FILTER_BTN,
  SUBSCRIBER,
} from "../../utils/Constants";
import moment from "moment";
import { checkForString } from "../../utils/warningUtils";

const { Option } = Select;

const CatalogPage = (props) => {
  const [searchWord, setSearchWord] = useState();
  const [catalogueNewList, setCatalogueNewList] = useState({
    loading: false,
    catalogueList: [],
  });

  const [form] = Form.useForm();

  let [filterShown, setFilterShown] = useState(false);
  const dispatch = useDispatch();
  const [sortLabel, setSortLabel] = useState("Sort By");
  const [datasourceList, setDatasourceList] = useState([]);
  const [feedStatus, setFeedStatus] = useState([]);
  const onClick = ({ key }) => {
    setSortLabel(key);
    form.setFieldsValue({
      countryName: undefined,
      licenseType: undefined,
      vendorName: undefined,
    });
  };
  const SORT_MENU = (
    <Menu onClick={onClick}>
      <Menu.Item key="All">All</Menu.Item>
      <Menu.Item key="Subscribed">Subscribed</Menu.Item>
      <Menu.Item key="Unsubscribed">Unsubscribed</Menu.Item>
    </Menu>
  );

  const getEntityData = async () => {
    const resp = await dispatch(startGetVendors(true));
  };

  // Load data by passing the Data Family ID.
  useEffect(() => {
    dispatch(newCataloguePageData());
    const loggedUser = localStorage.getItem("entitlementType");
    const loginedRoleName =
      loggedUser && loggedUser.toString().toLocaleLowerCase();
    if (
      loginedRoleName === "dataset delegate" ||
      loginedRoleName === "dataset owner" ||
      loginedRoleName === "read only" ||
      loginedRoleName === "iam admin"
    ) {
      getEntityData();
    }
    const domain = /:\/\/([^\/]+)/.exec(window.location.href)[1];
    const chkStage = domain.includes("stage");
    // if (chkStage) userDetailsLogin();
  }, [dispatch]);

  let catalogueList = useSelector((state) => state.catalogueList) || [];
  useEffect(() => {
    setCatalogueNewList(catalogueList);
  }, [catalogueList]);

  /**
   * Event Handlers
   */
  const onFilterButtonClick = (e) => {
    setFilterShown(!filterShown);
    e.preventDefault();
  };
  const getFilterList = (obj) => {
    const advancedFilter =
      catalogueList &&
      catalogueList.catalogueList &&
      catalogueList.catalogueList.filter((v) => {
        let filterResponse = true;
        if (filterResponse && obj.datasource) {
          filterResponse = obj.datasource === v.entityShortName;
        }
        if (
          filterResponse &&
          obj &&
          obj.datafeedStatus &&
          v &&
          v.dataFeedStatus
        ) {
          filterResponse =
            obj.datafeedStatus.toLowerCase() === v.dataFeedStatus.toLowerCase();
        }
        if (filterResponse && !obj.datafeeds) {
          return filterResponse;
        }
        if (filterResponse && obj.datafeeds === "subscribed") {
          return (filterResponse = v.subscription);
        }
        if (filterResponse && obj.datafeeds !== "subscribed") {
          return (filterResponse = !v.subscription);
        }
        return filterResponse;
      });

    const advancedFilterList = {
      ...catalogueNewList,
      catalogueList: advancedFilter,
    };
    setCatalogueNewList(advancedFilterList);
  };

  // Filter the data present in the table.
  const filter = () => {
    setSortLabel("Sort By");
    const filterObject = form.getFieldsValue();
    getFilterList(filterObject);
  };

  // Resetting Form Fields.
  const onReset = () => {
    form.resetFields();
    filter();
  };

  const lablelFn = (lable) => {
    return <div className="label-bold">{lable}</div>;
  };

  // Decide if the filter panel be shown.
  let filterDisplay = null;
  let guestRole = localStorage.getItem("guestRole");

  // Data for the Select -> Options dropdown.
  const getList = (value) => {
    let list = catalogueList.catalogueList.map((item) => item[value]);
    list = [...new Set(list)];
    return list;
  };
  const getListStatus = (value) => {
    let list = catalogueList.catalogueList.map(
      (item) =>
        item[value] &&
        item[value].replace(/(^\w{1})|(\s{1}\w{1})/g, (match) =>
          match.toUpperCase()
        )
    );
    const listModified = [];
    list &&
      list.length > 0 &&
      list.forEach((item = "inactive") => {
        return item.toLowerCase() === "inactive"
          ? listModified.push("Inactive")
          : listModified.push(item);
      });

    list = [...new Set(listModified)];
    return list;
  };
  useEffect(() => {
    if (catalogueList && catalogueList.catalogueList) {
      setDatasourceList(getList("entityShortName"));
      setFeedStatus(getListStatus("dataFeedStatus"));
    }
  }, [catalogueList.catalogueList]);

  if (filterShown) {
    filterDisplay = (
      <Form form={form} labelCol={{ span: 24 }}>
        <Row className="bg-white pr-24 pl-24 pb-8">
          <Col flex="380px" className="pr-24">
            <Form.Item
              label={lablelFn("Data Feeds")}
              name="datafeeds"
              initialValue={undefined}
            >
              <Radio.Group disabled={guestRole ? true : false}>
                <Radio.Button value={undefined}>All</Radio.Button>
                <Radio.Button value="subscribed">Subscribed</Radio.Button>
                <Radio.Button value="unsubscribed">Unsubscribed</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>

          <Col flex="auto" className="pr-24">
            <Form.Item label={lablelFn("Data Source")} name="datasource">
              <Select placeholder="Select">
                {datasourceList.length > 0 &&
                  datasourceList.map((v) => (
                    <Option key={v} value={v}>
                      {v}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </Col>

          <Col flex="auto" className="pr-24">
            <Form.Item
              label={lablelFn("Data Feed Status")}
              name="datafeedStatus"
            >
              <Select placeholder="Select">
                {feedStatus.length > 0 &&
                  feedStatus.map((c) => (
                    <Option key={c} value={c}>
                      {c}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </Col>

          <Col flex="none">
            <Space style={{ paddingTop: "40px" }}>
              <Button onClick={onReset}>Reset</Button>
              <Button type="primary" onClick={filter}>
                Apply
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>
    );
  }
  let catalogListDisplay = "Loading...";
  let catalogueCount = 0;
  if (catalogueNewList.loading) {
    catalogListDisplay = (
      <Col span={24} style={{ textAlign: "center" }} className="mt-24">
        <Spin tip="Loading..." />
      </Col>
    );
  }

  if (
    catalogueNewList &&
    catalogueNewList.catalogueList &&
    catalogueNewList.catalogueList.length > 0
  ) {
    const revisedCatalogueList = catalogueNewList.catalogueList.filter(
      (catalogue) =>
        catalogue.dataFeedStatus &&
        catalogue.dataFeedStatus.toLowerCase() !== "deleted"
    );
    catalogueCount = revisedCatalogueList.length;
    catalogListDisplay = (
      <div className="list-parent">
        <List
          grid={{ gutter: [24, 12], column: 4 }}
          pagination={{
            // onChange: (page) => { },
            // pageSize: 16,
            defaultPageSize: 12,
            pageSizeOptions: ["12", "24", "48", "100"],
            hideOnSinglePage: true,
            defaultCurrent: 1,
            size: "small",
          }}
          dataSource={revisedCatalogueList}
          renderItem={(d) => (
            <List.Item>
              <Catalog catalogueInfo={d} />
            </List.Item>
          )}
        />
      </div>
    );
  } else if (
    catalogueNewList.catalogueList &&
    catalogueNewList.catalogueList.length === 0
  ) {
    catalogListDisplay = (
      <h3
        style={{
          margin: "auto",
          fontSize: "16px",
          color: "#212B36",
          paddingTop: "20px",
        }}
      >
        No Data Feeds Found
      </h3>
    );
  }

  const searchByWordFn = (word) => {
    const searchText = word.toLowerCase().trim();
    const revisedList =
      catalogueList &&
      catalogueList.catalogueList &&
      catalogueList.catalogueList.filter(
        (u) =>
          (u.entityShortName && u.entityShortName.toLowerCase().includes(searchText)) ||
          (u.datasetShortName && u.datasetShortName.toLowerCase().includes(searchText)) ||
          (u.dataFeedLongName && u.dataFeedLongName.toLowerCase().includes(searchText)) ||
          (u.dataFeedDescription && u.dataFeedDescription.toLowerCase().includes(searchText)) ||
          (u.dataFeedId && u.dataFeedId.toLowerCase().includes(searchText)) ||
          (u.dataFeedShortName && u.dataFeedShortName.toLowerCase().includes(searchText))
      );
    const revisedNewList = {
      ...catalogueNewList,
      catalogueList: revisedList,
    };
    setCatalogueNewList(revisedNewList);
  };

  useEffect(() => {
    if (searchWord) {
      const delayDebounceFn = setTimeout(async () => {
        searchByWordFn(searchWord);
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    } else {
      setCatalogueNewList(catalogueList);
    }
  }, [searchWord]);

  const wordSearchHandler = (e) => {
    setSearchWord(e.target.value);
  };

  const isFilterButton = isButtonObject(
    CATELOG_MANAGEMENT_PAGE,
    CATELOG_MANAGEMENT_FILTER_BTN
  );

  const config = {
    title: <div className="modal-head">Access Token</div>,
    content: (
      <>
        <div>Below is the access token generated. Click Copy Token.</div>
        <div className="para-break">
          <Card className="noselect" style={{ width: 900 }}>
            {localStorage.getItem("access_token")}
          </Card>
        </div>
        {/* <div style={{ paddingTop: "20px" }}>
          Please refer the{" "}
          <a href={Document} target="_blank" download>
            External Data Platform Access Guide
          </a>{" "}
          document for authorization.
        </div> */}
      </>
    ),
    width: 1000,
    icon: <ExclamationOutlined style={{ color: "white" }} />,
    style: { top: "35%" },
    okText: "Copy Token",

    onOk: () => {
      navigator.clipboard.writeText(localStorage.getItem("access_token"));
      message.success("Access Token Copied Successfully!");
    },
  };
  const authTokenModal = () => {
    let secondsToGo = 180;
    const tokenModal = Modal.confirm(config);
    const timer = setInterval(() => {
      secondsToGo -= 1;
    }, 1000);
    setTimeout(() => {
      clearInterval(timer);
      tokenModal.destroy();
    }, secondsToGo * 1000);
  };

  return (
    <div className="catalog-page" id="main">
      <Headers />

      <Layout>
        <Row className="bg-white pr-24 pl-24">
          <Col span={24} className="mt-24">
            <span className="catalog-title">
              Catalogue
              <Badge
                color="#52c41a"
                style={{
                  verticalAlign: "-webkit-baseline-middle",
                  left: "0.15%",
                }}
              />
            </span>
          </Col>
        </Row>
        <Row className="bg-white pr-24 pl-24 pb-24">
          <Col flex="auto" className="mt-24">
            <Input
              name="searchText"
              onChange={(e) => wordSearchHandler(e)}
              placeholder="Search Data Feed"
              disabled={!guestRole && isFilterButton}
            />
          </Col>
          <Col flex="none" className="mt-24">
            <Button
              icon={<FilterOutlined />}
              onClick={onFilterButtonClick}
              className="ml-24"
              disabled={!guestRole && isFilterButton}
              id="btn-filter"
            >
              Filters
            </Button>
          </Col>
          <Col flex="none" className="mt-24">
            <Button
              onClick={authTokenModal}
              className="ml-24 btn-token1"
              type="primary"
              disabled={
                !checkForString("entitlementType", SUBSCRIBER)
              }
            >
              Generate Access Token
            </Button>
          </Col>
        </Row>
        {filterDisplay}
        {/* Content for the page starts from here. */}
        <Row className="mt-24 mr-24 ml-24">
          <Col flex="auto">
            <span className="content-title">
              All Data Feeds ({catalogueCount})
            </span>
          </Col>
        </Row>
        <Row className="ml-24 mr-24">
          <Col span={24}>
            <Divider className="mt-8 mb-0" />
          </Col>
        </Row>
        <Row className="mr-24 ml-24 mt-24 mb-24">{catalogListDisplay}</Row>
      </Layout>
    </div>
  );
};
export default CatalogPage;