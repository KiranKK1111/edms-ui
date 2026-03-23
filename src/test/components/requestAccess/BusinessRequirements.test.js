import BusinessRequirements, { ruleForSubscriptionFor } from "../../../components/requestAccess/BusinessRequirements";
import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

configure({ adapter: new Adapter() });

const mockDispatch = jest.fn();
const mockNext = jest.fn();
const mockSetSubscriptionFor = jest.fn();
const mockSetVendorRequest = jest.fn();
const mockFormData = { clarityId: "12345", reason: "Test reason" };

jest.mock("react-redux", () => ({
    useSelector: jest.fn(),
    useDispatch: () => mockDispatch,
}));

jest.mock("react-router-dom", () => ({
    withRouter: (component) => component,
}));

const wrapper = shallow(<BusinessRequirements
    next={mockNext}
    formData={mockFormData}
    view={"br"}
    setSubscriptionFor={mockSetSubscriptionFor}
    setVendorRequest={mockSetVendorRequest}
/>);

describe('ruleForSubscriptionFor', () => {
    test("wrapper", () => {
        const element = wrapper.find(".business");
        expect(element.length).toBe(1);
    });

    test('should reject when subFor is false and value is empty', async () => {
        await expect(ruleForSubscriptionFor(false, '')).rejects.toThrow(
            'Please enter a service account ID'
        );
    });

    test('should reject when subFor is false and value contains spaces', async () => {
        await expect(ruleForSubscriptionFor(false, 'invalid value')).rejects.toThrow(
            'Application service account ID cannot contain spaces'
        );
    });

    test('should resolve when subFor is false and value is valid', async () => {
        await expect(ruleForSubscriptionFor(false, 'validValue')).resolves.toBeUndefined();
    });

    test('should resolve when subFor is true regardless of value', async () => {
        await expect(ruleForSubscriptionFor(true, '')).resolves.toBeUndefined();
        await expect(ruleForSubscriptionFor(true, 'anyValue')).resolves.toBeUndefined();
    });
});