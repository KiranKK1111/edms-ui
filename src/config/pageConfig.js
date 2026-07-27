/*
  pageConfig — single source of truth for every top-level screen's chrome.

  This file owns the header/metadata for all screens so that changing a
  title, subtitle, breadcrumb, back target, status dot, step labels, or the
  "pending review" alert text is a ONE-FILE edit here. The shared layout
  components (PageLayout / PageHero / PageFormLayout) and the page bodies stay
  untouched.

  Two kinds of screens:

    1. List screens (Catalogue, Master Data, My Tasks, Subscriptions) — static
       metadata, also drive the header navigation tabs.

    2. Form / detail screens (Add-Edit Entity, Agreement, Licence, Dataset,
       Data Feed, Data Feed Configuration, View Data Feed) — values depend on
       runtime context (edit vs add, the entity the record sits under). These
       are expressed as resolver functions of a `ctx` object.

  Any field may be a plain value OR a function `(ctx) => value`. Read a config
  through `getPageConfig(key, ctx)` which resolves every field against `ctx`.

  Resolver context (`ctx`) fields used by form screens:
    - isEdit  : boolean   editing an existing record vs creating a new one
    - crumb   : string    decoded entity/agreement/feed identifier for the
                          middle breadcrumb (optional)
    - backTo  : any       optional override for the back-arrow target
*/

const STATUS_DOT = { color: "var(--color-success)" };
const MASTER_DATA_URL = "/masterData";

// Shared step labels so wizard steps read identically across screens.
export const STEP_LABELS = {
  review: "Review & Submit",
  entityDetails: "Entity Details",
  datasetDetails: "Dataset details",
  datafeedGeneral: "General Details",
};

// Pending-review banners, centralised so the wording stays consistent.
export const PENDING_ALERTS = {
  entity:
    "Your change request has been submitted for approval. Your current details remain unchanged until your request is approved.",
  agreement:
    "This Agreement is currently under review. You will be able to add Licences once the Agreement is approved and the status is \u201cActive\u201d or \u201cPlanned\u201d.",
  licence:
    "This Licence is currently under review. You will be able to add Datasets once the Licence is approved and the status is \u201cActive\u201d or \u201cPlanned\u201d.",
  dataset:
    "This Dataset is currently under review and approval. You will be able to add Data Feeds once the Dataset is approved and the status is \u201cActive\u201d.",
  datafeed:
    "This Data Feed is currently under review. You will be able to subscribe once the Data Feed is approved and the status is \u201cActive\u201d.",
};

// Helper: build the standard "<root> / <crumb?> / <title>" breadcrumb.
const trail = (rootName, rootUrl, crumb, title) => [
  { name: rootName, url: rootUrl },
  ...(crumb ? [{ name: crumb, url: rootUrl }] : []),
  { name: title },
];

export const PAGE_CONFIG = {
  // ---------- List screens (also drive header nav tabs) ----------
  catalogue: {
    key: "catalogue",
    path: "/catalog",
    navLabel: "Catalogue",
    isNav: true,
    title: "Catalogue",
    subtitle:
      "Browse, search and subscribe to data feeds across every source. All feeds in one place.",
    breadcrumb: [{ name: "Catalogue" }],
    backTo: null,
    badge: STATUS_DOT,
  },
  masterData: {
    key: "masterData",
    path: MASTER_DATA_URL,
    navLabel: "Master Data",
    isNav: true,
    title: "Master Data Management",
    subtitle:
      "Browse and manage agreements, licences, datasets, and data feeds across all entities.",
    breadcrumb: [{ name: "Master Data" }],
    backTo: "/catalog",
    badge: STATUS_DOT,
  },
  myTasks: {
    key: "myTasks",
    path: "/myTasks",
    navLabel: "My Tasks",
    isNav: true,
    title: "My Tasks",
    subtitle:
      "Review and act on pending approval tasks across entities, agreements, datasets, and feeds.",
    breadcrumb: [{ name: "My Tasks" }],
    backTo: "/catalog",
    badge: STATUS_DOT,
  },
  subscriptions: {
    key: "subscriptions",
    path: "/subscriptionManagement",
    navLabel: "Subscriptions",
    isNav: true,
    title: "Subscriptions",
    subtitle: "View and manage subscription requests across all data feeds.",
    breadcrumb: [{ name: "Subscriptions" }],
    backTo: "/catalog",
    badge: STATUS_DOT,
  },

  // ---------- Form / detail screens ----------
  entity: {
    key: "entity",
    className: "add-entity-page",
    backTo: MASTER_DATA_URL,
    title: (ctx) => (ctx.isEdit ? "Edit Entity" : "Add Entity"),
    breadcrumb: (ctx) =>
      trail("Entities", MASTER_DATA_URL, null, ctx.isEdit ? "Edit Entity" : "Add Entity"),
    stepLabels: [STEP_LABELS.entityDetails, STEP_LABELS.review],
    pendingAlert: PENDING_ALERTS.entity,
  },
  vendor: {
    key: "vendor",
    className: "add-vendor-page",
    backTo: MASTER_DATA_URL,
    title: (ctx) => (ctx.isEdit ? "Edit Entity" : "Add Entity"),
    breadcrumb: (ctx) =>
      trail("Entities", MASTER_DATA_URL, null, ctx.isEdit ? "Edit Entity" : "Add Entity"),
    stepLabels: [STEP_LABELS.entityDetails, STEP_LABELS.review],
    pendingAlert: PENDING_ALERTS.entity,
  },
  agreement: {
    key: "agreement",
    className: "add-contract-page",
    backTo: MASTER_DATA_URL,
    title: (ctx) => (ctx.isEdit ? "Edit Agreement" : "Add Agreement"),
    breadcrumb: (ctx) =>
      trail(
        "Entities",
        MASTER_DATA_URL,
        ctx.crumb,
        ctx.isEdit ? "Edit Agreement" : "Add Agreement"
      ),
    pendingAlert: PENDING_ALERTS.agreement,
  },
  licence: {
    key: "licence",
    className: "add-licence-page",
    backTo: MASTER_DATA_URL,
    title: (ctx) => (ctx.isEdit ? "Edit Licence" : "Add Licence"),
    breadcrumb: (ctx) =>
      trail(
        "Master Data",
        MASTER_DATA_URL,
        ctx.crumb,
        ctx.isEdit ? "Edit Licence" : "Add Licence"
      ),
    pendingAlert: PENDING_ALERTS.licence,
  },
  dataset: {
    key: "dataset",
    className: "add-dataset-page",
    backTo: MASTER_DATA_URL,
    title: (ctx) => (ctx.isEdit ? "Edit Dataset" : "Add Dataset"),
    breadcrumb: (ctx) =>
      trail(
        "Entities",
        MASTER_DATA_URL,
        ctx.crumb,
        ctx.isEdit ? "Edit Dataset" : "Add Dataset"
      ),
    stepLabels: [STEP_LABELS.datasetDetails, STEP_LABELS.review],
    pendingAlert: PENDING_ALERTS.dataset,
  },
  datafeed: {
    key: "datafeed",
    className: "add-datafeed-page",
    backTo: (ctx) => ctx.backTo ?? MASTER_DATA_URL,
    title: (ctx) => (ctx.isEdit ? "Edit Data Feed" : "Add Data Feed"),
    stepLabels: [STEP_LABELS.datafeedGeneral, STEP_LABELS.review],
    pendingAlert: PENDING_ALERTS.datafeed,
  },
  viewDatafeed: {
    key: "viewDatafeed",
    className: "view-datafeed-page",
    backTo: MASTER_DATA_URL,
    title: (ctx) => (ctx.isEdit ? "View Data Feed" : "Add Data Feed"),
    breadcrumb: (ctx) =>
      trail("Entities", MASTER_DATA_URL, null, ctx.isEdit ? "View Data Feed" : "Add Data Feed"),
  },
};

const resolve = (value, ctx) =>
  typeof value === "function" ? value(ctx) : value;

/*
  getPageConfig(key, ctx) — returns a fully resolved config for a screen.
  Every function-valued field is evaluated against `ctx`, so callers always
  receive concrete values (string title, array breadcrumb, etc.).
*/
export const getPageConfig = (key, ctx = {}) => {
  const cfg = PAGE_CONFIG[key];
  if (!cfg) return null;
  return {
    ...cfg,
    title: resolve(cfg.title, ctx),
    subtitle: resolve(cfg.subtitle, ctx),
    breadcrumb: resolve(cfg.breadcrumb, ctx),
    backTo: resolve(cfg.backTo, ctx),
    badge: resolve(cfg.badge, ctx),
    pendingAlert: resolve(cfg.pendingAlert, ctx),
  };
};

// Ordered list of nav tabs for the header.
export const getNavPages = () =>
  Object.values(PAGE_CONFIG).filter((p) => p.isNav);

export default PAGE_CONFIG;
