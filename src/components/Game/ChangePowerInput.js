import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import { InputGroup, InputGroupAddon, Input, Button } from "reactstrap";
import PropTypes from "prop-types";
import validator from "validator";
import LazyLoad from "react-lazyload";
import getPrefixPower from "../../services/getPrefixPower";

class ChangePowerInput extends Component {
	static propTypes = {
		miningConfig: PropTypes.array.isRequired,
		stateMiningConfig: PropTypes.array.isRequired,
		userPower: PropTypes.string.isRequired,
		handlePowerChange: PropTypes.func.isRequired,
		t: PropTypes.func.isRequired,
	};

	handleInputChange = (currency, value) => {
		if (validator.isInt(value.toString(), { min: 0, max: 100 }) || value === "") {
			this.props.handlePowerChange(currency, +value);
		}
	};

	render() {
		const { t } = this.props;
		const userPower = this.props.userPower || 0;
		return this.props.miningConfig.map((config) => {
			const powerNumber = (userPower * config.percent) / 100;
			const powerString = `${getPrefixPower(powerNumber).power} ${getPrefixPower(powerNumber).hashDetail}`;
			return (
				<div key={config.name} className="change-power-item">
					<div>
						<img src={`/static/img/icon/currencies/${config.img}.svg?v=1.11`} height={40} width={40} alt={config.img} />
					</div>
					<div className="coin-info">
						<p className="coin-info-name">{config.fullName}</p>
						<p className="coin-info-power">{powerString}</p>
					</div>
					{config.currency !== "FREE" && (
						<div className="change-power-buttons-wrapper">
							<InputGroup>
								<InputGroupAddon addonType="prepend" className="change-power-buttons-item">
									<div>
										<Button
											className="tree-dimensional-button btn-default"
											onClick={() => {
												this.handleInputChange(config.currency, config.percent - 1);
											}}
										>
											<span>-</span>
										</Button>
									</div>
								</InputGroupAddon>
								<Input
									className={`change-power-input bg-${config.code}-color`}
									value={config.percent}
									onChange={(event) => {
										this.handleInputChange(config.currency, event.target.value);
									}}
								/>
								<InputGroupAddon addonType="append" className="change-power-buttons-item">
									<div>
										<Button
											className="tree-dimensional-button btn-default"
											onClick={() => {
												this.handleInputChange(config.currency, config.percent + 1);
											}}
										>
											<span>+</span>
										</Button>
									</div>
								</InputGroupAddon>
							</InputGroup>
						</div>
					)}
					{config.currency === "FREE" && (
						<div className="change-power-buttons-wrapper free-power">
							<InputGroup>
								<Input disabled className={`change-power-input bg-${config.code}-color`} value={config.percent} />
							</InputGroup>
						</div>
					)}
				</div>
			);
		});
	}
}

export default withTranslation("Game")(ChangePowerInput);
