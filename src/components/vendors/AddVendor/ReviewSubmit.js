import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Row, Col, Divider, Button, PageHeader } from "antd";
import { normalText } from "../../stringConversion";

const ReviewSubmit = () => {
  const data = useSelector((state) => state.vendor);

  let keys = Object.keys(data.data);
  keys.push(keys.splice(keys.indexOf("entityDescription"), 1)[0]);

  return (
    <div id="main">
      <Row gutter={[2, 8]}>
        {keys.map((item, i) => (
          <Col span={item === "entityDescription" ? 16 : 8} key={i}>
            <span className="label-review">
              {normalText(item)
                .replace("Entity Description", "Description")
                .replace("Entity Status", "Status")}{" "}
              :
            </span>
            {data.data[item] ? (
              item === "website" ? (
                <a href={`https://${data.data[item]}`} target="_blank">
                  {data.data[item]}
                </a>
              ) : (
                data.data[item]
              )
            ) : (
              "-"
            )}
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ReviewSubmit;