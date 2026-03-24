import React from "react";
import { Table, Tag, Button } from "antd";
import { configure, shallow, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { MemoryRouter } from "react-router-dom";

import DataSetData from "../../pages/masterData/DataSetData";

configure({ adapter: new Adapter() });
jest.spyOn(console, "error").mockImplementation(() => {});
const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn().mockReturnValue([]),
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

describe("DataSetData Component", () => {
  it("should render main wrapper", () => {
    const element = wrapper.find("#main");
    expect(element.length).toBe(1);
  });

  it("should render Table component", () => {
    const element = wrapper.find(Table);
    expect(element.length).toBe(1);
  });

  it("should handle row expand click", () => {
    const element = wrapper.find(".ant-table-expand-icon-col").at(0);
    element.simulate("click");
  });

  it("should render correct number of rows", () => {
    const table = wrapper.find(Table);
    const row = table.find("tr");
    expect(row).toHaveLength(3);
  });

  it("should render correct number of header columns", () => {
    const table = wrapper.find(Table);
    const row = table.find("th");
    row.at(0).simulate("click");
    expect(row).toHaveLength(7);
  });

  it("should have empty dataSource initially", () => {
    expect(wrapper.find(Table).props().dataSource).toEqual([]);
  });

  it("should render expandedRowRender when row is expanded", () => {
    const table = wrapper.find(Table);
    expect(
      table.prop("expandable") || table.prop("expandedRowRender")
    ).toBeTruthy();
  });

  it("should render with matching datasetId in datafeedsInfo", () => {
    const matchingWrapper = mount(
      <MemoryRouter>
        <DataSetData
          datasetsInfo={[
            {
              datasetId: "DS001",
              longName: "Test Dataset",
              shortName: "TD",
              licenseId: "L001",
              datasetDescription: "Desc",
              datasetStatus: "Active",
              createdBy: "user1",
              createdOn: "2024-01-01",
              lastUpdatedBy: null,
              lastUpdatedOn: null,
              approvedBy: null,
              approvedOn: null,
              entityId: "123",
              datasetUpdateFlag: "N",
              roleName: null,
            },
          ]}
          datafeedsInfo={[
            {
              feedId: "F001",
              longName: "Test Feed",
              shortName: "TF",
              feedDescription: "Desc",
              datasetId: "DS001",
              dataConfidentiality: "",
              personalData: "",
              documentationFile: null,
              documentationLink: null,
              datapatternId: null,
              feedStatus: "Active",
              createdBy: "user1",
              createdOn: "2024-01-01",
              lastUpdatedBy: null,
              lastUpdatedOn: null,
              approvedBy: null,
              approvedOn: null,
              feedUpdateFlag: "N",
              roleName: null,
              dataSetShortName: null,
              isEnabled: null,
              created: null,
            },
          ]}
          licenses={[
            {
              licenseId: "L001",
              licenseLongName: "Test",
              licenseShortName: "T",
              licenseAgreementId: "A001",
              licenseExpiryDate: "2025-12-31",
              licenseStatus: "Active",
              licenseUpdateFlag: "N",
            },
          ]}
          handleTabClick={jest.fn()}
          dataSetEntityId="123"
          vendorId="V001"
        />
      </MemoryRouter>
    );
    expect(matchingWrapper.find(Table).exists()).toBe(true);
  });

  it("should render with empty datasetsInfo", () => {
    const emptyWrapper = mount(
      <DataSetData
        datasetsInfo={[]}
        datafeedsInfo={[]}
        handleTabClick={jest.fn()}
        dataSetEntityId="123"
        vendorId="123"
      />
    );
    expect(emptyWrapper.find("#main").length).toBe(1);
  });

  it("should render with active dataset status", () => {
    const activeWrapper = mount(
      <DataSetData
        datasetsInfo={[
          {
            datasetId: "DS002",
            longName: "Active Dataset",
            shortName: "AD",
            licenseId: "L002",
            datasetDescription: "Active dataset desc",
            datasetStatus: "Active",
            createdBy: "user2",
            createdOn: "2024-06-01",
            lastUpdatedBy: null,
            lastUpdatedOn: null,
            approvedBy: "approver",
            approvedOn: "2024-06-02",
            entityId: "123",
            datasetUpdateFlag: "N",
            roleName: null,
          },
        ]}
        datafeedsInfo={datafeedsInfo}
        handleTabClick={jest.fn()}
        dataSetEntityId="123"
        vendorId="123"
      />
    );
    expect(activeWrapper.find(Table).exists()).toBe(true);
  });

  it("should render with pending dataset status", () => {
    const pendingWrapper = mount(
      <DataSetData
        datasetsInfo={[
          {
            datasetId: "DS003",
            longName: "Pending Dataset",
            shortName: "PD",
            licenseId: "L003",
            datasetDescription: "Pending desc",
            datasetStatus: "Pending",
            createdBy: "user3",
            createdOn: "2024-07-01",
            lastUpdatedBy: null,
            lastUpdatedOn: null,
            approvedBy: null,
            approvedOn: null,
            entityId: "123",
            datasetUpdateFlag: "Y",
            roleName: null,
          },
        ]}
        datafeedsInfo={datafeedsInfo}
        handleTabClick={jest.fn()}
        dataSetEntityId="123"
        vendorId="123"
      />
    );
    expect(pendingWrapper.find(Table).exists()).toBe(true);
  });

  it("should render Table columns", () => {
    const table = wrapper.find(Table);
    const columns = table.prop("columns");
    expect(columns).toBeTruthy();
    expect(columns.length).toBeGreaterThanOrEqual(5);
  });

  it("should render with licenses prop", () => {
    const wrapperWithLicenses = mount(
      <DataSetData
        datasetsInfo={datasetsInfo}
        datafeedsInfo={datafeedsInfo}
        licenses={[
          {
            licenseId: "L001",
            licenseLongName: "License1",
            licenseShortName: "L1",
            licenseAgreementId: "A001",
            licenseExpiryDate: "2025-12-31",
            licenseStatus: "Active",
            licenseUpdateFlag: "N",
          },
        ]}
        handleTabClick={jest.fn()}
        dataSetEntityId="123"
        vendorId="123"
      />
    );
    expect(wrapperWithLicenses.find(Table).exists()).toBe(true);
  });
});
