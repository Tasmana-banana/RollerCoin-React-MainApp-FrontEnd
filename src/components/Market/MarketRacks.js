import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Col, Row } from "reactstrap";
import LazyLoad from "react-lazyload";
import { withTranslation } from "react-i18next";
import fetchWithToken from "../../services/fetchWithToken";
import parseMarketProducts from "../../services/parseMarketProducts";
import MarketBanner from "./MarketBanner";
import MarketProductCard from "./MarketProductCard";
import MarketSelectFilter from "./MarketSelectFilter";
import MarketPagination from "./MarketPagination";
import InfoBlockWithIcon from "../SingleComponents/InfoBlockWithIcon";

import loaderImg from "../../assets/img/loader_sandglass.gif";

const mapStateToProps = (state) => ({
	balance: state.game.balance,
	language: state.game.language,
	isMobile: state.game.isMobile,
});

class MarketRacks extends Component {
	static propTypes = {
		balance: PropTypes.number.isRequired,
		language: PropTypes.string.isRequired,
		toggleActiveProduct: PropTypes.func.isRequired,
		activeProductId: PropTypes.string.isRequired,
		buyAction: PropTypes.func.isRequired,
		wsReact: PropTypes.object.isRequired,
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
			pagesQty: 1,
			paginationType: "all",
			isShowImg: false,
			showImgUrl: "",
			isLoading: true,
		};
		this.defaultLimit = 24;
		this.controller = new AbortController();
		this.signal = this.controller.signal;
	}

	componentDidMount() {
		this.getRacks(this.state.options, false);
	}

	componentWillUnmount() {
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

	getRacks = async (options, isLoadMore) => {
		const { products } = this.state;
		const apiUrl = options ? `/api/market/get-racks?sort=${options.sort}&sort_direction=${options.sort_direction}&skip=${options.skip}&limit=${options.limit}` : `/api/market/get-racks`;
		this.createSignalAndController();
		try {
			const json = await fetchWithToken(apiUrl, {
				method: "GET",
				signal: this.signal,
			});
			if (!json.success) {
				return false;
			}
			let receivedProducts = json.data.items.map((item) => parseMarketProducts(item, "rack"));
			if (isLoadMore) {
				receivedProducts = [...products, ...receivedProducts];
			}
			this.setState({
				products: receivedProducts,
				productsQuantity: json.data.total_count,
				pagesQty: Math.ceil(json.data.total_count / (options ? options.limit : this.defaultLimit)),
				isLoading: false,
			});
		} catch (e) {
			console.error(e);
		}
	};

	buyRack = async (item) => {
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
		await this.getRacks(responseOptions, newPaginationType === "more");
	};

	render() {
		const { activeProductId, toggleActiveProduct, wsReact, isMobile } = this.props;
		const { products, options, paginationType, pagesQty, currentPageNumber, isLoading } = this.state;
		return (
			<>
				{<InfoBlockWithIcon tName="Game" message="marketRacksInfoMessage" obj="infoHints" showButtons={isMobile} />}
				<div className="products-page">
					<Row>
						<Col xs={12}>
							<MarketBanner />
							<MarketSelectFilter options={options} paginationType={paginationType} productsUpdate={this.productsUpdate} />
						</Col>
					</Row>
					<Row>
						{!isLoading &&
							products.map((item) => (
								<MarketProductCard wsReact={wsReact} key={item.id} item={item} activeProductId={activeProductId} toggleActiveProduct={toggleActiveProduct} buyAction={this.buyRack} />
							))}
					</Row>
					{isLoading && (
						<div className="market-preloader">
							<LazyLoad offset={100}>
								<img src={loaderImg} height={126} width={126} className="loader-img" alt="sales" />
							</LazyLoad>
						</div>
					)}
					{+pagesQty > 1 && (
						<MarketPagination pagesQty={pagesQty} paginationType={paginationType} currentPageNumber={currentPageNumber} options={options} productsUpdate={this.productsUpdate} />
					)}
				</div>
			</>
		);
	}
}

export default withTranslation("Game")(connect(mapStateToProps, null)(MarketRacks));
