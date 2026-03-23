
/**
 * Method to generate a unique filename with timestamp up to milliseconds.
 * Eg: 2021317141045601-file1.pdf
 *
 * @param {Object} fileObj the File object.
 */
export const getUniqueFileName = (fileObj) => {

  const now = new Date();
  const timestamp = `${now.getFullYear()}${now.getMonth() + 1}${now.getDate()}` +
    `${now.getHours()}${now.getMinutes()}${now.getSeconds()}${now.getMilliseconds()}`;
  return fileObj && fileObj.name ? `${timestamp}-${fileObj.name}` : `${timestamp}.pdf`;
};
