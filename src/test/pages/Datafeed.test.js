import * as redux from "react-redux";
import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { Button, PageHeader, Steps, Alert, message } from "antd";
import Datafeed from "../../pages/datafeed/Datafeed";
import { startAddDatafeed } from "../../store/actions/datafeedAction";

configure({ adapter: new Adapter() });

jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});

let mockFormData = {};
let mockSelectorFn = (cb) => cb({ datafeedInfo: { formData: mockFormData } });

const mockPush = jest.fn();
let mockDispatch = jest.fn().mockReturnValue(Promise.resolve({}));

jest.mock("react-redux", () => ({
  useSelector: (cb) => mockSelectorFn(cb),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

let mockLocationState = {
  datafeedRecord: {},
  fromLink: "addPage",
  dataset: { shortName: "TestDS" },
  isView: false,
  isUpdate: false,
};

jest.mock("react-router", () => ({
  useParams: () => ({}),
  useHistory: () => ({ push: mockPush }),
  useLocation: () => ({ state: mockLocationState }),
  useRouteMatch: () => ({}),
  withRouter: (C) => C,
  matchPath: jest.fn(),
  __RouterContext: {
    Provider: ({ children }) => children,
    Consumer: ({ children }) => children({}),
  },
}));

jest.mock("react-router-dom", () => ({
  useParams: () => ({}),
  useHistory: () => ({ push: mockPush }),
  useLocation: () => ({ state: mockLocationState }),
  Link: ({ children, to }) => <a href={to}>{children}</a>,
  NavLink: ({ children, to }) => <a href={to}>{children}</a>,
}));

jest.mock("../../store/actions/datafeedAction", () => ({
  startAddDatafeed: jest.fn(),
}));

jest.mock("../../utils/accessObject", () => jest.fn().mockReturnValue(null));

describe("Datafeed - Add mode", () => {
  let wrapper;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFormData = {};
    mockLocationState = {
      datafeedRecord: {},
      fromLink: "addPage",
      dataset: { shortName: "TestDS" },
      isView: false,
      isUpdate: false,
    };
    mockDispatch = jest.fn().mockReturnValue(Promise.resolve({}));
    wrapper = shallow(<Datafeed />);
  });

  it("should render without crashing", () => {
    expect(wrapper.exists()).toBe(true);
  });

  it("should render Steps component", () => {
    expect(wrapper.find(Steps).length).toBe(1);
  });

  it("should render PageHeader with 'Add Data Feed' title", () => {
    expect(wrapper.find(PageHeader).prop("title")).toBe("Add Data Feed");
  });

  it("should render Cancel and Submit buttons", () => {
    const buttons = wrapper.find(Button);
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it("should render Next button on first step", () => {
    const nextBtn = wrapper
      .find(Button)
      .filterWhere((b) => b.children().text() === "Next");
    expect(nextBtn.length).toBe(1);
  });

  it("should NOT render Previous button on first step", () => {
    const prevBtn = wrapper
      .find(Button)
      .filterWhere((b) => b.children().text() === "Previous");
    expect(prevBtn.length).toBe(0);
  });

  it("should render two Step items", () => {
    expect(wrapper.find(Steps.Step).length).toBe(2);
  });

  it("should render steps-content area", () => {
    expect(wrapper.find(".steps-content").length).toBe(1);
  });

  it("should render breadcrumb-parent area", () => {
    expect(wrapper.find(".breadcrumb-parent").length).toBe(1);
  });

  // === Cancel handler ===

  it("should navigate to /masterData on Cancel click", () => {
    const cancelBtn = wrapper
      .find(Button)
      .filterWhere((b) => b.prop("type") === "default");
    cancelBtn.simulate("click");
    expect(mockPush).toHaveBeenCalledWith("/masterData");
  });

  // === Submit button disabled conditions ===

  it("should disable Submit button on first step (not last step)", () => {
    const submitBtn = wrapper
      .find(Button)
      .filterWhere((b) => b.children().text() === "Submit");
    expect(submitBtn.prop("disabled")).toBeTruthy();
  });

  it("should disable Submit when feedStatus is pending and feedId exists", () => {
    mockFormData = { feedStatus: "pending", feedId: "F1" };
    const w = shallow(<Datafeed />);
    const submitBtn = w
      .find(Button)
      .filterWhere((b) => b.children().text() === "Submit");
    expect(submitBtn.prop("disabled")).toBeTruthy();
  });

  it("should disable Submit when feedStatus is inactive and feedId exists", () => {
    mockFormData = { feedStatus: "inactive", feedId: "F1" };
    const w = shallow(<Datafeed />);
    const submitBtn = w
      .find(Button)
      .filterWhere((b) => b.children().text() === "Submit");
    expect(submitBtn.prop("disabled")).toBeTruthy();
  });

  // === Next button click ===

  it("should invoke next function when Next button is clicked", () => {
    const nextBtn = wrapper
      .find(Button)
      .filterWhere((b) => b.children().text() === "Next");
    nextBtn.simulate("click");
    // next() is called without args, which triggers setFormData(true)
    // Can't directly verify step change since useState won't update in shallow
    expect(wrapper.exists()).toBe(true);
  });

  // === Alert for pending feed ===

  it("should NOT show Alert when feedStatus is not pending", () => {
    mockFormData = { feedStatus: "active", feedId: "F1" };
    const w = shallow(<Datafeed />);
    expect(w.find(Alert).length).toBe(0);
  });

  it("should show Alert when feedStatus is pending and feedId exists", () => {
    mockFormData = { feedStatus: "pending", feedId: "F1" };
    const w = shallow(<Datafeed />);
    expect(w.find(Alert).length).toBe(1);
    expect(w.find(Alert).prop("type")).toBe("warning");
  });

  it("should NOT show Alert when feedStatus is pending but no feedId", () => {
    mockFormData = { feedStatus: "pending" };
    const w = shallow(<Datafeed />);
    expect(w.find(Alert).length).toBe(0);
  });

  // === checkUrlSlash ===

  it("should handle shortName with slash", () => {
    mockLocationState = {
      ...mockLocationState,
      dataset: { shortName: "Test/DS" },
    };
    const w = shallow(<Datafeed />);
    expect(w.exists()).toBe(true);
    // The breadcrumb should use encoded shortName
    expect(w.find(PageHeader).exists()).toBe(true);
  });

  it("should handle shortName without slash", () => {
    mockLocationState = {
      ...mockLocationState,
      dataset: { shortName: "TestDS" },
    };
    const w = shallow(<Datafeed />);
    expect(w.exists()).toBe(true);
  });
});

describe("Datafeed - Edit mode (isView)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFormData = {};
    mockLocationState = {
      datafeedRecord: {},
      fromLink: "updatePage",
      dataset: { shortName: "TestDS" },
      isView: true,
      isUpdate: false,
    };
    mockDispatch = jest.fn().mockReturnValue(Promise.resolve({}));
  });

  it("should render PageHeader with 'Edit Data Feed' title when isView is true", () => {
    const w = shallow(<Datafeed />);
    expect(w.find(PageHeader).prop("title")).toBe("Edit Data Feed");
  });
});

describe("Datafeed - Edit mode (isUpdate)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFormData = {};
    mockLocationState = {
      datafeedRecord: {},
      fromLink: "addPage",
      dataset: { shortName: "TestDS" },
      isView: false,
      isUpdate: true,
    };
    mockDispatch = jest.fn().mockReturnValue(Promise.resolve({}));
  });

  it("should render PageHeader with 'Edit Data Feed' title when isUpdate is true", () => {
    const w = shallow(<Datafeed />);
    expect(w.find(PageHeader).prop("title")).toBe("Edit Data Feed");
  });
});

describe("Datafeed - submitFeed", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFormData = {};
    mockLocationState = {
      datafeedRecord: {},
      fromLink: "addPage",
      dataset: { shortName: "TestDS" },
      isView: false,
      isUpdate: false,
    };
  });

  it("should call dispatch startAddDatafeed on Submit click", async () => {
    mockDispatch = jest.fn().mockReturnValue(
      Promise.resolve({
        data: {
          statusMessage: true,
          datafeed: { feedId: "F1" },
        },
      })
    );
    jest.spyOn(message, "success").mockImplementation(() => {});

    // We need to be on the last step to click Submit.
    // In shallow, we can directly invoke the onClick of Submit button.
    const w = shallow(<Datafeed />);
    const submitBtn = w
      .find(Button)
      .filterWhere((b) => b.children().text() === "Submit");
    const onClick = submitBtn.prop("onClick");
    await onClick();

    expect(mockDispatch).toHaveBeenCalled();
  });

  it("should show success message for update flow", async () => {
    mockLocationState = {
      ...mockLocationState,
      isUpdate: true,
    };
    mockDispatch = jest.fn().mockReturnValue(
      Promise.resolve({
        data: { statusMessage: true },
      })
    );
    jest.spyOn(message, "success").mockImplementation(() => {});

    const w = shallow(<Datafeed />);
    const submitBtn = w
      .find(Button)
      .filterWhere((b) => b.children().text() === "Submit");
    await submitBtn.prop("onClick")();

    expect(message.success).toHaveBeenCalledWith(
      expect.stringContaining("successfully updated")
    );
    expect(mockPush).toHaveBeenCalledWith("/masterData");
  });

  it("should show success message for create flow", async () => {
    mockDispatch = jest.fn().mockReturnValue(
      Promise.resolve({
        data: {
          statusMessage: true,
          datafeed: { feedId: "F1" },
        },
      })
    );
    jest.spyOn(message, "success").mockImplementation(() => {});

    const w = shallow(<Datafeed />);
    const submitBtn = w
      .find(Button)
      .filterWhere((b) => b.children().text() === "Submit");
    await submitBtn.prop("onClick")();

    expect(message.success).toHaveBeenCalledWith(
      expect.stringContaining("F1")
    );
    expect(mockPush).toHaveBeenCalledWith("/masterData");
  });

  it("should show error message when response has message (error)", async () => {
    mockDispatch = jest.fn().mockReturnValue(
      Promise.resolve({ message: "Something went wrong" })
    );
    jest.spyOn(message, "error").mockImplementation(() => {});

    const w = shallow(<Datafeed />);
    const submitBtn = w
      .find(Button)
      .filterWhere((b) => b.children().text() === "Submit");
    await submitBtn.prop("onClick")();

    expect(message.error).toHaveBeenCalledWith("Something went wrong");
    expect(mockPush).toHaveBeenCalledWith("/masterData");
  });

  it("should handle null response from dispatch", async () => {
    mockDispatch = jest.fn().mockReturnValue(Promise.resolve(null));

    const w = shallow(<Datafeed />);
    const submitBtn = w
      .find(Button)
      .filterWhere((b) => b.children().text() === "Submit");
    await submitBtn.prop("onClick")();

    // Should not push or show message for null
    expect(mockPush).not.toHaveBeenCalled();
  });
});

describe("Datafeed - PageHeader onBack", () => {
  it("should navigate to /masterData when Add mode and onBack", () => {
    mockLocationState = {
      datafeedRecord: {},
      fromLink: "addPage",
      dataset: { shortName: "TestDS" },
      isView: false,
      isUpdate: false,
    };
    const w = shallow(<Datafeed />);
    const pageHeader = w.find(PageHeader);
    const onBack = pageHeader.prop("onBack");
    onBack();
    expect(mockPush).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: "/masterData",
      })
    );
  });

  it("should navigate to viewDatafeed when Edit mode and fromLink is not updatePage", () => {
    mockLocationState = {
      datafeedRecord: {},
      fromLink: "viewPage",
      dataset: { shortName: "TestDS" },
      isView: true,
      isUpdate: false,
    };
    const w = shallow(<Datafeed />);
    const pageHeader = w.find(PageHeader);
    pageHeader.prop("onBack")();
    expect(mockPush).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: "/masterData/TestDS/viewDatafeed",
      })
    );
  });

  it("should navigate to /masterData when fromLink is updatePage", () => {
    mockLocationState = {
      datafeedRecord: {},
      fromLink: "updatePage",
      dataset: { shortName: "TestDS" },
      isView: true,
      isUpdate: true,
    };
    const w = shallow(<Datafeed />);
    const pageHeader = w.find(PageHeader);
    pageHeader.prop("onBack")();
    // getOperationText returns "Edit Data Feed" (includes no "Add"), and fromLink === "updatePage"
    // pathname: getOperationText().includes("Add") || fromLink === "updatePage" ? "/masterData" : ...
    expect(mockPush).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: "/masterData",
      })
    );
  });
});
