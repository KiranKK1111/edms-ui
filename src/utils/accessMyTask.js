import isButtonObject from "./accessButtonCheck";
import {
  MAIN_PAGE,
  MY_TASK_PAGE,
  APPROVE_REJECT_BTN,
  APPROVE_REJECT_BTN_SUBS,
  APPROVE_REJECT_BTN_REMAINING,
} from "./Constants";

const isPageAcces = isButtonObject(MY_TASK_PAGE, MAIN_PAGE);

const isAcessDisabled = (record) => {
  const isApproveReject = isButtonObject(MY_TASK_PAGE, APPROVE_REJECT_BTN);
  const isSubcriptionBtn = isButtonObject(
    MY_TASK_PAGE,
    APPROVE_REJECT_BTN_SUBS
  );
  const isRemainingObj = isButtonObject(
    MY_TASK_PAGE,
    APPROVE_REJECT_BTN_REMAINING
  );
  let isdisabled = true;

  const taskListObject = record && record.taskListObject;
  if (
    taskListObject.toLocaleLowerCase() === "subscription" &&
    isApproveReject &&
    !isSubcriptionBtn &&
    isRemainingObj &&
    !isPageAcces
  ) {
    isdisabled = false;
  }
  //DO
  if (!isApproveReject && isSubcriptionBtn && isRemainingObj && isPageAcces) {
    isdisabled = false;
  }

  return isdisabled;
};

export default isAcessDisabled;
