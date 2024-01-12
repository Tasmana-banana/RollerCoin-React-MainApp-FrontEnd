import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Progress } from "reactstrap";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useTranslation } from "react-i18next";
import RollerButton from "../RollerButton";
import decimalAdjust, { ROUND_DIRECTION } from "../../../services/decimalAdjust";
import getCurrencyConfig from "../../../services/getCurrencyConfig";

import checkedIcon from "../../../assets/img/seasonPass/icon/check_green.svg";
import gamepadIcon from "../../../assets/img/seasonPass/icon/gamepad_white.svg";
import tasklistIcon from "../../../assets/img/seasonPass/icon/tasklist_white.svg";
import wrenchIcon from "../../../assets/img/seasonPass/icon/wrench_white.svg";
import storeIcon from "../../../assets/img/seasonPass/icon/store_white.svg";
import userIcon from "../../../assets/img/seasonPass/icon/user_white.svg";
import passIcon from "../../../assets/img/seasonPass/icon/pass_white.svg";

const QuestCard = ({ task, onClickTrigger, collectTask, language, isLoading, eventIcon }) => {
	const [formattedCountRepeats, setFormattedCountRepeats] = useState(0);
	const [formattedProgress, setFormattedProgress] = useState(0);
	const [icon, setIcon] = useState("");
	const { t } = useTranslation("Game");

	useEffect(() => {
		const rltConfig = getCurrencyConfig("RLT");
		const isAmountSpentType = ["amount_spent", "offers_amount", "buy_rlt", "amount_spent_in_store"].includes(task.type);
		setFormattedCountRepeats(isAmountSpentType ? decimalAdjust(+task.count_repeats / rltConfig.toSmall, rltConfig.precision, ROUND_DIRECTION.FLOOR).toFixed(2) : task.count_repeats);
		setFormattedProgress(isAmountSpentType ? decimalAdjust(+task.progress / rltConfig.toSmall, rltConfig.precision, ROUND_DIRECTION.FLOOR).toFixed(2) : task.progress);
		setIcon(getIcon());
	});

	const getIcon = () => {
		switch (task.type) {
			case "games_by_number":
			case "games":
				return gamepadIcon;
			case "referral":
			case "youtube":
			case "facebook":
			case "twitter":
			case "telegram":
			case "discord":
			case "like_twitter":
			case "subscribe_twitter":
			case "subscribe_discord":
			case "subscribe_telegram":
			case "subscribe_instagram":
			case "subscribe_tiktok":
				return userIcon;
			case "amount_spent":
			case "amount_spent_in_store":
			case "open_lootbox":
			case "open_particular_lootbox":
			case "buy_rlt":
				return storeIcon;
			case "offer_task":
			case "offers_amount":
				return tasklistIcon;
			case "make_any_craft":
				return wrenchIcon;
			case "finish_tasks":
				return passIcon;
			default:
				return passIcon;
		}
	};

	return (
		<div className={`quest-item-card ${task.progress < task.count_repeats ? "quest-scroll-target" : ""}`}>
			<div className="quest-item-title-wrapper">
				<LazyLoadImage width={20} height={20} src={icon} alt="icon" threshold={100} />
				<p className="quest-item-title">{task.description[language] || task.description.en}</p>
			</div>
			<div className="quest-item-progress-block">
				<div className="quest-item-progress-wrapper">
					<div className="quest-item-progress-data">
						{eventIcon && (
							<p className="quest-progress-reward">
								{t("eventPass.reward")}:{" "}
								<span className="quest-accent-text">
									<LazyLoadImage className="event-icon-img" width={17} height={17} src={eventIcon} alt="quest-collected-img" threshold={100} />
								</span>
							</p>
						)}
						{!eventIcon && (
							<p className="quest-progress-reward">
								{t("eventPass.reward")}: <span className="quest-accent-text">{task.xp_reward} XP</span>
							</p>
						)}
						<p className="quest-progress-value">
							{task.progress > task.count_repeats ? formattedCountRepeats : formattedProgress} / {formattedCountRepeats}
						</p>
					</div>
					<Progress value={(task.progress / task.count_repeats) * 100} className="progress-bar" />
				</div>
				<div className="quest-item-action">
					{task.is_claimed && (
						<div className="quest-collected">
							<LazyLoadImage width={18} height={14} src={checkedIcon} alt="quest-collected-img" threshold={100} />
							<p className="quest-collected-text">{t("eventPass.claimed")}</p>
						</div>
					)}
					{task.progress >= task.count_repeats && !task.is_claimed && (
						<RollerButton disabled={isLoading} className="quest-collect-btn" text={t("eventPass.claim")} color="cyan" size="small" width={100} action={() => collectTask(task.id)} />
					)}
					{task.progress < task.count_repeats && (
						<RollerButton className="quest-do-btn" text={t("eventPass.start")} size="small" width={100} action={() => onClickTrigger(task.id, task.type, task.link)} />
					)}
				</div>
			</div>
		</div>
	);
};

QuestCard.propTypes = {
	task: PropTypes.object.isRequired,
	language: PropTypes.string.isRequired,
	onClickTrigger: PropTypes.func.isRequired,
	collectTask: PropTypes.func.isRequired,
	isLoading: PropTypes.bool.isRequired,
	eventIcon: PropTypes.string,
};

export default QuestCard;
