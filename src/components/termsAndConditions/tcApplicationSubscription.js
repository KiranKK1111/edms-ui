import { CheckCircleFilled } from "@ant-design/icons";
export const TCApplicationSubscription = (props) => {
    return (
        <>
            <div style={props.subForFlag ? { "opacity": "0.5" } : { "opacity": "none" }} className="accepted-parent">
                <h3 style={{ "fontWeight": "bolder" }}>Terms & Conditions Application Subscription</h3>
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
                    <div style={props.subForFlag && props.vendorRequest !== "Y" ? { "opacity": "0.5" } : { "opacity": "none" }} className="terms-conditions">
                        <div className="terms">
                            <h4>Operational Level Agreement</h4>
                            <p>
                                {" "}
                                I hereby declare that the Operational Level Agreement between the
                                Application in scope of this Subscription and External Data Platform
                                containing this Data Feed is approved.
                            </p>
                        </div>
                    </div> : null
            }
        </>

    )
}