import axios from "axios";
import { API_BASE_ENDPOINT } from "../../utils/Config";
import { API_BASE_URL_FOR_ENTITY } from "../../urlMappings";

export const DATASET_FORM = "DATASET_FORM";
export const CLEAR_DATASET = "CLEAR_DATASET";

export const datasetInfo = (data) => {
  return {
    type: DATASET_FORM,
    payload: data,
  };
};

export const clearDataset = () => {
  return {
    type: CLEAR_DATASET,
  };
};

export const startDataset = (formData) => {
  const isUpdate = formData.isUpdate;
  delete formData.isUpdate;
  return async () => {
    try {
      const response = await axios({
        method: isUpdate ? "PUT" : "POST",
        url: isUpdate
          ? `${API_BASE_URL_FOR_ENTITY}/${API_BASE_ENDPOINT}/updateDataSet`
          : `${API_BASE_URL_FOR_ENTITY}/${API_BASE_ENDPOINT}/createDataSet`,
        headers: {
          token: `Bearer ${localStorage.getItem("access_token")}`,
        },
        data: formData,
      });
      return response;
    } catch (err) {
      return err;
    }
  };
};