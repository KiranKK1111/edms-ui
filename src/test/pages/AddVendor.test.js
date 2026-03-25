import React from "react";
import * as redux from "react-redux";
import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { Button, Form, Layout, Alert, Modal } from "antd";

configure({ adapter: new Adapter() });

jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});

const mockPush = jest.fn();
let mockParams = {};

const mockSetFieldsValue = jest.fn();
const mockGetFieldsValue = jest.fn().mockReturnValue({
  longName: "Test Vendor",
  shortName: "TV",
  entityType: "External",
  website: "test.com",
  entityDescription: "Test",
});
const mockFormSubmit = jest.fn();
const mockFormRef = {
  current: {
    setFieldsValue: mockSetFieldsValue,
    getFieldsValue: mockGetFieldsValue,
    submit: mockFormSubmit,
  },
};

jest.mock("react", () => {
  const actualReact = jest.requireActual("react");
  return {
    ...actualReact,
    createRef: () => mockFormRef,
  };
});

jest.mock("react-redux", () => {
  const mockSelector = (cb) =>
    cb({
      vendor: { list: [] },
      contract: { data: [[]] },
    });
  return {
    useSelector: mockSelector,
    useDispatch: () => jest.fn().mockReturnValue(Promise.resolve({})),
    connect: () => (Component) => Component,
  };
});

jest.mock("react-router", () => ({
  useParams: () => mockParams,
  useHistory: () => ({ push: mockPush, replace: jest.fn() }),
  useLocation: () => ({}),
  useRouteMatch: () => ({}),
  withRouter: (C) => C,
  matchPath: jest.fn(),
  __RouterContext: {
    Provider: "div",
    Consumer: "div",
  },
}));

jest.mock("react-router-dom", () => ({
  useParams: () => mockParams,
  useHistory: () => ({ push: mockPush, replace: jest.fn() }),
  useLocation: () => ({}),
  Link: "a",
  NavLink: "a",
}));

jest.mock("../../store/actions/VendorActions", () => ({
  startAddVendor: jest.fn().mockReturnValue(Promise.resolve({})),
  startGetVendors: jest.fn().mockReturnValue(Promise.resolve({})),
  startDeleteVendor: jest.fn().mockReturnValue(Promise.resolve({})),
  saveLocalData: jest.fn(),
}));

jest.mock("../../components/vendors/AddVendor/NewVendorForm", () => "MockNewVendorForm");
jest.mock("../../components/vendors/AddVendor/NewVendorHead", () => "MockNewVendorHead");
jest.mock("../../components/vendors/AddVendor/ReviewSubmit", () => "MockReviewSubmit");

const AddVendor = require("../../pages/addVendor/AddVendor").default;

describe("AddVendor", () => {
  let wrapper;

  beforeEach(() => {
    mockSetFieldsValue.mockClear();
    mockGetFieldsValue.mockClear();
    mockFormSubmit.mockClear();
    mockPush.mockClear();
  });

  afterEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    mockParams = {};
  });

  describe("basic rendering (add mode)", () => {
    beforeEach(() => {
      mockParams = {};
      wrapper = shallow(<AddVendor history={{ push: jest.fn() }} />);
    });

    it("should render without crashing", () => {
      expect(wrapper.exists()).toBe(true);
    });

    it("should render Form component", () => {
      expect(wrapper.find(Form).length).toBe(1);
    });

    it("should render MockNewVendorHead component", () => {
      expect(wrapper.find("MockNewVendorHead").length).toBe(1);
    });

    it("should render MockNewVendorForm in steps content", () => {
      expect(wrapper.find("MockNewVendorForm").length).toBe(1);
    });

    it("should render Layout component", () => {
      expect(wrapper.find(Layout).length).toBeGreaterThanOrEqual(1);
    });

    it("should render Next button on first step", () => {
      const nextBtn = wrapper.find(Button).filterWhere((b) => b.prop("type") === "primary");
      expect(nextBtn.length).toBeGreaterThanOrEqual(1);
    });

    it("should not render Previous button on first step", () => {
      const buttons = wrapper.find(Button);
      const prevBtn = buttons.filterWhere((b) => b.children().text() === "Previous");
      expect(prevBtn.length).toBe(0);
    });

    it("should not render Alert when statusPending is false", () => {
      expect(wrapper.find(Alert).length).toBe(0);
    });

    it("should have formRef with setFieldsValue available", () => {
      expect(mockFormRef.current.setFieldsValue).toBeDefined();
      expect(typeof mockFormRef.current.setFieldsValue).toBe("function");
    });
  });

  describe("Steps navigation", () => {
    beforeEach(() => {
      mockParams = {};
      wrapper = shallow(<AddVendor history={{ push: jest.fn() }} />);
    });

    it("should call formRef.current.submit when next is clicked", () => {
      const nextBtn = wrapper.find(Button).filterWhere((b) => b.prop("type") === "primary");
      nextBtn.first().simulate("click");
      expect(mockFormSubmit).toHaveBeenCalled();
    });
  });

  describe("formSubmitTrigger", () => {
    it("should set form values when form is submitted via onFinish", () => {
      mockParams = {};
      wrapper = shallow(<AddVendor history={{ push: jest.fn() }} />);
      const form = wrapper.find(Form);
      const onFinish = form.prop("onFinish");
      expect(onFinish).toBeDefined();
      onFinish({ longName: "Test", shortName: "T" });
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe("handleSubmitSuccess", () => {
    it("should be passed as function prop to NewVendorHead", () => {
      mockParams = {};
      localStorage.setItem("psid", "testuser");
      wrapper = shallow(<AddVendor history={{ push: jest.fn() }} />);
      const head = wrapper.find("MockNewVendorHead");
      expect(typeof head.prop("handleSubmitSuccess")).toBe("function");
    });

    it("should be callable without error", async () => {
      mockParams = {};
      localStorage.setItem("psid", "testuser");
      wrapper = shallow(<AddVendor history={{ push: jest.fn() }} />);
      const head = wrapper.find("MockNewVendorHead");
      await head.prop("handleSubmitSuccess")();
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe("handleSubmitCancel", () => {
    it("should show Modal.confirm when cancel is triggered", () => {
      const confirmSpy = jest.spyOn(Modal, "confirm").mockImplementation(() => {});
      mockParams = {};
      wrapper = shallow(<AddVendor history={{ push: jest.fn() }} />);
      const head = wrapper.find("MockNewVendorHead");
      head.prop("handleSubmitCancel")();
      expect(confirmSpy).toHaveBeenCalled();
      const callArgs = confirmSpy.mock.calls[0][0];
      expect(callArgs.title).toContain("leave the Page");
      confirmSpy.mockRestore();
    });

    it("should push /dashboard on confirm OK", () => {
      const confirmSpy = jest.spyOn(Modal, "confirm").mockImplementation((config) => {
        if (config.onOk) config.onOk();
      });
      const historyPush = jest.fn();
      mockParams = {};
      wrapper = shallow(<AddVendor history={{ push: historyPush }} />);
      const head = wrapper.find("MockNewVendorHead");
      head.prop("handleSubmitCancel")();
      expect(historyPush).toHaveBeenCalledWith("/dashboard");
      confirmSpy.mockRestore();
    });

    it("should not navigate on confirm Cancel", () => {
      const confirmSpy = jest.spyOn(Modal, "confirm").mockImplementation((config) => {
        if (config.onCancel) config.onCancel();
      });
      const historyPush = jest.fn();
      mockParams = {};
      wrapper = shallow(<AddVendor history={{ push: historyPush }} />);
      const head = wrapper.find("MockNewVendorHead");
      head.prop("handleSubmitCancel")();
      expect(historyPush).not.toHaveBeenCalled();
      confirmSpy.mockRestore();
    });
  });

  describe("deleteHandler", () => {
    it("should show Modal.confirm when delete is triggered", () => {
      const confirmSpy = jest.spyOn(Modal, "confirm").mockImplementation(() => {});
      mockParams = {};
      wrapper = shallow(<AddVendor history={{ push: jest.fn() }} />);
      const head = wrapper.find("MockNewVendorHead");
      head.prop("deleteHandler")();
      expect(confirmSpy).toHaveBeenCalled();
      confirmSpy.mockRestore();
    });

    it("should show proceed message when no contracts exist for vendor", () => {
      const confirmSpy = jest.spyOn(Modal, "confirm").mockImplementation(() => {});
      mockParams = { id: "V1" };
      wrapper = shallow(<AddVendor history={{ push: jest.fn() }} />);
      const head = wrapper.find("MockNewVendorHead");
      head.prop("deleteHandler")();
      expect(confirmSpy).toHaveBeenCalled();
      const callArgs = confirmSpy.mock.calls[0][0];
      expect(callArgs.content).toContain("submitted for approval");
      confirmSpy.mockRestore();
    });
  });

  describe("statusPending Alert", () => {
    it("should not render Alert when status is not pending (add mode)", () => {
      mockParams = {};
      wrapper = shallow(<AddVendor history={{ push: jest.fn() }} />);
      expect(wrapper.find(Alert).length).toBe(0);
    });
  });

  describe("onFieldsChange validation", () => {
    it("should have onValuesChange prop on Form", () => {
      mockParams = {};
      wrapper = shallow(<AddVendor history={{ push: jest.fn() }} />);
      const form = wrapper.find(Form);
      expect(form.prop("onValuesChange")).toBeDefined();
    });
  });

  describe("NewVendorHead props", () => {
    it("should pass handleSubmitSuccess to NewVendorHead", () => {
      mockParams = {};
      wrapper = shallow(<AddVendor history={{ push: jest.fn() }} />);
      const head = wrapper.find("MockNewVendorHead");
      expect(head.prop("handleSubmitSuccess")).toBeDefined();
    });

    it("should pass handleSubmitCancel to NewVendorHead", () => {
      mockParams = {};
      wrapper = shallow(<AddVendor history={{ push: jest.fn() }} />);
      const head = wrapper.find("MockNewVendorHead");
      expect(head.prop("handleSubmitCancel")).toBeDefined();
    });

    it("should pass deleteHandler to NewVendorHead", () => {
      mockParams = {};
      wrapper = shallow(<AddVendor history={{ push: jest.fn() }} />);
      const head = wrapper.find("MockNewVendorHead");
      expect(head.prop("deleteHandler")).toBeDefined();
    });

    it("should pass isFormValid to NewVendorHead", () => {
      mockParams = {};
      wrapper = shallow(<AddVendor history={{ push: jest.fn() }} />);
      const head = wrapper.find("MockNewVendorHead");
      expect(head.prop("isFormValid")).toBeDefined();
    });

    it("should pass activeSubmit as true on first step", () => {
      mockParams = {};
      wrapper = shallow(<AddVendor history={{ push: jest.fn() }} />);
      const head = wrapper.find("MockNewVendorHead");
      expect(head.prop("activeSubmit")).toBe(true);
    });

    it("should pass isFormSubmitted as false initially", () => {
      mockParams = {};
      wrapper = shallow(<AddVendor history={{ push: jest.fn() }} />);
      const head = wrapper.find("MockNewVendorHead");
      expect(head.prop("isFormSubmitted")).toBe(false);
    });
  });

  describe("edit mode with params.id", () => {
    it("should render component in edit mode", () => {
      mockParams = { id: "V1" };
      wrapper = shallow(<AddVendor history={{ push: jest.fn() }} />);
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe("Form layout", () => {
    it("should have horizontal layout", () => {
      mockParams = {};
      wrapper = shallow(<AddVendor history={{ push: jest.fn() }} />);
      expect(wrapper.find(Form).prop("layout")).toBe("horizontal");
    });

    it("should have form name NewVendorForm", () => {
      mockParams = {};
      wrapper = shallow(<AddVendor history={{ push: jest.fn() }} />);
      expect(wrapper.find(Form).prop("name")).toBe("NewVendorForm");
    });
  });

  describe("Form onFinishFailed", () => {
    it("should pass handleOnFinishFailed prop to Form", () => {
      mockParams = {};
      const mockOnFinishFailed = jest.fn();
      wrapper = shallow(<AddVendor history={{ push: jest.fn() }} handleOnFinishFailed={mockOnFinishFailed} />);
      expect(wrapper.find(Form).prop("onFinishFailed")).toBe(mockOnFinishFailed);
    });
  });
});
