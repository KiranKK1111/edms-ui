/*
  createMemoSelector — minimal createSelector replacement.

  Given N input selectors and a result function, returns a selector that
  recomputes only when at least one input value changes (===). The cached
  result is returned otherwise. Equivalent to reselect's createSelector for
  the common case, without adding a dependency.

  Usage:
    const selectVendorList = createMemoSelector(
      [(state) => state.vendor],
      (vendor) => vendor?.list ?? []
    );
*/
function createMemoSelector(inputSelectors, resultFn) {
  let lastInputs = null;
  let lastResult;

  return function memoizedSelector(state, ...args) {
    const inputs = inputSelectors.map((sel) => sel(state, ...args));

    if (lastInputs && inputs.length === lastInputs.length) {
      let same = true;
      for (let i = 0; i < inputs.length; i += 1) {
        if (inputs[i] !== lastInputs[i]) {
          same = false;
          break;
        }
      }
      if (same) return lastResult;
    }

    lastInputs = inputs;
    lastResult = resultFn(...inputs);
    return lastResult;
  };
}

export default createMemoSelector;
