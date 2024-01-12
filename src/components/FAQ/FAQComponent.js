import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import FAQCardItem from "./FAQCardItem";
import HowChangeEmailFaqCard from "./cards/HowChangeEmailFaqCard";
import WhyCantLoginFaqCard from "./cards/WhyCantLoginFaqCard";
import WhereCanFindStatisticFaqCard from "./cards/WhereCanFindStatisticFaqCard";
import HowConnectNFTFaqCard from "./cards/HowConnectNFTFaqCard";
import TaskWallLeaderboardRulesWeekly from "./cards/TaskWallLeaderboardRulesWeekly";
import TaskWallLeaderboardRulesGrand from "./cards/TaskWallLeaderboardRulesGrand";
import TaskWallLeaderboardRulesRewards from "./cards/TaskWallLeaderboardRulesRewards";

import "../../assets/scss/SingleComponents/FAQCardsCustom.scss";

const FAQComponent = ({ title, keys }) => {
	const [faqData, setFaqData] = useState([]);

	useEffect(() => {
		const filteredItems = !keys ? totalData : totalData.filter((card) => keys.includes(card.name));
		setFaqData(filteredItems);
	}, []);

	const totalData = [
		{
			name: "howChangeEmail",
			icon: "tasks_white.svg",
			content: <HowChangeEmailFaqCard />,
		},
		{
			name: "whyCantLogin",
			icon: "tasks_white.svg",
			content: <WhyCantLoginFaqCard />,
		},
		{
			name: "whereCanFindStatistic",
			icon: "tasks_white.svg",
			content: <WhereCanFindStatisticFaqCard />,
		},
		{
			name: "howConnectNFT",
			icon: "tasks_white.svg",
			content: <HowConnectNFTFaqCard />,
		},
		{
			name: "taskWallLeaderboardRulesWeekly",
			icon: "tasks_white.svg",
			content: <TaskWallLeaderboardRulesWeekly />,
		},
		{
			name: "taskWallLeaderboardRulesGrand",
			icon: "tasks_white.svg",
			content: <TaskWallLeaderboardRulesGrand />,
		},
		{
			name: "taskWallLeaderboardRulesRewards",
			icon: "tasks_white.svg",
			content: <TaskWallLeaderboardRulesRewards />,
		},
	];

	return (
		<div className="faq-cards-container">
			<div className="faq-section">
				{title && (
					<div className="faq-section-header-title">
						<p>{title}</p>
					</div>
				)}
				{!!faqData.length &&
					faqData?.map((card) => (
						<FAQCardItem icon={card.icon} key={card.name} name={card.name}>
							{card.content}
						</FAQCardItem>
					))}
			</div>
		</div>
	);
};

FAQComponent.propTypes = {
	title: PropTypes.string,
	keys: PropTypes.array,
};

export default FAQComponent;
