import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { Row } from "reactstrap";
import LazyLoad from "react-lazyload";
import { withTranslation } from "react-i18next";
import fetchWithToken from "../../services/fetchWithToken";
import MarketBanner from "./MarketBanner";
import MarketHatCard from "./MarketHatCard";
import InfoBlockWithIcon from "../SingleComponents/InfoBlockWithIcon";

import successIcon from "../../assets/img/icon/success_notice.svg";
import loaderImg from "../../assets/img/loader_sandglass.gif";

const mapStateToProps = (state) => ({
	language: state.game.language,
	isMobile: state.game.isMobile,
});

class MarketHats extends Component {
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
			isLoading: true,
			isProcess: false,
			selectedHatID: "",
		};
		this.defaultHat = {
			id: null,
			title: {
				en: "Default",
				cn: "Default",
			},
			description: {
				en: "",
				cn: "",
			},
			is_available: true,
		};
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
		this.getHats();
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

	getHats = async () => {
		this.setState({ isLoading: true });
		this.createSignalAndController("getHats");
		try {
			const json = await fetchWithToken("/api/market/get-hats", {
				method: "GET",
				signal: this.signals.getHats,
			});
			if (!json.success) {
				return false;
			}
			if (!json.data.items.length) {
				return this.setState({
					selectedHatID: "",
				});
			}
			const sortedItems = json.data.items.sort((a, b) => b.sort - a.sort);
			const selectedHat = sortedItems.find((item) => item.is_selected);
			this.setState({
				products: sortedItems,
				selectedHatID: selectedHat ? selectedHat.id : "",
			});
		} catch (e) {
			console.error(e);
		} finally {
			this.setState({ isLoading: false });
		}
	};

	setHat = async (hatID) => {
		this.createSignalAndController("setHat");
		const body = {
			id: hatID || null,
			is_default: !hatID,
		};
		this.setState({ isProcess: true });
		try {
			const json = await fetchWithToken(`/api/market/set-hat`, {
				method: "POST",
				body: JSON.stringify(body),
				signal: this.signals.setHat,
			});
			if (!json.success) {
				return false;
			}
			this.setState({
				selectedHatID: hatID || "",
			});
			toast(this.constructor.renderToast("Hat selected", successIcon), this.toastDefaultConfig);
		} catch (e) {
			console.error(e);
		} finally {
			this.setState({ isProcess: false });
		}
	};

	buyHat = async (hatID) => {
		const { products } = this.state;
		const { buyAction } = this.props;
		this.setState({ isProcess: true });
		const isBuySuccess = await buyAction({ id: hatID, type: "hat", qty: 1 });
		if (isBuySuccess) {
			const changedAvailableProducts = products.map((item) => ({ ...item, is_available: item.id === hatID || item.is_available }));
			this.setState({
				products: changedAvailableProducts,
			});
			await this.setHat(hatID);
		}
		this.setState({ isProcess: false });
	};

	render() {
		const { isMobile } = this.props;
		const { products, selectedHatID, isLoading, isProcess } = this.state;
		return (
			<>
				{!isLoading && <InfoBlockWithIcon tName="Game" message="avatarHatsInfoMessage" obj="infoHints" showButtons={isMobile} />}
				<div className="products-page">
					<MarketBanner />
					<Row>
						{!isLoading && (
							<Fragment>
								<MarketHatCard item={this.defaultHat} selectedHatID={selectedHatID} isProcess={isProcess} setHat={this.setHat} />
								{products.map((item) => (
									<MarketHatCard key={item.id} item={item} selectedHatID={selectedHatID} isProcess={isProcess} setHat={this.setHat} buyHat={this.buyHat} />
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
				</div>
			</>
		);
	}
}

export default withTranslation("Game")(connect(mapStateToProps, null)(MarketHats));
