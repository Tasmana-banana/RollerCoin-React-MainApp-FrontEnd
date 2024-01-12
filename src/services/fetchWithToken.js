import cookie from "react-cookies";
import store from "../store";
import getLanguagePrefix from "./getLanguagePrefix";
import { logOutUser } from "../actions/userInfo";

export default async (url, options = {}, contentType = "application/json") => {
	const checkStatus = (response) => {
		if (response.status === 401) {
			localStorage.removeItem("token");
			store.dispatch(logOutUser());
			const { language } = store.getState().game;
			window.location.href = `${getLanguagePrefix(language)}/sign-in`;
		}
		return response;
	};

	const tokenJWT = localStorage.getItem("token");

	// performs api calls sending the required authentication headers
	const headers = {
		Accept: "application/json",
	};
	if (contentType) {
		headers["Content-Type"] = contentType;
	}
	if (tokenJWT) {
		headers.Authorization = `Bearer ${tokenJWT}`;
	}
	const xCsrf = cookie.load("x-csrf");
	if (xCsrf) {
		headers["CSRF-Token"] = cookie.load("x-csrf");
	}
	const fetchedData = await fetch(url, {
		headers,
		...{ credentials: "include" },
		...options,
	});
	const checkedData = checkStatus(fetchedData);
	const responseData = await checkedData.json();
	responseData.status = checkedData.status;
	return responseData;
};
