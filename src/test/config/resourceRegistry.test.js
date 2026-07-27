import RESOURCES, { getResource } from "../../config/resourceRegistry";

// The registry's descriptor helpers are pure functions — unit-test them
// directly (no rendering). Actions dispatched by init/submit are asserted via
// a capturing mock dispatch.

describe("getResource", () => {
  it("returns the descriptor for a known resource", () => {
    expect(getResource("entity")).toBe(RESOURCES.entity);
    expect(getResource("agreement")).toBe(RESOURCES.agreement);
    expect(getResource("licence")).toBe(RESOURCES.licence);
    expect(getResource("dataset")).toBe(RESOURCES.dataset);
    expect(getResource("datafeed")).toBe(RESOURCES.datafeed);
    expect(getResource("datafeedConfig")).toBe(RESOURCES.datafeedConfig);
  });

  it("returns null for an unknown resource", () => {
    expect(getResource("nope")).toBeNull();
  });
});

describe("entity descriptor", () => {
  const entity = RESOURCES.entity;

  afterEach(() => localStorage.clear());

  it("listSelector reads state.vendor.list and tolerates absence", () => {
    expect(entity.listSelector({ vendor: { list: [{ entityId: "E1" }] } })).toEqual([
      { entityId: "E1" },
    ]);
    expect(entity.listSelector({})).toEqual([]);
  });

  it("findRecord matches on entityId", () => {
    const list = [{ entityId: "E1" }, { entityId: "E2" }];
    expect(entity.findRecord(list, "E2")).toEqual({ entityId: "E2" });
    expect(entity.findRecord(list, "E9")).toBeUndefined();
  });

  it("toForm maps every form field with fallbacks and no extras", () => {
    expect(entity.toForm({})).toEqual({
      entityId: "",
      entityType: "",
      longName: "",
      shortName: "",
      entityStatus: "Pending",
      website: "",
      entityDescription: "",
    });
    const full = entity.toForm({
      entityId: "E1",
      entityType: "Vendor",
      longName: "Long",
      shortName: "Short",
      entityStatus: "Active",
      website: "www.x.com",
      entityDescription: "desc",
    });
    expect(full.entityId).toBe("E1");
    expect(full.entityStatus).toBe("Active");
    // The phantom review-only field must NOT be produced.
    expect(full).not.toHaveProperty("existingVendorWithScb");
  });

  it("buildPayload create: adds createdBy/roleName and update flag N", () => {
    localStorage.setItem("psid", "111");
    localStorage.setItem("entitlementType", "Admin");
    const payload = entity.buildPayload(
      { shortName: "S" },
      { isEdit: false, id: undefined }
    );
    expect(payload).toEqual(
      expect.objectContaining({
        shortName: "S",
        createdBy: "111",
        roleName: "Admin",
        entityUpdateFlag: "N",
      })
    );
    expect(payload).not.toHaveProperty("lastUpdatedBy");
  });

  it("buildPayload edit: forces entityId + lastUpdatedBy and update flag Y", () => {
    localStorage.setItem("psid", "222");
    localStorage.setItem("entitlementType", "Admin");
    const payload = entity.buildPayload(
      { shortName: "S", entityId: "stale" },
      { isEdit: true, id: "E7" }
    );
    expect(payload).toEqual(
      expect.objectContaining({
        entityId: "E7",
        lastUpdatedBy: "222",
        entityUpdateFlag: "Y",
      })
    );
    expect(payload).not.toHaveProperty("createdBy");
  });

  it("interpret handles create success, update success, error and unknown", () => {
    expect(
      entity.interpret({ data: { entityManagement: { entityId: "E1" } } }, { id: "x" })
    ).toEqual({ ok: true, message: "Form entity Id E1 submitted successfully!" });
    expect(entity.interpret({ data: { statusMessage: {} } }, { id: "E2" })).toEqual({
      ok: true,
      message: "Form entity Id E2 Updated successfully!",
    });
    expect(entity.interpret({ message: "boom" }, { id: "x" })).toEqual({
      ok: false,
      message: "boom",
      tone: "warning",
    });
    expect(entity.interpret(null, { id: "x" })).toEqual({ ok: false });
  });

  it("step duplicate-name checks exclude the record being edited", () => {
    const api = {
      list: [
        { entityId: "E1", shortName: "Dup", longName: "DupLong" },
        { entityId: "E2", shortName: "Other", longName: "OtherLong" },
      ],
    };
    const props = entity.steps[0].getProps({ ...api });
    const evt = (v) => ({ target: { value: v } });
    // duplicate found
    expect(props.handleNameCheck(evt(" Dup "), undefined)).toBe(true);
    expect(props.handleLongNameCheck(evt("DupLong"), undefined)).toBe(true);
    // same record excluded during edit
    expect(props.handleNameCheck(evt("Dup"), "E1")).toBe(false);
    expect(props.handleLongNameCheck(evt("DupLong"), "E1")).toBe(false);
    // no list
    const empty = entity.steps[0].getProps({});
    expect(empty.handleNameCheck(evt("Dup"), undefined)).toBe(false);
  });

  it("editRoute builds the record route", () => {
    expect(entity.editRoute("E1")).toBe("/record/entity/edit/E1");
  });
});

describe("agreement descriptor", () => {
  const agreement = RESOURCES.agreement;

  afterEach(() => localStorage.clear());

  it("selectors read their slices and tolerate absence", () => {
    const state = {
      contract: {
        data: [[{ agreementId: "A1" }]],
        selectedContract: [{ agreementId: "A1" }],
        saveFinalData: { a: 1 },
        contractDetails: [{ agreementName: "N" }],
      },
      vendor: { list: [{ shortName: "V" }] },
    };
    expect(agreement.contractsSelector(state)).toEqual([[{ agreementId: "A1" }]]);
    expect(agreement.selectedSelector(state)).toEqual([{ agreementId: "A1" }]);
    expect(agreement.selectedSelector({})).toEqual([]);
    expect(agreement.finalDataSelector(state)).toEqual({ a: 1 });
    expect(agreement.contractDetailsSelector(state)).toEqual({ agreementName: "N" });
    expect(agreement.vendorListSelector(state)).toEqual([{ shortName: "V" }]);
    expect(agreement.vendorListSelector({})).toEqual([]);
  });

  it("selectForEdit filters by the given id", () => {
    const dispatch = jest.fn();
    agreement.selectForEdit(dispatch, {
      id: "A2",
      contractsList: [[{ agreementId: "A1" }, { agreementId: "A2" }]],
    });
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ payload: [{ agreementId: "A2" }] })
    );
  });

  it("selectForEdit falls back to localStorage agId", () => {
    localStorage.setItem("agId", "A1");
    const dispatch = jest.fn();
    agreement.selectForEdit(dispatch, {
      id: undefined,
      contractsList: [[{ agreementId: "A1" }]],
    });
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ payload: [{ agreementId: "A1" }] })
    );
  });

  it("init and clearForCreate dispatch their actions", () => {
    const dispatch = jest.fn();
    agreement.init(dispatch);
    expect(dispatch).toHaveBeenCalledTimes(2);
    dispatch.mockClear();
    agreement.clearForCreate(dispatch);
    expect(dispatch).toHaveBeenCalledTimes(2);
  });

  it("pendingFromSelected only for pending status", () => {
    expect(
      agreement.pendingFromSelected([{ agreementStatus: "Pending" }])
    ).toBe(true);
    expect(agreement.pendingFromSelected([{ agreementStatus: "Active" }])).toBe(
      false
    );
    expect(agreement.pendingFromSelected([])).toBeFalsy();
    expect(agreement.pendingFromSelected(null)).toBeFalsy();
  });

  it("interpret handles create, update and failure", () => {
    expect(
      agreement.interpret({ data: { agreement: { agreementId: "A1" } } })
    ).toEqual({
      ok: true,
      message: "Form agreement Id A1 submitted successfully!",
    });
    expect(
      agreement.interpret({ data: { statusMessage: { code: 200 } } })
    ).toEqual({ ok: true, message: "Form updated successfully!" });
    expect(agreement.interpret({ data: { statusMessage: { code: 500 } } })).toEqual({
      ok: false,
      message: "Please fill the form!",
      tone: "warning",
    });
    expect(agreement.interpret(null)).toEqual({
      ok: false,
      message: "Please fill the form!",
      tone: "warning",
    });
  });
});

describe("licence descriptor", () => {
  const licence = RESOURCES.licence;

  afterEach(() => localStorage.clear());

  it("getCrumb decodes %2F and tolerates missing params", () => {
    expect(licence.getCrumb({ id: "a%2Fb" })).toBe("a/b");
    expect(licence.getCrumb({ id: "plain" })).toBe("plain");
    expect(licence.getCrumb({ contractId: "c1" })).toBe("c1");
    expect(licence.getCrumb({})).toBeUndefined();
  });

  it("isPending and submitDisabled read the router record", () => {
    const loc = (record) => ({ state: { record } });
    expect(licence.isPending(loc({ licenseStatus: "Pending" }))).toBe(true);
    expect(licence.isPending(loc({ licenseStatus: "Active" }))).toBe(false);
    expect(licence.isPending({})).toBe(false);
    expect(
      licence.submitDisabled(
        loc({ licenseUpdateFlag: "N", licenseStatus: "Pending" })
      )
    ).toBe(true);
    expect(
      licence.submitDisabled(
        loc({ licenseUpdateFlag: "Y", licenseStatus: "Pending" })
      )
    ).toBe(false);
    expect(licence.submitDisabled({})).toBe(false);
  });

  const req = () => ({
    licenseDetailsRequirements: [
      {
        NoOfLicencePurchased: "10",
        NoOfLicenceUsed: "2",
        dataProcurementType: "Type",
        expirationDate: "2026-12-31T00:00:00.000Z",
        licenceType: "Full",
        licenceValue: "100",
        longName: "Long",
        shortName: "Short",
        licenceId: "L1",
        status: "Active",
      },
    ],
    support: [{ licenceLimitations: "None" }],
  });

  it("buildPayload create: blanks licenseId, sets createdBy and flag N", () => {
    localStorage.setItem("psid", "111");
    localStorage.setItem("entitlementType", "Admin");
    localStorage.setItem("agRecord", JSON.stringify({ agreementId: "AG1" }));
    const payload = licence.buildPayload({ req: req(), isEdit: false });
    expect(payload).toEqual(
      expect.objectContaining({
        licenseAgreementId: "AG1",
        licenseId: "",
        licenseCreatedBy: "111",
        licenseLastUpdatedBy: "",
        licenseUpdateFlag: "N",
        isUpdate: false,
        licenseLimitations: "None",
        licenseShortName: "Short",
        licenseCcy: "USD",
      })
    );
    expect(payload.licenseExpiryDate).toMatch(/^2026-12-3\dT\d{2}:\d{2}:\d{2}$/);
  });

  it("buildPayload edit: keeps licenceId, sets lastUpdatedBy and flag Y", () => {
    localStorage.setItem("psid", "222");
    localStorage.setItem("entitlementType", "Admin");
    localStorage.setItem("agRecord", JSON.stringify({ agreementId: "AG1" }));
    const payload = licence.buildPayload({ req: req(), isEdit: true });
    expect(payload).toEqual(
      expect.objectContaining({
        licenseId: "L1",
        licenseCreatedBy: "",
        licenseLastUpdatedBy: "222",
        licenseUpdateFlag: "Y",
        isUpdate: true,
      })
    );
  });

  it("interpretResponse handles creation, updation and unknown", () => {
    expect(
      licence.interpretResponse({
        statusMessage: { message: "License creation done" },
        license: { licenseId: "L1" },
      })
    ).toEqual(
      expect.objectContaining({ ok: true, message: expect.stringContaining("L1") })
    );
    expect(
      licence.interpretResponse({
        statusMessage: { message: "License updation done" },
      })
    ).toEqual({ ok: true, message: " The Licence has been successfully updated!" });
    expect(licence.interpretResponse({})).toEqual({ ok: false });
    expect(licence.interpretResponse(null)).toEqual({ ok: false });
  });
});

describe("dataset descriptor", () => {
  const dataset = RESOURCES.dataset;

  it("selectedSelector wraps formData in a stable singleton list", () => {
    const formData = { datasetId: "DS1" };
    const state = { dataset: { formData } };
    const first = dataset.selectedSelector(state);
    expect(first).toEqual([formData]);
    // Same value → SAME array reference (guards the useSelector loop fix).
    expect(dataset.selectedSelector(state)).toBe(first);
    // Empty → the stable empty list, always the same reference.
    const empty1 = dataset.selectedSelector({ dataset: { formData: {} } });
    const empty2 = dataset.selectedSelector({});
    expect(empty1).toEqual([]);
    expect(empty1).toBe(empty2);
  });

  it("pendingFromSelected requires a datasetId AND pending status", () => {
    expect(
      dataset.pendingFromSelected([
        { datasetId: "DS1", datasetStatus: "Pending" },
      ])
    ).toBe(true);
    expect(
      dataset.pendingFromSelected([{ datasetId: "DS1", datasetStatus: "Active" }])
    ).toBe(false);
    expect(
      dataset.pendingFromSelected([{ datasetStatus: "Pending" }])
    ).toBeFalsy();
    expect(dataset.pendingFromSelected([])).toBeFalsy();
  });

  it("interpret handles update, create, error and unknown", () => {
    expect(
      dataset.interpret({ data: { statusMessage: {} } }, { isEdit: true })
    ).toEqual({ ok: true, message: " The Dataset has been successfully updated!" });
    expect(
      dataset.interpret(
        { data: { statusMessage: {}, dataset: { datasetId: "DS9" } } },
        { isEdit: false }
      )
    ).toEqual(
      expect.objectContaining({ ok: true, message: expect.stringContaining("DS9") })
    );
    expect(dataset.interpret({ message: "boom" }, { isEdit: false })).toEqual({
      ok: false,
      message: "boom",
      tone: "error",
    });
    expect(dataset.interpret(null, { isEdit: false })).toEqual({ ok: false });
  });
});

describe("datafeed descriptor", () => {
  const datafeed = RESOURCES.datafeed;

  it("pendingFromSelected requires feedId AND pending status", () => {
    expect(
      datafeed.pendingFromSelected([{ feedId: "DF1", feedStatus: "Pending" }])
    ).toBe(true);
    expect(
      datafeed.pendingFromSelected([{ feedId: "DF1", feedStatus: "Active" }])
    ).toBe(false);
    expect(datafeed.pendingFromSelected([])).toBeFalsy();
  });

  it("extraSubmitDisabled only for an inactive existing feed", () => {
    expect(
      datafeed.extraSubmitDisabled({ feedId: "DF1", feedStatus: "Inactive" })
    ).toBe(true);
    expect(
      datafeed.extraSubmitDisabled({ feedId: "DF1", feedStatus: "Active" })
    ).toBe(false);
    expect(datafeed.extraSubmitDisabled(null)).toBe(false);
  });

  it("getChrome view mode: view class + breadcrumb back to master data", () => {
    const chrome = datafeed.getChrome(
      { state: { dataset: { shortName: "DS one" }, isView: true } },
      { isView: true }
    );
    expect(chrome.className).toBe("view-datafeed-page");
    expect(chrome.backTo).toBe("/masterData");
    expect(chrome.breadcrumb[2]).toEqual({ name: "View Data Feed" });
  });

  it("getChrome add mode: backTo master data, Add crumb", () => {
    const chrome = datafeed.getChrome({ state: { dataset: { shortName: "DS" } } }, {
      isView: false,
    });
    expect(chrome.backTo).toBe("/masterData");
    expect(chrome.breadcrumb[2]).toEqual({ name: "Add Data Feed" });
  });

  it("getChrome edit mode: backTo the feed view target, Edit crumb", () => {
    const chrome = datafeed.getChrome(
      {
        state: {
          dataset: { shortName: "A/B" },
          isUpdate: true,
          datafeedRecord: { feedId: "DF1" },
        },
      },
      { isView: false }
    );
    // slash() encodes the shortName for the URL
    expect(chrome.backTo.pathname).toBe("/masterData/A%2FB/viewDatafeed");
    expect(chrome.breadcrumb[2]).toEqual({ name: "Edit Data Feed" });
  });

  it("getChrome edit-from-update-page: backTo master data", () => {
    const chrome = datafeed.getChrome(
      {
        state: {
          dataset: { shortName: "DS" },
          isUpdate: true,
          fromLink: "updatePage",
        },
      },
      { isView: false }
    );
    expect(chrome.backTo).toBe("/masterData");
  });

  it("getChrome tolerates a missing location state entirely", () => {
    const chrome = datafeed.getChrome(null, { isView: false });
    expect(chrome.backTo).toBe("/masterData");
    expect(chrome.breadcrumb[2]).toEqual({ name: "Add Data Feed" });
  });

  it("interpret handles update, create, error and unknown", () => {
    expect(
      datafeed.interpret({ data: { statusMessage: {} } }, { isEdit: true })
    ).toEqual({
      ok: true,
      message: " The Data Feed has been successfully updated!",
    });
    expect(
      datafeed.interpret(
        { data: { statusMessage: {}, datafeed: { feedId: "DF9" } } },
        { isEdit: false }
      )
    ).toEqual(
      expect.objectContaining({ ok: true, message: expect.stringContaining("DF9") })
    );
    expect(datafeed.interpret({ message: "err" }, { isEdit: false })).toEqual({
      ok: false,
      message: "err",
      tone: "error",
    });
    expect(datafeed.interpret(undefined, { isEdit: false })).toEqual({ ok: false });
  });
});
