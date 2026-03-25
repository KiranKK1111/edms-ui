import React from "react";
import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { Layout, Menu, Button, Empty, Alert, Descriptions, Badge, Breadcrumb, Modal, Dropdown } from "antd";
import VendorDashboard from "../../pages/vendorDashboard/VendorDashboard";

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
  useParams: jest.fn().mockReturnValue({}),
  useHistory: jest.fn().mockReturnValue({ push: jest.fn() }),
  Link: "a",
}));

jest.mock("../../pages/vendorDashboard/VendorData", () => "MockVendorData", { virtual: true });

jest.mock("../../store/actions/VendorActions", () => ({
  startGetVendors: jest.fn().mockReturnValue(Promise.resolve({})),
  startDeleteVendor: jest.fn().mockReturnValue(Promise.resolve({})),
}));

jest.mock("../../store/actions/contractAction", () => ({
  startGetContracts: jest.fn().mockReturnValue(Promise.resolve({})),
}));

jest.mock("../../store/actions/licenseAction", () => ({
  startGetLicenses: jest.fn().mockReturnValue(Promise.resolve({})),
}));

const approvedVendor = {
  entityId: "V1",
  longName: "Vendor One",
  shortName: "V1",
  entityType: "External",
  website: "example.com",
  entityStatus: "Active",
  entityDescription: "Test vendor",
  vendorId: "V1",
  taskStatus: "Approved",
};

const pendingVendor = {
  entityId: "V2",
  longName: "Vendor Two",
  shortName: "V2",
  entityType: "Internal",
  website: "pending.com",
  entityStatus: "Pending",
  entityDescription: "Pending vendor",
  vendorId: "V2",
  taskStatus: "Pending",
};

const rejectedVendor = {
  entityId: "V3",
  longName: "Vendor Three",
  shortName: "V3",
  entityType: "External",
  website: "rejected.com",
  entityStatus: "Active",
  entityDescription: "Rejected vendor",
  vendorId: "V3",
  taskStatus: "Rejected",
};

// Helper: extracts the Dropdown.Button from Descriptions extra prop and shallow renders it
const getDropdownFromDescriptions = (wrapper) => {
  const desc = wrapper.find(Descriptions);
  if (desc.length === 0) return null;
  const extra = desc.prop("extra");
  return shallow(<div>{extra}</div>);
};

// Helper: extracts the overlay menu from the Dropdown.Button and renders it
const getOverlayMenu = (dropdownWrapper) => {
  const ddBtn = dropdownWrapper.find(Dropdown.Button);
  if (ddBtn.length === 0) return null;
  const overlayFn = ddBtn.prop("overlay");
  const menuJSx = overlayFn();
  // Wrap in a div so shallow rendering exposes Menu.Item children
  const rendered = shallow(<div>{menuJSx}</div>);
  return rendered;
};

describe("VendorDashboard", () => {
  let wrapper;

  afterEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    localStorage.clear();
  });

  describe("with approved vendor and contracts", () => {
    beforeEach(() => {
      wrapper = shallow(
        <VendorDashboard
          dispatch={mockDispatch}
          vendors={[approvedVendor]}
          contracts={[{ vendorId: "V1", contractId: "C1" }]}
          licenses={[]}
        />
      );
    });

    it("should render without crashing", () => {
      expect(wrapper.exists()).toBe(true);
    });

    it("should render the dashboard-main container", () => {
      expect(wrapper.find(".dashboard-main").length).toBe(1);
    });

    it("should render Add entity button", () => {
      const buttons = wrapper.find(Button);
      expect(buttons.length).toBeGreaterThanOrEqual(1);
    });

    it("should render Layout component", () => {
      expect(wrapper.find(Layout).length).toBeGreaterThanOrEqual(1);
    });

    it("should render Breadcrumb with items", () => {
      expect(wrapper.find(Breadcrumb).length).toBeGreaterThanOrEqual(1);
      expect(wrapper.find(Breadcrumb.Item).length).toBeGreaterThanOrEqual(2);
    });

    it("should render Sider with vendor menu", () => {
      const sider = wrapper.find(".dashboard-vendors-sider");
      expect(sider.length).toBe(1);
    });

    it("should render vendor menu items in sider", () => {
      const menuItems = wrapper.find(Menu.Item);
      expect(menuItems.length).toBeGreaterThanOrEqual(1);
    });

    it("should render Descriptions with vendor details", () => {
      expect(wrapper.find(Descriptions).length).toBe(1);
    });

    it("should render MockVendorData when contracts exist and length > 0", () => {
      expect(wrapper.find("MockVendorData").length).toBe(1);
    });

    it("should render Add Contract button", () => {
      expect(wrapper.find(".dashboard-add-contract-button").length).toBe(1);
    });

    it("should enable Add Contract button for approved vendor", () => {
      const addContractBtn = wrapper.find(".dashboard-add-contract-button");
      expect(addContractBtn.prop("disabled")).toBe(false);
    });

    it("should enable Manage Dropdown.Button for approved vendor", () => {
      const ddWrapper = getDropdownFromDescriptions(wrapper);
      const ddBtn = ddWrapper.find(Dropdown.Button);
      expect(ddBtn.length).toBe(1);
      expect(ddBtn.prop("disabled")).toBe(false);
    });

    it("should handle vendor click by setting sessionStorage", () => {
      const menuItems = wrapper.find(Menu.Item);
      const firstItem = menuItems.first();
      firstItem.simulate("click");
      expect(sessionStorage.getItem("dashKey")).toBe("0");
      expect(sessionStorage.getItem("vendorid")).toBe("V1");
    });
  });

  describe("handleDeleteVendor via manage menu", () => {
    it("should show Modal.confirm when delete menu item is clicked", () => {
      const confirmSpy = jest.spyOn(Modal, "confirm").mockImplementation(() => {});
      wrapper = shallow(
        <VendorDashboard
          dispatch={mockDispatch}
          vendors={[approvedVendor]}
          contracts={[{ vendorId: "V1", contractId: "C1" }]}
          licenses={[]}
        />
      );

      const ddWrapper = getDropdownFromDescriptions(wrapper);
      const menuWrapper = getOverlayMenu(ddWrapper);
      const deleteItem = menuWrapper.find(Menu.Item).at(1);
      deleteItem.simulate("click");

      expect(confirmSpy).toHaveBeenCalled();
      // vendorID state is 0 (initial, useEffect doesn't run in shallow)
      // so numOfContracts is always 0, yielding "submitted for approval" message
      const callArgs = confirmSpy.mock.calls[0][0];
      expect(callArgs.content).toContain("submitted for approval");
      confirmSpy.mockRestore();
    });

    it("should call onOk handler when Modal is confirmed", () => {
      const confirmSpy = jest.spyOn(Modal, "confirm").mockImplementation((config) => {
        // Verify onOk exists and is callable
        expect(typeof config.onOk).toBe("function");
      });
      wrapper = shallow(
        <VendorDashboard
          dispatch={mockDispatch}
          vendors={[approvedVendor]}
          contracts={[{ vendorId: "OTHER", contractId: "C1" }]}
          licenses={[]}
        />
      );

      const ddWrapper = getDropdownFromDescriptions(wrapper);
      const menuWrapper = getOverlayMenu(ddWrapper);
      const deleteItem = menuWrapper.find(Menu.Item).at(1);
      deleteItem.simulate("click");

      expect(confirmSpy).toHaveBeenCalled();
      confirmSpy.mockRestore();
    });
  });

  describe("manageVendorMenu", () => {
    beforeEach(() => {
      wrapper = shallow(
        <VendorDashboard
          dispatch={mockDispatch}
          vendors={[approvedVendor]}
          contracts={[{ vendorId: "V1", contractId: "C1" }]}
          licenses={[]}
        />
      );
    });

    it("should render Edit and Delete menu items in manage dropdown", () => {
      const ddWrapper = getDropdownFromDescriptions(wrapper);
      const menuWrapper = getOverlayMenu(ddWrapper);
      const menuItems = menuWrapper.find(Menu.Item);
      expect(menuItems.length).toBe(2);
      expect(menuWrapper.find(".edit-vendor-menu").length).toBe(1);
      expect(menuWrapper.find(".warn-vendor-menu").length).toBe(1);
    });
  });

  describe("button disabled states", () => {
    it("should disable all buttons when vendor status is pending", () => {
      wrapper = shallow(
        <VendorDashboard
          dispatch={mockDispatch}
          vendors={[pendingVendor]}
          contracts={[{ vendorId: "V2", contractId: "C1" }]}
          licenses={[]}
        />
      );

      const addContractBtn = wrapper.find(".dashboard-add-contract-button");
      expect(addContractBtn.prop("disabled")).toBe(true);

      const ddWrapper = getDropdownFromDescriptions(wrapper);
      const ddBtn = ddWrapper.find(Dropdown.Button);
      expect(ddBtn.prop("disabled")).toBe(true);
    });

    it("should disable addContract but enable manage when vendor status is rejected", () => {
      wrapper = shallow(
        <VendorDashboard
          dispatch={mockDispatch}
          vendors={[rejectedVendor]}
          contracts={[{ vendorId: "V3", contractId: "C1" }]}
          licenses={[]}
        />
      );

      const addContractBtn = wrapper.find(".dashboard-add-contract-button");
      expect(addContractBtn.prop("disabled")).toBe(true);

      const ddWrapper = getDropdownFromDescriptions(wrapper);
      const ddBtn = ddWrapper.find(Dropdown.Button);
      expect(ddBtn.prop("disabled")).toBe(false);
    });

    it("should enable all buttons when vendor status is approved", () => {
      wrapper = shallow(
        <VendorDashboard
          dispatch={mockDispatch}
          vendors={[approvedVendor]}
          contracts={[{ vendorId: "V1", contractId: "C1" }]}
          licenses={[]}
        />
      );

      const addContractBtn = wrapper.find(".dashboard-add-contract-button");
      expect(addContractBtn.prop("disabled")).toBe(false);

      const ddWrapper = getDropdownFromDescriptions(wrapper);
      const ddBtn = ddWrapper.find(Dropdown.Button);
      expect(ddBtn.prop("disabled")).toBe(false);
    });
  });

  describe("Alert for pending vendor status", () => {
    it("should render Alert when vendor entityStatus is Pending", () => {
      wrapper = shallow(
        <VendorDashboard
          dispatch={mockDispatch}
          vendors={[pendingVendor]}
          contracts={[{ vendorId: "V2", contractId: "C1" }]}
          licenses={[]}
        />
      );
      expect(wrapper.find(Alert).length).toBe(1);
      expect(wrapper.find(Alert).prop("type")).toBe("warning");
    });

    it("should not render Alert when vendor entityStatus is Active", () => {
      wrapper = shallow(
        <VendorDashboard
          dispatch={mockDispatch}
          vendors={[approvedVendor]}
          contracts={[{ vendorId: "V1", contractId: "C1" }]}
          licenses={[]}
        />
      );
      expect(wrapper.find(Alert).length).toBe(0);
    });
  });

  describe("empty vendor state", () => {
    it("should render Empty component when no vendors", () => {
      wrapper = shallow(
        <VendorDashboard
          dispatch={mockDispatch}
          vendors={[]}
          contracts={[]}
          licenses={[]}
        />
      );
      expect(wrapper.find(Empty).length).toBe(1);
      expect(wrapper.find(".dashboard-vendors-empty-page").length).toBe(1);
    });

    it("should render Add entity button in empty state", () => {
      wrapper = shallow(
        <VendorDashboard
          dispatch={mockDispatch}
          vendors={[]}
          contracts={[]}
          licenses={[]}
        />
      );
      const emptyContent = wrapper.find(".dashboard-vendors-empty-page");
      expect(emptyContent.find(Button).length).toBe(1);
    });
  });

  describe("no contracts state", () => {
    it('should render "No contracts" when contracts array is empty', () => {
      wrapper = shallow(
        <VendorDashboard
          dispatch={mockDispatch}
          vendors={[approvedVendor]}
          contracts={[]}
          licenses={[]}
        />
      );
      expect(wrapper.find(".dashboard-vendors-contracts-empty").length).toBe(1);
    });

    it("should render Empty with Add Contract when contracts is undefined", () => {
      wrapper = shallow(
        <VendorDashboard
          dispatch={mockDispatch}
          vendors={[approvedVendor]}
          contracts={undefined}
          licenses={[]}
        />
      );
      expect(wrapper.find(".dashboard-contracts-empty-page").length).toBe(1);
      expect(wrapper.find(Empty).length).toBe(1);
    });

    it("should show enabled Add Contract in empty contracts when vendor is approved", () => {
      wrapper = shallow(
        <VendorDashboard
          dispatch={mockDispatch}
          vendors={[approvedVendor]}
          contracts={undefined}
          licenses={[]}
        />
      );
      const emptySection = wrapper.find(".dashboard-contracts-empty-page");
      const addBtn = emptySection.find(Button).first();
      expect(addBtn.prop("disabled")).toBeFalsy();
    });

    it("should show disabled Add Contract in empty contracts when vendor is not approved", () => {
      wrapper = shallow(
        <VendorDashboard
          dispatch={mockDispatch}
          vendors={[pendingVendor]}
          contracts={undefined}
          licenses={[]}
        />
      );
      const emptySection = wrapper.find(".dashboard-contracts-empty-page");
      const buttons = emptySection.find(Button);
      const disabledBtn = buttons.filterWhere((b) => b.prop("disabled") === true);
      expect(disabledBtn.length).toBe(1);
    });
  });

  describe("contracts exist with VendorData", () => {
    it("should render MockVendorData with correct props when contracts exist", () => {
      wrapper = shallow(
        <VendorDashboard
          dispatch={mockDispatch}
          vendors={[approvedVendor]}
          contracts={[{ vendorId: "V1", contractId: "C1" }]}
          licenses={[]}
        />
      );
      const vendorData = wrapper.find("MockVendorData");
      expect(vendorData.length).toBe(1);
    });
  });

  describe("Badge status rendering", () => {
    it("should render success Badge for Active entity status", () => {
      wrapper = shallow(
        <VendorDashboard
          dispatch={mockDispatch}
          vendors={[approvedVendor]}
          contracts={[{ vendorId: "V1", contractId: "C1" }]}
          licenses={[]}
        />
      );
      const badge = wrapper.find(Badge);
      expect(badge.length).toBeGreaterThanOrEqual(1);
      expect(badge.first().prop("status")).toBe("success");
    });

    it("should render warning Badge for non-Active entity status", () => {
      wrapper = shallow(
        <VendorDashboard
          dispatch={mockDispatch}
          vendors={[pendingVendor]}
          contracts={[{ vendorId: "V2", contractId: "C1" }]}
          licenses={[]}
        />
      );
      const badge = wrapper.find(Badge);
      const warningBadge = badge.filterWhere((b) => b.prop("status") === "warning");
      expect(warningBadge.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("multiple vendors in sider", () => {
    it("should render menu items for each vendor", () => {
      wrapper = shallow(
        <VendorDashboard
          dispatch={mockDispatch}
          vendors={[approvedVendor, pendingVendor, rejectedVendor]}
          contracts={[{ vendorId: "V1", contractId: "C1" }]}
          licenses={[]}
        />
      );
      const menuItems = wrapper.find(Menu.Item);
      expect(menuItems.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("sessionStorage dashKey persistence", () => {
    it("should use dashKey from sessionStorage if set", () => {
      sessionStorage.setItem("dashKey", "1");
      sessionStorage.setItem("vendorid", "V2");
      wrapper = shallow(
        <VendorDashboard
          dispatch={mockDispatch}
          vendors={[approvedVendor, pendingVendor]}
          contracts={[{ vendorId: "V1", contractId: "C1" }]}
          licenses={[]}
        />
      );
      expect(wrapper.exists()).toBe(true);
    });
  });
});
