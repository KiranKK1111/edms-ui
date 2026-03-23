import { SET_USER_PROFILE, UPDATE_USER_PROFILE} from "../actions/UserProfileAction";
import { LOAD_USER_PROFILE, REMOVE_USER_PROFILE} from "../actions/UserProfileAction";

const INITIAL_STATE = {
  data:[],
 
}

const userProfileReducer = (state = INITIAL_STATE , action) => {

  switch (action.type) {

      case SET_USER_PROFILE: {
        return {...state,
                data: action.payload}
        
      }
      
      case UPDATE_USER_PROFILE: {
        return {...state,
                data: action.payload}
        
      }
      
      case LOAD_USER_PROFILE: {
        return {...state,
                data: action.payload}
        
      }

      case REMOVE_USER_PROFILE : {
          return {...state}
      }
      
      case 'RESET':
          return INITIAL_STATE;
     
      default:{
        return {...state}
      }
      
  }
};

export default userProfileReducer;