import React from "react";
import PropTypes from "prop-types";
import Spritesheet from "react-responsive-spritesheet";
import { ANIMATION_TYPE } from "../../../constants/SystemSaleEvent";

import "../../../assets/scss/SystemSaleEvent/SpecialAnimationBlock.scss";

const animationConstructor = (animationType, files, animationSettings) => {
	const animationConfig = {
		[ANIMATION_TYPE.START_BURN]: {
			url: files.start_burn,
			steps: animationSettings.start_burn.steps,
			fps: animationSettings.start_burn.fps,
		},
		[ANIMATION_TYPE.CLAIM_REWARD]: {
			url: files.claim_reward,
			steps: animationSettings.claim_reward.steps,
			fps: animationSettings.claim_reward.fps,
		},
	};

	return animationConfig[animationType];
};

const SpecialAnimationBlock = ({ isAnimationComplete, animationType, animationSettings, handleCompleteAnimation, eventFiles, imgVer = 1 }) => {
	const animation = animationConstructor(animationType, eventFiles, animationSettings);

	return (
		<div className="special-animation-wrapper">
			{!isAnimationComplete && animation?.url && (
				<Spritesheet
					className="lootbox-sprite"
					image={`${animation.url}?v=${imgVer}`}
					widthFrame={86}
					heightFrame={56}
					steps={animation.steps}
					fps={animation.fps}
					isResponsive={true}
					loop={false}
					onPause={handleCompleteAnimation}
					autoplay={true}
					direction={animation.reverse ? "rewind" : "forward"}
				/>
			)}
			{isAnimationComplete && eventFiles && (
				<img src={`${animationType === ANIMATION_TYPE.COMPLETE_BURN ? eventFiles.complete_burn : eventFiles.burn_in_progress}?v=${imgVer}`} width="100%" alt="" />
			)}
		</div>
	);
};

SpecialAnimationBlock.propTypes = {
	animationType: PropTypes.string.isRequired,
	handleCompleteAnimation: PropTypes.func.isRequired,
	isAnimationComplete: PropTypes.bool.isRequired,
	eventFiles: PropTypes.object.isRequired,
	animationSettings: PropTypes.object.isRequired,
	imgVer: PropTypes.number.isRequired,
};

export default SpecialAnimationBlock;
