import React, { Fragment } from "react";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { Col, Row } from "reactstrap";
import Select, { components } from "react-select";
import { toast } from "react-toastify";
import fetchWithToken from "../../../services/fetchWithToken";
import { setNewAvatarVersion, setNewAvatarType } from "../../../actions/userInfo";
import NftContract from "./NftContract";
import NftTokenModal from "./NftTokenModal";

import "../../../assets/scss/Profile/NftCollections.scss";
import arrowUpIcon from "../../../assets/img/profile/nft/arrow_up.svg";
import arrowDownIcon from "../../../assets/img/profile/nft/arrow_down.svg";
import arrowWhiteIcon from "../../../assets/img/profile/nft/arrow_white.svg";
import errorNotice from "../../../assets/img/icon/error_notice.svg";
import successIcon from "../../../assets/img/icon/success_notice.svg";

const SORTING_OPTIONS = [
	{ label: "alphabetAZ", value: { field: "title", direction: 1 } },
	{ label: "alphabetZA", value: { field: "title", direction: -1 } },
];

const DropdownIndicator = (props) => (
	<components.DropdownIndicator {...props}>
		<img src={arrowWhiteIcon} alt="select indicator" />
	</components.DropdownIndicator>
);

const mapDispatchToProps = (dispatch) => ({
	updateAvatarVersion: (state) => dispatch(setNewAvatarVersion(state)),
	updateAvatarType: (state) => dispatch(setNewAvatarType(state)),
});

class NftCollectionPage extends React.Component {
	static propTypes = {
		t: PropTypes.func.isRequired,
		data: PropTypes.array.isRequired,
		selectFilterHandler: PropTypes.func.isRequired,
		selectSortHandler: PropTypes.func.isRequired,
		options: PropTypes.object.isRequired,
		getUserTokens: PropTypes.func.isRequired,
		refreshBalance: PropTypes.func,
		updateAvatarVersion: PropTypes.func.isRequired,
		updateAvatarType: PropTypes.func.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			isReadMoreOpen: false,
			activeTokenId: "",
			currentTokenData: null,
			isShowNftTokenModal: false,
			isGetNftDataLoading: false,
			isClaimNftRewardsLoading: false,
			isClaimAllRewardsLoading: false,
			isSetAvatarLoading: false,
		};
		this.controllers = {};
		this.signals = {};
		this.toastDefaultConfig = {
			position: "top-left",
			autoClose: 3000,
			hideProgressBar: true,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
		};
	}

	static renderToast(text, icon) {
		return (
			<div className="content-with-image">
				<img src={icon} alt="market notification" />
				<span>{text}</span>
			</div>
		);
	}

	componentDidMount() {
		document.addEventListener("click", this.handleClickOutside);
	}

	componentWillUnmount() {
		document.removeEventListener("click", this.handleClickOutside);
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

	claimNftRewards = async (rewards, claimAll) => {
		const { getUserTokens, refreshBalance } = this.props;
		const { isShowNftTokenModal } = this.state;
		if (claimAll) {
			this.setState({ isClaimAllRewardsLoading: true });
		} else {
			this.setState({ isClaimNftRewardsLoading: true });
		}
		for (let i = 0; i < rewards.length; i += 1) {
			// eslint-disable-next-line no-await-in-loop
			await this.claimReward(rewards[i]);
		}
		if (isShowNftTokenModal && !claimAll) {
			await this.getNftData(rewards[0].token_id);
		}
		if (refreshBalance) {
			refreshBalance();
		}
		await getUserTokens();
		this.setState({ isClaimNftRewardsLoading: false, isClaimAllRewardsLoading: false });
	};

	claimReward = async (reward) => {
		const { t } = this.props;
		this.createSignalAndController(`claimReward${reward.token_id}${reward.reward_id}`);
		try {
			const json = await fetchWithToken("/api/profile/collect-nft-reward", {
				method: "POST",
				body: JSON.stringify(reward),
				signal: this.signals[`claimReward${reward.token_id}${reward.reward_id}`],
			});
			if (!json.success) {
				toast(this.constructor.renderToast(t("nft-collection.rewardError"), errorNotice), this.toastDefaultConfig);
				return false;
			}
			toast(this.constructor.renderToast(t("nft-collection.rewardSuccess"), successIcon), this.toastDefaultConfig);
		} catch (e) {
			console.error(e);
		}
	};

	getNftData = async (tokenID) => {
		this.setState({ isGetNftDataLoading: true });
		this.createSignalAndController("getNftData");
		try {
			const json = await fetchWithToken(`/api/profile/nft-token-data?token_id=${tokenID}`, {
				method: "GET",
				signal: this.signals.getNftData,
			});
			if (!json.success) {
				return this.setState({ isGetNftDataLoading: false });
			}
			this.setState({ currentTokenData: json.data, isShowNftTokenModal: true, isGetNftDataLoading: false });
			return true;
		} catch (e) {
			console.error(e);
		}
	};

	setAvatarHandler = async (tokenID, contractID, isModal = false) => {
		const { getUserTokens } = this.props;
		this.setState({ isSetAvatarLoading: true });
		const dataExists = await this.setTokenAsAvatar(tokenID, contractID);
		if (!dataExists) {
			return this.setState({ isSetAvatarLoading: false });
		}
		if (isModal) {
			await this.getNftData(tokenID);
		}
		await getUserTokens();
		this.setState({ isSetAvatarLoading: false });
	};

	setTokenAsAvatar = async (tokenID, contractID) => {
		const { t, updateAvatarVersion, updateAvatarType } = this.props;
		this.createSignalAndController("setTokenAsAvatar");
		try {
			const json = await fetchWithToken("/api/profile/set-token-as-avatar", {
				method: "POST",
				body: JSON.stringify({ token_id: tokenID, nft_contract_id: contractID }),
				signal: this.signals.setTokenAsAvatar,
			});
			if (!json.success) {
				toast(this.constructor.renderToast(t("nft-collection.setAvatarError"), errorNotice), this.toastDefaultConfig);
				return false;
			}
			updateAvatarVersion(json.data.new_avatar_version);
			updateAvatarType("nft");
			toast(this.constructor.renderToast(t("nft-collection.setAvatarSuccess"), successIcon), this.toastDefaultConfig);
			return true;
		} catch (e) {
			console.error(e);
		}
	};

	toggleNftTokenModal = async () => {
		const { isShowNftTokenModal } = this.state;
		this.setState({ isShowNftTokenModal: !isShowNftTokenModal });
	};

	openReadMore = () => {
		const { isReadMoreOpen } = this.state;
		this.setState({ isReadMoreOpen: !isReadMoreOpen });
	};

	toggleActiveToken = (id = "") => {
		const { activeTokenId } = this.state;
		this.setState({
			activeTokenId: id === activeTokenId ? "" : id,
		});
	};

	handleClickOutside = (event) => {
		const element = event.target.closest(".nft-token-wrapper");
		if (!element) {
			this.setState({
				activeTokenId: "",
			});
		}
	};

	render() {
		const { data, options, selectFilterHandler, selectSortHandler, t } = this.props;
		const { isReadMoreOpen, activeTokenId, currentTokenData, isShowNftTokenModal, isClaimNftRewardsLoading, isGetNftDataLoading, isSetAvatarLoading, isClaimAllRewardsLoading } = this.state;
		return (
			<Fragment>
				<Row noGutters={true} className="nft-collection-container">
					<Col xs={12}>
						<h3 className="nft-title">{t("nft-collection.howNFT")}</h3>
						<p className="nft-description"> {t("nft-collection.additionalRewards")}</p>
						<p className={`nft-description-addition ${isReadMoreOpen ? "show-more" : ""}`}>{t("nft-collection.onceTransfer")}</p>
						<div className="text-center">
							<button type="button" className="hall-read-more-btn" onClick={this.openReadMore}>
								<span>{isReadMoreOpen ? t("nft-collection.hideDescription") : t("nft-collection.showDescription")}</span>
								<span className="hall-read-arrow">
									<img src={isReadMoreOpen ? arrowUpIcon : arrowDownIcon} width={16} height={16} alt="read more button" />
								</span>
							</button>
						</div>
						<div className="nft-filters-wrapper">
							<div className="nft-filters">
								<button type="button" className={`nft-filter-btn ${options.filter === "all" ? "active" : ""}`} onClick={() => selectFilterHandler("all")}>
									<span>{t("nft-collection.all")}</span>
								</button>
								<button type="button" className={`nft-filter-btn ${options.filter === "claimed" ? "active" : ""}`} onClick={() => selectFilterHandler("claimed")}>
									<span>{t("nft-collection.claimed")}</span>
								</button>
								<button type="button" className={`nft-filter-btn ${options.filter === "not_claimed" ? "active" : ""}`} onClick={() => selectFilterHandler("not_claimed")}>
									<span>{t("nft-collection.notClaimed")}</span>
								</button>
								<button type="button" className={`nft-filter-btn ${options.filter === "use_as_avatar" ? "active" : ""}`} onClick={() => selectFilterHandler("use_as_avatar")}>
									<span>{t("nft-collection.useAsAvatar")}</span>
								</button>
							</div>
							<div className="nft-sort">
								<Select
									className="select-filter-container w-100"
									classNamePrefix="select-filter"
									onChange={(e) => selectSortHandler(e.value)}
									options={SORTING_OPTIONS.map((item) => ({ ...item, label: t(`nft-collection.${item.label}`) }))}
									defaultValue={{ ...SORTING_OPTIONS[0], label: t(`nft-collection.${SORTING_OPTIONS[0].label}`) }}
									components={{ DropdownIndicator }}
									isClearable={false}
									isSearchable={false}
								/>
							</div>
						</div>
						<div className="nft-contracts-container">
							{data.map((item) => (
								<NftContract
									key={item.nft_contract_id}
									contract={item}
									activeTokenId={activeTokenId}
									toggleActiveToken={this.toggleActiveToken}
									claimNftRewards={this.claimNftRewards}
									getNftData={this.getNftData}
									isClaimNftRewardsLoading={isClaimNftRewardsLoading}
									isClaimAllRewardsLoading={isClaimAllRewardsLoading}
									isGetNftDataLoading={isGetNftDataLoading}
									setAvatarHandler={this.setAvatarHandler}
									isSetAvatarLoading={isSetAvatarLoading}
								/>
							))}
						</div>
					</Col>
				</Row>
				{isShowNftTokenModal && (
					<NftTokenModal
						token={currentTokenData}
						isShowNftTokenModal={isShowNftTokenModal}
						toggleNftTokenModal={this.toggleNftTokenModal}
						claimNftRewards={this.claimNftRewards}
						isClaimNftRewardsLoading={isClaimNftRewardsLoading}
						setAvatarHandler={this.setAvatarHandler}
						isSetAvatarLoading={isSetAvatarLoading}
					/>
				)}
			</Fragment>
		);
	}
}

export default withTranslation("Profile")(connect(null, mapDispatchToProps)(NftCollectionPage));
