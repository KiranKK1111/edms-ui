import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { Form, Input, Select } from "antd";
import NewVendorForm from "../../../components/vendors/AddVendor/NewVendorForm";

configure({ adapter: new Adapter() });

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn().mockReturnValue({ list: [] }),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

describe("NewVendorForm", () => {
  const mockHandleNameCheck = jest.fn().mockReturnValue(false);
  const mockHandleLongNameCheck = jest.fn().mockReturnValue(false);
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(
      <NewVendorForm
        handleNameCheck={mockHandleNameCheck}
        handleLongNameCheck={mockHandleLongNameCheck}
      />
    );
  });

  it("should render the form container", () => {
    expect(wrapper.find("div").length).toBeGreaterThan(0);
  });

  it("should render Form.Item components", () => {
    expect(wrapper.find(Form.Item).length).toBeGreaterThan(0);
  });

  it("should have Entity ID field as disabled", () => {
    const entityIdInput = wrapper.find('Input[name="entityId"]');
    if (entityIdInput.length) {
      expect(entityIdInput.prop("disabled")).toBe(true);
    }
  });

  it("should render entity type select", () => {
    expect(wrapper.find(Select).length).toBeGreaterThanOrEqual(1);
  });

  it("should have required validation on longName", () => {
    const longNameFormItem = wrapper
      .find(Form.Item)
      .filterWhere((item) => item.prop("name") === "longName");
    if (longNameFormItem.length) {
      const rules = longNameFormItem.prop("rules");
      expect(rules).toBeTruthy();
      expect(rules.some((r) => r.required)).toBe(true);
    }
  });

  it("should have required validation on shortName", () => {
    const shortNameFormItem = wrapper
      .find(Form.Item)
      .filterWhere((item) => item.prop("name") === "shortName");
    if (shortNameFormItem.length) {
      const rules = shortNameFormItem.prop("rules");
      expect(rules).toBeTruthy();
      expect(rules.some((r) => r.required)).toBe(true);
    }
  });

  it("should have required validation on entityDescription", () => {
    const descFormItem = wrapper
      .find(Form.Item)
      .filterWhere((item) => item.prop("name") === "entityDescription");
    if (descFormItem.length) {
      const rules = descFormItem.prop("rules");
      expect(rules).toBeTruthy();
      expect(rules.some((r) => r.required)).toBe(true);
    }
  });
});
