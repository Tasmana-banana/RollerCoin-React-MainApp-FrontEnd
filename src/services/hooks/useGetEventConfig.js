import { useEffect, useRef, useState } from "react";
import fetchWithToken from "../fetchWithToken";

const EVENT_CONFIG = {
	spin_event: {
		url: "/api/events/spin-event/config",
	},
	system_sales_event: {
		url: "/api/system-sales-events/config",
	},
};

const useGetEventConfig = (eventName) => {
	const [eventConfig, setEventConfig] = useState(null);
	const controller = useRef(null);
	const signal = useRef(null);

	const createSignalAndController = () => {
		if (controller.current) {
			controller.current.abort();
		}
		controller.current = new AbortController();
		signal.current = controller.current.signal;
	};

	useEffect(async () => {
		await getEventConfig();
		return () => {
			if (controller.current) {
				controller.current.abort();
			}
		};
	}, []);

	const getEventConfig = async () => {
		createSignalAndController();
		try {
			const json = await fetchWithToken(EVENT_CONFIG[eventName].url, {
				method: "GET",
				signal: signal.current,
			});
			if (!json.success) {
				return false;
			}
			if (json.data) {
				setEventConfig(json.data);
			}
		} catch (err) {
			console.error(err);
		}
	};
	return {
		eventConfig,
	};
};

export default useGetEventConfig;
