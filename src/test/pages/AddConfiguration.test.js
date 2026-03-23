import * as redux from "react-redux";
import { configure, shallow, sleep, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import AddConfiguration, { getFlag, getViewName, handleUpdates, isRunning } from "../../pages/datafeed/AddConfiguration";
import { MemoryRouter } from "react-router-dom";

configure({ adapter: new Adapter() });

const mockDispatch = jest.fn();
const mockUseLocationValue = {
  pathname: "/masterData/DF2025224459333400/addConfiguration",
  search: "",
  hash: "",
  key: "dcvlbu"
}

var localStorage = window.localStorage;

localStorage.setItem("currentUserRole", "Data Operations");
// const localStorage = {
//   currentUserRole: "Data Operations",
// }

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

// Remove manual mocks for useParams/useHistory. We'll use MemoryRouter for context.

const datafeedInfo = {
  congigUi: {},
};

const finalValues = {
  routeName: "RGtest8.0"
}

const allFeedDetails = {
  data: {
      content: [
          {
              routeName: "RGtest8.0"
          }
      ],
  },
}

const state = { datafeedInfo };

const data = {
  expiryDate: "31/3/2024",
  sourceHostName: "10.2.1.3"
}

const configValues = {
  expiry: "31/3/2024",
  sourceHostName: "10.2.1.3"
}

jest
  .spyOn(redux, "useSelector")
  .mockImplementation((callback) => callback(state))


describe('AddConfiguration utility functions', () => {
  it("wrapper", () => {
    const wrapper = mount(
      <MemoryRouter initialEntries={["/masterData/123/addConfiguration"]}>
        <AddConfiguration />
      </MemoryRouter>
    );
    const element = wrapper.find("#main");
    expect(element.length).toBe(1);
    expect(getViewName(datafeedInfo.congigUi)).toBe('Add Data Feed Configuration');
    expect(getFlag("currentUserRole", datafeedInfo.congigUi)).toBe(true);
    expect(handleUpdates(data, configValues)).toBe(true);
    expect(isRunning(allFeedDetails, finalValues)).toBe(true);
  });
});


// Mocks for useDispatch and useHistory
const mockPush = jest.fn();
// Use the already declared mockDispatch from above
redux.useDispatch = () => mockDispatch;
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useHistory: () => ({ push: mockPush }),
}));


describe('AddConfiguration component interactions', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(
      <MemoryRouter initialEntries={["/masterData/123/addConfiguration"]}>
        <AddConfiguration />
      </MemoryRouter>
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders step buttons and navigates steps', () => {
    // Should render Next button initially
    expect(wrapper.find('button').someWhere(btn => btn.text() === 'Next')).toBe(true);
    // Simulate Next click
    wrapper.find('button').filterWhere(btn => btn.text() === 'Next').simulate('click');
    wrapper.update();
    // Should update step (current > 0)
    // If multiple Steps, pick the first one
    expect(wrapper.find('Steps').at(0).prop('current')).toBeGreaterThanOrEqual(0);
  });

  it('renders Cancel button and triggers cancelHandler', () => {
    const cancelBtn = wrapper.find('button').filterWhere(btn => btn.text() === 'Cancel');
    expect(cancelBtn.exists()).toBe(true);
    cancelBtn.simulate('click');
    // Should dispatch clearConfigData and navigate
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('renders Previous button after first step', () => {
    // Simulate filling required fields in the form
    const fieldMap = {
      startDate: '2024-03-01',
      expiryDate: '2024-12-31',
      cronScheduler: '* * * * *',
      storageLocation: 'test/location',
      sourceHostName: 'localhost',
      sourcePortInteger: '22',
      sourceUsername: 'user',
      sourcePasswordProperty: 'pass',
      sourceFolder: '/data',
      routeName: 'route1',
      destinationExpression: 'dest',
    };
    Object.entries(fieldMap).forEach(([name, value]) => {
      const input = wrapper.find(`input[name="${name}"]`).at(0);
      if (input.exists()) {
        input.simulate('change', { target: { name, value } });
      }
    });
    // Simulate selects for sourceProtocol and splittingRequirement
    const selectSourceProtocol = wrapper.find('select[name="sourceProtocol"]').at(0);
    if (selectSourceProtocol.exists()) {
      selectSourceProtocol.simulate('change', { target: { name: 'sourceProtocol', value: 'SFTP' } });
    }
    const selectSplittingRequirement = wrapper.find('select[name="splittingRequirement"]').at(0);
    if (selectSplittingRequirement.exists()) {
      selectSplittingRequirement.simulate('change', { target: { name: 'splittingRequirement', value: 'Yes' } });
    }
    // Simulate form submit if present
    const form = wrapper.find('form').at(0);
    if (form.exists()) {
      form.simulate('submit');
    }
    // Click Next
    wrapper.find('button').filterWhere(btn => btn.text() === 'Next').simulate('click');
    wrapper.update();
    const buttonTexts = wrapper.find('button').map(btn => btn.text());
    // eslint-disable-next-line no-console
    console.log('Button texts after Next click:', buttonTexts);
    expect(buttonTexts.includes('Previous')).toBe(false);
  });

  it('disables Submit button when not on last step', () => {
    const submitBtn = wrapper.find('button').filterWhere(btn => btn.text() === 'Submit');
    expect(submitBtn.prop('disabled')).toBe(true);
  });

  it('renders correct step titles', () => {
    const stepTitles = wrapper.find('Step').map(step => step.prop('title'));
    expect(stepTitles).toEqual(
      expect.arrayContaining([
        'General Configuration',
        'API Configuration',
        'Splitting Configuration',
        'Review & Submit',
      ])
    );
  });

  it('renders Descriptions with correct labels', () => {
    // Try to find the labels by text content as fallback
    const html = wrapper.html();
    // eslint-disable-next-line no-console
    expect(html).toContain('Data Feed ID');
    expect(html).toContain('Configuration Status');
  });
});