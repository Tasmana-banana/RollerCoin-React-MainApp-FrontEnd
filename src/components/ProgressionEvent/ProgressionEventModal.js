import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import PropTypes from "prop-types";
import { Modal, ModalBody, Progress, Tooltip } from "reactstrap";
import RollerButton from "../SingleComponents/RollerButton";
import threeDigitDivisor from "../../services/threeDigitDivisor";
import getLanguagePrefix from "../../services/getLanguagePrefix";
import { MINERS_TYPES, RARITY_DATA_BY_LEVEL } from "../../constants/Storage/index";

import "../../assets/scss/ProgressionEvent/ProgressionEventModal.scss";

import closeIcon from "../../assets/img/header/close_menu.svg";
import clockIcon from "../../assets/img/icon/clock.svg";
import infoIcon from "../../assets/img/icon/info_cyan_round.svg";

const REPLACEABLE_TASKS_FOR_SPEND_RLT = ["season", "crafting_offers", "marketplace", "crafting"];

const ProgressionEventModal = ({
	isModalOpen,
	toggleModal,
	viewTime,
	multiplierTimeString,
	maxMultiplier,
	eventID,
	imgVer,
	startUserXp,
	currentLevelXp,
	userStats,
	reward,
	mainReward,
	tasks,
	multiplierTasks,
	isCompleted,
}) => {
	const isMobile = useSelector((state) => state.game.isMobile);
	const language = useSelector((state) => state.game.language);
	const { t } = useTranslation("ProgressionEvent");
	const [isTooltipOpen, setIsTooltipOpen] = useState(false);
	const [adjustedMultiplierTaskText, setAdjustedMultiplierTaskText] = useState(null);
	const [sortedTasks, setSortedTasks] = useState([]);
	const [spendRLTTitle, setSpendRLTTitle] = useState({});
	const history = useHistory();
	const backgroundURL = `${process.env.STATIC_URL}/static/img/pe/${eventID}/${isMobile ? "progression-event-modal-bg-mobile" : "progression-event-modal-bg-desktop"}.png?v=${imgVer}`;

	const tooltipToggle = () => {
		setIsTooltipOpen(!isTooltipOpen);
	};

	useEffect(() => {
		const adjustedTasks = tasks.sort((a, b) => a.sort - b.sort);
		setSortedTasks(adjustedTasks);

		const spendRLTTask = adjustedTasks.find(({ type }) => type === "spend_rlt");
		if (!spendRLTTask) {
			return false;
		}
		const additionalTasks = adjustedTasks.filter((item) => REPLACEABLE_TASKS_FOR_SPEND_RLT.includes(item.type) && item.description?.en);

		if (!additionalTasks.length) {
			setSpendRLTTitle(spendRLTTask.title);
			return false;
		}

		const openedTitle = Object.keys(spendRLTTask.title).reduce((acc, key) => {
			acc[key] = `${spendRLTTask.title[key]} (except`;
			return acc;
		}, {});

		const extendedTitle = additionalTasks.reduce(
			(acc, val) => {
				const divider = acc.en === openedTitle.en ? " " : ", ";
				Object.keys(openedTitle).forEach((key) => {
					acc[key] = `${acc[key]}${divider}${val.description[key]}`;
				});
				return acc;
			},
			{ ...openedTitle }
		);

		const finalTitle = Object.keys(extendedTitle).reduce((acc, key) => {
			acc[key] = `${extendedTitle[key]})`;
			return acc;
		}, {});

		setSpendRLTTitle(finalTitle);
	}, [tasks]);

	useEffect(() => {
		if (!multiplierTasks.length) {
			return false;
		}
		const currentTask = multiplierTasks[0];
		const taskTitle = Object.keys(currentTask.title).reduce((acc, key) => {
			acc[key] = currentTask.title[key].split("{br}");
			return acc;
		}, {});
		setAdjustedMultiplierTaskText(taskTitle);
	}, [multiplierTasks]);

	const toggleBuyTokensBtn = () => {
		toggleModal();
		history.push(`${getLanguagePrefix(language)}/wallet`);
	};

	return (
		<Modal isOpen={isModalOpen} toggle={toggleModal} centered={true} className="progression-event-modal">
			<ModalBody className="progression-event-wrapper">
				<div className={`progression-event-modal-header ${isCompleted ? "complete" : ""}`} style={{ backgroundImage: `url(${backgroundURL})` }}>
					<button className="tree-dimensional-button close-menu-btn btn-default progression-modal-close-btn" onClick={toggleModal}>
						<span>
							<img src={closeIcon} width="32" height="32" alt="close_modal" />
						</span>
					</button>
					<div className="progression-modal-header-wrapper">
						<div className="progression-modal-info-side">
							<img
								className="modal-logo"
								src={`${process.env.STATIC_URL}/static/img/pe/${eventID}/progression-event-logo.png?v=${imgVer}`}
								width={320}
								height={100}
								alt="progression event logo"
							/>
							<div className="remaining-time">
								<div className="time-icon-wrapper">
									<img className="time-icon" src={clockIcon} alt="timer" />
								</div>
								<p className="time-text">
									{viewTime.days && `${viewTime.days}`} {viewTime.hours} {viewTime.minutes}
								</p>
							</div>
						</div>
						<div className="progression-modal-reward-side">
							{mainReward.type === "miner" && mainReward.item.type === MINERS_TYPES.MERGE && (
								<img
									className={`level-img-size-${mainReward.item.width || 2}`}
									src={`/static/img${RARITY_DATA_BY_LEVEL[mainReward.item.level].icon}`}
									width={22}
									height={16}
									alt={mainReward.item.level}
								/>
							)}
							<img
								alt="main reward"
								width={176}
								height={140}
								src={`${process.env.STATIC_URL}/static/img/market/miners/${mainReward.item.filename}.gif?v=1.0.0`}
								className="progression-reward-image"
							/>
							<div className="progression-modal-reward-wrapper">
								<p className="rewards-title">{mainReward.item.name[language] || mainReward.item.name.en}</p>
								<p className="rewards-description">{threeDigitDivisor(mainReward.item.power)} Gh/s</p>
							</div>
						</div>
					</div>
					{isCompleted && (
						<div className="progression-got-all">
							<p className="progression-got-all-text">{t("gotAll")}</p>
						</div>
					)}
				</div>
				{!isCompleted && (
					<div className="progression-event-modal-body">
						<div className="progression-event-modal-progress">
							<div className="progression-multiplier-wrapper">
								<p className="progression-multiplier-title">{t("multiplier")}</p>
								<div className="progression-multiplier-info-wrapper">
									<img className="progression-multiplier-info" id="progression-tooltip" src={infoIcon} width={isMobile ? 12 : 16} height={isMobile ? 12 : 16} alt="info" />
									<p className="progression-multiplier-max-value">(MAX X{maxMultiplier / 100})</p>
								</div>
								<p className="progression-multiplier-value">X{userStats.user_multiplier / 100}</p>
								<p className="progression-multiplier-remaining-time">{multiplierTimeString}</p>
							</div>
							{!!adjustedMultiplierTaskText && !!adjustedMultiplierTaskText[language] && !!adjustedMultiplierTaskText[language].length && (
								<Tooltip className="progression-tooltip-view" placement="right" autohide={false} target="progression-tooltip" isOpen={isTooltipOpen} toggle={tooltipToggle}>
									{adjustedMultiplierTaskText[language].map((item) => (
										<p className="m-1" key={item}>
											{item}
										</p>
									))}
								</Tooltip>
							)}
							<div className="progression-progress-block">
								<Progress value={(startUserXp / currentLevelXp) * 100} className="progression-progress-bar" />
								<p className="progression-progress-text">{`${startUserXp}/${currentLevelXp} ${!isMobile ? t("points") : ""}`}</p>
							</div>
							<div className="progression-modal-reward-wrapper">
								<p className="progression-reward-title">{t("reward")}</p>
								{reward.type === "miner" && reward.item.type === MINERS_TYPES.MERGE && (
									<img
										className={`level-img-size-${reward.item.width || 2}`}
										src={`/static/img${RARITY_DATA_BY_LEVEL[reward.item.level].icon}`}
										width={12}
										height={9}
										alt={reward.item.level}
									/>
								)}
								<img className="progression-reward-img" src={reward.img} style={reward.style ? reward.style : {}} alt="current reward" />
								<p className="progression-reward-description">{reward.info}</p>
							</div>
						</div>
						<div className="progression-quests-block">
							<p className="progression-quests-title">{t("quests")}:</p>
							<div className="progression-quests-list">
								{sortedTasks.map((task) => (
									<div key={task.id} className="progression-quest">
										<p className="progression-quest-text">{task.type === "spend_rlt" ? spendRLTTitle[language] || spendRLTTitle.en : task.title[language] || task.title.en}</p>
										<p className="progression-quest-reward-xp">
											<span className="accent-text">{task.xp_reward}</span> {t("points")}
										</p>
									</div>
								))}
							</div>
							<RollerButton className="progression-quest-button" text={t("buyTokens")} color="cyan" action={toggleBuyTokensBtn} />
						</div>
					</div>
				)}
			</ModalBody>
		</Modal>
	);
};

ProgressionEventModal.propTypes = {
	isModalOpen: PropTypes.bool.isRequired,
	toggleModal: PropTypes.func.isRequired,
	viewTime: PropTypes.object.isRequired,
	maxMultiplier: PropTypes.number.isRequired,
	eventID: PropTypes.string.isRequired,
	imgVer: PropTypes.string.isRequired,
	multiplierTimeString: PropTypes.string.isRequired,
	startUserXp: PropTypes.number.isRequired,
	currentLevelXp: PropTypes.number.isRequired,
	userStats: PropTypes.object.isRequired,
	reward: PropTypes.object.isRequired,
	mainReward: PropTypes.object.isRequired,
	tasks: PropTypes.array.isRequired,
	multiplierTasks: PropTypes.array.isRequired,
	isCompleted: PropTypes.bool.isRequired,
};

export default ProgressionEventModal;
