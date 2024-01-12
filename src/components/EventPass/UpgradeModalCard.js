import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { withTranslation } from "react-i18next";
import { Row, Col } from "reactstrap";
import RollerButton from "../SingleComponents/RollerButton";
import decimalAdjust from "../../services/decimalAdjust";

import checkedIcon from "../../assets/img/icon/yes_box.svg";
import notIcon from "../../assets/img/icon/not_box.svg";
import rewardRST from "../../assets/img/seasonPass/reward_RST.png";
import rewardMiner from "../../assets/img/seasonPass/reward_miner.png";

const UpgradeModalCard = ({ isPremium, seasonPass, isBuyProcessing, isConfirm, toggleConfirmation, buyAction, t, isClaimedAllPassRewards, claimAllStats, isOnlyClaimAll = false }) => {
	const isMobile = useSelector((state) => state.game.isMobile);
	const upgradeTitleText = () => {
		if (isPremium && isOnlyClaimAll) {
			return t("eventBanner.allRewards");
		}
		if (isPremium && !isOnlyClaimAll) {
			return t("eventBanner.autoComplete");
		}
		return t("eventBanner.goldPass");
	};

	const upgradeBtnText = () => {
		if (isClaimedAllPassRewards) {
			return t("eventBanner.getAllRewardsAgain");
		}
		if (isPremium && !isClaimedAllPassRewards) {
			return t("eventBanner.buyAllRewards");
		}

		return t("eventBanner.buyPass");
	};

	return (
		<Fragment>
			<div className={`upgrade-modal-card ${!isPremium ? "premium" : ""}`}>
				<div className="upgrade-modal-card-title-wrapper">
					<p className={`upgrade-title ${!isPremium ? "premium-title" : ""}`}>{upgradeTitleText()}</p>
				</div>

				{isClaimedAllPassRewards && (
					<Row className="upgrade-modal-card-row">
						<Col xs={6}>
							<div className="upgrade-modal-card-item">
								<h3 className="upgrade-modal-card-title">Miner</h3>
								<div className="upgrade-modal-card-content">
									<img className="upgrade-modal-card-icon" src={rewardMiner} alt="" />
									<p className="upgrade-modal-card-stats">{claimAllStats.miners}</p>
								</div>
							</div>
						</Col>
						<Col xs={6}>
							<div className="upgrade-modal-card-item">
								<h3 className="upgrade-modal-card-title">RST</h3>
								<div className="upgrade-modal-card-content">
									<img className="upgrade-modal-card-icon" src={rewardRST} alt="" />
									<p className="upgrade-modal-card-stats">{claimAllStats.money.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1 ")}</p>
								</div>
							</div>
						</Col>
					</Row>
				)}
				{!isClaimedAllPassRewards && (
					<div className="upgrade-modal-card-list">
						<div className="upgrade-modal-card-list-item">
							<div className="upgrade-modal-list-icon">
								<img src={checkedIcon} height="16" width="16" alt="checked" />
							</div>
							<p className="upgrade-modal-list-text">{t("eventBanner.unlockPremium")}</p>
						</div>
						<div className="upgrade-modal-card-list-item">
							<div className="upgrade-modal-list-icon">
								<img src={isPremium ? checkedIcon : notIcon} height="16" width="16" alt="checked" />
							</div>
							<p className="upgrade-modal-list-text">{t("eventBanner.allRewardsStart")}</p>
						</div>
					</div>
				)}

				<div className="upgrade-modal-button-wrapper">
					<div className={`upgrade-modal-price-wrapper ${seasonPass.value_tag ? "with-tag" : ""}`}>
						<p>{t("eventBanner.price")}:</p>
						{!!seasonPass.oldPrice && <p className="upgrade-modal-old-price">{seasonPass.oldPrice}</p>}
						<p className="upgrade-modal-price">
							{decimalAdjust(seasonPass.price / seasonPass.currencyToSmall, 2)} {seasonPass.currency}
						</p>
						{!!seasonPass.value_tag && (
							<div className="upgrade-modal-value-tag">
								<p>
									{t("eventBanner.value")}: {seasonPass.value_tag}%
								</p>
							</div>
						)}
					</div>
					{!isConfirm && (
						<div>
							<RollerButton action={() => toggleConfirmation(isPremium ? "premium" : "upgrade")} className="upgrade-button w-100" color="gold" size="default" text={upgradeBtnText()} />
						</div>
					)}
					{isConfirm && (
						<div className="upgrade-modal-confirm-buttons">
							<button type="button" disabled={isBuyProcessing} className="tree-dimensional-button btn-gold" onClick={() => buyAction(seasonPass._id)}>
								<span className="button-text-wrapper">{t("eventBanner.buy")}</span>
							</button>
							<button type="button" className="tree-dimensional-button btn-default" onClick={toggleConfirmation}>
								<span className="button-text-wrapper">{t("eventBanner.cancel")}</span>
							</button>
						</div>
					)}
				</div>
			</div>
			{!isPremium && !isMobile && !isOnlyClaimAll && (
				<div className="upgrade-modal-options-text">
					<span>Or</span>
				</div>
			)}
		</Fragment>
	);
};

UpgradeModalCard.propTypes = {
	isPremium: PropTypes.bool.isRequired,
	seasonPass: PropTypes.object.isRequired,
	imgVer: PropTypes.string.isRequired,
	isBuyProcessing: PropTypes.bool.isRequired,
	isConfirm: PropTypes.bool.isRequired,
	toggleConfirmation: PropTypes.func.isRequired,
	buyAction: PropTypes.func.isRequired,
	isMobile: PropTypes.bool.isRequired,
	language: PropTypes.string.isRequired,
	t: PropTypes.func.isRequired,
	isOnlyClaimAll: PropTypes.bool,
	claimAllStats: PropTypes.object.isRequired,
	isClaimedAllPassRewards: PropTypes.bool.isRequired,
};

export default withTranslation("Game")(UpgradeModalCard);
