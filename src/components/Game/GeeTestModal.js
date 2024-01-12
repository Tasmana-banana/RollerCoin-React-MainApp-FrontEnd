import React, { Component } from "react";
import { Modal, ModalBody, ModalHeader } from "reactstrap";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";

class GeeTestModal extends Component {
	static propTypes = {
		timeOverCB: PropTypes.func.isRequired,
		t: PropTypes.func.isRequired,
		solveTime: PropTypes.number.isRequired,
		captchaExpireDate: PropTypes.number.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			captchaReset: 0,
		};
		this.updateCaptchaTimer = null;
	}

	componentDidMount() {
		const { captchaExpireDate, solveTime } = this.props;
		let timeLeft = solveTime;
		const timeWithSolve = new Date().getTime() + solveTime;
		if (timeWithSolve > captchaExpireDate) {
			timeLeft = captchaExpireDate - new Date().getTime();
		}
		this.setState({ captchaReset: timeLeft });
	}

	componentWillUnmount() {
		if (this.updateCaptchaTimer) {
			clearInterval(this.updateCaptchaTimer);
		}
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevState.captchaReset > 0 && this.state.captchaReset <= 0 && this.updateCaptchaTimer) {
			this.props.timeOverCB();
		}
		if (prevState.captchaReset === 0 && this.state.captchaReset > 0) {
			this.timerInterval();
		}
	}

	timerInterval = () => {
		this.updateCaptchaTimer = setInterval(() => this.setState({ captchaReset: this.state.captchaReset - 1000 }), 1000);
	};

	render() {
		const { t } = this.props;
		const { captchaReset } = this.state;
		const timeLeft = Math.round(captchaReset / 1000);
		return (
			<Modal isOpen={true} className="captcha-window" centered={true}>
				<ModalHeader className="captcha-header">
					{t("captcha.enterCaptchaTitle")}
					{t("captcha.enterCaptchaTitleStrong")}
					{t("captcha.enterCaptchaTitleEnd")}
				</ModalHeader>
				<ModalBody className="captcha-body">
					<div id="geetest-block" className="d-flex justify-content-center text-center" />
					<div className="captcha-timer-container">
						<span className="time-left">{timeLeft}</span>
						{t("captcha.timeRemain")}
					</div>
				</ModalBody>
			</Modal>
		);
	}
}

export default withTranslation("Games")(GeeTestModal);
