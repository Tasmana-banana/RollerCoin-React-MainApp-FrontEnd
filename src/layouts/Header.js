import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import { Link, withRouter } from "react-router-dom";
import { Col, Container, Row } from "reactstrap";
import { ToastContainer } from "react-toastify";
import { GameControlSection, UserInfoSection, WalletSection } from "../components/Navbar";
import getLanguagePrefix from "../services/getLanguagePrefix";
import logOut from "../services/logOut";
import ReplenishmentModal from "../components/BuyRLTModal/ReplenishmentModal";
import ModalGenerateAddress from "../components/SingleComponents/ModalGenerateAddress";
import RollerButton from "../components/SingleComponents/RollerButton";
import InfluencerRewardsModal from "../components/SingleComponents/InfluencerRewardsModal";

import "react-toastify/dist/ReactToastify.min.css";
import "../assets/scss/Header.scss";

import logoImg from "../assets/img/icon/hamster.svg";
import openIcon from "../assets/img/header/open_menu.svg";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	isAuthorizedSocket: state.user.isAuthorizedSocket,
	isAuthorizedNode: state.user.isAuthorizedNode,
	wsNode: state.webSocket.wsNode,
	isBanned: state.user.isBanned,
	pathName: state.router.location.pathname,
	language: state.game.language,
	isMobile: state.game.isMobile,
	isViewedEventQuestion: state.user.isViewedEventQuestion,
	isViewedWeeklyOffer: state.user.isViewedWeeklyOffer,
	endTimeWeeklyOffer: state.user.endTimeWeeklyOffer,
	replenishmentModalStats: state.game.replenishmentModalStats,
	isOfferwallsActive: state.user.isOfferwallsActive,
	miningConfig: state.user.miningConfig,
	email: state.user.email,
	isUserViewed2fa: state.user.isUserViewed2fa,
	is2faEnabled: state.user.is2faEnabled,
	userInfo: state.user,
	notifications: state.notification,
	rollerCurrencies: state.wallet.rollerCurrencies,
	isRedDotNotify: state.wallet.isRedDotNotify,
	pagesEventsConfig: state.pagesEventsConfig,
});
function CloseButtonComponent() {
	return <img src="/static/img/icon/toast_close.svg" alt="toast_close" className="close-toast" />;
}

class HeaderClass extends Component {
	static propTypes = {
		isAuthorizedSocket: PropTypes.bool.isRequired,
		isAuthorizedNode: PropTypes.bool.isRequired,
		isBanned: PropTypes.bool.isRequired,
		pathName: PropTypes.string.isRequired,
		wsReact: PropTypes.object.isRequired,
		wsNode: PropTypes.object.isRequired,
		t: PropTypes.func.isRequired,
		language: PropTypes.string.isRequired,
		history: PropTypes.object.isRequired,
		location: PropTypes.object.isRequired,
		isMobile: PropTypes.bool.isRequired,
		isViewedWeeklyOffer: PropTypes.bool.isRequired,
		isViewedEventQuestion: PropTypes.bool.isRequired,
		isOfferwallsActive: PropTypes.bool.isRequired,
		endTimeWeeklyOffer: PropTypes.string.isRequired,
		replenishmentModalStats: PropTypes.object.isRequired,
		miningConfig: PropTypes.array.isRequired,
		email: PropTypes.string.isRequired,
		isUserViewed2fa: PropTypes.bool.isRequired,
		is2faEnabled: PropTypes.bool.isRequired,
		userInfo: PropTypes.object.isRequired,
		notifications: PropTypes.object.isRequired,
		rollerCurrencies: PropTypes.array.isRequired,
		isRedDotNotify: PropTypes.bool.isRequired,
		pagesEventsConfig: PropTypes.array.isRequired,
	};

	static defaultProps = {
		miningConfig: [],
	};

	constructor(props) {
		super(props);
		this.isMobile = window.screen.width < 1200;
		this.state = {
			openMenu: false,
			progress: {},
			isShowModalGenerateAddress: false,
			userVisitedSiteLast30Days: false,
			dynamicLinks: [],
		};
		this.controllers = {};
		this.signals = {};
		this.wrapperRef = React.createRef();
		this.delayTimeout = 0;
	}

	componentDidMount() {
		const lastVisitDate = localStorage.getItem("lastVisit");
		if (lastVisitDate) {
			const today = new Date();
			const dateLimit = new Date(new Date().setDate(today.getDate() - 30));
			const visitedSiteLast30Days = new Date(lastVisitDate) > dateLimit;
			if (visitedSiteLast30Days) {
				this.setState({ userVisitedSiteLast30Days: true });
			}
		}
		if (this.props.pagesEventsConfig.length) {
			const [dynamicLinks] = this.props.pagesEventsConfig
				.filter((dynamicLink) => dynamicLink?.links && dynamicLink.links.filter((link) => link.link_type === "right_menu"))
				.map((dynamicLink) => dynamicLink.links.map((link) => ({ linkName: link.link_name, linkUrl: link.link_url, linkType: link.link_type })));
			this.setState({
				dynamicLinks,
			});
		}
		const { userInfo, notifications } = this.props;
		const { isCompleted, userViewedTutorial, registrationDate } = userInfo;
		if (
			isCompleted &&
			userViewedTutorial &&
			userViewedTutorial.game &&
			notifications?.generate_new_address?.is_show_notification &&
			new Date(registrationDate).getTime() < new Date("2024-01-08T00:00:00Z").getTime()
		) {
			this.setState({
				isShowModalGenerateAddress: true,
			});
		}
	}

	componentDidUpdate(prevProps, prevState) {
		const { pathName, userInfo, notifications } = this.props;
		const { openMenu } = this.state;
		if (openMenu && pathName !== prevProps.pathName) {
			this.hideMenu();
		}
		const { isCompleted, userViewedTutorial, registrationDate } = userInfo;
		if (userInfo.userViewedTutorial !== prevProps.userInfo.userViewedTutorial || userInfo.isCompleted !== prevProps.userInfo.isCompleted) {
			if (
				isCompleted &&
				userViewedTutorial &&
				userViewedTutorial.game &&
				notifications?.generate_new_address?.is_show_notification &&
				new Date(registrationDate).getTime() < new Date("2024-01-08T00:00:00Z").getTime()
			) {
				this.setState({
					isShowModalGenerateAddress: true,
				});
			}
		}
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

	showMenu = () => {
		this.setState({
			openMenu: true,
		});
	};

	hideMenu = () => {
		this.setState({
			openMenu: false,
		});
	};

	userLogOut = async () => {
		this.createSignalAndController("userLogOut");
		await logOut(this.signals.userLogOut);
	};

	closeModalGenerateAddress = () => {
		this.setState({
			isShowModalGenerateAddress: false,
		});
	};

	render() {
		const {
			t,
			language,
			isBanned,
			isAuthorizedSocket,
			isAuthorizedNode,
			isViewedWeeklyOffer,
			isViewedEventQuestion,
			replenishmentModalStats,
			isOfferwallsActive,
			wsReact,
			userInfo,
			notifications,
			isRedDotNotify,
		} = this.props;
		const { openMenu, isShowModalGenerateAddress, userVisitedSiteLast30Days, dynamicLinks } = this.state;
		return (
			<Fragment>
				<header className="rollercoin-header">
					<Container fluid={true} className="main-header-container">
						<div className="left-block-main-menu block-main-menu">
							<a href={`${getLanguagePrefix(language)}/`} className="logo-link">
								<img src={logoImg} width={50} height={50} alt="hamster" />
								{this.isMobile && <img src="/static/img/logo.png" alt="RollerCoin" />}
							</a>
							{!this.isMobile && !isBanned && isAuthorizedSocket && isAuthorizedNode && <WalletSection isRedDotNotify={isRedDotNotify} />}
						</div>
						{!this.isMobile && !isBanned && isAuthorizedSocket && isAuthorizedNode && (
							<div className="center-block-main-menu block-main-menu">
								<GameControlSection redDotStatus={{ isViewedWeeklyOffer, isViewedEventQuestion }} isShowOfferwallNotifications={notifications?.offerwall_visit?.is_show_notification} />
							</div>
						)}
						{isAuthorizedSocket && isAuthorizedNode && (
							<div className="right-block-main-menu block-main-menu">
								{!this.isMobile && !isBanned && <UserInfoSection />}
								<div className="wrapper-vertical-header" />
								<div className="open-menu" ref={this.wrapperRef}>
									<RollerButton className="open-menu-button" icon={openIcon} action={this.showMenu} />
								</div>
							</div>
						)}
						{!(isAuthorizedSocket && isAuthorizedNode) && (
							<div className="right-block-main-menu block-main-menu">
								<div className="open-menu">
									<div className="open-menu" ref={this.wrapperRef}>
										<RollerButton className="open-menu-button" icon={openIcon} action={this.showMenu} />
									</div>
								</div>
							</div>
						)}
					</Container>
					<div className={`fixed-navbar-container${openMenu ? " visible" : ""}`}>
						<div className="header-main-menu">
							<p>{t("header.menu")}</p>
							<div className="tree-dimensional-button close-menu-btn btn-default" onClick={this.hideMenu}>
								<span>
									<img className="header-main-menu-image" src="/static/img/header/close_menu.svg" alt="close_menu" />
								</span>
							</div>
						</div>
						<div className="vertical-menu">
							{!(isAuthorizedSocket && isAuthorizedNode) && (
								<div className="menu-item">
									<Link to={`${getLanguagePrefix(language)}/games`}>
										<img src="/static/img/header/home_small.svg" alt="home_small" />
										{t("header.games")}
									</Link>
								</div>
							)}
							{isAuthorizedSocket && isAuthorizedNode && (
								<div className="menu-item">
									<Link to={`${getLanguagePrefix(language)}/game`}>
										<img src="/static/img/header/home_small.svg" alt="home_small" />
										{t("header.home")}
									</Link>
								</div>
							)}
							{isAuthorizedSocket && isAuthorizedNode && (
								<div className="menu-item">
									<Link to={`${getLanguagePrefix(language)}/wallet`}>
										<img src="/static/img/icon/wallet.svg" alt="wallet" />
										{t("header.wallets")}
									</Link>
								</div>
							)}
							{isAuthorizedSocket &&
								isAuthorizedNode &&
								!!dynamicLinks.length &&
								dynamicLinks.map((dynamicLink, index) => (
									<div className="menu-item" key={index}>
										<Link to={`${getLanguagePrefix(language)}${dynamicLink.linkUrl}`}>
											<img src="/static/img/icon/scheduler_small_cyan.svg" alt="special event" />
											{dynamicLink.linkName[language]}
										</Link>
									</div>
								))}

							{isAuthorizedSocket && isAuthorizedNode && (
								<Fragment>
									<div className="menu-item">
										<a href={`${getLanguagePrefix(language)}/p/${userInfo.publicProfileLink}/rollersreplay`}>
											<img src="/static/img/icon/rating.svg" alt="contact" />
											{t("header.hamsterJourney")}
										</a>
									</div>
									<div className="menu-item">
										<Link to={`${getLanguagePrefix(language)}/profile`}>
											<img src="/static/img/icon/contact.svg" alt="contact" />
											{t("header.profile")}
										</Link>
									</div>
								</Fragment>
							)}
							{!userVisitedSiteLast30Days && (
								<Fragment>
									{!(isAuthorizedSocket && isAuthorizedNode) && (
										<div className="menu-item">
											<a href={`${getLanguagePrefix(language)}/sign-in?welcome=true`}>
												<img src="/static/img/icon/sign_in.svg" alt="sign_in" />
												{t("header.logIn")}
											</a>
										</div>
									)}
									{!(isAuthorizedSocket && isAuthorizedNode) && (
										<div className="menu-item">
											<a href={`${getLanguagePrefix(language)}/sign-up`}>
												<img src="/static/img/icon/sign_up.svg" alt="sign_up" />
												{t("header.signUp")}
											</a>
										</div>
									)}
								</Fragment>
							)}
							{userVisitedSiteLast30Days && !(isAuthorizedSocket && isAuthorizedNode) && (
								<div className="menu-item">
									<a href={`${getLanguagePrefix(language)}/sign-in`}>
										<img src="/static/img/icon/sign_in.svg" alt="sign_in" />
										{t("header.auth")}
									</a>
								</div>
							)}
							{isAuthorizedSocket && isAuthorizedNode && (
								<div className="menu-item">
									<Link to={`${getLanguagePrefix(language)}/hall-of-fame`}>
										<img src="/static/img/header/icon_cup.svg" alt="Hall of fame" />
										{t("header.contributors")}
									</Link>
								</div>
							)}
							<div className="menu-item">
								<a href="/blog">
									<img src="/static/img/header/icon_blog.svg" alt="icon_blog" />
									{t("header.blog")}
								</a>
							</div>
							<div className="menu-item">
								<Link to={`${getLanguagePrefix(language)}/rank`}>
									<img src="/static/img/icon/rank.svg" alt="rank" />
									{t("header.leaderboard")}
								</Link>
							</div>
							{isAuthorizedSocket && isAuthorizedNode && isOfferwallsActive && (
								<div className="menu-item">
									<a href={`${getLanguagePrefix(language)}/taskwall`}>
										<img src="/static/img/icon/offerwall.svg" alt="offerwall" />
										{t("header.offerwall")}
									</a>
								</div>
							)}
							{isAuthorizedSocket && isAuthorizedNode && (
								<div className="menu-item">
									<a href={`${getLanguagePrefix(language)}/what-is-rollertoken`}>
										<img src="/static/img/icon/rc.svg" alt="what is RLT" />
										{t("header.whatIsRLT")}
									</a>
								</div>
							)}
							<div className="menu-item">
								<Link to={`${getLanguagePrefix(language)}/referral${isAuthorizedSocket && isAuthorizedNode ? "/stats" : ""}`}>
									<img src="/static/img/icon/notice.svg" alt="notice" />
									{t("header.referral")}
								</Link>
							</div>
							{isAuthorizedSocket && isAuthorizedNode && (
								<div className="menu-item">
									<button className="menu-item-logout" onClick={this.userLogOut}>
										<img src="/static/img/icon/exit.svg" alt="exit" />
										{t("header.logout")}
									</button>
								</div>
							)}
							{!(isAuthorizedSocket && isAuthorizedNode) && (
								<div className="menu-item">
									<a href={`${getLanguagePrefix(language)}/faq`}>
										<img src="/static/img/icon/faq.svg" alt="faq" />
										{t("header.FAQ")}
									</a>
								</div>
							)}
							{!(isAuthorizedSocket && isAuthorizedNode) && (
								<div className="menu-item">
									<a href={`${getLanguagePrefix(language)}/how-it-works`}>
										<img src="/static/img/icon/how_works.svg" alt="how_works" />
										{t("header.howItWorks")}
									</a>
								</div>
							)}
						</div>
					</div>
					{this.isMobile && !isBanned && isAuthorizedSocket && isAuthorizedNode && (
						<div className="additional-header-mobile">
							<Row className="align-items-center">
								<Col xs="7">
									<WalletSection isRedDotNotify={isRedDotNotify} />
								</Col>
								<Col xs="5">
									<UserInfoSection />
								</Col>
							</Row>
						</div>
					)}
					{this.isMobile && !this.props.pathName.endsWith("/crowdfunding") && !isBanned && isAuthorizedSocket && isAuthorizedNode && (
						<Container fluid={true} className="fixed-to-bottom-header">
							<GameControlSection redDotStatus={{ isViewedWeeklyOffer, isViewedEventQuestion }} isShowOfferwallNotifications={notifications?.offerwall_visit?.is_show_notification} />
						</Container>
					)}
					<ToastContainer
						position="top-left"
						autoClose={3000}
						hideProgressBar
						newestOnTop={false}
						closeOnClick
						rtl={false}
						pauseOnVisibilityChange
						draggable
						pauseOnHover
						closeButton={<CloseButtonComponent />}
					/>
					{replenishmentModalStats.isOpen && <ReplenishmentModal wsReact={wsReact} />}
				</header>
				{isShowModalGenerateAddress && (
					<ModalGenerateAddress
						isShowModalGenerateAddress={isShowModalGenerateAddress}
						notifyData={notifications?.generate_new_address}
						closeModalGenerateAddress={this.closeModalGenerateAddress}
					/>
				)}
				{userInfo.isNeedShowInfluencersRewards && <InfluencerRewardsModal />}
			</Fragment>
		);
	}
}

const Header = withTranslation("Layout")(connect(mapStateToProps, null)(withRouter(HeaderClass)));
export default Header;
