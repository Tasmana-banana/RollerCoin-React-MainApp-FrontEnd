import React, { Component } from "react";
import { Row, Col } from "reactstrap";
import { Helmet } from "react-helmet";
import { withTranslation } from "react-i18next";
import PropTypes from "prop-types";
import LazyLoad from "react-lazyload";
import { CopyLinkComponent } from "../../components/Referral";
import FadeAnimation from "../../components/Animations/FadeAnimation";

class Info extends Component {
	static propTypes = {
		isValid: PropTypes.bool.isRequired,
		t: PropTypes.func.isRequired,
	};

	render() {
		const { t, isValid } = this.props;
		return (
			<FadeAnimation>
				<div className={`info-container`}>
					<Helmet>
						<title>{t("referralInfo.title")}</title>
					</Helmet>
					{isValid && (
						<div className="copy-block">
							<Row noGutters={true} className="justify-content-center">
								<Col xs="12" lg="6">
									<CopyLinkComponent />
								</Col>
							</Row>
						</div>
					)}
					<div className="header-block">
						<p className={`text-center`}>
							{t("referralInfo.moreThan")}
							<br />
							{t("referralInfo.playAndReceive")} <span className={`cyan-text`}> {t("referralInfo.referralsProfit")}</span>
							<br />
							<span className={`magenta-text`}>15% {t("referralInfo.fromPurchases")}</span>
						</p>
					</div>
					<div>
						<p className={`text-uppercase text-center`}>{t("referralInfo.earningRealBtc")}</p>
					</div>
					<div className="wrapper-block" />
					<div className="info-small-header">
						<p>
							<img src="/static/img/referral/pig.svg" alt="pig_bank" />
							<span>{t("referralInfo.countProfit")}</span>
						</p>
					</div>
					<div className="dark-gray-bg profit-block text-center">
						<p>{t("referralInfo.percentageCombined")}</p>
						<p>
							<img src="/static/img/referral/money_bag.svg" alt="coins" width="213" height="155" />
						</p>
						<p className="bold-text text-uppercase">
							{t("referralInfo.commissionCan")} <span className="cyan-text"> {t("referralInfo.ofTotalProfit")}</span> {t("referralInfo.ofReferred")}
						</p>
						<p>{t("referralInfo.commissionCalculated")}</p>
					</div>
					<div className="wrapper-block" />
					<div className="info-small-header">
						<p>
							<img src="/static/img/referral/payment.svg" alt="payment" />
							<span>{t("referralInfo.whatCanOffer")}</span>
						</p>
					</div>
					<Row noGutters={true} className={`offers-block-container text-center`}>
						<Col xs="12">
							<Row>
								<Col xs="12" lg="4" className="offer-block">
									<div className="dark-gray-bg offer-block-content">
										<p className="img-container">
											<img src="/static/img/referral/cash.svg" alt="cash" />
										</p>
										<p className="offer-text">{t("referralInfo.payouts")}</p>
									</div>
								</Col>
								<Col xs="12" lg="4" className="offer-block">
									<div className="dark-gray-bg offer-block-content">
										<p className="img-container">
											<img src="/static/img/referral/cart.svg" alt="cart" />
										</p>
										<p className="offer-text">{t("referralInfo.fastGrowing")}</p>
									</div>
								</Col>
								<Col xs="12" lg="4" className="offer-block">
									<div className="dark-gray-bg offer-block-content">
										<p className="img-container">
											<img src="/static/img/referral/maintance.svg" alt="maintance" />
										</p>
										<p className="offer-text">{t("referralInfo.cuttingEdge")}</p>
									</div>
								</Col>
								<Col xs="12" lg="4" className="offer-block">
									<div className="dark-gray-bg offer-block-content">
										<p className="img-container">
											<img src="/static/img/referral/like.svg" alt="like" />
										</p>
										<p className="offer-text">
											<span className="cyan-text">25%</span> {t("referralInfo.commission")}
										</p>
									</div>
								</Col>
								<Col xs="12" lg="4" className="offer-block">
									<div className="dark-gray-bg offer-block-content">
										<p className="img-container">
											<img src="/static/img/referral/bar-chart.svg" alt="bar-chart" />
										</p>
										<p className="offer-text">{t("referralInfo.statistics")}</p>
									</div>
								</Col>
								<Col xs="12" lg="4" className="offer-block">
									<div className="dark-gray-bg offer-block-content">
										<p className="img-container">
											<img src="/static/img/referral/padlock.svg" alt="padlock" />
										</p>
										<p className="offer-text">{t("referralInfo.privacy")}</p>
									</div>
								</Col>
							</Row>
							<Row noGutters={true} className="big-block-offers-container">
								<Col xs="12" lg="6" className="big-block-offer">
									<p className="img-container">
										<img src="/static/img/referral/add_users.svg" alt="users" />
									</p>
									<p className="offer-text">{t("referralInfo.connectedToAccount")}</p>
								</Col>
								<Col xs="12" lg="6" className="big-block-offer">
									<p className="img-container">
										<img src="/static/img/referral/support.svg" alt="support" />
									</p>
									<p className="offer-text">{t("referralInfo.readyToHelp")}</p>
								</Col>
							</Row>
						</Col>
					</Row>
					<div className="wrapper-block" />
					<div className="info-small-header">
						<p>
							<img src="/static/img/referral/group.svg" alt="group" /> <span>{t("referralInfo.howToBecome")}</span>
						</p>
					</div>
					<div className="how-to-become-container">
						<Row noGutters={true} className="how-to-become">
							<Col xs="12" lg="3" className="how-to-become-block">
								<div className="top-block">
									<div className="icon-become">
										<LazyLoad offset={100}>
											<img src="/static/img/referral/note.svg" alt="note" />
										</LazyLoad>
									</div>
									<div className="line-become" />
								</div>
								<div className="bottom-block text-center">
									<div className="header-become">
										<p>{t("referralInfo.step")} 1</p>
									</div>
									<div className="body-become">
										<p>{t("referralInfo.createAccount")}</p>
									</div>
								</div>
							</Col>
							<Col xs="12" lg="3" className="how-to-become-block">
								<div className="top-block">
									<div className="line-become" />
									<div className="icon-become">
										<LazyLoad offset={100}>
											<img src="/static/img/referral/link.svg" alt="link" />
										</LazyLoad>
									</div>
									<div className="line-become" />
								</div>
								<div className="bottom-block text-center">
									<div className="header-become">
										<p>{t("referralInfo.step")} 2</p>
									</div>
									<div className="body-become">
										<p>{t("referralInfo.getLink")}</p>
									</div>
								</div>
							</Col>
							<Col xs="12" lg="3" className="how-to-become-block">
								<div className="top-block">
									<div className="line-become" />
									<div className="icon-become">
										<LazyLoad offset={100}>
											<img src="/static/img/referral/pc.svg" alt="pc" />
										</LazyLoad>
									</div>
									<div className="line-become" />
								</div>
								<div className="bottom-block text-center">
									<div className="header-become">
										<p>{t("referralInfo.step")} 3</p>
									</div>
									<div className="body-become">
										<p>{t("referralInfo.placeIt")}</p>
									</div>
								</div>
							</Col>
							<Col xs="12" lg="3" className="how-to-become-block">
								<div className="top-block">
									<div className="line-become" />
									<div className="icon-become">
										<LazyLoad offset={100}>
											<img src="/static/img/referral/earn_money.svg" alt="earn_money" />
										</LazyLoad>
									</div>
								</div>
								<div className="bottom-block text-center">
									<div className="header-become">
										<p>{t("referralInfo.step")} 4</p>
									</div>
									<div className="body-become">
										<p>{t("referralInfo.start")}</p>
									</div>
								</div>
							</Col>
						</Row>
					</div>
				</div>
			</FadeAnimation>
		);
	}
}

export default withTranslation("Referral")(Info);
