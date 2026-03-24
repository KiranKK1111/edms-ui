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
    // Default exitingSchema is "No", so schema select should be disabled
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
});
