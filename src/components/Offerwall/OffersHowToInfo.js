import React from "react";
import { Col, Row } from "reactstrap";
import { useTranslation } from "react-i18next";
import RollerButton from "../SingleComponents/RollerButton";
import scrollToElement from "../../services/scrollToElement";

import "../../assets/scss/Offerwall/OffersHowToInfo.scss";

import arrowTop from "../../assets/img/icon/arrow_up.svg";
import choose from "../../assets/img/offerwall/start_choose.gif";
import check from "../../assets/img/offerwall/start_check.gif";
import complete from "../../assets/img/offerwall/start_complete.gif";
import reward from "../../assets/img/offerwall/start_reward.gif";

const ROADMAP = [
	{
		step: 1,
		img: choose,
		title: "howToGet.choose",
		description: "howToGet.chooseDescription",
	},
	{
		step: 2,
		img: check,
		title: "howToGet.check",
		description: "howToGet.checkDescription",
	},
	{
		step: 3,
		img: complete,
		title: "howToGet.complete",
		description: "howToGet.completeDescription",
	},
	{
		step: 4,
		img: reward,
		title: "howToGet.reward",
		description: "howToGet.rewardDescription",
	},
];

const OffersHowToInfo = () => {
	const { t } = useTranslation("Offerwall");
	return (
		<div className="how-to-block">
			<h2 className="how-to-title">{t("howToGet.howToGet")}</h2>
			<div className="how-to-roadmap-wrapper">
				<Row>
					{ROADMAP.map((item) => (
						<Col className="how-to-card-wrapper" xs={6} lg={3} key={item.step}>
							<div className="how-to-card">
								<p className="how-to-card-step">{item.step}</p>
								<div className="how-to-card-image">
									<img src={item.img} width={176} height={116} alt={t(item.title)} />
								</div>
								<p className="how-to-card-title">{t(item.title)}</p>
								<p className="how-to-card-description">{t(item.description)}</p>
							</div>
						</Col>
					))}
				</Row>
				<div className="how-to-btn-wrapper">
					<RollerButton className="how-to-action-btn" icon={arrowTop} text={t("letsGoButton")} action={() => scrollToElement(".offers-list-page", -16)} />
				</div>
			</div>
		</div>
	);
};

export default OffersHowToInfo;
