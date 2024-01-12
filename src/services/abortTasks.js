const abortTasks = () => {
	const controllers = new Map();

	const abortAll = () => controllers.forEach((fn) => fn?.abort());

	const create = (id) => {
		if (controllers.has(id)) {
			controllers.get(id).abort();
		}
		controllers.set(id, new AbortController());
	};

	const getSignal = (id) => controllers.get(id)?.signal;

	return { getSignal, create, abortAll };
};

export default abortTasks;
