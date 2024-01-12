import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import getLanguagePrefix from "../../../services/getLanguagePrefix";

import headerProfileImg from "../../../assets/img/faq/cardImg/header-profile-img.png";
import incomeStatsImg from "../../../assets/img/faq/cardImg/income-stats-image.png";

const WhereCanFindStatisticFaqCard = () => {
	const language = useSelector((state) => state.game.language);
	const { t } = useTranslation("FAQ");
	const content = t("faqCards.whereCanFindStatistic", { returnObjects: true });
	return (
		<div className="card-body-item">
			<p>
				{content.description}
				<Link to={`${getLanguagePrefix(language)}/profile`}>{content.profile}</Link>
				{content.description2}
			</p>
			<div>
				<img className="faq-card-image" src={headerProfileImg} alt="close_menu" />
			</div>
			<p>
				{content.description3}
				<span className="font-weight-bold">{content.descrBold3}</span>
				{content.description4}
			</p>
			<div>
				<img className="faq-card-image" src={incomeStatsImg} alt="" />
			</div>
			<p>{content.description5}</p>
		</div>
	);
};

export default WhereCanFindStatisticFaqCard;
