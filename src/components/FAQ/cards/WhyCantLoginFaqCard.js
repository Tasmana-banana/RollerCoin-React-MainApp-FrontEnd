import React from "react";
import { useTranslation } from "react-i18next";

const WhyCantLoginFaqCard = () => {
	const { t } = useTranslation("FAQ");
	const content = t("faqCards.whyCantLogin", { returnObjects: true });
	return (
		<div className="card-body-item">
			<p>{content.description}</p>
			<p>{content.description2}</p>
			<ol>
				<li>{content.list1}</li>
				<li>{content.list2}</li>
				<li>{content.list3}</li>
				<li>{content.list4}</li>
			</ol>
			<p>{content.description3}</p>
			<p>
				{content.description4}
				<a target="_blank" rel="noopener noreferrer" href="https://rollercoin.com">
					https://rollercoin.com
				</a>{" "}
				{content.description5}
			</p>
			<p>{content.description6}</p>
			<p>
				{content.description7}
				<a target="_blank" rel="noopener noreferrer" href="mailto:support@rollercoin.com">
					support@rollercoin.com
				</a>
				{content.description8}
			</p>
		</div>
	);
};

export default WhyCantLoginFaqCard;
