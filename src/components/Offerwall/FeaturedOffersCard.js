import React from "react";
import PropTypes from "prop-types";
import { Col, Row } from "reactstrap";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import RatingStars from "../SingleComponents/RatingStars";

import rollerCyanIcon from "../../assets/img/offerwall/roller_cyan_icon.svg";
import sandglassIcon from "../../assets/img/offerwall/sandglass_white_icon.svg";
import rankedOffer2 from "../../assets/img/offerwall/ranked_offer_2.png";
import rankedOffer3 from "../../assets/img/offerwall/ranked_offer_3.png";
import rankedOffer1 from "../../assets/img/offerwall/ranked_offer_1.png";

const FeaturedOffersCard = ({ offer }) => {
	const isMobile = useSelector((state) => state.game.isMobile);
	const { t } = useTranslation("Offerwall");

	const getScoreStyles = (rating) => {
		switch (true) {
			case rating > 1 && rating <= 4:
				return {
					img: rankedOffer2,
				};
			case rating > 4:
				return {
					img: rankedOffer3,
				};
			default:
				return {
					img: rankedOffer1,
				};
		}
	};

	const goToLink = (link) => {
		window.open(link, "_blank");
	};

	return (
		<Col xs={9} lg={3}>
			<Row noGutters={true} className="featured-offer-card" onClick={() => goToLink(offer.href_new)}>
				<Col xs={12} lg={12} className="featured-offer-header">
					<div className="img-wrapper">
						<img className="featured-offer-image" alt="offer image" width={isMobile ? 120 : 240} height={isMobile ? 75 : 150} src={getScoreStyles(+offer.statistics_rating_avg).img} />
					</div>
				</Col>
				<Col xs={12} lg={12} className="featured-offer-body">
					<RatingStars level={+offer.statistics_rating_avg} />
					<div className="featured-offer-description">
						<div className="featured-offer-description-item">
							<div className="featured-offer-description-icon-wrapper">
								<img src={rollerCyanIcon} alt="payment" height={18} width={18} />
							</div>
							<p className="featured-offer-description-text payout">{offer.payout} RLT</p>
						</div>
						<div className="featured-offer-description-item">
							<div className="featured-offer-description-icon-wrapper">
								<img src={sandglassIcon} alt="sandglass" height={isMobile ? 20 : 16} width={isMobile ? 20 : 16} />
							</div>
							<p className="featured-offer-description-text">{offer.time} min</p>
						</div>
					</div>
				</Col>
				<Col xs={12} className="featured-offer-card-footer">
					<button type="button" className="tree-dimensional-button goto-btn" onClick={() => goToLink(offer.href_new)}>
						<span className="w-100">{t("view_task")}</span>
					</button>
				</Col>
			</Row>
		</Col>
	);
};

FeaturedOffersCard.propTypes = {
	offer: PropTypes.object.isRequired,
};

export default FeaturedOffersCard;
