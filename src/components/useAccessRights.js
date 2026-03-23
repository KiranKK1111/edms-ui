const useAccessRights = (page) => {
  let getrole = localStorage.getItem("entitlementType");
  getrole = getrole ? getrole : localStorage.getItem("guestRole");
  const accessRightsData = [
    {
      role: "Read only",
      r: ["myTasks", "userManagement"],
    },
    {
      role: "dataset delegate",
      r: ["userManagement"],
    },
    {
      role: "subscriber",
      none: ["myTasks", "userManagement"],
    },
    {
      role: "guest",
      r: ["catalogue", "datafeedDetails"],
      none: ["requestAccess", "myTasks", "userManagement"],
    },
  ];
  const getRoleFromList = accessRightsData.filter((item) => {
    return (
      item.role.toString().toLocaleLowerCase() ===
      getrole.toString().toLowerCase()
    );
  });
  let permissionType = {};
  if (getRoleFromList.length) {
    if (getRoleFromList[0].r)
      permissionType.r = getRoleFromList[0].r.includes(page);
    if (getRoleFromList[0].none)
      permissionType.none = getRoleFromList[0].none.includes(page);
  }

  return permissionType;
};

export default useAccessRights;