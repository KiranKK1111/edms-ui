//______________Lib imports begin_____________
import React, { useState, createRef, useEffect } from "react";
import { connect, useDispatch, useSelector } from 'react-redux'

//______________ component imports begin_________
import Headers from "../header/Header";
import NewVendorForm from "../../components/vendors/AddVendor/NewVendorForm"
import NewVendorHead from "../../components/vendors/AddVendor/NewVendorHead"
import { startAddVendor, startGetVendors, startDeleteVendor } from '../../store/actions/VendorActions'
import { useParams, useHistory } from "react-router-dom";
import { saveLocalData } from '../../store/actions/VendorActions';

//________________css imports*/
import "./AddVendor.css"

/*________________antD library imports begin*/
import "antd/dist/antd.css";
import { Layout, Modal, Form, message, Alert, Steps, Button, } from "antd";
import ReviewSubmit from '../../components/vendors/AddVendor/ReviewSubmit';


const { Content } = Layout;
const { Step } = Steps;
const formRef = createRef();

const AddVendor = (props) => {
    const params = useParams()
    const [isFormSaved, setIsFormSaved] = useState(false);
    const [isFormValid, setIsFormValid] = useState(params.id ? true : false)
    const vendorList = useSelector((state) => state.vendor);
    const contractsList = useSelector((state) => state.contract).data;
    const [current, setCurrent] = React.useState(0);
    const [validForm, setValidForm] = useState(false);
    const [formValues, setFormValues] = useState();
    const [statusPending, setStatusPending] = useState(false);
    const history = useHistory();
    const dispatch = useDispatch();
    let VendorWebsite, VendorDeleteMessage;
    const steps = [
        {
            title: 'Entity Details',
            content: (<NewVendorForm
                website={VendorWebsite}
            />)
        },
        {
            title: 'Review & Submit',
            content: <ReviewSubmit />,
        },
    ];
    const next = () => {
        formRef.current.submit();
    };
    useEffect(() => {
        if (validForm) {
            const values = formRef.current.getFieldsValue();
            dispatch(saveLocalData(values));
            setCurrent(current + 1);
        }
        setValidForm(false);
    }, [validForm]);
    const prev = () => {
        setCurrent(current - 1);
    };

    const layout = {
        labelCol: {
            span: 6,
        },
        wrapperCol: {
            span: 18,
        },
    };

    const deleteHandler = () => {
        let numOfContracts = (contractsList) ?
            ((contractsList[0].filter(ele => ele.vendorId === params.id)).length) :
            0
        if (numOfContracts > 0) {
            VendorDeleteMessage = `You cannot complete this action until all contracts and
                licences associated with this vendor are removed.`
        } else {
            VendorDeleteMessage = `Your request to Delete Vendor will be submitted for approval.
                Do you want to proceed ?`
        }
        Modal.confirm({
            title: (<h3><b>Delete Vendor ? </b> </h3>),
            content: (VendorDeleteMessage),
            onOk() {
                if (numOfContracts === 0) {
                    const vendorDetails = vendorList.list.find(ele => ele.vendorId === params.id);
                    const { name, taskStatus, vendorId } = vendorDetails;
                    dispatch(
                        startDeleteVendor({
                            name,
                            taskStatus,
                            vendorId,
                            createdBy: localStorage.getItem("psid"),
                        })
                    )
                        .then(() => {
                            sessionStorage.removeItem("vendorid");
                            sessionStorage.removeItem("dashkey");
                            history.push("/vendorDashboard");
                            return { name, taskStatus, vendorId };
                        })
                        .catch((error) => {
                            return error;
                        });
                }
            }
        })

    }

    const formSubmitTrigger = (values) => {
        setFormValues(values);
        setValidForm(true);
    }

    const handleSubmitSuccess = async () => {
        
        let userNameUpdated = localStorage.getItem("psid");
        const formData = {
            ...formValues,
            ...!params.id && {
                createdBy: userNameUpdated,
            },
            isUpdate: params.id ? true : false,
            ...params.id && {
                entityId: params.id,
                lastUpdatedBy: userNameUpdated
            }
        }
        const res = await dispatch(startAddVendor(formData));
        if (res && res.data && res.data.entityManagement) {
            message.success(`Form entity Id ${res.data.entityManagement.entityId} submitted successfully!`);
            history.push('/vendorDashboard');
        } else if (res && res.data && res.data.statusMessage) {
            message.success(`Form entity Id ${params.id} Updated successfully!`);
            history.push('/vendorDashboard');
        }
        if (res.message) {
            message.warning(res.message);
        }
        


    }
    let vendorDetails;

    const handleMapping = () => {
        if (params.id && vendorList && formRef.current) {
            vendorDetails = vendorList.list.find(ele => ele.entityId === params.id);
            if (vendorDetails) {
                const { longName, entityId, entityDescription, entityStatus, entityType, shortName, website, existingVendorWithScb } = vendorDetails
                const val = entityStatus.toString().toLowerCase() === 'pending';
                setStatusPending(val);
                formRef.current.setFieldsValue({
                    entityId,
                    longName,
                    entityStatus,
                    entityDescription,
                    website,
                    entityType,
                    shortName,
                    
                });
                VendorWebsite = website
            }
        } else {
            vendorDetails = null
            if (formRef.current) {
                formRef.current.setFieldsValue({
                    existingVendorWithScb: 'yes'
                });
            }
        }
    }

    const onFieldsChange = (a, b) => {
        const fields = [
            'existingVendorWithScb',
            'vendorCountry',
            'vendorDescription',
            'vendorDomain',
            'vendorName',
        ];
        for (let i = 0; i < fields.length; i++) {
            if (!b[fields[i]]) {
                setIsFormValid(false)
                return
            } else {
                setIsFormValid(true)
            }
        }
    }

    useEffect(() => {
        if (params.id && !vendorList.list.length) {
            dispatch(startGetVendors());
        }
        handleMapping()
    }, [dispatch]);

    

    const handleSubmitCancel = () => {
        Modal.confirm({
            title: 'Do you want to leave the Page ?',
            okText: 'Yes',
            cancelText: 'No',
            onOk() { props.history.push('/dashboard') },
            onCancel() { }
        })
    }
    useEffect(() => {
        if (!params.id) {
            formRef.current.setFieldsValue({
                entityStatus: 'Pending'
            });
        }
    }, [params]);

    return (
        <div>

            <Headers />   {/*EDMS Navigation Bar */}

            {/*Vendor Form Begins */}
            <Form {...layout} ref={formRef} name="NewVendorForm"
                onFinish={(values) => formSubmitTrigger(values)}
                onFinishFailed={props.handleOnFinishFailed}
                layout="horizontal"
                onValuesChange={onFieldsChange}

            >
                <Layout>
                    <Content>

                        <NewVendorHead
                            handleSubmitSuccess={handleSubmitSuccess}
                            handleSubmitCancel={handleSubmitCancel}
                            isFormSubmitted={isFormSaved}
                            deleteHandler={deleteHandler}
                            isFormValid={isFormValid}
                            activeSubmit={current === steps.length - 1 ? !statusPending ? false : true : true}
                        />

                        {statusPending ? <Alert
                            message="Your change request has been submitted for approval. You current details remains unchanged until your request is approved."
                            showIcon
                            type="warning"
                            closable
                            className='banner'
                        /> : null}

                        {/*-- Header area-- */}
                        <div className="form-layout content-wrapper">  {/*-- Content area-- */}
                            <Steps current={current} size="small" >
                                {steps.map(item => (
                                    <Step key={item.title} title={item.title} />
                                ))}
                            </Steps>
                            <div className="steps-content">{steps[current].content}</div>
                            <div className="steps-action">
                                {current < steps.length - 1 && (
                                    <Button type="primary" onClick={() => next()}>
                                        Next
                                    </Button>
                                )}
                                
                                {current > 0 && (
                                    <Button style={{ margin: '0 8px' }} onClick={() => prev()}>
                                        Previous
                                    </Button>
                                )}
                            </div>

                        </div>
                    </Content>
                </Layout> {/*---------------Ends */}
            </Form>
        </div>
    )
}

const mapStateToProps = (state, props) => {
    return {
        vendorList: state.vendor && state.vendor.list,
    }
}

export default connect(mapStateToProps)(AddVendor)