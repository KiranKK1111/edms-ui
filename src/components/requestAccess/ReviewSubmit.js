import { useEffect, useState, memo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { Row, Col, Divider } from "antd";
import { getCustomLabels } from "../stringConversion";
import { saveFinalData } from "../../store/actions/requestAccessActions";
import DisplayTC from "./DisplayTC";
import lodash from 'lodash';

const ReviewSubmit = (props) => {
  const [finalData, setFinalData] = useState({});
  const dispatch = useDispatch();
  const data = useSelector((state) => state.requestAccess);
  const {
    businessRequirements,
    response,
  } = data;

  let businessResponse = Object.assign({}, ...businessRequirements);

  const brResult = lodash.omit(businessResponse, "vendorRequest");
  let brData = Object.keys(brResult);
  brData = brData.filter((item) => item!="reasonForSubscription");
  const location = useLocation();

  const psid = localStorage.getItem("psid");
  const userRoleUpdated = localStorage.getItem("entitlementType");

  let finalValues = {
    subscriptionId: brResult["subscriptionId"],
    clarityId: brResult["clarityId"],
    ...(!brResult["subscriptionId"] && {
      createdBy: psid,
    }),
    lastUpdatedBy: brResult["subscriptionId"] && psid,
    dataFeedId: location.state.data.dataFeedId,
    department: brResult["department"],
    licensesSubscribed: parseInt(brResult["numberOfEndUserSubscriptions"]),
    projectName: brResult["projectName"],
    reason: brResult["reasonForSubscription"],
    requester: psid,
    subscriber: brResult["subscriptionFor"],
    subscriptionStatus: brResult["status"],
    subscriptionType: brResult["subscriptionType"],
    termsAndConditions: "Approved",
    subscriptionUpdateFlag: brResult["subscriptionId"].length ? "Y" : "N",
    subscriptionShortName: location.state.data.dataFeedShortName,
    roleName: userRoleUpdated,
    subscriptionVendorRequest: businessResponse["vendorRequest"],
    subscriptionTermsConditionsOla: !props.subForFlag ? "Approved" : "Not Approved",
    subscriptionTermsConditionsVendorRequest: brResult["vendorRequest"] === "Y" ? "Approved" : "Not Approved",
    sserviceAccountName: brResult["serviceAccountName"] ? brResult["serviceAccountName"] : null,
  };

  useEffect(() => {
    setFinalData(finalValues);
  }, []);

  useEffect(() => {
    dispatch(saveFinalData(finalValues));
  }, [finalData]);

  useEffect(() => {}, [response]);

  return (
    <div className="review-submit">
      <h3>Business Requirements </h3>

      <Row gutter={[2, 4]}>
        {brData.map((item, i) => (
          <Col span={8} key={i}>
            <span className="label-review">
              {getCustomLabels(item)} :
            </span>
            {brResult[item]}
          </Col>
        ))}
      </Row>
      <Row>
        <Col span={24}>
          <span className="label-review">Reason for Subscription :</span>
          {brResult["reasonForSubscription"]}
        </Col>
      </Row>

      { props.vendorRequest ? <> <Divider/>
        <h4 style={{fontWeight: "bold"}}>On-Demand Vendor request</h4>
        <div style={{"display": "flex"}}>
        <h4 style={{"paddingRight": "5%"}}>Enable On-Demand Vendor request : {props.vendorRequest==='Y' ? "Yes" : "No"}</h4>
        </div></> : null }
      <Divider />
      <DisplayTC view={props.view} subForFlag={props.subForFlag} vendorRequest={props.vendorRequest}/>
      <br />
    </div>
  );
};

export default memo(ReviewSubmit);