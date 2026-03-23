export const LICENSE_DETAILS = "LICENSE_DETAILS";

export const USAGE = "USAGE";
export const STORAGE = "STORAGE";
export const DATASET = "DATASET";
export const SUPPORT = "SUPPORT";
export const UPLOAD = "UPLOAD";

export const licenseDetails = (data) => {
  return {
    type: LICENSE_DETAILS,
    payload: data,
  };
};

export const usage = (data) => {
  return {
    type: USAGE,
    payload: data,
  };
};

export const storage = (data) => {
  return {
    type: STORAGE,
    payload: data,
  };
};

export const dataset = (data) => {
  return {
    type: DATASET,
    payload: data,
  };
};

export const support = (data) => {
  return {
    type: SUPPORT,
    payload: data,
  };
};

export const upload = (data) => {
  return {
    type: UPLOAD,
    payload: data,
  };
};