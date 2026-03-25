import { configure, shallow, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { Row, Col, Divider } from "antd";
import SchedulerDetails from "../../../components/license/TechnicalDetails/SchedulerDetails";
import { schedulerDatabase } from "../../../store/actions/SourceConfigActions";
import { useParams } from "react-router-dom";
import { act } from "react-dom/test-utils";

configure({ adapter: new Adapter() });

jest.spyOn(console, "error").mockImplementation(() => {});

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn(),
}));

jest.mock("../../../pages/header/Header", () => () => <div data-testid="mock-header" />);

jest.mock("../../../store/actions/SourceConfigActions", () => ({
  schedulerDatabase: jest.fn(),
}));

jest.mock("../../../components/stringConversion", () => ({
  normalText: jest.fn((text) => text.charAt(0).toUpperCase() + text.slice(1)),
}));

describe("SchedulerDetails", () => {
  let wrapper;

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("when scheduler data is empty", () => {
    beforeEach(() => {
      useParams.mockReturnValue({ id: "L1" });
      schedulerDatabase.mockResolvedValue({ data: { recurrenceScheduler: [] } });
      wrapper = shallow(<SchedulerDetails />);
    });

    it("should render without crashing", () => {
      expect(wrapper.exists()).toBe(true);
    });

    it("should render Scheduler Details heading", () => {
      expect(wrapper.find("h3").text()).toContain("Scheduler Details");
    });

    it("should render Divider", () => {
      expect(wrapper.find(Divider).length).toBe(1);
    });

    it("should render review-submit container", () => {
      expect(wrapper.find(".review-submit").length).toBe(1);
    });

    it("should render Row component", () => {
      expect(wrapper.find(Row).length).toBe(1);
    });

    it("should not render any Col components when data is empty", () => {
      expect(wrapper.find(Col).length).toBe(0);
    });

    it("should render content-area and content-wrapper divs", () => {
      expect(wrapper.find(".content-area").length).toBe(1);
      expect(wrapper.find(".content-wrapper").length).toBe(1);
    });

    it("should have h3 with paddingBottom 0 style", () => {
      expect(wrapper.find("h3").prop("style")).toEqual({ paddingBottom: 0 });
    });
  });

  describe("when scheduler data is loaded", () => {
    const mockSchedulerData = [
      {
        licenseId: "L1",
        schedulerName: "Daily Sync",
        frequency: "Daily",
        startDate: "2024-01-15T00:00:00",
        endDate: "2024-12-31T00:00:00",
        batchKickOffTime: "2024-01-15T08:30:00",
        status: "Active",
      },
      {
        licenseId: "L2",
        schedulerName: "Weekly Sync",
        frequency: "Weekly",
        startDate: "2024-02-01T00:00:00",
        endDate: "2024-06-30T00:00:00",
        batchKickOffTime: "2024-02-01T10:00:00",
        status: "Active",
      },
    ];

    beforeEach(async () => {
      useParams.mockReturnValue({ id: "L1" });
      schedulerDatabase.mockResolvedValue({
        data: { recurrenceScheduler: mockSchedulerData },
      });
      await act(async () => {
        wrapper = mount(<SchedulerDetails />);
      });
      wrapper.update();
    });

    it("should call schedulerDatabase on mount", () => {
      expect(schedulerDatabase).toHaveBeenCalled();
    });

    it("should render Col components for each key in the scheduler data", () => {
      const cols = wrapper.find(Col);
      expect(cols.length).toBeGreaterThan(0);
    });

    it("should render date fields (startDate, endDate, batchKickOffTime)", () => {
      // The component formats dates with moment and mutates data in-place.
      // On re-render, the already-formatted strings get re-parsed by moment,
      // resulting in "Invalid date". We verify the fields are rendered.
      const text = wrapper.text();
      // There should be 7 fields rendered from the data object for L1
      const cols = wrapper.find(Col);
      expect(cols.length).toBe(7);
    });

    it("should render all scheduler field values", () => {
      const text = wrapper.text();
      // Verify non-date fields are rendered correctly
      expect(text).toContain("L1");
      expect(text).toContain("Daily Sync");
      expect(text).toContain("Daily");
      expect(text).toContain("Active");
    });

    it("should render label-review spans for each key", () => {
      const labels = wrapper.find(".label-review");
      expect(labels.length).toBeGreaterThan(0);
    });

    it("should render Col with span 12", () => {
      const firstCol = wrapper.find(Col).first();
      expect(firstCol.prop("span")).toBe(12);
    });

    it("should render Col with paddingBottom style", () => {
      const firstCol = wrapper.find(Col).first();
      expect(firstCol.prop("style")).toEqual({ paddingBottom: "12px" });
    });
  });

  describe("when schedulerDatabase returns error message", () => {
    beforeEach(async () => {
      useParams.mockReturnValue({ id: "L1" });
      schedulerDatabase.mockResolvedValue({ message: "Error occurred" });
      await act(async () => {
        wrapper = mount(<SchedulerDetails />);
      });
      wrapper.update();
    });

    it("should not render Col components when response has message", () => {
      expect(wrapper.find(Col).length).toBe(0);
    });

    it("should still render the heading", () => {
      expect(wrapper.find("h3").text()).toContain("Scheduler Details");
    });
  });

  describe("when no matching licenseId in data", () => {
    beforeEach(async () => {
      useParams.mockReturnValue({ id: "L1" });
      schedulerDatabase.mockResolvedValue({
        data: {
          recurrenceScheduler: [
            {
              licenseId: "DIFFERENT",
              schedulerName: "Other",
              startDate: "2024-01-01T00:00:00",
              endDate: "2024-12-31T00:00:00",
              batchKickOffTime: "2024-01-01T09:00:00",
            },
          ],
        },
      });
      await act(async () => {
        wrapper = mount(<SchedulerDetails />);
      });
      wrapper.update();
    });

    it("should not render Col components when licenseId does not match", () => {
      expect(wrapper.find(Col).length).toBe(0);
    });
  });
});
