import { Modal } from "antd";

export function warning() {
    Modal.warning({
        title: "A change request is already pending approval.",
        content: "The current details remain unchanged until the request is approved.",
    });
}

export function checkForString(item, value) {
    return localStorage.getItem(item) &&
    localStorage
      .getItem(item)
      .toString()
      .toLocaleLowerCase().includes(value.toString().toLocaleLowerCase());
}