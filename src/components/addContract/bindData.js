import moment from "moment";

export const bindData = (data1, form1) => {
  let data =
    data1 &&
    data1.length &&
    data1.filter(function (element) {
      return element !== undefined;
    });
  if (data && data.length) {
    
    data.map((item) => {
      Object.keys(item).map((subItem) => {
        if (subItem === "signedOn") {
          form1.setFieldsValue({
            signedOn: moment(new Date(item[subItem])),
          });
        } else if (subItem === "startDate") {
          form1.setFieldsValue({
            startDate: moment(new Date(item[subItem])),
          });
        } else if (subItem === "expirationDate") {
          form1.setFieldsValue({
            expirationDate: moment(new Date(item[subItem])),
          });
        } else {
          form1.setFieldsValue({
            [subItem]: item[subItem],
          });
        }
      });
    });
  }
};