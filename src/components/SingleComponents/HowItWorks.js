import React from "react";
import { Col, Row } from "reactstrap";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import FAQCard from "../FAQ/FAQCard";

import "../../assets/scss/SingleComponents/HowItWorks.scss";

import chest from "../../assets/img/offerwall/hamster_chest.png";
import choose from "../../assets/img/offerwall/start_choose.gif";
import check from "../../assets/img/offerwall/start_check.gif";
import complete from "../../assets/img/offerwall/start_complete.gif";
import reward from "../../assets/img/offerwall/start_reward.gif";

import selectMiner from "../../assets/img/system_sale_event/howItWorks/select_miners.png";
import calculateReward from "../../assets/img/system_sale_event/howItWorks/calculate_reward.png";
import startBurning from "../../assets/img/system_sale_event/howItWorks/start_burning.png";
import claimReward from "../../assets/img/system_sale_event/howItWorks/claim_reward.png";

const faqConstructor = (faqType, files) => {
	const faqConfig = {
		system_sales_event: {
			banner: files?.faq_banner,
			bannerMobile: files?.faq_banner_mobile,
			imgAlt: "Burning event",
			roadmap: [
				{
					step: 1,
					img: selectMiner,
					title: "system_sales_event.step1.title",
					description: "system_sales_event.step1.description",
				},
				{
					step: 2,
					img: calculateReward,
					title: "system_sales_event.step2.title",
					description: "system_sales_event.step2.description",
				},
				{
					step: 3,
					img: startBurning,
					title: "system_sales_event.step3.title",
					description: "system_sales_event.step3.description",
				},
				{
					step: 4,
					img: claimReward,
					title: "system_sales_event.step4.title",
					description: "system_sales_event.step4.description",
				},
			],
		},
		offerwalls: {
			banner: chest,
			bannerMobile: chest,
			imgAlt: "Task wall",
			roadmap: [
				{
					step: 1,
					img: choose,
					title: "offerwalls.step1.title",
					description: "offerwalls.step1.description",
				},
				{
					step: 2,
					img: check,
					title: "offerwalls.step2.title",
					description: "offerwalls.step2.description",
				},
				{
					step: 3,
					img: complete,
					title: "offerwalls.step3.title",
					description: "offerwalls.step3.description",
				},
				{
					step: 4,
					img: reward,
					title: "offerwalls.step4.title",
					description: "offerwalls.step4.description",
				},
			],
		},
	};

	return faqConfig[faqType];
};

const HowItWorks = ({ faqType, faqFiles }) => {
	const isMobile = useSelector((state) => state.game.isMobile);
	const { t } = useTranslation("FAQ");
	const content = t(faqType, { returnObjects: true });
	const faqConfig = faqConstructor(faqType, faqFiles);

	return (
		<div className="special-event-faq-wrapper">
			<Row>
				<Col lg={6}>
					<div className="faq-container">
						<h2 className={`faq-title ${faqType}`}>{content?.title}</h2>
						{content?.subtitle && <h3 className="faq-title">{content.subtitle}</h3>}
						{content?.inscription && <p className="faq-inscription">{content.inscription}</p>}
						{content?.description &&
							content.description.map((descr, i) => (
								<p key={i} className="faq-description">
									{descr}
								</p>
							))}
					</div>
				</Col>
				<Col lg={6}>
					<div className="faq-container">
						<div className="faq-image-block">
							<img className="image" src={isMobile ? faqConfig.bannerMobile : faqConfig.banner} alt={faqConfig.imgAlt} />
						</div>
					</div>
				</Col>
			</Row>
			<div className="faq-roadmap-wrapper">
				{faqType === "offerwalls" && <h3 className="faq-title">{content?.title}</h3>}
				<Row>
					{faqConfig.roadmap.map((item) => (
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
			<FAQCard faqType={faqType} hideTitle={true} title={content?.faqTitle} />
		</div>
	);
};

HowItWorks.propTypes = {
	faqType: PropTypes.string.isRequired,
	faqFiles: PropTypes.object.isRequired,
};

export default HowItWorks;
