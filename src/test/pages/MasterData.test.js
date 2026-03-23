import React from "react";
import * as redux from "react-redux";
import { configure, shallow, sleep, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { MemoryRouter } from "react-router-dom";

import MasterData from "../../pages/masterData/MasterData";

configure({ adapter: new Adapter() });
jest.spyOn(console, "error").mockImplementation(() => {});
const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

const vendor = {
  loading: false,
};
const dataset = {
  datasetsInfo: [],
};
const datafeedInfo = {
  datafeedsData: [],
};
const state = { vendor, dataset, datafeedInfo };

jest
  .spyOn(redux, "useSelector")
  .mockImplementation((callback) => callback(state));

const props = {
  contracts: [[{}]],
  vendors: {
    list: [],
  },
};
const setState = jest.fn();
const useStateSpy = jest.spyOn(React, "useState");

useStateSpy.mockImplementation((init) => [init, setState]);
useStateSpy.mockImplementation((init) => [init, setState]);
useStateSpy.mockImplementation((init) => [init, setState]);
useStateSpy.mockImplementation((init) => [init, setState]);
useStateSpy.mockImplementation((init) => [init, setState]);
useStateSpy.mockImplementation((init) => [init, setState]);

const wrapper = shallow(<MasterData {...props} />);

describe("Parent", () => {
  it("wrapper", () => {
    const element = wrapper.find(".dashboard-main");
    expect(element.length).toBe(1);
  });
  it("Input", () => {
    const mockEvent = { target: { value: "test" } };
    const element = wrapper.find("#inp-search");
    element.simulate("change", mockEvent);
    expect(mockEvent).toBeTruthy();
  });
});
