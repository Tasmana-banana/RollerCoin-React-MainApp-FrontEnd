import React, { Fragment, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useLocation } from "react-router-dom";
import { Container } from "reactstrap";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import RollerHorizontalTabs from "../../components/SingleComponents/RollerHorizontalTabs";
import SpecialEvent from "../../components/SystemSaleEvent/SpecialEvent";
import SpecialProgression from "../../components/SystemSaleEvent/SpecialProgression";
import getLanguagePrefix from "../../services/getLanguagePrefix";
import { TABS_ROUTE, TABS_TYPE } from "../../constants/SystemSaleEvent";

import "../../assets/scss/SystemSaleEvent/main.scss";

import checkIcon from "../../assets/img/system_sale_event/icon/check.svg";
import checkIconActive from "../../assets/img/system_sale_event/icon/check_active.svg";
import cartIcon from "../../assets/img/system_sale_event/icon/cart.svg";
import cartIconActive from "../../assets/img/system_sale_event/icon/cart_active.svg";
import howItWorksImg from "../../assets/img/offerwall/how-it-works.svg";
import howItWorksImgActive from "../../assets/img/offerwall/how-it-works_active.svg";
import HowItWorks from "../../components/SingleComponents/HowItWorks";
import EventBannerWithTimer from "../../components/SingleComponents/EventBannerWithTimer";
import useGetEventConfig from "../../services/hooks/useGetEventConfig";

const EVENT_TYPE = "system_sales_event";

const SystemSaleEvent = ({ wsReact }) => {
	const location = useLocation();
	const { t } = useTranslation("SystemSaleEvent");
	const language = useSelector((state) => state.game.language);
	const [activeTab, setActiveTab] = useState("event");
	const { eventConfig } = useGetEventConfig(EVENT_TYPE);
	const rewardIcon = eventConfig ? `${eventConfig.files.reward_icon}?v=${new Date(eventConfig.last_update).getTime() || 1}` : "";
	const backgroundImageUrl = eventConfig ? `url("${eventConfig.files.background_img}?v=${new Date(eventConfig.last_update).getTime() || 1}")` : "";

	useEffect(async () => {
		getTabActive();
	}, [activeTab]);

	const getTabActive = () => {
		Object.entries(TABS_ROUTE).forEach((item) => {
			const [key, route] = item;
			if (location.pathname.endsWith(route)) {
				setActiveTab(key);
			}
		});
	};
	const onSelectTab = (tab) => {
		setActiveTab(tab);
	};

	const tabsConfig = {
		[TABS_TYPE.EVENT]: {
			title: t("specialEvent.event"),
			icon: checkIcon,
			iconActive: checkIconActive,
			href: `${getLanguagePrefix(language)}/${TABS_ROUTE[TABS_TYPE.EVENT]}`,
		},
		[TABS_TYPE.SHOP]: {
			title: t("specialEvent.shop"),
			icon: cartIcon,
			iconActive: cartIconActive,
			href: `${getLanguagePrefix(language)}/${TABS_ROUTE[TABS_TYPE.SHOP]}`,
		},
		[TABS_TYPE.HOW_IT_WORKS]: {
			title: t("specialEvent.howItWorks"),
			icon: howItWorksImg,
			iconActive: howItWorksImgActive,
			href: `${getLanguagePrefix(language)}/${TABS_ROUTE[TABS_TYPE.HOW_IT_WORKS]}`,
		},
	};

	return (
		<Fragment>
			{eventConfig && (
				<div className="special-event" style={{ background: backgroundImageUrl }}>
					<Container className="special-event-container">
						<div className="event-banner">
							<EventBannerWithTimer
								endTime={eventConfig.end_date}
								timerText={"ENDS"}
								imageName={`${eventConfig.files.header_img}?v=${new Date(eventConfig.last_update).getTime()}`}
								eventType={EVENT_TYPE}
							/>
						</div>
						<SpecialProgression rewardIcon={rewardIcon} eventType={EVENT_TYPE} />
						<RollerHorizontalTabs onSelect={onSelectTab} className="special-event-tabs" activeTab={activeTab} tabsConfig={tabsConfig}>
							{activeTab === TABS_TYPE.EVENT && <SpecialEvent wsReact={wsReact} />}
							{activeTab === TABS_TYPE.HOW_IT_WORKS && (
								<HowItWorks
									faqType={EVENT_TYPE}
									faqFiles={{
										faq_banner: `${eventConfig.files.faq_banner}?v=${new Date(eventConfig.last_update).getTime() || 1}`,
										faq_banner_mobile: `${eventConfig.files.faq_banner_mobile}?v=${new Date(eventConfig.last_update).getTime() || 1}`,
									}}
								/>
							)}
						</RollerHorizontalTabs>
					</Container>
				</div>
			)}
		</Fragment>
	);
};

SystemSaleEvent.propTypes = {
	wsReact: PropTypes.object.isRequired,
};

export default SystemSaleEvent;
