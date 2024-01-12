import React from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { LazyLoadImage } from "react-lazy-load-image-component";
import getPrefixPower from "../../../services/getPrefixPower";
import decimalAdjust from "../../../services/decimalAdjust";

import "../../../assets/scss/Profile/AvatarWrapper.scss";

import rltIcon from "../../../assets/img/profile/nft/rlt_icon.svg";
import powerIcon from "../../../assets/img/profile/lightning.svg";
import minerIcon from "../../../assets/img/storage/basic_miner.svg";
import checkSymbolIcon from "../../../assets/img/profile/nft/check_symbol.svg";
import checkIcon from "../../../assets/img/profile/nft/check_icon.svg";

const REWARDS_ICONS = {
	money: rltIcon,
	miner: minerIcon,
	power: powerIcon,
	percent_power: powerIcon,
};

const amountConverter = (type, amount) => {
	switch (type) {
		case "money":
			return `+${decimalAdjust(+amount / 1000000, 0)}`;
		case "miner":
			return `x${amount}`;
		case "power":
			return `+${getPrefixPower(+amount).power} ${getPrefixPower(+amount).hashDetail}`;
		case "percent_power":
			return `+${Math.round(+amount / 100)}%`;
		default:
			return "";
	}
};

const AvatarWrapper = ({ token }) => {
	const isMobile = useSelector((state) => state.game.isMobile);
	return (
		<div className={`token-avatar-wrapper ${token.is_used_as_avatar ? "claimed-all" : ""}`}>
			<LazyLoadImage className="token-avatar-img" alt="token avatar" src={token.image_link} threshold={200} />
			{token.is_used_as_avatar && (
				<div className="token-avatar-claimed-img-wrapper">
					<img className="token-avatar-claimed-img" src={checkIcon} alt="reward claimed" />
				</div>
			)}
			<div className="token-rewards-wrapper">
				{!!token.rewards &&
					!!token.rewards.length &&
					token.rewards.map((reward) => (
						<div className="token-reward" key={reward._id}>
							<div>
								<img
									className={`token-reward-img ${reward.is_reward_received ? "claimed" : ""}`}
									src={REWARDS_ICONS[reward.type]}
									width={isMobile ? 16 : 24}
									height={isMobile ? 16 : 24}
									alt="reward"
								/>
							</div>
							{!reward.is_reward_received && <p className="reward-text">{amountConverter(reward.type, reward.amount)}</p>}
							{reward.is_reward_received && (
								<div>
									<img className="token-reward-check" src={checkSymbolIcon} width={isMobile ? 12 : 16} height={isMobile ? 12 : 16} alt="claimed" />
								</div>
							)}
						</div>
					))}
			</div>
		</div>
	);
};

AvatarWrapper.propTypes = {
	token: PropTypes.object.isRequired,
};

export default AvatarWrapper;
