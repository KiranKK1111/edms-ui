const isCatelogueAccessDisabled = (record)=>{
    let isdisabled = false;
    let loggedUser = localStorage.getItem("entitlementType");
    const loginedRoleName = loggedUser && loggedUser.toString().toLocaleLowerCase() ;
    if (loginedRoleName === "dataset delegate" || loginedRoleName === "dataset owner" || loginedRoleName === "read only" ){
        isdisabled = true;
    } 
    return isdisabled;
}
export default isCatelogueAccessDisabled;