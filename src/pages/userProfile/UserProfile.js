import {
  Layout,
  Divider,
  Avatar,
  Switch,
  Breadcrumb,
  List,
  Modal,
  Button,
} from "antd";
import { UserOutlined, HomeOutlined } from "@ant-design/icons";

import { useEffect } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import moment from "moment";

import Headers from "../header/Header";
import "./UserProfile.css";
import { startLoadUserProfile } from "../../store/actions/UserProfileAction";

const { Header, Sider, Content } = Layout;

const UserProfile = (props) => {
  const psid = localStorage.getItem("psid");
  let lastLoginFormatted;

  useEffect(() => {
    const getData = async () => {
      const response = await props.dispatch(startLoadUserProfile(psid));
      return response;
    };
    const resp = getData();
  }, [props.dispatch]);

  if (props.userProfile) {
    lastLoginFormatted = moment(props.userProfile.lastLogin).format(
      "Do MMM, YYYY [at] h:mm a"
    );
  } else {
    lastLoginFormatted = moment().format("Do MMM, YYYY [at] h:mm a");
  }

  const handleEntitlementChange = () => {
    Modal.info({
      content: "Kindly apply in HUSA for any changes in Entitlements.",
    });
  };

  return (
    <div className="profile-container">
      <Layout className="profile-page">
        <Headers />

        <Content className="profile-content">
          <Layout className="profile-layout">
            <Header className="profile-header">
              <Breadcrumb>
                <Breadcrumb.Item>
                  <Link to="/catalog">
                    {" "}
                    <HomeOutlined />{" "}
                  </Link>{" "}
                </Breadcrumb.Item>
                <Breadcrumb.Item> User Profile </Breadcrumb.Item>
              </Breadcrumb>
              <span className="profile-page-h3">User Profile</span>
            </Header>

            <Layout className="profile-sub-layout">
              <Sider className="profile-sub-sider" width={420}>
                <div className="profile-icon">
                  <Avatar
                    size={84}
                    style={{ backgroundColor: "#007AFF" }}
                    icon={<UserOutlined />}
                  />
                  <h3 className="profile-psid"> PSID : {psid}</h3>
                </div>
                <Divider />
                <div className="profile-entitlement">
                  <p>
                    {" "}
                    <b>Entitlements: </b>
                    {
                      
                      <span> {localStorage.getItem("entitlementType")} </span>
                    }
                    <Button type="link" onClick={handleEntitlementChange}>
                      Edit
                    </Button>
                  </p>
                  <br />
                  
                </div>
              </Sider>

              <Content className="profile-sub-content">
                <h3> Message Notifications </h3>
                <br />
                <List size="large" itemLayout="horizontal">
                  <List.Item className="profile-list-item">
                    <List.Item.Meta
                      title="New Subscriptions"
                      description="Notify me when users subscribe to my licences"
                    />
                    <Switch defaultChecked disabled />
                  </List.Item>

                  <List.Item className="profile-list-item">
                    <List.Item.Meta
                      title="System Messages"
                      description="Notify me of all system updates and changes, e.g maintenance, new feature release, etc."
                    />
                    <Switch
                      className="profile-list-switch"
                      defaultChecked
                      disabled
                    />
                  </List.Item>
                </List>
              </Content>
            </Layout>
          </Layout>
        </Content>
      </Layout>
    </div>
  );
};

function mapStateToProps(state) {
  return {
    userProfile: state.userProfile.data[0],
    login: state.login,
  };
}
export default connect(mapStateToProps)(UserProfile);