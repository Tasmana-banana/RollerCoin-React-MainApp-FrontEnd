import store from "../store";
import fetchWithToken from "./fetchWithToken";
import * as actions from "../actions/progressionEvent";

export const getPEData = async (type) => {
	const eventAvailable = await getProgressionEvent(type);
	if (eventAvailable) {
		const dataStatus = await Promise.all([getTasks(type), getMultiplierTasks(type), getUserStats(type)]);
		const allDataSuccess = dataStatus.every((item) => item);
		if (allDataSuccess) {
			store.dispatch(actions.setIsPEAvailable(true));
		}
	}
	return true;
};

const getProgressionEvent = async (type) => {
	try {
		const query = type ? `type=${type}` : "";
		const url = `/api/progression-event/progression-event/?${query}`;
		const json = await fetchWithToken(url, {
			method: "GET",
		});
		if (!json.success || !json.data) {
			store.dispatch(actions.setRemovePE());
			return false;
		}
		const dataString = atob(json.data);

		const dataObject = JSON.parse(dataString);
		const { event, rewards, levels_config: levelsConfig } = dataObject;
		const mainReward = dataObject.rewards.find((item) => +item.required_level === +dataObject.event.max_level);
		store.dispatch(
			actions.setPEConfig({
				event,
				rewards,
				levelsConfig,
				mainReward,
			})
		);
		return true;
	} catch (e) {
		console.error(e);
		return false;
	}
};

const getTasks = async (type) => {
	try {
		const query = type ? `type=${type}` : "";
		const url = `/api/progression-event/progression-tasks/?${query}`;
		const json = await fetchWithToken(url, {
			method: "GET",
		});
		if (!json.success) {
			return false;
		}
		store.dispatch(actions.setPETasks(json.data));
		return true;
	} catch (e) {
		console.error(e);
		return false;
	}
};

const getMultiplierTasks = async (type) => {
	try {
		const query = type ? `type=${type}` : "";
		const url = `/api/progression-event/progression-multiplier-tasks/?${query}`;
		const json = await fetchWithToken(url, {
			method: "GET",
		});
		if (!json.success) {
			return false;
		}
		store.dispatch(actions.setPEMultiplierTasks(json.data));
		return true;
	} catch (e) {
		console.error(e);
		return false;
	}
};

export const getUserStats = async (type) => {
	try {
		const query = type ? `type=${type}` : "";
		const url = `/api/progression-event/progression-user-stats/?${query}`;
		const json = await fetchWithToken(url, {
			method: "GET",
		});
		if (!json.success) {
			return false;
		}
		store.dispatch(actions.setPEUserStats(json.data));
		store.dispatch(actions.setIsPEUserStatsNeedRefresh(false));
		return true;
	} catch (e) {
		console.error(e);
		return false;
	}
};
