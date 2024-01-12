import React, { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { ModalBody, Modal, Row, Col } from "reactstrap";
import PropTypes from "prop-types";
import AvatarWrapper from "./AvatarWrapper";
import RewardCard from "./RewardCard";

import "../../../assets/scss/Profile/NftTokenModal.scss";
import closeIcon from "../../../assets/img/header/close_menu.svg";
import cupIcon from "../../../assets/img/profile/nft/cup_icon.svg";
import setAvatarIcon from "../../../assets/img/profile/nft/set_avatar_icon.svg";

const NftTokenModal = ({ token, isShowNftTokenModal, toggleNftTokenModal, claimNftRewards, isClaimNftRewardsLoading, setAvatarHandler, isSetAvatarLoading }) => {
	const { t } = useTranslation("Profile");
	const isMobile = useSelector((state) => state.game.isMobile);
	const language = useSelector((state) => state.game.language);
	const isClaimedAll = token.rewards.every((reward) => reward.is_reward_received);
	const claimRewardHandler = () => {
		const rewards = token.rewards.filter((reward) => !reward.is_reward_received).map((reward) => ({ reward_id: reward._id, token_id: token.token_id, user_token_id: token.user_token_id }));
		claimNftRewards(rewards);
	};
	return (
		<Modal size="xl" isOpen={isShowNftTokenModal} toggle={toggleNftTokenModal} centered className="nft-token-modal">
			<ModalBody className="nft-token-container">
				<button className="tree-dimensional-button close-menu-btn btn-default nft-token-close-btn" onClick={toggleNftTokenModal}>
					<span>
						<img src={closeIcon} alt="close modal" />
					</span>
				</button>
				<Row>
					<Col className="token-side-menu" xs={12} lg={4}>
						{isMobile && (
							<div className="token-title-wrapper">
								<p className="token-title">{token.contract.title[language] || toke.contract.title.en}</p>
								<p className="token-id">#{token.token_id}</p>
							</div>
						)}
						<AvatarWrapper token={token} />
						{!isClaimedAll && (
							<button type="button" className="tree-dimensional-button btn-cyan w-100" disabled={isClaimNftRewardsLoading} onClick={claimRewardHandler}>
								<span className="with-horizontal-image button-text-wrapper">
									<span>
										<img className="btn-icon" src={cupIcon} width={16} height={16} alt="claim all" />
									</span>
									<span className="btn-text">{t("nft-collection.claimRewards")}</span>
								</span>
							</button>
						)}
						{token.contract.is_can_be_used_as_avatar && (
							<button
								type="button"
								className="tree-dimensional-button btn-default w-100"
								disabled={isSetAvatarLoading || token.is_used_as_avatar}
								onClick={() => setAvatarHandler(token.token_id, token.contract.nft_contract_id, true)}
							>
								<span className="with-horizontal-image button-text-wrapper">
									<span>
										<img className="btn-icon" src={setAvatarIcon} width={16} height={16} alt="set avatar" />
									</span>
									<span className="btn-text">{t("nft-collection.setAsAvatar")}</span>
								</span>
							</button>
						)}
					</Col>
					<Col xs={12} lg={8}>
						{!isMobile && (
							<div className="token-title-wrapper">
								<p className="token-title">{token.contract.title[language] || token.contract.title.en}</p>
								<p className="token-id">#{token.token_id}</p>
							</div>
						)}
						{!!token.rewards.length && (
							<Fragment>
								<p className="token-properties-title">{t("nft-collection.rewards")}</p>
								<Row className="rewards-description-wrapper">
									{token.rewards.map((reward) => (
										<RewardCard reward={reward} key={reward._id} />
									))}
								</Row>
							</Fragment>
						)}
						{!!token.meta_data.length && (
							<Fragment>
								<p className="token-properties-title">{t("nft-collection.properties")}</p>
								<Row className="properties-wrapper">
									{token.meta_data.map((item) => (
										<Col xs={12} lg={6} key={item.key}>
											<div className="property-wrapper">
												<p className="property-trait">{item.key}</p>
												<p className="property-value">{item.value}</p>
												<p className="property-times-used">
													{item.times_used} {t("nft-collection.trait")}
												</p>
											</div>
										</Col>
									))}
								</Row>
							</Fragment>
						)}
					</Col>
				</Row>
			</ModalBody>
		</Modal>
	);
};

NftTokenModal.propTypes = {
	token: PropTypes.object.isRequired,
	isShowNftTokenModal: PropTypes.bool.isRequired,
	toggleNftTokenModal: PropTypes.func.isRequired,
	claimNftRewards: PropTypes.func.isRequired,
	setAvatarHandler: PropTypes.func.isRequired,
	isClaimNftRewardsLoading: PropTypes.bool.isRequired,
	isSetAvatarLoading: PropTypes.bool.isRequired,
};

export default NftTokenModal;
