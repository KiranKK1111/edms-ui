const isAcessMasterDataDisabled = (record) => {
  let isDisabled = true;
  let loggedUser = localStorage.getItem("entitlementType");
  const loginedRoleName =
    loggedUser && loggedUser.toString().toLocaleLowerCase();
  if (loginedRoleName === "dataset delegate") {
    isDisabled = false;
  }
  if (loginedRoleName === "read only" || loginedRoleName === "dataset owner") {
    isDisabled = false;
  }
  return isDisabled;
};

export default isAcessMasterDataDisabled;
