import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { Container } from "reactstrap";
import { useSelector } from "react-redux";
import SpecialProgression from "../../components/SystemSaleEvent/SpecialProgression";
import FAQCard from "../../components/FAQ/FAQCard";
import SpinEventComponent from "../../components/SpinEvent/SpinEventComponent";
import EventBannerWithTimer from "../../components/SingleComponents/EventBannerWithTimer";
import useGetEventConfig from "../../services/hooks/useGetEventConfig";

import "../../assets/scss/SpinEvent/main.scss";

const EVENT_TYPE = "spin_event";

const SpinEvent = () => {
	const language = useSelector((state) => state.game.language);
	const { eventConfig } = useGetEventConfig(EVENT_TYPE);
	const imgPath = `${process.env.STATIC_URL}/static/img/events/spin_event/`;
	const backgroundImageUrl = eventConfig ? `url("${imgPath}${eventConfig._id}/${eventConfig.files.background_img}")` : "";
	const backgroundEventImageUrl = eventConfig ? `${imgPath}${eventConfig._id}/${eventConfig.files.background_header_img}` : "";
	const rewardIcon = eventConfig ? `${imgPath}${eventConfig._id}/${eventConfig.files.reward_icon}` : "";
	return (
		<Fragment>
			{eventConfig && (
				<div className="spin-event" style={{ background: backgroundImageUrl }}>
					<div className="event-top-background-container">
						<img className="left-image" src={backgroundEventImageUrl} alt={eventConfig.files.background_header_img} />
						<img className="right-image" src={backgroundEventImageUrl} alt={eventConfig.files.background_header_img} />
					</div>
					<Container className="spin-event-container">
						<EventBannerWithTimer endTime={eventConfig.end_date} timerText={"ENDS"} eventId={eventConfig._id} imageName={eventConfig.files.header_img} eventType={"spin_event"} />
						<SpecialProgression rewardIcon={rewardIcon} eventType={EVENT_TYPE} />
						<SpinEventComponent eventConfig={eventConfig} eventIcon={rewardIcon} />
						{eventConfig.description && <p className="event-description">{eventConfig.description[language] || eventConfig.description.en}</p>}
						<FAQCard faqType={eventConfig.faq_type} hideTitle={true} title={`F.A.Q. - ${eventConfig.title[language] || eventConfig.title.en}`} />
					</Container>
				</div>
			)}
		</Fragment>
	);
};

SpinEvent.propTypes = {
	wsReact: PropTypes.object.isRequired,
};

export default SpinEvent;
