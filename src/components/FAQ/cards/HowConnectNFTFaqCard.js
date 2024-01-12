import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import getLanguagePrefix from "../../../services/getLanguagePrefix";

import headerProfileImg from "../../../assets/img/faq/cardImg/header-profile-img.png";
import profileMenuImg from "../../../assets/img/faq/cardImg/profile-menu-image.png";
import connectNFTImg from "../../../assets/img/faq/cardImg/connect-nft-image.png";
import nftNotFoundImg from "../../../assets/img/faq/cardImg/nft-not-found-image.png";

const HowConnectNFTFaqCard = () => {
	const language = useSelector((state) => state.game.language);
	const { t } = useTranslation("FAQ");
	const content = t("faqCards.howConnectNFT", { returnObjects: true });
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
				<span className="font-weight-bold">{content.descrBold}</span>
				{content.description4}
			</p>
			<div className="text-center">
				<img className="faq-card-image" src={profileMenuImg} width={250} height={250} alt="profile-menu-image" />
			</div>
			<p>
				{content.description5}
				<span className="font-weight-bold">{content.descrBold5}</span>.
			</p>
			<div className="text-center">
				<img className="faq-card-image" src={connectNFTImg} alt="connect-nft-image" />
			</div>
			<p>{content.description6}</p>
			<div className="text-center">
				<img className="faq-card-image" src={nftNotFoundImg} alt="nft-not-found-image" />
			</div>
		</div>
	);
};

export default HowConnectNFTFaqCard;
