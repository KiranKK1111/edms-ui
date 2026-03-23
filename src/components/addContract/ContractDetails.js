import { QuestionCircleOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Select,
  Tooltip,
  Checkbox,
} from "antd";
import { createRef, memo, useEffect, useState } from "react";
import { useParams, useLocation, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { contractDetails } from "../../store/actions/contractAction";
import { bindData } from "./bindData";
import "./VendorContacts.css";
import moment from "moment";

export const CamelText = (input) => {
  let result = input[0].toString();
  for (let i = 1; i < input.length; i = i + 1) {
    result =
      input[i - 1] === " " || input[i - 1] === "-" || input[i - 1] === "_"
        ? result + input[i]
        : result + input[i].toLowerCase();
  }
  return result;
};

const layout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 18,
  },
};
const { Option } = Select;
const ContractDetails = (props) => {
  const dispatch = useDispatch();
  const reduxData = useSelector((state) => state.contract);
  const info = useSelector((state) => state.vendor);
  const button = createRef();
  const formRef = createRef();
  const { formData } = props;
  const [vendorId, setDataVendor] = useState(null);
  const [contractStatus, setContractStatus] = useState(null);
  const [nameFound, setNameFound] = useState(false);
  const [contractName, setContractName] = useState("");
  const [vendorsList, setVendorsList] = useState([]);
  const [entityShortNames, setEntitySortNames] = useState([]);
  const [optionSelected, setOptionSelected] = useState(false);
  const [noExpiry, setNoExpiry] = useState(false);
  const [nameValidation, setNameValidation] = useState(false);
  const history = useHistory();

  const params = useParams();
  const location = useLocation();
  const [agName, setAgName] = useState({
    esName: params.vendorId ? params.vendorId : params.id,
    signedOnDate: "",
    refText: "",
  });

  useEffect(() => {
    if (optionSelected) {
      const url = history.location.pathname;
      formRef.current.setFieldsValue({
        dataSource: url.includes("addAgreement") ? params.id : params.vendorId,
      });
    }
  }, [optionSelected]);

  useEffect(() => {
    const name = `${agName.esName}_${agName.signedOnDate}_${agName.refText}`;
    formRef.current.setFieldsValue({
      agreementName: `${agName.esName}_${agName.signedOnDate}_${agName.refText}`,
    });
    if (reduxData.selectedContract.length && agName == name) {
      const val = reduxData.data[0].some((v) => v.agreementName === name);
      setNameValidation(val);
    }
  }, [agName]);

  useEffect(() => {
    if (noExpiry) {
      formRef.current.setFieldsValue({
        expirationDate: null,
      });
    }
  }, [noExpiry]);

  useEffect(() => {
    formRef.current.setFieldsValue({
      status: "Pending",
    });

    let selectedData = [];
    if (reduxData.selectedContract.length) {
      const {
        agreementExpiryDate,
        agreementPartyId,
        agreementReferenceText,
        agreementScbAgreementMgrBankId,
        agreementSignedOn,
        agreementStartDate,
        agreementStatus,
        agreementReferenceId,
      } = reduxData.selectedContract[0];
      selectedData = [
        {
          ...reduxData.selectedContract[0],
          expirationDate: agreementExpiryDate,
          dataSource: agreementPartyId,
          referenceText: agreementReferenceText,
          ScbAgreementManagerBankId: agreementScbAgreementMgrBankId,
          signedOn: agreementSignedOn,
          startDate: agreementStartDate,
          status: agreementStatus,
          referenceId: agreementReferenceId,
        },
      ];
    }
    const data = reduxData.contractDetails.length
      ? reduxData.contractDetails
      : selectedData;

    if (data) {
      bindData(data, formRef.current);
      if (data && data.length) {
        setAgName({
          esName: params.vendorId,
          signedOnDate: moment(data[0].signedOn).format("DDMMYYYY"),
          refText: data[0].referenceText,
        });
      }
      if (reduxData.selectedContract && reduxData.selectedContract.length) {
        const selectedVendor = info.list.filter((item) => {
          return item.vendorId === reduxData.selectedContract[0].vendorId;
        });
        setDataVendor(reduxData.selectedContract[0].vendorId);

        if (selectedVendor) {
          formRef.current.setFieldsValue({});
        }
      }
      if (
        data &&
        data[0] &&
        data[0].dataSource &&
        data[0].dataSource === params.vendorId
      ) {
        setOptionSelected(true);
      }
      if (data && data[0] && !data[0].expirationDate) {
        setNoExpiry(true);
      }
    }
  }, []);

  useEffect(() => {
    if (info.list && info.list.length) {
      const approvedVendors = info.list.filter((vendor) => {
        return vendor.taskStatus === "APPROVED";
      });
      setVendorsList(approvedVendors);
      const shortNames = info.list.map((v) => v.shortName);
      setEntitySortNames(shortNames);
    }
  }, [info]);

  const disabledDate = (current) => {
    // Can not select days before today and today
    return current && current < moment().endOf("day");
  };

  const handleNameCheck = (e) => {
    let inputValue = "";
    if (e && e.target) {
      setContractName(e.target.value);
      inputValue = e.target.value;
    } else {
      inputValue = contractName;
    }
    if (reduxData && reduxData.data && reduxData.data[0].length) {
      let contractList = [];
      contractList = reduxData.data[0].filter((item) => {
        const id = typeof e === "string" ? e : vendorId;
        return item.vendorId === id;
      });
      if (contractList && contractList.length) {
        contractList.find((ele) => {
          if (ele.contractName.toLowerCase() === inputValue.toLowerCase()) {
            setNameFound(true);
            return ele.contractName;
          } else {
            setNameFound(false);
          }
        });
      } else {
        setNameFound(false);
      }
    } else {
      setNameFound(false);
    }
  };

  let formFinalData = [];

  const onFinish = (values) => {
    if (!nameValidation) {
      formFinalData.push(values);
      if (formFinalData.length === 1) {
        dispatch(contractDetails(formFinalData));
        props.next(true);
      }
    }
  };
  const handledropChange = (e) => {
    setDataVendor(e);
    if (contractName) {
      handleNameCheck(e);
    }
  };

  useEffect(() => {
    if (formData) {
      button.current.click();
      props.next(false);
    }
  }, [formData]);

  const handleStatusChange = (e) => {
    setContractStatus(e);
  };

  const prefixSelector = (
    <Select defaultValue="USD">
      <Option value="USD">USD</Option>
    </Select>
  );

  /*const checkValidation = (rule, value) => {
    const RGX = /^(?:[A-Za-z]+)(?:[A-Za-z0-9 ]*)$/;

    if (RGX.test(value)) {
      return Promise.resolve("");
    } else {
      const msg = "Invalid characters";
      return Promise.reject(msg);
    }
  };*/
  const onChange = () => {
    setOptionSelected((state) => !state);
  };
  const expiryCheckHandler = () => {
    setNoExpiry((state) => !state);
  };
  const changeOption = (val) => {
    if (val === params.vendorId) setOptionSelected(true);
  };
  const handelDulicateAgreementName = () => {
    let allAgreements = reduxData.data[0];
    let selectedAgreement = document.getElementById("agreementID").value;

    //Filter out selected agreement in case of edit agreement

    if (selectedAgreement) {
      allAgreements = allAgreements.filter((eachAgreement) => {
        return eachAgreement.agreementId != selectedAgreement;
      });
    }

    let agreementName =
      agName.esName + "_" + agName.signedOnDate + "_" + agName.refText;
    const result = allAgreements.some(
      (eachAgreement) => eachAgreement.agreementName === agreementName
    );
    if (result) setNameValidation(true);
    else setNameValidation(false);
  };

  return (
    <Form {...layout} name="br-one" ref={formRef} onFinish={onFinish}>
      <Row gutter={[78, 0]}>
        <Col span={12}>
          <Form.Item
            label={<Tooltip title="Agreement ID">Agreement ID</Tooltip>}
            name="agreementId"
          >
            <Input
              placeholder="Agreement ID will be generated after submission"
              name="agreementId"
              type="text"
              disabled
              id="agreementID"
            />
          </Form.Item>

          <Form.Item
            name="agreementName"
            label="Agreement Name"
            rules={[{ required: true, message: "Short name is mandatory !" }]}
            {...(nameValidation && {
              validateStatus: "error",
              help: "Agreement name already exists under this entity",
            })}
          >
            <Input
              placeholder="Auto-generated by system"
              name="agreementName"
              type="text"
              disabled
            />
          </Form.Item>
          <Form.Item name="referenceId" label="Reference ID">
            <Input placeholder="Reference ID" name="referenceId" type="text" />
          </Form.Item>
          <Form.Item
            name="referenceText"
            label="Reference Text"
            rules={[
              { required: true, message: "Reference Text is mandatory !" },
            ]}
            tooltip={{
              title: "Reference Text",
              icon: <QuestionCircleOutlined style={{ color: "#1890ff" }} />,
            }}
          >
            <Input
              placeholder="Reference Text"
              name="referenceText"
              type="text"
              id="refTxt"
              onChange={(e) =>
                setAgName({
                  ...agName,
                  refText: e.target.value,
                })
              }
              onBlur={handelDulicateAgreementName}
            />
          </Form.Item>
          <Form.Item
            name="agreementType"
            label="Agreement Type"
            rules={[
              { required: true, message: "Agreement Type is mandatory !" },
            ]}
          >
            <Select defaultValue="Select">
              <Option value="Vendor contract">Vendor Contract</Option>
              <Option value="External Partner Agreement">
                External Partner Agreement
              </Option>
              <Option value="Internal SCB Agreement">
                Internal SCB Agreement
              </Option>
              <Option value="No Agreement">No Agreement</Option>
            </Select>
          </Form.Item>

          <Form.Item
            tooltip={{
              title: "Data Source",
              icon: <QuestionCircleOutlined style={{ color: "#1890ff" }} />,
            }}
            label={<span className="asterisk-custom">Data Source</span>}
            style={{ padding: 0, margin: 0 }}
          >
            <Row>
              <Col span={14}>
                <Form.Item
                  name="dataSource"
                  rules={[
                    {
                      required: true,
                      message: "Please select a data source",
                    },
                  ]}
                >
                  <Select
                    style={{ width: "100%" }}
                    defaultValue="Select"
                    name="dataSource"
                    disabled={optionSelected}
                    onChange={changeOption}
                  >
                    {entityShortNames.length > 0 &&
                      entityShortNames.map((v, i) => (
                        <Option value={`${v}`} key={i}>
                          {v}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={10} style={{ textAlign: "right" }}>
                <Form.Item>
                  <Checkbox
                    style={{ marginRight: "5px" }}
                    onChange={onChange}
                    checked={optionSelected}
                  />
                  Same as Agreement Party{" "}
                </Form.Item>
              </Col>
            </Row>
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Agreement Value"
            name="agreementValue"
            rules={[
              { required: true, message: "Agreement value is mandatory !" },
              {
                pattern: new RegExp("^[0-9]+$"),
                message: "Only numbers and positive numbers are allowed",
              },
            ]}
          >
            <Input
              addonBefore={prefixSelector}
              placeholder="Enter Agreement Value"
              name="agreementValue"
              onChange={props.handleChange}
            />
          </Form.Item>
          <Form.Item
            rules={[
              {
                required: true,
                message: "Signed on is required !",
              },
            ]}
            name="signedOn"
            label="Signed On"
            onBlur={handelDulicateAgreementName}
          >
            <DatePicker
              name="signedOn"
              format="DD/MMM/YYYY"
              onChange={(e) => {
                setAgName({
                  ...agName,
                  signedOnDate: moment(e).format("DDMMYYYY"),
                });
              }}
            />
          </Form.Item>
          <Form.Item
            rules={[
              {
                required: true,
                message: "Start date is required !",
              },
            ]}
            name="startDate"
            label="Start Date"
          >
            <DatePicker name="startDate" format="DD/MMM/YYYY" />
          </Form.Item>
          <Row>
            <Col span={24} style={{ position: "relative" }}>
              <Form.Item
                rules={[
                  {
                    required: !noExpiry && true,
                    message: "Expiration Date is required !",
                  },
                ]}
                name="expirationDate"
                label="Expiration Date"
              >
                <DatePicker
                  name="expirationDate"
                  format="DD/MMM/YYYY"
                  style={{ width: "76%" }}
                  disabled={noExpiry}
                />
              </Form.Item>
              <Form.Item
                style={{
                  width: "150px",
                  position: "absolute",
                  right: "-60px",
                  top: 0,
                  bottom: 0,
                  margin: "auto",
                }}
              >
                <Checkbox
                  style={{ marginRight: "5px", verticalAlign: "middle" }}
                  onChange={expiryCheckHandler}
                  checked={noExpiry}
                />
                No Expiry
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="ScbAgreementManagerBankId"
            label="SCB Manager Bank ID"
            rules={[
              {
                required: true,
                message: "SCB Manager Bank ID is required !",
              },
            ]}
          >
            <Input
              placeholder="SCB Manager Bank ID"
              name="ScbAgreementManagerBankId"
            />
          </Form.Item>
          <Form.Item
            label={<Tooltip title="status">Status</Tooltip>}
            rules={[{ required: true, message: "Status is mandatory !" }]}
            name="status"
          >
            <Input name="status" placeholder="Status" disabled />
          </Form.Item>
          <Form.Item style={{ display: "none" }}>
            <Button htmlType="submit" ref={button}></Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default memo(ContractDetails);