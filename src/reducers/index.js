import { combineReducers } from "redux";
import { connectRouter } from "connected-react-router";
import { createBrowserHistory } from "history";
import gameReducer from "./game";
import walletReducer from "./wallet";
import userInfoReducer from "./userInfo";
import marketplaceReducer from "./marketplace";
import webSocketReducer from "./webSocket";
import notificationReducer from "./notifications";
import progressionEventReducer from "./progressionEvent";
import pagesEventsConfigReducer from "./pagesEventsConfig";

export const history = createBrowserHistory();

const rootReducer = combineReducers({
	router: connectRouter(history),
	game: gameReducer,
	user: userInfoReducer,
	wallet: walletReducer,
	marketplace: marketplaceReducer,
	webSocket: webSocketReducer,
	notification: notificationReducer,
	progressionEvent: progressionEventReducer,
	pagesEventsConfig: pagesEventsConfigReducer,
});

export default rootReducer;
