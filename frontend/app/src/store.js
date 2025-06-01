import { createStore, combineReducers, applyMiddleware } from "redux";
import { thunk } from "redux-thunk";
import { composeWithDevTools } from "@redux-devtools/extension";
import { userDeleteReducer, userDetailsReducer, userListReducer, userLoginReducer, userSignupReducer, userUpdateProfileReducer, userUpdateReducer } from "./reducers/userReducers";
import {
  productListReducer,
  productDetailsReducer,
  productCreateReducers,
  productUpdateReducers,
  productDeleteReducers,
} from "./reducers/productReducers";
import { cartReducer } from "./reducers/cartReducers";
import { orderCreateReducer, orderDeliversReducer, orderDetailsReducer, orderListMyReducer, orderListReducers, } from "./reducers/orderReducer";

const reducer = combineReducers({
  productList: productListReducer,
  productDetails: productDetailsReducer,
  userSignup: userSignupReducer,
  userLogin: userLoginReducer,
  cart: cartReducer,
  orderCreate:orderCreateReducer,
  orderDetails:orderDetailsReducer,
  Orderdeliver:orderDeliversReducer,
  productCreate:productCreateReducers,
    productUpdate:productUpdateReducers,
    productDelete:productDeleteReducers,
    orderList:orderListReducers,
    userList:userListReducer,
    userDelete:userDeleteReducer,
    userUpdate:userUpdateReducer,
    userDetails:userDetailsReducer,
    userUpdateProfile:userUpdateProfileReducer,
   orderMyList:orderListMyReducer,
});

// ✅ Corrected defaults
const userInfoFromStorage = localStorage.getItem('userInfo')
  ? JSON.parse(localStorage.getItem('userInfo'))
  : null;
const cartItemsFromStorage = localStorage.getItem("cartItems")
  ? JSON.parse(localStorage.getItem("cartItems"))
  : [];
const ShippingAddressFromStorage = localStorage.getItem('shippingAddress')?
JSON.parse(localStorage.getItem('shippingAddress')):[]




const initialState = {cart:  {cartItems: cartItemsFromStorage , shippingAddress: ShippingAddressFromStorage },
  userLogin: { userInfo: userInfoFromStorage },
};

const middleware = [thunk];

const store = createStore(
  reducer,
  initialState,
  composeWithDevTools(applyMiddleware(...middleware))
);

export default store;
