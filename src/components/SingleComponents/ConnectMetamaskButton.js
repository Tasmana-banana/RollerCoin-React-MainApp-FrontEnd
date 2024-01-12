import React from "react";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import web3Instance from "../../services/web3Instance";
import * as actionsUser from "../../actions/userInfo";

import metamaskIcon from "../../assets/img/wallet/metamask.svg";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	isAuthorizedMetaMask: state.user.isAuthorizedMetaMask,
});
// Map Redux actions to component props
const mapDispatchToProps = (dispatch) => ({
	setIsAuthorizedMetaMask: (state) => dispatch(actionsUser.setIsAuthorizedMetaMask(state)),
});

const TOAST_CONFIG = {
	position: "top-left",
	autoClose: 3000,
	hideProgressBar: true,
	closeOnClick: true,
	pauseOnHover: true,
	draggable: true,
};

const ConnectMetamaskButton = ({ fluid, setIsAuthorizedMetaMask, additionalClass = "" }) => {
	const { t } = useTranslation("Profile");
	const renderToast = (text, icon) => (
		<div className="content-with-image">
			<img src={`/static/img/icon/${icon}.svg`} alt={icon} />
			<span>{text}</span>
		</div>
	);
	const connectMetaMaskPublicAddress = async () => {
		const { connectPublicAddress } = web3Instance;
		const loginResult = await connectPublicAddress(setIsAuthorizedMetaMask);
		if (!loginResult.success) {
			return toast(renderToast(loginResult.error || t("nft-collection.errorTryAgain"), "error_notice"), TOAST_CONFIG);
		}
		toast(renderToast(t("nft-collection.connectedSuccessfully"), "success_notice"), TOAST_CONFIG);
	};
	return (
		<button type="button" className={`tree-dimensional-button btn-default${fluid ? " w-100" : ""} ${additionalClass}`} onClick={connectMetaMaskPublicAddress}>
			<span className="with-horizontal-image">
				<span className="btn-icon">
					<img className="btn-icon" src={metamaskIcon} width={24} height={24} alt="metamask" />
				</span>
				<span className="btn-text">{t("nft-collection.connectMeta")}</span>
			</span>
		</button>
	);
};
ConnectMetamaskButton.propTypes = {
	isMobile: PropTypes.bool.isRequired,
	setIsAuthorizedMetaMask: PropTypes.func.isRequired,
	fluid: PropTypes.bool,
	additionalClass: PropTypes.string,
};
export default connect(mapStateToProps, mapDispatchToProps)(ConnectMetamaskButton);
