import imperativeConfirm from "../design-system/imperativeConfirm";

export function warning() {
    imperativeConfirm({
        title: "A change request is already pending approval.",
        content:
            "The current details remain unchanged until the request is approved.",
        okText: "OK",
        hideCancel: true,
    });
}

export function checkForString(item, value) {
    return localStorage.getItem(item) &&
    localStorage
      .getItem(item)
      .toString()
      .toLocaleLowerCase().includes(value.toString().toLocaleLowerCase());
}