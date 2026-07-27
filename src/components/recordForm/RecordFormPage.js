import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useHistory, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Alert, Box, Button } from "@mui/material";

import { PageFormLayout, useConfirm, useSnackbar } from "../../design-system";
import { getPageConfig } from "../../config/pageConfig";
import { getResource } from "../../config/resourceRegistry";
import DetailView from "./DetailView";

// Stable empty reference so absent-selector fallbacks don't return a fresh
// array on every call (which makes react-redux log "selector returned a
// different result" warnings).
const EMPTY_ARRAY = [];

/*
  RecordFormPage — ONE generic controller for Create / Edit / View across every
  master-data domain. Reads `resource` + `mode` from props or the route and
  pulls the descriptor from resourceRegistry. Supports two step drivers:

    driver: "form"  — parent owns a single react-hook-form; step components
                      receive `control` and the controller validates via
                      trigger() before advancing. (entity)

    driver: "self"  — step components own their own form and self-submit when a
                      `formData` flag flips true, dispatching their slice to the
                      store; the controller orchestrates the flag + step index
                      and submits the aggregated payload. (agreement, licence…)

  Route shape: /record/:resource/:mode/:id?     mode ∈ create | edit | view
*/
const RecordFormPage = (props) => {
  const params = useParams();
  const resource = props.resource || params.resource;
  const mode = props.mode || params.mode || "create";
  const id = props.id || params.id;

  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();
  const confirmer = useConfirm();
  const snackbar = useSnackbar();

  const descriptor = getResource(resource);
  const driver = (descriptor && descriptor.driver) || "form";

  const isView = mode === "view";
  const isEdit = mode === "edit";
  const hasId = isEdit || isView;

  const [current, setCurrent] = useState(0);
  const [formData, setFormData] = useState(false); // self-driver step trigger
  const [statusPending, setStatusPending] = useState(false);
  const [pendingAlertOpen, setPendingAlertOpen] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [bound, setBound] = useState(false);
  const [selected, setSelected] = useState(false);

  // ---- component-driver state ----
  const [bodyValid, setBodyValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [componentSteps, setComponentSteps] = useState([]);
  const savedRef = useRef(null);
  const responseHandledRef = useRef(false);

  // The mounted step may register a synchronous draft saver so Previous can
  // persist typed-but-unvalidated input before the step unmounts. Steps
  // without editable forms (review screens) simply never register.
  const draftSaverRef = useRef(null);
  const registerDraftSaver = useCallback((fn) => {
    draftSaverRef.current = fn;
  }, []);

  // ---- delegated-driver state (body reports a full view-model + actions) ----
  const [delegatedVm, setDelegatedVm] = useState({
    steps: [],
    current: 0,
    meta: [],
    breadcrumb: [],
    title: "",
    backTo: "/masterData",
    className: "",
    canSubmit: false,
    showPrev: false,
    showNext: false,
    prevDisabled: false,
  });
  const delegatedActionsRef = useRef({});
  const reportDelegatedVm = useCallback((vm) => setDelegatedVm(vm), []);
  const bindDelegatedActions = useCallback((a) => {
    delegatedActionsRef.current = a || {};
  }, []);

  const {
    control,
    getValues,
    setValue,
    watch,
    reset,
    trigger,
    formState: { isValid },
  } = useForm({
    defaultValues: descriptor ? descriptor.defaultValues || {} : {},
    mode: "onChange",
  });

  // ---- selectors (descriptor-provided; called unconditionally) ----
  const list = useSelector((state) =>
    descriptor && descriptor.listSelector
      ? descriptor.listSelector(state)
      : EMPTY_ARRAY
  );
  const finalData = useSelector((state) =>
    descriptor && descriptor.finalDataSelector
      ? descriptor.finalDataSelector(state)
      : null
  );
  const contractsList = useSelector((state) =>
    descriptor && descriptor.contractsSelector
      ? descriptor.contractsSelector(state)
      : null
  );
  const selectedRecord = useSelector((state) =>
    descriptor && descriptor.selectedSelector
      ? descriptor.selectedSelector(state)
      : null
  );
  const reviewContractDetails = useSelector((state) =>
    descriptor && descriptor.contractDetailsSelector
      ? descriptor.contractDetailsSelector(state)
      : null
  );
  const reviewVendorList = useSelector((state) =>
    descriptor && descriptor.vendorListSelector
      ? descriptor.vendorListSelector(state)
      : EMPTY_ARRAY
  );

  // component-driver selectors (request slice + async response)
  const componentReq = useSelector((state) =>
    descriptor && descriptor.reqSelector ? descriptor.reqSelector(state) : null
  );
  const componentResponse = useSelector((state) =>
    descriptor && descriptor.responseSelector
      ? descriptor.responseSelector(state)
      : null
  );

  const record = useMemo(() => {
    if (!descriptor) return null;
    if (driver === "self") {
      return selectedRecord && selectedRecord.length ? selectedRecord[0] : null;
    }
    if (!hasId || !list || !list.length) return null;
    return descriptor.findRecord(list, id) || null;
  }, [descriptor, driver, selectedRecord, hasId, list, id]);

  const steps = (descriptor && descriptor.steps) || [];

  // ---- load on mount (edit/view) ----
  useEffect(() => {
    if (!descriptor) return;
    if (driver === "component") {
      if (descriptor.init) descriptor.init(dispatch);
    } else if (driver === "self") {
      if (descriptor.init) descriptor.init(dispatch);
      if (!hasId && descriptor.clearForCreate) {
        descriptor.clearForCreate(dispatch);
      }
    } else if (hasId && descriptor.load) {
      dispatch(descriptor.load(id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource, mode, id]);

  // ---- self-driver: select the record once the collection is loaded ----
  useEffect(() => {
    if (
      driver === "self" &&
      hasId &&
      !selected &&
      descriptor.selectForEdit &&
      contractsList &&
      contractsList[0] &&
      contractsList[0].length
    ) {
      descriptor.selectForEdit(dispatch, { id, contractsList });
      setSelected(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver, hasId, selected, contractsList, id]);

  // ---- form-driver: bind loaded record into the form (once) ----
  useEffect(() => {
    if (driver === "form" && hasId && record && !bound) {
      const formValues = descriptor.toForm(record);
      // keepDirtyValues: the fields are interactive while the record request
      // is in flight — anything already typed must not be overwritten.
      reset(formValues, { keepDirtyValues: true });
      if (descriptor.syncToStore) descriptor.syncToStore(formValues, dispatch);
      if (descriptor.statusField) {
        setStatusPending(
          (formValues[descriptor.statusField] || "").toLowerCase() === "pending"
        );
      }
      setBound(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record, bound]);

  // ---- self-driver: pending alert from the selected record ----
  useEffect(() => {
    if (driver === "self" && descriptor.pendingFromSelected) {
      setStatusPending(!!descriptor.pendingFromSelected(selectedRecord));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRecord]);

  // ---- navigation ----
  const goBack = useCallback(() => {
    const meta = getPageConfig(descriptor.pageConfigKey, { isEdit: hasId });
    history.push(meta.backTo || "/masterData");
  }, [descriptor, hasId, history]);

  const handleCancel = useCallback(async () => {
    const ok = await confirmer.confirm({
      title: "Discard changes?",
      content: "Your unsaved changes will be lost.",
      okText: "Discard",
      cancelText: "Stay",
      okColor: "error",
    });
    if (ok) goBack();
  }, [confirmer, goBack]);

  // Delegated-driver cancel: confirm, then run the body's own cleanup+navigate.
  const handleDelegatedCancel = useCallback(async () => {
    const ok = await confirmer.confirm({
      title: "Discard changes?",
      content: "Your unsaved changes will be lost.",
      okText: "Discard",
      cancelText: "Stay",
      okColor: "error",
    });
    if (!ok) return;
    const a = delegatedActionsRef.current;
    if (a && a.cancel) a.cancel();
    else history.push("/masterData");
  }, [confirmer, history]);

  // form-driver next
  const nextForm = useCallback(async () => {
    const ok = await trigger();
    if (!ok) return;
    if (descriptor.syncToStore) descriptor.syncToStore(getValues(), dispatch);
    setCurrent((c) => Math.min(steps.length - 1, c + 1));
  }, [trigger, getValues, dispatch, descriptor, steps.length]);

  // self-driver next contract (mirrors the old RequestFormSteps `next`)
  const stepNext = useCallback((value) => {
    if (value === true) {
      setFormData(false);
      setCurrent((c) => c + 1);
    } else {
      setFormData(false);
    }
  }, []);

  const prev = useCallback(() => {
    // Persist the leaving step's draft so nothing typed since the last Next is
    // lost: the form driver holds values in the parent form (just refresh the
    // store mirror for the review screen); self/component steps registered a
    // synchronous draft saver.
    if (driver === "form") {
      if (descriptor && descriptor.syncToStore) {
        descriptor.syncToStore(getValues(), dispatch);
      }
    } else if (draftSaverRef.current) {
      draftSaverRef.current();
    }
    setCurrent((c) => Math.max(0, c - 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver, descriptor, getValues, dispatch]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitted(true);
    let res;
    if (driver === "self") {
      res = await descriptor.submit({ isEdit, finalData, dispatch });
    } else {
      const payload = descriptor.buildPayload(getValues(), { isEdit, id });
      res = await descriptor.submit({ isEdit, payload, dispatch });
    }
    const outcome = descriptor.interpret(res, { id, isEdit });
    if (outcome.ok) {
      snackbar.success(outcome.message);
      goBack();
    } else if (outcome.message) {
      snackbar[outcome.tone || "warning"](outcome.message);
    }
    setIsSubmitted(false);
  }, [driver, descriptor, finalData, getValues, isEdit, id, dispatch, snackbar, goBack]);

  // ---- component-driver: react to the async submit response ----
  const setBodyValidStable = useCallback((status) => {
    setBodyValid((prev) => (prev === status ? prev : status));
  }, []);

  const captureSaved = useCallback((data) => {
    savedRef.current = data;
  }, []);

  // Stable, idempotent step-list setter. OrderSteps reports a fixed-length step
  // list; guard by length so repeated calls never cause a re-render loop.
  const handleStepsReady = useCallback((items) => {
    setComponentSteps((prev) =>
      prev.length === (items ? items.length : 0) ? prev : items || []
    );
  }, []);

  useEffect(() => {
    if (driver !== "component") return;
    if (!componentResponse || responseHandledRef.current) return;
    const outcome = descriptor.interpretResponse
      ? descriptor.interpretResponse(componentResponse)
      : null;
    if (outcome && outcome.ok) {
      responseHandledRef.current = true;
      setLoading(false);
      snackbar.success(outcome.message);
      goBack();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [componentResponse]);

  const handleComponentSubmit = useCallback(() => {
    if (loading || !bodyValid) return;
    const payload = descriptor.buildPayload({
      req: componentReq,
      saved: savedRef.current,
      isEdit,
    });
    setLoading(true);
    descriptor.submit({ payload, dispatch });
  }, [loading, bodyValid, descriptor, componentReq, isEdit, dispatch]);

  if (!descriptor) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">Unknown record type: {resource}</Alert>
      </Box>
    );
  }

  // ---- Delegated driver: the Body owns the whole wizard (steps, non-linear
  // navigation, submit, meta) and reports a view-model up; the controller is a
  // thin chrome that renders PageFormLayout and delegates the button actions.
  // Used by the data-feed configuration wizard whose navigation is non-linear.
  if (driver === "delegated") {
    const Body = descriptor.Body;
    const vm = delegatedVm;
    const act = (name) => {
      const fn = delegatedActionsRef.current && delegatedActionsRef.current[name];
      if (fn) fn();
    };
    return (
      <PageFormLayout
        breadcrumb={vm.breadcrumb}
        title={vm.title}
        backTo={vm.backTo || "/masterData"}
        className={vm.className}
        meta={vm.meta}
        steps={vm.steps}
        current={vm.current}
        headerActions={
          <>
            <Button variant="outlined" onClick={handleDelegatedCancel}>
              Cancel
            </Button>
            <Button
              variant="contained"
              disabled={!vm.canSubmit}
              onClick={() => act("submit")}
            >
              Submit
            </Button>
          </>
        }
        stepActions={
          <>
            <Box className="page-form-actions-left">
              {vm.showPrev && (
                <Button
                  variant="outlined"
                  disabled={vm.prevDisabled}
                  onClick={() => act("previous")}
                >
                  Previous
                </Button>
              )}
            </Box>
            <Box className="page-form-actions-right">
              {vm.showNext && (
                <Button variant="contained" onClick={() => act("next")}>
                  Next
                </Button>
              )}
            </Box>
          </>
        }
      >
        <Body onViewModel={reportDelegatedVm} bindActions={bindDelegatedActions} />
      </PageFormLayout>
    );
  }

  const baseMeta = getPageConfig(descriptor.pageConfigKey, {
    isEdit: hasId,
    crumb:
      (record && (record.shortName || record.agreementName)) ||
      (descriptor.getCrumb ? descriptor.getCrumb(params) : undefined),
  });
  const title = isView
    ? (baseMeta.title || "").replace(/^(Add|Edit)\s+/, "View ")
    : baseMeta.title;

  // Descriptor-provided chrome overrides (breadcrumb/backTo/className/title)
  // for screens whose chrome is dynamic and not expressible via pageConfig
  // alone (e.g. the data feed breadcrumb links back to its View screen).
  const chrome = descriptor.getChrome
    ? descriptor.getChrome(location, { isView, isEdit: hasId }) || {}
    : {};
  const breadcrumb = chrome.breadcrumb || baseMeta.breadcrumb;
  const backTo = chrome.backTo !== undefined ? chrome.backTo : baseMeta.backTo;
  const className = chrome.className || baseMeta.className;
  const resolvedTitle = chrome.title || title;

  // ---- View (read-only) ----
  if (isView) {
    const ViewBody = descriptor.ViewBody;
    const ViewHeaderActions = descriptor.ViewHeaderActions;
    return (
      <PageFormLayout
        breadcrumb={breadcrumb}
        title={resolvedTitle}
        backTo={backTo}
        headerActions={
          ViewHeaderActions ? (
            <ViewHeaderActions record={record} />
          ) : descriptor.editRoute ? (
            <Button
              variant="contained"
              onClick={() => history.push(descriptor.editRoute(id, record))}
            >
              Edit
            </Button>
          ) : null
        }
        className={className}
      >
        {ViewBody ? (
          <ViewBody record={record} />
        ) : (
          <DetailView fields={descriptor.viewFields} record={record || {}} />
        )}
      </PageFormLayout>
    );
  }

  // ---- Component-driver (whole-body) screen: chrome + Submit only ----
  if (driver === "component") {
    const Body = descriptor.Body;
    const submitDisabledExtra = descriptor.submitDisabled
      ? descriptor.submitDisabled(location)
      : false;
    const pending = descriptor.isPending
      ? descriptor.isPending(location)
      : false;
    // OrderSteps owns its own multi-step state but reports its step list so the
    // generic chrome can render the stepper + a pinned Prev/Next footer exactly
    // like the entity/agreement wizards. `bodyValid` is true only on the last
    // (Review) step, which is what gates Submit.
    const isLastStep =
      componentSteps.length > 0 && current === componentSteps.length - 1;
    return (
      <PageFormLayout
        breadcrumb={breadcrumb}
        title={resolvedTitle}
        backTo={backTo}
        headerActions={
          <>
            <Button variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleComponentSubmit}
              disabled={loading || !bodyValid || submitDisabledExtra}
            >
              Submit
            </Button>
          </>
        }
        steps={componentSteps}
        current={current}
        stepActions={
          <>
            <Box className="page-form-actions-left">
              {current > 0 && (
                <Button variant="outlined" onClick={prev}>
                  Previous
                </Button>
              )}
            </Box>
            <Box className="page-form-actions-right">
              {!isLastStep && (
                <Button variant="contained" onClick={() => setFormData(true)}>
                  Next
                </Button>
              )}
            </Box>
          </>
        }
        className={className}
      >
        {pending && pendingAlertOpen && (
          <Alert
            severity="warning"
            onClose={() => setPendingAlertOpen(false)}
            sx={{ mb: 2 }}
          >
            {baseMeta.pendingAlert}
          </Alert>
        )}
        <Body
          current={current}
          formData={formData}
          next={stepNext}
          registerDraftSaver={registerDraftSaver}
          onStepsReady={handleStepsReady}
          isFormValid={setBodyValidStable}
          savedData={captureSaved}
          modalStatus={false}
          licenseID=""
        />
      </PageFormLayout>
    );
  }

  // ---- Create / Edit (wizard) ----
  const isLastStep = current === steps.length - 1;
  const submitDisabled =
    !isLastStep ||
    statusPending ||
    isSubmitted ||
    (driver === "form" && !isValid) ||
    (descriptor.extraSubmitDisabled
      ? descriptor.extraSubmitDisabled(record)
      : false);

  const headerActions = (
    <>
      <Button variant="outlined" onClick={handleCancel}>
        Cancel
      </Button>
      <Button variant="contained" onClick={handleSubmit} disabled={submitDisabled}>
        Submit
      </Button>
    </>
  );

  const onNextClick = driver === "self" ? () => setFormData(true) : nextForm;

  const stepActions = (
    <>
      <Box className="page-form-actions-left">
        {current > 0 && (
          <Button variant="outlined" onClick={prev}>
            Previous
          </Button>
        )}
      </Box>
      <Box className="page-form-actions-right">
        {current < steps.length - 1 && (
          <Button variant="contained" onClick={onNextClick}>
            Next
          </Button>
        )}
      </Box>
    </>
  );

  const StepComponent = steps[current].Component;
  const api = {
    control,
    watch,
    setValue,
    getValues,
    reset,
    trigger,
    mode,
    record,
    list,
    id,
    contractDetails: reviewContractDetails,
    vendorList: reviewVendorList,
  };
  const descriptorStepProps = steps[current].getProps
    ? steps[current].getProps(api)
    : {};
  const driverStepProps =
    driver === "self"
      ? { formData, next: stepNext, registerDraftSaver }
      : {};
  const stepProps = { ...driverStepProps, ...descriptorStepProps };

  return (
    <PageFormLayout
      breadcrumb={breadcrumb}
      title={resolvedTitle}
      backTo={backTo}
      headerActions={headerActions}
      steps={steps.map((s) => ({ key: s.key, title: s.title }))}
      current={current}
      stepActions={stepActions}
      className={className}
    >
      {statusPending && pendingAlertOpen && (
        <Alert
          severity="warning"
          onClose={() => setPendingAlertOpen(false)}
          sx={{ mb: 2 }}
        >
          {baseMeta.pendingAlert}
        </Alert>
      )}
      <StepComponent {...stepProps} />
    </PageFormLayout>
  );
};

export default RecordFormPage;
