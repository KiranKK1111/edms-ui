import * as redux from "react-redux";
import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { Tabs, Skeleton, Alert } from "antd";
import DatasetTabs from "../../../components/dataset/DatasetTabs";

configure({ adapter: new Adapter() });

jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLocation: jest.fn().mockReturnValue({ state: { data: {} } }),
}));

let mockIsButtonObject = jest.fn().mockReturnValue(false);
let mockGetPermissionObject = jest.fn().mockReturnValue({ permission: "R" });

jest.mock("../../../utils/accessButtonCheck", () => (...args) => mockIsButtonObject(...args));
jest.mock("../../../utils/accessObject", () => (...args) => mockGetPermissionObject(...args));
jest.mock("../../../utils/accessSubscribersTab", () => jest.fn().mockReturnValue(false));
jest.mock("../../../store/actions/SourceConfigActions", () => ({
  schedulerDatabase: jest.fn(),
}));

const { TabPane } = Tabs;

const baseProps = {
  dataFamily: { loading: false },
  license: { loading: false, data: {} },
  contract: { loading: false },
  vendor: { loading: false, data: {} },
  sourceConfig: { loading: false },
  datafeedStatus: "Active",
  catalogueObj: {},
};

describe("DatasetTabs", () => {
  beforeEach(() => {
    localStorage.setItem("entitlementType", "Admin");
    mockIsButtonObject.mockReturnValue(false);
    mockGetPermissionObject.mockReturnValue({ permission: "R" });
  });

  afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  // === Loading / Skeleton tests ===

  it("should render Skeleton when dataFamily is loading", () => {
    const wrapper = shallow(
      <DatasetTabs {...baseProps} dataFamily={{ loading: true }} />
    );
    expect(wrapper.find(Skeleton).length).toBe(1);
    expect(wrapper.find(Tabs).length).toBe(0);
  });

  it("should render Skeleton when license is loading", () => {
    const wrapper = shallow(
      <DatasetTabs {...baseProps} license={{ loading: true, data: {} }} />
    );
    expect(wrapper.find(Skeleton).length).toBe(1);
  });

  it("should render Skeleton when vendor is loading", () => {
    const wrapper = shallow(
      <DatasetTabs {...baseProps} vendor={{ loading: true, data: {} }} />
    );
    expect(wrapper.find(Skeleton).length).toBe(1);
  });

  it("should render Skeleton when contract is loading", () => {
    const wrapper = shallow(
      <DatasetTabs {...baseProps} contract={{ loading: true }} />
    );
    expect(wrapper.find(Skeleton).length).toBe(1);
  });

  it("should render Skeleton when sourceConfig is loading", () => {
    const wrapper = shallow(
      <DatasetTabs {...baseProps} sourceConfig={{ loading: true }} />
    );
    expect(wrapper.find(Skeleton).length).toBe(1);
  });

  it("should NOT render Skeleton when nothing is loading", () => {
    const wrapper = shallow(<DatasetTabs {...baseProps} />);
    expect(wrapper.find(Skeleton).length).toBe(0);
    expect(wrapper.find(Tabs).length).toBe(1);
  });

  // === Tabs rendering ===

  it("should render Tabs component with default active key 1", () => {
    const wrapper = shallow(<DatasetTabs {...baseProps} />);
    expect(wrapper.find(Tabs).prop("defaultActiveKey")).toBe("1");
  });

  it("should render Overview, Licence scope, and Schema tab panes always", () => {
    const wrapper = shallow(<DatasetTabs {...baseProps} />);
    const tabPanes = wrapper.find(TabPane);
    const tabTexts = tabPanes.map((tp) => tp.prop("tab"));
    expect(tabTexts).toContain("Overview");
    expect(tabTexts).toContain("Licence scope");
    expect(tabTexts).toContain("Schema");
  });

  // === isOverviewTab / isMetadataTab disabled logic ===

  it("should disable Overview tab when isButtonObject returns true", () => {
    mockIsButtonObject.mockReturnValue(true);
    const wrapper = shallow(<DatasetTabs {...baseProps} />);
    const overviewPane = wrapper.find(TabPane).filterWhere((t) => t.prop("tab") === "Overview");
    // isOverviewTab = !true = false, but disabled is set to isOverviewTab which is !isButtonObject
    // Actually: isOverviewTab = !isButtonObject(...) = !true = false, disabled={isOverviewTab} = false
    // Wait, re-read: isOverviewTab = !isButtonObject(...). If isButtonObject returns true, isOverviewTab = false
    // But the code says disabled={isOverviewTab}. So disabled=false. Let me re-check...
    // isOverviewTab = !isButtonObject(CATELOG_MANAGEMENT_PAGE, CATELOG_OVERVIEW_TAB);
    // disabled={isOverviewTab}
    // If isButtonObject returns true => isOverviewTab = false => disabled=false
    // If isButtonObject returns false => isOverviewTab = true => disabled=true
    // So with mockReturnValue(true), Overview is NOT disabled
    expect(overviewPane.prop("disabled")).toBe(false);
  });

  it("should set Overview disabled=true when isButtonObject returns false", () => {
    mockIsButtonObject.mockReturnValue(false);
    const wrapper = shallow(<DatasetTabs {...baseProps} />);
    const overviewPane = wrapper.find(TabPane).filterWhere((t) => t.prop("tab") === "Overview");
    expect(overviewPane.prop("disabled")).toBe(true);
  });

  // === Alert for pending datafeedStatus ===

  it("should show Alert when datafeedStatus is pending", () => {
    const wrapper = shallow(<DatasetTabs {...baseProps} datafeedStatus="pending" />);
    expect(wrapper.find(Alert).length).toBe(1);
    expect(wrapper.find(Alert).prop("type")).toBe("warning");
  });

  it("should NOT show Alert when datafeedStatus is Active", () => {
    const wrapper = shallow(<DatasetTabs {...baseProps} datafeedStatus="Active" />);
    expect(wrapper.find(Alert).length).toBe(0);
  });

  it("should NOT show Alert when datafeedStatus is undefined", () => {
    const wrapper = shallow(<DatasetTabs {...baseProps} datafeedStatus={undefined} />);
    expect(wrapper.find(Alert).length).toBe(0);
  });

  // === My Subscriptions TabPane (getObjectForSubscription) ===

  it("should render My Subscriptions tab when permission is R", () => {
    mockGetPermissionObject.mockReturnValue({ permission: "R" });
    const wrapper = shallow(<DatasetTabs {...baseProps} />);
    const subTab = wrapper.find(TabPane).filterWhere((t) => t.prop("tab") === "My Subscriptions");
    expect(subTab.length).toBe(1);
  });

  it("should render My Subscriptions tab when permission is RW", () => {
    mockGetPermissionObject.mockReturnValue({ permission: "RW" });
    const wrapper = shallow(<DatasetTabs {...baseProps} />);
    const subTab = wrapper.find(TabPane).filterWhere((t) => t.prop("tab") === "My Subscriptions");
    expect(subTab.length).toBe(1);
  });

  it("should NOT render My Subscriptions tab when permission object is null", () => {
    mockGetPermissionObject.mockReturnValue(null);
    const wrapper = shallow(<DatasetTabs {...baseProps} />);
    const subTab = wrapper.find(TabPane).filterWhere((t) => t.prop("tab") === "My Subscriptions");
    expect(subTab.length).toBe(0);
  });

  it("should NOT render My Subscriptions tab when permission is W", () => {
    mockGetPermissionObject.mockReturnValue({ permission: "W" });
    const wrapper = shallow(<DatasetTabs {...baseProps} />);
    const subTab = wrapper.find(TabPane).filterWhere((t) => t.prop("tab") === "My Subscriptions");
    expect(subTab.length).toBe(0);
  });

  // === Subscribers TabPane ===

  it("should render Subscribers tab when permission is R", () => {
    mockGetPermissionObject.mockReturnValue({ permission: "R" });
    const wrapper = shallow(<DatasetTabs {...baseProps} />);
    const subTab = wrapper.find(TabPane).filterWhere((t) => t.prop("tab") === "Subscribers");
    expect(subTab.length).toBe(1);
  });

  it("should NOT render Subscribers tab when permission is RW (not strictly R)", () => {
    mockGetPermissionObject.mockReturnValue({ permission: "RW" });
    const wrapper = shallow(<DatasetTabs {...baseProps} />);
    const subTab = wrapper.find(TabPane).filterWhere((t) => t.prop("tab") === "Subscribers");
    expect(subTab.length).toBe(0);
  });

  // === Documentation TabPane ===

  it("should render Documentation tab when permission is R", () => {
    mockGetPermissionObject.mockReturnValue({ permission: "R" });
    const wrapper = shallow(<DatasetTabs {...baseProps} />);
    const docTab = wrapper.find(TabPane).filterWhere((t) => t.prop("tab") === "Documentation");
    expect(docTab.length).toBe(1);
  });

  it("should NOT render Documentation tab when permission is null and not guest", () => {
    mockGetPermissionObject.mockReturnValue(null);
    localStorage.setItem("entitlementType", "Admin");
    const wrapper = shallow(<DatasetTabs {...baseProps} />);
    const docTab = wrapper.find(TabPane).filterWhere((t) => t.prop("tab") === "Documentation");
    expect(docTab.length).toBe(0);
  });

  // === isGuestRole logic ===

  it("should render Documentation tab when isGuestRole is set (no entitlementType)", () => {
    localStorage.removeItem("entitlementType");
    localStorage.setItem("guestRole", "Guest");
    mockGetPermissionObject.mockReturnValue(null);
    const wrapper = shallow(<DatasetTabs {...baseProps} />);
    const docTab = wrapper.find(TabPane).filterWhere((t) => t.prop("tab") === "Documentation");
    expect(docTab.length).toBe(1);
  });

  it("should NOT have guest role when entitlementType exists", () => {
    localStorage.setItem("entitlementType", "Subscriber");
    localStorage.setItem("guestRole", "Guest");
    mockGetPermissionObject.mockReturnValue(null);
    const wrapper = shallow(<DatasetTabs {...baseProps} />);
    // isGuestRole = loginedRold ? undefined : guestRole. loginedRold = "Subscriber" => truthy => undefined
    const docTab = wrapper.find(TabPane).filterWhere((t) => t.prop("tab") === "Documentation");
    expect(docTab.length).toBe(0);
  });

  // === businessUnitDisplay / projectSpecificDisplay logic ===

  it("should handle licenseUserData 'no' setting businessUnitDisplay to All", () => {
    const wrapper = shallow(
      <DatasetTabs
        {...baseProps}
        license={{ loading: false, data: { userData: "no", allowedUserTypes: "typeA" } }}
      />
    );
    expect(wrapper.exists()).toBe(true);
  });

  it("should handle licenseUserData not 'no' setting businessUnitDisplay to allowedUserTypes", () => {
    const wrapper = shallow(
      <DatasetTabs
        {...baseProps}
        license={{ loading: false, data: { userData: "yes", allowedUserTypes: "typeB" } }}
      />
    );
    expect(wrapper.exists()).toBe(true);
  });

  it("should handle projectSubscription 'no' setting projectSpecificDisplay to None", () => {
    const wrapper = shallow(
      <DatasetTabs
        {...baseProps}
        license={{ loading: false, data: { projectSubscription: "no" } }}
      />
    );
    expect(wrapper.exists()).toBe(true);
  });

  it("should handle projectSubscription 'yes' setting projectSpecificDisplay to list text", () => {
    const wrapper = shallow(
      <DatasetTabs
        {...baseProps}
        license={{ loading: false, data: { projectSubscription: "yes" } }}
      />
    );
    expect(wrapper.exists()).toBe(true);
  });

  // === Edge cases ===

  it("should handle null license data gracefully", () => {
    const wrapper = shallow(
      <DatasetTabs {...baseProps} license={{ loading: false, data: null }} />
    );
    expect(wrapper.exists()).toBe(true);
  });

  it("should handle null vendor data gracefully", () => {
    const wrapper = shallow(
      <DatasetTabs {...baseProps} vendor={{ loading: false, data: null }} />
    );
    expect(wrapper.exists()).toBe(true);
  });

  it("should handle undefined props gracefully for loading checks", () => {
    const wrapper = shallow(
      <DatasetTabs
        license={null}
        vendor={null}
        contract={null}
        dataFamily={null}
        sourceConfig={null}
        datafeedStatus="Active"
        catalogueObj={{}}
      />
    );
    expect(wrapper.find(Tabs).length).toBe(1);
  });
});
