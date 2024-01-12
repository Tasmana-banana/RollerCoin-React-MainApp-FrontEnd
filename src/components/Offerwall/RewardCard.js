import React from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { Col, Row } from "reactstrap";
import { withTranslation } from "react-i18next";
import getCurrencyConfig from "../../services/getCurrencyConfig";
import decimalAdjust from "../../services/decimalAdjust";

import rewardPaidImg from "../../assets/img/offerwall/reward_paid.svg";
import rewardDeclinedImg from "../../assets/img/offerwall/reward_declined.svg";

const RewardCard = ({ reward, t }) => {
	const currencyConfig = getCurrencyConfig(reward.amount_currency);
	const adjustedPrice = decimalAdjust(reward.amount / currencyConfig.toSmall);
	return (
		<Col xs={12} key={reward.offer_id} className="reward-container">
			<Row noGutters className={`reward-info-container ${reward.isNew ? "new-reward-wrapper" : ""}`}>
				{reward.isNew && <div className="new-wrapper-text">New</div>}
				<Col xs={12}>
					<Row noGutters className="title-amount-row">
						<Col xs={6} className="reward-title-block">
							<img className="reward-img" src={reward.status_code === 3 ? rewardPaidImg : rewardDeclinedImg} alt="Reward status" />
							<h2 className="reward-text">{t("offer_reward")}</h2>
						</Col>
						<Col xs={6} className="reward-amount-block">
							<img className="reward-currency-img" src={`/static/img/wallet/${reward.amount_currency.toLowerCase()}.svg?v=1.13`} alt="Currency image" />
							<span className="reward-amount">{adjustedPrice}</span>
							<span className="reward-currency">{reward.amount_currency}</span>
						</Col>
					</Row>
					<Row noGutters className="status-date-row">
						<Col xs={6} className="reward-status-block">
							<span className="reward-status-text">{t("status")}</span>
							<span className={`reward-status ${reward.status_code === 3 ? "paid" : "declined"}`}>{reward.status_code === 3 ? "paid" : "declined"}</span>
						</Col>
						<Col xs={6} className="reward-date-block">
							<span className="reward-date-text">{moment(new Date(reward.created)).format("HH:mm MMMM DD, YYYY")}</span>
						</Col>
					</Row>
					<Row noGutters className="offer-id-row">
						<Col xs={12} className="reward-offer-id-block">
							<span className="reward-reward-offer-id-text">{t("offer_id")}</span>
							<span className="reward-reward-offer-id">{reward.offer_id || ""}</span>
						</Col>
					</Row>
				</Col>
			</Row>
		</Col>
	);
};

RewardCard.propTypes = {
	reward: PropTypes.object.isRequired,
	t: PropTypes.func.isRequired,
};

export default withTranslation("Offerwall")(RewardCard);
