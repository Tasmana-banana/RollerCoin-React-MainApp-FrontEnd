const isMobileApp = () => {
	try {
		return !!+localStorage.getItem("isMobileApp") || process.env.IS_MOBILE_APP;
	} catch (e) {
		return false;
	}
};
export default isMobileApp;
