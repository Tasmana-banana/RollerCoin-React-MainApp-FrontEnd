const fixUSDTokensKey = (data) =>
	Object.keys(data).reduce((acc, key) => {
		if (data[key]) {
			const keyCurrency = key.split("_")[1] ? key.split("_")[1] : key;
			acc[keyCurrency] = data[key];
		}
		return acc;
	}, {});

export default fixUSDTokensKey;
