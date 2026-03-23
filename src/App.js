import { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Route, Switch, withRouter } from "react-router-dom";
import { isAuthenticated } from "../src/store/services/AuthService";
import contractApproveRejectView from "./components/addContract/contractApproveRejectView";
import DatasetPage from "./components/dataset/DatasetPage";
import LicenseDetailsApproveReject from "./components/license/licenseDetailsApproveReject/licenseDetailsApproveReject";
import ProtectedRoute from "./components/login/protectedRoute";
import RequestDetails from "./components/requestAccess/RequestDetails";
import VendorDetails from "./components/vendors/VendorDetails/VendorDetails";
import AddEntity from "./pages/addEntity/AddEntity";
//import AddDocuments from "./pages/datafeed/AddDocuments";
import AddConfiguration from "./pages/datafeed/AddConfiguration";
import CatalogPage from "./pages/catalogPage/CatalogPage";
import AddContract from "./pages/contract/addContract";
import License from "./pages/license/Home";
import Login from "./pages/Login";
import MyTasksDashboardNew from "./pages/myTasks/MyTasksDashboardNew";
import RequestAccess from "./pages/RequestAccess";
import UserProfile from "./pages/userProfile/UserProfile";
import MasterData from "./pages/masterData/MasterData";
import {
  startGetRefreshToken,
  startLogOut,
  startLogOutForgerock,
} from "./store/actions/loginActions";
import SchedulerDetails from "./components/license/TechnicalDetails/SchedulerDetails";
import SourceConfigDetails from "./components/license/TechnicalDetails/SourceConfigDetails";
import ErrorPage from "./pages/error/ErrorPage";
import { useIdleTimer } from "react-idle-timer";
import { Modal, Button } from "antd";
import Countdown from "react-countdown";
import Datafeed from "./pages/datafeed/Datafeed";
import ViewDatafeed from "./pages/datafeed/ViewDatafeed";
import FeedDetails from "./components/datafeed/FeedDetails";
import Dataset from "./pages/dataset/Dataset";
import DatasetTasklistDetails from "./components/datasetForm/DatasetTasklistDetails";
import isAcessMasterDataDisabled from "./utils/accessMasterData";
import isCatelogueAccessDisabled from "./utils/accessRequestCatelog";
import isAccesPageDisabled from "./utils/accessPageCheck";
import SubscriptionManagement from "./pages/subscriptionManagement/SubscriptionManagement";
import {
  MY_TASK_PAGE,
  MAIN_PAGE,
  USER_MANAGEMENT_PAGE,
  CATELOG_MANAGEMENT_PAGE,
  MASTERDATA_MANAGEMENT_PAGE,
  MASTERDATA_MANAGEMENT_ENTITY_PAGE,
  MASTERDATA_AGREMENT_PAGE_AND_BUTTON,
  MASTERDATA_LICENSE_PAGE_BUTTON,
  MASTERDATA_ADD_DATASET_PAGES_BUTTON,
  MASTERDATA_DATAFEED_PAGE_AND_BUTTON,
  CATELOG_REQUEST_ACCESS_BUTTON,
  ADD_DATA_CONFIG_PAGE_AND_BUTTON,
  ADD_DATASET_DOCUMENTATION_PAGE_AND_BUTTON,
  ADD_DATAFEED_DOCUMENTATION_PAGE_AND_BUTTON,
  MASTERDATA_MANAGEMENT_ENTITY_BTN,
  SUBSCRIPTION_MAIN_PAGE,
  SUBSCRIPTION_PAGE,
} from "./utils/Constants";
import isButtonObject from "./utils/accessButtonCheck";
import getPermissionObject from "./utils/accessObject";
import AddEditDocuments from "./pages/datafeed/AddEditDocuments";
import { deleteAllCookiesAndSiteData, deleteCookies } from "./pages/header/Header";

const App = (props) => {
  const [showRoute, setShowRoute] = useState(true);
  /* AUTHENTICATE ON PAGE REFRESH */
  const storedToken = localStorage.getItem("access_token");
  let isTokenRefreshed = localStorage.getItem("token_refreshed");

  const handleReLogin = () => {
    props.dispatch(startGetRefreshToken(redirect));
  };

  const handleLogout = () => {
    props.dispatch(startLogOutForgerock());
    localStorage.removeItem("code");
    localStorage.removeItem("guestRole");
    deleteCookies(document.cookie, window.location.hostname);
    deleteAllCookiesAndSiteData();
    props.history.push("/");
  };

  const redirect = () => {
    props.history.push("/catalog");
  };

  let allowLogout;
  function countDown() {
    let modal = Modal.warning({
      title: "Are you still there?",
      content: "",
      okText: "Continue",
      onOk() {
        allowLogout = false;
      },
    });
    const renderer = ({ seconds, completed }) => {
      if (completed) {
        if (allowLogout === undefined) allowLogout = true;
        if (allowLogout) {
          modal.destroy();
          handleLogout();
        }
        allowLogout = undefined;
        return null;
      } else {
        return <span>{seconds}</span>;
      }
    };
    modal.update({
      content: (
        <span>
          Your session will expire in{" "}
          <Countdown date={Date.now() + 1000 * 30} renderer={renderer} />{" "}
          seconds unless you want to continue this session?
        </span>
      ),
    });
  }
  const handleOnIdle = () => {
    if (storedToken) {
      countDown();
    }
  };
  useIdleTimer({
    timeout: 1000 * 60 * 30,
    onIdle: handleOnIdle,
    debounce: 500,
  });

  const viewAsGuest = () => {
    localStorage.setItem("guestRole", "Guest");
    props.history.push("/catalog");
  };
  let loginedRold = localStorage.getItem("entitlementType");
  loginedRold = loginedRold ? loginedRold : localStorage.getItem("guestRole");
  const isGuestOrSubscriber =
    (loginedRold &&
      loginedRold.toString().toLocaleLowerCase() === "subscriber") ||
    (loginedRold && loginedRold.toString().toLocaleLowerCase() === "guest");
  useEffect(() => {
    if (isGuestOrSubscriber) {
      setShowRoute(false);
    } else {
      setShowRoute(true);
    }
  }, [loginedRold]);

  const catelogPageAccess = isCatelogueAccessDisabled(
    CATELOG_MANAGEMENT_PAGE,
    MAIN_PAGE
  );
  const addEntityPages =
    !isGuestOrSubscriber &&
    !isButtonObject(
      MASTERDATA_MANAGEMENT_PAGE,
      MASTERDATA_MANAGEMENT_ENTITY_PAGE
    );
  const addAgreementPagesAndButton =
    !isGuestOrSubscriber &&
    !isButtonObject(
      MASTERDATA_MANAGEMENT_PAGE,
      MASTERDATA_AGREMENT_PAGE_AND_BUTTON
    );

  const addLicencePagesAndButton =
    !isGuestOrSubscriber &&
    !isButtonObject(MASTERDATA_MANAGEMENT_PAGE, MASTERDATA_LICENSE_PAGE_BUTTON);

  const addDatasetPagesAndButton =
    !isGuestOrSubscriber &&
    !isButtonObject(
      MASTERDATA_MANAGEMENT_PAGE,
      MASTERDATA_ADD_DATASET_PAGES_BUTTON
    );

  const userProfileAccessPage =
    loginedRold && loginedRold.toString().toLocaleLowerCase() === "guest";
  // &&
  // !isAccesPageDisabled(USER_MANAGEMENT_PAGE, MAIN_PAGE);

  const addDatafeedPagesAndButton =
    !isGuestOrSubscriber &&
    !isButtonObject(
      MASTERDATA_MANAGEMENT_PAGE,
      MASTERDATA_DATAFEED_PAGE_AND_BUTTON
    );

  const addDataConfigPagesAndButton = getPermissionObject(
    MASTERDATA_MANAGEMENT_PAGE,
    ADD_DATA_CONFIG_PAGE_AND_BUTTON
  );

  const addDatasetDocPagesAndButton = getPermissionObject(
    MASTERDATA_MANAGEMENT_PAGE,
    ADD_DATASET_DOCUMENTATION_PAGE_AND_BUTTON
  );

  const addDatafeedDocPagesAndButton = getPermissionObject(
    MASTERDATA_MANAGEMENT_PAGE,
    ADD_DATAFEED_DOCUMENTATION_PAGE_AND_BUTTON
  );

  const datasetPages = getPermissionObject(
    MASTERDATA_MANAGEMENT_PAGE,
    MASTERDATA_ADD_DATASET_PAGES_BUTTON
  );

  const datafeedPages = getPermissionObject(
    MASTERDATA_MANAGEMENT_PAGE,
    MASTERDATA_DATAFEED_PAGE_AND_BUTTON
  );

  const agreementPages = getPermissionObject(
    MASTERDATA_MANAGEMENT_PAGE,
    MASTERDATA_AGREMENT_PAGE_AND_BUTTON
  );

  const licencePages = getPermissionObject(
    MASTERDATA_MANAGEMENT_PAGE,
    MASTERDATA_LICENSE_PAGE_BUTTON
  );

  const entityPages = getPermissionObject(
    MASTERDATA_MANAGEMENT_PAGE,
    MASTERDATA_MANAGEMENT_ENTITY_BTN
  );

  const userManagementPages = getPermissionObject(
    USER_MANAGEMENT_PAGE,
    MAIN_PAGE
  );

  const subscriptionManagementPages = getPermissionObject(
    SUBSCRIPTION_PAGE,
    SUBSCRIPTION_MAIN_PAGE
  );

  const cataloguePages = getPermissionObject(
    CATELOG_MANAGEMENT_PAGE,
    MAIN_PAGE
  );

  return (
    <div data-testid="main">
      <Switch>
        <Route
          exact
          path="/"
          render={(props) => <Login {...props} viewAsGuest={viewAsGuest} />}
        />

        <ProtectedRoute exact path="/userProfile/:id" component={UserProfile} />
        <ProtectedRoute exact path="/userProfile" component={UserProfile} />

        <ProtectedRoute exact path="/catalog" component={CatalogPage} />
        <ProtectedRoute exact path="/catalog/details" component={DatasetPage} />

        {addLicencePagesAndButton && (
          <ProtectedRoute exact path="/license" component={License} />
        )}
        {!catelogPageAccess &&
          loginedRold &&
          loginedRold.toString().toLocaleLowerCase() !== "guest" ? (
          <ProtectedRoute
            exact
            path="/catalog/subscription"
            component={RequestAccess}
          />
        ) : null}
        {isButtonObject(
          CATELOG_MANAGEMENT_PAGE,
          CATELOG_REQUEST_ACCESS_BUTTON
        ) && (
            <ProtectedRoute
              exact
              path="/requestDetails/:id/:taskId"
              component={RequestDetails}
            />
          )}
        <ProtectedRoute
          exact
          path="/schedulerDetails/:id/:taskId"
          component={SchedulerDetails}
        />
        {addDataConfigPagesAndButton &&
          addDataConfigPagesAndButton.permission === "RW" &&
          addDataConfigPagesAndButton.permission === "R" && (
            <ProtectedRoute
              exact
              path="/sourceConfigDetails/:id/:taskId"
              component={SourceConfigDetails}
            />
          )}
        {agreementPages && (
          <ProtectedRoute exact path="/addAgreement" component={AddContract} />
        )}
        {addEntityPages && (
          <ProtectedRoute exact path="/addEntity" component={AddEntity} />
        )}
        {showRoute && !isAccesPageDisabled(MY_TASK_PAGE, MAIN_PAGE) ? (
          <ProtectedRoute
            exact
            path="/myTasks"
            component={MyTasksDashboardNew}
          />
        ) : null}
        {addAgreementPagesAndButton && (
          <ProtectedRoute
            exact
            path="/vendorDetails"
            component={VendorDetails}
          />
        )}
        {!isAccesPageDisabled(MASTERDATA_MANAGEMENT_PAGE, MAIN_PAGE) && (
          <ProtectedRoute exact path="/masterData" component={MasterData} />
        )}
        {addEntityPages && (
          <ProtectedRoute
            exact
            path="/masterData/addEntity"
            component={AddEntity}
          />
        )}

        {((addDatasetDocPagesAndButton &&
          addDatasetDocPagesAndButton.permission === "RW") ||
          (addDatafeedDocPagesAndButton &&
            addDatafeedDocPagesAndButton.permission === "RW")) && (
            <Route
              exact
              path="/masterData/:dsDfId/editDocuments/:docObjectIds"
              component={AddEditDocuments}
            />
          )}

        {((addDatasetDocPagesAndButton &&
          addDatasetDocPagesAndButton.permission === "RW") ||
          (addDatafeedDocPagesAndButton &&
            addDatafeedDocPagesAndButton.permission === "RW")) && (
            <Route
              exact
              path="/masterData/:dsDfId/addDocuments"
              component={AddEditDocuments}
            />
          )}

        <Route
          exact
          path="/masterData/:id/addConfiguration"
          component={AddConfiguration}
        />

        {addEntityPages && (
          <ProtectedRoute
            exact
            path="/masterData/modifyEntity/:id"
            component={AddEntity}
          />
        )}
        {addAgreementPagesAndButton && (
          <ProtectedRoute
            exact
            path="/masterData/addAgreement"
            component={AddContract}
          />
        )}
        {addAgreementPagesAndButton && (
          <ProtectedRoute
            exact
            path="/masterData/:id/addAgreement"
            component={AddContract}
          />
        )}
        {agreementPages &&
          (agreementPages.permission === "RW" ||
            agreementPages.permission === "R") && (
            <ProtectedRoute
              exact
              path="/masterData/:vendorId/modifyAgreement"
              component={AddContract}
            />
          )}
        {licencePages &&
          (licencePages.permission === "RW" ||
            licencePages.permission === "R") && (
            <ProtectedRoute
              exact
              path="/masterData/:id/modifyLicense"
              component={License}
            />
          )}
        {addLicencePagesAndButton && (
          <ProtectedRoute
            exact
            path="/masterData/:contractId/addLicense"
            component={License}
          />
        )}
        {addDatasetPagesAndButton && (
          <ProtectedRoute
            exact
            path="/masterData/*/datafeed"
            component={Datafeed}
          />
        )}
        {datafeedPages &&
          (datafeedPages.permission === "RW" ||
            datafeedPages.permission === "R") && (
            <ProtectedRoute
              exact
              path="/masterData/*/viewDatafeed"
              component={ViewDatafeed}
            />
          )}

        {datasetPages &&
          (datasetPages.permission === "RW" ||
            datasetPages.permission === "R") && (
            <ProtectedRoute
              exact
              path="/masterData/*/dataset"
              component={Dataset}
            />
          )}
        {entityPages &&
          (entityPages.permission === "RW" ||
            entityPages.permission === "R") && (
            <ProtectedRoute
              exact
              path="/vendorDetails/:id/:taskId"
              component={VendorDetails}
            />
          )}
        {licencePages &&
          (licencePages.permission === "RW" ||
            licencePages.permission === "R") && (
            <ProtectedRoute
              exact
              path="/licenseDetails/:id/:taskId"
              component={LicenseDetailsApproveReject}
            />
          )}
        {agreementPages &&
          (agreementPages.permission === "RW" ||
            agreementPages.permission === "R") && (
            <ProtectedRoute
              exact
              path="/AgreementDetails/:id/:taskId"
              component={contractApproveRejectView}
            />
          )}
        {datafeedPages &&
          (datafeedPages.permission === "RW" ||
            datafeedPages.permission === "R") && (
            <ProtectedRoute
              exact
              path="/DatafeedDetails/:id/:taskId"
              component={FeedDetails}
            />
          )}
        {datasetPages &&
          (datasetPages.permission === "RW" ||
            datasetPages.permission === "R") && (
            <ProtectedRoute
              exact
              path="/DatasetDetails/:id/:taskId"
              component={DatasetTasklistDetails}
            />
          )}
        {/*showRoute &&
        userManagementPages &&
        (userManagementPages.permission === "RW" ||
          userManagementPages.permission === "R") ? (
          <ProtectedRoute
            exact
            path="/userManagement"
            component={UserManagement}
          />
          ) : null*/}

        {showRoute &&
          subscriptionManagementPages &&
          (subscriptionManagementPages.permission === "R" ||
            subscriptionManagementPages.permission === "RW") ? (
          <ProtectedRoute
            exact
            path="/subscriptionManagement"
            component={SubscriptionManagement}
          />
        ) : null}
        <Route path="/static" component={ErrorPage} />
        <Route path="/images" component={ErrorPage} />
        <Route path="*" component={ErrorPage} />
      </Switch>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    login: state.login,
  };
};
export default withRouter(connect(mapStateToProps)(App));
