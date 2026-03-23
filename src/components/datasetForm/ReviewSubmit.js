import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { Row, Col, Descriptions } from "antd";
import { normalText } from "../stringConversion";
import { datasetInfo } from "../../store/actions/datasetFormActions";

const ReviewSubmit = () => {
  const [storeData, setStoreData] = useState();
  const data = useSelector((state) => state.dataset.formData);
  const dispatch = useDispatch();
  const location = useLocation();

  const revisedData = ({
    datasetId,
    longName,
    shortName,
    datasetStatus: status,
    datasetDescription: description,
  }) => ({ datasetId, longName, shortName, status, description });
  const newData = revisedData(data);
  const keys = data && Object.keys(newData);

  useEffect(() => {
    if (data && !storeData) {
      const psid = localStorage.getItem("psid");
      const entitlementType = localStorage.getItem("entitlementType");
      let finalValues = {
        datasetDescription: data["description"],
        datasetId: data["datasetId"],
        datasetStatus: data["status"],
        longName: data["longName"],
        shortName: data["shortName"],
        roleName: data["roleName"],
        isUpdate: location.state.isUpdate,
      };
      if (location.state.isUpdate === false) {
        finalValues["createdBy"] = psid;
        finalValues["roleName"] = entitlementType;
        finalValues["datasetUpdateFlag"] = "N";
        finalValues["entityId"] = location.state.eid;
        finalValues["licenseId"] = location.state.licence.licenseId;
      } else {
        finalValues["datasetUpdateFlag"] = "N";
        finalValues["lastUpdatedBy"] = psid;
        finalValues["roleName"] = entitlementType;
        finalValues["entityId"] = data["entityId"];
        finalValues["licenseId"] = data["licenseId"];
      }
      dispatch(datasetInfo(finalValues));
      setStoreData(finalValues);
    }
  }, [data]);

  return (
    <div className="review-submit">
      <h3>Dataset Details</h3>
      <Row gutter={[2, 4]}>
        {keys &&
          keys.map((item, i) => (
            <Col span={item !== "description" ? 8 : 16} key={i}>
              <Descriptions
                title=""
                layout="horizontal"
                column={1}
                size="middle"
                style={{ marginLeft: "1rem", marginTop: "0.5rem" }}
              >
                <Descriptions.Item
                  label={normalText(item).replace("Id", "ID")}
                  labelStyle={{
                    fontFamily: "inherit",
                    fontWeight: "bold",
                  }}
                >
                  {newData[item]}
                </Descriptions.Item>
              </Descriptions>
            </Col>
          ))}
      </Row>
    </div>
  );
};

export default ReviewSubmit;