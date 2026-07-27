import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from "react";
import { connect } from "react-redux";
import { Route, Switch, withRouter } from "react-router-dom";
import { isAuthenticated } from "../src/store/services/AuthService";
import ProtectedRoute from "./components/login/protectedRoute";
import Login from "./pages/Login";
import ErrorPage from "./pages/error/ErrorPage";
import {
  startGetRefreshToken,
  startLogOut,
  startLogOutForgerock,
} from "./store/actions/loginActions";
import { useIdleTimer } from "react-idle-timer";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import Countdown from "react-countdown";
import isAcessMasterDataDisabled from "./utils/accessMasterData";
import isCatelogueAccessDisabled from "./utils/accessRequestCatelog";
import isAccesPageDisabled from "./utils/accessPageCheck";
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
import { deleteAllCookiesAndSiteData, deleteCookies } from "./pages/header/Header";
import { FullPageSpinner } from "./design-system";
import AppLayout from "./layout/AppLayout";

const DatasetPage = lazy(() => import("./components/dataset/DatasetPage"));
const LicenseDetailsApproveReject = lazy(() =>
  import("./components/license/licenseDetailsApproveReject/licenseDetailsApproveReject")
);
const RequestDetails = lazy(() => import("./components/requestAccess/RequestDetails"));
const VendorDetails = lazy(() => import("./components/vendors/VendorDetails/VendorDetails"));
const ContractApproveRejectView = lazy(() =>
  import("./components/addContract/contractApproveRejectView")
);
const AddEntity = lazy(() => import("./pages/addEntity/AddEntity"));
const RecordFormPage = lazy(() => import("./components/recordForm/RecordFormPage"));
const AddConfiguration = lazy(() => import("./pages/datafeed/AddConfiguration"));
const CatalogPage = lazy(() => import("./pages/catalogPage/CatalogPage"));
const AddContract = lazy(() => import("./pages/contract/addContract"));
const License = lazy(() => import("./pages/license/Home"));
const MyTasksDashboardNew = lazy(() => import("./pages/myTasks/MyTasksDashboardNew"));
const RequestAccess = lazy(() => import("./pages/RequestAccess"));
const UserProfile = lazy(() => import("./pages/userProfile/UserProfile"));
const MasterData = lazy(() => import("./pages/masterData/MasterData"));
const SchedulerDetails = lazy(() =>
  import("./components/license/TechnicalDetails/SchedulerDetails")
);
const SourceConfigDetails = lazy(() =>
  import("./components/license/TechnicalDetails/SourceConfigDetails")
);
const Datafeed = lazy(() => import("./pages/datafeed/Datafeed"));
const ViewDatafeed = lazy(() => import("./pages/datafeed/ViewDatafeed"));
const FeedDetails = lazy(() => import("./components/datafeed/FeedDetails"));
const Dataset = lazy(() => import("./pages/dataset/Dataset"));
const DatasetTasklistDetails = lazy(() =>
  import("./components/datasetForm/DatasetTasklistDetails")
);
const SubscriptionManagement = lazy(() =>
  import("./pages/subscriptionManagement/SubscriptionManagement")
);
const AddEditDocuments = lazy(() => import("./pages/datafeed/AddEditDocuments"));

const App = (props) => {
  const [showRoute, setShowRoute] = useState(true);
  /* AUTHENTICATE ON PAGE REFRESH */
  const storedToken = localStorage.getItem("access_token");
  let isTokenRefreshed = localStorage.getItem("token_refreshed");

  const redirect = useCallback(() => {
    props.history.push("/catalog");
  }, [props.history]);

  const handleReLogin = useCallback(() => {
    props.dispatch(startGetRefreshToken(redirect));
  }, [props.dispatch, redirect]);

  const handleLogout = useCallback(() => {
    props.dispatch(startLogOutForgerock());
    localStorage.removeItem("code");
    localStorage.removeItem("guestRole");
    deleteCookies(document.cookie, window.location.hostname);
    deleteAllCookiesAndSiteData();
    props.history.push("/");
  }, [props.dispatch, props.history]);

  const [idleModalOpen, setIdleModalOpen] = useState(false);
  const [idleDeadline, setIdleDeadline] = useState(null);

  const dismissIdleModal = useCallback(() => {
    setIdleModalOpen(false);
    setIdleDeadline(null);
  }, []);

  const renderCountdown = useCallback(
    ({ seconds, completed }) => {
      if (completed) {
        // Defer logout out of render to avoid setState during render warnings
        Promise.resolve().then(() => {
          if (idleModalOpen) {
            setIdleModalOpen(false);
            handleLogout();
          }
        });
        return null;
      }
      return <span>{seconds}</span>;
    },
    [idleModalOpen, handleLogout]
  );

  const handleOnIdle = useCallback(() => {
    if (storedToken) {
      setIdleDeadline(Date.now() + 1000 * 30);
      setIdleModalOpen(true);
    }
  }, [storedToken]);

  useIdleTimer({
    timeout: 1000 * 60 * 30,
    onIdle: handleOnIdle,
    debounce: 500,
  });

  const viewAsGuest = useCallback(() => {
    localStorage.setItem("guestRole", "Guest");
    props.history.push("/catalog");
  }, [props.history]);

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

  const permissions = useMemo(() => {
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
      !isButtonObject(
        MASTERDATA_MANAGEMENT_PAGE,
        MASTERDATA_LICENSE_PAGE_BUTTON
      );

    const addDatasetPagesAndButton =
      !isGuestOrSubscriber &&
      !isButtonObject(
        MASTERDATA_MANAGEMENT_PAGE,
        MASTERDATA_ADD_DATASET_PAGES_BUTTON
      );

    const userProfileAccessPage =
      loginedRold && loginedRold.toString().toLocaleLowerCase() === "guest";

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

    return {
      catelogPageAccess,
      addEntityPages,
      addAgreementPagesAndButton,
      addLicencePagesAndButton,
      addDatasetPagesAndButton,
      userProfileAccessPage,
      addDatafeedPagesAndButton,
      addDataConfigPagesAndButton,
      addDatasetDocPagesAndButton,
      addDatafeedDocPagesAndButton,
      datasetPages,
      datafeedPages,
      agreementPages,
      licencePages,
      entityPages,
      userManagementPages,
      subscriptionManagementPages,
      cataloguePages,
    };
  }, [isGuestOrSubscriber, loginedRold]);

  const {
    catelogPageAccess,
    addEntityPages,
    addAgreementPagesAndButton,
    addLicencePagesAndButton,
    addDatasetPagesAndButton,
    addDataConfigPagesAndButton,
    addDatasetDocPagesAndButton,
    addDatafeedDocPagesAndButton,
    datasetPages,
    datafeedPages,
    agreementPages,
    licencePages,
    entityPages,
    subscriptionManagementPages,
  } = permissions;

  return (
    <div data-testid="main">
      <Dialog
        open={idleModalOpen}
        onClose={dismissIdleModal}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Are you still there?</DialogTitle>
        <DialogContent>
          <span>
            Your session will expire in{" "}
            {idleDeadline && (
              <Countdown date={idleDeadline} renderer={renderCountdown} />
            )}{" "}
            seconds unless you want to continue this session?
          </span>
        </DialogContent>
        <DialogActions>
          <Button onClick={dismissIdleModal} variant="contained">
            Continue
          </Button>
        </DialogActions>
      </Dialog>
      <Suspense fallback={<FullPageSpinner />}>
        <Switch>
          <Route
            exact
            path="/"
            render={(props) => <Login {...props} viewAsGuest={viewAsGuest} />}
          />
          <Route path="/static" component={ErrorPage} />
          <Route path="/images" component={ErrorPage} />

          <Route>
            <AppLayout>
              <Switch>
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

          {/* Generic Create/Edit/View controller (registry-driven).
              e.g. /record/entity/create, /record/entity/edit/:id, /record/entity/view/:id */}
          <ProtectedRoute
            exact
            path="/record/:resource/:mode/:id?"
            component={RecordFormPage}
          />

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
                component={ContractApproveRejectView}
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
          <Route path="*" component={ErrorPage} />
              </Switch>
            </AppLayout>
          </Route>
        </Switch>
      </Suspense>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    login: state.login,
  };
};
export default withRouter(connect(mapStateToProps)(App));
