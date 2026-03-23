import { withRouter } from "react-router-dom";
import { PageHeader, Tag } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import logoRecord from "../../images/source_icon.svg";

import HeaderPanel from "../headerPanel/HeaderPanel";

const DatasetPageHeader = (props) => {
  const { datafeedLongName, subscription } = props;

  return (
    <PageHeader
      title={
        <div>
          <img
            src={logoRecord}
            alt="Source Icon"
            className="page-header-img pr-8"
          />
          {datafeedLongName ? datafeedLongName : "-"}{" "}
          {subscription &&
          subscription.subscriptionStatus.toLowerCase() === "active" ? (
            <Tag
              style={{ marginLeft: "16px" }}
              icon={<CheckCircleOutlined />}
              color="success"
            >
              Subscribed
            </Tag>
          ) : null}
        </div>
      }
      ghost={false}
      onBack={() => props.history.push("/catalog")}
      className="pt-0 pb-0"
    >
      {/* <HeaderPanel />*/}
    </PageHeader>
  );
};

export default withRouter(DatasetPageHeader);