import { CATALOGUE_LIST } from "../actions/CatalogPageActions";
const INITIAL_DATA = {
  catalogueList: [],
  loading: false,
};

const CatalogueReducer = (state = INITIAL_DATA, action) => {
  switch (action.type) {
    case CATALOGUE_LIST:
      return {
        ...state,
        catalogueList: action.payload,
        loading: action.loading,
      };
    default:
      return state;
  }
};

export default CatalogueReducer;