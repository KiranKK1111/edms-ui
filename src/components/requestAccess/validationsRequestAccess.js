import axios from "axios";
import {
  API_USER_SUBSCRIPTION_MANAGEMENT_URL,
  API_SUBSCRIPTION_URL,
  API_BASE_ENDPOINT,
} from "../../utils/Config";
import { API_BASE_URL_FOR_SUBSCRIPTION } from "../../urlMappings";

export const modify = (valObj, name, error, message) => {
  let myObj = { ...valObj };
  if (myObj.hasOwnProperty(name)) {
    myObj[name].message = message;
    myObj[name].error = error;
    return myObj;
  }
};

export const checkValueExist = async (value, field) => {
  const response = await axios.get(
    `${API_BASE_URL_FOR_SUBSCRIPTION}/${API_BASE_ENDPOINT}/getSubscription`,
    {
      headers: {
        "Cache-Control": "no-store",
        Pragma: "no-cache",
        token: `Bearer ${localStorage.getItem("access_token")}`,
      },
    }
  );
  const data = await response.data.subscriptions;
  const result =
    data &&
    data.some((item) => {
      return item[field] === value;
    });
  return result;
};

export const clarityIdValidation = (valObj, idExist) => {
  if (idExist) {
    const myObj = modify(
      valObj,
      "clarityId",
      true,
      "Clarity ID already exists."
    );
    return myObj;
  } else {
    const myObj = modify(valObj, "clarityId", false, "");
    return myObj;
  }
};

export const itamIdValidation = (valObj, idExist) => {
  if (idExist) {
    const myObj = modify(valObj, "itamId", true, "ITAM ID already exists.");
    return myObj;
  } else {
    const myObj = modify(valObj, "itamId", false, "");
    return myObj;
  }
};

export const mandatoryFields = (clarityIdValue, itamIdValue) => {
  let defaultConditions = {
    clarityIdCondition: true,
    projectNameCondition: false,
    itamIdCondition: true,
    appNameCondition: false,
  };

  const clarityIdStateus =
    clarityIdValue === undefined || clarityIdValue === "" ? false : true;
  const itamIdStatus =
    itamIdValue === undefined || itamIdValue === "" ? false : true;

  if (clarityIdStateus && itamIdStatus) {
    return (defaultConditions = {
      clarityIdCondition: false,
      projectNameCondition: true,
      itamIdCondition: false,
      appNameCondition: true,
    });
  } else if (!clarityIdStateus && itamIdStatus) {
    return (defaultConditions = {
      clarityIdCondition: false,
      projectNameCondition: false,
      itamIdCondition: false,
      appNameCondition: true,
    });
  } else if (clarityIdStateus && !itamIdStatus) {
    return (defaultConditions = {
      clarityIdCondition: false,
      projectNameCondition: true,
      itamIdCondition: false,
      appNameCondition: false,
    });
  } else {
    return defaultConditions;
  }
};