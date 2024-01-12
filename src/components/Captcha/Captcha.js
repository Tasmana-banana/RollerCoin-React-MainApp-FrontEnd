import React from "react";
import { Modal, ModalBody } from "reactstrap";
import ReactCaptchaBtn from "@bmlabs/react-captcha";
import PropTypes from "prop-types";

import "../../assets/scss/Captcha/Captcha.scss";

const Captcha = ({ isOpen, toggle, width, height, maxDots, onSuccess, onFail, challenge }) => {
	return (
		<Modal isOpen={isOpen} toggle={toggle} centered={true} className="captcha-modal">
			<ModalBody className="captcha-body">
				<h2 className="title">Please confirm the action</h2>
				<ReactCaptchaBtn captchaEndPoint={process.env.CAPTCHA_URL} challenge={challenge} width={width} height={height} maxDots={maxDots} onSuccess={onSuccess} onFail={onFail} />
			</ModalBody>
		</Modal>
	);
};

Captcha.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	toggle: PropTypes.func.isRequired,
	width: PropTypes.string.isRequired,
	height: PropTypes.string.isRequired,
	maxDots: PropTypes.number.isRequired,
	challenge: PropTypes.string.isRequired,
	onSuccess: PropTypes.func.isRequired,
	onFail: PropTypes.func.isRequired,
};

export default Captcha;
