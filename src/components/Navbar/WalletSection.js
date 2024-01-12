import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import Select from "react-select";
import { ReactSelectOption, ReactSelectValue } from "./ReactSelectOption";
import FormattedCurrencyOutput from "../SingleComponents/FormattedCurrencyOutput";
import RollerButton from "../SingleComponents/RollerButton";
import * as actionsUser from "../../actions/userInfo";
import decimalAdjust from "../../services/decimalAdjust";
import getLanguagePrefix from "../../services/getLanguagePrefix";
import fetchWithToken from "../../services/fetchWithToken";

import "../../assets/scss/Navbar/WalletSection.scss";
import walletIcon from "../../assets/img/header/wallet.svg";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	balance: state.game.balance,
	rollerCurrencies: state.wallet.rollerCurrencies,
	pathName: state.router.location.pathname,
	miningConfig: state.user.miningConfig,
	currentMiningCurrency: state.user.currentMiningCurrency,
	language: state.game.language,
});

// Map Redux actions to component props
const mapDispatchToProps = (dispatch) => ({
	setMiningConfig: (state) => dispatch(actionsUser.setMiningConfig(state)),
	setCurrentMiningCurrency: (state) => dispatch(actionsUser.setCurrentMiningCurrency(state)),
});

class WalletSectionClass extends Component {
	static propTypes = {
		pathName: PropTypes.string.isRequired,
		currentMiningCurrency: PropTypes.string.isRequired,
		balance: PropTypes.object.isRequired,
		rollerCurrencies: PropTypes.object.isRequired,
		setMiningConfig: PropTypes.func.isRequired,
		setCurrentMiningCurrency: PropTypes.func.isRequired,
		miningConfig: PropTypes.array.isRequired,
		language: PropTypes.string.isRequired,
		isRedDotNotify: PropTypes.bool.isRequired,
	};

	constructor(props) {
		super(props);
		this.controller = new AbortController();
		this.signal = this.controller.signal;
		this.state = {
			selectedMiningSettings: null,
			errorOnFetch: false,
		};
	}

	componentDidMount() {
		this.getSettings();
	}

	componentWillUnmount() {
		if (this.controller) {
			this.controller.abort();
		}
	}

	createSignalAndController = () => {
		if (this.controller) {
			this.controller.abort();
		}
		this.controller = new AbortController();
		this.signal = this.controller.signal;
	};

	getSettings = async () => {
		try {
			this.createSignalAndController();
			const json = await fetchWithToken("/api/mining/user-settings", {
				method: "GET",
				signal: this.signal,
			});
			if (!json.success) {
				return false;
			}
			this.props.setMiningConfig(json.data);
		} catch (e) {
			console.error(e);
		}
	};

	prepareSelectOptions = () => {
		return this.props.rollerCurrencies.map((currency) => {
			const balance = this.props.balance[currency.code];
			const label = decimalAdjust(balance / currency.toSmall, currency.precisionToBalance).toFixed(currency.precisionToBalance);
			return {
				label: <FormattedCurrencyOutput amount={label} precision={currency.precision} precisionToBalance={currency.precisionToBalance} />,
				value: currency.balanceKey,
				icon: currency.img,
				isDisabled: !this.props.miningConfig.some((item) => item.currency === currency.balanceKey),
			};
		});
	};

	getSelectedCurrency = () => {
		const { currentMiningCurrency } = this.props;
		const selectOptions = this.prepareSelectOptions();
		return selectOptions.find((item) => item.value === currentMiningCurrency);
	};

	setSelectedCurrency = (data) => {
		this.props.setCurrentMiningCurrency(data.value);
		localStorage.setItem("current_mining_currency", data.value);
	};

	render() {
		const { language, isRedDotNotify } = this.props;
		const selectOptions = this.prepareSelectOptions();
		return (
			<div className="wallet-info-container">
				<div className="wallet-link">
					<Link to={`${getLanguagePrefix(language)}/wallet`}>
						<RollerButton className="control-button" icon={walletIcon} disabled={this.props.pathName.includes("/wallet")} redDot={isRedDotNotify} />
					</Link>
				</div>
				<div className="total-balance">
					<Select
						className="rollercoin-select-container w-100"
						classNamePrefix="rollercoin-select"
						onChange={this.setSelectedCurrency}
						options={selectOptions}
						value={this.getSelectedCurrency()}
						isClearable={false}
						isSearchable={false}
						components={{ Option: ReactSelectOption, ValueContainer: ReactSelectValue }}
					/>
				</div>
			</div>
		);
	}
}
const WalletSection = connect(mapStateToProps, mapDispatchToProps)(WalletSectionClass);

export default WalletSection;
