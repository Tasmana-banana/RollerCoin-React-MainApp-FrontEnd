import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { Link, Route, Switch, withRouter } from "react-router-dom";
import { NavItem, NavLink, Nav } from "reactstrap";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import getLanguagePrefix from "../../../services/getLanguagePrefix";
import fetchWithToken from "../../../services/fetchWithToken";
import progressionEventRewardToast from "../../../services/progressionEventRewardToast";
import progressionEventTaskToast from "../../../services/progressionEventTaskToast";
import UserPartsList from "./UserPartsList";
import MergeMinersPage from "./MergeMinersPage";
import MergePartsPage from "./MergePartsPage";
import TutorialModal from "../../Tutorial/TutorialModal";

import "../../../assets/scss/Storage/Merge/main.scss";
import "../../../assets/scss/ProgressionEvent/ProgressionEventRewardToast.scss";
import "../../../assets/scss/ProgressionEvent/ProgressionEventTaskToast.scss";

import infoImg from "../../../assets/img/storage/info_icon_big_round.svg";
import partImg from "../../../assets/img/storage/part.svg";
import minerImg from "../../../assets/img/storage/basic_miner.svg";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	language: state.game.language,
	isMobile: state.game.isMobile,
	pathName: state.router.location.pathname,
	wsNode: state.webSocket.wsNode,
	isViewedTutorial: state.user.userViewedTutorial,
});

class Index extends Component {
	static propTypes = {
		t: PropTypes.func.isRequired,
		language: PropTypes.string.isRequired,
		isMobile: PropTypes.bool.isRequired,
		history: PropTypes.object.isRequired,
		wsReact: PropTypes.object.isRequired,
		pathName: PropTypes.string.isRequired,
		wsNode: PropTypes.object.isRequired,
		isViewedTutorial: PropTypes.object.isRequired,
	};

	constructor(props) {
		super(props);
		const { t } = props;
		this.state = {
			tabsConfig: {
				miners: { path: "miners", type: "miners", title: t("inventory.miners"), icon: minerImg, count: 0, isDefault: true },
				parts: { path: "parts", type: "mutation_components", title: t("inventory.parts"), icon: partImg, count: 0, isDefault: false },
			},
			currentTab: "miners",
			isInfoShow: false,
			isRefreshPartsData: false,
		};
		this.defaultLimit = 6;
		this.controller = new AbortController();
		this.signal = this.controller.signal;
	}

	componentDidMount() {
		const { wsNode } = this.props;
		if (wsNode && !wsNode.listenersMessage.mergePage) {
			wsNode.setListenersMessage({ mergePage: this.constructor.onWSNodeMessage });
		}
		this.activeTabHandler();
		this.fetchData();
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		if (prevProps.pathName !== this.props.pathName) {
			this.activeTabHandler();
		}
	}

	componentWillUnmount() {
		const { wsNode } = this.props;
		if (wsNode) {
			wsNode.removeListenersMessage("mergePage");
		}
		if (this.controller) {
			this.controller.abort();
		}
	}

	static onWSNodeMessage = (event) => {
		const data = JSON.parse(event.data);
		const { cmd, value } = data;
		switch (cmd) {
			case "pe_user_reward_info":
				if (!value.event_type || value.event_type === "default") {
					progressionEventRewardToast(value);
				}
				break;
			case "pe_user_task_update":
				if (!value.event_type || value.event_type === "default") {
					progressionEventTaskToast(value);
				}
				break;
			default:
				break;
		}
	};

	createSignalAndController = () => {
		if (this.controller) {
			this.controller.abort();
		}
		this.controller = new AbortController();
		this.signal = this.controller.signal;
	};

	fetchData = async () => {
		const { tabsConfig } = this.state;
		this.createSignalAndController();
		try {
			const json = await fetchWithToken("/api/storage/available-merge-count", {
				method: "GET",
				signal: this.signal,
			});
			if (!json.success) {
				return false;
			}
			const newTabsConfig = Object.keys(tabsConfig).reduce((acc, key) => {
				acc[key] = {
					...tabsConfig[key],
					count: json.data[tabsConfig[key].type]?.available || 0,
				};
				return acc;
			}, {});
			this.setState({ tabsConfig: newTabsConfig });
		} catch (e) {
			console.error(e);
		}
	};

	refreshAllData = async () => {
		const { isRefreshPartsData } = this.state;
		this.setState({ isRefreshPartsData: !isRefreshPartsData });

		await this.fetchData();
	};

	activeTabHandler = () => {
		const { pathName } = this.props;
		const { tabsConfig } = this.state;
		const currentTab = Object.keys(tabsConfig).find(
			(key) => pathName.includes(tabsConfig[key].path) || (tabsConfig[key].isDefault && pathName.endsWith("/merge")) || (tabsConfig[key].isDefault && pathName.endsWith("/storage"))
		);
		this.setState({ currentTab });
	};

	showInfoToggle = () => this.setState({ isInfoShow: !this.state.isInfoShow });

	render() {
		const { t, language, wsReact, isViewedTutorial } = this.props;
		const { tabsConfig, currentTab, isInfoShow, isRefreshPartsData } = this.state;
		return (
			<div className="merge-page">
				{!isViewedTutorial.merge && <TutorialModal tutorialCategories={"merge"} />}
				<div className="crafting-info-wrapper">
					<div className="crafting-info">
						<div className="info-icon-block">
							<img className="info-icon" src={infoImg} alt="info img" width="24" height="24" />
						</div>
						<div className={`info-text-wrapper ${isInfoShow ? "open-tips" : "close-tips"}`}>
							<p className="info-text">{t("infoHints.craftingInfo")}</p>
							{isInfoShow && (
								<Fragment>
									<span>{t("infoHints.craftingInfo")}</span>
									<Link to={`${getLanguagePrefix(language)}/game/market`}>{t("merge.store")}</Link>
									<span>{t("merge.upgradedMiner")}</span>
								</Fragment>
							)}
							<p className="info-show-btn" onClick={this.showInfoToggle}>
								{isInfoShow ? t("merge.showLess") : t("merge.showMore")}
							</p>
						</div>
					</div>
				</div>
				<Nav tabs>
					{Object.keys(tabsConfig).map((key) => (
						<NavItem key={key}>
							<NavLink className={currentTab === key ? "active" : ""} tag={Link} to={`${getLanguagePrefix(language)}/storage/merge/${tabsConfig[key].path}`}>
								<div className="tab-content">
									<img className="item-img" src={tabsConfig[key].icon} alt="Parts icon" height="24" width="24" />
									<p className="tab-text">{tabsConfig[key].title}</p>
									<p className="items-count">{tabsConfig[key].count}</p>
								</div>
							</NavLink>
						</NavItem>
					))}
				</Nav>
				<UserPartsList isRefreshPartsData={isRefreshPartsData} />
				<div>
					<Switch>
						<Route
							exact
							path={[`${getLanguagePrefix(language)}/storage`, `${getLanguagePrefix(language)}/storage/merge`, `${getLanguagePrefix(language)}/storage/merge/miners`]}
							render={() => <MergeMinersPage wsReact={wsReact} refreshAllData={this.refreshAllData} />}
						/>
						<Route exact path={`${getLanguagePrefix(language)}/storage/merge/parts`} render={() => <MergePartsPage wsReact={wsReact} refreshAllData={this.refreshAllData} />} />
					</Switch>
				</div>
			</div>
		);
	}
}

export default withTranslation("Storage")(connect(mapStateToProps, null)(withRouter(Index)));
