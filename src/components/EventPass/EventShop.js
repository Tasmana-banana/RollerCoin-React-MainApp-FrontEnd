import React, { Component, Fragment } from "react";
import { Link, Route } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import { Row, Col, Nav, NavItem, NavLink } from "reactstrap";
import LazyLoad from "react-lazyload";
import { toast } from "react-toastify";
import fetchWithToken from "../../services/fetchWithToken";
import decimalAdjust from "../../services/decimalAdjust";
import getCurrencyConfig from "../../services/getCurrencyConfig";
import getLanguagePrefix from "../../services/getLanguagePrefix";
import threeDigitDivisor from "../../services/threeDigitDivisor";
import electricityToast from "../../services/electricityToast";
import getPrefixPower from "../../services/getPrefixPower";
import UpgradeSeasonPassModal from "./UpgradeSeasonPassModal";
import SeasonTutorialModal from "./SeasonTutorialModal";
import MarketEventBanner from "./MarketEventBanner";
import SeasonRewards from "./SeasonRewards";
import QuestsList from "../SingleComponents/Quests/QuestsList";
import EventStaticInfoBlock from "./EventStaticInfoBlock";
import CongratsGoldPurchasesModal from "./CongratsGoldPurchasesModal";
import { REWARD_TYPES } from "../../constants/Game/Market";

import "../../assets/scss/Game/EventShop.scss";
import "pure-react-carousel/dist/react-carousel.es.css";

import schedulerIcon from "../../assets/img/icon/scheduler.svg";
import schedulerActiveIcon from "../../assets/img/icon/scheduler_black.svg";
import rewardIcon from "../../assets/img/icon/reward.svg";
import rewardActiveIcon from "../../assets/img/icon/reward_active.svg";
import errorNotice from "../../assets/img/icon/error_notice.svg";
import cartSuccessIcon from "../../assets/img/icon/cart_successfully_notice.svg";
import loaderImg from "../../assets/img/loader_sandglass.gif";
import levelUpIcon from "../../assets/img/seasonPass/icon/level_up.svg";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	pathName: state.router.location.pathname,
	balance: state.game.balance,
	isMobile: state.game.isMobile,
	language: state.game.language,
	isViewedTutorial: state.user.userViewedTutorial,
	isViewedEventQuestion: state.user.isViewedEventQuestion,
});

class EventShop extends Component {
	static propTypes = {
		t: PropTypes.func.isRequired,
		balance: PropTypes.object.isRequired,
		isMobile: PropTypes.bool.isRequired,
		language: PropTypes.string.isRequired,
		pathName: PropTypes.string.isRequired,
		wsReact: PropTypes.object.isRequired,
		isViewedEventQuestion: PropTypes.bool.isRequired,
		isViewedTutorial: PropTypes.object.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			season: null,
			seasonPass: null,
			premiumSeasonPass: null,
			claimAllPass: null,
			seasonLevelPass: null,
			isShowTutorial: false,
			isClaimedAllPassRewards: false,
			rewards: [],
			rewardsOnBanner: [],
			userStats: {
				xp: 0,
				user_level: 1,
				is_max_xp: false,
			},
			userSeasonPassLevel: 0,
			isLoading: true,
			isBuyProcessing: false,
			isShowConfirmationSeasonPass: false,
			isShowConfirmationClaimAll: false,
			isShowModalCongratsGoldPurchases: false,
			isUserMaxXp: false,
			isEmptySeasonPass: false,
			isDisabledUpgradeModal: false,
			claimAllStats: {
				miners: 0,
				money: 0,
			},
			isShowUpgradeModal: false,
		};
		this.MS_TO_DAYS = 86400000;
		this.controllers = {};
		this.signals = {};
		this.toastDefaultConfig = {
			position: "top-left",
			autoClose: 3000,
			hideProgressBar: true,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
		};
	}

	static renderToast(text, icon) {
		return (
			<div className="content-with-image">
				<img src={icon} alt="market notification" />
				<span>{text}</span>
			</div>
		);
	}

	createSignalAndController = (id) => {
		if (this.controllers[id]) {
			this.controllers[id].abort();
		}
		this.controllers[id] = new AbortController();
		this.signals[id] = this.controllers[id].signal;
	};

	componentDidMount() {
		this.initialization();
	}

	initialization = async () => {
		await this.getData();
	};

	componentDidUpdate(prevProps, prevState) {
		const { pathName } = this.props;
		if (prevProps.pathName !== pathName && prevProps.pathName.endsWith("/season-pass/quests") && pathName.endsWith("/season-pass")) {
			this.getData(true);
		}
	}

	componentWillUnmount() {
		Object.keys(this.controllers).forEach((key) => {
			if (this.controllers[key]) {
				this.controllers[key].abort();
			}
		});
	}

	calculatePrice = (pass) => {
		const { balance } = this.props;
		if (!pass) {
			return null;
		}
		const currencyConfig = getCurrencyConfig(pass.currency ? pass.currency : "RLT");
		const adjustedOldPrice = pass.price_without_discount ? decimalAdjust(pass.price_without_discount / currencyConfig.toSmall, 2) : 0;
		return { ...pass, oldPrice: adjustedOldPrice, isEnoughToBuy: balance[currencyConfig.code] >= pass.price, currencyToSmall: currencyConfig.toSmall };
	};

	getData = async (disableLoader = false) => {
		if (!disableLoader) {
			this.setState({ isLoading: true });
		}
		await this.getPass();
		this.setState({ isLoading: false });
	};

	toggleModalTutorial = () => {
		const { isShowTutorial } = this.state;

		this.setState({
			isShowTutorial: !isShowTutorial,
		});
	};

	getPass = async () => {
		this.createSignalAndController("getPass");
		try {
			const json = await fetchWithToken("/api/season/event-config", {
				method: "GET",
				signal: this.signals.getPass,
			});
			if (!json.success || !json.data.season) {
				this.setState({
					isLoading: false,
					isBuyProcessing: false,
				});
				return false;
			}
			const isEmptySeasonPass = !json.data.season_pass && !json.data.claim_all_pass && !json.data.premium_season_pass;
			this.setState({
				seasonPass: this.calculatePrice(json.data.season_pass),
				claimAllPass: this.calculatePrice(json.data.claim_all_pass),
				premiumSeasonPass: this.calculatePrice(json.data.premium_season_pass),
				seasonLevelPass: this.calculatePrice(json.data.season_level_pass),
				isBuyProcessing: false,
				season: json.data.season,
				userSeasonPassLevel: json.data.user_season_pass_level,
				isEmptySeasonPass,
			});

			if (json.data.user_season_pass_level < 1) {
				await this.buySeasonPass(json.data.season_pass._id, true, true);
				this.toggleModalTutorial();
			}
			if (!isEmptySeasonPass) {
				await this.getRewards();
			}
		} catch (e) {
			console.error(e);
		}
	};

	getRewards = async () => {
		this.createSignalAndController("getRewards");
		try {
			const json = await fetchWithToken("/api/season/event-user-stats?info=all", {
				method: "GET",
				signal: this.signals.getRewards,
			});
			if (!json.success || !json.data.rewards) {
				this.setState({ isLoading: false });
				return false;
			}
			const adjustedRewards = json.data.rewards.map((reward) => {
				if (reward.type === "power") {
					const ttlTime = Math.round(reward.ttl_time / this.MS_TO_DAYS);
					return { ...reward, ttl_time: ttlTime };
				}
				if (reward.type === "money") {
					const currencyConfig = getCurrencyConfig(reward.currency || "RLT");
					const amount = decimalAdjust(reward.amount / currencyConfig.toSmall, currencyConfig.precision);
					return { ...reward, amount };
				}
				if (reward.type === "miner") {
					const power = threeDigitDivisor(reward.product.power);
					return { ...reward, product: { ...reward.product, power } };
				}
				return reward;
			});
			const rewards = adjustedRewards
				.map((reward) => {
					const newTitle = { en: reward.title.en, cn: reward.title.cn };
					const newDescription = { en: reward.description.en, cn: reward.description.cn };
					Object.keys(reward.additional_data).forEach((key) => {
						const insertText = reward.additional_data[key].split(".").reduce((acc, val) => acc[val], reward);
						const adjustedText = reward.type === "power" && key === "{amount}" ? `${getPrefixPower(insertText).power} ${getPrefixPower(insertText).hashDetail}` : insertText;
						newTitle.en = newTitle.en.replace(key, adjustedText);
						newTitle.cn = newTitle.cn.replace(key, adjustedText);
						newDescription.en = newDescription.en.replace(key, adjustedText);
						newDescription.cn = newDescription.cn.replace(key, adjustedText);
					});
					return { ...reward, title: newTitle, description: newDescription };
				})
				.sort((a, b) => a.required_level - b.required_level);
			const rewardsOnBanner = rewards.filter((reward) => reward.is_shown_on_banner).sort((a, b) => a.sort - b.sort);

			const { miner, money } = rewards.reduce(
				(accum, currentValue) => {
					accum[currentValue.type] += currentValue.amount;
					return accum;
				},
				{ miner: 0, money: 0 }
			);

			this.setState({
				claimAllStats: {
					miners: miner,
					money,
				},
			});

			const normalizedRewards = {};
			rewards.forEach((item) => {
				const { required_level: requiredLevel, pass_level: passLevel } = item;
				if (!normalizedRewards[requiredLevel]) {
					normalizedRewards[requiredLevel] = {
						[REWARD_TYPES.FREE]: {},
						[REWARD_TYPES.GOLD]: {},
					};
				}
				const levelType = passLevel === 1 ? REWARD_TYPES.FREE : REWARD_TYPES.GOLD;
				normalizedRewards[requiredLevel][levelType] = item;
			});

			const isDisabledUpgradeModal = !this.state.seasonPass && !json.data.is_claimed_all_pass_rewards && json.data.is_max_xp;

			this.setState({
				isLoading: false,
				rewards: Object.values(normalizedRewards),
				rewardsOnBanner,
				userStats: { user_level: json.data.user_stats.user_level, xp: json.data.user_stats.xp, is_max_xp: json.data.is_max_xp },
				isClaimedAllPassRewards: json.data.is_claimed_all_pass_rewards,
				isUserMaxXp: json.data.is_max_xp,
				isDisabledUpgradeModal,
			});
		} catch (e) {
			console.error(e);
		}
	};

	refreshBalance = () => {
		this.props.wsReact.send(
			JSON.stringify({
				cmd: "balance_request",
			})
		);
	};

	claimedRewards = (id = null, rewardType = null) => {
		const { rewards } = this.state;

		const newRewards = rewards.map((reward) => {
			const newRewardItem = { ...reward };
			if (id && newRewardItem[rewardType].id === id) {
				newRewardItem[rewardType] = { ...newRewardItem[rewardType], is_ready_to_claim: false, is_claimed: true };
			}
			if (!id && newRewardItem[REWARD_TYPES.GOLD].is_ready_to_claim) {
				newRewardItem[REWARD_TYPES.GOLD] = { ...newRewardItem[REWARD_TYPES.GOLD], is_ready_to_claim: false, is_claimed: true };
			}
			if (!id && newRewardItem[REWARD_TYPES.FREE].is_ready_to_claim) {
				newRewardItem[REWARD_TYPES.FREE] = { ...newRewardItem[REWARD_TYPES.FREE], is_ready_to_claim: false, is_claimed: true };
			}
			return newRewardItem;
		});

		const isNotAllClaimed = newRewards.some((reward) => Object.values(reward).some((item) => !item.is_claimed));

		if (!isNotAllClaimed) {
			this.getData();
		}
		this.refreshBalance();
		this.setState({ rewards: newRewards });
	};

	buySuccess = async (disabledLoader = true, disabledToast = false) => {
		if (!disabledToast) {
			toast(this.constructor.renderToast("Successful purchase!", cartSuccessIcon), this.toastDefaultConfig);
		}
		this.refreshBalance();
		await this.getData(disabledLoader);
	};

	buySeasonPass = async (id, isFirstLevel = false, disabledToast = false) => {
		const { seasonPass } = this.state;
		if (!seasonPass) {
			return null;
		}
		this.setState({
			isBuyProcessing: true,
		});

		this.createSignalAndController("seasonPass");
		try {
			const json = await fetchWithToken("/api/season/buy-season-pass", {
				method: "POST",
				body: JSON.stringify({
					id,
				}),
				signal: this.signals.seasonPass,
			});
			if (!json.success) {
				toast(this.constructor.renderToast("Sorry, purchase failed!", errorNotice), this.toastDefaultConfig);
				this.setState({ isBuyProcessing: false });
				return false;
			}
			if (!isFirstLevel) {
				this.toggleModalCongratsGoldPurchases();
			}
			await this.buySuccess(false, disabledToast);
			if (!json.data) {
				return false;
			}
			if (json.data.is_batteries_autouse) {
				const { t } = this.props;
				electricityToast(true, t("header.autoRechargeActivated"));
			}
		} catch (e) {
			console.error(e);
		}
	};

	buyClaimAll = async (id) => {
		const { claimAllPass } = this.state;
		if (!claimAllPass) {
			return null;
		}
		this.setState({
			isBuyProcessing: true,
		});
		this.createSignalAndController("claimAllPass");
		try {
			const json = await fetchWithToken("/api/season/buy-claim-all", {
				method: "POST",
				body: JSON.stringify({
					id,
				}),
				signal: this.signals.claimAllPass,
			});
			if (!json.success) {
				toast(this.constructor.renderToast("Sorry, purchase failed!", errorNotice), this.toastDefaultConfig);
				this.setState({ isBuyProcessing: false });
				return false;
			}
			await this.buySuccess(false);
			if (!json.data) {
				return false;
			}
			const isRewardError = json.data.some((item) => !item.success);
			if (isRewardError) {
				toast(this.constructor.renderToast("There was an error while received rewards, contact with support!", errorNotice), this.toastDefaultConfig);
				return false;
			}
			json.data.forEach(() => toast(this.constructor.renderToast("You have received a new gift from Event pass!", cartSuccessIcon), this.toastDefaultConfig));
		} catch (e) {
			console.error(e);
		}
	};

	buyLevel = async (e) => {
		e.preventDefault();
		this.createSignalAndController("buyLevel");
		this.setState({ isBuyProcessing: true });
		try {
			const json = await fetchWithToken("/api/season/buy-level", {
				method: "POST",
				signal: this.signals.buyLevel,
			});
			if (!json.success) {
				toast(this.constructor.renderToast("Sorry, purchase failed!", errorNotice), this.toastDefaultConfig);
				this.setState({ isBuyProcessing: false });
				return false;
			}
			await this.buySuccess();
		} catch (error) {
			console.error(error);
		}
	};

	levelUpToast = () => {
		toast(
			this.constructor.renderToast(
				<span>
					Your <span className="accent-text">Season pass</span> level increased
				</span>,
				levelUpIcon
			),
			this.toastDefaultConfig
		);
	};

	isTabActive = (path) => {
		const { pathName } = this.props;
		return pathName.endsWith(path);
	};

	toggleUpgradeModal = () => {
		const { isShowUpgradeModal } = this.state;
		this.setState({
			isShowUpgradeModal: !isShowUpgradeModal,
		});
	};

	claimedQuestSuccess = async () => {
		await this.getData(true);
	};

	toggleModalCongratsGoldPurchases = () => {
		const { isShowModalCongratsGoldPurchases } = this.state;

		this.setState({
			isShowModalCongratsGoldPurchases: !isShowModalCongratsGoldPurchases,
		});
	};

	render() {
		const { language, isViewedEventQuestion, t } = this.props;
		const {
			isLoading,
			isBuyProcessing,
			season,
			seasonPass,
			claimAllPass,
			rewards,
			userStats,
			seasonLevelPass,
			isShowUpgradeModal,
			claimAllStats,
			premiumSeasonPass,
			isShowTutorial,
			isShowModalCongratsGoldPurchases,
			isClaimedAllPassRewards,
			isUserMaxXp,
			isEmptySeasonPass,
			isDisabledUpgradeModal,
		} = this.state;

		const { isMobile } = this.props;

		const buySeasonType = () => {
			if (premiumSeasonPass) {
				return this.buySeasonPass;
			}
			if (!premiumSeasonPass && !claimAllPass) {
				return this.buySeasonPass;
			}

			if (!premiumSeasonPass && claimAllPass) {
				return this.buyClaimAll;
			}
		};

		return (
			<Fragment>
				{isLoading && (
					<div className="season-preloader">
						<LazyLoad offset={100}>
							<img src={loaderImg} height={126} width={126} className="loader-img" alt="preloader" />
						</LazyLoad>
					</div>
				)}
				{!isLoading && (
					<Row>
						<Col xs={12} className="event-shop-container">
							{!season && (
								<Row noGutters={true} className="event-shop">
									<p className="event-shop-not-available">There are no events at the moment.</p>
								</Row>
							)}
							{!!season && (
								<Fragment>
									{isShowTutorial && <SeasonTutorialModal isShowTutorial={isShowTutorial} toggleModal={this.toggleModalTutorial} />}

									<MarketEventBanner dateEnd={season.end_date} seasonId={season._id} action={this.toggleModalTutorial} />
									<EventStaticInfoBlock youtubeId={season.youtube_id} seasonContent={season.season_content} />
									{isShowUpgradeModal && (
										<UpgradeSeasonPassModal
											isShowUpgradeModal={isShowUpgradeModal}
											seasonPass={seasonPass}
											season={season}
											premiumSeasonPass={premiumSeasonPass || claimAllPass}
											buySeasonPass={buySeasonType()}
											toggleUpgradeModal={this.toggleUpgradeModal}
											claimAllStats={claimAllStats}
											isClaimedAllPassRewards={isClaimedAllPassRewards}
										/>
									)}
									{isShowModalCongratsGoldPurchases && (
										<CongratsGoldPurchasesModal
											isShowModalCongratsGoldPurchases={isShowModalCongratsGoldPurchases}
											toggleModalCongratsGoldPurchases={this.toggleModalCongratsGoldPurchases}
											seasonId={season._id}
										/>
									)}
									{!!rewards.length && isMobile && !isEmptySeasonPass && (
										<Fragment>
											<Row noGutters={true}>
												<Col xs="12">
													<Nav pills className="event-pass-nav">
														<NavItem>
															<NavLink
																tag={Link}
																className={this.isTabActive("season-pass") ? "active" : ""}
																to={`${getLanguagePrefix(language)}/game/market/season-pass`}
															>
																<img
																	src={this.isTabActive("season-pass") ? rewardActiveIcon : rewardIcon}
																	width={24}
																	height={24}
																	alt="event quests"
																	className="event-tab-img"
																/>
																<span>{t("eventPass.rewards")}</span>
															</NavLink>
														</NavItem>
														<NavItem>
															<NavLink
																tag={Link}
																className={this.isTabActive("season-pass/quests") ? "active" : ""}
																to={`${getLanguagePrefix(language)}/game/market/season-pass/quests`}
															>
																<img
																	src={this.isTabActive("season-pass/quests") ? schedulerActiveIcon : schedulerIcon}
																	width={24}
																	height={24}
																	alt="season rewards"
																	className="event-tab-img"
																/>
																<span>{t("eventPass.eventQuests")}</span>
																{!isViewedEventQuestion && <span className="red-dot" />}
															</NavLink>
														</NavItem>
													</Nav>
												</Col>
											</Row>
											<Row noGutters={true}>
												<Col xs="12">
													<Route
														exact
														path={`${getLanguagePrefix(language)}/game/market/season-pass`}
														render={() => (
															<SeasonRewards
																season={season}
																rewards={rewards}
																userStats={userStats}
																isClaimedAllPassRewards={isClaimedAllPassRewards}
																seasonLevelPassBuyConfig={seasonLevelPass}
																isBuyProcessing={isBuyProcessing}
																buyLevelHandler={this.buyLevel}
																claimedRewards={this.claimedRewards}
																toggleUpgradeModal={this.toggleUpgradeModal}
																isDisabledUpgradeModal={isDisabledUpgradeModal}
															/>
														)}
													/>
												</Col>
												<Col xs="12">
													<Route
														exact
														path={`${getLanguagePrefix(language)}/game/market/season-pass/quests`}
														render={() => (
															<QuestsList
																eventType="season"
																claimedQuestSuccess={this.claimedQuestSuccess}
																isClaimedAllPassRewards={isClaimedAllPassRewards}
																isUserMaxXp={isUserMaxXp}
																rewardToast={this.levelUpToast}
															/>
														)}
													/>
												</Col>
											</Row>
										</Fragment>
									)}
									{!!rewards.length && !isMobile && !isEmptySeasonPass && (
										<Row>
											<Col lg={6}>
												<SeasonRewards
													season={season}
													rewards={rewards}
													userStats={userStats}
													isClaimedAllPassRewards={isClaimedAllPassRewards}
													seasonLevelPassBuyConfig={seasonLevelPass}
													isBuyProcessing={isBuyProcessing}
													buyLevelHandler={this.buyLevel}
													claimedRewards={this.claimedRewards}
													toggleUpgradeModal={this.toggleUpgradeModal}
													isDisabledUpgradeModal={isDisabledUpgradeModal}
												/>
											</Col>
											<Col lg={6}>
												<QuestsList
													eventType="season"
													claimedQuestSuccess={this.claimedQuestSuccess}
													isClaimedAllPassRewards={isClaimedAllPassRewards}
													isUserMaxXp={isUserMaxXp}
													rewardToast={this.levelUpToast}
												/>
											</Col>
										</Row>
									)}
									{isEmptySeasonPass && (
										<Row noGutters={true}>
											<Col xs={12} className="event-empty-pass">
												<div className="event-empty-pass-block">
													<img
														src={`${process.env.STATIC_URL}/static/img/seasons/${season._id}/empty_season.gif?v=${new Date(season.last_updated).getTime()}`}
														alt="Empty season pass image"
													/>
												</div>
											</Col>
										</Row>
									)}
								</Fragment>
							)}
						</Col>
					</Row>
				)}
			</Fragment>
		);
	}
}
export default withTranslation("Game")(connect(mapStateToProps, null)(EventShop));
