import React, { useState } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Row } from "reactstrap";
import { LazyLoadImage } from "react-lazy-load-image-component";
import Token from "./Token";

import "../../../assets/scss/Profile/NftContract.scss";

import claimAllIcon from "../../../assets/img/profile/nft/claim_all_icon.svg";
import arrowUpIcon from "../../../assets/img/profile/nft/arrow_up.svg";
import arrowDownIcon from "../../../assets/img/profile/nft/arrow_down.svg";
import eightBiticonImg from "../../../assets/img/profile/nft/contract_icons/8biticon.gif";

const CONTRACT_IMAGES_CONFIG = {
	"8biticon": eightBiticonImg,
};

const NftContract = ({
	contract,
	activeTokenId,
	toggleActiveToken,
	claimNftRewards,
	getNftData,
	isClaimNftRewardsLoading,
	isClaimAllRewardsLoading,
	isGetNftDataLoading,
	setAvatarHandler,
	isSetAvatarLoading,
}) => {
	const [isOpenReadMore, setIsOpenReadMore] = useState(false);
	const { t } = useTranslation("Profile");
	const language = useSelector((state) => state.game.language);
	const rewardsToClaim = contract.tokens.reduce((acc, val) => {
		val.rewards.forEach((reward) => {
			if (!reward.is_reward_received) {
				acc.push({ reward_id: reward._id, token_id: val.token_id, user_token_id: val.user_token_id });
			}
		});
		return acc;
	}, []);
	const openReadMoreHandler = () => {
		setIsOpenReadMore(!isOpenReadMore);
	};
	const claimRewardHandler = (rewards, claimAll = false) => {
		if (claimAll) {
			claimNftRewards(rewardsToClaim, true);
			return true;
		}
		claimNftRewards(rewards, false);
	};

	return (
		<div className="nft-contract-wrapper">
			<div className="contract-header">
				<div className="contract-title-wrapper">
					<LazyLoadImage className="contract-image" alt="contract image" height={48} width={48} src={CONTRACT_IMAGES_CONFIG[contract.code]} threshold={100} />
					<p className="contract-title">{contract.title[language] || contract.title.en}</p>
				</div>
				<button type="button" className="tree-dimensional-button btn-cyan" onClick={() => claimRewardHandler("", true)} disabled={!rewardsToClaim.length || isClaimAllRewardsLoading}>
					<span className="with-horizontal-image button-text-wrapper">
						<span className="btn-icon">
							<img src={claimAllIcon} width={16} height={16} alt="claim all" />
						</span>
						<span className="btn-text">{t("nft-collection.claimAll")}</span>
					</span>
				</button>
			</div>
			<div className={`contract-description-wrapper ${isOpenReadMore ? "show-more" : ""}`}>
				<p className="contract-description" dangerouslySetInnerHTML={{ __html: contract.description[language] || contract.description.en }} />
			</div>
			<button type="button" className="hall-read-more-btn" onClick={openReadMoreHandler}>
				<span>{isOpenReadMore ? t("nft-collection.hideDescription") : t("nft-collection.showDescription")}</span>
				<span className="hall-read-arrow">
					<img src={isOpenReadMore ? arrowUpIcon : arrowDownIcon} width={16} height={16} alt="read more button" />
				</span>
			</button>
			{!contract.tokens.length && <p className="contract-empty-message">You don’t have avatars in this category</p>}
			{!!contract.tokens.length && (
				<Row className="tokens-container">
					{contract.tokens.map((item) => (
						<Token
							key={item.token_id}
							contract={contract}
							token={item}
							activeTokenId={activeTokenId}
							toggleActiveToken={toggleActiveToken}
							claimRewardHandler={claimRewardHandler}
							getNftData={getNftData}
							isClaimNftRewardsLoading={isClaimNftRewardsLoading}
							isGetNftDataLoading={isGetNftDataLoading}
							setAvatarHandler={setAvatarHandler}
							isSetAvatarLoading={isSetAvatarLoading}
						/>
					))}
				</Row>
			)}
		</div>
	);
};

NftContract.propTypes = {
	contract: PropTypes.object.isRequired,
	activeTokenId: PropTypes.string.isRequired,
	toggleActiveToken: PropTypes.func.isRequired,
	claimNftRewards: PropTypes.func.isRequired,
	getNftData: PropTypes.func.isRequired,
	setAvatarHandler: PropTypes.func.isRequired,
	isClaimNftRewardsLoading: PropTypes.bool.isRequired,
	isClaimAllRewardsLoading: PropTypes.bool.isRequired,
	isGetNftDataLoading: PropTypes.bool.isRequired,
	isSetAvatarLoading: PropTypes.bool.isRequired,
};

export default NftContract;
