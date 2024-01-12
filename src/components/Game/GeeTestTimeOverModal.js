import React from "react";
import { Modal, ModalBody } from "reactstrap";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import moment from "moment";

import captchaExpireImg from "../../assets/img/chooseGame/captcha_expire.png";

const GeeTestTimeOverModal = ({ close, t, unbanTime }) => {
	const formattedUnbanTime = moment(unbanTime)
		.utc()
		.format("YYYY-MM-DD HH:mm");
	return (
		<Modal isOpen={true} className="captcha-window" centered={true}>
			<ModalBody className="captcha-body captcha-expire-body">
				<div className="captcha-expire-close">
					<button className="tree-dimensional-button close-menu-btn btn-default" onClick={close}>
						<span>
							<img src="/static/img/header/close_menu.svg" alt="close_menu" />
						</span>
					</button>
				</div>
				<div className="captcha-expire-image">
					<img src={captchaExpireImg} width={216} height={198} alt="captcha_expire" />
				</div>
				<p>{t("captcha.limit")}</p>
				<p>
					{t("captcha.unbanTime")}
					<span className="captcha-expire-text-danger">{formattedUnbanTime}</span>
					{t("captcha.utc")}
				</p>
			</ModalBody>
		</Modal>
	);
};

GeeTestTimeOverModal.propTypes = {
	close: PropTypes.func.isRequired,
	t: PropTypes.func.isRequired,
	unbanTime: PropTypes.number.isRequired,
};
export default withTranslation("Games")(GeeTestTimeOverModal);
