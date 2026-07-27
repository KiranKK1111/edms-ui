import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Switch,
  Typography,
} from "@mui/material";
import {
  Person as PersonIcon,
  Edit as EditIcon,
} from "@mui/icons-material";

import { connect } from "react-redux";
import dayjs from "../../design-system/dayjs";

import { PageHero, Section, useConfirm } from "../../design-system";
import "./UserProfile.css";

const UserProfile = (props) => {
  const confirmer = useConfirm();
  const psid = localStorage.getItem("psid");
  const entitlementType = localStorage.getItem("entitlementType");
  const lastLoginRaw = props.userProfile ? props.userProfile.lastLogin : undefined;
  const lastLoginFormatted = dayjs(lastLoginRaw).format("Do MMM, YYYY [at] h:mm a");
  const hasLastLogin =
    lastLoginFormatted && lastLoginFormatted !== "Invalid Date";

  const handleEntitlementChange = () => {
    confirmer.info({
      title: "Entitlements",
      content: "Kindly apply in HUSA for any changes in Entitlements.",
    });
  };

  return (
    <div className="profile-page" id="main">
      <div className="profile-shell">
        <PageHero
          breadcrumb={[{ name: "User Profile" }]}
          title="User Profile"
          subtitle="Review your account details, entitlements, and message notification preferences."
          backTo="/catalog"
        />

        <div className="profile-grid">
          <Section
            className="profile-identity"
            bordered={false}
            elevation="low"
            padding="md"
          >
            <Box className="profile-identity-top">
              <Avatar
                sx={{
                  width: 96,
                  height: 96,
                  bgcolor: "primary.main",
                }}
              >
                <PersonIcon sx={{ fontSize: 48 }} />
              </Avatar>
              <Typography component="div" className="profile-psid">
                PSID : {psid}
              </Typography>
              {hasLastLogin && (
                <Typography component="div" className="profile-last-login">
                  Last login: {lastLoginFormatted}
                </Typography>
              )}
            </Box>

            <Box className="profile-entitlement">
              <Typography component="div" className="profile-entitlement-label">
                Entitlements
              </Typography>
              <Box className="profile-entitlement-row">
                <Chip
                  className="profile-entitlement-tag"
                  label={entitlementType}
                  size="small"
                />
                <Button
                  size="small"
                  variant="text"
                  startIcon={<EditIcon fontSize="small" />}
                  onClick={handleEntitlementChange}
                  className="profile-entitlement-edit"
                >
                  Edit
                </Button>
              </Box>
              <Typography component="div" className="profile-entitlement-hint">
                Entitlement changes are managed via HUSA.
              </Typography>
            </Box>
          </Section>

          <Section
            className="profile-notifications"
            title="Message Notifications"
            bordered={false}
            elevation="low"
            padding="md"
          >
            <List disablePadding>
              <ListItem
                className="profile-list-item"
                secondaryAction={<Switch defaultChecked disabled />}
                disableGutters
                divider
              >
                <ListItemText
                  primary="New Subscriptions"
                  secondary="Notify me when users subscribe to my licences"
                  slotProps={{
                    primary: { sx: { fontWeight: 600, fontSize: 14 } },
                    secondary: { sx: { fontSize: 13, color: "text.secondary" } },
                  }}
                />
              </ListItem>

              <ListItem
                className="profile-list-item"
                secondaryAction={<Switch defaultChecked disabled />}
                disableGutters
              >
                <ListItemText
                  primary="System Messages"
                  secondary="Notify me of all system updates and changes, e.g maintenance, new feature release, etc."
                  slotProps={{
                    primary: { sx: { fontWeight: 600, fontSize: 14 } },
                    secondary: { sx: { fontSize: 13, color: "text.secondary" } },
                  }}
                />
              </ListItem>
            </List>
          </Section>
        </div>
      </div>
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
