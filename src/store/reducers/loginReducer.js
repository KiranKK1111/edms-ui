import { SET_USER, REFRESH_USER, OBJECT_MATRIX } from "../actions/loginActions";

const INITIAL_STATE = {
  isAuth: false,
  userProfile: [],
  vendor: [],
  contract: [],
  objectMatrix: [],
};

const LoginReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SET_USER: {
      return Object.assign({}, action.payload, { isAuth: true });
    }

    case OBJECT_MATRIX: {
      return {
        ...state,
        objectMatrix: action.payload,
      };
    }

    case REFRESH_USER: {
      return Object.assign({}, ...state, action.payload);
    }
    case "RESET":
      return INITIAL_STATE;

    default:
      return {
        INITIAL_STATE,
      };
  }
};

export default LoginReducer;