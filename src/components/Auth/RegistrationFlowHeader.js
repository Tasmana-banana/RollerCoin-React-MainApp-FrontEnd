import React, { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import { useDispatch } from "react-redux";
import { Container } from "reactstrap";
import * as actionsUser from "../../actions/userInfo";
import * as actions from "../../actions/game";
import fetchWithToken from "../../services/fetchWithToken";

import "../../assets/scss/Auth/RegistrationFlowHeader.scss";

import logoImg from "../../assets/img/icon/hamster.svg";
import rollerLogo from "../../assets/img/autorize/roller_logo.png";

function CloseButtonComponent() {
	return <img src="/static/img/icon/toast_close.svg" alt="toast_close" className="close-toast" />;
}
const RegistrationFlowHeader = () => {
	const dispatch = useDispatch();
	const signals = {};
	const controllers = {};

	useEffect(() => {
		dispatch(actionsUser.setIsSessionSocketChecked(true));
		dispatch(actionsUser.setIsSessionNodeChecked(true));
		checkAndSetIsMobile();
		getPixel();
	}, []);

	useEffect(() => {
		Object.keys(controllers).forEach((key) => {
			if (controllers[key]) {
				controllers[key].abort();
			}
		});
	}, []);

	const checkAndSetIsMobile = () => dispatch(actions.setIsMobile(window.screen.width < 992));

	const createSignalAndController = (id) => {
		if (controllers[id]) {
			controllers[id].abort();
		}
		controllers[id] = new AbortController();
		signals[id] = controllers[id].signal;
	};

	const getPixel = async () => {
		createSignalAndController("getPixel");
		try {
			await fetchWithToken("/api/common/get-pixel", {
				method: "GET",
				signal: signals.getPixel,
			});
		} catch (e) {
			console.error(e);
		}
	};

	return (
		<header className="registration-header">
			<Container fluid={true} className="registration-header-container container">
				<div className="logo-block">
					<div>
						<img src={logoImg} className="hamster-logo-icon mb-1" alt="Hamster logo icon" width="54" height="38" />
					</div>
					<div className="logo-text">
						<img src={rollerLogo} alt="Rollercoin logo icon" width="210" height="25" />
					</div>
				</div>
			</Container>

			<ToastContainer
				position="top-left"
				autoClose={3000}
				hideProgressBar
				newestOnTop={false}
				closeOnClick
				rtl={false}
				pauseOnVisibilityChange
				draggable
				pauseOnHover
				closeButton={<CloseButtonComponent />}
			/>
		</header>
	);
};

export default RegistrationFlowHeader;
