import React from "react";
import PropTypes from "prop-types";
import { Col, Row } from "reactstrap";
import { useTranslation } from "react-i18next";
import { LazyLoadImage } from "react-lazy-load-image-component";

import rollerCyanIcon from "../../assets/img/offerwall/roller_cyan_icon.svg";
import defaultImage from "../../assets/img/offerwall/ranked_offer_1.png";

const InternalOffersCard = ({ offer }) => {
	const { t } = useTranslation("Offerwall");

	const goToLink = (link) => {
		window.open(link, "_blank");
	};

	return (
		<Col xs={9} lg={3}>
			<Row noGutters={true} className="internal-offer-card" onClick={() => goToLink(offer.clickUrl)}>
				<Col xs={12} lg={12} className="internal-offer-header">
					<div className="img-wrapper">
						<LazyLoadImage className="internal-offer-image" src={offer.imageUrl || defaultImage} width={150} height={150} threshold={200} alt="offer image" />
					</div>
				</Col>
				<Col xs={12} lg={12} className="internal-offer-body">
					<div className="internal-offer-description">
						<div className="internal-offer-description-icon-wrapper">
							<img src={rollerCyanIcon} alt="payment" height={18} width={18} />
						</div>
						<p className="internal-offer-description-text payout">
							{offer.payout} {offer.currency}
						</p>
					</div>
				</Col>
				<Col xs={12} className="internal-offer-card-footer">
					<span className="w-100">{t("view_task")}</span>
				</Col>
			</Row>
		</Col>
	);
};

InternalOffersCard.propTypes = {
	offer: PropTypes.object.isRequired,
};

export default InternalOffersCard;
