const initialState = [];

const pagesEventsConfigReducer = (state = initialState, action) => {
	switch (action.type) {
		case "SET_PAGES_EVENTS_CONFIG":
			return [...state, ...action.state];
		default:
			return state;
	}
};

export default pagesEventsConfigReducer;
