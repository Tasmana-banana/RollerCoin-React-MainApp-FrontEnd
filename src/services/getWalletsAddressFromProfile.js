import store from "../store";

const getWalletsAddressFromProfile = (wallets) => {
	const { rollerCurrencies } = store.getState().wallet;
	const walletsConfig = rollerCurrencies.filter((item) => item.userWalletKey).reduce((acc, curr) => ({ ...acc, [curr.userWalletKey]: curr.code }), {});
	return Object.keys(wallets)
		.filter((itemKey) => walletsConfig[itemKey])
		.reduce((acc, key) => ({ ...acc, [walletsConfig[key]]: wallets[key].address }), {});
};

export default getWalletsAddressFromProfile;
