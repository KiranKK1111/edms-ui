import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Row, Col, Divider } from "antd";
import Headers from "../../../pages/header/Header";
import { schedulerDatabase } from "../../../store/actions/SourceConfigActions";
import { normalText } from "../../stringConversion";
import moment from "moment";
const SchedulerDetails = (props) => {
  const [schData, setSchData] = useState([]);
  const params = useParams();

  useEffect(() => {
    const getData = async () => {
      const response = await schedulerDatabase();
      if (!response.message) {
        const data = response.data.recurrenceScheduler.filter(
          (n) => n.licenseId === params.id
        );
        setSchData(data);
      }
    };
    getData();
  }, []);
  let schedulerKeys;
  let schedulerFieldInfo;
  if (schData.length > 0) {
    schedulerKeys = Object.keys(schData[0]);
    schedulerFieldInfo = schData[0];
    schedulerFieldInfo["startDate"] = moment(
      schedulerFieldInfo["startDate"]
    ).format("DD-MM-YYYY");
    schedulerFieldInfo["endDate"] = moment(
      schedulerFieldInfo["endDate"]
    ).format("DD-MM-YYYY");
    schedulerFieldInfo["batchKickOffTime"] = moment(
      schedulerFieldInfo["batchKickOffTime"]
    ).format("HH:mm:ss");
  }

  return (
    <div>
      <Headers />
      <div className="content-area">
        <div className="content-wrapper">
          <div className="review-submit">
            <h3 style={{ paddingBottom: 0 }}>Scheduler Details</h3>
            <Divider />
            <Row>
              {schData.length > 0 &&
                schedulerKeys.map((item, i) => (
                  <Col span={12} key={i} style={{ paddingBottom: "12px" }}>
                    <span className="label-review">{normalText(item)}:</span>
                    {schedulerFieldInfo[item]}
                  </Col>
                ))}
            </Row>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulerDetails;