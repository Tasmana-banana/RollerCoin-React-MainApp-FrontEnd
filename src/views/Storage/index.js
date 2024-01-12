import React, { Component } from "react";
import { connect } from "react-redux";
import { Container, Nav, NavItem, NavLink, Row, Col, UncontrolledTooltip } from "reactstrap";
import { Link, Route, Switch } from "react-router-dom";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import getLanguagePrefix from "../../services/getLanguagePrefix";
import fetchWithToken from "../../services/fetchWithToken";
import Merge from "../../components/Storage/Merge";
import Collection from "../../components/Storage/Collection";
import Inventory from "../../components/Storage/Inventory";
import BannersLoader from "../../components/Banners/BannersLoader";

import "../../assets/scss/Storage/main.scss";

import collectionIcon from "../../assets/img/icon/reward.svg";
import inventoryIcon from "../../assets/img/icon/inventory.svg";
import wrenchIcon from "../../assets/img/icon/wrench.svg";
import backAngleIcon from "../../assets/img/wallet/back_angle.svg";
import infoTooltipImg from "../../assets/img/storage/info_icon_round.svg";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	isMobile: state.game.isMobile,
	language: state.game.language,
	pathName: state.router.location.pathname,
});

class StorageClass extends Component {
	static propTypes = {
		wsReact: PropTypes.object.isRequired,
		isMobile: PropTypes.bool.isRequired,
		history: PropTypes.object.isRequired,
		pathName: PropTypes.string.isRequired,
		language: PropTypes.string.isRequired,
		t: PropTypes.func.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			userBonusPercent: 0,
			inventory: [],
		};
		this.toastDefaultConfig = {
			position: "top-left",
			autoClose: 3000,
			hideProgressBar: true,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
		};
		this.routesConfig = {
			merge: { path: "storage/merge", name: "merge", image: wrenchIcon },
			inventory: { path: "storage/inventory", name: "inventory", image: inventoryIcon },
			collection: { path: "storage/collection", name: "collection", image: collectionIcon },
		};
		this.controllers = {};
		this.signals = {};
	}

	getCurrentRouteName = () => {
		const { pathName, t } = this.props;
		const currentGroup = Object.keys(this.routesConfig).find((key) => this.routesConfig[key].path.includes(pathName));
		return currentGroup ? t(`main.${this.routesConfig[currentGroup].name}`) : "";
	};

	isTabActive = (name) => {
		const { pathName, isMobile } = this.props;
		return (pathName.includes(name) || (pathName.endsWith("/storage") && name === "merge")) && !isMobile;
	};

	componentDidMount() {
		this.getUserBonusPower();
	}

	componentWillUnmount() {
		Object.keys(this.controllers).forEach((key) => {
			if (this.controllers[key]) {
				this.controllers[key].abort();
			}
		});
	}

	createSignalAndController = (id) => {
		if (this.controllers[id]) {
			this.controllers[id].abort();
		}
		this.controllers[id] = new AbortController();
		this.signals[id] = this.controllers[id].signal;
	};

	getUserBonusPower = async () => {
		this.createSignalAndController("getUserBonusPower");
		try {
			const json = await fetchWithToken(`/api/mining/user-bonus-power?type=miners_collection`, {
				method: "GET",
				signal: this.signals.getUserBonusPower,
			});
			if (!json.success) {
				return null;
			}
			this.setState({
				userBonusPercent: json.data.bonus_percent,
			});
		} catch (e) {
			console.error(e);
		}
	};

	render() {
		const { t, language, isMobile, pathName } = this.props;
		const { userBonusPercent } = this.state;
		return (
			<Container className="storage-container">
				<Row>
					<Col xs="12">
						{(!isMobile || (isMobile && pathName.endsWith("storage"))) && (
							<div className="info-tooltip-icon-container">
								<div className="info-icon-block" id="storageTooltipId">
									<img className="info-icon" src={infoTooltipImg} alt="info img" width="24" height="24" />
								</div>
								<h1 className="storage-title">{t("main.title")}</h1>
								<UncontrolledTooltip placement="right" autohide={true} target="storageTooltipId">
									{t("infoHints.storageTitleTooltipText")}
								</UncontrolledTooltip>
							</div>
						)}
						{isMobile && !pathName.endsWith("/storage") && (
							<Row noGutters={true} className="mobile-header">
								<Link to={`${getLanguagePrefix(language)}/storage`} className="d-flex back-link">
									<span className="icon">
										<img src={backAngleIcon} alt="back_angle" />
									</span>
									<span>{t("main.back")}</span>
								</Link>
								<p className="page-name">{this.getCurrentRouteName()}</p>
							</Row>
						)}
					</Col>
					{((isMobile && pathName.endsWith("/storage")) || !isMobile) && (
						<Col xs="12" lg="3" className="nav-pills-container">
							<Nav pills className="flex-column nav-pills w-100">
								{Object.keys(this.routesConfig).map((key) => (
									<NavItem key={key}>
										<NavLink
											tag={Link}
											to={`${getLanguagePrefix(language)}/${this.routesConfig[key].path}`}
											className={`${this.isTabActive(this.routesConfig[key].name) ? "active" : ""} link-pill-ico product-pill`}
										>
											<div className="d-flex align-items-center">
												<div className="storage-nav-image">
													<img src={this.routesConfig[key].image} width={32} height={32} alt={key} />
												</div>
												<span>{t(`main.${this.routesConfig[key].name}`)}</span>
											</div>
											{key === "collection" && <span className="bonus-percent">{`+${userBonusPercent / 100}%`}</span>}
										</NavLink>
									</NavItem>
								))}
							</Nav>
							<div className="menu-adv-banners">
								<BannersLoader name="storageMenu" isMobile={isMobile} />
							</div>
						</Col>
					)}
					<Col xs="12" lg="9">
						<Switch>
							{!isMobile && <Route exact path={`${getLanguagePrefix(language)}/storage`} render={() => <Merge wsReact={this.props.wsReact} />} />}
							<Route path={`${getLanguagePrefix(language)}/storage/merge`} render={() => <Merge wsReact={this.props.wsReact} />} />
							<Route exact path={`${getLanguagePrefix(language)}/storage/inventory`} render={() => <Inventory />} />
							<Route exact path={`${getLanguagePrefix(language)}/storage/collection`} render={() => <Collection />} />
						</Switch>
					</Col>
				</Row>
			</Container>
		);
	}
}

export default withTranslation("Storage")(connect(mapStateToProps, null)(StorageClass));
