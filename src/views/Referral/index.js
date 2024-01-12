import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import { Route, Switch, Link } from "react-router-dom";
import { Row, Col, Container, Nav, NavItem, NavLink } from "reactstrap";
import Info from "./Info";
import Promo from "./Promo";
import StatisticsByCurrency from "./StatisticsByCurrency";
import getLanguagePrefix from "../../services/getLanguagePrefix";

import "../../assets/scss/Referral/main.scss";
// Map Redux state to component props
const mapStateToProps = (state) => ({
	pathName: state.router.location.pathname,
	isAuthorizedSocket: state.user.isAuthorizedSocket,
	isAuthorizedNode: state.user.isAuthorizedNode,
	language: state.game.language,
});

class ReferralClass extends Component {
	static propTypes = {
		pathName: PropTypes.string.isRequired,
		isAuthorizedSocket: PropTypes.bool.isRequired,
		isAuthorizedNode: PropTypes.bool.isRequired,
		history: PropTypes.object.isRequired,
		language: PropTypes.string.isRequired,
		t: PropTypes.func.isRequired,
	};

	constructor(props) {
		super(props);
		this.setActiveTab = this.setActiveTab.bind(this);
		this.state = {
			activeTab: "",
		};
	}

	componentDidMount() {
		this.setActiveTab();
	}

	componentDidUpdate(prevProps) {
		if (this.props.pathName !== prevProps.pathName) {
			this.setActiveTab();
		}
	}

	setActiveTab() {
		const { language, pathName } = this.props;
		let activeTab = "info";
		switch (true) {
			case pathName.includes(`${getLanguagePrefix(language)}/referral/stats`):
				activeTab = "stats";
				break;
			case pathName.includes(`${getLanguagePrefix(language)}/referral/info`):
				activeTab = "info";
				break;
			case pathName.includes(`${getLanguagePrefix(language)}/referral/promo`):
				activeTab = "promo";
				break;
			default:
				break;
		}
		this.setState({
			activeTab,
		});
	}

	render() {
		const { language, t, isAuthorizedSocket, isAuthorizedNode } = this.props;
		return (
			<Container>
				<Row className={`referral-container`}>
					<Col xs="12" lg="2" className={`left-block`}>
						<Nav pills className="flex-column nav-pills w-100">
							{isAuthorizedSocket && isAuthorizedNode && (
								<Fragment>
									<NavItem>
										<NavLink
											tag={Link}
											to={`${getLanguagePrefix(language)}/referral/stats`}
											className={`${this.state.activeTab === "stats" ? "active" : ""} link-pill-ico stats-pill`}
										>
											{t("main.statistics")}
										</NavLink>
									</NavItem>

									<NavItem>
										<NavLink
											tag={Link}
											to={`${getLanguagePrefix(language)}/referral/promo`}
											className={`${this.state.activeTab === "promo" ? "active" : ""} link-pill-ico promo-pill`}
										>
											{t("main.promo")}
										</NavLink>
									</NavItem>
								</Fragment>
							)}
							<NavItem>
								<NavLink tag={Link} to={`${getLanguagePrefix(language)}/referral/info`} className={`${this.state.activeTab === "info" ? "active" : ""} link-pill-ico info-pill`}>
									{t("main.info")}
								</NavLink>
							</NavItem>
						</Nav>
					</Col>
					<Col xs="12" lg="10" className="right-block">
						<Switch>
							{isAuthorizedSocket && isAuthorizedNode && <Route path={`${getLanguagePrefix(language)}/referral/stats`} render={() => <StatisticsByCurrency language={language} />} />}
							{isAuthorizedSocket && isAuthorizedNode && <Route exact path={`${getLanguagePrefix(language)}/referral/promo`} component={Promo} />}
							{[`${getLanguagePrefix(language)}/referral/info`, `${getLanguagePrefix(language)}/referral`].map((path, index) => (
								<Route exact path={path} render={() => <Info isValid={isAuthorizedSocket && isAuthorizedNode} />} key={index} />
							))}
						</Switch>
					</Col>
				</Row>
			</Container>
		);
	}
}
const Referral = withTranslation("Referral")(connect(mapStateToProps, null)(ReferralClass));
export default Referral;
