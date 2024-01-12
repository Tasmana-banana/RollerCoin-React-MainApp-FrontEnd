import React from "react";
import { Modal, ModalBody } from "reactstrap";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import * as actions from "../../actions/wallet";
// Map Redux state to component props
const mapStateToProps = (state) => ({
	showWithdrawalModal: state.wallet.showWithdrawalModal,
	selectedCurrency: state.wallet.selectedCurrency,
});
// Map Redux actions to component props
const mapDispatchToProps = (dispatch) => ({
	setShowWithdrawalModal: (state) => dispatch(actions.setShowWithdrawalModal(state)),
});
class WithdrawalModalClass extends React.Component {
	static propTypes = {
		showWithdrawalModal: PropTypes.bool.isRequired,
		success: PropTypes.bool.isRequired,
		messageCode: PropTypes.string.isRequired,
		selectedCurrency: PropTypes.object.isRequired,
		setShowWithdrawalModal: PropTypes.func.isRequired,
		t: PropTypes.func.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			modal: true,
		};
	}

	toggle = () => {
		this.props.setShowWithdrawalModal(!this.props.showWithdrawalModal);
	};

	hide = () => {
		this.props.setShowWithdrawalModal(false);
	};

	getText = () => {
		const { t } = this.props;
		const messageCodeToText = {
			"ERR:WITHDRAWAL:MIN:AMOUNT": `${t("minimumSumWithdrawal")} ${this.props.selectedCurrency.min} ${this.props.selectedCurrency.name}.`,
			"ERR:CONNECTION:UNAVAILABLE": t("connectionUnavailable"),
			"ERR:INVALID:ADDRESS": t("walletNotCorrect"),
			"ERR:BALANCE:FETCH": t("tryLater"),
			"ERR:BALANCE:LOW": t("balanceLow"),
			"ERR:WITHDRAWAL:STORE": t("tryLater"),
			MAIL_SENT: t("confirmation"),
		};
		return messageCodeToText[this.props.messageCode] || t("unexpectedError");
	};

	render() {
		const { showWithdrawalModal, success, messageCode, t } = this.props;
		return (
			<div>
				<Modal isOpen={showWithdrawalModal} toggle={this.toggle} centered={true} className="roller-modal">
					<ModalBody>
						<p className={`${!success ? "text-danger" : ""} mgb-0 result-query-text`}>
							{success && messageCode.length === 0 && (
								<span>
									{t("accepted")}
									<br /> {t("processed")}
								</span>
							)}
							{messageCode.length > 0 && `${this.getText()}`}
						</p>
						<div className="tree-dimensional-button btn-default w-100 mt-2" onClick={this.toggle}>
							<span>{t("close")}</span>
						</div>
					</ModalBody>
				</Modal>
			</div>
		);
	}
}
const WithdrawalModal = withTranslation("Wallet")(connect(mapStateToProps, mapDispatchToProps)(WithdrawalModalClass));
export default WithdrawalModal;
