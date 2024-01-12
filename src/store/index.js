import { applyMiddleware, compose, createStore } from "redux";
import { routerMiddleware } from "connected-react-router";
import rootReducer, { history } from "../reducers";

const store = createStore(rootReducer, compose(applyMiddleware(routerMiddleware(history))));

window.store = store;

export default store;
