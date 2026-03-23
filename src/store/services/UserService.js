import Axios from "axios";

import { API_BASE_ENDPOINT, API_SQL_RECORDS_URL } from "../../utils/Config";
import { ACCESS_CONTROL_ALLOW_ORIGIN_STAR, CONTENT_TYPE_APPLICATION_JSON, METHOD_POST }
  from "../../utils/Constants";


export const getUserByDataFamilyAndUserId = async (dataFamilyIds, userId) => {

  if (!dataFamilyIds || dataFamilyIds.length === 0) {
    return Promise.reject(new Error('Data Family ID cannot be NULL for fetching User..'));
  }

  if (!userId) {
    return Promise.reject(new Error('User ID cannot be NULL for fetching User..'));
  }

  const data = {
    input: "SELECT u.user_id AS userId, u.data_family_id AS dataFamilyId, " +
      "u.hasapiaccess AS hasApiAccess FROM user_lvl_sub_mgmt u WHERE " +
      "u.data_family_id IN (:valuesList) AND u.user_id = ':userId' ORDER BY " +
      "u.creation_date DESC LIMIT 1",
    valuesList: dataFamilyIds,
    userId: userId
  };

  try {
    const response = await Axios({
      method: METHOD_POST,
      url: `${API_SQL_RECORDS_URL}/${API_BASE_ENDPOINT}/getRecords`,
      data: data,
      headers: {
        "Content-Type": CONTENT_TYPE_APPLICATION_JSON,
        "Access-Control-Allow-Origin": ACCESS_CONTROL_ALLOW_ORIGIN_STAR,
      }
    });
    
    return response;

  } catch (err) {
    return err;
  }
};