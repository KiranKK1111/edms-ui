import { HomeOutlined } from "@ant-design/icons";
import {
  Alert,
  Breadcrumb,
  Button,
  message,
  PageHeader,
  Skeleton,
  Modal,
  Table,
} from "antd";
import { lazy, Suspense, useEffect, useState, useLayoutEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, Link } from "react-router-dom";
import {
  selectedContract,
  sendData,
  setContracts,
  startDeleteContract,
  startGetContracts,
  upload,
  resetState,
} from "../../store/actions/contractAction";
import { startGetVendors } from "../../store/actions/VendorActions";
import Header from "../header/Header";
import "./addContract.css";
import { useParams } from "react-router-dom";
import { connect } from "react-redux";
import { auditlogVendorOverview } from "../../store/services/ContractService";

const { confirm } = Modal;

const RequestFormSteps = lazy(() =>
  import("../../components/addContract/RequestFormSteps")
);

const AddContract = (props) => {
  const [current] = useState(0);
  const [subId] = useState("");
  const [isFormSaved, setIsFormSaved] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const history = useHistory();
  const [isVendorListLoaded, setIsVendorListLoaded] = useState(false);
  const params = useParams();
  const dispatch = useDispatch();
  const [dataSource, setDataSource] = useState([]);
  const [visible, setVisible] = useState(false);
  const [columns, setColumns] = useState([]);
  const [btnDisable, setBtnDisable] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const data = useSelector((state) => state.contract.saveFinalData);
  const contractsList = useSelector((state) => state.contract.data);
  const contractDetails = useSelector(
    (state) =>
      state.contract.contractDetails && state.contract.contractDetails[0]
  );
  const reduxData = useSelector((state) => state.contract);
  const licenseInfo = useSelector((state) => state.license);
  let ContractDeleteMessage;
  const sel =
    reduxData &&
    reduxData.selectedContract &&
    reduxData.selectedContract[0] &&
    reduxData.selectedContract[0].agreementStatus;

  useLayoutEffect(() => {
    //dispatch(resetState());
  }, []);
  useEffect(() => {
    if (sel && sel.toString().toLowerCase() === "pending") {
      setIsFormSaved(true);
    }
  }, [sel]);

  const url = history.location.pathname;
  const contains = url.includes("modifyAgreement");
  useEffect(() => {
    const res = async () => {
      let lastVar = "";
      if (contains) {
        let arrVars = url.split("/");
        lastVar = arrVars[2];
        setBtnDisable(lastVar);
      }
    };
    res();
  }, []);

  useEffect(() => {
    if (!isVendorListLoaded) {
      dispatch(startGetContracts());
      dispatch(startGetVendors());
      setIsVendorListLoaded(true);
    }
    const selID = localStorage.getItem("agId");
    if (contains) {
      const selectedContractItem = contractsList[0].filter((item) => {
        return item.agreementId === selID;
      });
      dispatch(selectedContract(selectedContractItem));
    } else {
      dispatch(selectedContract([]));
      dispatch(upload([]));
    }
  }, [setIsVendorListLoaded, isVendorListLoaded, dispatch, contractsList]);

  const stepsLength = (value) => {
    setIsFormValid(value);
    return value;
  };

  const submitHandler = async () => {
    setIsSubmitted(true);

    const isAllowed = current === stepsLength.length - 1 ? true : false;
    if (isAllowed) {
      let userNameUpdated = localStorage.getItem("psid");
      const isUpdate = contains ? true : false;
      data.isUpdate = isUpdate;

      const res = await dispatch(sendData(data));

      if (res && res.data && res.data.agreement) {
        message.success(
          `Form agreement Id ${res.data.agreement.agreementId} submitted successfully!`
        );
        setIsFormSaved(true);
        history.push("/masterData");
      } else if (
        res &&
        res.data &&
        res.data.statusMessage &&
        res.data.statusMessage.code === 200
      ) {
        message.success(`Form updated successfully!`);
        setIsFormSaved(true);
        history.push("/masterData");
      }
    } else {
      message.warning("Please fill the form!");
    }
    setIsSubmitted(false);
  };

  let requestAccessPage;
  if (subId !== "") {
    requestAccessPage = <Skeleton fallback={<div>Loading...</div>}></Skeleton>;
  } else {
    requestAccessPage = (
      <Suspense fallback={<div>Loading...</div>}>
        <RequestFormSteps
          contractDetails={contractDetails}
          stepsLength={stepsLength}
        />
      </Suspense>
    );
  }

  const deleteHandler = () => {
    let count = 0;
    if (
      licenseInfo &&
      licenseInfo.licenseList &&
      licenseInfo.licenseList.length
    ) {
      count = licenseInfo.licenseList.filter(
        (license) => license.contractId === params.id
      ).length;
      if (count > 0) {
        ContractDeleteMessage = `There are Licences under this Contract.
          To complete this action, Please ensure there are no licences under this contract.`;
      } else {
        ContractDeleteMessage = `Your request to Delete Contract will be submitted for approval. 
    Do you want to proceed ?`;
      }
    }
    let selectedContractItem;
    if (params.id && contractsList.length) {
      selectedContractItem = contractsList[0].filter((item) => {
        return item.agreementId === params.id;
      });
    }
    const {
      contractId,
      contractName,
      licenses,
      taskStatus,
      vendorId,
    } = selectedContractItem[0];
    Modal.confirm({
      title: (
        <h3>
          <b>Delete Contract ? </b>{" "}
        </h3>
      ),
      content: ContractDeleteMessage,
      onOk() {
        if (count === 0) {
          dispatch(
            startDeleteContract({
              contractId,
              contractName,
              licenses,
              taskStatus,
              vendorId,
              createdBy: localStorage.getItem("psid"),
            })
          );
          history.push("/masterData");
        }
      },
    });
  };

  const navigateToAddLicense = () => {
    history.push("license");
  };

  const cancelHandler = () => {
    history.push("/masterData");
  };

  function warning() {
    confirm({
      title: "Deactivate the Agreement?",
      content:
        "This will deactivate the agreement. Are you sure you want to proceed?",
      onOk() {
        const sendRequest = async () => {
          const data = {
            ...reduxData.selectedContract[0],
            agreementUpdateFlag: "Y",
            agreementStatus: "Inactive",
            agreementLastUpdatedBy: localStorage.getItem("psid"),
            isUpdate: true,
          };
          const res = await dispatch(sendData(data));
          if (
            res &&
            res.data.statusMessage &&
            res.data.statusMessage.code === 200
          ) {
            message.success(`Form updated successfully!`);
            history.push("/masterData");
          }
        };
        sendRequest();
      },
      okButtonProps: {
        type: "primary",
        danger: true,
      },
      okText: "Deactivate",
    });
  }

  return (
    <div>
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
      <Header />
      <div className="header-one">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "2px",
          }}
        >
          <Breadcrumb style={{ margin: "16px 0" }}>
            <Breadcrumb.Item>
              <Link to="/catalog">
                <HomeOutlined />
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link to="/masterData">Entities</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link to="/masterData">
                {props.match.params.vendorId
                  ? props.match.params.vendorId
                  : props.match.params.id}{" "}
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {/* {params.id ? "Edit Agreement" : "Add Agreement"} */}
              {params.vendorId ? "Edit Agreement" : "Add Agreement"}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div>
            <Button type="default" onClick={() => cancelHandler()}>
              Cancel
            </Button>
            <Button
              onClick={submitHandler}
              type="primary"
              style={{ margin: "11px 2px" }}
              disabled={!isFormValid || isFormSaved || isSubmitted}
            >
              Submit
            </Button>
          </div>
        </div>
        <div>
          <PageHeader
            // title={params.id ? "Edit Agreement" : "Add Agreement"}
            title={params.vendorId ? "Edit Agreement" : "Add Agreement"}
            ghost={false}
            onBack={() => history.push("/masterData")}
            className="pt-10 pb-0  home-page"
          ></PageHeader>
        </div>
      </div>
      {isFormSaved ? (
        <Alert
          message="This Agreement is currently under review. You will be able to add Licences once the Agreement is approved and the status is “Active” or “Planned”."
          banner
          className="contract-banner"
        />
      ) : null}

      <div className="content-area">
        <div className="content-wrapper">{requestAccessPage}</div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    selectedContract: state.contract.selectedContract,
  };
};

export default connect(mapStateToProps)(AddContract);