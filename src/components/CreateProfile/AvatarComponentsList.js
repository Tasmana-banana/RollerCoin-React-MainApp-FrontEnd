import React, { useState } from "react";
import { Nav, TabContent } from "reactstrap";
import PropTypes from "prop-types";
import ComponentTab from "./ComponentTab";
import ComponentNav from "./ComponentNav";

import "../../assets/scss/CreateProfile/AvatarComponentsList.scss";

import faceIconImg from "../../assets/img/createProfile/face.svg";
import clothesIconImg from "../../assets/img/createProfile/clothes.svg";
import mouthIconImg from "../../assets/img/createProfile/mouth.svg";
import hairIconImg from "../../assets/img/createProfile/hair.svg";
import eyesIconImg from "../../assets/img/createProfile/eyes.svg";

const componentsList = [
	{
		type: "face",
		image: faceIconImg,
	},
	{
		type: "clothes",
		image: clothesIconImg,
	},
	{
		type: "mouth",
		image: mouthIconImg,
	},
	{
		type: "hair",
		image: hairIconImg,
	},
	{
		type: "eyes",
		image: eyesIconImg,
	},
];

const AvatarComponentsList = ({ avatarComponents, avatarConfig, updateAvatarConfig, gender }) => {
	const [active, setActive] = useState(componentsList[0].type);

	if (!avatarConfig) {
		return false;
	}

	return (
		<div className="avatar-components-list-wrapper">
			<Nav tabs>
				{componentsList.map(({ type, image }) => (
					<ComponentNav key={type} isActive={type === active} image={image} type={type} setActive={setActive} />
				))}
			</Nav>
			<TabContent activeTab={active}>
				{componentsList.map(({ type }) => (
					<ComponentTab
						key={type}
						type={type}
						gender={gender}
						currentTypeComponents={avatarComponents[type]}
						codeInAvatarConfig={avatarConfig[type]}
						updateAvatarConfig={updateAvatarConfig}
					/>
				))}
			</TabContent>
		</div>
	);
};

AvatarComponentsList.propTypes = {
	avatarConfig: PropTypes.object.isRequired,
	avatarComponents: PropTypes.object.isRequired,
	updateAvatarConfig: PropTypes.func.isRequired,
	gender: PropTypes.string.isRequired,
};

export default AvatarComponentsList;
