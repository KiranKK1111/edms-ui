import { CheckCircleFilled } from "@ant-design/icons";
export const TCGeneralSubscription = (props) => {
    return (
        <>
            <div className="accepted-parent">
                <h3 style={{ "fontWeight": "bolder" }}>Terms & Conditions general Subscription</h3>
                {props.view != "tc" ? <span>
                    <CheckCircleFilled
                        style={{
                            color: "green",
                            fontSize: "18px",
                            verticalAlign: "middle",
                            marginRight: "5px",
                        }} />Accepted</span> : null}
            </div>
            {
                props.view !== 'rd' ?
                    <div className="terms-conditions">
                        <div className="terms">
                            <h4>General</h4>
                            <p>
                                {" "}
                                I have reviewed the details of this dataset and understand the
                                conditions set by the vendor and will not modify or transform the
                                data unless explicitly allowed to. I hereby declare that all of the
                                information I have provided is complete and correct. I am aware that
                                missing or incomplete information, whether deliberate or the result
                                of negligence may result in a rejection for subscription access.
                            </p>
                            <h4>Licence and Restrictions</h4>
                            <p>
                                I agree not to reproduce, duplicate, copy any part of the content
                                herein without the appropriate licence/permission from the licence
                                owner.
                            </p>
                            <p>
                                As a subscriber to this dataset, I understand that I am are granted
                                non-exclusive, non-transferable, non-sublicenseable right and
                                licence, during the term of this Agreement, to allow the Authorized
                                Users to access and use the dataset content, solely to the extent
                                and for the purposes agreed by the licence owner as set out in the
                                application form filled out by the subscriber.
                            </p>
                            <h4>Usage</h4>
                            <p>
                                I understand and agree to the conditions set out by the vendor and
                                will not use or refer to the dataset and adhere to any expiration
                                date applied to the dataset that can fall under “no use of the data
                                after validity date”, including the contract expiration date.
                            </p>
                            <p>
                                As a subscriber, I will not: (a) except as expressly permitted in
                                this Agreement, disclose, make available, transfer or distribute, in
                                whole or in part, any of this dataset content to any third party;
                                (b) copy, adapt, reverse engineer, decompile, disassemble, or
                                modify, in whole or in part, any of this dataset content; (c)
                                conceal or obliterate any copyright or proprietary notices contained
                                in any of the dataset content which the subscriber may obtain or
                                access under this Agreement.
                            </p>
                            <p>
                                {" "}
                                If expressly permitted in this agreement that redistribution is
                                allowed, I will comply with the redistribution limit set out by the
                                vendor and only use the dataset for the purposes set out in your
                                Request for access application. I understand that any other
                                subscribers must request for their own access to the licence owner
                                and I must not share the access right given to me.
                            </p>
                            <h4>Storage</h4>
                            <p>
                                {" "}
                                I understand and agree to the terms set out on storing the dataset
                                during and after the expiration date of the contract with the
                                vendor. Unless expressly permitted in this agreement, I must purge
                                the data from the applications and/or systems involved after the
                                “storage expiration date” set out in the licence agreement with the
                                vendor.
                            </p>
                        </div>
                    </div> : null
            }
        </>
    )
}