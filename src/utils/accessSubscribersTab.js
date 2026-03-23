const isSubscribersTabVisible = (record) => {
  let isdisabled = false;
  let loggedUser = localStorage.getItem("entitlementType");
  const loginedRoleName =
    loggedUser && loggedUser.toString().toLocaleLowerCase();
  if (loginedRoleName === "iam admin") {
    isdisabled = true;
  }
  return isdisabled;
};
export default isSubscribersTabVisible;
