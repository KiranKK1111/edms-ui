const isAccesPageDisabled = (categoryName, objName) => {
  let isdisabled = true;
  const objectMatrix = JSON.parse(localStorage.getItem("objectMatrix")) || [];
  if (objectMatrix && objectMatrix.length > 0) {
    const singleRow = objectMatrix.filter(
      (item) =>
        item.category.toLowerCase().includes(categoryName.toLowerCase()) &&
        item.objectName.toLowerCase() === objName.toLowerCase()
    );
    if (
      singleRow &&
      singleRow.length > 0 &&
      (singleRow[0].permission === "RW" || singleRow[0].permission === "R") &&
      objName === "Main Page"
    ) {
      //Page Access or not
      isdisabled = false;
    }
  }
  return isdisabled;
};
export default isAccesPageDisabled;
