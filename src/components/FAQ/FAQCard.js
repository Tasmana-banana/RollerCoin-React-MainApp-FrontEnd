import React, { Component } from "react";
import PropTypes from "prop-types";
import { Row, Collapse, CardBody, Card, CardHeader, CardFooter } from "reactstrap";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { withTranslation } from "react-i18next";
import { withRouter } from "react-router-dom";
import queryString from "query-string";
import { connect } from "react-redux";
import LazyLoad from "react-lazyload";
import scrollToElement from "../../services/scrollToElement";
import fetchWithToken from "../../services/fetchWithToken";

import "../../assets/scss/Static/FAQ.scss";

import arrowUpIcon from "../../assets/img/faq/arrow_up_new.svg";
import arrowDownIcon from "../../assets/img/faq/arrow_down_new.svg";
import taskWhite from "../../assets/img/faq/cards/tasks_white.svg";
import linkIcon from "../../assets/img/faq/link_white.svg";
import likeIcon from "../../assets/img/faq/like.svg";
import likeSelectedIcon from "../../assets/img/faq/like_selected.svg";
import unlikeIcon from "../../assets/img/faq/unlike.svg";
import unlikeSelectedIcon from "../../assets/img/faq/unlike_selected.svg";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	isMobile: state.game.isMobile,
	language: state.game.language,
});

class FAQCard extends Component {
	static propTypes = {
		language: PropTypes.string.isRequired,
		t: PropTypes.func.isRequired,
		isMobile: PropTypes.bool.isRequired,
		location: PropTypes.object.isRequired,
		faqType: PropTypes.oneOf(["main", "offerwalls", "special_event", "spin_event"]).isRequired,
		hideTitle: PropTypes.bool,
		title: PropTypes.string.isRequired,
	};

	constructor(props) {
		super(props);
		this.copyTimeout = 0;
		this.saveHelpfullyTimeout = 0;
		this.state = {
			collapse: null,
			scrollTo: "",
			cards: {
				basics: [],
				mining: [],
				withdrawals: [],
				game: [],
			},
			copiedLinkId: "",
			clickedHelpfullyId: "",
			helpfullyStorage: {},
			mounted: false,
		};
		this.controllers = {};
		this.signals = {};
	}

	componentDidMount() {
		this.getDataForPage(this.props.faqType);
		try {
			this.setState({
				helpfullyStorage: JSON.parse(localStorage.getItem("helpful")) || {},
			});
		} catch (e) {
			this.setState({
				helpfullyStorage: {},
			});
		}
		this.setState({
			mounted: true,
		});
	}

	componentDidUpdate(prevProps, prevState) {
		if (JSON.stringify(prevState.helpfullyStorage) !== JSON.stringify(this.state.helpfullyStorage) && this.state.mounted) {
			localStorage.setItem("helpful", JSON.stringify(this.state.helpfullyStorage));
		}
		if (prevState.scrollTo !== this.state.scrollTo) {
			scrollToElement(`#card_${this.state.scrollTo}`, -20);
		}
	}

	componentWillUnmount() {
		clearTimeout(this.copyTimeout);
		clearTimeout(this.saveHelpfullyTimeout);
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

	toggle = (id) => {
		this.setState({ collapse: this.state.collapse === id ? null : id });
	};

	getDataForPage = async (type) => {
		const { location } = this.props;
		this.createSignalAndController("getDataForPage");
		try {
			const json = await fetchWithToken(`/api/faq/get-data?type=${type}`, {
				method: "GET",
				signal: this.signals.getDataForPage,
			});
			if (!json.success) {
				return false;
			}
			const cards = json.data.faq_data.reduce((acc, card) => {
				const { group } = card;
				if (acc[group]) {
					acc[group].push(card);
					return acc;
				}
				acc[group] = [card];
				return acc;
			}, {});
			const query = queryString.parse(location.search);
			let id = null;
			if (query.question) {
				const findQuestion = json.data.faq_data.find((element) => element.link === query.question);
				if (findQuestion) {
					id = findQuestion._id;
				}
			}
			this.setState({ cards, collapse: id, scrollTo: id });
		} catch (e) {
			console.error(e);
		}
	};

	setCopiedState = (id) => {
		clearTimeout(this.copyTimeout);
		this.setState({
			copiedLinkId: id,
		});
		this.copyTimeout = setTimeout(() => {
			this.setState({
				copiedLinkId: "",
			});
		}, 3000);
	};

	saveHelpfully = async (id, value) => {
		if (Object.keys(this.state.helpfullyStorage).includes(id)) {
			return false;
		}
		clearTimeout(this.saveHelpfullyTimeout);
		this.setState({
			clickedHelpfullyId: id,
		});
		this.saveHelpfullyTimeout = setTimeout(() => {
			this.setState({
				clickedHelpfullyId: "",
			});
		}, 3000);

		this.createSignalAndController("saveHelpfully");
		try {
			const json = await fetchWithToken("/api/faq/save-helpful", {
				method: "POST",
				signal: this.signals.saveHelpfully,
				body: JSON.stringify({
					id,
					type: value,
				}),
			});
			if (!json.success) {
				return false;
			}
			const toStorage = {};
			toStorage[id] = value;
			this.setState({
				helpfullyStorage: { ...this.state.helpfullyStorage, ...toStorage },
			});
		} catch (e) {
			console.error(e);
		}
	};

	render() {
		const { collapse, cards } = this.state;
		const { t, language, location, title } = this.props;

		return (
			<div className="container-faq">
				{Object.keys(cards).map((key, i) => (
					<div className="faq-section" key={key + i}>
						<h2 className="header-lead">{title}</h2>
						{cards[key].map((card) => (
							<Card key={card._id} id={`card_${card._id}`}>
								<CardHeader onClick={() => this.toggle(card._id)} className="">
									<div className={`card-faq-header card-flex-header ${collapse === card._id ? "collapsed" : ""}`}>
										<div className="card-flex-questions">
											<div className="ico-faq">
												<LazyLoad offset="100">
													<img className="ico-img" src={taskWhite} width={18} height={21} alt="faq icon" />
												</LazyLoad>
											</div>
											<div className="text-faq-header" dangerouslySetInnerHTML={{ __html: card.question[language] || card.question.en }} />
										</div>
										<div className="collapse-btn-wrapper">
											<img src={collapse === card._id ? arrowUpIcon : arrowDownIcon} alt="toggle" />
										</div>
									</div>
								</CardHeader>
								<Collapse isOpen={collapse === card._id} className="card-content">
									<CardBody>
										<p className="card-body-item" dangerouslySetInnerHTML={{ __html: card.answer[language] || card.answer.en }} />
									</CardBody>
									<CardFooter className="roller-card-footer">
										<Row noGutters={true} className="align-items-center justify-content-between">
											<CopyToClipboard
												text={`${window.location.protocol}//${window.location.hostname}${location.pathname}?question=${card.link}`}
												onCopy={() => this.setCopiedState(card._id)}
											>
												<p className="share-block">
													<img src={linkIcon} alt="link" />
													<span className="wrapper-small-line" />
													<span className="share-text">
														{this.state.copiedLinkId === card._id && t("copied")}
														{this.state.copiedLinkId !== card._id && t("share")}
													</span>
												</p>
											</CopyToClipboard>
											<p className={`helpful ${Object.keys(this.state.helpfullyStorage).includes(card._id) ? "disabled" : ""}`}>
												<span className="text-help">
													{Object.keys(this.state.helpfullyStorage).includes(card._id) && t("feedback")}
													{!Object.keys(this.state.helpfullyStorage).includes(card._id) && t("helpful")}
												</span>
												<img
													src={
														Object.keys(this.state.helpfullyStorage).includes(card._id) && this.state.helpfullyStorage[card._id] === "useful" ? likeSelectedIcon : likeIcon
													}
													alt="like"
													className="like-unlike"
													onClick={() => this.saveHelpfully(card._id, "useful")}
												/>
												<span className="wrapper-small-line" />
												<img
													src={
														Object.keys(this.state.helpfullyStorage).includes(card._id) && this.state.helpfullyStorage[card._id] === "useless"
															? unlikeSelectedIcon
															: unlikeIcon
													}
													alt="unlike"
													className="like-unlike"
													onClick={() => this.saveHelpfully(card._id, "useless")}
												/>
											</p>
										</Row>
									</CardFooter>
								</Collapse>
							</Card>
						))}
					</div>
				))}
			</div>
		);
	}
}

export default withRouter(withTranslation("FAQ")(connect(mapStateToProps, null)(FAQCard)));
