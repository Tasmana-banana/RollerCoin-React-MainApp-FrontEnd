import React, { useState } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { Collapse, CardBody, Card, Row, Col } from "reactstrap";
import Youtube from "../SingleComponents/Youtube";

import "../../assets/scss/Game/EventStaticInfoBlock.scss";

import arrowIcon from "../../assets/img/icon/arrow_cyan.svg";
import seasonStaticImg from "../../assets/img/seasonPass/season_static_img.png";

const EventStaticInfoBlock = ({ youtubeId, seasonContent }) => {
	const language = useSelector((state) => state.game.language);
	const [isOpenInfo, setIsOpenInfo] = useState(false);
	const isMobile = useSelector((state) => state.game.isMobile);

	const toggleOpenInfo = () => {
		setIsOpenInfo(!isOpenInfo);
	};

	return (
		<div className="event-static-info-wrapper">
			<Collapse isOpen={isOpenInfo} className="event-static-info-content">
				<Card className="event-static-info-card">
					<CardBody>
						<Row noGutters={true}>
							<Col xs={12}>
								<Youtube width="100%" id={youtubeId} height={isMobile ? 175 : 498} />
							</Col>
						</Row>
						<Row className="event-static-text-row" noGutters={true}>
							<Col lg={6} xs={12}>
								<div className="event-static-text-block">
									<h3 className="event-static-text-title">{seasonContent.main_description[language] || seasonContent.main_description.en}</h3>
									<p className="event-static-text" dangerouslySetInnerHTML={{ __html: seasonContent.second_description[language] || seasonContent.second_description.en }} />
								</div>
							</Col>
							<Col lg={6} xs={12}>
								<div className="event-static-img-block">
									<img src={seasonStaticImg} alt="" />
								</div>
							</Col>
						</Row>
					</CardBody>
				</Card>
			</Collapse>
			<div className="event-static-btn-block">
				<div className="event-static-btn" onClick={() => toggleOpenInfo()}>
					<span>{isOpenInfo ? "Show less" : "Show more"}</span>
					<img className={`event-static-btn-icon ${isOpenInfo ? "icon-up" : ""}`} src={arrowIcon} alt="arrow btn" />
				</div>
			</div>
		</div>
	);
};

EventStaticInfoBlock.propTypes = {
	youtubeId: PropTypes.string,
	seasonContent: PropTypes.object,
};

export default EventStaticInfoBlock;
