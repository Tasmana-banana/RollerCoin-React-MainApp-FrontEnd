import React, { Component } from "react";
import PropTypes from "prop-types";
import LazyLoad from "react-lazyload";
import { Row, Col } from "reactstrap";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import { initTimer, makeCounterData } from "../../services/countdownТimer";
import MarketDailyOfferProductCard from "./MarketDailyOfferProductCard";

import clockIcon from "../../assets/img/market/clock.svg";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	balance: state.game.balance,
	isMobile: state.game.isMobile,
	language: state.game.language,
});

class MarketDailyOfferClass extends Component {
	static propTypes = {
		balance: PropTypes.number.isRequired,
		promotion: PropTypes.object.isRequired,
		toggleActiveProduct: PropTypes.func.isRequired,
		activeProductId: PropTypes.string.isRequired,
		buyAction: PropTypes.func.isRequired,
		wsReact: PropTypes.object.isRequired,
		language: PropTypes.string.isRequired,
		isMobile: PropTypes.bool.isRequired,
		t: PropTypes.func.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			timeLeftSeconds: 0,
			viewTime: {
				days: "",
				hours: "00h",
				minutes: "00m",
			},
		};
	}

	componentDidMount() {
		this.initialization();
	}

	initialization = async () => {
		this.setState({
			timeLeftSeconds: initTimer(this.props.promotion.to),
		});
		this.timer = setInterval(() => {
			const time = makeCounterData(this.state.timeLeftSeconds);
			this.setState({
				viewTime: {
					days: time.days,
					hours: time.hours,
					minutes: time.minutes,
				},
				timeLeftSeconds: time.leftSeconds,
			});
		}, 1000);
	};

	componentDidUpdate(prevProps, prevState) {
		const { timeLeftSeconds } = this.state;
		if (this.timer && prevState.timeLeftSeconds !== timeLeftSeconds && timeLeftSeconds <= 0) {
			clearInterval(this.timer);
			this.setState({
				viewTime: {
					days: "",
					hours: "00h",
					minutes: "00m",
				},
			});
		}
	}

	componentWillUnmount() {
		if (this.timer) {
			clearInterval(this.timer);
		}
	}

	render() {
		const { promotion, activeProductId, toggleActiveProduct, buyAction, t, isMobile } = this.props;
		const { viewTime, timeLeftSeconds } = this.state;
		return (
			<Row noGutters={true} className="daily-sales-container">
				<Col xs={12} className="daily-sales-wrapper text-center">
					{isMobile && <p className="sales-title-mobile">{promotion.name ? promotion.name : t(`market.weekly`)}</p>}
					<div className="sales-title-wrapper">
						{!isMobile && <p>{promotion.name ? promotion.name : t(`market.weekly`)}</p>}
						<div className="sales-time-icon">
							<LazyLoad offset={100}>
								<img src={clockIcon} alt="sales" width="30" height="30" />
							</LazyLoad>
						</div>
						<p>
							{viewTime.days && <span>{viewTime.days} </span>}
							<span>{viewTime.hours} </span>
							<span>{viewTime.minutes} </span>
							{/* <span>{viewTime.seconds}</span> */}
						</p>
					</div>
					<Row noGutters={false}>
						{promotion.items.map((item) => {
							const isLimit = item.limit ? item.limit > item.sold : true;
							const isUserLimit = item.limitPerUser ? item.limitPerUser > item.purchasedUserCount : true;
							const isAvailableProduct = isLimit && isUserLimit && timeLeftSeconds;
							return (
								<MarketDailyOfferProductCard
									isAvailableProduct={isAvailableProduct}
									key={item.id}
									item={item}
									activeProductId={activeProductId}
									toggleActiveProduct={toggleActiveProduct}
									buyAction={buyAction}
								/>
							);
						})}
					</Row>
				</Col>
				<div className="market-divider" />
			</Row>
		);
	}
}
const MarketDailyOffer = withTranslation("Game")(connect(mapStateToProps, null)(MarketDailyOfferClass));
export default MarketDailyOffer;
