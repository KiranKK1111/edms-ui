import React from "react";
import * as redux from "react-redux";
import { configure, shallow, sleep, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import { Breadcrumb } from "antd";
import RequestFormSteps from "../../../components/addContract/RequestFormSteps";

configure({ adapter: new Adapter() });

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  connect: () => (Component) => Component,
}));

const vendor = {
  list: [],
};
const state = { vendor };

jest
  .spyOn(redux, "useSelector")
  .mockImplementation((callback) => callback(state));

React.useState = jest
  .fn()
  .mockReturnValueOnce([false, {}])
  .mockReturnValueOnce([0, {}])
  .mockReturnValueOnce([false, {}]);
const wrapper = shallow(
  <RequestFormSteps stepsLength={jest.fn()} contractDetails={jest.fn()} />
);

it("wrapper", () => {
  const element = wrapper.find("#main");
  expect(element.length).toBe(1);
});