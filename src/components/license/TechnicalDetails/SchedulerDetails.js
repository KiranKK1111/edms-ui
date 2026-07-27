import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Grid, Divider } from "@mui/material";
import { schedulerDatabase } from "../../../store/actions/SourceConfigActions";
import { normalText } from "../../stringConversion";
import dayjs from "../../../design-system/dayjs";
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
    schedulerFieldInfo["startDate"] = dayjs(
      schedulerFieldInfo["startDate"]
    ).format("DD-MM-YYYY");
    schedulerFieldInfo["endDate"] = dayjs(
      schedulerFieldInfo["endDate"]
    ).format("DD-MM-YYYY");
    schedulerFieldInfo["batchKickOffTime"] = dayjs(
      schedulerFieldInfo["batchKickOffTime"]
    ).format("HH:mm:ss");
  }

  return (
    <div>
      <div className="content-area">
        <div className="content-wrapper">
          <div className="review-submit">
            <h3 style={{ paddingBottom: 0 }}>Scheduler Details</h3>
            <Divider sx={{ my: 1 }} />
            <Grid container spacing={2}>
              {schData.length > 0 &&
                schedulerKeys.map((item, i) => (
                  <Grid size={6} key={i} sx={{ pb: 1.5 }}>
                    <span className="label-review">{normalText(item)}:</span>
                    {schedulerFieldInfo[item]}
                  </Grid>
                ))}
            </Grid>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulerDetails;