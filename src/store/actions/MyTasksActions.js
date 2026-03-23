
import axios from "axios";
import {
  API_BASE_ENDPOINT,
  API_VENDOR_URL,
  API_TASKLIST_URL,
} from "../../utils/Config";
import { getOverViewRecords } from "../services/VendorService";
import { API_BASE_URL_FOR_CHANGE } from "../../urlMappings";

export const GET_TASKS = "GET_TASKS";
export const SET_TASKS_COUNT = "SET_TASKS_COUNT";

export const SET_COMPLETED_TASKS_LIST = "SET_COMPLETED_TASKS_LIST";
export const SET_PENDING_TASKS_LIST = "SET_PENDING_TASKS_LIST";
let outStandingCount, overDue, complete;

export const setTasksList = (tasksList) => {
  return {
    type: GET_TASKS,
    payload: tasksList,
  };
};

export const setCompletedTasksList = (completedList) => {
  return {
    type: SET_COMPLETED_TASKS_LIST,
    payload: completedList,
  };
};

export const setPendingTasksList = (pendingList) => {
  return {
    type: SET_PENDING_TASKS_LIST,
    payload: pendingList,
  };
};

export const setTasksCount = (task) => {
  return {
    type: SET_TASKS_COUNT,
    payload: task,
  };
};

export const getAllTasks = () => {
  return async (dispatch) => {
    axios
      .get(`${API_BASE_URL_FOR_CHANGE}/${API_BASE_ENDPOINT}/getTaskLists`, {
        headers: {
          "Cache-Control": "no-store",
          Pragma: "no-cache",
          token: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })
      .then((response) => {
        const tasksList = response.data.taskListofList;

        let myTasks_list = tasksList;

        dispatch(setTasksList(myTasks_list));
        if (tasksList) {
          const completedList = myTasks_list.filter((item) => {
            return (
              item.taskListTaskStatus &&
              (item.taskListTaskStatus.toLowerCase() === "approved" ||
                item.taskListTaskStatus.toLowerCase() === "rejected")
            );
          });
          const outStandingList = myTasks_list.filter((item) => {
            return (
              item.taskListTaskStatus &&
              item.taskListTaskStatus.toLowerCase() === "pending"
            );
          });

          outStandingCount =
            outStandingList && outStandingList.length
              ? outStandingList.length
              : 0;
          complete =
            completedList && completedList.length ? completedList.length : 0;
          dispatch(
            setTasksCount({
              outStandingCount: outStandingCount,
              complete: complete,
              overDue: overDue,
            })
          );
          dispatch(setCompletedTasksList(completedList));
          dispatch(setPendingTasksList(outStandingList));
        } else {
          dispatch(
            setTasksCount({ outStandingCount: 0, complete: 0, overDue: 0 })
          );
        }
      })
      .catch((error) => {
        if (error && error.response && error.response.status === 404) {
          const myTasks_list = [];
          dispatch(setTasksList(myTasks_list));
          dispatch(setCompletedTasksList([]));
          dispatch(setPendingTasksList([]));
        }
        return error.response;
      });
  };
};

export const updateTaskAction = (data) => {
  let dataFinal = { ...data };
  return async (dispatch) => {
    const response = await axios({
      method: "PUT",
      url: `${API_BASE_URL_FOR_CHANGE}/${API_BASE_ENDPOINT}/updateTaskList`,
      headers: {
        token: `Bearer ${localStorage.getItem("access_token")}`,
      },
      data: dataFinal,
    });
    return response;
  };
};

export const getOverViewRecordsList = () => {
  return async (dispatch) => {
    try {
      await getOverViewRecords().then((response) => {
        if (response && response.data && response.data.length > 0) {
          overDue =
            response.data && response.data.length ? response.data.length : 0;
        }
      });
    } catch (e) {}
  };
};