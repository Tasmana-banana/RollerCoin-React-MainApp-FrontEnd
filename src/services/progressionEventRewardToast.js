import React from "react";
import { toast } from "react-toastify";
import progressionRewardData from "./progressionRewardData";
import { MINERS_TYPES, RARITY_DATA_BY_LEVEL } from "../constants/Storage";

const renderToast = (title, item) => {
	return (
		<div className="progression-reward-toast">
			<div className="progression-toast-img-wrapper">
				{item.type === "miner" && item.item.type === MINERS_TYPES.MERGE && (
					<img className={`level-img-size-${item.item.width || 2}`} src={`/static/img${RARITY_DATA_BY_LEVEL[item.item.level].icon}`} width={16} height={12} alt={item.item.level} />
				)}
				<img className="progression-toast-img" src={item.img} style={item.style ? item.style : {}} alt="progression event" />
			</div>
			<div className="progression-toast-description">
				<p className="progression-toast-title">{title}</p>
				<p className="progression-toast-text">{`${item.title}${item?.amount ? ` x${item.amount}` : ""}`}</p>
			</div>
		</div>
	);
};

const progressionEventRewardToast = (value) => {
	if (value.rewards_info && value.rewards_info.length) {
		const rewardsToastData = value.rewards_info.map((reward) => progressionRewardData(reward));
		rewardsToastData.forEach((reward) =>
			toast(renderToast("Award Received!", reward), {
				className: "progression-reward-toast-container",
				position: "top-left",
				autoClose: 4000,
				hideProgressBar: true,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
			})
		);
	}
};

export default progressionEventRewardToast;
