import React from "react";
import { useTranslation } from "react-i18next";

const TaskWallLeaderboardRulesRewards = () => {
	const { t } = useTranslation("FAQ");
	const content = t("faqCards.taskWallLeaderboardRulesRewards", { returnObjects: true });
	return (
		<div className="card-body-item">
			<ul className="leaderboard-faq-ul">
				<li>📍{content.description}</li>
				<li>📍{content.description2}</li>
				<li>📍{content.description3}</li>
				<li>📍{content.description4}</li>
				<li>📍{content.description5}</li>
				<li>📍{content.description6}</li>
				<li>📍{content.description7}</li>
			</ul>
		</div>
	);
};

export default TaskWallLeaderboardRulesRewards;
