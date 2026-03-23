import { ROLE_LIST, ALL_USERS_DATA } from "../actions/userManagementActions";
let INITIAL_STATE = {
  roleList: [],
  allUsersList: {},
};
const UserManagementReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ROLE_LIST:
      return {
        ...state,
        roleList: action.payload,
      };
    case ALL_USERS_DATA:
      return {
        ...state,
        allUsersList: action.payload,
      };

    default:
      return state;
  }
};

export default UserManagementReducer;