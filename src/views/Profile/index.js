import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { Col, Container, Nav, NavItem, NavLink, Row } from "reactstrap";
import { Link, Route, Switch, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import getLanguagePrefix from "../../services/getLanguagePrefix";
import PersonalInfo from "../../components/Profile/PersonalInfo";
import ProfileStats from "../../components/Profile/ProfileStats";
import NftCollections from "../../components/Profile/NftCollections";
import IncomeStats from "../../components/Profile/IncomeStats";

import personalInfoImg from "../../assets/img/profile/personal-info.svg";
import profileStatsImg from "../../assets/img/profile/profile-stats.svg";
import incomeStatsImg from "../../assets/img/profile/income-stats.svg";
import nftCollectionImg from "../../assets/img/profile/nft-collection.svg";
import personalInfoDarkImg from "../../assets/img/profile/personal-info-dark.svg";
import profileStatsDarkImg from "../../assets/img/profile/profile-stats-dark.svg";
import incomeStatsDarkImg from "../../assets/img/profile/income-stats-dark.svg";
import nftCollectionDarkImg from "../../assets/img/profile/nft-collection-dark.svg";

import "../../assets/scss/Profile/main.scss";

const Profile = ({ wsReact }) => {
	const location = useLocation();
	const { t } = useTranslation("Profile");
	const isMobile = useSelector((state) => state.game.isMobile);
	const language = useSelector((state) => state.game.language);

	const routesConfig = {
		personalInfo: {
			path: [
				"/profile",
				"/cn/profile",
				"/pt/profile",
				"/es/profile",
				"/profile/personal-profile",
				"/cn/profile/personal-profile",
				"/pt/profile/personal-profile",
				"/es/profile/personal-profile",
			],
			name: "personal-profile",
			image: personalInfoImg,
			darkImage: personalInfoDarkImg,
		},
		profileStats: {
			path: ["/profile/profile-stats", "/cn/profile/profile-stats", "/es/profile/profile-stats", "/pt/profile/profile-stats"],
			name: "profile-stats",
			image: profileStatsImg,
			darkImage: profileStatsDarkImg,
		},
		incomeStats: {
			path: ["/profile/income-stats", "/cn/profile/income-stats", "/es/profile/income-stats", "/pt/profile/income-stats"],
			name: "income-stats",
			image: incomeStatsImg,
			darkImage: incomeStatsDarkImg,
		},
		nftCollection: {
			path: ["/profile/nft-collection", "/cn/profile/nft-collection", "/es/profile/nft-collection", "/pt/profile/nft-collection"],
			name: "nft-collection",
			image: nftCollectionImg,
			darkImage: nftCollectionDarkImg,
			isNew: false,
		},
	};

	const getCurrentRouteName = () => {
		const currentGroup = Object.keys(routesConfig).find((key) => routesConfig[key].path.includes(location.pathname));
		return currentGroup ? t(`linksName.${routesConfig[currentGroup].name}`) : "";
	};

	const isTabActive = (path) => path.includes(location.pathname) && !isMobile;

	return (
		<Fragment>
			<Container className="profile-container">
				<Row>
					<Col xs="12">
						{((isMobile && location.pathname.endsWith("/profile")) || !isMobile) && <h1 className="profile-title">{t("myProfile")}</h1>}
						{isMobile && !location.pathname.endsWith("/profile") && (
							<Row noGutters={true} className="mobile-header">
								<Link to={`${getLanguagePrefix(language)}/profile`} className="d-flex back-link">
									<span className="icon">
										<img src="/static/img/wallet/back_angle_white.svg" alt="back_angle" />
									</span>
									<span className="back-button-text">{t("back")}</span>
								</Link>
							</Row>
						)}
					</Col>
					{((isMobile && location.pathname.endsWith("/profile")) || !isMobile) && (
						<Col xs="12" lg="3" className="nav-pills-container">
							<Nav pills className="flex-column nav-pills w-100">
								{Object.keys(routesConfig).map((key) => (
									<NavItem key={key}>
										<NavLink
											tag={Link}
											to={`${getLanguagePrefix(language)}/profile/${routesConfig[key].name}`}
											className={`${isTabActive(routesConfig[key].path) ? "active" : ""} link-pill-ico product-pill`}
										>
											<div className="profile-nav-link">
												<div className="profile-nav-image">
													<img src={isTabActive(routesConfig[key].path) ? routesConfig[key].darkImage : routesConfig[key].image} width={22} height={22} alt={key} />
												</div>
												<span className="text-inherit">{t(`linksName.${routesConfig[key].name}`)}</span>
											</div>
											{routesConfig[key].isNew && (
												<div className="new-pill">
													<p className="new-pill-text">new</p>
												</div>
											)}
										</NavLink>
									</NavItem>
								))}
							</Nav>
						</Col>
					)}
					<Col xs="12" lg="9">
						<Switch>
							{!isMobile && <Route exact path={`${getLanguagePrefix(language)}/profile`} render={() => <PersonalInfo getCurrentRouteName={getCurrentRouteName} />} />}
							<Route exact path={`${getLanguagePrefix(language)}/profile/personal-profile`} render={() => <PersonalInfo getCurrentRouteName={getCurrentRouteName} />} />
							<Route exact path={`${getLanguagePrefix(language)}/profile/profile-stats`} render={() => <ProfileStats getCurrentRouteName={getCurrentRouteName} />} />
							<Route exact path={`${getLanguagePrefix(language)}/profile/income-stats`} render={() => <IncomeStats getCurrentRouteName={getCurrentRouteName} />} />
							<Route exact path={`${getLanguagePrefix(language)}/profile/nft-collection`} render={() => <NftCollections wsReact={wsReact} />} />
						</Switch>
					</Col>
				</Row>
			</Container>
		</Fragment>
	);
};

Profile.propTypes = {
	wsReact: PropTypes.object.isRequired,
};

export default Profile;
