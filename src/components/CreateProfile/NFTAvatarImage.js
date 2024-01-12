import React from "react";
import { Col } from "reactstrap";
import PropTypes from "prop-types";
import { LazyLoadImage } from "react-lazy-load-image-component";

import greenCheck from "../../assets/img/profile/check_green.svg";

const NftAvatarImage = ({ tokenId, selectAvatar, selectedAvatar, nftContractId, imagesUrl, isUsedAsAvatar }) => {
	const currentSelectId = `${nftContractId}_${tokenId}`;
	const isSelected = selectedAvatar === currentSelectId;

	const onClickHandler = () => {
		if (isUsedAsAvatar) {
			return false;
		}
		selectAvatar(isSelected ? null : { id: currentSelectId, pathToAvatar: `${imagesUrl}/transparent/${tokenId}.png` });
	};

	return (
		<Col key={tokenId} xs={6} lg={3} className="mb-4">
			<div className="nft-avatar-img-wrapper" onClick={onClickHandler}>
				<LazyLoadImage
					width={150}
					height={150}
					src={`${imagesUrl}/${tokenId}.png`}
					alt="nft-avatar"
					threshold={100}
					wrapperClassName="d-block"
					className={`nft-avatar-img ${!isUsedAsAvatar && isSelected ? "is-selected" : ""} ${isUsedAsAvatar ? "is-used-as-avatar" : ""}`}
				/>
				{!!isUsedAsAvatar && <img width={32} height={32} src={greenCheck} alt="green check" className="green-check" />}
			</div>
		</Col>
	);
};

NftAvatarImage.propTypes = {
	nftContractId: PropTypes.string.isRequired,
	tokenId: PropTypes.string.isRequired,
	imagesUrl: PropTypes.string.isRequired,
	isUsedAsAvatar: PropTypes.bool.isRequired,
	selectAvatar: PropTypes.func.isRequired,
	selectedAvatar: PropTypes.string.isRequired,
};

export default NftAvatarImage;
