import PropTypes from "prop-types";
import store from "../store";
import fetchWithToken from "./fetchWithToken";
import { setNotification } from "../actions/notification";

const isShowNotification = (notificationData) => {
	const isShow = (notificationData.is_need_to_accept && !notificationData.is_notification_accept) || (!notificationData.is_need_to_accept && !notificationData.is_notification_read);

	return {
		...notificationData,
		is_show_notification: isShow,
	};
};

const setNotificationReadAccept = async (type, notificationData) => {
	const body = {
		type,
		notification_id: notificationData.notification_id,
	};
	try {
		const json = await fetchWithToken("/api/notifications/post-notification", {
			method: "POST",
			body: JSON.stringify(body),
		});

		if (!json.success) {
			return false;
		}

		if (type === "read") {
			const newNotificationData = { ...notificationData, is_notification_read: true };
			store.dispatch(setNotification({ [notificationData.name]: { ...isShowNotification(newNotificationData) } }));
		}
		if (type === "accept") {
			const newNotificationData = { ...notificationData, is_notification_accept: true };
			store.dispatch(setNotification({ [notificationData.name]: { ...isShowNotification(newNotificationData) } }));
		}
	} catch (err) {
		console.error(err);
	}
};

setNotificationReadAccept.propTypes = {
	type: PropTypes.string.isRequired,
	notificationData: PropTypes.object.isRequired,
};

export default setNotificationReadAccept;
