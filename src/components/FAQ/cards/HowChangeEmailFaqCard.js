import React from "react";
import { useTranslation } from "react-i18next";

const HowChangeEmailFaqCard = () => {
	const { t } = useTranslation("FAQ");
	const content = t("faqCards.howChangeEmail", { returnObjects: true });
	return (
		<div className="card-body-item">
			<p>{content.description}</p>
			<a target="_blank" rel="noopener noreferrer" href="https://docs.google.com/forms/d/e/1FAIpQLSeqP46YBDCSMHHJE5VzUnVIMdwO7-N0lursCSjnIIaWM9NQGw/viewform">
				{content.linkName}
			</a>
			<p>{content.description2}</p>
			<p>
				{content.description3}{" "}
				<a target="_blank" rel="noopener noreferrer" href="mailto:support@rollercoin.com">
					{content.email}
				</a>{" "}
				{content.description4}
			</p>
			<p>{content.description5}</p>
		</div>
	);
};

export default HowChangeEmailFaqCard;
