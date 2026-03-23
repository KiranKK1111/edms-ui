import React from "react";
import * as redux from "react-redux";
import { configure, shallow, sleep, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import ReviewSubmit from "../../../components/datasetForm/ReviewSubmit";

configure({ adapter: new Adapter() });

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

jest.mock("react-router-dom", () => ({
  __esModule: true,
  useLocation: jest.fn().mockReturnValue({
    pathname: "/another-route",
    search: "",
    hash: "",
    state: null,
    key: "5nvxpbdafa",
  }),
  useParams: jest.fn().mockReturnValue({ vendorId: "123", id: "" }),
  useHistory: jest.fn(),
}));
const dataset = {
  formData: {
    description: "",
    datasetId: "",
    status: "",
    longName: "",
    shortName: "",
    roleName: "",
  },
};
const state = { dataset };

jest
  .spyOn(redux, "useSelector")
  .mockImplementation((callback) => callback(state));

const wrapper = shallow(<ReviewSubmit />);
describe("Parent", () => {
  it("wrapper", () => {
    const element = wrapper.find(".review-submit");
    expect(element.length).toBe(1);
  });
});