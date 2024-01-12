import Web3 from "web3";
import AbortController from "abort-controller";
import fetchWithToken from "./fetchWithToken";

class Web3InstanceClass {
	constructor() {
		this.web3Extension = null;
		this.networkId = null;
		this.userCoinbase = "";
		this.controllers = {};
		this.signals = {};
	}

	initWeb3Extension = async () => {
		const result = {
			success: false,
			errorCode: 0,
			error: "",
		};
		if (!window.ethereum) {
			result.errorCode = 2;
			result.error = "Metamask not exists";
			return result;
		}
		if (!this.web3Extension) {
			try {
				await window.ethereum.request({ method: "eth_requestAccounts" });
				this.web3Extension = new Web3(window.ethereum);
				await this.__setCoinbase();
				await this.__setNetwork();
			} catch (error) {
				result.errorCode = 3;
				result.error = "You need to allow MetaMask action";
				return result;
			}
		}
	};

	connectPublicAddress = async (setIsAuthorizedMetaMask) => {
		const result = {
			success: false,
			data: {},
			error: "",
			errorCode: 0,
		};
		if (!setIsAuthorizedMetaMask) {
			console.error("setIsAuthorizedMetaMask not provided");
			return null;
		}
		try {
			const initResult = await this.initWeb3Extension();
			if (!this.web3Extension) {
				result.error = initResult.error;
				result.errorCode = initResult.errorCode;
				return result;
			}
			if (!process.env.AVAILABLE_METAMASK_NETWORKS.includes(this.networkId)) {
				result.error = "Please choose Ethereum Mainnet";
				return result;
			}
			this.__createSignalAndController("publicAddressNonce");
			const publicAddressData = await fetchWithToken("/api/profile/public-address-nonce", {
				method: "POST",
				signal: this.signals.publicAddressNonce,
				body: JSON.stringify({ public_address: this.userCoinbase, blockchain: this.networkId.toString() }),
			});
			if (!publicAddressData.success) {
				result.error = publicAddressData.error;
				return result;
			}
			const { auth_message: authMessage } = publicAddressData.data;
			const signature = await this.web3Extension.eth.personal.sign(
				// Should be the same with backend
				authMessage,
				this.userCoinbase,
				""
			);
			this.__createSignalAndController("confirmPublicAddressNonce");
			const confirmPublicAddressData = await fetchWithToken("/api/profile/confirm-public-address", {
				method: "POST",
				signal: this.signals.confirmPublicAddressNonce,
				body: JSON.stringify({ signature, blockchain: this.networkId.toString() }),
			});
			if (!confirmPublicAddressData.success) {
				throw new Error("Problems with signature");
			}
			result.success = true;
			setIsAuthorizedMetaMask(true);
			return result;
		} catch (e) {
			console.error(e);
			return result;
		}
	};

	destroy = () => {
		this.web3Extension = null;
		Object.keys(this.controllers).forEach((key) => {
			if (this.controllers[key]) {
				this.controllers[key].abort();
			}
		});
	};

	__setCoinbase = async () => {
		try {
			this.__checkIsWeb3Ready();
			this.userCoinbase = await this.web3Extension.eth.getCoinbase();
		} catch (e) {
			console.error(e);
		}
	};

	__setNetwork = async () => {
		try {
			this.__checkIsWeb3Ready();
			this.networkId = await this.web3Extension.eth.net.getId();
		} catch (e) {
			console.error(e);
		}
	};

	__checkIsWeb3Ready = () => {
		if (!this.web3Extension) {
			throw new Error("Web3 not initialized");
		}
	};

	__createSignalAndController = (id) => {
		if (this.controllers[id]) {
			this.controllers[id].abort();
		}
		this.controllers[id] = new AbortController();
		this.signals[id] = this.controllers[id].signal;
	};
}

const web3Instance = new Web3InstanceClass();

export default web3Instance;
