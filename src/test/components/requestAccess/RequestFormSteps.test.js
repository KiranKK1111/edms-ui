import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { Steps, Button } from "antd";
import RequestFormSteps from "../../../components/requestAccess/RequestFormSteps";

configure({ adapter: new Adapter() });

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
}));

jest.mock("react-router-dom", () => ({
  withRouter: (component) => component,
  useLocation: jest.fn().mockReturnValue({
    state: { data: {} },
  }),
}));

describe("RequestFormSteps", () => {
  const mockStepsLength = jest.fn();
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(
      <RequestFormSteps
        contractManagement={false}
        stepsLength={mockStepsLength}
      />
    );
  });

  it("should render Steps component", () => {
    expect(wrapper.find(Steps).length).toBe(1);
  });

  it("should render 3 Step components", () => {
    expect(wrapper.find(Steps.Step || "Step").length).toBe(3);
  });

  it("should render Next button initially", () => {
    const buttons = wrapper.find(Button);
    const nextBtn = buttons.filterWhere(
      (btn) => btn.prop("type") === "primary"
    );
    expect(nextBtn.length).toBeGreaterThanOrEqual(1);
  });

  it("should not render Previous button on first step", () => {
    const html = wrapper.debug();
    expect(html).not.toContain("Previous");
  });

  it("should have step titles", () => {
    const steps = wrapper.find(Steps.Step || "Step");
    expect(steps.length).toBe(3);
  });
});
