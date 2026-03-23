export const FILE_DETAILS = "FILE_DETAILS";

export const DOWNLOAD = "DOWNLOAD";
export const GET_FILES = "GET_FILES";
export const CATELOG_FILES = "CATELOG_FILES";
export const SUPPORT = "SUPPORT";
export const UPLOAD = "UPLOAD";
export const DELETE_DOCUMENT = "DELETE_DOCUMENT";

export const GET_ALL_DOCUMENTS = "GET_ALL_DOCUMENTS";

export const fileDetails = (data) => {
  return {
    type: FILE_DETAILS,
    payload: data,
  };
};

export const download = (data) => {
  return {
    type: DOWNLOAD,
    payload: data,
  };
};

export const storage = (data) => {
  return {
    type: GET_FILES,
    payload: data,
  };
};

export const catalog = (data) => {
  return {
    type: CATELOG_FILES,
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

const getFilesDownload = (data) => {
  return {
    type: GET_ALL_DOCUMENTS,
    payload: data,
  };
};

const deleteDocument = (data) => {
  return {
    type: DELETE_DOCUMENT,
    payload: data,
  };
};