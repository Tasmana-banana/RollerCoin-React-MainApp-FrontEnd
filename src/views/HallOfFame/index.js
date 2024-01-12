import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Row, Col, Container } from "reactstrap";
import { withTranslation } from "react-i18next";
import decimalAdjust from "../../services/decimalAdjust";
import BonusSizes from "../../components/HallOfFame/BonusSizes";
import BonusCups from "../../components/HallOfFame/BonusCups";
import fetchWithToken from "../../services/fetchWithToken";

// top images
import topOne from "../../assets/img/hall_of_fame/cups/cup_1.png";
import topTwo from "../../assets/img/hall_of_fame/cups/cup_2.png";
import topThree from "../../assets/img/hall_of_fame/cups/cup_3.png";
import topFour from "../../assets/img/hall_of_fame/cups/cup_4.png";
import topFive from "../../assets/img/hall_of_fame/cups/cup_5.png";
import topSix from "../../assets/img/hall_of_fame/cups/cup_6.png";
import topSeven from "../../assets/img/hall_of_fame/cups/cup_7.png";
import topEight from "../../assets/img/hall_of_fame/cups/cup_8.png";
import topNine from "../../assets/img/hall_of_fame/cups/cup_9.png";
import topTen from "../../assets/img/hall_of_fame/cups/cup_10.png";
import topHundred from "../../assets/img/hall_of_fame/cups/cup_100.png";
import topTwoMid from "../../assets/img/hall_of_fame/cups/cup_2_991w.png";
import topThreeMid from "../../assets/img/hall_of_fame/cups/cup_3_991w.png";
import arrow from "../../assets/img/hall_of_fame/arrow.png";
import Cups from "../../components/HallOfFame/Cups";

import "../../assets/scss/SingleComponents/Hall.scss";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	rollerCurrencies: state.wallet.rollerCurrencies,
});

class Hall extends Component {
	static propTypes = {
		rollerCurrencies: PropTypes.array.isRequired,
		t: PropTypes.func.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			dataLoaded: null,
			isReadMoreOpen: false,
			stats: {
				topThree: [],
				topTen: [],
				topFive: [],
				topHundred: [],
			},
		};
		this.controller = new AbortController();
		this.signal = this.controller.signal;
	}

	componentDidMount() {
		this.getStats();
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

	getStats = async () => {
		this.createSignalAndController();
		try {
			const json = await fetchWithToken("/api/crowdfunding/token-stats", {
				method: "GET",
				signal: this.signal,
			});
			if (!json.success) {
				return false;
			}
			const rltConfig = this.props.rollerCurrencies.find((item) => item.code === "rlt");
			const adjustedData = json.data.map((item) => ({ ...item, amount: decimalAdjust(item.amount / rltConfig.toSmall, rltConfig.precisionToBalance) }));
			const sortedData = adjustedData.sort((a, b) => b.amount - a.amount);
			this.setState({
				dataLoaded: !!json.data.length,
				stats: {
					topThree: sortedData.slice(0, 3),
					topTen: sortedData.slice(5, 10),
					topFive: sortedData.slice(3, 5),
					topHundred: sortedData.slice(10),
				},
			});
		} catch (e) {
			console.error(e);
		}
	};

	openReadMore = () => {
		this.setState({ isReadMoreOpen: !this.state.isReadMoreOpen });
	};

	render() {
		const { stats, dataLoaded, isReadMoreOpen } = this.state;
		const { t } = this.props;
		return (
			<div className="hall-of-fame">
				<Container>
					<Row noGutters={true}>
						<Col xs="12" className={`hall-header ${isReadMoreOpen ? "open" : ""}`}>
							<h2 className="hall-title">{t("buyRollerTokens")}</h2>
							<div className="hall-read-more">
								<p>
									{t("weAreHonored")} <span className="hall-description-blue">{t("topContributorsContest")}</span> {t("thisEventStarts")}
								</p>
								<Row noGutters={true} className="hall-bonus">
									<BonusSizes t={t} />
									<p className="hall-bonus-descr">{t("bonusToken")}</p>
									<h4 className="tokens-limit">Tokens limit</h4>
									<p className="tokens-limit-text">1 000 000 RLT</p>
									<p className="tokens-limit-presale">{t("theMaximumAmount")}</p>
									<BonusCups />
									<p className="free-miners">{t("playersWhoDont")}</p>
									<p className="free-miners-numbers">1 000 000 RLT</p>
									<p>{t("isPurchased")}</p>
								</Row>
							</div>
							<div className="text-center">
								<button type="button" className="btn btn-link hall-read-more-btn" onClick={this.openReadMore}>
									<span>{isReadMoreOpen ? t("hideRules") : t("showRules")}</span>
									<span className="hall-read-arrow">
										<img src={arrow} alt="hall read more button" />
									</span>
								</button>
							</div>
						</Col>
						{dataLoaded && (
							<Col xs="12" lg={{ size: 8, offset: 2 }}>
								<div className="hall-top-padding">
									<div className="d-flex justify-content-center align-items-center hall-top-wrapper">
										<h1 className="hall-shelf-title">{t("topContributorsTitle")}</h1>
									</div>
								</div>
								<div className="hall-main-wrapper">
									<div className="hall-cups-sides">
										<div className="hall-top-text d-flex justify-content-center">
											<p>{t("top")} 1-3</p>
										</div>
										<Row noGutters={true} className="top-three-row">
											{stats.topThree.map((item, index) => (
												<Cups
													key={item._id}
													lg={4}
													xs={6}
													index={index}
													startIndex={0}
													images={[topOne, topTwo, topThree]}
													srcSetImages={[topTwoMid, topThreeMid]}
													data={item}
												/>
											))}
										</Row>
										{stats.topFive.length > 0 && (
											<div className="hall-top-text d-flex justify-content-center">
												<p>{t("top")} 4-5</p>
											</div>
										)}
										<Row noGutters={true} className="top-five-row">
											{stats.topFive.map((item, index) => (
												<Cups key={item._id} lg={6} xs={6} index={index} startIndex={4} images={[topFour, topFive]} data={item} />
											))}
										</Row>
										{stats.topTen.length > 0 && (
											<div className="hall-top-text d-flex justify-content-center">
												<p>{t("top")} 6-10</p>
											</div>
										)}
										<Row noGutters={true} className="flex-grow-1 justify-content-around top-ten-row">
											{stats.topTen.map((item, index) => (
												<Cups
													key={item._id}
													lg={2}
													xs={6}
													index={index}
													startIndex={6}
													images={[topSix, topSeven, topEight, topNine, topTen]}
													additionalStyle={"top-ten-item custom-min-width"}
													data={item}
												/>
											))}
										</Row>
										{stats.topHundred.length > 0 && (
											<div className="hall-top-text d-flex justify-content-center">
												<p>{t("top")} 11-100</p>
											</div>
										)}
										<Row noGutters={true} className="flex-grow-1 justify-content-around top-hundred-row">
											{stats.topHundred.map((item, index) => (
												<Cups key={item._id} lg={2} xs={6} index={index} startIndex={11} images={[topHundred]} additionalStyle={"top-ten-item custom-min-width"} data={item} />
											))}
										</Row>
										<div className="hall-end-line" />
									</div>
								</div>
								<div className="hall-bottom-wrapper">
									<div className="hall-bottom-line" />
								</div>
							</Col>
						)}
					</Row>
					{dataLoaded === null && <p className="text-center">Loading...</p>}
					{dataLoaded === false && <p className="text-center">No data</p>}
				</Container>
			</div>
		);
	}
}
export default withTranslation("HalfOfFrame")(connect(mapStateToProps, null)(Hall));
