import React from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { Col, Row } from "reactstrap";
import { LazyLoadImage } from "react-lazy-load-image-component";

import notFindImg from "../../../assets/img/profile/nft/not_find.gif";
import eightBiticonImg from "../../../assets/img/profile/nft/contract_icons/8biticon.gif";

const CONTRACT_IMAGES_CONFIG = {
	"8biticon": eightBiticonImg,
};

const NoNftFound = ({ contractsList }) => {
	const { t } = useTranslation("Profile");
	const language = useSelector((state) => state.game.language);
	return (
		<Row noGutters={true} className="no-nft-found-container">
			<Col xs={12}>
				<img className="no-found-img" src={notFindImg} width={240} height={168} alt="no NFT found" />
				<h3 className="no-found-title">{t("nft-collection.notFound")}</h3>
				<p className="no-found-description">
					{t("nft-collection.didntFind")}
					<br />
					{t("nft-collection.some")}
				</p>
				<Row className="some-collection-wrapper">
					{contractsList.map((item) => (
						<Col xs={12} lg={4} key={item.code}>
							<div className="some-collection-card">
								<LazyLoadImage alt={item.code} height={120} width={120} src={CONTRACT_IMAGES_CONFIG[item.code]} threshold={100} className="some-collection-image" />
								<p className="some-collection-title">{item.title[language] || item.title.en}</p>
								<a href={item.marketplace_url} target="_blank" rel="noopener noreferrer" className="link-open-sea">
									{t("nft-collection.openSea")}
								</a>
								<a href={item.site_url} target="_blank" rel="noopener noreferrer" className="tree-dimensional-button btn-cyan w-100">
									<span className="button-text-wrapper">
										<span className="btn-text">{t("nft-collection.learnMore")}</span>
									</span>
								</a>
							</div>
						</Col>
					))}
				</Row>
			</Col>
		</Row>
	);
};

NoNftFound.propTypes = {
	contractsList: PropTypes.array.isRequired,
};

export default NoNftFound;
