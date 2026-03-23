import * as redux from "react-redux";
import { configure, shallow, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { Table } from "antd";
import LicenceScope from "../../../components/dataset/LicenceScope";
import LSTable from "../../../components/dataset/LSTable";

configure({ adapter: new Adapter() });

const mockUseLocationValue = {
  pathname: "/testroute",
  search: "",
  hash: "",
  state: {
    data: {
      datafeedById: "",
    },
  },
};
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLocation: jest.fn().mockImplementation(() => {
    return mockUseLocationValue;
  }),
}));
const license = {
  licenseById: {},
};
const contract = { agreementById: "" };
const datafeedInfo = { datafeedsData: [] };
const state = { license, contract, datafeedInfo };
jest
  .spyOn(redux, "useSelector")
  .mockImplementation((callback) => callback(state));

const wrapper = mount(<LicenceScope />);

describe("parent", () => {
  it("wrapper", () => {
    const element = wrapper.find("#main");
    expect(element.length).toBe(1);
  });
  it("table", () => {
    const element = wrapper.find(Table);
    expect(element.length).toBe(1);
  });
  it("table props", () => {
    const element = wrapper.find(Table).prop("rowKey");
    expect(element).toHaveLength(1);
  });

  it("should render LSTable component", () => {
    const element = wrapper.find(LSTable);
    expect(element.length).toBeGreaterThanOrEqual(0);
  });

  it("table should have dataSource prop", () => {
    const element = wrapper.find(Table).prop("dataSource");
    expect(element).toBeDefined();
  });

  it("table should have columns prop", () => {
    const element = wrapper.find(Table).prop("columns");
    expect(element).toBeDefined();
  });
});