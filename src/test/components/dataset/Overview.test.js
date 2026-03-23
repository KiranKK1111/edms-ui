import * as redux from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configure, shallow, sleep, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import { Breadcrumb } from "antd";
import Overview from "../../../components/dataset/Overview";

configure({ adapter: new Adapter() });
const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

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

const datafeedInfo = {
  datafeedById: {
    datafeed: {
      feedId: "",
      longName: "",
      shortName: "",
      protocol: "",
      feedDescription: "",
      dataConfidentiality: "",
      documentationLink: "",
      documentationFile: "",
      personalData: "",
      feedStatus: "",
    },
  },
  metadata: {
    data: {
      isEnabled: "",
      sourceProcessor: "",
      splittingCanonicalClass: "",
      start: "",
      cronExpression: "",
    },
  },
};

const dataFamily = {
  datasetById: {
    datasetId: "",
    longName: "",
    shortName: "",
    datasetDescription: "",
    datasetStatus: "",
    licenseId: "",
  },
};
const license = { licenseById: { licenseShortName: "" } };
const catalogueList = { catalogueList: { datasetId: "", dataFeedId: "" } };

const state = { datafeedInfo, dataFamily, license, license, catalogueList };

jest
  .spyOn(redux, "useSelector")
  .mockImplementation((callback) => callback(state));

const wrapper = mount(
  <MemoryRouter>
    <Overview />
  </MemoryRouter>
);

it("wrapper", () => {
  const element = wrapper.find("#main");
  expect(element.length).toBe(1);
});