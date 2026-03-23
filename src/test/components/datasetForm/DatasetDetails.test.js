import React from "react";
import * as redux from "react-redux";
import { configure, shallow, sleep, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import { Form, Input } from "antd";
import DatasetDetails from "../../../components/datasetForm/DatasetDetails";

configure({ adapter: new Adapter() });

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
}));
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLocation: () => ({
    pathname: "localhost:3000/example/path",
    state: { licence: { licenseId: "" } },
  }),
}));

const dataset = {
  formData: [
    {
      datasetId: "",
      status: "",
      description: "",
      entityId: "",
      licenseId: "",
    },
    {
      datasetId: "",
      status: "",
      description: "",
      entityId: "",
      licenseId: "",
    },
  ],
  datasetsInfo: { licenseId: "" },
};
const state = { dataset };

jest
  .spyOn(redux, "useSelector")
  .mockImplementation((callback) => callback(state));

jest
  .spyOn(React, "useState")
  .mockImplementationOnce(() => [true, () => null])
  .mockImplementationOnce(() => [true, () => null]);

const wrapper = shallow(<DatasetDetails />);
describe("", () => {
  const mockEvent = { target: { value: "test" } };
  const element = wrapper.find(Input).at(1);
  element.simulate("blur", mockEvent);
  it("wrapper", () => {
    const element = wrapper.find(Form);
    expect(element.length).toBe(1);
  });
});