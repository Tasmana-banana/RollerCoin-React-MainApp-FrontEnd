const WsStateDisconnected = 0;
const WsStateDisconnecting = 1;
const WsStateConnected = 2;
const WsStateConnecting = 3;
const RECONNECT_TIMEOUT = 5000;

export default class WSocket {
	constructor(url, initialSocketRequests) {
		this.wsState = WsStateDisconnected;
		this.timer = null;
		this.url = url;
		this.ws = null;
		this.initialSocketRequests = initialSocketRequests;
		this.isreconnect = false;
		this.disableReconect = false;
		this.listenersMessage = {};
		this.listenersOpen = {};
		this.forceReconnect = false;
		this.reconnectInterval = RECONNECT_TIMEOUT;
	}

	connect = () => {
		if (this.wsState === WsStateConnected) {
			return this.reconnect();
		}
		if (this.wsState !== WsStateDisconnected) {
			return null;
		}
		this.wsState = WsStateConnecting;
		const token = localStorage.getItem("token") || "";
		const url = `${this.url}${token ? `?token=${token}` : ""}`;
		this.ws = null;
		this.ws = new WebSocket(url);
		this.addListenersForSocketEvents();
	};

	addGlobalListener = (data) => {
		Object.keys(this.listenersMessage).forEach((key) => {
			this.listenersMessage[key](data);
		});
	};

	addListenersForSocketEvents = () => {
		this.ws.addEventListener("message", this.addGlobalListener);
		this.ws.addEventListener("close", this.onClose);
		this.ws.addEventListener("open", this.onOpen);
		this.ws.addEventListener("error", this.onError);
	};

	disconnect = () => {
		this.setReconnect(false);
		if (this.ws !== null) {
			if (this.wsState === WsStateConnected) {
				this.wsState = WsStateDisconnecting;
				this.ws.close(1000, "doclose");
			}
		}
	};

	isConnected = () => {
		return this.wsState === WsStateConnected;
	};

	reconnect = () => {
		this.forceReconnect = true;
		this.disconnect();
	};

	setReconnect = (ok) => {
		if (ok) {
			this.isreconnect = true;
		} else {
			this.isreconnect = false;
			if (typeof this.timer !== "undefined" || this.timer !== null) {
				clearInterval(this.timer);
				this.timer = null;
			}
		}
	};

	destroyConnect = () => {
		this.disableReconect = true;
		if (this.ws !== null) {
			if (this.wsState === WsStateConnected) {
				this.wsState = WsStateDisconnecting;
				this.ws.close(1000, "doclose");
			}
		}
	};

	getWS = () => {
		return this.ws;
	};

	onOpen = () => {
		clearTimeout(this.timer);
		this.reconnectInterval = RECONNECT_TIMEOUT;
		this.wsState = WsStateConnected;
		if (this.initialSocketRequests && this.initialSocketRequests.length) {
			this.initialSocketRequests.forEach((item) => {
				this.send(
					JSON.stringify({
						cmd: item,
					})
				);
			});
		}
	};

	onClose = () => {
		this.wsState = WsStateDisconnected;
		if (!this.disableReconect) {
			this.setReconnect(true);
			if (this.isreconnect) {
				if (typeof this.timer !== "undefined" || this.timer !== null) {
					clearInterval(this.timer);
					this.timer = null;
				}
				if (!this.forceReconnect) {
					this.timer = setInterval(() => {
						if (!this.isConnected()) {
							this.connect();
						}
					}, this.reconnectInterval);
				} else if (!this.isConnected()) {
					this.forceReconnect = false;
					this.connect();
				}
				this.reconnectInterval *= 2;
			}
		}
		this.disableReconect = false;
	};

	onError = () => {
		this.disconnect();
	};

	send = (message) => {
		if (this.wsState === WsStateConnected) {
			this.ws.send(message);
		}
	};

	setListenersMessage = (listeners) => {
		this.listenersMessage = { ...this.listenersMessage, ...listeners };
	};

	removeListenersMessage = (name) => {
		if (this.listenersMessage[name]) {
			delete this.listenersMessage[name];
		}
	};

	setListenersOpen = (listeners) => {
		this.listenersOpen = { ...this.listenersOpen, ...listeners };
		if (this.wsState === WsStateConnecting) {
			Object.keys(listeners).forEach((key) => {
				this.getWS().addEventListener("open", listeners[key]);
			});
		} else if (this.wsState === WsStateConnected) {
			Object.keys(listeners).forEach((key) => {
				listeners[key]();
			});
		}
	};

	removeListenersOpen = (name) => {
		if (this.listenersOpen[name]) {
			if (this.wsState === WsStateConnected) {
				delete this.listenersOpen[name];
			} else if (this.wsState === WsStateConnecting) {
				this.getWS().removeEventListener("open", this.listenersOpen[name]);
				delete this.listenersOpen[name];
			}
		}
	};
}
