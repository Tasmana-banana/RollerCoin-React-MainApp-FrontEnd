import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { Col, Row } from "reactstrap";
import LazyLoad from "react-lazyload";
import { withTranslation } from "react-i18next";
import fetchWithToken from "../../services/fetchWithToken";
import parseMarketProducts from "../../services/parseMarketProducts";
import MarketBanner from "./MarketBanner";
import MarketAppearanceCard from "./MarketAppearanceCard";
import MarketSelectFilter from "./MarketSelectFilter";
import MarketPagination from "./MarketPagination";
import InfoBlockWithIcon from "../SingleComponents/InfoBlockWithIcon";

import successIcon from "../../assets/img/icon/success_notice.svg";
import loaderImg from "../../assets/img/loader_sandglass.gif";

const mapStateToProps = (state) => ({
	balance: state.game.balance,
	language: state.game.language,
	isMobile: state.game.isMobile,
});

class MarketAppearances extends Component {
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

	static renderToast(text, icon) {
		return (
			<div className="content-with-image">
				<img src={icon} alt="market notification" />
				<span>{text}</span>
			</div>
		);
	}

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
			isLoading: true,
		};
		this.defaultLimit = 24;
		this.toastDefaultConfig = {
			position: "top-left",
			autoClose: 3000,
			hideProgressBar: true,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
		};
		this.controllers = {};
		this.signals = {};
	}

	componentDidMount() {
		this.getAppearances(this.state.options, false);
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

	getAppearances = async (options, isLoadMore) => {
		const { products } = this.state;
		this.setState({
			isLoading: true,
		});
		const apiUrl = options
			? `/api/market/get-appearances?sort=${options.sort}&sort_direction=${options.sort_direction}&skip=${options.skip}&limit=${options.limit}`
			: `/api/market/get-appearances`;
		this.createSignalAndController("appearances");
		try {
			const json = await fetchWithToken(apiUrl, {
				method: "GET",
				signal: this.signals.appearances,
			});
			if (!json.success) {
				return 0;
			}
			let receivedProducts = json.data.items.map((item) => parseMarketProducts(item, "appearance"));
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

	setAppearance = async (appearanceID) => {
		const { products } = this.state;
		this.createSignalAndController("setSkin");
		try {
			const json = await fetchWithToken(`/api/market/set-appearance`, {
				method: "POST",
				body: JSON.stringify({ id: appearanceID }),
				signal: this.signals.setSkin,
			});
			if (!json.success) {
				return false;
			}
			const newProducts = products.map((item) => {
				if (item.selected && item.id !== appearanceID) {
					return { ...item, selected: false };
				}
				if (item.id === appearanceID) {
					return { ...item, selected: true, userHas: true };
				}
				return item;
			});
			this.setState({
				products: newProducts,
			});
			toast(this.constructor.renderToast("Skin selected", successIcon), this.toastDefaultConfig);
		} catch (e) {
			console.error(e);
		}
	};

	buySkin = async (item) => {
		const { buyAction } = this.props;
		const isBuySuccess = await buyAction(item);
		if (isBuySuccess) {
			await this.setAppearance(item.id);
		}
	};

	productsUpdate = async (currentOptions, newPaginationType, currentPage) => {
		const { toggleActiveProduct } = this.props;
		const { options, currentPageNumber } = this.state;
		const responseOptions = { ...options, ...currentOptions };
		this.setState({
			options: responseOptions,
			paginationType: newPaginationType,
			currentPageNumber: currentPage || currentPageNumber,
		});
		toggleActiveProduct();
		await this.getAppearances(responseOptions, newPaginationType === "more");
	};

	render() {
		const { wsReact, isMobile } = this.props;
		const { products, options, paginationType, pagesQty, currentPageNumber, isLoading } = this.state;
		return (
			<>
				{<InfoBlockWithIcon tName="Game" message="marketSkinsInfoMessage" obj="infoHints" showButtons={isMobile} />}
				<div className="products-page">
					<Row>
						<Col xs={12}>
							<MarketBanner />
							<MarketSelectFilter options={options} paginationType={paginationType} productsUpdate={this.productsUpdate} />
						</Col>
					</Row>
					<Row>
						{!isLoading &&
							products
								.filter((item) => item.userAvailable && (!item.isNotForSale || item.userHas))
								.map((item) => <MarketAppearanceCard key={item.id} wsReact={wsReact} item={item} buyAction={this.buySkin} isSetAvailable={true} setAppearance={this.setAppearance} />)}
					</Row>
					{isLoading && (
						<div className="market-preloader">
							<LazyLoad offset={100}>
								<img src={loaderImg} height={126} width={126} className="loader-img" alt="preloader" />
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

export default withTranslation("Game")(connect(mapStateToProps, null)(MarketAppearances));
