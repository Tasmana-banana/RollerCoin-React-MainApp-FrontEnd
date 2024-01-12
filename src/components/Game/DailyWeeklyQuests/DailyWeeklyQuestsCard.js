import React from "react";
import PropTypes from "prop-types";
import { Progress } from "reactstrap";
import RollerButton from "../../SingleComponents/RollerButton";
import decimalAdjust, { ROUND_DIRECTION } from "../../../services/decimalAdjust";
import getCurrencyConfig from "../../../services/getCurrencyConfig";
import dailyWeeklyQuestsImgConstructor from "../../../services/dailyWeeklyQuestsImgConstructor";

import arrowRight from "../../../assets/img/icon/arrow_right.svg";
import arrowRightDoge from "../../../assets/img/icon/arrow_right_doge.svg";
import paymentIcon from "../../../assets/img/icon/payment_icon.svg";
import checkedIcon from "../../../assets/img/icon/checked.svg";

const DailyWeeklyTasksCard = ({ task, key, onClickTrigger, collectTask, collectLoading, language }) => {
	const currencyConfig = getCurrencyConfig(task.reward.currency || "RLT");
	const rltConfig = getCurrencyConfig("RLT");
	const isAmountSpentType = ["amount_spent", "buy_rlt", "offers_amount", "offers_amount_provider", "amount_spent_in_store"].includes(task.type);
	const formattedCountRepeats = isAmountSpentType ? decimalAdjust(+task.count_repeats / rltConfig.toSmall, rltConfig.precision, ROUND_DIRECTION.FLOOR) : task.count_repeats;
	const formattedProgress = isAmountSpentType ? decimalAdjust(+task.progress / rltConfig.toSmall, rltConfig.precision, ROUND_DIRECTION.FLOOR) : task.progress;
	const isCryptoQuest = task.reward.type === "money" && !["RLT", "RST"].includes(task.reward.currency);
	const questItemInfo = dailyWeeklyQuestsImgConstructor(task.reward, currencyConfig);
	return (
		<div key={key} className={`quest-item-card ${isCryptoQuest ? "crypto-quest" : ""}`}>
			<div className="quest-item-rlt-wrapper">
				<div className="quest-item-rlt">
					<img className="quest-rlt-icon" src={questItemInfo.img.src} alt={questItemInfo.img.alt} width={26} height={26} />
					<p className="quest-item-rlt-text">{questItemInfo.amount}</p>
				</div>
			</div>

			<div className="quest-item-wrapper">
				<div className="quest-item-description-wrapper">
					<div className="quest-item-title">
						<span>{task.title[language] || task.title.en}</span>
					</div>

					<div className="quest-action">
						{task.is_claimed && (
							<div className="quest-collected">
								<img src={checkedIcon} alt="success" className="quest-collected-img" />
							</div>
						)}
						{task.progress >= task.count_repeats && !task.is_claimed && (
							<RollerButton size="smallest" icon={paymentIcon} className="green-btn" disabled={collectLoading} action={() => collectTask(task.id)} />
						)}
						{task.progress < task.count_repeats && (
							<RollerButton
								size="smallest"
								disabled={collectLoading}
								className={isCryptoQuest ? "crypto-quest" : ""}
								icon={isCryptoQuest ? arrowRightDoge : arrowRight}
								action={() => onClickTrigger(task.id, isCryptoQuest ? "cryptoQuest" : task.type, task.link)}
							/>
						)}
					</div>
				</div>
				<div className="quest-item-progress-wrapper">
					<Progress value={(task.progress / task.count_repeats) * 100} className={`progress-bar ${task.progress >= task.count_repeats ? "green-color" : ""}`} />
					<div className="quest-progress-value">
						<p className={`quest-progress-text ${task.progress >= task.count_repeats ? "green-color" : ""}`}>
							{task.progress > task.count_repeats ? formattedCountRepeats : formattedProgress} / {formattedCountRepeats}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

DailyWeeklyTasksCard.propTypes = {
	task: PropTypes.object.isRequired,
	language: PropTypes.string.isRequired,
	onClickTrigger: PropTypes.func.isRequired,
	collectTask: PropTypes.func.isRequired,
	collectLoading: PropTypes.bool.isRequired,
	key: PropTypes.string.isRequired,
};

export default DailyWeeklyTasksCard;
