export const modify = (valObj, name, error, message) => {
    let myObj = { ...valObj };
    if (myObj.hasOwnProperty(name)) {
        myObj[name].message = message;
        myObj[name].error = error;
        return myObj;
    }
};

export const clarityIdValidation = (value, valObj) => {
    if (value === "") {
        const myObj = modify(valObj, "clarityId", true, "Clarity ID is mandatory.");
        return myObj;
    } else if (value.length > 8) {
        const myObj = modify(
            valObj,
            "contractid",
            true,
            "Please enter a valid Clarity ID"
        );
        return myObj;
    } else {
        const myObj = modify(valObj, "clarityId", false, "");
        return myObj;
    }
};