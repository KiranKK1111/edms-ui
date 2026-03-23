import { QuestionCircleOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  Form,
  Input,
  Row,
  Select,
  Checkbox,
  DatePicker,
} from "antd";
import "antd/dist/antd.css";
import React, { createRef, useEffect, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { licenseDetails } from "../../../store/actions/licensedataAction";
import { bindData } from "../bindData/bindData";
import "./licensedetails.css";
import countryList from "country-list";
import { useParams, useLocation } from "react-router-dom";
import moment from "moment";
import { getLicenseCountById } from "../../../store/services/LicenseService";

const { Option } = Select;
const layout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 16,
  },
};
const { TextArea } = Input;

const Licensedetails = (props) => {
  const dispatch = useDispatch();
  const reduxData = useSelector((state) => state.licenseReq);
  const reduxData1 = useSelector((state) => state.license);
  const params = useParams();
  const formRef = createRef();
  const button = createRef();
  const { formData } = props;
  let countryListNew = countryList.getCodeList();
  countryListNew = { GO: "Global", ...countryListNew };
  const [shortNameFound, setShortNameFound] = useState(false);

  const [longNameFound, setLongNameFound] = useState(false);
  const [licenseName] = useState(props.licenseName);
  const [contractName] = useState(props.contractName);
  const [dataCoverage] = useState(props.dataCoverage);
  const [licenseType] = useState(props.licenseType);

  const [licenseCost] = useState(props.licenseCost);
  const [licenseid] = useState(props.licenseid);
  const [nameFound, setNameFound] = useState(false);
  const [checked, setChecked] = useState(false);
  const location = useLocation();
  const [form] = Form.useForm();
  let formFinalData = [];
  const path = location.pathname.includes("addLicense");
  const [noOfLicensesPurchased, setNoOfLicensesPurchased] = useState("");

  const onFinish = (values) => {
    if (!shortNameFound && !longNameFound) {
      formFinalData.push(values);
      if (formFinalData.length === 1) {
        dispatch(licenseDetails(formFinalData));
        props.next(true);
      }
    }
  };

  useEffect(() => {
    let agreementRecord = localStorage.getItem("agRecord");
    agreementRecord = JSON.parse(agreementRecord);
    const ddd = moment("2099-12-31").format("YYYY-MM-DD[T]HH:mm:ss");
    const existingDate = moment(agreementRecord.agreementExpiryDate).format(
      "YYYY-MM-DD[T]HH:mm:ss"
    );
    formRef.current.setFieldsValue({
      "Subscription ID": "e6cddc38-674c-4c85-860d-5b2a873fd667",
      contractId: props.contractId,
      licenseStatus: props.licenseStatus,
      expirationDate:
        agreementRecord.agreementNoExpiryFlag.toLowerCase() === "y"
          ? moment.utc(ddd)
          : moment.utc(existingDate),
    });
    let data;
    if (
      reduxData.licenseDetailsRequirements &&
      reduxData.licenseDetailsRequirements.length
    ) {
      data = reduxData.licenseDetailsRequirements;
    } else if (location.state && location.state.record) {
      const {
        licenseId: licenceId,
        licenseLongName: longName,
        licenseShortName: shortName,
        licenseType: licenceType,
        licenseDataProcurementType: dataProcurementType,
        licenseValuePerMonth: licenceValue,
        licenseExpiryDate: expirationDate,
        licenseNumberOfLicensesPurchaised: NoOfLicencePurchased,
        licenseNumberOfLicensesUsed: NoOfLicenceUsed,
        licenseStatus: status,
      } = location.state.record;
      data = [
        {
          licenceId,
          longName,
          shortName,
          licenceType,
          dataProcurementType,
          licenceValue,
          expirationDate,
          NoOfLicencePurchased,
          NoOfLicenceUsed,
          status,
        },
      ];
    } else {
      data = [{ NoOfLicenceUsed: 0, status: "Pending" }];
    }
    bindData(data, formRef.current);
  }, [reduxData1.selectedLicense, location]);

  useEffect(() => {
    if (props.contractId) {
      formRef.current.setFieldsValue({
        contractId: props.contractId,
        licenseStatus: props.licenseStatus,
      });
      if (formRef.current && formRef.current.getFieldValue("licenceName")) {
        handleDuplicateChange(props.contractId);
      }
    }
    if (formData) {
      button.current.click();
      props.next(false);
    }
  }, [formData, formRef]);

  const onRequiredTypeChange = ({ requiredMark }) => {};

  /*const checkValidation = (rule, value) => {
    const RGX = /^(?:[A-Za-z]+)(?:[A-Za-z0-9 ]*)$/;

    if (RGX.test(value)) {
      return Promise.resolve("");
    } else {
      const msg = "Invalid characters";
      return Promise.reject(msg);
    }
  };*/

  const handleDuplicateChange = (e) => {
    let inputValue = "";
    if (e && e.target) {
      inputValue = e.target.value;
    } else {
      inputValue =
        formRef.current && formRef.current.getFieldValue("licenseName");
    }

    if (props.licenseList) {
      if (props.contractId && props.licenseList) {
        let licenseList = props.licenseList.filter((item) => {
          const id = typeof e === "string" ? e : props.contractId;
          return item.contractId === id;
        });
        if (licenseList && licenseList.length) {
          licenseList.find((ele) => {
            if (ele.licenseName.toLowerCase() === inputValue.toLowerCase()) {
              if (params.id) {
                const status = props.isLicenseNameChanged ? true : false;
                setNameFound(status);
              } else {
                setNameFound(true);
              }
              if (typeof e !== "string") {
                props.handleChange(e);
              }
              return true;
            } else {
              setNameFound(false);
              if (typeof e !== "string") {
                props.handleChange(e);
              }
              return false;
            }
          });
        } else {
          setNameFound(false);
        }
      } else {
        setNameFound(false);
      }
    } else {
      setNameFound(false);
    }
  };

  const prefixSelector = (
    <Select defaultValue="USD">
      <Option value="USD">USD</Option>
    </Select>
  );

  const compareDate = (e) => {
    let agreementRecord = localStorage.getItem("agRecord");
    agreementRecord = JSON.parse(agreementRecord);
    const date1 = moment(e).format("YYYY-MM-DD");
    const date2 = agreementRecord.agreementExpiryDate
      ? moment(agreementRecord.agreementExpiryDate).format("YYYY-MM-DD")
      : "";

    if (!moment(date1).isSame(date2)) {
      setChecked(true);
    } else {
      setChecked(false);
    }
  };
  const handleNameCheck = (e) => {
    let licenseId = document.getElementsByClassName("LicenseId");
    let inputValue = e.target.value;

    let agreementRecord = localStorage.getItem("agRecord");
    agreementRecord = JSON.parse(agreementRecord);

    let agreementId = agreementRecord.agreementId;
    inputValue = inputValue.trim();

    let licenseUnderAgreement = props.licenseList.filter((eachLicense) => {
      if (licenseId && licenseId.length > 0) {
        return (
          eachLicense.licenseAgreementId === agreementId &&
          eachLicense.licenseId != licenseId[0].value
        );
      } else {
        return eachLicense.licenseAgreementId === agreementId;
      }
    });
    if (licenseUnderAgreement && licenseUnderAgreement.length) {
      let result = licenseUnderAgreement.filter((eachLicense) => {
        const licenseShortName = eachLicense.licenseShortName;
        return licenseShortName === inputValue;
      });
      if (result && result.length) {
        setShortNameFound(true);
      } else {
        setShortNameFound(false);
      }
    }
  };

  const handleLongNameCheck = (e) => {
    let licenseId = document.getElementsByClassName("LicenseId");
    let inputValue = e.target.value;

    let agreementRecord = localStorage.getItem("agRecord");
    agreementRecord = JSON.parse(agreementRecord);

    let agreementId = agreementRecord.agreementId;
    inputValue = inputValue.trim();

    let licenseUnderAgreement = props.licenseList.filter((eachLicense) => {
      if (licenseId && licenseId.length > 0) {
        return (
          eachLicense.licenseAgreementId === agreementId &&
          eachLicense.licenseId != licenseId[0].value
        );
      } else {
        return eachLicense.licenseAgreementId === agreementId;
      }
    });
    if (licenseUnderAgreement && licenseUnderAgreement.length) {
      let result = licenseUnderAgreement.filter((eachLicense) => {
        const licenseLongName = eachLicense.licenseLongName;
        return licenseLongName === inputValue;
      });
      if (result && result.length) {
        setLongNameFound(true);
      } else {
        setLongNameFound(false);
      }
    }
  };

  const handleLicenseTypeChange = (e) => {
    if (e === "Enterprise Licence")
      form.setFieldsValue({ NoOfLicencePurchased: "Unlimited" });
    else if (e === "User Licence")
      form.setFieldsValue({ NoOfLicencePurchased: "" });
  };

  useEffect(() => {
    if (!path) {
      getLicenseCountById(form.getFieldValue("licenceId")).then((res) => {
        if (res && res.data && res.data.licenseListCount >= 0) {
          form.setFieldsValue({ NoOfLicenceUsed: res.data.licenseListCount });
        }
      });
    }
  }, []);

  /*useEffect(() => {
    if (form.getFieldValue("licenceType") === "Enterprise Licence") {
      form.setFieldsValue({ NoOfLicencePurchased: "Unlimited" });
    }
  });*/

  useEffect(() => {
    if (
      reduxData.licenseDetailsRequirements &&
      reduxData.licenseDetailsRequirements.length
    ) {
      compareDate(reduxData.licenseDetailsRequirements.expirationDate);
    } else if (location.state && location.state.record) {
      const date = location.state.record.licenseExpiryDate;
      compareDate(date);
    }
  }, [reduxData, location]);

  return (
    <div>
      <Form
        form={form}
        {...layout}
        onValuesChange={onRequiredTypeChange}
        ref={formRef}
        onFinish={onFinish}
      >
        <Row gutter={[72, 0]}>
          <Col span={12}>
            <Form.Item label="Licence ID" name="licenceId">
              <Input
                name="licenceId"
                placeholder="Licence ID will be generated after submission"
                disabled
                className="LicenseId"
              />
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={12}>
            <Form.Item
              label="Licence Value"
              name="licenceValue"
              rules={[
                { required: true, message: "Licence value is mandatory !" },
                {
                  pattern: new RegExp("^[0-9]+$"),
                  message: "Only numbers and positive numbers are allowed",
                },
              ]}
            >
              <Input
                addonBefore={prefixSelector}
                style={{ width: "100%" }}
                defaultValue={licenseCost}
                placeholder="Enter Licence Value"
                name="licenceValue"
                onChange={props.handleChange}
              />
            </Form.Item>
          </Col>

          <Col className="gutter-row" span={12}>
            <Form.Item
              label="Long Name"
              name="longName"
              rules={[
                {
                  required: true,
                  message: "Long name is mandatory!",
                },
              ]}
              {...(longNameFound && {
                hasFeedback: true,
                help: longNameFound
                  ? "Licence name already exists under this agreement"
                  : "",
                validateStatus: longNameFound === false ? "success" : "error",
              })}
            >
              <Input
                placeholder="Enter Long Name"
                name="longName"
                type="text"
                onBlur={handleLongNameCheck}
              />
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={12}>
            <Form.Item
              label={<span className="asterisk-custom">Expiration Date</span>}
              style={{ padding: 0, margin: 0 }}
            >
              <Row>
                <Col span={12}>
                  <Form.Item
                    name="expirationDate"
                    rules={[
                      {
                        required: true,
                        message: "Please select a expiration date",
                      },
                    ]}
                  >
                    <DatePicker
                      name="expirationDate"
                      format="DD/MMM/YYYY"
                      style={{ width: "100%" }}
                      onChange={compareDate}
                    />
                  </Form.Item>
                </Col>
                <Col span={12} style={{ textAlign: "right" }}>
                  <Form.Item>
                    <Checkbox
                      style={{ marginRight: "5px" }}
                      checked={checked}
                    />
                    Different from Agreement
                  </Form.Item>
                </Col>
              </Row>
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={12}>
            <Form.Item
              label="Short Name"
              name="shortName"
              rules={[
                {
                  required: true,
                  message: "Short name is mandatory!",
                },
              ]}
              {...(shortNameFound && {
                hasFeedback: true,
                help: shortNameFound
                  ? "Licence name already exists under this agreement"
                  : "",
                validateStatus: shortNameFound === false ? "success" : "error",
              })}
            >
              <Input
                placeholder="Enter Short Name"
                name="shortName"
                type="text"
                onBlur={handleNameCheck}
              />
            </Form.Item>
          </Col>

          <Col className="gutter-row" span={12}>
            <Form.Item
              label="No. of Licences purchased"
              name="NoOfLicencePurchased"
              rules={[
                {
                  required: true,
                  message: "No. of licences purchased is mandatory!",
                },
                {
                  pattern:
                    form.getFieldValue("licenceType") === "User Licence"
                      ? new RegExp("^[0-9]+$")
                      : "",
                  message: "Only numbers and positive numbers are allowed",
                },
              ]}
            >
              <Input
                placeholder="No. of Licences purchased"
                name="NoOfLicencePurchased"
                type="text"
                // disabled={form.getFieldValue("licenceType") === "User Licence" ? false : true}
              />
            </Form.Item>
          </Col>

          <Col className="gutter-row" span={12}>
            <Form.Item
              label="Licence Type"
              name="licenceType"
              rules={[
                { required: true, message: "Licence Type is mandatory !" },
              ]}
            >
              <Select
                defaultValue="Select"
                name="licenceType"
                onChange={(e) => {
                  props.handleLicenseType(e);
                  // handleLicenseTypeChange(e);
                }}
                className="licenceType"
              >
                <Option value="Enterprise Licence">Enterprise Licence</Option>
                <Option value="User Licence">User Licence</Option>
              </Select>
            </Form.Item>
          </Col>
          {path ? (
            ""
          ) : (
            <Col className="gutter-row" span={12}>
              <Form.Item label="No. of Licence Used" name="NoOfLicenceUsed">
                <Input
                  placeholder="No. of Licence Used"
                  name="NoOfLicenceUsed"
                  type="text"
                  disabled={true}
                />
              </Form.Item>
            </Col>
          )}
          <Col className="gutter-row" span={12}>
            <Form.Item
              label="Data Procurement Type"
              name="dataProcurementType"
              rules={[
                {
                  required: true,
                  message: "Data procurement type is mandatory !",
                },
              ]}
            >
              <Select
                defaultValue="Select"
                name="dataProcurementType"
                onChange={(e) => props.handleLicenseType(e)}
              >
                <Option value="Data Leasing">Data Leasing</Option>
                <Option value="Data Purchase">Data Purchase</Option>
                <Option value="Free Data">Free Data</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={12}>
            <Form.Item label="Status" name="status">
              <Input
                placeholder="Status"
                name="status"
                type="text"
                disabled={true}
              />
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={12}>
            <Form.Item style={{ display: "none" }}>
              <Button htmlType="submit" ref={button}>
                Click
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    selectedContract: state.contract.selectedContract,
  };
};

export default connect(mapStateToProps)(Licensedetails);