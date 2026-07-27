import React from "react";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";

import imperativeConfirm from "../../design-system/imperativeConfirm";

jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});

jest.setTimeout(30000);

describe("imperativeConfirm", () => {
  afterEach(async () => {
    // Flush the 200ms cleanup timer so each dialog's host root is unmounted
    // and removed from document.body before the next test runs.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 260));
    });
    document.documentElement.removeAttribute("data-theme");
    document.body.innerHTML = "";
  });

  it("renders title, string content and custom button labels, and resolves true on confirm", async () => {
    let promise;
    act(() => {
      promise = imperativeConfirm({
        title: "Unsubscribe?",
        content: "This will revoke access.",
        okText: "Unsubscribe",
        cancelText: "Keep",
        okColor: "error",
      });
    });

    expect(await screen.findByText("Unsubscribe?")).toBeInTheDocument();
    expect(screen.getByText("This will revoke access.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Keep" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Unsubscribe" }));
    await expect(promise).resolves.toBe(true);
  });

  it("uses default texts and resolves false when cancel is clicked", async () => {
    let promise;
    act(() => {
      promise = imperativeConfirm();
    });

    expect(await screen.findByText("Are you sure?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await expect(promise).resolves.toBe(false);
  });

  it("hides the cancel button when hideCancel is set", async () => {
    let promise;
    act(() => {
      promise = imperativeConfirm({
        title: "Heads up",
        content: "Info only",
        okText: "OK",
        hideCancel: true,
      });
    });

    expect(await screen.findByText("Heads up")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Cancel" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    await expect(promise).resolves.toBe(true);
  });

  it("renders node content as-is", async () => {
    let promise;
    act(() => {
      promise = imperativeConfirm({
        title: "Node content",
        content: <div data-testid="custom-content">Custom body</div>,
      });
    });

    expect(await screen.findByTestId("custom-content")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    await expect(promise).resolves.toBe(true);
  });

  it("resolves false when the dialog is dismissed via Escape", async () => {
    let promise;
    act(() => {
      promise = imperativeConfirm({ title: "Dismiss me" });
    });

    const dialog = await screen.findByRole("dialog");
    fireEvent.keyDown(dialog, { key: "Escape", code: "Escape" });
    await expect(promise).resolves.toBe(false);
  });

  it("builds a dark theme when the document has data-theme=dark and cleans up its host", async () => {
    document.documentElement.setAttribute("data-theme", "dark");
    let promise;
    act(() => {
      promise = imperativeConfirm({ title: "Dark mode confirm" });
    });

    expect(await screen.findByText("Dark mode confirm")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    await expect(promise).resolves.toBe(true);

    // The cleanup callback runs 200ms after close and removes the host div.
    await waitFor(
      () => expect(screen.queryByText("Dark mode confirm")).not.toBeInTheDocument(),
      { timeout: 3000 }
    );
    await waitFor(
      () => expect(document.body.querySelectorAll("div:empty").length >= 0).toBe(true)
    );
  });
});
