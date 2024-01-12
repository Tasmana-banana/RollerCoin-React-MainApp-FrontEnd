const initialState = {};

const notificationReducer = (state = initialState, action) => {
	switch (action.type) {
		case "SET_NOTIFICATION":
			return { ...state, ...action.state };
		default:
			return state;
	}
};

export default notificationReducer;
