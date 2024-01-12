import React, { Fragment } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import { LazyLoadImage } from "react-lazy-load-image-component";
import WSocket from "../../../services/connectClass";
import fetchWithToken from "../../../services/fetchWithToken";
import ConnectMetamask from "./ConnectMetamask";
import NoNftFound from "./NoNftFound";
import NftCollectionPage from "./NftCollectionPage";
import InfoBlockWithIcon from "../../SingleComponents/InfoBlockWithIcon";

import "../../../assets/scss/Profile/NftCollections.scss";
import loaderImg from "../../../assets/img/loader_sandglass.gif";

const mapStateToProps = (state) => ({
	connectedWallets: state.user.connectedWallets,
	isAuthorizedMetaMask: state.user.isAuthorizedMetaMask,
	wsNode: state.webSocket.wsNode,
});

class NftCollections extends React.Component {
	static propTypes = {
		connectedWallets: PropTypes.array.isRequired,
		isAuthorizedMetaMask: PropTypes.bool.isRequired,
		wsReact: PropTypes.object.isRequired,
		wsNode: PropTypes.object.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			isLoading: false,
			isSyncInitialization: false,
			nftData: null,
			contractsList: null,
			options: {
				sort: {
					field: "title",
					direction: 1,
				},
				filter: "all",
				skip: 0,
				limit: 24,
			},
		};
		this.controllers = {};
		this.signals = {};
	}

	async componentDidMount() {
		const { isAuthorizedMetaMask, wsNode } = this.props;
		if (isAuthorizedMetaMask) {
			await this.getUserTokens();
		}
		if (wsNode && !wsNode.listenersMessage.nftUpdates) {
			wsNode.setListenersMessage({ nftUpdates: this.onWSNodeMessage });
		}
	}

	async componentDidUpdate(prevProps) {
		if (prevProps.isAuthorizedMetaMask !== this.props.isAuthorizedMetaMask && this.props.isAuthorizedMetaMask) {
			await this.getUserTokens();
		}
	}

	componentWillUnmount() {
		const { wsNode } = this.props;
		if (wsNode) {
			wsNode.removeListenersMessage("nftUpdates");
		}
		Object.keys(this.controllers).forEach((key) => {
			if (this.controllers[key]) {
				this.controllers[key].abort();
			}
		});
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

	refreshBalance = () => {
		this.props.wsReact.send(
			JSON.stringify({
				cmd: "balance_request",
			})
		);
	};

	getUserTokens = async (filterSelect, sortSelect) => {
		const { options } = this.state;
		const currentOptions = {
			...options,
			sort: { ...options.sort, field: sortSelect?.field || options.sort.field, direction: sortSelect?.direction || options.sort.direction },
			filter: filterSelect || options.filter,
		};
		this.setState({ isLoading: true });
		this.createSignalAndController("getUserTokens");
		try {
			const json = await fetchWithToken(
				`/api/profile/nft-user-tokens?filter=${currentOptions.filter}&sort_field=${currentOptions.sort.field}&sort_direction=${currentOptions.sort.direction}&skip=${currentOptions.skip}&limit=${currentOptions.limit}`,
				{
					method: "GET",
					signal: this.signals.getUserTokens,
				}
			);
			if (!json.success) {
				return false;
			}
			if (json.data.is_initially_synced) {
				if (!json.data?.items.length && !filterSelect && !sortSelect) {
					await this.getContractsList();
					return false;
				}
				return this.setState({ nftData: json.data.items, isSyncInitialization: false });
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

	selectFilterHandler = async (value) => {
		const { options } = this.state;
		if (options.filter === value) {
			return false;
		}
		this.setState({ options: { ...options, filter: value } });
		await this.getUserTokens(value);
	};

	selectSortHandler = async (value) => {
		const { options } = this.state;
		if (options.sort.field === value.field && options.sort.direction === value.direction) {
			return false;
		}
		this.setState({ options: { ...options, sort: value } });
		await this.getUserTokens(null, value);
	};

	render() {
		const { isSyncInitialization, nftData, options, contractsList, isLoading } = this.state;
		return (
			<Fragment>
				{isLoading && (
					<div className="profile-preloader">
						<LazyLoadImage className="loader-img" alt="preloader" src={loaderImg} height={126} width={126} threshold={100} />
					</div>
				)}
				<Fragment>
					{<InfoBlockWithIcon tName="Profile" message="nftCollectionInfoMessage" obj="infoHints" />}
					{!nftData && !contractsList && <ConnectMetamask isSyncInitialization={isSyncInitialization} isHiddenBackToAvatarBtn={true} />}
					{!nftData && !!contractsList && <NoNftFound contractsList={contractsList} />}
					{nftData && (
						<NftCollectionPage
							data={nftData}
							selectFilterHandler={this.selectFilterHandler}
							selectSortHandler={this.selectSortHandler}
							options={options}
							getUserTokens={this.getUserTokens}
							refreshBalance={this.refreshBalance}
						/>
					)}
				</Fragment>
			</Fragment>
		);
	}
}

export default withTranslation("Profile")(connect(mapStateToProps, null)(NftCollections));
