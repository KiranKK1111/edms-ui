import {
  METHOD_GET,
  METHOD_POST,
  CONTENT_TYPE_APPLICATION_JSON,
  CONTENT_TYPE_APPLICATION_FORM_URL_ENCODED,
  ACCESS_CONTROL_ALLOW_ORIGIN_STAR,
  ROLE_ADMIN,
  ROLE_CONSUMER,
  ROLE_OWNER,
  GRANT_TYPE,
  PASSWORD_KEY,
  PASSWORD_TEXT,
  USERNAME_KEY,
  OVERRIDE_SESSION,
  LOCAL_STORAGE_ACCESS_TOKEN,
  LOCAL_STORAGE_REFRESH_TOKEN,
  LOCAL_STORAGE_TOKEN_REFRESHED,
  LOCAL_STORAGE_ENTITLEMENT_TYPE,
  LOCAL_STORAGE_PSID,
  LOCAL_STORAGE_OBJECT_MATRIX,
  OWNER_ROLES,
  CONSUMER_ROLES,
  ADMIN_ROLES,
  REACT_CLIENT,
  CLIENT_SECRET,
  MAIN_PAGE,
  MY_TASK_PAGE,
  APPROVE_REJECT_BTN,
  APPROVE_REJECT_BTN_SUBS,
  APPROVE_REJECT_BTN_REMAINING,
  USER_MANAGEMENT_PAGE,
  USER_MANAGEMENT_EDIT_BTN,
  USER_MANAGEMENT_FILTER_BTN,
  CATELOG_MANAGEMENT_PAGE,
  CATELOG_MANAGEMENT_REQUESTACCESS_UNSUB_MODIFY_EDIT_BTN,
  CATELOG_MANAGEMENT_FILTER_BTN,
  CATELOG_OVERVIEW_TAB,
  CATELOG_MATADATA_TAB,
  CATELOG_SUBSCRIBERS_TAB,
  CATELOG_DOCUMENTATION_TAB,
  CATELOG_REQUEST_ACCESS_BUTTON,
  CATELOG_MY_SUBSCRIPTION,
  MASTERDATA_MANAGEMENT_PAGE,
  MASTERDATA_MANAGEMENT_ENTITY_PAGE,
  MASTERDATA_MANAGEMENT_ENTITY_BTN,
  MASTERDATA_ENTITY_EDIT_DEACTIVATE_BTN,
  MASTERDATA_AGREMENT_PAGE_AND_BUTTON,
  MASTERDATA_AGREMENT_SUSPEND_DELETE_BTN,
  MASTERDATA_LICENSE_PAGE_BUTTON,
  MASTERDATA_LICENSE_SUSPEND_DELETE_BUTTON,
  MASTERDATA_ADD_DATASET_PAGES_BUTTON,
  MASTERDATA_DATASET_DEACTIVATE_DELETE_BUTTON,
  MASTERDATA_DATAFEED_PAGE_AND_BUTTON,
  MASTERDATA_DATAFEED_UPADTE_ACTIVE_DELETE_BUTTON,
  ADD_DATA_CONFIG_PAGE_AND_BUTTON,
  ADD_DATASET_DOCUMENTATION_PAGE_AND_BUTTON,
  ADD_DATAFEED_DOCUMENTATION_PAGE_AND_BUTTON,
  SUBSCRIPTION_PAGE,
  SUBSCRIPTION_MAIN_PAGE,
  DATASET_DELEGATE,
  SUBSCRIBER,
  DATASET_OWNER,
  DATA_OPERATIONS,
} from "../../utils/Constants";

describe("Constants", () => {
  it("should export HTTP methods", () => {
    expect(METHOD_GET).toBe("GET");
    expect(METHOD_POST).toBe("POST");
  });

  it("should export content types", () => {
    expect(CONTENT_TYPE_APPLICATION_JSON).toBe("application/json");
    expect(CONTENT_TYPE_APPLICATION_FORM_URL_ENCODED).toBe("application/x-www-form-urlencoded");
  });

  it("should export access control constant", () => {
    expect(ACCESS_CONTROL_ALLOW_ORIGIN_STAR).toBe("*");
  });

  it("should export role constants", () => {
    expect(ROLE_ADMIN).toBe("Admin");
    expect(ROLE_CONSUMER).toBe("Consumer");
    expect(ROLE_OWNER).toBe("Owner");
  });

  it("should export auth-related constants", () => {
    expect(GRANT_TYPE).toBe("grant_type");
    expect(PASSWORD_KEY).toBe("password");
    expect(PASSWORD_TEXT).toBe("password");
    expect(USERNAME_KEY).toBe("username");
    expect(OVERRIDE_SESSION).toBe("overRideSession");
  });

  it("should export local storage key constants", () => {
    expect(LOCAL_STORAGE_ACCESS_TOKEN).toBe("access_token");
    expect(LOCAL_STORAGE_REFRESH_TOKEN).toBe("refresh_token");
    expect(LOCAL_STORAGE_TOKEN_REFRESHED).toBe("token_refreshed");
    expect(LOCAL_STORAGE_ENTITLEMENT_TYPE).toBe("entitlementType");
    expect(LOCAL_STORAGE_PSID).toBe("psid");
    expect(LOCAL_STORAGE_OBJECT_MATRIX).toBe("objectMatrix");
  });

  it("should export OWNER_ROLES with correct PSIDs", () => {
    expect(Array.isArray(OWNER_ROLES)).toBe(true);
    expect(OWNER_ROLES).toEqual(["1293220", "1135744", "1503617"]);
  });

  it("should export CONSUMER_ROLES with correct PSIDs", () => {
    expect(Array.isArray(CONSUMER_ROLES)).toBe(true);
    expect(CONSUMER_ROLES).toEqual(["1380562"]);
  });

  it("should export ADMIN_ROLES with correct PSIDs", () => {
    expect(Array.isArray(ADMIN_ROLES)).toBe(true);
    expect(ADMIN_ROLES).toEqual([
      "1117602", "1588229", "1264899", "1325208",
      "1278228", "1629035", "1558113", "1628553",
    ]);
  });

  it("should export client constants", () => {
    expect(REACT_CLIENT).toBe("react-client");
    expect(CLIENT_SECRET).toBe("client-secret");
  });

  it("should export page constants", () => {
    expect(MAIN_PAGE).toBe("Main Page");
    expect(MY_TASK_PAGE).toBe("My Tasks");
  });

  it("should export approve/reject button constants", () => {
    expect(APPROVE_REJECT_BTN).toBe("Approve / Reject Button");
    expect(APPROVE_REJECT_BTN_SUBS).toBe("Approve / Reject Button for object Subscription");
    expect(APPROVE_REJECT_BTN_REMAINING).toBe("Approve / Reject Button for remaining objects");
  });

  it("should export user management constants", () => {
    expect(USER_MANAGEMENT_PAGE).toBe("User Management");
    expect(USER_MANAGEMENT_EDIT_BTN).toBe("Add New User / Edit Roles Button");
    expect(USER_MANAGEMENT_FILTER_BTN).toBe("Filters button");
  });

  it("should export catalogue management constants", () => {
    expect(CATELOG_MANAGEMENT_PAGE).toBe("Catalogue");
    expect(CATELOG_MANAGEMENT_REQUESTACCESS_UNSUB_MODIFY_EDIT_BTN).toBe(
      "Request Access or Unsubscribe and Modify Access Button"
    );
    expect(CATELOG_MANAGEMENT_FILTER_BTN).toBe("Filters button");
    expect(CATELOG_OVERVIEW_TAB).toBe("Overview");
    expect(CATELOG_MATADATA_TAB).toBe("Metadata");
    expect(CATELOG_SUBSCRIBERS_TAB).toBe("Subscribers");
    expect(CATELOG_DOCUMENTATION_TAB).toBe("Documentation");
    expect(CATELOG_REQUEST_ACCESS_BUTTON).toBe("Request Access Button");
    expect(CATELOG_MY_SUBSCRIPTION).toBe("My Subscription");
  });

  it("should export masterdata management constants", () => {
    expect(MASTERDATA_MANAGEMENT_PAGE).toBe("Masterdata");
    expect(MASTERDATA_MANAGEMENT_ENTITY_PAGE).toBe("Entity Pages");
    expect(MASTERDATA_MANAGEMENT_ENTITY_BTN).toBe("Add Entity Button and Manage button");
    expect(MASTERDATA_ENTITY_EDIT_DEACTIVATE_BTN).toBe("Entity Edit/Deactivate button");
  });

  it("should export masterdata agreement constants", () => {
    expect(MASTERDATA_AGREMENT_PAGE_AND_BUTTON).toBe("Add Agreement Button and Agreement Pages");
    expect(MASTERDATA_AGREMENT_SUSPEND_DELETE_BTN).toBe("Agreement Suspend/Delete button");
  });

  it("should export masterdata license constants", () => {
    expect(MASTERDATA_LICENSE_PAGE_BUTTON).toBe("Add Licence Button and Licence Pages");
    expect(MASTERDATA_LICENSE_SUSPEND_DELETE_BUTTON).toBe("Licence Suspend/Delete button");
  });

  it("should export masterdata dataset constants", () => {
    expect(MASTERDATA_ADD_DATASET_PAGES_BUTTON).toBe("Add Dataset Button and Dataset Pages");
    expect(MASTERDATA_DATASET_DEACTIVATE_DELETE_BUTTON).toBe("Dataset Deactivate/Delete button");
  });

  it("should export masterdata datafeed constants", () => {
    expect(MASTERDATA_DATAFEED_PAGE_AND_BUTTON).toBe("Add Datafeed Button and Datafeed Pages");
    expect(MASTERDATA_DATAFEED_UPADTE_ACTIVE_DELETE_BUTTON).toBe("Data feed Update and Edit/Deactivate button");
  });

  it("should export data config and documentation constants", () => {
    expect(ADD_DATA_CONFIG_PAGE_AND_BUTTON).toBe("Add Data Configuration Button and Data Configuration Pages");
    expect(ADD_DATASET_DOCUMENTATION_PAGE_AND_BUTTON).toBe("Add Documents For Dataset");
    expect(ADD_DATAFEED_DOCUMENTATION_PAGE_AND_BUTTON).toBe("Add Documents For Datafeed");
  });

  it("should export subscription constants", () => {
    expect(SUBSCRIPTION_PAGE).toBe("Subscriptions");
    expect(SUBSCRIPTION_MAIN_PAGE).toBe("Subscriptions/Mainpage");
  });

  it("should export role name constants", () => {
    expect(DATASET_DELEGATE).toBe("Dataset Delegate");
    expect(SUBSCRIBER).toBe("Subscriber");
    expect(DATASET_OWNER).toBe("Dataset Owner");
    expect(DATA_OPERATIONS).toBe("Data Operations");
  });
});
