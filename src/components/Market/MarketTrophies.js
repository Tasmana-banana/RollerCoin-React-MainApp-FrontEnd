import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { Row, Col } from "reactstrap";
import LazyLoad from "react-lazyload";
import { withTranslation } from "react-i18next";
import fetchWithToken from "../../services/fetchWithToken";
import getLanguagePrefix from "../../services/getLanguagePrefix";
import InfoBlockWithIcon from "../SingleComponents/InfoBlockWithIcon";
import MarketBanner from "./MarketBanner";
import MarketTrophiesSelectFilter from "./MarketTrophiesSelectFilter";
import MarketTrophiesCard from "./MarketTrophiesCard";
import MarketPagination from "./MarketPagination";

import "../../assets/scss/Market/MarketTrophies.scss";

import successIcon from "../../assets/img/icon/success_notice.svg";
import errorIcon from "../../assets/img/icon/error_notice.svg";
import loaderImg from "../../assets/img/loader_sandglass.gif";
import infoIconImg from "../../assets/img/storage/info_icon_big_round.svg";

const mapStateToProps = (state) => ({
	language: state.game.language,
	isMobile: state.game.isMobile,
});

class MarketTrophies extends Component {
	static propTypes = {
		language: PropTypes.string.isRequired,
		toggleActiveProduct: PropTypes.func.isRequired,
		activeProductId: PropTypes.string.isRequired,
		buyAction: PropTypes.func.isRequired,
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
			selectedTrophiesCount: 0,
			options: {
				sort: "created",
				sort_direction: -1,
				skip: 0,
				limit: 12,
			},
			productsQuantity: 0,
			currentPageNumber: 1,
			pagesQty: 1,
			paginationType: "all",
			isLoading: true,
			isProcess: false,
		};
		this.defaultsTrofiesLimit = 12;
		this.defaultLimit = 12;
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
		this.getTrophies(this.state.options, false);
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

	getTrophies = async (options, isLoadMore) => {
		const { products } = this.state;
		this.setState({ isLoading: true });
		this.createSignalAndController("getTrophies");
		const apiUrl = options ? `/api/market/get-trophies?sort=${options.sort}&sort_direction=${options.sort_direction}&skip=${options.skip}&limit=${options.limit}` : `/api/market/get-trophies`;
		try {
			const json = await fetchWithToken(apiUrl, {
				method: "GET",
				signal: this.signals.getTrophies,
			});
			if (!json.success) {
				return false;
			}
			let sortedItems = json.data.items.sort((a, b) => b.sort - a.sort);

			if (isLoadMore) {
				sortedItems = [...products, ...sortedItems];
			}
			const selectedTrophiesCount = this.defaultsTrofiesLimit - json.data.total_selected;
			this.setState({
				products: sortedItems,
				selectedTrophiesCount,
				productsQuantity: json.data.total_count,
				pagesQty: Math.ceil(Math.ceil(json.data.total_count / (options ? options.limit : this.defaultLimit))),
			});
		} catch (e) {
			console.error(e);
		} finally {
			this.setState({ isLoading: false });
		}
	};

	setTrophies = async (trophiesID, action) => {
		const { products, selectedTrophiesCount } = this.state;

		this.createSignalAndController("setTrophy");
		const body = {
			id: trophiesID,
			action,
		};
		this.setState({ isProcess: true });

		if (action === "set" && !selectedTrophiesCount) {
			this.setState({ isProcess: false });
			return toast(this.constructor.renderToast("Sorry, slots limit", errorIcon), this.toastDefaultConfig);
		}
		try {
			const json = await fetchWithToken(`/api/market/set-trophy`, {
				method: "POST",
				body: JSON.stringify(body),
				signal: this.signals.setTrophy,
			});
			if (!json.success) {
				return false;
			}

			this.setState({
				products: products.map((item) => {
					if (item.user_trophies_id === trophiesID) {
						return { ...item, is_selected: !item.is_selected };
					}
					return item;
				}),
				selectedTrophiesCount:
					action === "set"
						? this.defaultsTrofiesLimit - (this.defaultsTrofiesLimit - (selectedTrophiesCount - 1))
						: this.defaultsTrofiesLimit - (this.defaultsTrofiesLimit - (selectedTrophiesCount + 1)),
			});

			toast(this.constructor.renderToast(action === "set" ? "Trophy selected" : "Trophy removed", successIcon), this.toastDefaultConfig);
		} catch (e) {
			console.error(e);
		} finally {
			this.setState({ isProcess: false });
		}
	};

	productsUpdate = async (currentOptions, newPaginationType, currentPage) => {
		const { options, currentPageNumber } = this.state;
		const responseOptions = { ...options, ...currentOptions };
		this.setState({
			options: responseOptions,
			paginationType: newPaginationType,
			currentPageNumber: currentPage || currentPageNumber,
			isLoading: newPaginationType !== "more",
		});
		await this.getTrophies(responseOptions, newPaginationType === "more");
	};

	render() {
		const { t, isMobile } = this.props;
		const { products, isLoading, isProcess, options, paginationType, pagesQty, currentPageNumber, selectedTrophiesCount } = this.state;
		return (
			<>
				{<InfoBlockWithIcon tName="Game" message="marketTrophiesInfoMessage" obj="infoHints" showButtons={isMobile} />}
				<div className="products-page trophies">
					<Row>
						<Col xs={12}>
							<MarketBanner />
							<MarketTrophiesSelectFilter options={options} paginationType={paginationType} productsUpdate={this.productsUpdate} />
							<div className="page-information-wrapper info-block-with-icon">
								<div className="information-icon-wrapper">
									<img src={infoIconImg} width={24} height={24} alt="info" />
								</div>
								<p className="information-text">
									{t("market.infoGetTrophies")}
									<Link to={`${getLanguagePrefix(this.props.language)}/game/market/season-pass`}>
										<span>{t("market.season-pass")}</span>
									</Link>
								</p>
							</div>
							<div className="page-information-wrapper">
								<p className="slots">
									{t("market.infoAvailibleSlots")}
									<span>
										{selectedTrophiesCount} / {this.defaultsTrofiesLimit}
									</span>
								</p>
							</div>
						</Col>
					</Row>
					<Row>
						{!isLoading && (
							<Fragment>
								{products.map((item) => (
									<MarketTrophiesCard key={item.id} item={item} isProcess={isProcess} setTrophies={this.setTrophies} selectedTrophiesCount={selectedTrophiesCount} />
								))}
							</Fragment>
						)}
					</Row>
					{isLoading && (
						<div className="market-preloader">
							<LazyLoad offset={100}>
								<img src={loaderImg} height={126} width={126} className="loader-img" alt="preloader" />
							</LazyLoad>
						</div>
					)}
					{!isLoading && +pagesQty > 1 && (
						<MarketPagination pagesQty={pagesQty} paginationType={paginationType} currentPageNumber={currentPageNumber} options={options} productsUpdate={this.productsUpdate} />
					)}
				</div>
			</>
		);
	}
}

export default withTranslation("Game")(connect(mapStateToProps, null)(MarketTrophies));
