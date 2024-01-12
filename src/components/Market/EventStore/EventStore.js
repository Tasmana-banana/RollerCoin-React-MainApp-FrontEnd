import React, { Component, Fragment } from "react";
import { Row } from "reactstrap";
import { connect } from "react-redux";
import LazyLoad from "react-lazyload";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { withTranslation } from "react-i18next";
import fetchWithToken from "../../../services/fetchWithToken";
import getCurrencyConfig from "../../../services/getCurrencyConfig";
import MarketBanner from "../MarketBanner";
import BonusBoxModal from "../BonusBoxModal";
import EventStoreCard from "./EventStoreCard";
import InfoBlockWithIcon from "../../SingleComponents/InfoBlockWithIcon";
import RollerButton from "../../SingleComponents/RollerButton";
import getLanguagePrefix from "../../../services/getLanguagePrefix";
import decimalAdjust from "../../../services/decimalAdjust";

import { MARKET_STORE_TYPE } from "../../../constants/Market";

import loaderImg from "../../../assets/img/loader_sandglass.gif";
import schedulerBlackIcon from "../../../assets/img/icon/scheduler_black.svg";

const mapStateToProps = (state) => ({
	balance: state.game.balance,
	language: state.game.language,
	isMobile: state.game.isMobile,
	wsNode: state.webSocket.wsNode,
	isViewedTutorial: state.user.userViewedTutorial,
});

class EventStore extends Component {
	static propTypes = {
		buyAction: PropTypes.func.isRequired,
		language: PropTypes.string.isRequired,
		toggleActiveProduct: PropTypes.func.isRequired,
		activeProductId: PropTypes.string.isRequired,
		wsReact: PropTypes.object.isRequired,
		wsNode: PropTypes.object.isRequired,
		isMobile: PropTypes.bool.isRequired,
		isViewedTutorial: PropTypes.object.isRequired,
		t: PropTypes.func.isRequired,
		history: PropTypes.object.isRequired,
		storeType: PropTypes.string.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			isLoading: true,
			isProcessing: false,
			isOpenPresentationModal: false,
			boxContent: {
				amount: 0,
				baseColor: "ffffff",
				itemId: null,
				lootBoxId: null,
				type: null,
				name: null,
				power: 0,
			},
			products: [],
		};
		this.controller = new AbortController();
		this.signal = this.controller.signal;
	}

	componentDidMount = async () => {
		const { wsNode } = this.props;
		await this.getEventStore();
		if (wsNode && !wsNode.listenersMessage.seasonStore) {
			wsNode.setListenersMessage({ seasonStore: this.onWSNodeMessage });
		}
	};

	componentDidUpdate = async (prevProps) => {
		const { storeType } = this.props;
		if (prevProps.storeType !== storeType) {
			this.setState({
				isLoading: true,
			});
			await this.getEventStore();
		}
	};

	componentWillUnmount() {
		const { wsNode } = this.props;
		if (wsNode) {
			wsNode.removeListenersMessage("seasonStore");
		}
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

	onWSNodeMessage = (event) => {
		const data = JSON.parse(event.data);
		const { cmd, value } = data;
		switch (cmd) {
			case "seasonStore_updated":
				this.handleLimitUpdate(value);
				break;
			default:
				break;
		}
	};

	handleLimitUpdate = (value) => {
		const { products } = this.state;
		const { loot_box_id: lootBoxId, left_for_sale: leftForSale } = value;
		const nextState = products.map((item) => (item._id !== lootBoxId ? item : { ...item, sold: item.limit_for_sale - leftForSale }));
		this.setState({ products: nextState });
	};

	getEventStore = async () => {
		const { storeType } = this.props;
		const apiUrl = `/api/market/event-store/?event=${storeType}`;
		this.createSignalAndController();
		try {
			const json = await fetchWithToken(apiUrl, {
				method: "GET",
				signal: this.signal,
			});
			if (!json.success) {
				return false;
			}
			const sortItems = json.data.items
				.map((item, index) => {
					let itemPosition = 1 + index;
					if (item.item_type === "loot_box" || item.item_type === "battery") {
						itemPosition = 0;
					}
					return { ...item, item_position: itemPosition };
				})
				.sort((a, b) => a.item_position - b.item_position);

			this.setState({
				products: sortItems,
			});
		} catch (e) {
			console.error(e);
		} finally {
			this.setState({
				isLoading: false,
			});
		}
	};

	buyProductStore = async (id, type) => {
		const { buyAction, wsReact, storeType } = this.props;
		const rstConfig = getCurrencyConfig("RST");
		this.setState({ isProcessing: true });
		const bonus = await buyAction({ id, type, qty: 1 }, false, storeType);

		await this.getEventStore();

		if (!bonus || type !== "loot_box") {
			return this.setState({ isProcessing: false });
		}

		this.setState({
			isProcessing: false,
			isOpenPresentationModal: true,
			boxContent: {
				amount: bonus.type === "RLT" ? decimalAdjust(bonus.amount / rstConfig.toSmall, 2) : bonus.amount,
				baseColor: bonus.base_color_hex,
				itemId: bonus.item_id,
				lootBoxId: bonus.loot_box_id,
				type: bonus.type,
				name: bonus.name,
				power: bonus.power || 0,
				filename: bonus.filename || "",
			},
		});
		wsReact.send(JSON.stringify({ cmd: "balance_request" }));
	};

	closeModal = () => this.setState({ isOpenPresentationModal: false });

	backToEvent = () => {
		const { history, language, storeType } = this.props;
		if (storeType === MARKET_STORE_TYPE.SYSTEM_SALES_EVENT) {
			history.push(`${getLanguagePrefix(language)}/special-event`);
		}
	};

	render() {
		const { activeProductId, toggleActiveProduct, wsReact, language, t, storeType } = this.props;
		const { isLoading, products, isProcessing, boxContent, isOpenPresentationModal } = this.state;
		const isShowBackButton = storeType === MARKET_STORE_TYPE.SYSTEM_SALES_EVENT;
		return (
			<Fragment>
				{!isLoading && <InfoBlockWithIcon tName="Game" message="specialEventStoreInfoMessage" obj="infoHints" showButtons />}
				{isOpenPresentationModal && <BonusBoxModal isOpen={isOpenPresentationModal} closeModal={this.closeModal} boxContent={boxContent} language={language} />}
				<div className="products-page">
					<MarketBanner />
					<Row>
						{!isLoading &&
							products.map((item) => {
								const { item_info: itemInfo } = item;
								const isAvailableProduct = !itemInfo.limit_for_sale || itemInfo.limit_for_sale > itemInfo.sold;
								const isPurchasedProduct = itemInfo.user_products?.room_skin_appearance_id !== itemInfo._id && itemInfo.user_products?.hats_id !== itemInfo._id;
								return (
									<EventStoreCard
										key={item._id}
										item={item}
										buyProductStore={this.buyProductStore}
										isAvailableProduct={isAvailableProduct}
										isPurchasedProduct={isPurchasedProduct}
										isProcessing={isProcessing}
										activeProductId={activeProductId}
										toggleActiveProduct={toggleActiveProduct}
										wsReact={wsReact}
									/>
								);
							})}
					</Row>
					{!isLoading && isShowBackButton && (
						<div className="back-button-wrapper">
							<RollerButton className="back-event-button" action={this.backToEvent} color="cyan" size="default" text={t("market.backEvent")} width={100} icon={schedulerBlackIcon} />
						</div>
					)}
					{isLoading && (
						<div className="market-preloader">
							<LazyLoad offset={100}>
								<img src={loaderImg} height={126} width={126} className="loader-img" alt="sales" />
							</LazyLoad>
						</div>
					)}
				</div>
			</Fragment>
		);
	}
}

export default withRouter(withTranslation("Game")(connect(mapStateToProps, null)(EventStore)));
