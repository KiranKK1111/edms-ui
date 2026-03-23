import { BrowserRouter as Router } from "react-router-dom";
import { configure, shallow, sleep, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import { Card } from "antd";
import Catalog from "../../../components/catalog/Catalog";

configure({ adapter: new Adapter() });

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
  useSelector: jest.fn(),
  connect: () => (Component) => Component,
}));

describe("Parent", () => {
  const wrapper = mount(
    <Router>
      <Catalog
        catalogueInfo={{
          entityShortName: "",
          datasetShortName: "",
          dataFeedLongName: "",
          dataFeedStatus: "",
          dataFeedDescription: "",
          subscription: { subscriptionStatus: "Active" },
        }}
      />
    </Router>
  );
  it("wrapper", () => {
    const element = wrapper.find(Card);
    expect(element.length).toBe(1);
  });
});