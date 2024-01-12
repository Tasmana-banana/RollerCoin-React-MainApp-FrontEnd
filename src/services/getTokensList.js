import fetchWithToken from "./fetchWithToken";

async function getTokensList(signal, setTokensList) {
	try {
		const json = await fetchWithToken("/api/crowdfunding/token-transactions-list", {
			method: "GET",
			signal,
		});
		if (!json.success || !Object.keys(json.data).length) {
			return false;
		}
		setTokensList(json.data);
	} catch (e) {
		console.error(e);
	}
}
export default getTokensList;
