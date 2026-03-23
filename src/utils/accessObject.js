const getPermissionObject = (categoryName, objName) => {
  const objectMatrixRow =
    JSON.parse(localStorage.getItem("objectMatrix")) || [];
  let singleRowObject;
  if (objectMatrixRow && objectMatrixRow.length > 0) {
    const singleRow = objectMatrixRow.filter(
      (item) =>
        item.category.toLowerCase().includes(categoryName.toLowerCase()) &&
        item.objectName.toLowerCase() === objName.toLowerCase()
    );
    if (singleRow.length > 0) {
      singleRowObject = singleRow[0];
    }
  }

  return singleRowObject;
};
export default getPermissionObject;
