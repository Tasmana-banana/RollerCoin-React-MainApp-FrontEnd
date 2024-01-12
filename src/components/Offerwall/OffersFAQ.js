import React from "react";
import { Col, Row } from "reactstrap";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import FAQCard from "../FAQ/FAQCard";

import chest from "../../assets/img/offerwall/hamster_chest.png";

import choose from "../../assets/img/offerwall/start_choose.gif";
import check from "../../assets/img/offerwall/start_check.gif";
import complete from "../../assets/img/offerwall/start_complete.gif";
import reward from "../../assets/img/offerwall/start_reward.gif";

const ROADMAP = [
	{
		step: 1,
		img: choose,
		title: "faq.step1.title",
		description: "faq.step1.description",
	},
	{
		step: 2,
		img: check,
		title: "faq.step2.title",
		description: "faq.step2.description",
	},
	{
		step: 3,
		img: complete,
		title: "faq.step3.title",
		description: "faq.step3.description",
	},
	{
		step: 4,
		img: reward,
		title: "faq.step4.title",
		description: "faq.step4.description",
	},
];

const OffersFAQ = ({ t }) => (
	<div className="faq-page">
		<Row>
			<Col lg={6} className="faq-container">
				<h2 className="faq-title">How it works</h2>
				<h3 className="faq-title">{t("faq.title")}</h3>
				<p className="faq-inscription">{t("faq.complete")}</p>
				<p className="faq-description">{t("faq.funds")}</p>
			</Col>
			<Col lg={6} className="faq-container">
				<div className="faq-image-block">
					<img className="image" src={chest} width={402} height={250} alt="chest" />
				</div>
			</Col>
		</Row>
		<div className="faq-roadmap-wrapper">
			<h3 className="faq-title">How it works</h3>
			<Row>
				{ROADMAP.map((item) => (
					<Col lg={3} xs={6} key={item.step} className="faq-roadmap-step">
						<div className="faq-roadmap-container">
							<span className="faq-roadmap-text-step">{item.step}</span>
							<div className="faq-roadmap-image">
								<img className="image" src={item.img} width={138} height={92} alt="step img" />
							</div>
							<div className="faq-roadmap-content">
								<h4 className="faq-roadmap-title">{t(`${item.title}`)}</h4>
								<p className="faq-roadmap-text">{t(`${item.description}`)}</p>
							</div>
						</div>
					</Col>
				))}
			</Row>
		</div>
		<FAQCard faqType="offerwalls" hideTitle={true} title="FAQ - Task Wall" />
	</div>
);

OffersFAQ.propTypes = {
	t: PropTypes.func.isRequired,
};

export default withTranslation("Offerwall")(OffersFAQ);
