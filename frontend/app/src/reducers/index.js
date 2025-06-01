// src/reducers/index.js
import { combineReducers } from 'redux';
import { productListReducer } from './productReducers';

const rootReducer = combineReducers({
  productList: productListReducer,
});

export default rootReducer;
