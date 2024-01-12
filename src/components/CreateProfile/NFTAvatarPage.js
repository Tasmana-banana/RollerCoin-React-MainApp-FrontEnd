import React, { Fragment } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import { LazyLoadImage } from "react-lazy-load-image-component";
import fetchWithToken from "../../services/fetchWithToken";
import ConnectMetamask from "../Profile/NftCollections/ConnectMetamask";
import NoNftFound from "../Profile/NftCollections/NoNftFound";
import ChooseNFTAvatar from "./ChooseNFTAvatar";

import "../../assets/scss/Profile/NftCollections.scss";
import loaderImg from "../../assets/img/loader_sandglass.gif";

const mapStateToProps = (state) => ({
	connectedWallets: state.user.connectedWallets,
	isAuthorizedMetaMask: state.user.isAuthorizedMetaMask,
	wsNode: state.webSocket.wsNode,
});

class NftCollections extends React.Component {
	static propTypes = {
		connectedWallets: PropTypes.array.isRequired,
		isAuthorizedMetaMask: PropTypes.bool.isRequired,
		wsNode: PropTypes.object.isRequired,
		t: PropTypes.func.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			isLoading: false,
			isSyncInitialization: false,
			nftAvatarsData: null,
			contractsList: null,
		};
		this.controllers = {};
		this.signals = {};
	}

	async componentDidMount() {
		const { isAuthorizedMetaMask, wsNode } = this.props;
		if (isAuthorizedMetaMask) {
			await this.getNFTAvatars();
		}
		if (wsNode && !wsNode.listenersMessage.promoUpdates) {
			wsNode.setListenersMessage({ promoUpdates: this.onWSNodeMessage });
		}
	}

	async componentDidUpdate(prevProps) {
		if (prevProps.isAuthorizedMetaMask !== this.props.isAuthorizedMetaMask && this.props.isAuthorizedMetaMask) {
			await this.getNFTAvatars();
		}
	}

	componentWillUnmount() {
		const { wsNode } = this.props;
		Object.keys(this.controllers).forEach((key) => {
			if (this.controllers[key]) {
				this.controllers[key].abort();
			}
		});
		if (wsNode) {
			wsNode.removeListenersMessage("promoUpdates");
		}
	}

	createSignalAndController = (id) => {
		if (this.controllers[id]) {
			this.controllers[id].abort();
		}
		this.controllers[id] = new AbortController();
		this.signals[id] = this.controllers[id].signal;
	};

	onWSNodeMessage = async (event) => {
		const data = JSON.parse(event.data);
		const { cmd } = data;
		switch (cmd) {
			case "wallet_initially_sync_updated":
				await this.getUserTokens();
				break;
			default:
				break;
		}
	};

	getNFTAvatars = async () => {
		this.setState({ isLoading: true });
		this.createSignalAndController("getNFTAvatars");
		try {
			const json = await fetchWithToken("/api/profile/nft-user-avatars", {
				method: "GET",
				signal: this.signals.getNFTAvatars,
			});
			if (!json.success) {
				return false;
			}
			if (json.data.is_initially_synced) {
				if (!json.data?.items.length) {
					await this.getContractsList();
					return false;
				}
				return this.setState({ nftAvatarsData: json.data.items, isSyncInitialization: false });
			}
			this.setState({ isSyncInitialization: true });
		} catch (e) {
			console.error(e);
		} finally {
			this.setState({ isLoading: false });
		}
	};

	getContractsList = async () => {
		this.createSignalAndController("getContractsList");
		try {
			const json = await fetchWithToken("/api/profile/nft-contracts-list", {
				method: "GET",
				signal: this.signals.getContractsList,
			});
			if (!json.success) {
				return false;
			}
			this.setState({ contractsList: json.data });
			return true;
		} catch (e) {
			console.error(e);
		}
	};

	render() {
		const { isLoading, nftAvatarsData, contractsList, isSyncInitialization } = this.state;
		const { t } = this.props;
		return (
			<Fragment>
				{isLoading && (
					<div className="profile-preloader">
						<LazyLoadImage className="loader-img" alt="preloader" src={loaderImg} height={126} width={126} threshold={100} />
					</div>
				)}
				{!nftAvatarsData && !contractsList && (
					<div className="mb-5 header-text">
						<h2 className="page-title mt-5 mb-3">{t("nftAvatar")}</h2>
						<ConnectMetamask isSyncInitialization={isSyncInitialization} isLoading={isLoading} />
					</div>
				)}
				{!nftAvatarsData && !!contractsList && (
					<div className="mb-5 header-text">
						<h2 className="page-title mt-5 mb-3">{t("nftAvatar")}</h2>
						<NoNftFound contractsList={contractsList} />
					</div>
				)}
				{nftAvatarsData && <ChooseNFTAvatar nftAvatarsData={nftAvatarsData} />}
			</Fragment>
		);
	}
}

export default withTranslation("Avatar")(connect(mapStateToProps, null)(NftCollections));
