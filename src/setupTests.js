// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// Complete matchMedia mock — MUI's useMediaQuery and the x-date-pickers
// rely on addEventListener/removeEventListener (and addListener/removeListener
// for older APIs). A partial mock throws "addEventListener is not a function".
global.matchMedia =
  global.matchMedia ||
  function (query) {
    return {
      matches: false,
      media: query || "",
      onchange: null,
      addListener: function () {},
      removeListener: function () {},
      addEventListener: function () {},
      removeEventListener: function () {},
      dispatchEvent: function () {
        return false;
      },
    };
  };
