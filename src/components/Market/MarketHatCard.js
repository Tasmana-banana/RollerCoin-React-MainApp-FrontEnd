import React from "react";
import { Col, Row } from "reactstrap";
import { LazyLoadImage } from "react-lazy-load-image-component";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { withTranslation } from "react-i18next";
import RollerButton from "../SingleComponents/RollerButton";

import "../../assets/scss/Market/MarketHatCard.scss";

const MarketHatCard = ({ t, item, setHat, selectedHatID, isProcess, buyHat }) => {
	const uid = useSelector((state) => state.user.uid);
	const avatarVersion = useSelector((state) => state.user.avatarVersion);
	const isMobile = useSelector((state) => state.game.isMobile);
	const language = useSelector((state) => state.game.language);
	const avatarType = useSelector((state) => state.user.avatarType);

	return (
		<Col xs={6} lg={4} className="market-hat-card">
			<Row noGutters className="main-hat-wrapper">
				<Col xs={12}>
					<div className="hat-title-wrapper">
						<p className="hat-title">{item.title[language] || item.title.en}</p>
					</div>
					<div className="hat-image-wrapper">
						<LazyLoadImage
							width={isMobile ? 80 : 140}
							height={isMobile ? 80 : 140}
							src={`${process.env.AVATARS_STATIC_URL}/static/avatars/thumbnails/${isMobile ? 80 : 140}/${uid}.png?v=${avatarVersion}`}
							alt="avatar"
							threshold={100}
							className="avatar"
						/>
						{!!item.id && (
							<LazyLoadImage
								src={`${process.env.STATIC_URL}/static/img/game/room/hats/${item.id}.png?v=1.0.0`}
								alt={item.id}
								threshold={100}
								className={`hat-image${avatarType === "nft" ? " nft" : ""}`}
							/>
						)}
					</div>
					{item.is_available && (
						<RollerButton
							color="cyan"
							width={100}
							text={item.id ? t("market.setHat") : t("market.setDefault")}
							disabled={selectedHatID === item.id || (!selectedHatID && !item.id) || isProcess}
							action={() => setHat(item.id || null)}
						/>
					)}
					{!item.is_available && <RollerButton color="cyan" width={100} text={t("market.getFree")} action={() => buyHat(item.id)} disabled={isProcess} />}
				</Col>
			</Row>
		</Col>
	);
};

MarketHatCard.propTypes = {
	item: PropTypes.object.isRequired,
	setHat: PropTypes.func.isRequired,
	selectedHatID: PropTypes.string.isRequired,
	isProcess: PropTypes.bool.isRequired,
	buyHat: PropTypes.func,
	uid: PropTypes.string.isRequired,
	avatarVersion: PropTypes.string.isRequired,
	language: PropTypes.string.isRequired,
	t: PropTypes.func.isRequired,
	isMobile: PropTypes.bool.isRequired,
};

export default withTranslation("Game")(MarketHatCard);
