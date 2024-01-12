import React, { Fragment, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import { Col, Row } from "reactstrap";
import { useTranslation } from "react-i18next";
import { LazyLoadImage } from "react-lazy-load-image-component";
import fetchWithToken from "../../services/fetchWithToken";
import RankHeader from "./Leaderboard/RankHeader";
import OffersHowToInfo from "./OffersHowToInfo";
import FeaturedOffers from "./FeaturedOffers";
import OffersProviderModal from "./OffersProviderModal";
import LeaderboardTutorial from "./LeaderboardTutorial";
import { CONTEST_TYPE } from "../../constants/Offerwall";

import "../../assets/scss/Offerwall/OffersList.scss";

import loaderImg from "../../assets/img/loader_sandglass.gif";
import noOffersYetImg from "../../assets/img/offerwall/no_offers_yet.png";
import InternalOffers from "./InternalOffers";

const OffersList = ({ contests, sponsoredProviders }) => {
	const uid = useSelector((state) => state.user.uid);
	const isMobile = useSelector((state) => state.game.isMobile);
	const tutorialModal = useSelector((state) => state.notification.tutorial_taskwall);
	const isNeedShowInfluencersRewards = useSelector((state) => state.user.isNeedShowInfluencersRewards);
	const { t } = useTranslation("Offerwall");
	const [providers, setProviders] = useState([]);
	const [currentProvider, setCurrentProvider] = useState({});
	const [isLoading, setIsLoading] = useState(true);
	const [isModalOpen, setIsModalOpen] = useState(false);

	let controller = new AbortController();
	let signals = controller.signal;

	const createSignalAndController = () => {
		if (controller) {
			controller.abort();
		}
		controller = new AbortController();
		signals = controller.signal;
	};

	useEffect(async () => {
		await getProviders();
		return () => {
			if (controller) {
				controller.abort();
			}
		};
	}, []);

	const getProviders = async () => {
		createSignalAndController();
		try {
			const json = await fetchWithToken("/api/offerwall/providers");
			if (!json.success) {
				return false;
			}
			if (!json.data) {
				return false;
			}
			const providersData = json.data.map((item) => {
				const url = item.iframe_url.replace("{uid}", uid);
				const { code, title, tag, multiplier, is_sponsored: isSponsored, sort, tag_color: tagColor, tag_text_color: tagTextColor } = item;
				return { code, title, tag, url, multiplier, isSponsored, sort, tagColor, tagTextColor };
			});
			const sortedProviders = providersData.sort((a, b) => a.sort - b.sort);
			setProviders(sortedProviders);
		} catch (e) {
			console.error(e);
		} finally {
			setIsLoading(false);
		}
	};

	const providerModalHandler = (providerCode) => {
		const current = providers.find((provider) => provider.code === providerCode);
		if (!current) {
			return false;
		}
		setCurrentProvider(current);
		setIsModalOpen(true);
	};

	const closeModalHandler = () => {
		setIsModalOpen(false);
	};

	const isContestActive = contests?.[CONTEST_TYPE.WEEKLY]?.isActive || contests?.[CONTEST_TYPE.GRAND]?.isActive;

	return (
		<Fragment>
			{isContestActive && (
				<div className="leaderboard-wrapper w-100">
					{" "}
					<RankHeader contests={contests} sponsoredProviders={sponsoredProviders} userBlock={true} />
				</div>
			)}
			<div className="offers-list-page">
				<FeaturedOffers isContestActive={isContestActive} />
				<InternalOffers isContestActive={isContestActive} provider={"offertoro"} />
				<div className="offers-list-block">
					<h3 className="offers-list-header">{t("taskAndSurveys")}</h3>
					<p className="offers-info-text">Check the list of our partners providing tasks for the Task Wall</p>
					<div className="offers-disclaimer-block">
						<p className="offers-disclaimer-text">
							<span>{t("attention")}: </span>
							{t("taskInfo")}
						</p>
					</div>
					{isLoading && (
						<div className="offers-list-preloader">
							<div className="loader-wrapper">
								<img src={loaderImg} height={126} width={126} className="loader-img" alt="loader" />
							</div>
						</div>
					)}
					{!isLoading && !providers.length && (
						<div className="no-offers-providers">
							<h3 className="text-center">{t("no_surveys_yet")}</h3>
							<div className="img-wrapper">
								<img src={noOffersYetImg} alt="No offers yet" width={240} height={123} />
							</div>
						</div>
					)}
					{!isLoading && !!providers.length && (
						<Row>
							{providers.map((provider) => (
								<Col xs={6} lg={4} key={provider.code} className={isMobile ? "mb-2" : "mb-3"}>
									<div className="offers-provider" onClick={() => providerModalHandler(provider.code)}>
										<div className="offers-provider-logo-wrapper">
											{provider.tag && (
												<div className="offers-provider-tag" style={{ background: provider.tagColor }}>
													<p className="offers-provider-tag-text" style={{ color: provider.tagTextColor }}>
														{provider.tag.toUpperCase()}
													</p>
												</div>
											)}
											<LazyLoadImage
												className="offers-provider-logo"
												width={240}
												height={64}
												src={`${process.env.STATIC_URL}/static/img/offerwalls/providers/${provider.code}.png?v=1.0.1`}
												alt={provider.title}
												threshold={100}
											/>
										</div>
										<p className="provider-view-btn">{t("view_task")}</p>
									</div>
								</Col>
							))}
						</Row>
					)}
				</div>
			</div>
			<OffersHowToInfo />
			{!isNeedShowInfluencersRewards && tutorialModal && tutorialModal.is_show_notification && <LeaderboardTutorial />}
			{isModalOpen && <OffersProviderModal isModalOpen={isModalOpen} closeModalHandler={closeModalHandler} currentProvider={currentProvider} />}
		</Fragment>
	);
};

OffersList.propTypes = {
	contests: PropTypes.object,
	sponsoredProviders: PropTypes.array,
};

export default OffersList;
