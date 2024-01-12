import React, { Component } from "react";
import connect from "react-redux/es/connect/connect";
import { Modal, ModalBody, ModalHeader } from "reactstrap";
import PropTypes from "prop-types";
import fetchWithToken from "../../services/fetchWithToken";
import encryptData from "../../services/encryptData";
import renderCaptchaV2 from "../../services/renderCaptchaV2";
import * as actions from "../../actions/game";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	captcha: state.game.captcha,
	uid: state.user.uid,
});

// Map Redux actions to component props
const mapDispatchToProps = (dispatch) => ({
	setCaptcha: (state) => dispatch(actions.setCaptcha(state)),
});

class RecaptchaModalWSClass extends Component {
	constructor(props) {
		super(props);
		this.state = { isMounted: false };
		this.controller = new AbortController();
		this.signal = this.controller.signal;
	}

	componentDidUpdate(prevProps) {
		if (prevProps.captcha.isCaptchaValid && !this.props.captcha.isCaptchaValid && window.grecaptcha) {
			window.grecaptcha.reset();
		}
	}

	componentDidMount() {
		renderCaptchaV2(this.checkSolvedCaptcha);
	}

	componentWillUnmount() {
		if (this.controller) {
			this.controller.abort();
		}
	}

	checkSolvedCaptcha = async (solvedCaptcha) => {
		const { uid, captcha } = this.props;
		const sendData = { verify_token: solvedCaptcha, user_game_id: captcha.userGameId };
		try {
			this.createSignalAndController();
			const encryptedData = encryptData(sendData, uid);
			const encodedResult = await fetchWithToken(`/api/game/encode-data/${uid}`, {
				method: "POST",
				signal: this.signal,
				body: JSON.stringify({ data: encryptedData }),
			});
			if (!encodedResult.success) {
				throw new Error("Data can't be encoded");
			}
			this.props.setCaptcha({ isCaptchaValid: true });
			this.props.wsReact.send(
				JSON.stringify({
					cmd: "verify_captcha_request",
					cmdval: encodedResult.data,
				})
			);
		} catch (e) {
			console.error(e);
		}
	};

	createSignalAndController = () => {
		if (this.controller) {
			this.controller.abort();
		}
		this.controller = new AbortController();
		this.signal = this.controller.signal;
	};

	render() {
		return (
			<Modal isOpen={true} className="captcha-window" centered={true}>
				<ModalHeader className="captcha-header">Prove you’re not a robot!</ModalHeader>
				<ModalBody className="captcha-body">
					<div id="google-block" className="d-flex justify-content-center text-center" />
				</ModalBody>
			</Modal>
		);
	}
}

RecaptchaModalWSClass.propTypes = {
	wsReact: PropTypes.object.isRequired,
	captcha: PropTypes.object.isRequired,
	setCaptcha: PropTypes.func.isRequired,
	uid: PropTypes.string.isRequired,
};

const RecaptchaModalWS = connect(mapStateToProps, mapDispatchToProps)(RecaptchaModalWSClass);

export default RecaptchaModalWS;
