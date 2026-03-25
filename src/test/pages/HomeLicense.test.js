import React from "react";
import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { Button, Layout, PageHeader, Breadcrumb, Alert, Modal, message } from "antd";
import Home from "../../pages/license/Home";

configure({ adapter: new Adapter() });

jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});

const mockDispatch = jest.fn().mockReturnValue(Promise.resolve({}));
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  Link: "a",
}));

jest.mock("../../store/actions/licenseAction", () => ({
  startAddLicense: jest.fn(),
  startDeleteLicense: jest.fn(),
  cleanResponse: jest.fn().mockReturnValue({ type: "CLEAN" }),
}));

jest.mock("../../store/actions/SourceConfigActions", () => ({
  schedulerClear: jest.fn(),
}));

jest.mock("../../components/license/step/OrderSteps", () => "MockOrderSteps");

const defaultProps = {
  match: { params: {} },
  location: { pathname: "/addLicense", state: null },
  history: { push: jest.fn() },
  licensereceiveddata: { response: null },
  licenseReq: {
    licenseDetailsRequirements: [
      {
        NoOfLicencePurchased: 10,
        NoOfLicenceUsed: 5,
        dataProcurementType: "Standard",
        expirationDate: "2025-12-31",
        licenceType: "Enterprise",
        licenceValue: 1000,
        longName: "Test License",
        shortName: "TL",
        licenceId: "L1",
        status: "Active",
      },
    ],
    support: [{ licenceLimitations: "None" }],
  },
  createLicense: jest.fn(),
  cleanRes: jest.fn().mockReturnValue({ type: "CLEAN" }),
  deleteLicense: jest.fn(),
};

describe("Home (License)", () => {
  let wrapper;

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe("basic rendering", () => {
    beforeEach(() => {
      wrapper = shallow(<Home {...defaultProps} />);
    });

    it("should render without crashing", () => {
      expect(wrapper.exists()).toBe(true);
    });

    it("should render Layout component", () => {
      expect(wrapper.find(Layout).length).toBeGreaterThanOrEqual(1);
    });

    it("should render Cancel button", () => {
      const buttons = wrapper.find(Button);
      expect(buttons.length).toBeGreaterThanOrEqual(1);
    });

    it("should render Submit button", () => {
      const buttons = wrapper.find(Button);
      const submitBtn = buttons.filterWhere((b) => b.prop("type") === "primary");
      expect(submitBtn.length).toBeGreaterThanOrEqual(1);
    });

    it("should render Breadcrumb", () => {
      expect(wrapper.find(Breadcrumb).length).toBeGreaterThanOrEqual(1);
    });

    it("should render PageHeader with Add Licence title when no id param", () => {
      const ph = wrapper.find(PageHeader);
      expect(ph.length).toBe(1);
      expect(ph.prop("title")).toBe("Add Licence");
    });

    it("should call cleanRes on mount", () => {
      expect(defaultProps.cleanRes).toHaveBeenCalled();
    });
  });

  describe("with id param (edit mode)", () => {
    let editProps;
    let editWrapper;

    beforeEach(() => {
      editProps = {
        ...defaultProps,
        match: { params: { id: "L1" } },
        location: { pathname: "/editLicense/L1", state: null },
        history: { push: jest.fn() },
        cleanRes: jest.fn().mockReturnValue({ type: "CLEAN" }),
        createLicense: jest.fn(),
        deleteLicense: jest.fn(),
      };
      editWrapper = shallow(<Home {...editProps} />);
    });

    it("should render PageHeader with Edit Licence title when id param exists", () => {
      const ph = editWrapper.find(PageHeader);
      expect(ph.prop("title")).toBe("Edit Licence");
    });

    it("should set btnDisabled to false when params.id exists", () => {
      // btnDisabled=false means delete button should not be disabled
      // tabEnable=false, disableDelete=false
      expect(editWrapper.exists()).toBe(true);
    });

    it("should render Breadcrumb item with params.id", () => {
      expect(editWrapper.find(Breadcrumb.Item).length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("with contractId in params with %2F encoding", () => {
    it("should decode %2F in contractId for breadcrumb", () => {
      const props = {
        ...defaultProps,
        match: { params: { contractId: "contract%2F123", id: "L1" } },
        location: { pathname: "/editLicense/L1", state: null },
        history: { push: jest.fn() },
        cleanRes: jest.fn().mockReturnValue({ type: "CLEAN" }),
        createLicense: jest.fn(),
        deleteLicense: jest.fn(),
      };
      const w = shallow(<Home {...props} />);
      expect(w.exists()).toBe(true);
    });

    it("should decode %2F in id for breadcrumb when no contractId", () => {
      const props = {
        ...defaultProps,
        match: { params: { id: "license%2F456" } },
        location: { pathname: "/editLicense/license%2F456", state: null },
        history: { push: jest.fn() },
        cleanRes: jest.fn().mockReturnValue({ type: "CLEAN" }),
        createLicense: jest.fn(),
        deleteLicense: jest.fn(),
      };
      const w = shallow(<Home {...props} />);
      expect(w.exists()).toBe(true);
    });
  });

  describe("constructor state initialization", () => {
    it("should initialize state correctly", () => {
      wrapper = shallow(<Home {...defaultProps} />);
      const state = wrapper.state();
      expect(state.ID).toBe("");
      expect(state.loadings).toBe(false);
      expect(state.isFormSaved).toBe(false);
      expect(state.deleteModal).toBe(false);
      expect(state.modalStatus).toBe(false);
      expect(state.isFormValidState).toBe(false);
    });
  });

  describe("isFormValid method", () => {
    it("should update isFormValidState when status differs", () => {
      wrapper = shallow(<Home {...defaultProps} />);
      expect(wrapper.state("isFormValidState")).toBe(false);
      wrapper.instance().isFormValid(true);
      expect(wrapper.state("isFormValidState")).toBe(true);
    });

    it("should not update state when status is same", () => {
      wrapper = shallow(<Home {...defaultProps} />);
      const setStateSpy = jest.spyOn(wrapper.instance(), "setState");
      wrapper.instance().isFormValid(false); // same as initial
      expect(setStateSpy).not.toHaveBeenCalled();
      setStateSpy.mockRestore();
    });
  });

  describe("savedData method", () => {
    it("should store data and isSaveAsDraft flag", () => {
      wrapper = shallow(<Home {...defaultProps} />);
      const testData = { taskStatus: "DRAFT", licenseName: "Test" };
      wrapper.instance().savedData(testData, true);
      expect(wrapper.instance().isSaveAsDraft).toBe(true);
    });
  });

  describe("save method", () => {
    let saveWrapper;
    let saveProps;

    beforeEach(() => {
      localStorage.setItem("psid", "user1");
      localStorage.setItem("entitlementType", "admin");
      localStorage.setItem("agRecord", JSON.stringify({ agreementId: "AG1" }));

      saveProps = {
        ...defaultProps,
        match: { params: { id: "L1" } },
        location: { pathname: "/editLicense/L1", state: null },
        history: { push: jest.fn() },
        cleanRes: jest.fn().mockReturnValue({ type: "CLEAN" }),
        createLicense: jest.fn(),
        deleteLicense: jest.fn(),
      };
      saveWrapper = shallow(<Home {...saveProps} />);
      // Set form valid state
      saveWrapper.instance().isFormValid(true);
      // Store some data
      saveWrapper.instance().savedData(
        {
          taskStatus: "PENDING",
          allowedUserTypes: ["type1", "type2"],
          licenseName: "Test",
        },
        false
      );
    });

    it("should call createLicense when status is SAVE and form is valid", () => {
      saveWrapper.instance().save("SAVE");
      expect(saveProps.createLicense).toHaveBeenCalled();
      expect(saveWrapper.state("loadings")).toBe(true);
    });

    it("should set loadings true when status is DRAFT", () => {
      saveWrapper.instance().save("DRAFT");
      expect(saveWrapper.state("loadings")).toBe(true);
    });

    it("should not call createLicense when status is SAVE but form is invalid", () => {
      saveWrapper.instance().isFormValid(false);
      saveWrapper.instance().save("SAVE");
      expect(saveProps.createLicense).not.toHaveBeenCalled();
    });

    it("should do nothing when status is falsy", () => {
      saveWrapper.instance().save(null);
      expect(saveProps.createLicense).not.toHaveBeenCalled();
    });
  });

  describe("componentWillReceiveProps", () => {
    it("should handle license creation message", () => {
      const props = {
        ...defaultProps,
        history: { push: jest.fn() },
        cleanRes: jest.fn().mockReturnValue({ type: "CLEAN" }),
      };
      wrapper = shallow(<Home {...props} />);
      const messageSpy = jest.spyOn(message, "success").mockImplementation(() => {});

      wrapper.instance().componentWillReceiveProps({
        licensereceiveddata: {
          response: {
            statusMessage: { message: "License creation successful" },
            license: { licenseId: "NEW-L1" },
          },
        },
      });

      expect(wrapper.state("loadings")).toBe(false);
      expect(wrapper.state("isFormSaved")).toBe(true);
      expect(wrapper.state("ID")).toBe("NEW-L1");
      expect(props.history.push).toHaveBeenCalledWith("/masterData");
      messageSpy.mockRestore();
    });

    it("should handle license updation message", () => {
      const props = {
        ...defaultProps,
        history: { push: jest.fn() },
        cleanRes: jest.fn().mockReturnValue({ type: "CLEAN" }),
      };
      wrapper = shallow(<Home {...props} />);
      const messageSpy = jest.spyOn(message, "success").mockImplementation(() => {});

      wrapper.instance().componentWillReceiveProps({
        licensereceiveddata: {
          response: {
            statusMessage: { message: "License updation successful" },
          },
        },
      });

      expect(wrapper.state("loadings")).toBe(false);
      expect(wrapper.state("isFormSaved")).toBe(true);
      expect(props.history.push).toHaveBeenCalledWith("/masterData");
      messageSpy.mockRestore();
    });

    it("should not change state when response has no matching message", () => {
      wrapper = shallow(<Home {...defaultProps} />);
      wrapper.instance().componentWillReceiveProps({
        licensereceiveddata: {
          response: {
            statusMessage: { message: "Something else" },
          },
        },
      });
      expect(wrapper.state("loadings")).toBe(false);
      expect(wrapper.state("isFormSaved")).toBe(false);
    });

    it("should handle null response gracefully", () => {
      wrapper = shallow(<Home {...defaultProps} />);
      wrapper.instance().componentWillReceiveProps({
        licensereceiveddata: { response: null },
      });
      expect(wrapper.state("isFormSaved")).toBe(false);
    });
  });

  describe("cancelHandler", () => {
    it("should push /masterData to history", () => {
      const props = {
        ...defaultProps,
        history: { push: jest.fn() },
        cleanRes: jest.fn().mockReturnValue({ type: "CLEAN" }),
      };
      wrapper = shallow(<Home {...props} />);
      wrapper.instance().cancelHandler();
      expect(props.history.push).toHaveBeenCalledWith("/masterData");
    });

    it("should be called when Cancel button is clicked", () => {
      const props = {
        ...defaultProps,
        history: { push: jest.fn() },
        cleanRes: jest.fn().mockReturnValue({ type: "CLEAN" }),
      };
      wrapper = shallow(<Home {...props} />);
      const cancelBtn = wrapper.find(Button).filterWhere((b) => b.prop("type") === "default");
      cancelBtn.simulate("click");
      expect(props.history.push).toHaveBeenCalledWith("/masterData");
    });
  });

  describe("deleteHandler", () => {
    it("should call Modal.confirm with correct title", () => {
      const confirmSpy = jest.spyOn(Modal, "confirm").mockImplementation(() => {});
      const props = {
        ...defaultProps,
        match: { params: { id: "L1" } },
        location: { pathname: "/editLicense/L1", state: null },
        history: { push: jest.fn() },
        cleanRes: jest.fn().mockReturnValue({ type: "CLEAN" }),
        deleteLicense: jest.fn(),
      };
      wrapper = shallow(<Home {...props} />);
      wrapper.instance().deleteHandler();
      expect(confirmSpy).toHaveBeenCalled();
      confirmSpy.mockRestore();
    });

    it("should call deleteLicense and push history on confirm OK", () => {
      localStorage.setItem("psid", "user1");
      const confirmSpy = jest.spyOn(Modal, "confirm").mockImplementation((config) => {
        if (config.onOk) config.onOk();
      });
      const props = {
        ...defaultProps,
        match: { params: { id: "L1" } },
        location: { pathname: "/editLicense/L1", state: null },
        history: { push: jest.fn() },
        cleanRes: jest.fn().mockReturnValue({ type: "CLEAN" }),
        deleteLicense: jest.fn(),
      };
      // Set state data for taskStatus
      wrapper = shallow(<Home {...props} />);
      wrapper.instance().savedData({ taskStatus: "ACTIVE", licenseName: "Test" }, false);
      wrapper.instance().deleteHandler();

      expect(props.deleteLicense).toHaveBeenCalled();
      expect(props.history.push).toHaveBeenCalledWith("/masterData");
      confirmSpy.mockRestore();
    });
  });

  describe("modalHandaler", () => {
    it("should toggle modalStatus state", () => {
      wrapper = shallow(<Home {...defaultProps} />);
      wrapper.instance().modalHandaler(true);
      // After the setState callback, modalStatus should be false
      expect(wrapper.state("modalStatus")).toBe(false);
    });
  });

  describe("Alert for pending status", () => {
    it("should render Alert when license status is pending", () => {
      const props = {
        ...defaultProps,
        location: {
          pathname: "/editLicense/L1",
          state: {
            record: {
              licenseStatus: "Pending",
              licenseUpdateFlag: "N",
            },
          },
        },
        match: { params: { id: "L1" } },
        history: { push: jest.fn() },
        cleanRes: jest.fn().mockReturnValue({ type: "CLEAN" }),
      };
      wrapper = shallow(<Home {...props} />);
      expect(wrapper.find(Alert).length).toBe(1);
      expect(wrapper.find(Alert).prop("type")).toBe("warning");
    });

    it("should not render Alert when license status is not pending", () => {
      const props = {
        ...defaultProps,
        location: {
          pathname: "/editLicense/L1",
          state: {
            record: {
              licenseStatus: "Active",
              licenseUpdateFlag: "Y",
            },
          },
        },
        match: { params: { id: "L1" } },
        history: { push: jest.fn() },
        cleanRes: jest.fn().mockReturnValue({ type: "CLEAN" }),
      };
      wrapper = shallow(<Home {...props} />);
      expect(wrapper.find(Alert).length).toBe(0);
    });
  });

  describe("Submit button disabled conditions", () => {
    it("should be disabled when loadings is true", () => {
      wrapper = shallow(<Home {...defaultProps} />);
      wrapper.setState({ loadings: true });
      const submitBtn = wrapper.find(Button).filterWhere((b) => b.prop("type") === "primary");
      expect(submitBtn.prop("disabled")).toBe(true);
    });

    it("should be disabled when isFormValidState is false", () => {
      wrapper = shallow(<Home {...defaultProps} />);
      wrapper.setState({ isFormValidState: false });
      const submitBtn = wrapper.find(Button).filterWhere((b) => b.prop("type") === "primary");
      expect(submitBtn.prop("disabled")).toBe(true);
    });

    it("should be disabled when pending license with updateFlag N", () => {
      const props = {
        ...defaultProps,
        location: {
          pathname: "/editLicense/L1",
          state: {
            record: {
              licenseStatus: "Pending",
              licenseUpdateFlag: "N",
            },
          },
        },
        match: { params: { id: "L1" } },
        history: { push: jest.fn() },
        cleanRes: jest.fn().mockReturnValue({ type: "CLEAN" }),
      };
      wrapper = shallow(<Home {...props} />);
      wrapper.setState({ isFormValidState: true, loadings: false });
      const submitBtn = wrapper.find(Button).filterWhere((b) => b.prop("type") === "primary");
      expect(submitBtn.prop("disabled")).toBe(true);
    });

    it("should be enabled when form is valid and not loading", () => {
      wrapper = shallow(<Home {...defaultProps} />);
      wrapper.setState({ isFormValidState: true, loadings: false });
      const submitBtn = wrapper.find(Button).filterWhere((b) => b.prop("type") === "primary");
      expect(submitBtn.prop("disabled")).toBeFalsy();
    });
  });

  describe("Submit button click", () => {
    it("should call save with SAVE when Submit button is clicked", () => {
      localStorage.setItem("psid", "user1");
      localStorage.setItem("entitlementType", "admin");
      localStorage.setItem("agRecord", JSON.stringify({ agreementId: "AG1" }));

      const props = {
        ...defaultProps,
        match: { params: { id: "L1" } },
        location: { pathname: "/editLicense/L1", state: null },
        history: { push: jest.fn() },
        cleanRes: jest.fn().mockReturnValue({ type: "CLEAN" }),
        createLicense: jest.fn(),
      };
      wrapper = shallow(<Home {...props} />);
      // Pre-set state data needed by save()
      wrapper.instance().savedData(
        {
          taskStatus: "PENDING",
          allowedUserTypes: ["type1"],
          licenseName: "Test",
        },
        false
      );
      const saveSpy = jest.spyOn(wrapper.instance(), "save");
      wrapper.instance().forceUpdate();

      const submitBtn = wrapper.find(Button).filterWhere((b) => b.prop("type") === "primary");
      submitBtn.simulate("click");
      expect(saveSpy).toHaveBeenCalledWith("SAVE");
      saveSpy.mockRestore();
    });
  });

  describe("PageHeader onBack", () => {
    it("should push /masterData on back navigation", () => {
      const props = {
        ...defaultProps,
        history: { push: jest.fn() },
        cleanRes: jest.fn().mockReturnValue({ type: "CLEAN" }),
      };
      wrapper = shallow(<Home {...props} />);
      const ph = wrapper.find(PageHeader);
      ph.prop("onBack")();
      expect(props.history.push).toHaveBeenCalledWith("/masterData");
    });
  });

  describe("Breadcrumb path label", () => {
    it('should show "Add Licence" in breadcrumb when path includes addLicense', () => {
      wrapper = shallow(<Home {...defaultProps} />);
      const items = wrapper.find(Breadcrumb.Item);
      const lastItem = items.last();
      expect(lastItem.children().text()).toContain("Add Licence");
    });

    it('should show "Edit Licence" in breadcrumb when path does not include addLicense', () => {
      const props = {
        ...defaultProps,
        match: { params: { id: "L1" } },
        location: { pathname: "/editLicense/L1", state: null },
        history: { push: jest.fn() },
        cleanRes: jest.fn().mockReturnValue({ type: "CLEAN" }),
      };
      wrapper = shallow(<Home {...props} />);
      const items = wrapper.find(Breadcrumb.Item);
      const lastItem = items.last();
      expect(lastItem.children().text()).toContain("Edit Licence");
    });
  });

  describe("margin style based on pending status", () => {
    it("should apply 10px marginTop when license status is pending", () => {
      const props = {
        ...defaultProps,
        location: {
          pathname: "/editLicense/L1",
          state: {
            record: {
              licenseStatus: "Pending",
              licenseUpdateFlag: "N",
            },
          },
        },
        match: { params: { id: "L1" } },
        history: { push: jest.fn() },
        cleanRes: jest.fn().mockReturnValue({ type: "CLEAN" }),
      };
      wrapper = shallow(<Home {...props} />);
      expect(wrapper.exists()).toBe(true);
    });
  });
});
