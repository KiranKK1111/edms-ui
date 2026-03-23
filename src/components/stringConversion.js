export function camelize(text) {
  text = text.replace(/[-_\s.]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""));
  return text.substr(0, 1).toLowerCase() + text.substr(1);
}

export function normalText(text) {
  text = text.replace(/([A-Z])/g, " $1");
  return text.replace(/^./, function (str) {
    return str.toUpperCase();
  });
}

export function normalLabel(text) {
  text = text.replace(/([A-Z])/g, " $1").toLowerCase();
  text = text.charAt(0).toUpperCase() + text.slice(1);
  return text;
}

/*export function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}*/

export function camelText(str) {
  let result = str && str.charAt(0).toString();
  result += str && str.substr(1).toLowerCase();
  return result;
}

//check shortName has '/'
export const checkUrlSlash = (frontSlashVar) => {
  if (frontSlashVar && frontSlashVar.toLowerCase() !== "re") {
    return frontSlashVar && frontSlashVar.includes("/")
      ? frontSlashVar.replaceAll("/", "%2F")
      : frontSlashVar;
  }
};

export const getCustomLabels = (item) => {
  let label = normalLabel(item).includes("id") ?
    normalLabel(item).replace("id", "ID") :
    normalLabel(item).includes("licences") ?
      normalLabel(item).replace("licences", "Licences") :
      normalLabel(item).includes("On demand") ?
        normalLabel(item).replace("On demand", "On-demand") :
        normalLabel(item).includes("end user subscriptions") ?
          normalLabel(item).replace("end user subscriptions", "Licences") :
          normalLabel(item);
  return label;
}

export const getObjFromSubscription = (subscription, value) => {
  if(subscription && 
    subscription.businessRequirements && 
    subscription.businessRequirements.length > 0 && 
    subscription.businessRequirements[0]) {
      return subscription.businessRequirements[0][value]
    }
}