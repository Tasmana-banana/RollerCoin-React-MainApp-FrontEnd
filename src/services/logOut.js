import cookie from "react-cookies";
import store from "../store";
import { logOutUser } from "../actions/userInfo";
import getLanguagePrefix from "./getLanguagePrefix";
import fetchWithToken from "./fetchWithToken";

const logOut = async (signal) => {
	try {
		const json = await fetchWithToken(`/api/auth/exit`, {
			method: "POST",
			signal,
		});
		if (!json.success) {
			console.error("Something went wrong!");
		}
		const tokenJWT = localStorage.getItem("token");
		if (tokenJWT) {
			const tokenFromCookie = cookie.load("token");
			if (tokenFromCookie) {
				cookie.remove("token", { path: "/" });
			}
			localStorage.removeItem("token");
			store.dispatch(logOutUser());
			const { language } = store.getState().game;
			window.location.href = `${getLanguagePrefix(language)}/sign-in`;
		}
	} catch (e) {
		console.error(e);
		return false;
	}
};
export default logOut;
