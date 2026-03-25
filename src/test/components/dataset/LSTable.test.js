import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { Table, Tag } from "antd";
import LSTable from "../../../components/dataset/LSTable";

configure({ adapter: new Adapter() });

describe("LSTable", () => {
  const tblData = [
    {
      feedId: "F1",
      shortName: "Feed1",
      dataSetShortName: "DS1",
      isEnabled: true,
      start: "2024-01-01",
      feedDescription: "Test feed",
    },
    {
      feedId: "F2",
      shortName: "Feed2",
      dataSetShortName: "DS2",
      isEnabled: false,
      start: "2024-02-01",
      feedDescription: "Another feed",
    },
    {
      feedId: "F3",
      shortName: "Feed3",
      dataSetShortName: "DS3",
      isEnabled: null,
      start: null,
      feedDescription: "No status feed",
    },
  ];

  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<LSTable tblData={tblData} />);
  });

  it("should render without crashing", () => {
    expect(wrapper.exists()).toBe(true);
  });

  it("should render a Table component", () => {
    expect(wrapper.find(Table).length).toBe(1);
  });

  it("should pass tblData as dataSource", () => {
    expect(wrapper.find(Table).prop("dataSource")).toEqual(tblData);
  });

  it("should have 4 columns", () => {
    const columns = wrapper.find(Table).prop("columns");
    expect(columns.length).toBe(4);
  });

  it("should render Status column with Tag for active", () => {
    const columns = wrapper.find(Table).prop("columns");
    const statusCol = columns.find((c) => c.key === "isEnabled");
    const rendered = shallow(statusCol.render(true));
    expect(rendered.hasClass("ant-tag-green")).toBe(true);
    expect(rendered.text()).toBe("Active");
  });

  it("should render Status column with Tag for inactive", () => {
    const columns = wrapper.find(Table).prop("columns");
    const statusCol = columns.find((c) => c.key === "isEnabled");
    const rendered = shallow(statusCol.render(false));
    expect(rendered.hasClass("ant-tag-orange")).toBe(true);
    expect(rendered.text()).toBe("Inactive");
  });

  it("should render Status column with Tag for null", () => {
    const columns = wrapper.find(Table).prop("columns");
    const statusCol = columns.find((c) => c.key === "isEnabled");
    const rendered = shallow(statusCol.render(null));
    expect(rendered.hasClass("ant-tag")).toBe(true);
    expect(rendered.text()).toBe("NA");
  });

  it("should format start date using moment", () => {
    const columns = wrapper.find(Table).prop("columns");
    const startCol = columns.find((c) => c.key === "start");
    const result = startCol.render("2024-01-01");
    expect(result).toBe("01 Jan 2024");
  });

  it("should handle null start date", () => {
    const columns = wrapper.find(Table).prop("columns");
    const startCol = columns.find((c) => c.key === "start");
    const result = startCol.render(null);
    expect(result).toBeFalsy();
  });

  it("should have expandable row render", () => {
    const expandable = wrapper.find(Table).prop("expandable");
    expect(expandable).toBeDefined();
    expect(expandable.expandedRowRender).toBeDefined();
  });

  it("should render expandedRowRender with feedDescription", () => {
    const expandable = wrapper.find(Table).prop("expandable");
    const record = { feedDescription: "My description" };
    const rendered = shallow(expandable.expandedRowRender(record));
    expect(rendered.find("p").text()).toBe("My description");
    expect(rendered.find("p").prop("style")).toEqual({ margin: 0 });
  });

  it("should use feedId as rowKey", () => {
    const rowKey = wrapper.find(Table).prop("rowKey");
    const record = { feedId: "F99" };
    expect(rowKey(record)).toBe("F99");
  });

  it("should have correct column keys and dataIndex", () => {
    const columns = wrapper.find(Table).prop("columns");
    expect(columns[0].dataIndex).toBe("shortName");
    expect(columns[0].key).toBe("shortName");
    expect(columns[1].dataIndex).toBe("dataSetShortName");
    expect(columns[1].key).toBe("dataSetShortName");
    expect(columns[2].dataIndex).toBe("isEnabled");
    expect(columns[2].key).toBe("isEnabled");
    expect(columns[3].dataIndex).toBe("start");
    expect(columns[3].key).toBe("start");
  });

  it("should have correct column titles", () => {
    const columns = wrapper.find(Table).prop("columns");
    expect(columns[0].title).toBe("Data Feed");
    expect(columns[1].title).toBe("Dataset");
    expect(columns[3].title).toBe("Start date");
  });

  it("should render Status title as bold", () => {
    const columns = wrapper.find(Table).prop("columns");
    const statusTitle = shallow(<div>{columns[2].title}</div>);
    expect(statusTitle.find("b").text()).toBe("Status");
  });

  it("should render Tag with green color for isEnabled=true", () => {
    const columns = wrapper.find(Table).prop("columns");
    const statusCol = columns.find((c) => c.key === "isEnabled");
    const rendered = statusCol.render(true);
    expect(rendered.props.color).toBe("green");
    expect(rendered.props.children).toBe("Active");
  });

  it("should render Tag with orange color for isEnabled=false", () => {
    const columns = wrapper.find(Table).prop("columns");
    const statusCol = columns.find((c) => c.key === "isEnabled");
    const rendered = statusCol.render(false);
    expect(rendered.props.color).toBe("orange");
    expect(rendered.props.children).toBe("Inactive");
  });

  it("should render Tag with default color for isEnabled=null", () => {
    const columns = wrapper.find(Table).prop("columns");
    const statusCol = columns.find((c) => c.key === "isEnabled");
    const rendered = statusCol.render(null);
    expect(rendered.props.color).toBe("default");
    expect(rendered.props.children).toBe("NA");
  });

  it("should render Tag with default color for isEnabled=undefined", () => {
    const columns = wrapper.find(Table).prop("columns");
    const statusCol = columns.find((c) => c.key === "isEnabled");
    const rendered = statusCol.render(undefined);
    expect(rendered.props.color).toBe("default");
    expect(rendered.props.children).toBe("NA");
  });

  it("should format a valid date string correctly", () => {
    const columns = wrapper.find(Table).prop("columns");
    const startCol = columns.find((c) => c.key === "start");
    expect(startCol.render("2024-06-15")).toBe("15 Jun 2024");
  });

  it("should return falsy for undefined start date", () => {
    const columns = wrapper.find(Table).prop("columns");
    const startCol = columns.find((c) => c.key === "start");
    expect(startCol.render(undefined)).toBeFalsy();
  });

  it("should render with empty tblData", () => {
    const emptyWrapper = shallow(<LSTable tblData={[]} />);
    expect(emptyWrapper.find(Table).prop("dataSource")).toEqual([]);
  });
});
