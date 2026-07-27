import React from "react";
import * as redux from "react-redux";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import SplittingConfiguration from "../../../components/addConfiguration/SplittingConfiguration";
import imperativeConfirm from "../../../design-system/imperativeConfirm";
import { toast } from "../../../design-system/toast";

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
}));
jest.mock("react-router-dom", () => ({
  useParams: () => ({ id: "DF123" }),
}));
jest.mock("../../../design-system/imperativeConfirm", () => jest.fn());
jest.mock("../../../design-system/toast", () => {
  const api = {
    open: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    warn: jest.fn(),
  };
  return { __esModule: true, toast: api, default: api };
});

const setupSelector = (configValues = {}, allSchemas = []) => {
  const state = {
    datafeedInfo: {
      congigUi: configValues,
      allSchemas: allSchemas,
    },
  };
  redux.useSelector.mockImplementation((cb) => cb(state));
};

const renderCfg = (props = {}) =>
  render(<SplittingConfiguration next={jest.fn()} {...props} />);

const uploadFile = async (container, index, file) => {
  const fileInputs = container.querySelectorAll('input[type="file"]');
  await act(async () => {
    fireEvent.change(fileInputs[index], { target: { files: [file] } });
  });
};

describe("SplittingConfiguration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupSelector();
    imperativeConfirm.mockResolvedValue(false);
  });

  it("should render the Splitting Configuration header", () => {
    renderCfg();
    expect(screen.getByText("Splitting Configuration")).toBeInTheDocument();
  });

  it("should render the existing schema radio options (Yes / No)", () => {
    renderCfg();
    expect(screen.getByText("Yes")).toBeInTheDocument();
    expect(screen.getByText("No")).toBeInTheDocument();
  });

  it("should render the field labels", () => {
    renderCfg();
    expect(screen.getByText("Existing schema")).toBeInTheDocument();
    expect(screen.getByText("Schema ID")).toBeInTheDocument();
    expect(screen.getByText("Data format")).toBeInTheDocument();
  });

  it("should render the splitting expression labels", () => {
    renderCfg();
    expect(screen.getByText("Splitting path expression")).toBeInTheDocument();
    expect(screen.getByText("Splitting source expression")).toBeInTheDocument();
  });

  it("should render two Click to Upload controls (schema data + metadata)", () => {
    renderCfg();
    expect(
      screen.getAllByRole("button", { name: /Click to Upload/i }).length
    ).toBe(2);
  });

  it("should render with schemas from redux", () => {
    const schemas = [
      { schemaName: "com.edms.fundamentals.bgsgs", version: 0 },
      { schemaName: "com.edms.fundamentals.csf", version: 0 },
    ];
    setupSelector({}, schemas);
    renderCfg();
    expect(screen.getByText("Splitting Configuration")).toBeInTheDocument();
  });

  it("should render with existing schema config values", () => {
    setupSelector(
      {
        splitterCanonicalClass:
          "com.scb.edms.edmsdataflowsvc.routes.FundamentalsRoute",
        schemaId: "schema123",
        dataFeedType: "com.scb.edms.edmsdataflowsvc.routes.FundamentalsRoute",
        schemaDataObj: { name: "schema.json" },
        schemaMetaDataObj: { name: "metadata.json" },
      },
      [{ schemaName: "schema123", version: 1 }]
    );
    renderCfg();
    expect(screen.getByText("Splitting Configuration")).toBeInTheDocument();
    // bindData branches: uploaded file names get shown from config values
    expect(screen.getByText("schema.json")).toBeInTheDocument();
    expect(screen.getByText("metadata.json")).toBeInTheDocument();
  });

  it("should fall back to dataFeedType and NA when splitterCanonicalClass is missing and schemaId is 'string'", () => {
    setupSelector({
      dataFeedType: "com.scb.edms.edmsdataflowsvc.routes.CSVInitialRoute",
      schemaId: "string",
    });
    renderCfg();
    expect(screen.getByText("Splitting Configuration")).toBeInTheDocument();
    // getSchemasID is dispatched from the mount effect
    expect(mockDispatch).toHaveBeenCalled();
  });

  it("should validate and persist when formData flips true with valid values", async () => {
    setupSelector({
      exitingSchema: "No",
      schemaId: "NA",
      dataFeedType: "com.scb.edms.edmsdataflowsvc.routes.FundamentalsRoute",
      splittingSourceExpression: "direct://vendor-dataset-splitting-queue",
    });
    const next = jest.fn();
    const { rerender } = render(
      <SplittingConfiguration next={next} formData={false} />
    );
    mockDispatch.mockClear();
    await act(async () => {
      rerender(<SplittingConfiguration next={next} formData={true} />);
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(mockDispatch).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(true, expect.any(Object));
  });

  it("should submit the selected schemaId when existing schema is Yes", async () => {
    setupSelector(
      {
        exitingSchema: "Yes",
        schemaId: "schema123",
        splittingSourceExpression: "direct://vendor-dataset-splitting-queue",
      },
      [{ schemaName: "schema123", version: 1 }]
    );
    const next = jest.fn();
    const { rerender } = render(
      <SplittingConfiguration next={next} formData={false} />
    );
    await act(async () => {
      rerender(<SplittingConfiguration next={next} formData={true} />);
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(next).toHaveBeenCalledWith(
      true,
      expect.objectContaining({ schemaId: "schema123" })
    );
  });

  it("should show the uploaded schema data file name", async () => {
    const { container } = renderCfg();
    const schemaFile = new File(["{}"], "myschema.json", {
      type: "application/json",
    });
    await uploadFile(container, 0, schemaFile);
    expect(screen.getByText("myschema.json")).toBeInTheDocument();
  });

  it("should show the uploaded schema metadata file name", async () => {
    const { container } = renderCfg();
    const metaFile = new File(["{}"], "mymeta.json", {
      type: "application/json",
    });
    await uploadFile(container, 1, metaFile);
    expect(screen.getByText("mymeta.json")).toBeInTheDocument();
  });

  it("should reject files larger than 100MB with an error toast", async () => {
    const { container } = renderCfg();
    const bigFile = new File(["x"], "huge.json", {
      type: "application/json",
    });
    Object.defineProperty(bigFile, "size", { value: 101 * 1024 * 1024 });
    await uploadFile(container, 0, bigFile);
    expect(toast.error).toHaveBeenCalledWith(
      "File not uploaded due to: Max File size upload allowed is 100MB"
    );
    expect(screen.queryByText("huge.json")).not.toBeInTheDocument();
  });

  it("should ignore an empty file selection", async () => {
    const { container } = renderCfg();
    const fileInputs = container.querySelectorAll('input[type="file"]');
    await act(async () => {
      fireEvent.change(fileInputs[0], { target: { files: [] } });
    });
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("should remove the schema data file when replace is confirmed", async () => {
    imperativeConfirm.mockResolvedValue(true);
    const { container } = renderCfg();
    await uploadFile(
      container,
      0,
      new File(["{}"], "myschema.json", { type: "application/json" })
    );
    fireEvent.click(screen.getByText("myschema.json"));
    await waitFor(() =>
      expect(screen.queryByText("myschema.json")).not.toBeInTheDocument()
    );
    expect(imperativeConfirm).toHaveBeenCalled();
  });

  it("should keep the schema data file when replace is cancelled", async () => {
    imperativeConfirm.mockResolvedValue(false);
    const { container } = renderCfg();
    await uploadFile(
      container,
      0,
      new File(["{}"], "myschema.json", { type: "application/json" })
    );
    await act(async () => {
      fireEvent.click(screen.getByText("myschema.json"));
    });
    expect(imperativeConfirm).toHaveBeenCalled();
    expect(screen.getByText("myschema.json")).toBeInTheDocument();
  });

  it("should remove the schema metadata file when replace is confirmed", async () => {
    imperativeConfirm.mockResolvedValue(true);
    const { container } = renderCfg();
    await uploadFile(
      container,
      1,
      new File(["{}"], "mymeta.json", { type: "application/json" })
    );
    fireEvent.click(screen.getByText("mymeta.json"));
    await waitFor(() =>
      expect(screen.queryByText("mymeta.json")).not.toBeInTheDocument()
    );
  });

  it("should keep the schema metadata file when replace is cancelled", async () => {
    imperativeConfirm.mockResolvedValue(false);
    const { container } = renderCfg();
    await uploadFile(
      container,
      1,
      new File(["{}"], "mymeta.json", { type: "application/json" })
    );
    await act(async () => {
      fireEvent.click(screen.getByText("mymeta.json"));
    });
    expect(screen.getByText("mymeta.json")).toBeInTheDocument();
  });

  it("should disable uploads when existing schema is set to Yes and re-enable on No", async () => {
    renderCfg();
    await act(async () => {
      fireEvent.click(screen.getByRole("radio", { name: "Yes" }));
    });
    screen
      .getAllByRole("button", { name: /Click to Upload/i })
      .forEach((btn) => expect(btn).toHaveClass("Mui-disabled"));
    await act(async () => {
      fireEvent.click(screen.getByRole("radio", { name: "No" }));
    });
    screen
      .getAllByRole("button", { name: /Click to Upload/i })
      .forEach((btn) => expect(btn).not.toHaveClass("Mui-disabled"));
  });

  it("should let the user pick a schema id from the dropdown when existing schema is Yes", async () => {
    setupSelector({}, [
      { schemaName: "com.edms.fundamentals.bgsgs", version: 0 },
      { schemaName: "com.edms.fundamentals.csf", version: 0 },
    ]);
    renderCfg();
    await act(async () => {
      fireEvent.click(screen.getByRole("radio", { name: "Yes" }));
    });
    const combos = screen.getAllByRole("combobox");
    fireEvent.mouseDown(combos[0]);
    const option = await screen.findByRole("option", {
      name: "com.edms.fundamentals.csf",
    });
    await act(async () => {
      fireEvent.click(option);
    });
    expect(
      screen.getAllByText("com.edms.fundamentals.csf").length
    ).toBeGreaterThan(0);
  });

  it("should require splitting path expression when data format json is selected", async () => {
    const next = jest.fn();
    const { rerender } = render(
      <SplittingConfiguration next={next} formData={false} />
    );
    const combos = screen.getAllByRole("combobox");
    // second combobox is the data format select
    fireEvent.mouseDown(combos[1]);
    const jsonOption = await screen.findByRole("option", { name: "json" });
    await act(async () => {
      fireEvent.click(jsonOption);
    });
    await act(async () => {
      rerender(<SplittingConfiguration next={next} formData={true} />);
      await Promise.resolve();
      await Promise.resolve();
    });
    // validation fails (splittingPathExpression empty) -> never advances
    expect(next).not.toHaveBeenCalledWith(true, expect.any(Object));
    expect(
      await screen.findByText("Splitting path expression is mandatory !")
    ).toBeInTheDocument();
  });

  it("should require splitting path expression for the xpath route as well", async () => {
    const next = jest.fn();
    const { rerender } = render(
      <SplittingConfiguration next={next} formData={false} />
    );
    const combos = screen.getAllByRole("combobox");
    fireEvent.mouseDown(combos[1]);
    const xpathOption = await screen.findByRole("option", { name: "xpath" });
    await act(async () => {
      fireEvent.click(xpathOption);
    });
    await act(async () => {
      rerender(<SplittingConfiguration next={next} formData={true} />);
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(next).not.toHaveBeenCalledWith(true, expect.any(Object));
  });

  it("should reject whitespace-only splitting source expression", async () => {
    const next = jest.fn();
    const { rerender, container } = render(
      <SplittingConfiguration next={next} formData={false} />
    );
    const sourceInput = container.querySelector(
      'input[name="splittingSourceExpression"]'
    );
    await act(async () => {
      fireEvent.change(sourceInput, { target: { value: "   " } });
    });
    await act(async () => {
      rerender(<SplittingConfiguration next={next} formData={true} />);
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(next).not.toHaveBeenCalledWith(true, expect.any(Object));
    expect(await screen.findByText("Not a valid input")).toBeInTheDocument();
  });

  it("should persist a draft (no validation) and navigate back when prevData flips true", async () => {
    const previous = jest.fn();
    const { rerender } = render(
      <SplittingConfiguration
        next={jest.fn()}
        previous={previous}
        prevData={false}
      />
    );
    mockDispatch.mockClear();
    await act(async () => {
      rerender(
        <SplittingConfiguration
          next={jest.fn()}
          previous={previous}
          prevData={true}
        />
      );
      await Promise.resolve();
    });
    expect(mockDispatch).toHaveBeenCalled();
    expect(previous).toHaveBeenCalledWith(true, expect.any(Object));
  });

  it("should include uploaded files in the draft persisted on previous", async () => {
    const previous = jest.fn();
    const { rerender, container } = render(
      <SplittingConfiguration
        next={jest.fn()}
        previous={previous}
        prevData={false}
      />
    );
    await uploadFile(
      container,
      0,
      new File(["{}"], "draft.json", { type: "application/json" })
    );
    await act(async () => {
      rerender(
        <SplittingConfiguration
          next={jest.fn()}
          previous={previous}
          prevData={true}
        />
      );
      await Promise.resolve();
    });
    expect(previous).toHaveBeenCalledWith(
      true,
      expect.objectContaining({
        schemaDataObj: expect.objectContaining({ name: "draft.json" }),
      })
    );
  });
});
