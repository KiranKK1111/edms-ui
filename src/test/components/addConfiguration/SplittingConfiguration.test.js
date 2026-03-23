import React from "react";
import * as redux from "react-redux";
import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import { Form } from "antd";
import SplittingConfiguration from "../../../components/addConfiguration/SplittingConfiguration";

configure({ adapter: new Adapter() });

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
}));
jest.mock("react-router-dom", () => ({
  useParams: jest.fn(),
}));

const datafeedInfo = {
  congigUi: {
    splitterCanonicalClass: "",
    dataFeedType: "",
    schemaId: "",
  },
  allSchemas: [
    {
      schemaName: "com.edms.fundamentals.bgsgs",
      version: 0,
    },
    {
      schemaName: "com.edms.fundamentals.csf",
      version: 0,
    },
    {
      schemaName: "com.edms.fundamentals.gen",
      version: 0,
    },
    {
      schemaName: "com.edms.fundamentals.std",
      version: 0,
    },
  ],
};

const state = { datafeedInfo };

jest
  .spyOn(redux, "useSelector")
  .mockImplementation((callback) => callback(state));

const myInitialState = "Yes";
React.useState = jest.fn().mockReturnValue([myInitialState, {}]);

const wrapper = shallow(<SplittingConfiguration />);

describe("parent", () => {
  it("wrapper", () => {
    const element = wrapper.find(Form);
    expect(element.length).toBe(1);
  });
  it("Schema dropdown", () => {
    const element = wrapper.find("#schema-select");
    //console.log(wrapper.debug());
    // expect(element.length).toBe(2);
  });
});
//schema-select