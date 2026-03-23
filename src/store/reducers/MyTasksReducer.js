import { GET_TASKS, SET_TASKS_COUNT,SET_PENDING_TASKS_LIST,SET_COMPLETED_TASKS_LIST }
  from "../actions/MyTasksActions";

const INITIAL_STATE = {
  loading: false,
  data: {},
  list: [],
  pendingList:[],
  completedList:[],
};

const MyTasksReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case GET_TASKS:
      return {
        ...state,
        loading: true,
        list: action.payload
      };
    case SET_TASKS_COUNT:
      return {
        ...state,
        data: action.payload
      };
    case SET_PENDING_TASKS_LIST:
        return {
          ...state,
          pendingList: action.payload
        };
    case SET_COMPLETED_TASKS_LIST:
          return {
            ...state,
            completedList: action.payload
          };
    default:
      return state;
  }
};

export default MyTasksReducer;