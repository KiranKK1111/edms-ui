import React from "react";
import * as redux from "react-redux";
import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import { Card, Table } from "antd";
import SubscribersTab from "../../../components/dataset/SubscribersTab";

configure({ adapter: new Adapter() });

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
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
const dataset = {
  subscribers: {
    data: [
      {
        numberOfEndUserSubscriptions: "",
        status: "",
        subscriptionFor: "",
        reasonForSubscription: "",
      },
      {
        numberOfEndUserSubscriptions: "",
        status: "",
        subscriptionFor: "",
        reasonForSubscription: "",
      },
    ],
  },
};
const state = { dataset };

jest
  .spyOn(redux, "useSelector")
  .mockImplementation((callback) => callback(state));

React.useState = jest.fn().mockReturnValue([true, {}]);

const wrapper = shallow(<SubscribersTab />);
describe("Parent", () => {
  it("wrapper", () => {
    const element = wrapper.find(Card);
    expect(element.length).toBe(1);
  });
  it("wrapper123", () => {
    const element = wrapper.find(Table);
    expect(element.length).toBe(1);
  });
});