import { createRef, useEffect, memo } from "react";
import { useLocation } from "react-router-dom";
import { Row, Col, Form, Input, Select, Button, DatePicker } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { usage, updateUsage } from "../../store/actions/requestAccessActions";
import { bindData } from "./bindData";
import moment from "moment";

const { Option } = Select;
const layout = {
    labelCol: {
        span: 6,
    },
    wrapperCol: {
        span: 18,
    },
};
const dateFormat = "DD-MM-YYYY";

const Usage = (props) => {
    const dispatch = useDispatch();
    const reduxData = useSelector((state) => state.requestAccess);
    const location = useLocation();
    const formRef = createRef();
    const button = createRef();

    useEffect(() => {
        if (props.formData) {
            button.current.click();
            props.next(false);
        }

    }, [props.formData]);
    const { contractExpDate, licenseStatus } = reduxData.tableInfo;

    const defaultDate = moment(contractExpDate).format("DD-MM-YYYY");
    useEffect(() => {
        const locationObj = location.state.data;
        let cost = 0;
        if (locationObj && locationObj.license && locationObj.license.licenseCost) {
            cost = locationObj.license.licenseCost / locationObj.totalSubscribers + 1;
        } else {
            cost = cost + 1;
        }

        cost = Math.ceil(cost);
        formRef.current.setFieldsValue({
            billingModel: "Shared cost",
            expirationDate: moment(contractExpDate),
            subscriptionStatus: licenseStatus,
            alertsAndNotifications: "Yes",
            subscriptionCycle: "Weekly",
            estRechargeCostPerAnnum: cost,

        });
        bindData(reduxData.usage, formRef.current);

    }, []);

    function disabledDate(current) {

        return (
            current > moment(defaultDate, dateFormat) ||
            current.valueOf() < Date.now()
        );
    }

    function onChange(date, dateString) {
        dispatch(
            updateUsage({
                expirationDate: date,
            })
        );
    }

    const selectBefore = (
        <Select defaultValue="USD" className="select-before">
            <Option value="USD">USD</Option>
            <Option value="EUR">EUR</Option>
            <Option value="GBP">GBP</Option>
        </Select>
    );

    const onFinish = (values) => {

        dispatch(usage(values));
        props.next(true);
    };

    const onBlurHandler = (e) => {
        let data = {};
        const { name, value } = e.target;
        data[name] = value;
        dispatch(updateUsage(data));
    };

    const onSelectChangeHandler = (name, value) => {
        let data = {};
        data[name] = value;
        dispatch(updateUsage(data));
    };

    return (
        <Form {...layout} name="usage-one" onFinish={onFinish} ref={formRef}>
            <Row gutter={[78, 0]}>
                <Col span={12}>
                    <Form.Item
                        name="subscriptionCycle"
                        label="Subscription Cycle"
                        rules={[
                            {
                                required: true,
                                message: "Subscription Cycle is mandatory.",
                            },
                        ]}
                    >
                        <Select
                            placeholder="Weekly"
                            allowClear
                            name="subscriptionCycle"
                            onChange={(value) =>
                                onSelectChangeHandler("subscriptionCycle", value)
                            }
                        >
                            <Option value="Weekly">Weekly</Option>
                            <Option value="Monthly">Monthly</Option>
                            <Option value="Annually">Annually</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="billingModel" label="Billing Model">
                        <Input disabled placeholder="Billing Model" />
                    </Form.Item>
                    <Form.Item
                        name="estRechargeCostPerAnnum"
                        label="Est.Cost Per Annum"
                        rules={[
                            {
                                required: true,
                                message: "Est. cost per annum cycle is mandatory.",
                            },
                            {
                                pattern: new RegExp(/^[0-9]*$/i),
                                message: "Please enter a valid Est. cost per annum",
                            },
                        ]}
                    >
                        <Input
                            addonBefore={selectBefore}
                            placeholder="Est.Cost Per Annum"
                            name="estRechargeCostPerAnnum"
                            onBlur={(e) => onBlurHandler(e)}
                        />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        name="alertsAndNotifications"
                        label="Alerts & Notifications"
                    >
                        <Select
                            placeholder="Yes"
                            allowClear
                            onChange={(value) =>
                                onSelectChangeHandler("alertsAndNotifications", value)
                            }
                        >
                            <Option value="Yes">Yes</Option>
                            <Option value="No">No</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="expirationDate"
                        label="Expiration Date"
                        rules={[
                            {
                                required: true,
                                message: "Expiration date is mandatory.",
                            },
                        ]}
                    >
                        <DatePicker
                            style={{ width: "100%" }}
                            format={dateFormat}
                            disabledDate={(e) => disabledDate(e)}
                            onChange={onChange}
                        />
                    </Form.Item>
                    <Form.Item name="subscriptionStatus" label="Subscription Status">
                        <Select
                            placeholder="Licence"
                            disabled={reduxData.businessRequirements[0].subscriptionId === ""}
                            onChange={(value) =>
                                onSelectChangeHandler("subscriptionStatus", value)
                            }
                        >
                            <Option value="Active">Active</Option>
                            <Option value="Pending">Pending</Option>
                            <Option value="Expired">Expired</Option>
                            <Option value="Suspended">Suspended</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item style={{ display: "none" }}>
                        <Button htmlType="submit" ref={button}>
                            Click
                        </Button>
                    </Form.Item>
                </Col>
            </Row>
        </Form>
    );
};

export default memo(Usage);