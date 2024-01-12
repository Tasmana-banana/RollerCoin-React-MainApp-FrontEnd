import fetchWithToken from "./fetchWithToken";

async function convertCurrency(signal, currencyFrom, currencyTo, amount, setFunction, codeForObj = null) {
	try {
		const request = await fetchWithToken(`/api/crowdfunding/convert-currency/${currencyFrom.toLowerCase()}/${currencyTo.toLowerCase()}/${amount}`, {
			method: "GET",
			signal,
			credentials: "include",
		});
		if (!request.success || !request.value) {
			console.error(request.error);
			return false;
		}
		if (!codeForObj) {
			setFunction(request.value);
		} else {
			setFunction(codeForObj, request.value);
		}
		return request.success;
	} catch (e) {
		console.error(e);
		return false;
	}
}
export default convertCurrency;
