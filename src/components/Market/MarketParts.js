import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { Col, Row } from "reactstrap";
import LazyLoad from "react-lazyload";
import { withTranslation } from "react-i18next";
import getLanguagePrefix from "../../services/getLanguagePrefix";
import fetchWithToken from "../../services/fetchWithToken";
import parseMarketProducts from "../../services/parseMarketProducts";
import MarketBanner from "./MarketBanner";
import MarketPartCard from "./MarketPartCard";
import MarketSelectFilter from "./MarketSelectFilter";
import MarketPagination from "./MarketPagination";

import infoIcon from "../../assets/img/icon/info_box.svg";
import loaderImg from "../../assets/img/loader_sandglass.gif";

const mapStateToProps = (state) => ({
	balance: state.game.balance,
	language: state.game.language,
	isMobile: state.game.isMobile,
	wsNode: state.webSocket.wsNode,
});

class MarketParts extends Component {
	static propTypes = {
		balance: PropTypes.number.isRequired,
		language: PropTypes.string.isRequired,
		toggleActiveProduct: PropTypes.func.isRequired,
		activeProductId: PropTypes.string.isRequired,
		buyAction: PropTypes.func.isRequired,
		wsReact: PropTypes.object.isRequired,
		wsNode: PropTypes.object.isRequired,
		isMobile: PropTypes.bool.isRequired,
		t: PropTypes.func.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			products: [],
			options: {
				sort: "created",
				sort_direction: -1,
				skip: 0,
				limit: 24,
			},
			productsQuantity: 0,
			currentPageNumber: 1,
			pages: 1,
			paginationType: "all",
			isLoading: true,
		};
		this.defaultLimit = 24;
		this.controller = new AbortController();
		this.signal = this.controller.signal;
	}

	componentDidMount() {
		const { wsNode } = this.props;
		this.getParts(this.state.options, false);
		if (wsNode && !wsNode.listenersMessage.soldUpdates) {
			wsNode.setListenersMessage({ soldUpdates: this.onWSNodeMessage });
		}
	}

	componentWillUnmount() {
		const { wsNode } = this.props;
		if (wsNode) {
			wsNode.removeListenersMessage("soldUpdates");
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
			case "mutation_component_updated":
				this.updateProductLeftForSale(value);
				break;
			default:
				break;
		}
	};

	updateProductLeftForSale = (data) => {
		const { products } = this.state;
		const updatedItems = products.map((item) => {
			if (item.id === data.item_id && item.sold < data.left_for_sale) {
				return { ...item, sold: data.left_for_sale };
			}
			return item;
		});
		this.setState({
			products: updatedItems,
		});
	};

	getParts = async (options, isLoadMore) => {
		const { products } = this.state;
		const apiUrl = options ? `/api/market/get-parts?sort=${options.sort}&sort_direction=${options.sort_direction}&skip=${options.skip}&limit=${options.limit}` : `/api/market/get-miners`;
		this.createSignalAndController();
		try {
			const json = await fetchWithToken(apiUrl, {
				method: "GET",
				signal: this.signal,
			});
			if (!json.success) {
				return false;
			}
			let receivedProducts = json.data.items.map((item) => parseMarketProducts(item, "mutation_component"));
			if (isLoadMore) {
				receivedProducts = [...products, ...receivedProducts];
			}
			this.setState({
				products: receivedProducts,
				productsQuantity: json.data.total_count,
				pages: Math.ceil(Math.ceil(json.data.total_count / (options ? options.limit : this.defaultLimit))),
				isLoading: false,
			});
		} catch (e) {
			console.error(e);
		}
	};

	buyParts = async (item) => {
		const { buyAction } = this.props;
		await buyAction(item);
	};

	productsUpdate = async (currentOptions, newPaginationType, currentPage) => {
		const { options, currentPageNumber } = this.state;
		const { toggleActiveProduct } = this.props;
		const responseOptions = { ...options, ...currentOptions };
		this.setState({
			options: responseOptions,
			paginationType: newPaginationType,
			currentPageNumber: currentPage || currentPageNumber,
			isLoading: newPaginationType !== "more",
		});
		toggleActiveProduct();
		await this.getParts(responseOptions, newPaginationType === "more");
	};

	render() {
		const { activeProductId, toggleActiveProduct, wsReact, t } = this.props;
		const { products, options, paginationType, pages, currentPageNumber, isLoading } = this.state;
		return (
			<div className="products-page">
				<Row>
					<Col xs={12}>
						<MarketBanner />
						<MarketSelectFilter options={options} paginationType={paginationType} productsUpdate={this.productsUpdate} />
						<div className="page-information-wrapper">
							<div className="information-icon-wrapper">
								<img src={infoIcon} width={24} height={24} alt="info" />
							</div>
							<p className="information-text">
								{t("market.infoPartsPlay")}{" "}
								<Link to={`${getLanguagePrefix(this.props.language)}/game/choose_game`}>
									<span>{t("market.games")}</span>
								</Link>
							</p>
						</div>
						<div className="page-information-wrapper">
							<div className="information-icon-wrapper">
								<img src={infoIcon} width={24} height={24} alt="info" />
							</div>
							<p className="information-text">{t("market.partsWillBe")}</p>
						</div>
					</Col>
				</Row>
				<Row>
					{!isLoading &&
						products.map((item) => (
							<MarketPartCard wsReact={wsReact} key={item.id} item={item} activeProductId={activeProductId} toggleActiveProduct={toggleActiveProduct} buyAction={this.buyParts} />
						))}
				</Row>
				{isLoading && (
					<div className="market-preloader">
						<LazyLoad offset={100}>
							<img src={loaderImg} height={126} width={126} className="loader-img" alt="sales" />
						</LazyLoad>
					</div>
				)}
				{!isLoading && +pages > 1 && (
					<MarketPagination pagesQty={pages} paginationType={paginationType} currentPageNumber={currentPageNumber} options={options} productsUpdate={this.productsUpdate} />
				)}
			</div>
		);
	}
}

export default withTranslation("Game")(connect(mapStateToProps, null)(MarketParts));
