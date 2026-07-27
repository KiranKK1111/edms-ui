/*
  resourceRegistry — declarative descriptors that let ONE generic controller
  (<RecordFormPage>) drive Create / Edit / View for every master-data domain.

  Each descriptor references the domain's existing form + review components and
  data-layer actions; it does NOT reimplement them. The generic controller owns
  the wizard mechanics (steps, Prev/Next/Submit, load-on-edit, view mode).

  Descriptor shape:
    pageConfigKey : key into pageConfig.js for chrome (title/breadcrumb/alert)
    defaultValues : react-hook-form defaults (create mode)
    listSelector  : (state) => array   — collection used for edit/view lookup
    load          : (id) => thunk      — ensures the record/list is loaded
    findRecord    : (list, id) => record
    toForm        : (record) => formValues   — record → form fields (edit/view)
    syncToStore   : (values, dispatch)        — keep the review screen in sync
    steps         : [{ key, title, Component, review?, getProps(api) }]
    buildPayload  : (values, { isEdit, id }) => apiBody
    submit        : ({ isEdit, payload, dispatch }) => Promise<response>
    interpret     : (res, { id }) => { ok, message, tone }
    viewFields    : [{ label, key, type? }]   — read-only View mode
    statusField   : string   — form field that holds the record status
*/

import NewVendorForm from "../components/vendors/AddVendor/NewVendorForm";
import VendorReviewSubmit from "../components/vendors/AddVendor/ReviewSubmit";
import {
  startAddVendor,
  startGetVendors,
  startUpdateEntity,
  saveLocalData,
} from "../store/actions/VendorActions";
import ContractDetails from "../components/addContract/ContractDetails";
import VendorContacts from "../components/addContract/VendorContacts";
import UploadContractV2 from "../components/addContract/UploadContractV2";
import AgreementReviewSubmit from "../components/addContract/ReviewSubmit";
import {
  startGetContracts,
  selectedContract,
  upload,
  sendData,
} from "../store/actions/contractAction";
import OrderSteps from "../components/license/step/OrderSteps";
import {
  startAddLicense,
  cleanResponse,
} from "../store/actions/licenseAction";
import DatasetDetails from "../components/datasetForm/DatasetDetails";
import DatasetReviewSubmit from "../components/datasetForm/ReviewSubmit";
import { startDataset } from "../store/actions/datasetFormActions";
import DatafeedDetails from "../components/datafeed/DatafeedDetails";
import DatafeedReviewSubmit from "../components/datafeed/ReviewSubmit";
import DatafeedView, {
  DatafeedViewEditButton,
} from "../components/datafeed/DatafeedView";
import { startAddDatafeed } from "../store/actions/datafeedAction";
import ConfigurationSteps from "../components/addConfiguration/ConfigurationSteps";
import dayjs from "../design-system/dayjs";
import { STEP_LABELS } from "./pageConfig";

const ENTITY_DEFAULTS = {
  entityId: "",
  entityType: "",
  longName: "",
  shortName: "",
  entityStatus: "Pending",
  website: "",
  entityDescription: "",
};

// Stable references so descriptor selectors never return a fresh array on
// every call — react-redux's useSelector re-renders when the selected value
// changes by reference, so an unstable array causes an infinite update loop.
const EMPTY_LIST = [];
const slash = (s) => (s && s.includes("/") ? s.replaceAll("/", "%2F") : s);
const stableSingletonList = (() => {
  let lastValue;
  let lastArr = EMPTY_LIST;
  return (value) => {
    if (!value || !Object.keys(value).length) return EMPTY_LIST;
    if (value !== lastValue) {
      lastValue = value;
      lastArr = [value];
    }
    return lastArr;
  };
})();

export const RESOURCES = {
  entity: {
    pageConfigKey: "entity",
    defaultValues: ENTITY_DEFAULTS,
    listSelector: (state) => (state.vendor && state.vendor.list) || [],
    load: () => startGetVendors(),
    findRecord: (list, id) => list.find((v) => v.entityId === id),
    toForm: (r) => ({
      entityId: r.entityId || "",
      entityType: r.entityType || "",
      longName: r.longName || "",
      shortName: r.shortName || "",
      entityStatus: r.entityStatus || "Pending",
      website: r.website || "",
      entityDescription: r.entityDescription || "",
      existingVendorWithScb: "yes",
    }),
    syncToStore: (values, dispatch) => dispatch(saveLocalData(values)),
    statusField: "entityStatus",
    editRoute: (id) => `/record/entity/edit/${id}`,
    steps: [
      {
        key: "details",
        title: STEP_LABELS.entityDetails,
        Component: NewVendorForm,
        getProps: (api) => ({
          control: api.control,
          watch: api.watch,
          setValue: api.setValue,
          handleNameCheck: (e, entityId) => {
            const value = (e.target.value || "").trim();
            let list = api.list || [];
            if (entityId) list = list.filter((v) => v.entityId !== entityId);
            return list.some((v) => v.shortName === value);
          },
          handleLongNameCheck: (e, entityId) => {
            const value = (e.target.value || "").trim();
            let list = api.list || [];
            if (entityId) list = list.filter((v) => v.entityId !== entityId);
            return list.some((v) => v.longName === value);
          },
        }),
      },
      {
        key: "review",
        title: STEP_LABELS.review,
        Component: VendorReviewSubmit,
        review: true,
        getProps: () => ({}),
      },
    ],
    buildPayload: (values, { isEdit, id }) => {
      const psid = localStorage.getItem("psid");
      const roleName = localStorage.getItem("entitlementType");
      return {
        ...values,
        ...(!isEdit && { createdBy: psid, roleName }),
        entityUpdateFlag: isEdit ? "Y" : "N",
        ...(isEdit && { entityId: id, lastUpdatedBy: psid, roleName }),
      };
    },
    submit: ({ isEdit, payload, dispatch }) =>
      isEdit ? startUpdateEntity(payload) : dispatch(startAddVendor(payload)),
    interpret: (res, { id }) => {
      if (res && res.data && res.data.entityManagement) {
        return {
          ok: true,
          message: `Form entity Id ${res.data.entityManagement.entityId} submitted successfully!`,
        };
      }
      if (res && res.data && res.data.statusMessage) {
        return { ok: true, message: `Form entity Id ${id} Updated successfully!` };
      }
      if (res && res.message) {
        return { ok: false, message: res.message, tone: "warning" };
      }
      return { ok: false };
    },
    viewFields: [
      { label: "Entity ID", key: "entityId" },
      { label: "Long Name", key: "longName" },
      { label: "Short Name", key: "shortName" },
      { label: "Entity Type", key: "entityType" },
      { label: "Website", key: "website", type: "url" },
      { label: "Status", key: "entityStatus" },
      { label: "Description", key: "entityDescription", full: true },
    ],
  },

  agreement: {
    driver: "self",
    pageConfigKey: "agreement",
    // Reactive load: fetch agreements + entities; the controller selects the
    // record (edit/view) once the collection is available.
    init: (dispatch) => {
      dispatch(startGetContracts());
      dispatch(startGetVendors());
    },
    clearForCreate: (dispatch) => {
      dispatch(selectedContract([]));
      dispatch(upload([]));
    },
    selectForEdit: (dispatch, { id, contractsList }) => {
      const selId = id || localStorage.getItem("agId");
      const all = contractsList && contractsList[0] ? contractsList[0] : [];
      dispatch(selectedContract(all.filter((c) => c.agreementId === selId)));
    },
    contractsSelector: (state) => state.contract && state.contract.data,
    selectedSelector: (state) =>
      (state.contract && state.contract.selectedContract) || [],
    finalDataSelector: (state) => state.contract && state.contract.saveFinalData,
    contractDetailsSelector: (state) =>
      state.contract &&
      state.contract.contractDetails &&
      state.contract.contractDetails[0],
    vendorListSelector: (state) => (state.vendor && state.vendor.list) || [],
    pendingFromSelected: (selected) =>
      selected &&
      selected[0] &&
      (selected[0].agreementStatus || "").toString().toLowerCase() ===
        "pending",
    steps: [
      { key: "details", title: "Agreement Details", Component: ContractDetails },
      {
        key: "limitations",
        title: "Agreement Limitations",
        Component: VendorContacts,
      },
      { key: "upload", title: "Upload Agreement", Component: UploadContractV2 },
      {
        key: "review",
        title: STEP_LABELS.review,
        Component: AgreementReviewSubmit,
        review: true,
        getProps: (api) => ({
          contractDetails: api.contractDetails,
          vendorList: api.vendorList,
        }),
      },
    ],
    submit: ({ isEdit, finalData, dispatch }) =>
      dispatch(sendData({ ...(finalData || {}), isUpdate: isEdit })),
    interpret: (res) => {
      if (res && res.data && res.data.agreement) {
        return {
          ok: true,
          message: `Form agreement Id ${res.data.agreement.agreementId} submitted successfully!`,
        };
      }
      if (
        res &&
        res.data &&
        res.data.statusMessage &&
        res.data.statusMessage.code === 200
      ) {
        return { ok: true, message: "Form updated successfully!" };
      }
      return { ok: false, message: "Please fill the form!", tone: "warning" };
    },
    viewFields: [
      { label: "Agreement ID", key: "agreementId" },
      { label: "Agreement Name", key: "agreementName" },
      { label: "Agreement Type", key: "agreementType" },
      { label: "Reference ID", key: "agreementReferenceId" },
      { label: "Reference Text", key: "agreementReferenceText" },
      { label: "Agreement Value", key: "agreementValue" },
      { label: "Data Source", key: "agreementPartyId" },
      { label: "Signed On", key: "agreementSignedOn" },
      { label: "Start Date", key: "agreementStartDate" },
      { label: "Expiration Date", key: "agreementExpiryDate" },
      { label: "SCB Manager Bank ID", key: "agreementScbAgreementMgrBankId" },
      { label: "Status", key: "agreementStatus" },
      { label: "Agreement Limitations", key: "agreementLimitations", full: true },
      { label: "Agreement Link", key: "agreementLink", full: true },
    ],
  },

  licence: {
    // "component" driver: the descriptor supplies the WHOLE wizard body
    // (OrderSteps owns its own large controlled state + stepper) while the
    // generic controller owns the page chrome, Cancel/Submit and the async
    // submit-response handling. OrderSteps reports validity via isFormValid
    // and feeds the submit payload through the licenseReq redux slice.
    driver: "component",
    pageConfigKey: "licence",
    Body: OrderSteps,
    init: (dispatch) => dispatch(cleanResponse()),
    reqSelector: (state) => state.licenseReq,
    responseSelector: (state) => state.license && state.license.response,
    getCrumb: (params) => {
      const raw = params.contractId || params.id;
      if (!raw) return undefined;
      return raw.includes("%2F") ? raw.replaceAll("%2F", "/") : raw;
    },
    isPending: (location) =>
      !!(
        location &&
        location.state &&
        location.state.record &&
        location.state.record.licenseStatus &&
        location.state.record.licenseStatus.toLowerCase() === "pending"
      ),
    submitDisabled: (location) =>
      !!(
        location &&
        location.state &&
        location.state.record &&
        location.state.record.licenseUpdateFlag &&
        location.state.record.licenseUpdateFlag.toLowerCase() === "n" &&
        location.state.record.licenseStatus &&
        location.state.record.licenseStatus.toLowerCase() === "pending"
      ),
    buildPayload: ({ req, isEdit }) => {
      const userNameUpdated = localStorage.getItem("psid");
      const userRoleUpdated = localStorage.getItem("entitlementType");
      const agreementRecord =
        JSON.parse(localStorage.getItem("agRecord")) || {};
      // path === true  => create (addLicense) ; mirrors the legacy semantics.
      const path = !isEdit;
      req.licenseDetailsRequirements[0].expirationDate = dayjs.utc(
        req.licenseDetailsRequirements[0].expirationDate
      );
      const {
        NoOfLicencePurchased,
        NoOfLicenceUsed,
        dataProcurementType,
        expirationDate,
        licenceType,
        licenceValue,
        longName,
        shortName,
        licenceId,
      } = req.licenseDetailsRequirements[0];

      const varDate = dayjs(new Date(expirationDate)).format("YYYY-MM-DD");
      const varTime = dayjs
        .utc(new Date(expirationDate))
        .format("[T]HH:mm:ss")
        .toString();
      const varDateTime = varDate + varTime;

      return {
        licenseAgreementId: agreementRecord.agreementId,
        licenseCcy: "USD",
        licenseCreatedBy: path ? userNameUpdated : "",
        roleName: userRoleUpdated,
        licenseDataProcurementType: dataProcurementType,
        licenseExpiryDate: varDateTime,
        licenseId: path ? "" : licenceId,
        licenseLastUpdatedBy: path ? "" : userNameUpdated,
        licenseLimitations: req.support[0].licenceLimitations,
        licenseLongName: longName,
        licenseNoInheritanceFlag: "N",
        licenseNumberOfLicensesPurchaised: NoOfLicencePurchased,
        licenseNumberOfLicensesUsed: NoOfLicenceUsed,
        licenseShortName: shortName,
        licenseStatus: req.licenseDetailsRequirements[0].status,
        licenseType: licenceType,
        licenseUpdateFlag: path ? "N" : "Y",
        licenseValuePerMonth: licenceValue,
        isUpdate: path ? false : true,
      };
    },
    submit: ({ payload, dispatch }) => dispatch(startAddLicense(payload)),
    interpretResponse: (data) => {
      if (
        data &&
        data.statusMessage &&
        data.statusMessage.message &&
        data.statusMessage.message.includes("License creation")
      ) {
        return {
          ok: true,
          message: ` The Licence, ${data.license.licenseId} has been successfully submitted and is pending for approval!`,
        };
      }
      if (
        data &&
        data.statusMessage &&
        data.statusMessage.message &&
        data.statusMessage.message.includes("License updation")
      ) {
        return { ok: true, message: " The Licence has been successfully updated!" };
      }
      return { ok: false };
    },
  },

  dataset: {
    // "self" driver: DatasetDetails self-submits into state.dataset.formData via
    // the formData/next flag, ReviewSubmit writes the final payload there, and
    // the controller dispatches it. The record for edit/view is pre-populated
    // into state.dataset.formData by the master-data list navigation
    // (dispatch(datasetInfo(record))), so there is no list load / selectForEdit.
    driver: "self",
    pageConfigKey: "dataset",
    selectedSelector: (state) =>
      stableSingletonList(state.dataset && state.dataset.formData),
    finalDataSelector: (state) => state.dataset && state.dataset.formData,
    pendingFromSelected: (selected) =>
      selected &&
      selected[0] &&
      selected[0].datasetId &&
      (selected[0].datasetStatus || "").toString().toLowerCase() === "pending",
    steps: [
      {
        key: "details",
        title: STEP_LABELS.datasetDetails,
        Component: DatasetDetails,
      },
      {
        key: "review",
        title: STEP_LABELS.review,
        Component: DatasetReviewSubmit,
        review: true,
      },
    ],
    submit: ({ finalData, dispatch }) => dispatch(startDataset(finalData)),
    interpret: (res, { isEdit }) => {
      if (res && res.data && res.data.statusMessage) {
        return isEdit
          ? { ok: true, message: " The Dataset has been successfully updated!" }
          : {
              ok: true,
              message: ` The Dataset, ${
                res.data.dataset && res.data.dataset.datasetId
              } has been successfully created!`,
            };
      }
      if (res && res.message) {
        return { ok: false, message: res.message, tone: "error" };
      }
      return { ok: false };
    },
    viewFields: [
      { label: "Dataset ID", key: "datasetId" },
      { label: "Long Name", key: "longName" },
      { label: "Short Name", key: "shortName" },
      { label: "Status", key: "datasetStatus" },
      { label: "Licence ID", key: "licenseId" },
      { label: "Description", key: "datasetDescription", full: true },
    ],
  },

  datafeed: {
    // "self" driver like dataset: DatafeedDetails self-submits into
    // state.datafeedInfo.formData via the formData/next flag, ReviewSubmit
    // writes the final payload there, and the controller dispatches it. The
    // record for edit/view is pre-populated by the master-data list navigation
    // (dispatch(formDataFn(record))). The breadcrumb/backTo are dynamic (they
    // link back to the feed's View screen), so they come from getChrome. The
    // read-only View is a rich custom body (config link/tooltips/chips), so it
    // uses ViewBody + ViewHeaderActions instead of the generic field list.
    driver: "self",
    pageConfigKey: "datafeed",
    selectedSelector: (state) =>
      stableSingletonList(state.datafeedInfo && state.datafeedInfo.formData),
    finalDataSelector: (state) =>
      state.datafeedInfo && state.datafeedInfo.formData,
    pendingFromSelected: (selected) =>
      selected &&
      selected[0] &&
      selected[0].feedId &&
      (selected[0].feedStatus || "").toString().toLowerCase() === "pending",
    extraSubmitDisabled: (record) =>
      !!(
        record &&
        record.feedId &&
        record.feedStatus &&
        record.feedStatus.toLowerCase() === "inactive"
      ),
    getChrome: (location, { isView }) => {
      const st = (location && location.state) || {};
      const row = st.dataset || {};
      const record = st.datafeedRecord;
      const feedLink = slash(row.shortName || "");
      const viewTarget = {
        pathname: `/masterData/${feedLink}/viewDatafeed`,
        state: { dataset: row, isView: true, datafeedRecord: record },
      };
      const crumb = (name) => [
        { name: "Entities", url: "/masterData" },
        { name: feedLink, url: viewTarget },
        { name },
      ];
      if (isView) {
        return {
          className: "view-datafeed-page",
          backTo: "/masterData",
          breadcrumb: crumb("View Data Feed"),
        };
      }
      const isAdd = !(st.isView || st.isUpdate);
      return {
        backTo:
          isAdd || st.fromLink === "updatePage" ? "/masterData" : viewTarget,
        breadcrumb: crumb(isAdd ? "Add Data Feed" : "Edit Data Feed"),
      };
    },
    steps: [
      {
        key: "general",
        title: STEP_LABELS.datafeedGeneral,
        Component: DatafeedDetails,
      },
      {
        key: "review",
        title: STEP_LABELS.review,
        Component: DatafeedReviewSubmit,
        review: true,
      },
    ],
    submit: ({ finalData, dispatch }) => dispatch(startAddDatafeed(finalData)),
    interpret: (res, { isEdit }) => {
      if (res && res.data && res.data.statusMessage) {
        return isEdit
          ? { ok: true, message: " The Data Feed has been successfully updated!" }
          : {
              ok: true,
              message: ` The Data Feed, ${
                res.data.datafeed && res.data.datafeed.feedId
              } has been successfully submitted and is pending for approval!`,
            };
      }
      if (res && res.message) {
        return { ok: false, message: res.message, tone: "error" };
      }
      return { ok: false };
    },
    ViewBody: DatafeedView,
    ViewHeaderActions: DatafeedViewEditButton,
  },

  datafeedConfig: {
    // "delegated" driver: the data-feed configuration wizard has non-linear
    // step navigation (it skips API/Splitting steps based on protocol +
    // splitting choices), a header meta panel, permission-based read-only, and
    // a heavy submit. ConfigurationSteps keeps ALL of that logic intact and
    // reports a view-model up; the controller renders the shared chrome and
    // delegates the Cancel/Submit/Prev/Next actions back to it.
    driver: "delegated",
    Body: ConfigurationSteps,
  },
};

export const getResource = (key) => RESOURCES[key] || null;

export default RESOURCES;
