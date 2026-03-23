import * as redux from "react-redux";
import { configure, shallow, sleep, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import AddEditDocuments from "../../pages/datafeed/AddEditDocuments";

configure({ adapter: new Adapter() });

const props = {
  location: {
    state: {
      editObj: {},
    },
    pathname: "/addDocuments",
  },
};
const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));
jest.mock("react-router-dom", () => ({
  useParams: jest.fn().mockReturnValue({ dsDfId: "", docObjectIds: "" }),
  useHistory: jest.fn(),
}));

const fileUpload = { fileLists: { documentList: "" } };

const dataset = { datasetsInfo: {} };

const datafeedInfo = { datafeedsData: {} };

const state = { fileUpload, dataset, datafeedInfo };

jest
  .spyOn(redux, "useSelector")
  .mockImplementation((callback) => callback(state));

const wrapper = shallow(<AddEditDocuments {...props} />);

it("wrapper", () => {
  const element = wrapper.find("#main");
  expect(element.length).toBe(1);
});
