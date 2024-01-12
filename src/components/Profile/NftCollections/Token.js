import React from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Col } from "reactstrap";
import AvatarWrapper from "./AvatarWrapper";

import threeDots from "../../../assets/img/profile/nft/three_dots.svg";
import cupIcon from "../../../assets/img/profile/nft/cup_icon.svg";
import viewIcon from "../../../assets/img/profile/nft/view_icon.svg";
import setAvatarIcon from "../../../assets/img/profile/nft/set_avatar_icon.svg";

const Token = ({ token, contract, activeTokenId, toggleActiveToken, claimRewardHandler, getNftData, isClaimNftRewardsLoading, isGetNftDataLoading, setAvatarHandler, isSetAvatarLoading }) => {
	const { t } = useTranslation("Profile");
	const isMobile = useSelector((state) => state.game.isMobile);
	const isClaimedAll = token.rewards.every((reward) => reward.is_reward_received);
	const claimReward = (e) => {
		e.stopPropagation();
		const rewards = token.rewards.filter((reward) => !reward.is_reward_received).map((reward) => ({ reward_id: reward._id, token_id: token.token_id, user_token_id: token.user_token_id }));
		claimRewardHandler(rewards);
	};
	const getExtendedData = (e) => {
		e.stopPropagation();
		getNftData(token.token_id, token.user_token_id);
	};
	const setAvatar = (e) => {
		e.stopPropagation();
		setAvatarHandler(token.token_id, contract.nft_contract_id);
	};
	return (
		<Col xs={6} lg={4}>
			<div className={`nft-token-wrapper ${token.token_id === activeTokenId ? "active" : ""}`} onClick={() => toggleActiveToken(token.token_id)}>
				<AvatarWrapper token={token} />
				<div className="description-switch">
					<img src={threeDots} width={40} height={8} hidden={token.token_id === activeTokenId} alt="dots" />
					<div className={`menu-wrapper ${token.token_id === activeTokenId ? "" : "hidden"}`}>
						{!isClaimedAll && (
							<button type="button" className="tree-dimensional-button btn-cyan w-100" disabled={isClaimNftRewardsLoading} onClick={claimReward}>
								<span className="with-horizontal-image button-text-wrapper">
									<span>
										<img className="btn-icon" src={cupIcon} width={16} height={16} alt="claim all" />
									</span>
									<span className="btn-text">{isMobile ? t("nft-collection.claim") : t("nft-collection.claimRewards")}</span>
								</span>
							</button>
						)}
						<button type="button" className="tree-dimensional-button btn-default w-100" disabled={isGetNftDataLoading} onClick={getExtendedData}>
							<span className="with-horizontal-image button-text-wrapper">
								<span>
									<img className="btn-icon" src={viewIcon} width={16} height={16} alt="view nft" />
								</span>
								<span className="btn-text">{t("nft-collection.viewNft")}</span>
							</span>
						</button>
						{contract.is_can_be_used_as_avatar && (
							<button type="button" className="tree-dimensional-button btn-default w-100" disabled={isSetAvatarLoading || token.is_used_as_avatar} onClick={setAvatar}>
								<span className="with-horizontal-image button-text-wrapper">
									<span>
										<img className="btn-icon" src={setAvatarIcon} width={16} height={16} alt="set avatar" />
									</span>
									<span className="btn-text">{isMobile ? t("nft-collection.setAvatar") : t("nft-collection.setAsAvatar")}</span>
								</span>
							</button>
						)}
					</div>
				</div>
			</div>
		</Col>
	);
};

Token.propTypes = {
	token: PropTypes.object.isRequired,
	contract: PropTypes.object.isRequired,
	activeTokenId: PropTypes.string.isRequired,
	toggleActiveToken: PropTypes.func.isRequired,
	claimRewardHandler: PropTypes.func.isRequired,
	getNftData: PropTypes.func.getNftData,
	setAvatarHandler: PropTypes.func.isRequired,
	isClaimNftRewardsLoading: PropTypes.bool.isRequired,
	isGetNftDataLoading: PropTypes.bool.isRequired,
	isSetAvatarLoading: PropTypes.bool.isRequired,
};

export default Token;
