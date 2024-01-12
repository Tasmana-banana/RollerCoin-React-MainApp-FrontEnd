import React from "react";
import PropTypes from "prop-types";
import { Progress } from "reactstrap";
import decimalAdjust, { ROUND_DIRECTION } from "../../../services/decimalAdjust";
import getCurrencyConfig from "../../../services/getCurrencyConfig";
import dailyWeeklyQuestsImgConstructor from "../../../services/dailyWeeklyQuestsImgConstructor";

import checkedIcon from "../../../assets/img/icon/checked.svg";
import "../../../assets/scss/Game/DailyWeeklyQuestsModalItemCard.scss";

const DailyWeeklyQuestModalItemCard = ({ task, onClickTrigger, collectLoading, collectTask, isMobile, language, t }) => {
	const currencyConfig = getCurrencyConfig(task.reward.currency || "RLT");
	const rltConfig = getCurrencyConfig(task.reward.currency || "RLT");
	const isAmountSpentType = ["amount_spent", "buy_rlt", "offers_amount", "offers_amount_provider", "amount_spent_in_store"].includes(task.type);
	const isCryptoQuest = task.reward.type === "money" && !["RLT", "RST"].includes(task.reward.currency);
	const formattedCountRepeats = isAmountSpentType ? decimalAdjust(+task.count_repeats / rltConfig.toSmall, rltConfig.precision, ROUND_DIRECTION.FLOOR) : task.count_repeats;
	const formattedProgress = isAmountSpentType ? decimalAdjust(+task.progress / rltConfig.toSmall, rltConfig.precision, ROUND_DIRECTION.FLOOR) : task.progress;
	const questItemInfo = dailyWeeklyQuestsImgConstructor(task.reward, currencyConfig);
	return (
		<div className={`quest-item-card ${isCryptoQuest ? "crypto-quest" : ""}`}>
			<div className="quest-item-xp-wrapper">
				<div className="quest-item-xp">
					<img src={questItemInfo.img.src} alt={questItemInfo.img.alt} />
					<p className="quest-item-rlt-text">{questItemInfo.amount}</p>
				</div>
				{isMobile && (
					<div className="quest-item-description-wrapper">
						<p className="quest-item-title">{task.title[language] || task.title.en}</p>
						<p className="quest-item-description">{task.description[language] || task.description.en}</p>
					</div>
				)}
			</div>
			{!isMobile && (
				<div className="quest-item-description-wrapper">
					<p className="quest-item-title">{task.title[language] || task.title.en}</p>
					<p className="quest-item-description">{task.description[language] || task.description.en}</p>
					<div className="quest-item-progress-wrapper">
						<Progress value={(task.progress / task.count_repeats) * 100} className={`progress-bar ${task.progress >= task.count_repeats ? "green-color" : ""}`} />
						<p className={`quest-progress-value ${task.progress >= task.count_repeats ? "green-color" : ""}`}>
							{task.progress > task.count_repeats ? formattedCountRepeats : formattedProgress} / {formattedCountRepeats}
						</p>
					</div>
				</div>
			)}
			{isMobile && (
				<div className="quest-item-progress-wrapper">
					<Progress value={(task.progress / task.count_repeats) * 100} className={`progress-bar ${task.progress >= task.count_repeats ? "green-color" : ""}`} />
					<p className={`quest-progress-value ${task.progress >= task.count_repeats ? "green-color" : ""}`}>
						{task.progress > task.count_repeats ? formattedCountRepeats : formattedProgress} / {formattedCountRepeats}
					</p>
				</div>
			)}
			<div className="quest-item-action">
				{task.is_claimed && (
					<div className="quest-collected">
						<img src={checkedIcon} alt="success" className="quest-collected-img" />
						<p className="quest-collected-text">{t("eventPass.collected")}</p>
					</div>
				)}
				{task.progress >= task.count_repeats && !task.is_claimed && (
					<button type="button" className="tree-dimensional-button btn-green w-100" disabled={collectLoading} onClick={() => collectTask(task.id)}>
						<span className="btn-text">{t("eventPass.collect")}</span>
					</button>
				)}
				{task.progress < task.count_repeats && (
					<button
						type="button"
						className="tree-dimensional-button btn-cyan w-100 do-btn"
						disabled={collectLoading}
						onClick={() => onClickTrigger(task.id, isCryptoQuest ? "cryptoQuest" : task.type, task.link)}
					>
						<span className="btn-text">{t("eventPass.doIt")}</span>
					</button>
				)}
			</div>
		</div>
	);
};

DailyWeeklyQuestModalItemCard.propTypes = {
	task: PropTypes.object.isRequired,
	isMobile: PropTypes.bool.isRequired,
	language: PropTypes.string.isRequired,
	t: PropTypes.func.isRequired,
	onClickTrigger: PropTypes.func.isRequired,
	collectTask: PropTypes.func.isRequired,
	isLoading: PropTypes.bool,
	collectLoading: PropTypes.bool.isRequired,
};

export default DailyWeeklyQuestModalItemCard;
