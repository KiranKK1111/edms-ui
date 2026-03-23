import { HomeOutlined } from "@ant-design/icons";
import {
  Breadcrumb,
  Button,
  Layout,
  message,
  Modal,
  PageHeader,
  Tabs,
  Alert,
} from "antd";
import "antd/dist/antd.css";
import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import OrderSteps from "../../components/license/step/OrderSteps";
import {
  startAddLicense,
  startDeleteLicense,
  cleanResponse,
} from "../../store/actions/licenseAction";
import { schedulerClear } from "../../store/actions/SourceConfigActions";
import Headers from "../header/Header";
import "./license.css";
import moment from "moment";

const { Content } = Layout;
const { TabPane } = Tabs;

function callback(key) {}
let state = "";

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ID: "",
      loadings: false,
      isFormSaved: false,
      deleteModal: false,
      modalStatus: false,
      isFormValidState: false,
    };
    this.isSaveAsDraft = false;
  }

  isFormValid = (status) => {
    if (this.state.isFormValidState !== status) {
      this.setState({ isFormValidState: status });
    }
  };

  savedData = (data, isSaveAsDraft) => {
    state = data;
    this.isSaveAsDraft = isSaveAsDraft;
  };
  save = (status) => {
    if (status) {
      let userNameUpdated = localStorage.getItem("psid");
      let userRoleUpdated = localStorage.getItem("entitlementType");
      let obj = state;
      obj.taskStatus = status === "DRAFT" ? "DRAFT" : "PENDING";
      obj.createdBy = userNameUpdated;
      obj.roleName = userRoleUpdated;
      obj.allowedUserTypes = state.allowedUserTypes.toString();
      let agreementRecord = localStorage.getItem("agRecord");
      agreementRecord = JSON.parse(agreementRecord);
      const path = this.props.location.pathname.includes("addLicense");
      this.props.licenseReq.licenseDetailsRequirements[0].expirationDate =
        moment.utc(
          this.props.licenseReq.licenseDetailsRequirements[0].expirationDate
        );
      const {
        NoOfLicencePurchased,
        NoOfLicenceUsed,
        dataProcurementType,
        expirationDate,
        licenceType,
        licenceValue,
        longName,
        shortName,
        licenceId,
      } = this.props.licenseReq.licenseDetailsRequirements[0];

      let expirationDateVar = moment
        .utc(new Date(expirationDate))
        .format("YYYY-MM-DD[T]HH:mm:ss");
      let varDate = moment(new Date(expirationDate)).format("YYYY-MM-DD");
      let varTime = moment
        .utc(new Date(expirationDate))
        .format("[T]HH:mm:ss")
        .toString();
      let varDateTime = varDate + varTime;
      let finalValues = {
        licenseAgreementId: agreementRecord.agreementId,
        licenseCcy: "USD",
        licenseCreatedBy: path ? userNameUpdated : "",
        roleName: userRoleUpdated,
        licenseDataProcurementType: dataProcurementType,
        licenseExpiryDate: varDateTime,
        licenseId: path ? "" : licenceId,
        licenseLastUpdatedBy: path ? "" : userNameUpdated,
        licenseLimitations: this.props.licenseReq.support[0].licenceLimitations,
        licenseLongName: longName,
        licenseNoInheritanceFlag: "N",
        licenseNumberOfLicensesPurchaised: NoOfLicencePurchased,
        licenseNumberOfLicensesUsed: NoOfLicenceUsed,
        licenseShortName: shortName,
        licenseStatus:
          this.props.licenseReq.licenseDetailsRequirements[0].status,
        licenseType: licenceType,
        licenseUpdateFlag: path ? "N" : "Y",
        licenseValuePerMonth: licenceValue,
        isUpdate: path ? false : true,
      };

      if (status === "SAVE" && this.state.isFormValidState) {
        this.setState({ loadings: true });
        this.props.createLicense(finalValues);
      } else if (status === "DRAFT") {
        this.setState({ loadings: true });
      }
    }
  };
  componentDidMount() {
    this.props.cleanRes();
  }
  componentWillReceiveProps(props) {
    const data = props.licensereceiveddata.response;
    if (
      data &&
      data.statusMessage &&
      data.statusMessage.message.includes("License creation")
    ) {
      this.setState({ loadings: false, isFormSaved: true });
      message.success(` The Licence, ${data.license.licenseId} has been successfully submitted and
         is pending for approval!`);
      this.setState({ ID: data.license.licenseId });
      this.props.history.push("/masterData");
    } else if (
      data &&
      data.statusMessage &&
      data.statusMessage.message.includes("License updation")
    ) {
      this.setState({ loadings: false, isFormSaved: true });
      message.success(` The Licence has been successfully updated!`);
      this.props.history.push("/masterData");
    }
  }

  cancelHandler = () => {
    this.props.history.push("/masterData");
  };

  deleteHandler = () => {
    let self = this;
    Modal.confirm({
      title: (
        <h3>
          <b>Delete Licence ? </b>{" "}
        </h3>
      ),
      content: `This will delete the Licence under this contract.
      All subscribers will be impacted. Are you sure you want to proceed?.`,
      onOk() {
        self.props.deleteLicense({
          licenseId: self.props.match.params.id,
          taskStatus: state.taskStatus,
          licenseName: state.licenseName,
          createdBy: localStorage.getItem("psid"),
        });
        self.props.history.push("/masterData");
      },
    });
  };

  modalHandaler = (value) => {
    this.setState({ modalStatus: true }, () =>
      this.setState({ modalStatus: false })
    );
  };

  render() {
    let btnDisabled = true;
    if (this.props.match.params.id) btnDisabled = false;

    let tabEnable = true;
    if (this.props.match.params.id) {
      tabEnable = false;
    }
    let disableDelete = true;
    if (this.props.match.params.id) {
      disableDelete = false;
    }
    const path = this.props.location.pathname.includes("addLicense");

    return (
      <div>
        <Headers />
        <Layout>
          <Content>
            <div className="rectangleone">
              <div
                style={{
                  display: "flex",
                  marginBottom: "2px",
                  justifyContent: "space-between",
                }}
              >
                <Breadcrumb style={{ margin: "16px 0" }}>
                  <Breadcrumb.Item>
                    <Link to="/catalog">
                      {" "}
                      <HomeOutlined />{" "}
                    </Link>
                  </Breadcrumb.Item>
                  <Breadcrumb.Item>
                    <Link to="/masterData">Master Data </Link>{" "}
                  </Breadcrumb.Item>
                  <Breadcrumb.Item>
                    <Link to={`/masterData`}>
                      {this.props.match.params.contractId
                        ? this.props.match.params.contractId &&
                          this.props.match.params.contractId.includes("%2F")
                          ? this.props.match.params.contractId.replaceAll(
                              "%2F",
                              "/"
                            )
                          : this.props.match.params.contractId
                        : this.props.match.params.id &&
                          this.props.match.params.id.includes("%2F")
                        ? this.props.match.params.id.replaceAll("%2F", "/")
                        : this.props.match.params.id}
                    </Link>
                  </Breadcrumb.Item>
                  <Breadcrumb.Item>
                    {path ? "Add Licence" : "Edit Licence"}
                  </Breadcrumb.Item>
                </Breadcrumb>
                <div>
                  <Button type="default" onClick={() => this.cancelHandler()}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => this.save("SAVE")}
                    type="primary"
                    style={{ margin: "11px 2px" }}
                    loading={this.isSaveAsDraft && this.state.loadings}
                    disabled={
                      this.state.loadings ||
                      !this.state.isFormValidState ||
                      (this.props.location.state &&
                        this.props.location.state.record &&
                        this.props.location.state.record.licenseUpdateFlag &&
                        this.props.location.state.record.licenseUpdateFlag.toLowerCase() ===
                          "n" &&
                        this.props.location.state.record.licenseStatus &&
                        this.props.location.state.record.licenseStatus.toLowerCase() ===
                          "pending")
                    }
                  >
                    Submit
                  </Button>
                </div>
              </div>

              <div>
                <PageHeader
                  title={
                    this.props.match.params.id ? "Edit Licence" : "Add Licence"
                  }
                  ghost={false}
                  onBack={() => this.props.history.push("/masterData")}
                  className="pt-20 pb-0  home-page"
                ></PageHeader>
              </div>
              {this.props.location.state &&
              this.props.location.state.record &&
              this.props.location.state.record.licenseStatus.toLowerCase() ===
                "pending" ? (
                <div style={{ marginTop: "40px" }}>
                  <Alert
                    message="This Licence is currently under review. You will be able to add Datasets once the Licence is approved and the status is “Active” or “Planned”."
                    type="warning"
                    showIcon
                  />
                </div>
              ) : null}
              <div
                style={{
                  marginTop:
                    this.props.location.state &&
                    this.props.location.state.record &&
                    this.props.location.state.record.licenseStatus.toLowerCase() ===
                      "pending"
                      ? "10px"
                      : "50px",
                }}
              >
                <OrderSteps
                  savedData={(data, mode) => this.savedData(data, mode)}
                  licenseID={this.state.ID}
                  modalStatus={this.state.modalStatus}
                  isFormValid={(status) => this.isFormValid(status)}
                />
              </div>
            </div>
          </Content>
        </Layout>
      </div>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    licensereceiveddata: state.license,
    licenseReq: state.licenseReq,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    createLicense: (data) => dispatch(startAddLicense(data)),
    cleanRes: () => dispatch(cleanResponse()),
    deleteLicense: (data) => dispatch(startDeleteLicense(data)),
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(Home);