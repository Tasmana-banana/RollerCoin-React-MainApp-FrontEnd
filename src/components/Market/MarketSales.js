import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Col, Row } from "reactstrap";
import LazyLoad from "react-lazyload";
import { withTranslation } from "react-i18next";
import fetchWithToken from "../../services/fetchWithToken";
import parseMarketProducts from "../../services/parseMarketProducts";
import MarketProductCard from "./MarketProductCard";
import MarketDailyOffer from "./MarketDailyOffer";
import MarketAppearanceCard from "./MarketAppearanceCard";
import InfoBlockWithIcon from "../SingleComponents/InfoBlockWithIcon";

import * as actions from "../../actions/userInfo";

import loaderImg from "../../assets/img/loader_sandglass.gif";

const mapStateToProps = (state) => ({
	balance: state.game.balance,
	language: state.game.language,
	isViewedWeeklyOffer: state.user.isViewedWeeklyOffer,
	wsNode: state.webSocket.wsNode,
	isMobile: state.game.isMobile,
});

const mapDispatchToProps = (dispatch) => ({
	setViewedWeeklyOffer: (state) => dispatch(actions.setViewedWeeklyOffer(state)),
});

class MarketSales extends Component {
	static propTypes = {
		balance: PropTypes.number.isRequired,
		language: PropTypes.string.isRequired,
		toggleActiveProduct: PropTypes.func.isRequired,
		activeProductId: PropTypes.string.isRequired,
		buyAction: PropTypes.func.isRequired,
		wsReact: PropTypes.object.isRequired,
		wsNode: PropTypes.object.isRequired,
		t: PropTypes.func.isRequired,
		isViewedWeeklyOffer: PropTypes.bool.isRequired,
		setViewedWeeklyOffer: PropTypes.func.isRequired,
		isMobile: PropTypes.bool.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			products: [],
			promotion: {},
			isLoading: true,
		};
		this.useMarketProductCard = ["miner", "rack"];
		this.useMarketAppearanceCard = ["appearance"];
		this.controllers = {};
		this.signals = {};
	}

	onWSNodeMessage = (event) => {
		const data = JSON.parse(event.data);
		const { cmd, value } = data;
		switch (cmd) {
			case "promo_sold_updated":
				this.updatePromoLeftForSale(value);
				break;
			case "discount_sold_updated":
				this.updateProductsLeftForSale(value);
				break;
			default:
				break;
		}
	};

	updatePromoLeftForSale = (data) => {
		const { promotion } = this.state;
		const updatedPromotionItems = promotion.items.map((item) => {
			if (item.discountId === data.discount_id && item.sold < data.left_for_sale) {
				item.sold = data.left_for_sale;
			}
			if (item.discountId === data.discount_id && promotion.userId === data.user_id) {
				item.purchasedUserCount += +data.purchasedQty;
			}
			return item;
		});
		this.setState({
			promotion: { ...promotion, items: updatedPromotionItems },
		});
	};

	updateProductsLeftForSale = (data) => {
		const { products } = this.state;

		const productsLeftForSale = products.filter((item) => (item.discountId === data.discount_id && item.limit > data.left_for_sale) || item.discountId !== data.discount_id);

		const updatedProductsItems = productsLeftForSale.map((item) => {
			if (item.discountId === data.discount_id && item.sold < data.left_for_sale) {
				item.sold = data.left_for_sale;
			}
			if (item.discountId === data.discount_id && data.limit === data.left_for_sale) {
				item.limit = 0;
			}
			if (item.discountId === data.discount_id && data.limit < data.left_for_sale) {
				item.limit = data.limit;
			}
			return item;
		});

		this.setState({
			products: updatedProductsItems,
		});
	};

	componentDidMount() {
		const { isViewedWeeklyOffer, setViewedWeeklyOffer, wsNode } = this.props;
		this.initialization();
		if (!isViewedWeeklyOffer) {
			localStorage.setItem("last_date_of_view_weekly_offer", new Date().toISOString());
			setViewedWeeklyOffer(true);
		}
		if (wsNode && !wsNode.listenersMessage.promoUpdates) {
			wsNode.setListenersMessage({ promoUpdates: this.onWSNodeMessage });
		}
	}

	initialization = async () => {
		await Promise.all([this.getSales(), this.getPromotion()]);
		this.setState({
			isLoading: false,
		});
	};

	componentWillUnmount() {
		const { wsNode } = this.props;
		if (wsNode) {
			wsNode.removeListenersMessage("promoUpdates");
		}
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

	getSales = async () => {
		this.createSignalAndController("sales");
		try {
			const json = await fetchWithToken("/api/market/get-sales", {
				method: "GET",
				signal: this.signals.sales,
			});
			if (!json.success || !json.data.available || !json.data.items.length) {
				return false;
			}
			const products = json.data.items.map((item) => parseMarketProducts(item, item.discount.item_type));
			this.setState({
				products,
			});
			return true;
		} catch (e) {
			console.error(e);
		}
	};

	getPromotion = async () => {
		this.createSignalAndController("promotion");
		try {
			const json = await fetchWithToken(`/api/market/get-promotion`, {
				method: "GET",
				signal: this.signals.promotion,
			});
			if (!json.success || !json.data.available) {
				return false;
			}

			const promotion = {
				userId: json.data.user_id,
				name: json.data.name,
				from: json.data.from,
				to: json.data.to,
				items: json.data.items.map((item) => parseMarketProducts(item, item.discount.item_type)),
			};

			this.setState({
				promotion,
			});
			return true;
		} catch (e) {
			console.error(e);
		}
	};

	buyProduct = async (item, isPromo = false) => {
		const { buyAction } = this.props;
		const buySuccess = await buyAction(item, isPromo);
		if (item.type === "appearance" && buySuccess) {
			await Promise.all([this.getSales(), this.getPromotion()]);
		}
	};

	render() {
		const { activeProductId, toggleActiveProduct, wsReact, isMobile } = this.props;
		const { products, promotion, isLoading } = this.state;
		return (
			<div className="products-page">
				{isLoading && (
					<div className="market-preloader">
						<LazyLoad offset={100}>
							<img src={loaderImg} height={126} width={126} className="loader-img" alt="preloader" />
						</LazyLoad>
					</div>
				)}
				{!isLoading && (
					<Fragment>
						<Row>
							<Col xs={12}>
								{<InfoBlockWithIcon tName="Game" message="salesAndPopularInfoMessage" obj="infoHints" showButtons={isMobile} />}
								{!!Object.keys(promotion).length && (
									<MarketDailyOffer wsReact={wsReact} promotion={promotion} activeProductId={activeProductId} toggleActiveProduct={toggleActiveProduct} buyAction={this.buyProduct} />
								)}
							</Col>
						</Row>
						<Row>
							{products
								.filter((item) => this.useMarketProductCard.includes(item.type))
								.map((item) => (
									<MarketProductCard
										key={item.id}
										wsReact={wsReact}
										item={item}
										activeProductId={activeProductId}
										toggleActiveProduct={toggleActiveProduct}
										buyAction={this.buyProduct}
									/>
								))}
							{products
								.filter((item) => this.useMarketAppearanceCard.includes(item.type))
								.map((item) => (
									<MarketAppearanceCard key={item.id} item={item} isSetAvailable={false} buyAction={this.buyProduct} />
								))}
						</Row>
					</Fragment>
				)}
			</div>
		);
	}
}

export default withTranslation("Game")(connect(mapStateToProps, mapDispatchToProps)(MarketSales));
