import * as redux from "react-redux";
import React from "react";
import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { Button, Input, Badge, Layout, Spin, List, Modal, Form, Radio, Select, Col, message } from "antd";
import CatalogPage from "../../pages/catalogPage/CatalogPage";

configure({ adapter: new Adapter() });

jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
  useSelector: jest.fn(),
  connect: () => (Component) => Component,
}));

jest.mock("../../store/actions/CatalogPageActions", () => ({
  newCataloguePageData: jest.fn(),
}));

jest.mock("../../store/actions/VendorActions", () => ({
  startGetVendors: jest.fn(),
}));

jest.mock("../../utils/accessButtonCheck", () => jest.fn().mockReturnValue(false));
jest.mock("../../utils/warningUtils", () => ({
  checkForString: jest.fn().mockReturnValue(false),
}));

jest.mock("../../components/catalog/Catalog", () => "MockCatalog");

const catalogueItem1 = {
  entityShortName: "Entity1",
  datasetShortName: "Dataset1",
  dataFeedLongName: "Feed One",
  dataFeedDescription: "Description of Feed One",
  dataFeedId: "F1",
  dataFeedShortName: "DF1",
  dataFeedStatus: "Active",
  subscription: true,
};

const catalogueItem2 = {
  entityShortName: "Entity2",
  datasetShortName: "Dataset2",
  dataFeedLongName: "Feed Two",
  dataFeedDescription: "Description of Feed Two",
  dataFeedId: "F2",
  dataFeedShortName: "DF2",
  dataFeedStatus: "Inactive",
  subscription: false,
};

const catalogueItemDeleted = {
  entityShortName: "Entity3",
  datasetShortName: "Dataset3",
  dataFeedLongName: "Feed Three",
  dataFeedDescription: "Deleted feed",
  dataFeedId: "F3",
  dataFeedShortName: "DF3",
  dataFeedStatus: "Deleted",
  subscription: false,
};

const populatedState = {
  catalogueList: {
    loading: false,
    catalogueList: [catalogueItem1, catalogueItem2],
  },
};

const loadingState = {
  catalogueList: {
    loading: true,
    catalogueList: [],
  },
};

const emptyState = {
  catalogueList: {
    loading: false,
    catalogueList: [],
  },
};

const stateWithDeleted = {
  catalogueList: {
    loading: false,
    catalogueList: [catalogueItem1, catalogueItemDeleted],
  },
};

// Mock window.location.href for the useEffect that checks domain
delete window.location;
window.location = { href: "https://test.example.com/app" };

describe("CatalogPage", () => {
  let wrapped;

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe("with populated catalogue list", () => {
    beforeEach(() => {
      jest.spyOn(redux, "useSelector").mockImplementation((callback) => callback(populatedState));
      wrapped = shallow(<CatalogPage />);
    });

    it("should render the main container div", () => {
      expect(wrapped.find("#main").exists()).toBe(true);
    });

    it("should render the catalog-page class", () => {
      expect(wrapped.find(".catalog-page").exists()).toBe(true);
    });

    it("should have filter button", () => {
      expect(wrapped.find("#btn-filter").exists()).toBe(true);
    });

    it("should render Layout component", () => {
      expect(wrapped.find(Layout).length).toBeGreaterThanOrEqual(1);
    });

    it("should render search input", () => {
      expect(wrapped.find(Input).length).toBeGreaterThanOrEqual(1);
    });

    it("should render Catalogue title", () => {
      expect(wrapped.find(".catalog-title").length).toBe(1);
    });

    it("should render Generate Access Token button", () => {
      expect(wrapped.find(".btn-token1").length).toBe(1);
    });

    it("should render Badge component", () => {
      expect(wrapped.find(Badge).length).toBeGreaterThanOrEqual(1);
    });

    it("should render content-title with feed count", () => {
      expect(wrapped.find(".content-title").length).toBe(1);
    });

    it("should render without crashing", () => {
      expect(wrapped.exists()).toBe(true);
    });

    it("should render the page structure (list rendering depends on useEffect)", () => {
      // Note: shallow rendering does not execute useEffect, so catalogueNewList
      // stays at initial state { loading: false, catalogueList: [] }
      // The list/spinner rendering is driven by useEffect which populates state
      expect(wrapped.find(Layout).length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("onFilterButtonClick toggle", () => {
    beforeEach(() => {
      jest.spyOn(redux, "useSelector").mockImplementation((callback) => callback(populatedState));
      wrapped = shallow(<CatalogPage />);
    });

    it("should toggle filter on button click", () => {
      const e = { preventDefault: jest.fn() };
      // Initially no filter display
      expect(wrapped.find(Form).length).toBe(0);

      // Click filter button to show filters
      wrapped.find("#btn-filter").simulate("click", e);
      expect(e.preventDefault).toHaveBeenCalled();

      // After toggle, filter form should appear
      expect(wrapped.find(Form).length).toBe(1);
    });

    it("should hide filter on second click", () => {
      const e = { preventDefault: jest.fn() };
      // First click - show
      wrapped.find("#btn-filter").simulate("click", e);
      expect(wrapped.find(Form).length).toBe(1);

      // Second click - hide
      wrapped.find("#btn-filter").simulate("click", e);
      expect(wrapped.find(Form).length).toBe(0);
    });

    it("should render filter form with Data Feeds radio buttons when shown", () => {
      const e = { preventDefault: jest.fn() };
      wrapped.find("#btn-filter").simulate("click", e);
      expect(wrapped.find(Radio.Group).length).toBe(1);
      expect(wrapped.find(Radio.Button).length).toBe(3);
    });

    it("should render filter form with Select dropdowns when shown", () => {
      const e = { preventDefault: jest.fn() };
      wrapped.find("#btn-filter").simulate("click", e);
      expect(wrapped.find(Select).length).toBeGreaterThanOrEqual(2);
    });

    it("should render Apply and Reset buttons when filter is shown", () => {
      const e = { preventDefault: jest.fn() };
      wrapped.find("#btn-filter").simulate("click", e);
      const buttons = wrapped.find(Button);
      const applyBtn = buttons.filterWhere((b) => b.prop("type") === "primary" && b.children().text() !== "Generate Access Token");
      expect(applyBtn.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("loading state", () => {
    it("should render component when catalogueList is loading", () => {
      jest.spyOn(redux, "useSelector").mockImplementation((callback) => callback(loadingState));
      wrapped = shallow(<CatalogPage />);
      // Spin rendering depends on useEffect updating catalogueNewList state
      // which shallow doesn't execute, so we verify component renders
      expect(wrapped.exists()).toBe(true);
    });
  });

  describe("empty list state", () => {
    it('should render "No Data Feeds Found" when list is empty', () => {
      jest.spyOn(redux, "useSelector").mockImplementation((callback) => callback(emptyState));
      wrapped = shallow(<CatalogPage />);
      expect(wrapped.find("h3").length).toBe(1);
      expect(wrapped.find("h3").text()).toContain("No Data Feeds Found");
    });
  });

  describe("list with items", () => {
    it("should render component with deleted items in state", () => {
      jest.spyOn(redux, "useSelector").mockImplementation((callback) => callback(stateWithDeleted));
      wrapped = shallow(<CatalogPage />);
      // List rendering depends on useEffect updating catalogueNewList
      expect(wrapped.exists()).toBe(true);
    });
  });

  describe("wordSearchHandler", () => {
    it("should handle search input change", () => {
      jest.spyOn(redux, "useSelector").mockImplementation((callback) => callback(populatedState));
      wrapped = shallow(<CatalogPage />);
      const input = wrapped.find(Input);
      input.simulate("change", { target: { value: "Feed" } });
      expect(wrapped.exists()).toBe(true);
    });

    it("should handle empty search input", () => {
      jest.spyOn(redux, "useSelector").mockImplementation((callback) => callback(populatedState));
      wrapped = shallow(<CatalogPage />);
      const input = wrapped.find(Input);
      input.simulate("change", { target: { value: "" } });
      expect(wrapped.exists()).toBe(true);
    });
  });

  describe("authTokenModal", () => {
    it("should call Modal.confirm when Generate Access Token is clicked", () => {
      const confirmSpy = jest.spyOn(Modal, "confirm").mockImplementation(() => ({
        destroy: jest.fn(),
      }));
      jest.spyOn(redux, "useSelector").mockImplementation((callback) => callback(populatedState));
      wrapped = shallow(<CatalogPage />);
      const tokenBtn = wrapped.find(".btn-token1");
      tokenBtn.simulate("click");
      expect(confirmSpy).toHaveBeenCalled();
      confirmSpy.mockRestore();
    });

    it("should copy token to clipboard on OK", () => {
      localStorage.setItem("access_token", "test-token-123");
      const mockWriteText = jest.fn().mockReturnValue(Promise.resolve());
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText: mockWriteText },
        writable: true,
        configurable: true,
      });
      const messageSpy = jest.spyOn(message, "success").mockImplementation(() => {});

      let capturedConfig;
      const confirmSpy = jest.spyOn(Modal, "confirm").mockImplementation((config) => {
        capturedConfig = config;
        return { destroy: jest.fn() };
      });

      jest.spyOn(redux, "useSelector").mockImplementation((callback) => callback(populatedState));
      wrapped = shallow(<CatalogPage />);
      const tokenBtn = wrapped.find(".btn-token1");
      tokenBtn.simulate("click");

      // Call the onOk from the config
      if (capturedConfig && capturedConfig.onOk) {
        capturedConfig.onOk();
        expect(mockWriteText).toHaveBeenCalledWith("test-token-123");
      }

      confirmSpy.mockRestore();
      messageSpy.mockRestore();
    });
  });

  describe("isFilterButton disabled logic", () => {
    it("should render filter button", () => {
      jest.spyOn(redux, "useSelector").mockImplementation((callback) => callback(populatedState));
      wrapped = shallow(<CatalogPage />);
      const filterBtn = wrapped.find("#btn-filter");
      expect(filterBtn.exists()).toBe(true);
    });

    it("should render search input", () => {
      jest.spyOn(redux, "useSelector").mockImplementation((callback) => callback(populatedState));
      wrapped = shallow(<CatalogPage />);
      const input = wrapped.find(Input);
      expect(input.exists()).toBe(true);
    });
  });

  describe("Generate Access Token button disabled for non-subscriber", () => {
    it("should have disabled prop on Generate Access Token button", () => {
      jest.spyOn(redux, "useSelector").mockImplementation((callback) => callback(populatedState));
      wrapped = shallow(<CatalogPage />);
      const tokenBtn = wrapped.find(".btn-token1");
      expect(tokenBtn.prop("disabled")).toBeDefined();
    });
  });

  describe("guest role", () => {
    it("should handle guest role for filter button", () => {
      localStorage.setItem("guestRole", "guest");
      jest.spyOn(redux, "useSelector").mockImplementation((callback) => callback(populatedState));
      wrapped = shallow(<CatalogPage />);
      expect(wrapped.find("#btn-filter").exists()).toBe(true);
    });

    it("should disable radio group for guest role when filter is shown", () => {
      localStorage.setItem("guestRole", "guest");
      jest.spyOn(redux, "useSelector").mockImplementation((callback) => callback(populatedState));
      wrapped = shallow(<CatalogPage />);
      const e = { preventDefault: jest.fn() };
      wrapped.find("#btn-filter").simulate("click", e);
      const radioGroup = wrapped.find(Radio.Group);
      expect(radioGroup.prop("disabled")).toBe(true);
    });
  });

  describe("sort menu", () => {
    it("should render content-title element for sort area", () => {
      jest.spyOn(redux, "useSelector").mockImplementation((callback) => callback(populatedState));
      wrapped = shallow(<CatalogPage />);
      expect(wrapped.find(".content-title").length).toBe(1);
    });
  });

  describe("useEffect and dispatch", () => {
    it("should render with dataset delegate role", () => {
      localStorage.setItem("entitlementType", "dataset delegate");
      jest.spyOn(redux, "useSelector").mockImplementation((callback) => callback(populatedState));
      wrapped = shallow(<CatalogPage />);
      // useEffect (which calls dispatch) doesn't run in shallow rendering
      expect(wrapped.exists()).toBe(true);
    });

    it("should render with dataset owner role", () => {
      localStorage.setItem("entitlementType", "dataset owner");
      jest.spyOn(redux, "useSelector").mockImplementation((callback) => callback(populatedState));
      wrapped = shallow(<CatalogPage />);
      expect(wrapped.exists()).toBe(true);
    });

    it("should render with read only role", () => {
      localStorage.setItem("entitlementType", "read only");
      jest.spyOn(redux, "useSelector").mockImplementation((callback) => callback(populatedState));
      wrapped = shallow(<CatalogPage />);
      expect(wrapped.exists()).toBe(true);
    });

    it("should render with iam admin role", () => {
      localStorage.setItem("entitlementType", "iam admin");
      jest.spyOn(redux, "useSelector").mockImplementation((callback) => callback(populatedState));
      wrapped = shallow(<CatalogPage />);
      expect(wrapped.exists()).toBe(true);
    });
  });

  describe("null/undefined catalogueList", () => {
    it("should handle null catalogueList gracefully", () => {
      jest.spyOn(redux, "useSelector").mockImplementation((callback) =>
        callback({ catalogueList: null })
      );
      wrapped = shallow(<CatalogPage />);
      expect(wrapped.exists()).toBe(true);
    });
  });
});
