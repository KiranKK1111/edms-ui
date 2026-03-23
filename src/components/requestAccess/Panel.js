import { memo, useEffect, useState } from "react";
import { useLocation, withRouter } from "react-router-dom";
import { List, Button, message, Modal, Table, PageHeader } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import Breadcrumb from "../breadcrumb/Breadcrumb";
import { confirm, confirm1 } from "./RequestModal";
import { useDispatch, useSelector } from "react-redux";
import {
  sendData,
  approveReject,
  saveAsDraftRequest,
  deleteSubscription,
} from "../../store/actions/requestAccessActions";
import moment from "moment";
import { useHistory } from "react-router-dom";
import logoRecord from "../../images/source_icon.svg";

import "./panel.css";
import { auditlogSubscriptionLevel } from "../../store/services/ContractService";
import HeaderPanel from "../headerPanel/HeaderPanel";
const Panel = (props) => {
  const [visible, setVisible] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [columns, setColumns] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const location = useLocation();
  const dispatch = useDispatch();
  const formData_99 = useSelector((state) => state.requestAccess);

  const businessRequirements = useSelector(
    (state) => state.requestAccess.businessRequirements
  );
  const usage = useSelector((state) => state.requestAccess.usage);
  const tableInfo = useSelector((state) => state.requestAccess.tableInfo);

  const data = useSelector((state) => state.requestAccess.saveFinalData);
  const { status } = useSelector((state) => state.dataset.subscriptionInfo);
  const { response, dataByIdResponse } = useSelector(
    (state) => state.requestAccess
  );
  const locationObj = {};
  const catalogueObj = location.state.data;

  const { dataFeedLongName } = catalogueObj;

  const history = useHistory();

  const {
    dataFamilyId,
    dataFamilyName,
    noOfLicenses,
    dataCoverage,
    contractExpDate,
    name,
    createdBy,
    licensesUsed,
  } = tableInfo;

  const breadcrumb = [
    { name: "Catalogue", url: "/catalog" },
    {
      name: dataFeedLongName,
      url: {
        pathname: `/catalog/details`,
        state: { data: catalogueObj },
      },
    },
    { name: "Subscription" },
  ];

  const redirect = (val) => {
    setTimeout(() => {
      props.history.push({
        pathname: `/catalog/details`,
        state: {
          data: {
            ...catalogueObj,
            ...(val && {
              subscription: {
                subscriptionStatus: "Pending",
                subscriptionId: val.subscriptionId,
              },
            }),
          },
          activeTab: 1,
        },
      });
    }, 500);
  };
  const showMessage = (res) => {
    if (res.message) {
      if (res.message) message.error(res.message);
    } else {
      if (res.data.subscriptionManagement) {
        message.success(
          `${res.data.subscriptionManagement.subscriptionId} submitted successfully.`
        );
        redirect(res.data.subscriptionManagement);
      } else {
        message.success(`Updated successfully.`);
        redirect();
      }
    }
  }; 
  const submitHandler = async () => {
    setIsSubmitted(true);
    if (props.allowSubmit) {
      let res;
      if (!data.subscriptionId) {
        res = await dispatch(sendData(data));
      } else {
        try {
          res = await dispatch(approveReject(data));
        } catch (err) {
          res = err;
        }
      }

      showMessage(res);
    } else {
      message.warning("Please fill the form!");
    }
    setIsSubmitted(false);
  };

  const saveAsDraft = async () => {
    let finalData = data;

    // If "data" is not available, copy partially saved form information from the store.
    if (!data || !Object.keys(data).length || Object.keys(data).length === 0) {
      let brData,
        usageData = {};

      if (businessRequirements && businessRequirements.length) {
        brData = { ...businessRequirements[0] };
      }

      if (usage && usage.length) {
        usageData = { ...usage[0] };
        usageData.expirationDate = moment(usageData.expirationDate);
        usageData.estRechargeCostPerAnnum = Number.parseInt(
          usageData.estRechargeCostPerAnnum,
          10
        );
      }
      let psid = localStorage.getItem("psid");

      finalData = { ...tableInfo, ...usageData, ...brData };
      finalData.createdBy = psid;
      finalData.userId = psid;
    }

    if (status !== "approved") {
      const res = await dispatch(saveAsDraftRequest(finalData));
      if (res.status === 200) {
        message.success(`Draft Saved successfully.`);
        setTimeout(() => {
          history.push(`/catalog/${locationObj.dataFamilyName}`, {
            data: locationObj,
            activeTab: 6,
          });
        }, 2500);
      }
    }
  };

  const cancelHandler = () => {
    if (location.state.data) {
      props.history.push("/catalog");
    } else {
      props.history.push({
        pathname: `/catalog/details`,
        state: { data: locationObj },
      });
    }
  };

  const deleteHandler = async () => {
    let values = { ...locationObj };
    values["createdBy"] = localStorage.getItem("psid");
    const res = await deleteSubscription(values);
    if (res.status === 200) {
      props.history.push("/catalog");
    }
  };

  /**
   * Method to check if the "Save of Draft" button is enablied.
   * If the below method return "true" enable the button
   *
   * @param {object} locationObj
   */
  const isSaveAsDraftEnabled = (locationObj) => {
    let enabled = false;

    if (locationObj) {
      const subscribedTaskStatus = locationObj.subscribedTaskStatus;
      const subscriptionId = locationObj.subscriptionId;

      // If subscription ID is not available or status is "draft", set "enabled" to "true".
      enabled = !subscriptionId || subscriptionId === "";

      // If not enabled, check if the status is "draft"
      if (enabled === false) {
        enabled =
          !subscribedTaskStatus ||
          subscribedTaskStatus.toLowerCase() === "draft"
            ? true
            : false;
      }

      // If enabled, check for the business requirement form data for some value.
      if (enabled === true) {
        const { businessRequirements } = formData_99;
        enabled = businessRequirements && businessRequirements.length > 0;
      }
    }

    return enabled;
  };

  return (
    <div className="panel">
      <Modal
        title="Audit Log"
        centered
        visible={visible}
        onOk={() => setVisible(false)}
        onCancel={() => setVisible(false)}
        width={1200}
      >
        <Table
          dataSource={dataSource}
          columns={columns}
          pagination={false}
          size="middle"
          scroll={{
            y: 500,
            x: 2000,
          }}
        />
      </Modal>
      <div className="breadcrumb-area">
        <Breadcrumb breadcrumb={breadcrumb} />
        <div className="btn-parent">
          {props.subId === "" ? (
            <>
              <Button type="default" onClick={cancelHandler}>
                Cancel
              </Button>
              
              <Button
                type="primary"
                onClick={submitHandler}
                loading={response.loading}
                disabled={isSubmitted || props.allowSubmit === false}
              >
                Submit
              </Button>
            </>
          ) : null}
        </div>
      </div>
      <PageHeader
        title={
          <div>
            <img
              src={logoRecord}
              alt="Source Icon"
              className="page-header-img pr-8"
            />
            {dataFeedLongName ? dataFeedLongName : "-"}{" "}
          </div>
        }
        ghost={false}
        onBack={() => props.history.push("/catalog")}
        className="pt-0 pb-0"
      >
        <HeaderPanel />
      </PageHeader>
    </div>
  );
};

export default memo(withRouter(Panel));