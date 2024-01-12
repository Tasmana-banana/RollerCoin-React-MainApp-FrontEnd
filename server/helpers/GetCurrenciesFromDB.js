const fetch = require("node-fetch");
const config = require("config");

const BASE_URL = config.get("url");

class GetRollerCurrencies {
	constructor() {
		if (GetRollerCurrencies._instance) {
			// eslint-disable-next-line no-constructor-return
			return GetRollerCurrencies._instance;
		}
		GetRollerCurrencies._instance = this;
		this._updateIntervalMs = 60000;
		this._currencies = [];
		this.fetchTimer = null;
	}

	async _getСurrencies() {
		try {
			const response = await fetch(`${BASE_URL}/api/wallet/get-currencies-config`);
			const responseJSON = await response.json();
			if (responseJSON.success) {
				this._currencies = responseJSON.data.currencies_config;
			}
		} catch (e) {
			this._currencies = [];
			console.error(e);
		} finally {
			await this._refreshTimer();
		}
	}

	async init() {
		if (!this._currencies.length) {
			await this._getСurrencies();
		}
		await this._refreshTimer();
	}

	getCurrencies() {
		return this._currencies;
	}

	async _refreshTimer() {
		if (this.fetchTimer) {
			clearTimeout(this.fetchTimer);
		}
		this.fetchTimer = setTimeout(async () => {
			await this._getСurrencies();
		}, this._updateIntervalMs);
	}

	destroy() {
		if (this.fetchTimer) {
			clearTimeout(this.fetchTimer);
		}
	}
}

module.exports = new GetRollerCurrencies();
