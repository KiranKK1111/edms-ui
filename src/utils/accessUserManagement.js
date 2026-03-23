import {
  USER_MANAGEMENT_PAGE,
  MAIN_PAGE,
  USER_MANAGEMENT_EDIT_BTN,
} from "./Constants";
import isButtonObject from "./accessButtonCheck";

const isUserManagementDisabled = () => {
  const isMainPage = isButtonObject(USER_MANAGEMENT_PAGE, MAIN_PAGE);
  const isEditButton = isButtonObject(
    USER_MANAGEMENT_PAGE,
    USER_MANAGEMENT_EDIT_BTN
  );


  let isdisabled = false;

  if (!isMainPage && isEditButton) {
    isdisabled = true;
  }

  if (isMainPage && !isEditButton) {
    isdisabled = false;
  }

  return isdisabled;
};

export default isUserManagementDisabled;
