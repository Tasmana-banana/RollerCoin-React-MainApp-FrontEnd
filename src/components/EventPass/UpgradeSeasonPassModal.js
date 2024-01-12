import React, { Component } from "react";
import { connect } from "react-redux";
import { ModalBody, Modal } from "reactstrap";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import * as actionsGame from "../../actions/game";
import UpgradeModalCard from "./UpgradeModalCard";

import "../../assets/scss/Game/UpgradeSeasonPassModal.scss";

import closeIcon from "../../assets/img/header/close_menu.svg";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	replenishmentModalStats: state.game.replenishmentModalStats,
	isMobile: state.game.isMobile,
	language: state.game.language,
	balance: state.game.balance,
});

// Map Redux actions to component props
const mapDispatchToProps = (dispatch) => ({
	setReplenishmentModalStats: (state) => dispatch(actionsGame.setReplenishmentModalStats(state)),
});

class UpgradeSeasonPassModal extends Component {
	static propTypes = {
		isShowUpgradeModal: PropTypes.object.isRequired,
		toggleUpgradeModal: PropTypes.func.isRequired,
		season: PropTypes.object.isRequired,
		seasonPass: PropTypes.object.isRequired,
		premiumSeasonPass: PropTypes.object.isRequired,
		buySeasonPass: PropTypes.func.isRequired,
		setReplenishmentModalStats: PropTypes.func.isRequired,
		replenishmentModalStats: PropTypes.object.isRequired,
		isMobile: PropTypes.bool.isRequired,
		t: PropTypes.func.isRequired,
		language: PropTypes.string.isRequired,
		balance: PropTypes.object.isRequired,
		claimAllStats: PropTypes.object.isRequired,
		isClaimedAllPassRewards: PropTypes.bool.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			isPremiumConfirm: false,
			isUpgradeConfirm: false,
			isLoading: true,
			isBuyProcessing: false,
		};
		this.controllers = {};
		this.signals = {};
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

	toggleConfirmation = (type) => {
		const { seasonPass, premiumSeasonPass, replenishmentModalStats, setReplenishmentModalStats, balance, t } = this.props;
		if (type === "premium" && balance.rlt < premiumSeasonPass.price) {
			return setReplenishmentModalStats({ ...replenishmentModalStats, isOpen: true, itemName: t("eventBanner.getAllRewards"), quantity: 1, price: premiumSeasonPass.price });
		}
		if (type === "upgrade" && balance.rlt < seasonPass.price) {
			return setReplenishmentModalStats({ ...replenishmentModalStats, isOpen: true, itemName: t("eventBanner.upgradeEventPass"), quantity: 1, price: seasonPass.price });
		}
		this.setState({
			isPremiumConfirm: type === "premium",
			isUpgradeConfirm: type === "upgrade",
		});
	};

	handleClickOutside = (event) => {
		const element = event.target.closest(".buy-btn, .upgrade-modal-confirm-buttons");
		if (!element) {
			this.toggleConfirmation();
		}
	};

	buyAction = async (id) => {
		const { buySeasonPass, toggleUpgradeModal } = this.props;
		this.setState({ isBuyProcessing: true });
		await buySeasonPass(id);
		this.setState({ isBuyProcessing: false });
		toggleUpgradeModal();
	};

	render() {
		const { isShowUpgradeModal, toggleUpgradeModal, season, seasonPass, premiumSeasonPass, isClaimedAllPassRewards, claimAllStats, t } = this.props;
		const { isPremiumConfirm, isUpgradeConfirm, isBuyProcessing } = this.state;
		const backgroundImgUrl = `url("${process.env.STATIC_URL}/static/img/seasons/${season._id}/upgrade_modal_bg.png?v=${new Date(season.last_updated).getTime()}`;

		const isOnlyClaimAll = (premiumSeasonPass && !seasonPass) || (!premiumSeasonPass && seasonPass);

		return (
			<Modal size={isOnlyClaimAll ? "" : "lg"} isOpen={isShowUpgradeModal} toggle={toggleUpgradeModal} centered className="upgrade-season-pass-modal">
				<ModalBody className="upgrade-modal-container" style={{ backgroundImage: backgroundImgUrl }}>
					<button className="close-menu-btn upgrade-modal-close-btn" onClick={toggleUpgradeModal}>
						<span className="close-btn-img-wrapper">
							<img className="close-btn-img" src={closeIcon} width={12} height={12} alt="close modal icon" />
						</span>
					</button>
					<p className="season-title">{t("eventPass.seasonPass")}</p>
					<div className={`upgrade-model-cards-wrapper ${isOnlyClaimAll ? "only-premium" : ""}`}>
						{seasonPass && (
							<UpgradeModalCard
								isPremium={false}
								seasonPass={seasonPass}
								imgVer={new Date(season.last_updated).getTime()}
								isBuyProcessing={isBuyProcessing}
								isConfirm={isUpgradeConfirm}
								toggleConfirmation={this.toggleConfirmation}
								buyAction={this.buyAction}
								isClaimedAllPassRewards={isClaimedAllPassRewards}
								isOnlyClaimAll={isOnlyClaimAll}
							/>
						)}
						{premiumSeasonPass && (
							<UpgradeModalCard
								isPremium={true}
								seasonPass={premiumSeasonPass}
								imgVer={new Date(season.last_updated).getTime()}
								isBuyProcessing={isBuyProcessing}
								isConfirm={isPremiumConfirm}
								toggleConfirmation={this.toggleConfirmation}
								buyAction={this.buyAction}
								isOnlyClaimAll={isOnlyClaimAll}
								isClaimedAllPassRewards={isClaimedAllPassRewards}
								claimAllStats={claimAllStats}
							/>
						)}
					</div>
				</ModalBody>
			</Modal>
		);
	}
}

export default withTranslation("Game")(connect(mapStateToProps, mapDispatchToProps)(UpgradeSeasonPassModal));
