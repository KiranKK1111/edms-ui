import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { Grid, Tooltip } from "@mui/material";
import { normalText } from "../stringConversion";
import { formDataFn } from "../../store/actions/DatafeedActions";
import { HelpOutlineOutlined as QuestionCircleOutlined } from "@mui/icons-material";

const ReviewSubmit = (props) => {
  const [storeData, setStoreData] = useState();
  const location = useLocation();
  const data = useSelector((state) => state.datafeedInfo.formData);
  const dispatch = useDispatch();
  const revisedData = ({
    documentationLink: url,
    feedDescription: description,
    feedId: dataFeedId,
    feedStatus: status,
    dataFeedConfiguration,
    personalData: personalDataType,
    dataConfidentiality,
    longName,
    shortName,
  }) => ({
    dataFeedId,
    url,
    status,
    dataFeedConfiguration,
    longName,
    shortName,
    dataConfidentiality,
    personalDataType,
    description,
  });

  const newData = revisedData(data);
  const keys = data && Object.keys(newData);

  useEffect(() => {
    if (data && !storeData) {
      const psid = localStorage.getItem("psid");
      const entitlementType = localStorage.getItem("entitlementType");
      let finalValues = {
        dataConfidentiality: data["dataConfidentiality"],
        datasetId: location.state.dataset.datasetId,
        documentationLink: data["url"],
        feedDescription: data["description"],
        feedId: data["datafeedId"],
        feedStatus: data["status"],
        longName: data["longName"],
        personalData: data["personalDataType"],
        shortName: data["shortName"],
        roleName: data["entitlementType"],
        isUpdate: location.state.isUpdate,
      };
      if (location.state.isUpdate === false) {
        finalValues["createdBy"] = psid;
        finalValues["roleName"] = entitlementType;
        finalValues["feedUpdateFlag"] = "N";
      } else {
        finalValues["feedUpdateFlag"] = "Y";
        finalValues["lastUpdatedBy"] = psid;
        finalValues["roleName"] = entitlementType;
      }
      dispatch(formDataFn(finalValues));
      setStoreData(finalValues);
    }
  }, [data]);

  const tooltip = (val) => {
    if (val === "personalDataType") {
      return (
        <Tooltip title="The type of personal data this feed contains.">
          <span style={{ color: "var(--color-primary)" }}>
            {" "}
            <QuestionCircleOutlined />{" "}
          </span>
        </Tooltip>
      );
    }
    if (val === "datasetShortName") {
      return (
        <Tooltip title="The dataset that this feed is under.">
          <span style={{ color: "var(--color-primary)" }}>
            <QuestionCircleOutlined />{" "}
          </span>
        </Tooltip>
      );
    }
    return null;
  };

  return (
    <div className="review-submit" id="main">
      <h3 style={{ marginLeft: "1rem" }}>General Details</h3>
      <Grid container spacing={1}>
        {keys &&
          keys.map((item, i) => (
            <React.Fragment key={i}>
              {item !== "url" ? (
                <Grid size={item !== "description" ? 4 : 12}>
                  {item !== "personalDataType" ? (
                    item !== "dataFeedConfiguration" ? (
                      <div style={{ marginLeft: "1rem", marginTop: "0.5rem" }}>
                        <span
                          style={{
                            fontFamily: "inherit",
                            fontWeight: "bold",
                          }}
                        >
                          {item === "datafeedId"
                            ? "Data Feed ID"
                            : normalText(item).replace("Id", "ID")}
                          :{" "}
                        </span>
                        <h4 style={{ textAlign: "justify" }}>
                          {newData[item]}
                        </h4>
                      </div>
                    ) : (
                      <span role="link" style={{ marginLeft: "1rem", fontSize: 16, cursor: "pointer", color: "var(--color-primary)" }}>
                        {normalText(item)}
                      </span>
                    )
                  ) : (
                    <>
                      <span className="label-review" style={{ marginLeft: 16 }}>
                        {normalText(item).replace("Id", "ID")} {tooltip(item)} :
                      </span>
                      {newData[item]}
                    </>
                  )}
                </Grid>
              ) : null}
            </React.Fragment>
          ))}
      </Grid>
    </div>
  );
};

export default ReviewSubmit;
