import React, { Component, Fragment } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Container, Row, Col } from "reactstrap";
import { toast } from "react-toastify";
import decimalAdjust from "../../services/decimalAdjust";
import getCurrencyConfig from "../../services/getCurrencyConfig";
import fetchWithToken from "../../services/fetchWithToken";
import threeDigitDivisor from "../../services/threeDigitDivisor";
import getLanguagePrefix from "../../services/getLanguagePrefix";
import BonusBoxModal from "../../components/Market/BonusBoxModal";

import "../../assets/scss/Static/AdditionalGameEvent.scss";
import anniversaryHeaderDesktop from "../../assets/img/singleComponents/anniversary_header_desktop.png";
import pedestalDesktop from "../../assets/img/singleComponents/pedestal_pink_desktop.png";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	isMobile: state.game.isMobile,
	language: state.game.language,
});

class AdditionalGameEvent extends Component {
	static propTypes = {
		isMobile: PropTypes.bool.isRequired,
		language: PropTypes.string.isRequired,
		history: PropTypes.object.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			eventID: "",
			title: { en: "", cn: "" },
			description: { en: "", cn: "" },
			startDate: new Date(),
			endDate: new Date(),
			mainPrize: { type: "lootbox", _id: "626fef2154530368f12650ef" },
			additionalPrizes: [],
			isAlreadyCollected: true,
			isOpenPresentationModal: false,
			isLoading: false,
			boxContent: {
				amount: 0,
				baseColor: "ffffff",
				itemId: null,
				lootBoxId: null,
				type: null,
				name: null,
				power: 0,
				ttl: 0,
			},
		};
		this.MS_TO_DAYS = 86400000;
		this.controllers = {};
		this.signals = {};
	}

	componentDidMount() {
		this.getEventConfig();
	}

	componentWillUnmount() {
		Object.keys(this.controllers).forEach((key) => {
			if (this.controllers[key]) {
				this.controllers[key].abort();
			}
		});
	}

	static renderToast = (text, icon) => (
		<div className="content-with-image">
			<img src={`/static/img/icon/${icon}.svg`} alt="block_mined" />
			<span>{text}</span>
		</div>
	);

	createSignalAndController = (id) => {
		if (this.controllers[id]) {
			this.controllers[id].abort();
		}
		this.controllers[id] = new AbortController();
		this.signals[id] = this.controllers[id].signal;
	};

	collectPrize = async () => {
		const { isMobile } = this.props;
		const { eventID } = this.state;
		const rltConfig = getCurrencyConfig("RLT");
		this.createSignalAndController("collectPrize");
		try {
			this.setState({ isLoading: true });
			const json = await fetchWithToken("/api/game/collect-additional-game-event-prize", {
				method: "POST",
				body: JSON.stringify({ event_id: eventID }),
				signal: this.signals.collectPrize,
			});
			this.setState({ isLoading: false });
			if (!json.success) {
				const errorText = json.error ? json.error : "Error";
				toast(this.constructor.renderToast(errorText, "error_notice"), {
					position: "top-left",
					autoClose: 3000,
					hideProgressBar: true,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
				});
				return false;
			}
			toast(this.constructor.renderToast("Prizes collected!", "success_notice"), {
				position: `${isMobile ? "bottom-left" : "top-left"}`,
				autoClose: 3000,
				hideProgressBar: true,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
			});
			const lootbox = json.data.find((item) => item.data.item_type === "lootbox");
			const boxContent = lootbox.data.box_content;
			if (boxContent.type === "power") {
				boxContent.ttl = Math.round(boxContent.ttl_time / this.MS_TO_DAYS);
				boxContent.amount = threeDigitDivisor(boxContent.amount);
			}
			if (boxContent.type === "RLT") {
				boxContent.amount = decimalAdjust(boxContent.amount / rltConfig.toSmall, 2);
			}
			this.setState({
				isAlreadyCollected: true,
				isOpenPresentationModal: true,
				boxContent: {
					amount: boxContent.amount,
					baseColor: boxContent.base_color_hex,
					itemId: boxContent.item_id,
					lootBoxId: boxContent.loot_box_id,
					type: boxContent.type,
					name: boxContent.name,
					power: boxContent.power || 0,
					ttl: boxContent.ttl || 0,
					filename: boxContent.filename || "",
				},
			});
		} catch (e) {
			console.error(e);
		}
	};

	getEventConfig = async () => {
		const { history, language } = this.props;
		try {
			this.createSignalAndController("getEventConfig");
			const json = await fetchWithToken("/api/game/additional-game-event-config", {
				method: "GET",
				signal: this.signals.getEventConfig,
			});
			if (!json.success || !json.data) {
				return history.push(`${getLanguagePrefix(language)}/game`);
			}
			const { _id: eventID, title, description, prize_items: prizes, is_already_collected: isAlreadyCollected, start_date: startDate, end_date: endDate } = json.data;
			const mainPrize = prizes.find((item) => item.type === "lootbox");
			const additionalPrizes = prizes.filter((item) => item.type !== "lootbox");
			this.setState({
				eventID,
				title,
				description,
				mainPrize,
				additionalPrizes,
				isAlreadyCollected,
				startDate,
				endDate,
			});
		} catch (e) {
			console.error(e);
		}
	};

	closeModal = () => this.setState({ isOpenPresentationModal: false });

	static getImgPath = (item) => {
		const TYPE_IMG_CONFIG = {
			power: "/static/img/seasonPass/reward_power.png?v=1.0.1",
			money: "/static/img/seasonPass/reward_money.png?v=1.0.1",
			miner: `/static/img/market/miners/${item.filename}.gif?v=1.0.0`,
			rack: `/static/img/market/racks/${item._id}.png?v=1.0.3`,
			trophy: `/static/img/game/room/trophies/${item.file_name}.png?v=1.0.0`,
			mutation_component: `/static/img/storage/mutation_components/${item._id}.png?v=1.0.1`,
			lootbox: `/static/img/market/lootboxes/${item._id}.png?v=1.0.3`,
			hat: `/static/img/market/hats/${item._id}.png?v=1.0.0`,
		};
		return TYPE_IMG_CONFIG[item.type];
	};

	render() {
		const { isMobile, language } = this.props;
		const { isAlreadyCollected, description, mainPrize, additionalPrizes, boxContent, isOpenPresentationModal, isLoading } = this.state;
		return (
			<Fragment>
				{isOpenPresentationModal && <BonusBoxModal isOpen={isOpenPresentationModal} closeModal={this.closeModal} boxContent={boxContent} language={language} />}
				<div className="event-container">
					<div className="event-title">{!isMobile && <img className="event-title-background" src={anniversaryHeaderDesktop} width="1440" height="256" alt="title" />}</div>
					<div className="gradient">
						<Container>
							<Row>
								<Col xs={12} lg={{ size: 6, offset: 3 }}>
									<div className="pedestal-container">
										<div className="main-prize-container">
											<img className="main-prize-img" src={this.getImgPath(mainPrize)} alt="main prize" />
										</div>
										<img src={pedestalDesktop} alt="pedestal" />
									</div>
								</Col>
								<Col xs={12} lg={{ size: 6, offset: 3 }}>
									<div className="event-info-container">
										<div className="event-description-wrapper">
											<div className="event-inner-description" dangerouslySetInnerHTML={{ __html: description[language] || description.en }} />
											<div className="additional-prizes-wrapper">
												{additionalPrizes.map((item) => (
													<img key={item._id} className="additional-prize-img" src={this.getImgPath(item)} alt={item.type} />
												))}
											</div>
											<p className="event-description bolded-text gold-color">Get your presents right now and let the biggest Birthday Party ever begin!</p>
										</div>
										<div className="collect-button">
											<button type="button" className="tree-dimensional-button btn-gold w-100" onClick={this.collectPrize} disabled={isLoading || isAlreadyCollected}>
												<span className="button-text-wrapper">
													<span className="btn-text">Open</span>
												</span>
											</button>
										</div>
										{isAlreadyCollected && <p className="footer-info">Your present is unwrapped! Thank you for being with us!</p>}
									</div>
								</Col>
							</Row>
						</Container>
					</div>
				</div>
			</Fragment>
		);
	}
}

export default withRouter(connect(mapStateToProps, null)(AdditionalGameEvent));
