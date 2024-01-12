import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Col, Row } from "reactstrap";
import { withTranslation } from "react-i18next";
import LazyLoad, { forceCheck } from "react-lazyload";
import getCurrencyConfig from "../../services/getCurrencyConfig";
import decimalAdjust from "../../services/decimalAdjust";

import arrowUpIcon from "../../assets/img/icon/angle_up.svg";
import arrowDownIcon from "../../assets/img/icon/angle_down.svg";

const OffersListCard = ({ offer, sendClickData, setOpenedCard, openedCardID, t }) => {
	const [isProcessing, setIsProcessing] = useState(false);

	const clickHandler = async () => {
		setIsProcessing(true);
		await sendClickData(offer);
		setIsProcessing(false);
	};

	useEffect(() => {
		forceCheck();
	});

	const currencyConfig = getCurrencyConfig(offer.amount_currency);
	const adjustedPrice = decimalAdjust(offer.amount / currencyConfig.toSmall, currencyConfig.precision);
	return (
		<Col xs={12} lg={4} key={offer.offer_id} className="offer-container">
			<Row noGutters className="main-info-container">
				<div className={`main-info-wrapper ${offer._id === openedCardID ? "opened" : ""}`}>
					<div className="offer-price-block">
						<div className="price-wrapper">
							<span className="price-text">
								{adjustedPrice} {offer.amount_currency}
							</span>
						</div>
					</div>
					<div className="offer-image-block">
						<LazyLoad offset={100}>
							<img className="image" src={offer.images_urls.length ? offer.images_urls[0] : ""} alt="offer image" />
						</LazyLoad>
					</div>
					<div className="offer-title-block">
						<p className="title-text">{offer.title}</p>
					</div>
					<div className="offer-action-block">
						<button type="button" className="tree-dimensional-button btn-default" disabled={isProcessing} onClick={clickHandler}>
							<span>{t("view_task")}</span>
						</button>
					</div>
				</div>
				<div className={`offer-description-wrapper ${offer._id === openedCardID ? "opened" : ""}`}>
					<div className="offer-description-switcher" hidden={offer._id === openedCardID} onClick={() => setOpenedCard(offer._id)}>
						<p className="offer-description-switcher-text">{t("details")}</p>
						<LazyLoad offset={100}>
							<img className="image" src={arrowDownIcon} alt="open" />
						</LazyLoad>
					</div>
					<div className="offer-description-block" hidden={offer._id !== openedCardID}>
						<p className="offer-description">{offer.description}</p>
						<p className="offer-disclaimer cyan-text">{offer.disclaimer}</p>
						<div className="offer-description-switcher" onClick={() => setOpenedCard("")}>
							<p className="offer-description-switcher-text">{t("hide")}</p>
							<LazyLoad offset={100}>
								<img className="image" src={arrowUpIcon} alt="hide" />
							</LazyLoad>
						</div>
					</div>
				</div>
			</Row>
		</Col>
	);
};

OffersListCard.propTypes = {
	offer: PropTypes.object.isRequired,
	sendClickData: PropTypes.func.isRequired,
	setOpenedCard: PropTypes.func.isRequired,
	openedCardID: PropTypes.string,
	t: PropTypes.func.isRequired,
};

export default withTranslation("Offerwall")(OffersListCard);
