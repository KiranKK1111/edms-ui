import moment from "moment";

export const bindData = (data, form1) => {
  if (data && data.length > 0) {
    
    data.forEach((item) => {
      Object.keys(item).forEach((subItem) => {
        

        if (
          [
            "distributeDerivedData",
            "personalData",
            "dataValidity",
            "userData",
            "metaDataViewPermission",
            "notifications",
            "notifications",
            "metaData",
            "redistributionAllowed",
            "cacheAllowed",
            "stagingAllowed",
            "storageAllowed",
            "sharingAllowed",
            "cloudStorage",
            "storageAfterExpiredDate",
            "modifyOrDerivedData",
            "sampleDataAllowed",
            "projectSubscription",
          ].indexOf(subItem) !== -1
        ) {
          form1.setFieldsValue({
            [subItem]:
              typeof item[subItem] === "string"
                ? item[subItem].toLowerCase()
                : item[subItem],
          });
        } else if (subItem === "expirationDate") {
          form1.setFieldsValue({
            expirationDate: item[subItem] && moment.utc(moment(new Date(item[subItem])).format("YYYY-MM-DD[T]HH:mm:ss")),
          });
        } else {
          form1.setFieldsValue({
            [subItem]: item[subItem],
          });
        }
      });
    });
  } else {
    form1.resetFields();
  }
};