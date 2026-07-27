import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { AppProviders } from "../../../design-system";
import SchedulerDetails from "../../../components/license/TechnicalDetails/SchedulerDetails";
import { schedulerDatabase } from "../../../store/actions/SourceConfigActions";

jest.spyOn(console, "error").mockImplementation(() => {});

let mockParams = { id: "L1" };
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => mockParams,
}));

jest.mock("../../../store/actions/SourceConfigActions", () => ({
  schedulerDatabase: jest.fn(),
}));

const renderScheduler = () =>
  render(
    <AppProviders>
      <SchedulerDetails />
    </AppProviders>
  );

describe("SchedulerDetails", () => {
  beforeEach(() => {
    mockParams = { id: "L1" };
  });

  describe("when scheduler data is empty", () => {
    beforeEach(() => {
      schedulerDatabase.mockResolvedValue({ data: { recurrenceScheduler: [] } });
    });

    it("should render the Scheduler Details heading", () => {
      renderScheduler();
      expect(screen.getByText("Scheduler Details")).toBeInTheDocument();
    });

    it("should render the review-submit and content wrappers", () => {
      const { container } = renderScheduler();
      expect(container.querySelector(".review-submit")).toBeInTheDocument();
      expect(container.querySelector(".content-area")).toBeInTheDocument();
      expect(container.querySelector(".content-wrapper")).toBeInTheDocument();
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
    ];

    beforeEach(() => {
      schedulerDatabase.mockResolvedValue({
        data: { recurrenceScheduler: mockSchedulerData },
      });
    });

    it("should call schedulerDatabase on mount", () => {
      renderScheduler();
      expect(schedulerDatabase).toHaveBeenCalled();
    });

    it("should render the matching scheduler field values", async () => {
      renderScheduler();
      expect(await screen.findByText("Daily Sync")).toBeInTheDocument();
      expect(screen.getByText("Daily")).toBeInTheDocument();
      expect(screen.getByText("Active")).toBeInTheDocument();
    });
  });

  describe("when no matching licenseId in data", () => {
    beforeEach(() => {
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
    });

    it("should still render the heading without field values", async () => {
      renderScheduler();
      expect(screen.getByText("Scheduler Details")).toBeInTheDocument();
      await waitFor(() =>
        expect(screen.queryByText("Other")).not.toBeInTheDocument()
      );
    });
  });
});
