import moment from 'moment';

export const bindData = (data, form) => {
  if (data.length > 0) {
    return data.map((item) => {
      return Object.keys(item).map((subItem) => {
        if (subItem === 'reason') {
          form.setFieldsValue({
            reasonForSubscription: item[subItem],
          });
        }
        if (subItem === 'licensesSubscribed') {
          form.setFieldsValue({
            numberOfEndUserSubscriptions: item[subItem],
          });
        }
        if (subItem === 'subscriptionStatus') {
          form.setFieldsValue({
            status: item[subItem],
          });
        }
        form.setFieldsValue({
          [subItem]: item[subItem],
        });
        return subItem;
      });
    });
  }
};
