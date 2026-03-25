import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { Table } from "antd";
import MetadataTable from "../../../components/dataset/MetadataTable";

configure({ adapter: new Adapter() });

jest.spyOn(console, "error").mockImplementation(() => {});

jest.mock("../../../store/services/ContractService", () => ({
  metaTabTableData: jest.fn(),
}));

describe("MetadataTable", () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<MetadataTable />);
  });

  it("should render without crashing", () => {
    expect(wrapper.exists()).toBe(true);
  });

  it("should render a Table component", () => {
    expect(wrapper.find(Table).length).toBe(1);
  });

  it("should have 7 columns", () => {
    const columns = wrapper.find(Table).prop("columns");
    expect(columns.length).toBe(7);
  });

  it("should have checkbox row selection", () => {
    const rowSelection = wrapper.find(Table).prop("rowSelection");
    expect(rowSelection.type).toBe("checkbox");
  });

  it("should have pagination enabled", () => {
    expect(wrapper.find(Table).prop("pagination")).toBe(true);
  });

  it("should render with middle size", () => {
    expect(wrapper.find(Table).prop("size")).toBe("middle");
  });

  it("should have correct column titles", () => {
    const columns = wrapper.find(Table).prop("columns");
    const titles = columns.map((c) => c.title);
    expect(titles).toContain("Attribute Schema Name");
    expect(titles).toContain("Attribute Table Name");
    expect(titles).toContain("Attribute Name");
    expect(titles).toContain("Data Type");
    expect(titles).toContain("Data Length");
    expect(titles).toContain("Parent Table Name");
    expect(titles).toContain("Table Rank");
  });

  it("should have correct dataIndex for each column", () => {
    const columns = wrapper.find(Table).prop("columns");
    expect(columns[0].dataIndex).toBe("attributeschemaname");
    expect(columns[1].dataIndex).toBe("attributetablename");
    expect(columns[2].dataIndex).toBe("attributename");
    expect(columns[3].dataIndex).toBe("datatype");
    expect(columns[4].dataIndex).toBe("datalength");
    expect(columns[5].dataIndex).toBe("parenttablename");
    expect(columns[6].dataIndex).toBe("tablerank");
  });

  it("should have rowKey function that returns index", () => {
    const rowKey = wrapper.find(Table).prop("rowKey");
    expect(rowKey({}, 0)).toBe(0);
    expect(rowKey({}, 5)).toBe(5);
  });

  it("should have rowSelection onChange handler", () => {
    const rowSelection = wrapper.find(Table).prop("rowSelection");
    expect(rowSelection.onChange).toBeDefined();
    // Should not throw when called
    expect(() => rowSelection.onChange(["key1"], [{ attributename: "test" }])).not.toThrow();
  });

  it("should render with empty dataSource initially", () => {
    const dataSource = wrapper.find(Table).prop("dataSource");
    expect(dataSource).toEqual([]);
  });
});
