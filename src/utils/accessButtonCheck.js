const isButtonObject = (categoryName, objName) => {
  let isdisabled = true;
  const objectMatrix = JSON.parse(localStorage.getItem("objectMatrix")) || [];
  if (objectMatrix && objectMatrix.length > 0) {
    const singleRow = objectMatrix.filter(
      (item) =>
        item.category &&
        item.objectName &&
        item.category.toLowerCase().includes(categoryName.toLowerCase()) &&
        item.objectName.toLowerCase() === objName.toLowerCase()
    );
    if (singleRow && singleRow.length > 0 && objName === "Main Page") {
      if (singleRow[0].permission === "RW") {
        isdisabled = true;
      }
      if (singleRow[0].permission === "R") {
        isdisabled = false;
      }
    }

    if (singleRow && singleRow.length > 0 && objName !== "Main Page") {
      if (singleRow[0].permission === "RW") {
        isdisabled = false;
      }
      if (singleRow[0].permission === "R") {
        isdisabled = true;
      }
    }
  }

  return isdisabled;
};
export default isButtonObject;
