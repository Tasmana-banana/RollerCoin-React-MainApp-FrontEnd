import React, { Component } from "react";
import { Helmet } from "react-helmet";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { Row, Col, Input, Label, FormGroup, InputGroupAddon, InputGroup, InputGroupText } from "reactstrap";
import WAValidator from "multicoin-address-validator";
import FadeAnimation from "../Animations/FadeAnimation";
import CheckWithdrawModal from "./CheckWithdrawModal";
import decimalAdjust from "../../services/decimalAdjust";
import "react-datepicker/dist/react-datepicker.css";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	balance: state.game.balance,
	selectedCurrency: state.wallet.selectedCurrency,
	address: state.wallet.address,
});

class WithdrawClass extends Component {
	static propTypes = {
		balance: PropTypes.number.isRequired,
		selectedCurrency: PropTypes.object.isRequired,
		wsReact: PropTypes.object.isRequired,
		address: PropTypes.object.isRequired,
		t: PropTypes.func.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			showCheckModal: false,
			formValid: false,
			errors: {
				amountMin: false,
				amountMax: false,
				address: false,
			},
			form: {
				wallet_address: "",
				addressConfirmed: false,
				amount: 0,
			},
		};
	}

	componentDidUpdate(prevProps, prevStates) {
		if (JSON.stringify(prevStates.form) !== JSON.stringify(this.state.form)) {
			this.checkFormValid();
		}
	}

	showCheckWithDrawModal = (e) => {
		e.preventDefault();
		this.setState({ showCheckModal: true });
	};

	confirmWithdrawModal = (confirmed) => {
		this.setState({ showCheckModal: false });
		if (confirmed) {
			this.createWithdraw();
		}
	};

	createWithdraw = () => {
		const { selectedCurrency, wsReact } = this.props;
		const { form } = this.state;
		wsReact.send(
			JSON.stringify({
				cmd: "withdrawal_create_request",
				cmdval: JSON.stringify({
					wallet_address: form.wallet_address,
					amount: Math.round(+(form.amount * selectedCurrency.toSmall * selectedCurrency.divider)),
					currency: selectedCurrency.balanceKey,
				}),
			})
		);
	};

	setAddress = ({ target }) => {
		const { selectedCurrency, address } = this.props;
		const clearValue = target.value.replace(/ /g, "");
		this.setState({
			form: { ...this.state.form, wallet_address: clearValue, addressConfirmed: false },
			errors: {
				...this.state.errors,
				address: address[selectedCurrency.code] === target.value ? true : !WAValidator.validate(clearValue, selectedCurrency.validationName, process.env.WALLET_ADDRESS_VALIDATOR),
			},
		});
	};

	setAmount = ({ target }) => {
		const { selectedCurrency, balance } = this.props;
		const value = target.value.replace(/^(\d{0,8}\.\d{0,8}|\d{0,9}|\.\d{0,8}).*/, "$1");
		const isValueHaveNotDotAfterZero = `${value}`.charAt(0) === "0" && `${value}`.charAt(1) && `${value}`.charAt(1) !== ".";
		if (isValueHaveNotDotAfterZero) {
			return null;
		}
		this.setState({
			form: { ...this.state.form, ...{ amount: value } },
			errors: {
				...this.state.errors,
				...{
					amountMin: value < selectedCurrency.min,
					amountMax: value > balance[selectedCurrency.code] / +selectedCurrency.toSmall,
				},
			},
		});
	};

	setAddressConfirmed = ({ target }) => {
		this.setState({
			form: { ...this.state.form, ...{ addressConfirmed: target.checked } },
		});
	};

	checkFormValid = () => {
		this.setState({
			formValid: Object.values(this.state.errors).every((value) => value === false) && this.state.form.addressConfirmed,
		});
	};

	render() {
		const { balance, selectedCurrency, t } = this.props;
		const { form, errors, showCheckModal, formValid } = this.state;
		const withdrawDisabled = balance[selectedCurrency.code] < selectedCurrency.min * selectedCurrency.toSmall;
		return (
			<FadeAnimation>
				<div className="currency-operations-content withdraw-block">
					<Helmet>
						<title>{t("withdrawalTitle")}</title>
					</Helmet>
					<form action="" id="withdraw-form" className="withdraw-form" onSubmit={this.showCheckWithDrawModal}>
						<Row noGutters={true}>
							<Col xs="12" lg="6" className="pdr-lg-10 mgb-16">
								<FormGroup>
									<Label for="wallet-address">{t("walletAddress")}</Label>
									<Input type="text" className="roller-input-text" id="wallet-address" value={form.wallet_address} onChange={this.setAddress} disabled={withdrawDisabled} />
									<p className="danger-text not-valid-address-error error-text" hidden={!errors.address}>
										{t("errorAddress")}
									</p>
									<p className="danger-text not-have-money-error error-text" hidden={!withdrawDisabled}>
										{t("youNeed")} <span className="min-sum">{selectedCurrency.min}</span> {selectedCurrency.name} {t("makeWithdraw")}
										<br />
										{t("keepPlaying")} {selectedCurrency.name}.
									</p>
								</FormGroup>
								<FormGroup check>
									<Input
										className="roller-checkbox"
										type="checkbox"
										id="confirmWithdraw"
										checked={form.addressConfirmed}
										onChange={this.setAddressConfirmed}
										disabled={errors.address || withdrawDisabled}
									/>
									<Label for="confirmWithdraw" className="form-check-label small-text">
										{t("confirm")}
									</Label>
								</FormGroup>
							</Col>
							<Col xs="12" lg="6" className="pdl-lg-10 mgb-16">
								<FormGroup>
									<Label for="amount">
										{t("amount")} ({selectedCurrency.name})
									</Label>
									<InputGroup className="roller-input-group">
										<Input
											type="text"
											className="roller-input-text amount-input"
											id="amount"
											value={form.amount}
											onChange={this.setAmount}
											disabled={errors.address || !form.addressConfirmed}
										/>
										<InputGroupAddon addonType="prepend">
											<InputGroupText>
												<img src={`/static/img/wallet/${selectedCurrency.img}.svg?v=1.13`} alt="ico" width="23" height="23" className="replace-currency-img" />
											</InputGroupText>
										</InputGroupAddon>
									</InputGroup>
									<p className="danger-text min-sum-error error-text" hidden={!errors.amountMin}>
										{t("minSum")} <span className="min-sum">{selectedCurrency.min}</span> {selectedCurrency.name}
									</p>
									<p className="danger-text max-sum-error error-text" hidden={!errors.amountMax}>
										{t("maxSum")} {decimalAdjust(balance[selectedCurrency.code] / selectedCurrency.toSmall).toFixed(selectedCurrency.precision)} {selectedCurrency.name}
									</p>
									<p className="small-text light-gray-text mt-2">
										<span>{t("minWithdrawal")}:</span>
										<span className="white-text ml-2">
											{selectedCurrency.min} {selectedCurrency.name}
										</span>
									</p>
								</FormGroup>
							</Col>
							<Col xs="12" lg={{ size: 6, offset: 3 }}>
								<div className="btn-submit">
									<button type="submit" className="tree-dimensional-button btn-cyan w-100" disabled={!formValid}>
										<span>{t("withdrawButton")}</span>
									</button>
								</div>
							</Col>
							<Col xs={12}>
								<div className="text-center">
									<p className="processed-text small-text light-gray-text">{t("withdrawDelay")}</p>
									<p className="small-text light-gray-text">
										<span className="fee-text">{t("transactionFee")}:</span>
										{selectedCurrency.isUserFeeEnabled && <span className="white-text bold-text">{selectedCurrency.network} network fee</span>}
										{!selectedCurrency.isUserFeeEnabled && <span className="cyan-text bold-text">{t("free")}</span>}
									</p>
								</div>
							</Col>
						</Row>
					</form>
				</div>
				<CheckWithdrawModal
					showModal={showCheckModal}
					onConfirm={this.confirmWithdrawModal}
					info={{ currency: selectedCurrency.name, network: selectedCurrency.network, hasFee: selectedCurrency.isUserFeeEnabled, address: form.wallet_address, amount: form.amount }}
				></CheckWithdrawModal>
			</FadeAnimation>
		);
	}
}
const Withdraw = withTranslation("Wallet")(connect(mapStateToProps, null)(WithdrawClass));
export default Withdraw;
