export const DATAFEED_BY_ID = "DATAFEED_BY_ID";

export const METADATA_INFO = "METADATA_INFO";

export const METADATA_INFO_DETAIL = "METADATA_INFO_DETAIL";

export const FORM_DATA = "FORM_DATA";

export const formDataFn = (values) => {
  return {
    type: FORM_DATA,
    payload: values,
  };
};