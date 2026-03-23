import { Link } from "react-router-dom";
import { Breadcrumb } from "antd";
import { HomeOutlined } from "@ant-design/icons";

const DatasetBreadcrumb = (props) => {
  const { title } = props;

  const titleDisplay = title ? title : "-";

  return (
    <Breadcrumb className="mt-16 ml-24 mr-24">
      <Breadcrumb.Item>
        <Link to="/catalog">
          <HomeOutlined />
        </Link>
      </Breadcrumb.Item>
      <Breadcrumb.Item>
        <Link to="/catalog">Catalogue</Link>
      </Breadcrumb.Item>
      <Breadcrumb.Item>{titleDisplay}</Breadcrumb.Item>
    </Breadcrumb>
  );
};

export default DatasetBreadcrumb;