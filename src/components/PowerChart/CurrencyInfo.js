import React, { Component } from "react";
import { connect } from "react-redux";
import { Col, Row } from "reactstrap";
import PropTypes from "prop-types";
import * as actions from "../../actions/userInfo";
import getPrefixPower from "../../services/getPrefixPower";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	poolsPower: state.game.poolsPower,
});

// Map Redux actions to component props
const mapDispatchToProps = (dispatch) => ({
	togglePartitionModal: (state) => dispatch(actions.togglePartitionModal(state)),
});

class CurrencyInfoClass extends Component {
	static propTypes = {
		togglePartitionModal: PropTypes.func.isRequired,
		sequenceId: PropTypes.number.isRequired,
		activeUsers: PropTypes.number.isRequired,
		poolsPower: PropTypes.array.isRequired,
		currentCurrencyConfig: PropTypes.object.isRequired,
	};

	render() {
		const { sequenceId, activeUsers, poolsPower, currentCurrencyConfig } = this.props;
		const pool = poolsPower.find((item) => item.currency === currentCurrencyConfig.balanceKey);
		return pool ? (
			<Col xs={12} lg={6} className="currency-info-wrapper">
				<div className="currency-info-border">
					<p className="currency-info-title">
						<img src={`/static/img/icon/currencies/${currentCurrencyConfig.code}.svg?v=1.11`} alt={currentCurrencyConfig.code} />
						<span className="currency-name">{currentCurrencyConfig.name}</span> network power
					</p>
					<p className="currency-info-power">{`${getPrefixPower(pool.power).power} ${getPrefixPower(pool.power).hashDetail}`}</p>
					<Row noGutters={true} className="currency-info-active-wrapper">
						<Col xs={6} className="currency-info-active">
							<p className="currency-info-name">Active users</p>
							<p className="currency-info-value">{activeUsers || 0}</p>
						</Col>
						<Col xs={6} className="currency-info-active">
							<p className="currency-info-name">Block number</p>
							<p className="currency-info-value">{sequenceId || 0}</p>
						</Col>
					</Row>
				</div>
			</Col>
		) : (
			""
		);
	}
}
const CurrencyInfo = connect(mapStateToProps, mapDispatchToProps)(CurrencyInfoClass);

export default CurrencyInfo;
