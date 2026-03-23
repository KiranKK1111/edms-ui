import React from "react";
import { Table } from "antd";
import { configure, shallow, sleep, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import DataSetData from "../../pages/masterData/DataSetData";

configure({ adapter: new Adapter() });
jest.spyOn(console, "error").mockImplementation(() => {});
const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

const datasetsInfo = [
  {
    datasetId: "",
    longName: "",
    shortName: "",
    licenseId: "",
    datasetDescription: "",
    datasetStatus: "",
    createdBy: "",
    createdOn: "",
    lastUpdatedBy: null,
    lastUpdatedOn: null,
    approvedBy: null,
    approvedOn: null,
    entityId: "",
    datasetUpdateFlag: "",
    roleName: null,
  },
];
const datafeedsInfo = [
  {
    feedId: "",
    longName: "",
    shortName: "",
    feedDescription: "",
    datasetId: "",
    dataConfidentiality: "",
    personalData: "",
    documentationFile: null,
    documentationLink: null,
    datapatternId: null,
    feedStatus: "",
    createdBy: "",
    createdOn: "",
    lastUpdatedBy: null,
    lastUpdatedOn: null,
    approvedBy: null,
    approvedOn: null,
    feedUpdateFlag: "",
    roleName: null,
    dataSetShortName: null,
    isEnabled: null,
    created: null,
  },
];

const wrapper = mount(
  <DataSetData
    datasetsInfo={datasetsInfo}
    datafeedsInfo={datafeedsInfo}
    handleTabClick={jest.fn()}
    dataSetEntityId="123"
    vendorId="123"
  />
);
describe("Parent", () => {
  it("wrapper", () => {
    const element = wrapper.find("#main");
    expect(element.length).toBe(1);
  });
  it("Table", () => {
    const element = wrapper.find(Table);
    expect(element.length).toBe(1);
  });
  it("Row expand", () => {
    const element = wrapper.find(".ant-table-expand-icon-col").at(0);
    element.simulate("click");
  });
  it("Row length", () => {
    const table = wrapper.find(Table);
    const row = table.find("tr");
    expect(row).toHaveLength(3);
  });
  it("head length", () => {
    const table = wrapper.find(Table);
    const row = table.find("th");
    row.at(0).simulate("click");
    expect(row).toHaveLength(7);
  });
  it("table prop", () => {
    const button = wrapper.find(".ant-table-tbody");
    expect(wrapper.find(Table).props().dataSource).toEqual([]);
  });
});
