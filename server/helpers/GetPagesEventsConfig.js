const fetch = require("node-fetch");
const config = require("config");

const BASE_URL = config.get("url");

class GetPagesEventsConfig {
	constructor() {
		if (GetPagesEventsConfig._instance) {
			// eslint-disable-next-line no-constructor-return
			return GetPagesEventsConfig._instance;
		}
		GetPagesEventsConfig._instance = this;
		this._updateIntervalMs = 60000;
		this._pages = [];
		this.fetchTimer = null;
	}

	async _getPages() {
		try {
			const response = await fetch(`${BASE_URL}/api/events/config`);
			const responseJSON = await response.json();
			if (responseJSON.success) {
				this._pages = responseJSON.data;
			}
		} catch (e) {
			this._pages = [];
			console.error(e);
		} finally {
			await this._refreshTimer();
		}
	}

	async init() {
		if (!this._pages.length) {
			await this._getPages();
		}
		await this._refreshTimer();
	}

	getPages() {
		return this._pages;
	}

	async _refreshTimer() {
		if (this.fetchTimer) {
			clearTimeout(this.fetchTimer);
		}
		this.fetchTimer = setTimeout(async () => {
			await this._getPages();
		}, this._updateIntervalMs);
	}

	destroy() {
		if (this.fetchTimer) {
			clearTimeout(this.fetchTimer);
		}
	}
}

module.exports = new GetPagesEventsConfig();
