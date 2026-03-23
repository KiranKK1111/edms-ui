import axios from "axios";

import { API_BASE_ENDPOINT, API_SQL_RECORDS_URL } from "../../utils/Config";
import { ACCESS_CONTROL_ALLOW_ORIGIN_STAR, CONTENT_TYPE_APPLICATION_JSON, METHOD_POST }
  from "../../utils/Constants";

export const getUserProfileById = async (psid) => {
  const data = {
    input: 'SELECT u.ps_id AS psid, u.entitlement_type AS entitlementType, ' +
      'u.last_login AS lastLogin, u.first_login AS firstLogin, u.new_subscriptions AS newSubscriptions, ' +
      'u.system_messages AS systemMessages FROM user_profile u WHERE u.ps_id = :customInteger1 LIMIT 1',
    customInteger1: Number.parseInt(psid, 10)
  };

  return axios({
    method: METHOD_POST,
    url: `${API_SQL_RECORDS_URL}/${API_BASE_ENDPOINT}/getDefaultRecords`,
    data: data,
    headers: {
      "Content-Type": CONTENT_TYPE_APPLICATION_JSON,
      "Access-Control-Allow-Origin": ACCESS_CONTROL_ALLOW_ORIGIN_STAR,
    }
  });
};