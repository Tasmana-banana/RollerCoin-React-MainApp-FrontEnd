import React, { useState } from "react";
import { Card, CardBody, CardHeader, Collapse, Row } from "reactstrap";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import NFTAvatarImage from "./NFTAvatarImage";

import "../../assets/scss/CreateProfile/Accordion.scss";

import arrowUpIcon from "../../assets/img/createProfile/arrowUp.svg";
import arrowDownIcon from "../../assets/img/createProfile/arrowDown.svg";
import eightBiticonImg from "../../assets/img/profile/nft/contract_icons/8biticon.gif";

const CONTRACT_IMAGES_CONFIG = {
	"8biticon": eightBiticonImg,
};

const Accordion = ({ accordionItems, selectedAvatar, selectAvatar }) => {
	const { t } = useTranslation("Avatar");
	const [collapse, setCollapse] = useState();
	const language = useSelector((state) => state.game.language);

	const toggle = (id) => setCollapse(collapse === id ? null : id);

	return (
		<div className="accordion-wrapper mt-4">
			{accordionItems.map(({ nft_contracts_id: nftContractId, title, code, images_url: imagesUrl, user_tokens: userTokens }) => (
				<Card key={nftContractId}>
					<CardHeader onClick={() => toggle(nftContractId)}>
						<div className="token-preview">
							<div className="d-flex">
								<div className="mr-3">
									<img className="nft-service-cover" src={CONTRACT_IMAGES_CONFIG[code]} alt="Nft service avatar" />
								</div>
								<div className="nft-info-wrapper">
									<p className="nft-service-name">{title[language]}</p>
									<p className="item-count">
										{userTokens.length} {t("items")}
									</p>
								</div>
							</div>
							<div>
								<img src={collapse === nftContractId ? arrowUpIcon : arrowDownIcon} alt="toggle" />
							</div>
						</div>
					</CardHeader>
					<Collapse isOpen={collapse === nftContractId} className="card-content">
						<CardBody>
							<Row>
								{userTokens.map(({ token_id: tokenId, is_used_as_avatar: isUsedAsAvatar }) => (
									<NFTAvatarImage
										key={tokenId}
										imagesUrl={imagesUrl}
										isUsedAsAvatar={isUsedAsAvatar}
										nftContractId={nftContractId}
										selectAvatar={selectAvatar}
										selectedAvatar={selectedAvatar}
										tokenId={tokenId}
									/>
								))}
							</Row>
						</CardBody>
					</Collapse>
				</Card>
			))}
		</div>
	);
};

Accordion.propTypes = {
	accordionItems: PropTypes.array.isRequired,
	selectedAvatar: PropTypes.string.isRequired,
	selectAvatar: PropTypes.func.isRequired,
};

export default Accordion;
