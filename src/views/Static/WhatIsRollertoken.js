import React, { Component } from "react";
import PropTypes from "prop-types";
import LazyLoad from "react-lazyload";
import { connect } from "react-redux";
import { Container, Row, Col } from "reactstrap";
import { withTranslation } from "react-i18next";
import getLanguagePrefix from "../../services/getLanguagePrefix";

import "../../assets/scss/Static/WhatIsRollertoken.scss";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	language: state.game.language,
	isAuthorizedSocket: state.user.isAuthorizedSocket,
	isAuthorizedNode: state.user.isAuthorizedNode,
});
class WhatIsRollertoken extends Component {
	static propTypes = {
		language: PropTypes.string.isRequired,
		isAuthorizedSocket: PropTypes.bool.isRequired,
		isAuthorizedNode: PropTypes.bool.isRequired,
		t: PropTypes.func.isRequired,
	};

	render() {
		const { language, isAuthorizedSocket, isAuthorizedNode, t } = this.props;
		return (
			<div className="what-is-rollertoken">
				<Container className="main-container">
					<Row className="align-items-center content-row">
						<Col xs={12} lg={6} className="img-block">
							<LazyLoad offset={100}>
								<img src="/static/img/whatIsRollertoken/what_is_rollertoken.gif" alt="what_is_rollertoken" className="w-100" />
							</LazyLoad>
						</Col>
						<Col xs={12} lg={6}>
							<h1 className="main-header">{t("whatIsRollerToken")}</h1>
							<p className="text-block">{t("isANewVirtual")}</p>
						</Col>
					</Row>
					<Row className="align-items-center content-row">
						<Col xs={12} lg={6}>
							<h2 className="sub-header">{t("whyDoYouNeedRollerToken")}</h2>
							<p className="text-block">{t("weCanAssureYou")}</p>
						</Col>
						<Col xs={12} lg={{ offset: 1, size: 5 }} className="img-block text-right">
							<LazyLoad offset={100}>
								<img src="/static/img/whatIsRollertoken/press.png" alt="press" />
							</LazyLoad>
						</Col>
					</Row>
					<Row className="content-row flex-wrap">
						<Col xs={12} lg={6} className="token-need-for-item">
							<Row className="align-items-center">
								<Col xs={4} lg={4} className="img-block">
									<LazyLoad offset={100}>
										<img src="/static/img/whatIsRollertoken/purchase.png" alt="purchase" className="w-100" />
									</LazyLoad>
								</Col>
								<Col xs={8} lg={8}>
									<p className="header-why-need">
										<span className="cyan-text">1.</span>
										{t("newPowerful")}
									</p>
									<p className="text-block">{t("wePlanToAdd")}</p>
								</Col>
							</Row>
						</Col>
						<Col xs={12} lg={6} className="token-need-for-item">
							<Row className="align-items-center">
								<Col xs={4} lg={4} className="img-block">
									<LazyLoad offset={100}>
										<img src="/static/img/whatIsRollertoken/bonuses.png" alt="bonuses" className="w-100" />
									</LazyLoad>
								</Col>
								<Col xs={8} lg={8}>
									<p className="header-why-need">
										<span className="cyan-text">2.</span> {t("customRandom")}
									</p>
									<p className="text-block">{t("yesWeWillImplement")}</p>
								</Col>
							</Row>
						</Col>
						<Col xs={12} lg={6} className="token-need-for-item">
							<Row className="align-items-center">
								<Col xs={4} lg={4} className="img-block">
									<LazyLoad offset={100}>
										<img src="/static/img/whatIsRollertoken/marketplace.png" alt="marketplace" className="w-100" />
									</LazyLoad>
								</Col>
								<Col xs={8} lg={8}>
									<p className="header-why-need">
										<span className="cyan-text">3.</span> {t("InGameMarketplace")}
									</p>
									<p className="text-block">{t("andWatDoYouDo")}</p>
								</Col>
							</Row>
						</Col>
						<Col xs={12} lg={6} className="token-need-for-item">
							<Row className="align-items-center">
								<Col xs={4} lg={4} className="img-block">
									<LazyLoad offset={100}>
										<img src="/static/img/whatIsRollertoken/exchange.png" alt="exchange" className="w-100" />
									</LazyLoad>
								</Col>
								<Col xs={8} lg={8}>
									<p className="header-why-need">
										<span className="cyan-text">4.</span> {t("cryptocurrencyExchange")}
									</p>
									<p className="text-block">{t("howAboutAFully")}</p>
								</Col>
							</Row>
						</Col>
						<Col xs={12} lg={8} className="token-need-for-item">
							<Row className="align-items-center">
								<Col xs={4} lg={3} className="img-block">
									<LazyLoad offset={100}>
										<img src="/static/img/whatIsRollertoken/pool.png" alt="pool" className="w-100" />
									</LazyLoad>
								</Col>
								<Col xs={8} lg={9}>
									<p className="header-why-need">
										<span className="cyan-text">5.</span> {t("miningPools")}
									</p>
									<p className="text-block">{t("weWillSlightly")}</p>
								</Col>
							</Row>
						</Col>
					</Row>
					<Row className="align-items-center content-row">
						<Col xs={12} lg={5} className="img-block">
							<LazyLoad offset={100}>
								<img src="/static/img/whatIsRollertoken/coins.png" alt="coins pic" />
							</LazyLoad>
						</Col>
						<Col xs={12} lg={7}>
							<p className="yellow-header">{t("whoDoYouWantToBe")}</p>
							<p className="text-block">{t("soWhetherYou")}</p>
							{isAuthorizedSocket && isAuthorizedNode && (
								<div className="btn-container text-center text-lg-left">
									<a href={`${getLanguagePrefix(language)}/wallet/token`} className="tree-dimensional-button btn-yellow">
										<span className="with-horizontal-image">
											<img src="/static/img/wallet/buy_tokens.svg" alt="buy_tokens" />
											<span className="btn-text">{t("buyTokens")}</span>
										</span>
									</a>
								</div>
							)}
						</Col>
					</Row>
				</Container>
			</div>
		);
	}
}
export default withTranslation("WhatIsRollertoken")(connect(mapStateToProps, null)(WhatIsRollertoken));
