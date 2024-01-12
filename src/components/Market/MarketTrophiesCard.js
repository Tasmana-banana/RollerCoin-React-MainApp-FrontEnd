import React from "react";
import { Col, Row } from "reactstrap";
import { LazyLoadImage } from "react-lazy-load-image-component";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import RollerButton from "../SingleComponents/RollerButton";

import "../../assets/scss/Market/MarketTrophiesCard.scss";

const MarketTrophiesCard = ({ t, item, setTrophies, isProcess, selectedTrophiesCount }) => (
	<Col xs={6} lg={3} className="market-trophy-card">
		<Row noGutters className="main-trophy-wrapper">
			<Col xs={12}>
				<div className="trophy-image-wrapper">
					{!!item.id && (
						<LazyLoadImage src={`${process.env.STATIC_URL}/static/img/game/room/trophies/${item.file_name}.png?v=1.0.0`} alt={item.id} threshold={100} className="trophy-image" />
					)}
				</div>
				{
					<RollerButton
						color={item.is_selected ? "default" : "cyan"}
						width={100}
						text={item.is_selected ? t("market.removeTrophies") : t("market.setTrophies")}
						disabled={isProcess || (!item.is_selected && !selectedTrophiesCount)}
						action={() => setTrophies(item.user_trophies_id, item.is_selected ? "remove" : "set")}
					/>
				}
			</Col>
		</Row>
	</Col>
);

MarketTrophiesCard.propTypes = {
	item: PropTypes.object.isRequired,
	setTrophies: PropTypes.func.isRequired,
	removeTrophies: PropTypes.func.isRequired,
	selectedTrophiesID: PropTypes.string.isRequired,
	isProcess: PropTypes.bool.isRequired,
	uid: PropTypes.string.isRequired,
	avatarVersion: PropTypes.string.isRequired,
	language: PropTypes.string.isRequired,
	t: PropTypes.func.isRequired,
	isMobile: PropTypes.bool.isRequired,
	selectedTrophiesCount: PropTypes.number.isRequired,
};

export default withTranslation("Game")(MarketTrophiesCard);
