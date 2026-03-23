import { Fragment } from "react";
import {Link} from 'react-router-dom';
import { Breadcrumb } from "antd";
import { HomeOutlined } from "@ant-design/icons";

const BreadcrumbComponent = ({ breadcrumb }) => {
  return (
    <Breadcrumb>
      <Breadcrumb.Item>
        <Link to="/catalog">
          <HomeOutlined />
        </Link>
      </Breadcrumb.Item>
      {breadcrumb &&
        breadcrumb.map((item, i) => (
          <Fragment key={i}>
            {"url" in item ? (
              <Breadcrumb.Item>
                <Link to={item.url} className="truncate-text">
                  {item.name}
                </Link>
              </Breadcrumb.Item>
            ) : (
              <Breadcrumb.Item>{item.name}</Breadcrumb.Item>
            )}
          </Fragment>
        ))}
    </Breadcrumb>
  );
};

export default BreadcrumbComponent;