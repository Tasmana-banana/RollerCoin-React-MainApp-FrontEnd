import React from "react";
import { withTranslation } from "react-i18next";
import { Col } from "reactstrap";
import PropTypes from "prop-types";
import { LazyLoadImage } from "react-lazy-load-image-component";
import getPrefixPower from "../../services/getPrefixPower";

const PartitionCoinsValue = (props) => {
	return props.miningConfig.map((currency) => {
		const userPower = (props.userPower * currency.percent) / 100;
		const powerString = `${getPrefixPower(userPower).power} ${getPrefixPower(userPower).hashDetail}`;
		return (
			<Col key={currency.name} lg={4}>
				<div className="partition-coins-item">
					<LazyLoadImage src={`/static/img/icon/currencies/${currency.img}.svg?v=1.11`} height={24} width={24} alt={currency.code} />
					<div className="partition-coins-info">
						<p className="partition-coins-name">{currency.name}</p>
						<p className="partition-coins-value">{powerString}</p>
					</div>
				</div>
			</Col>
		);
	});
};
PartitionCoinsValue.propTypes = {
	miningConfig: PropTypes.array.isRequired,
	userPower: PropTypes.string.isRequired,
	t: PropTypes.func.isRequired,
};
export default withTranslation("Game")(PartitionCoinsValue);
