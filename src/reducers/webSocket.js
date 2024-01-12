const initialState = {
	wsNode: null,
};

const wsNodeReducer = (state = initialState, action) => {
	switch (action.type) {
		case "SET_WS_NODE_CONNECTION":
			return { ...state, ...{ wsNode: action.wsNode } };

		default:
			return state;
	}
};

export default wsNodeReducer;
