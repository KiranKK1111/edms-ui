import { CheckCircleFilled } from "@ant-design/icons";
export const TCVendorRequestSubscription = (props) => {
    return (
        <>
            <div style={(props.subForFlag && props.dfVendor === 'Y') || (!props.subForFlag && props.vendorRequest !== 'Y') ? { "opacity": "0.5" } : { "opacity": "none" }} className="accepted-parent">
                <h3 style={{ "fontWeight": "bolder" }}>Terms & Conditions On-Demand Vendor request</h3>
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
                    <div style={(props.subForFlag && props.dfVendor === 'Y') || (!props.subForFlag && props.vendorRequest !== 'Y') ? { "opacity": "0.5" } : { "opacity": "none" }} className="terms-conditions">
                        <div className="terms">
                            <h4>Required Governance/Compliance approvals</h4>
                            <p>
                                {" "}
                                I hereby declare that I obtained all the required Governance/Compliance
                                approvals for the content of the On-Demand requests from the Application
                                in scope of this Subscription to Vendor for this Data Feed.
                            </p>
                        </div>
                    </div> : null
            }
        </>
    )
}
