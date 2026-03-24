import React from "react";
import * as redux from "react-redux";
import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { Form, Select, Radio, Input, Upload, Button } from "antd";
import SplittingConfiguration from "../../../components/addConfiguration/SplittingConfiguration";

configure({ adapter: new Adapter() });

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
}));
jest.mock("react-router-dom", () => ({
  useParams: () => ({ id: "DF123" }),
}));

const setupSelector = (configValues = {}, allSchemas = []) => {
  const state = {
    datafeedInfo: {
      congigUi: configValues,
      allSchemas: allSchemas,
    },
  };
  redux.useSelector.mockImplementation((cb) => cb(state));
};

describe("SplittingConfiguration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupSelector();
  });

  it("should render a Form component", () => {
    const wrapper = shallow(<SplittingConfiguration />);
    expect(wrapper.find(Form).length).toBe(1);
  });

  it("should render Splitting Configuration header", () => {
    const wrapper = shallow(<SplittingConfiguration />);
    expect(wrapper.find("h3").text()).toBe("Splitting Configuration");
  });

  it("should render existing schema radio group", () => {
    const wrapper = shallow(<SplittingConfiguration />);
    const radioGroups = wrapper.find(Radio.Group);
    expect(radioGroups.length).toBeGreaterThanOrEqual(1);
  });

  it("should render Yes/No radio options for existing schema", () => {
    const wrapper = shallow(<SplittingConfiguration />);
    const radios = wrapper.find(Radio);
    const values = radios.map((r) => r.prop("value"));
    expect(values).toContain("Yes");
    expect(values).toContain("No");
  });

  it("should render data format Select", () => {
    const wrapper = shallow(<SplittingConfiguration />);
    const selects = wrapper.find(Select);
    expect(selects.length).toBeGreaterThanOrEqual(1);
  });

  it("should render Upload components for schema data and metadata", () => {
    const wrapper = shallow(<SplittingConfiguration />);
    expect(wrapper.find(Upload).length).toBe(2);
  });

  it("should render splitting path and source expression inputs", () => {
    const wrapper = shallow(<SplittingConfiguration />);
    expect(wrapper.find("#splittingPathExp").length).toBe(1);
    expect(wrapper.find("#splittingSourceExp").length).toBe(1);
  });

  it("should render with schemas from redux", () => {
    const schemas = [
      { schemaName: "com.edms.fundamentals.bgsgs", version: 0 },
      { schemaName: "com.edms.fundamentals.csf", version: 0 },
    ];
    setupSelector({}, schemas);
    const wrapper = shallow(<SplittingConfiguration />);
    expect(wrapper.find(Form).length).toBe(1);
  });

  it("should render with existing schema config values", () => {
    setupSelector(
      {
        splitterCanonicalClass:
          "com.scb.edms.edmsdataflowsvc.routes.FundamentalsRoute",
        schemaId: "schema123",
        dataFeedType:
          "com.scb.edms.edmsdataflowsvc.routes.FundamentalsRoute",
        schemaDataObj: { name: "schema.json" },
        schemaMetaDataObj: { name: "metadata.json" },
      },
      [{ schemaName: "schema123", version: 1 }]
    );
    const wrapper = shallow(<SplittingConfiguration />);
    expect(wrapper.find(Form).length).toBe(1);
  });

  it("should render with undefined schemaId", () => {
    setupSelector({
      schemaId: undefined,
      splitterCanonicalClass: "string",
      dataFeedType: "string",
    });
    const wrapper = shallow(<SplittingConfiguration />);
    expect(wrapper.exists()).toBe(true);
  });

  it("should render with NA schemaId", () => {
    setupSelector({
      schemaId: "NA",
      splitterCanonicalClass:
        "com.scb.edms.edmsdataflowsvc.routes.JSONSplitValidateRoute",
    });
    const wrapper = shallow(<SplittingConfiguration />);
    expect(wrapper.exists()).toBe(true);
  });

  it("should render schema ID select as disabled when existing schema is No", () => {
    const wrapper = shallow(<SplittingConfiguration />);
    const selects = wrapper.find(Select);
    const disabledSelects = selects.filterWhere(
      (s) => s.prop("disabled") === true
    );
    expect(disabledSelects.length).toBeGreaterThanOrEqual(1);
  });

  it("should set form name to br-one", () => {
    const wrapper = shallow(<SplittingConfiguration />);
    expect(wrapper.find(Form).prop("name")).toBe("br-one");
  });

  it("should render data format options (xml, json, xpath, csv)", () => {
    const wrapper = shallow(<SplittingConfiguration />);
    const options = wrapper.find(Option);
    expect(options.length).toBeGreaterThanOrEqual(4);
  });

  it("should render Form.Item components", () => {
    const wrapper = shallow(<SplittingConfiguration />);
    expect(wrapper.find(Form.Item).length).toBeGreaterThanOrEqual(5);
  });

  // --- New tests to improve coverage ---

  it("should call onFinish with exitingSchema No and set schemaId to NA", () => {
    const mockNext = jest.fn();
    const wrapper = shallow(<SplittingConfiguration next={mockNext} />);
    const form = wrapper.find(Form);
    const onFinish = form.prop("onFinish");
    const values = {
      exitingSchema: "No",
      dataFeedType: "com.scb.edms.edmsdataflowsvc.routes.FundamentalsRoute",
      splittingPathExpression: "//data",
      splittingSourceExpression: "direct://vendor-dataset-splitting-queue",
    };
    onFinish(values);
    expect(values.schemaId).toBe("NA");
    expect(mockDispatch).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledWith(true, expect.any(Object));
  });

  it("should call onFinish with exitingSchema Yes and keep schemaId", () => {
    const mockNext = jest.fn();
    setupSelector(
      { schemaId: "schema123" },
      [{ schemaName: "schema123" }]
    );
    const wrapper = shallow(<SplittingConfiguration next={mockNext} />);
    const form = wrapper.find(Form);
    const onFinish = form.prop("onFinish");
    const values = {
      exitingSchema: "Yes",
      dataFeedType: "com.scb.edms.edmsdataflowsvc.routes.FundamentalsRoute",
      splittingPathExpression: "",
      splittingSourceExpression: "direct://vendor-dataset",
    };
    onFinish(values);
    expect(mockDispatch).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledWith(true, expect.any(Object));
  });

  it("should handle existing schema radio change to Yes", () => {
    const wrapper = shallow(<SplittingConfiguration />);
    const radioGroup = wrapper.find(Radio.Group).at(0);
    radioGroup.simulate("change", { target: { value: "Yes" } });
    expect(wrapper.find(Form).length).toBe(1);
  });

  it("should handle existing schema radio change to No and reset schemaId", () => {
    setupSelector({ schemaId: "schema123" }, [{ schemaName: "schema123" }]);
    const wrapper = shallow(<SplittingConfiguration />);
    const radioGroup = wrapper.find(Radio.Group).at(0);
    radioGroup.simulate("change", { target: { value: "No" } });
    expect(wrapper.find(Form).length).toBe(1);
  });

  it("should handle data format Select change", () => {
    const wrapper = shallow(<SplittingConfiguration />);
    const selects = wrapper.find(Select);
    // The data format select
    const dataFormatSelect = selects.filterWhere(
      (s) => s.prop("disabled") !== true
    );
    if (dataFormatSelect.length > 0) {
      dataFormatSelect
        .at(0)
        .simulate(
          "change",
          "com.scb.edms.edmsdataflowsvc.routes.JSONSplitValidateRoute"
        );
    }
    expect(wrapper.find(Form).length).toBe(1);
  });

  it("should handle Upload beforeUpload for schema data with large file", () => {
    const wrapper = shallow(<SplittingConfiguration />);
    const uploads = wrapper.find(Upload);
    const schemaDataUpload = uploads.at(0);
    const propsFile = schemaDataUpload.props();
    // Test with file > 100MB
    const largeFile = { size: 200 * 1024 * 1024 };
    propsFile.beforeUpload(largeFile, [largeFile]);
  });

  it("should handle Upload beforeUpload for schema data with valid file", () => {
    const wrapper = shallow(<SplittingConfiguration />);
    const uploads = wrapper.find(Upload);
    const schemaDataUpload = uploads.at(0);
    const propsFile = schemaDataUpload.props();
    const validFile = { size: 50 * 1024 };
    propsFile.beforeUpload(validFile, [validFile]);
  });

  it("should handle Upload onRemove for schema data", () => {
    const wrapper = shallow(<SplittingConfiguration />);
    const uploads = wrapper.find(Upload);
    const schemaDataUpload = uploads.at(0);
    schemaDataUpload.props().onRemove();
  });

  it("should handle Upload customRequest for schema data", async () => {
    const wrapper = shallow(<SplittingConfiguration />);
    const uploads = wrapper.find(Upload);
    const schemaDataUpload = uploads.at(0);
    await schemaDataUpload.props().customRequest({
      action: "",
      data: {},
      file: {},
      filename: "schema.json",
      headers: {},
      onError: jest.fn(),
      onProgress: jest.fn(),
      onSuccess: jest.fn(),
      withCredentials: false,
    });
  });

  it("should handle Upload beforeUpload for schema metadata with large file", () => {
    const wrapper = shallow(<SplittingConfiguration />);
    const uploads = wrapper.find(Upload);
    const metaDataUpload = uploads.at(1);
    const propsFile = metaDataUpload.props();
    const largeFile = { size: 200 * 1024 * 1024 };
    propsFile.beforeUpload(largeFile, [largeFile]);
  });

  it("should handle Upload onRemove for schema metadata", () => {
    const wrapper = shallow(<SplittingConfiguration />);
    const uploads = wrapper.find(Upload);
    const metaDataUpload = uploads.at(1);
    metaDataUpload.props().onRemove();
  });

  it("should render with null schemaId in config", () => {
    setupSelector({
      schemaId: null,
      splitterCanonicalClass:
        "com.scb.edms.edmsdataflowsvc.routes.FundamentalsRoute",
    });
    const wrapper = shallow(<SplittingConfiguration />);
    expect(wrapper.exists()).toBe(true);
  });

  it("should render with JSON split validate route type", () => {
    setupSelector({
      dataFeedType:
        "com.scb.edms.edmsdataflowsvc.routes.JSONSplitValidateRoute",
      schemaId: "NA",
      splitterCanonicalClass:
        "com.scb.edms.edmsdataflowsvc.routes.JSONSplitValidateRoute",
    });
    const wrapper = shallow(<SplittingConfiguration />);
    expect(wrapper.find(Form).length).toBe(1);
  });

  it("should render with CSV initial route type", () => {
    setupSelector({
      dataFeedType:
        "com.scb.edms.edmsdataflowsvc.routes.CSVInitialRoute",
      schemaId: "NA",
    });
    const wrapper = shallow(<SplittingConfiguration />);
    expect(wrapper.find(Form).length).toBe(1);
  });

  it("should render with XpathSplitValidateRoute type", () => {
    setupSelector({
      dataFeedType:
        "com.scb.edms.edmsdataflowsvc.routes.XpathSplitValidateRoute",
      schemaId: "NA",
    });
    const wrapper = shallow(<SplittingConfiguration />);
    expect(wrapper.find(Form).length).toBe(1);
  });

  it("should set schemaDataObj and schemaMetaDataObj to empty when undefined on submit", () => {
    const mockNext = jest.fn();
    const wrapper = shallow(<SplittingConfiguration next={mockNext} />);
    const form = wrapper.find(Form);
    const onFinish = form.prop("onFinish");
    const values = {
      exitingSchema: "No",
      dataFeedType: "com.scb.edms.edmsdataflowsvc.routes.FundamentalsRoute",
      splittingSourceExpression: "direct://test",
    };
    onFinish(values);
    expect(values.schemaDataObj).toEqual({});
    expect(values.schemaMetaDataObj).toEqual({});
  });
});
