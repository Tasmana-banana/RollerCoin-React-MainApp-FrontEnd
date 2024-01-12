import React, { Component, Fragment } from "react";
import { Modal, ModalBody } from "reactstrap";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import fetchWithToken from "../../services/fetchWithToken";
import getLanguagePrefix from "../../services/getLanguagePrefix";
import googleAnalyticsPush from "../../services/googleAnalyticsPush";
import { setUserTutorial } from "../../actions/userInfo";

import hamsterLogo from "../../assets/img/hamster.svg";

import "../../assets/scss/Tutorial/GameTutorial.scss";

const mapStateToProps = (state) => ({
	isViewedTutorial: state.user.userViewedTutorial,
	phaserScreenInputManager: state.game.phaserScreenInputManager,
	language: state.game.language,
});

const mapDispatchToProps = (dispatch) => ({
	setGameTutorial: (state) => dispatch(setUserTutorial(state)),
});

class TutorialModal extends Component {
	static propTypes = {
		tutorialCategories: PropTypes.string.isRequired,
		t: PropTypes.func.isRequired,
		setGameTutorial: PropTypes.func.isRequired,
		isViewedTutorial: PropTypes.object.isRequired,
		phaserScreenInputManager: PropTypes.object,
		language: PropTypes.string.isRequired,
		history: PropTypes.object.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			isOpen: true,
			page: 0,
		};
		this.controller = new AbortController();
		this.signal = this.controller.signal;
	}

	componentDidUpdate(prevProps) {
		const { phaserScreenInputManager, tutorialCategories } = this.props;
		if (tutorialCategories === "game" && prevProps.phaserScreenInputManager.enabled !== phaserScreenInputManager.enabled && phaserScreenInputManager.enabled) {
			phaserScreenInputManager.enabled = false;
		}
	}

	componentWillUnmount() {
		const { phaserScreenInputManager, tutorialCategories } = this.props;
		if (this.controller) {
			this.controller.abort();
		}
		if (tutorialCategories === "game" && phaserScreenInputManager) {
			phaserScreenInputManager.enabled = true;
		}
	}

	nextPage = () => this.setState((state) => ({ page: state.page + 1 }));

	close = async (tutorialCategories, redirectLink = "") => {
		if (tutorialCategories === "game") {
			googleAnalyticsPush("onboarding_true_v2", { step: "6th_step" });
		}
		const { history, language } = this.props;
		this.setState({ isOpen: false });
		await this.updateTutorial(tutorialCategories);
		if (redirectLink) {
			history.push(`${getLanguagePrefix(language)}${redirectLink}`);
		}
	};

	modalBodyArray = (tutorialCategories) => {
		const { t } = this.props;
		const categories = {
			choose_game: [
				{
					imgUrl: `${process.env.STATIC_URL}/static/video/tutorial/choose_game/01.mp4`,
					text: (
						<Fragment>
							<h5>{t("tutorial.choose_game.page1_welcome")}</h5>
							<p>{t("tutorial.choose_game.page1_disc")}</p>
						</Fragment>
					),
					btnText: t("tutorial.button_text.next"),
				},
				{
					imgUrl: `${process.env.STATIC_URL}/static/video/tutorial/choose_game/02.mp4`,
					text: <p>{t("tutorial.choose_game.page2_disc")}</p>,
					btnText: t("tutorial.button_text.next"),
				},
				{
					imgUrl: `${process.env.STATIC_URL}/static/video/tutorial/choose_game/03.mp4`,
					text: <p>{t("tutorial.choose_game.page3_disc")}</p>,
					btnText: t("tutorial.button_text.next"),
				},
				{
					imgUrl: `${process.env.STATIC_URL}/static/video/tutorial/choose_game/04.mp4`,
					text: <p>{t("tutorial.choose_game.page4_disc")}</p>,
					btnText: t("tutorial.button_text.lets_go"),
				},
			],
			game: [
				{
					imgUrl: `${process.env.STATIC_URL}/static/video/tutorial/game/01.mp4`,
					text: <p>{t("tutorial.game.page1_disc")}</p>,
					btnText: t("tutorial.button_text.next"),
				},
				{
					imgUrl: `${process.env.STATIC_URL}/static/video/tutorial/game/02.mp4`,
					text: <p>{t("tutorial.game.page2_disc")}</p>,
					btnText: t("tutorial.button_text.next"),
				},
				{
					imgUrl: `${process.env.STATIC_URL}/static/video/tutorial/game/03.mp4`,
					text: <p>{t("tutorial.game.page3_disc")}</p>,
					btnText: t("tutorial.button_text.next"),
				},
				{
					imgUrl: `${process.env.STATIC_URL}/static/video/tutorial/game/04.mp4`,
					text: <p>{t("tutorial.game.page4_disc")}</p>,
					btnText: t("tutorial.button_text.next"),
				},
				{
					imgUrl: `${process.env.STATIC_URL}/static/video/tutorial/game/05.mp4`,
					text: <p>{t("tutorial.game.page5_disc")}</p>,
					btnText: t("tutorial.button_text.close"),
					redirectBtnText: t("tutorial.button_text.edit"),
					redirectLink: "/customize-avatar",
				},
			],
			shop: [
				{
					imgUrl: `${process.env.STATIC_URL}/static/video/tutorial/shop/shop_slide_01.mp4`,
					text: (
						<Fragment>
							<h5>{t("tutorial.shop.page1_welcome")}</h5>
							<p>{t("tutorial.shop.page1_disc")}</p>
						</Fragment>
					),
					btnText: t("tutorial.button_text.next"),
				},
				{
					imgUrl: `${process.env.STATIC_URL}/static/video/tutorial/shop/shop_slide_02.mp4`,
					text: <p>{t("tutorial.shop.page2_disc")}</p>,
					btnText: t("tutorial.button_text.next"),
				},
				{
					imgUrl: `${process.env.STATIC_URL}/static/video/tutorial/shop/shop_slide_03.mp4`,
					text: <p>{t("tutorial.shop.page3_disc")}</p>,
					btnText: t("tutorial.button_text.next"),
				},
				{
					imgUrl: `${process.env.STATIC_URL}/static/video/tutorial/shop/shop_slide_04.mp4`,
					text: <p>{t("tutorial.shop.page4_disc")}</p>,
					btnText: t("tutorial.button_text.got_it"),
				},
			],
			wallet: [
				{
					imgUrl: `${process.env.STATIC_URL}/static/video/tutorial/wallet/wallet_slide_01.mp4`,
					text: <p>{t("tutorial.wallet.page1_disc")}</p>,
					btnText: t("tutorial.button_text.next"),
				},
				{
					imgUrl: `${process.env.STATIC_URL}/static/video/tutorial/wallet/wallet_slide_02.mp4`,
					text: <p>{t("tutorial.wallet.page2_disc")}</p>,
					btnText: t("tutorial.button_text.next"),
				},
				{
					imgUrl: `${process.env.STATIC_URL}/static/video/tutorial/wallet/wallet_slide_03.mp4`,
					text: <p>{t("tutorial.wallet.page3_disc")}</p>,
					btnText: t("tutorial.button_text.next"),
				},
				{
					imgUrl: `${process.env.STATIC_URL}/static/video/tutorial/wallet/wallet_slide_04.mp4`,
					text: <p>{t("tutorial.wallet.page4_disc")}</p>,
					btnText: t("tutorial.button_text.got_it"),
				},
			],
			season_store: [
				{
					imgUrl: `${process.env.STATIC_URL}/static/video/tutorial/season_store/seasonstore_slide_01.mp4`,
					text: <h5>{t("tutorial.season_store.page1_welcome")}</h5>,
					btnText: t("tutorial.button_text.next"),
				},
				{
					imgUrl: `${process.env.STATIC_URL}/static/video/tutorial/season_store/seasonstore_slide_02.mp4`,
					text: <p>{t("tutorial.season_store.page2_disc")}</p>,
					btnText: t("tutorial.button_text.next"),
				},
				{
					imgUrl: `${process.env.STATIC_URL}/static/video/tutorial/season_store/seasonstore_slide_03.mp4`,
					text: <p>{t("tutorial.season_store.page3_disc")}</p>,
					btnText: t("tutorial.button_text.got_it"),
				},
			],
			marketplace: [
				{
					imgUrl: `${process.env.STATIC_URL}/static/video/tutorial/marketplace/marketplace_slide_01.mp4`,
					text: (
						<Fragment>
							<h5>{t("tutorial.marketplace.page1_welcome")}</h5>
							<p>{t("tutorial.marketplace.page1_disc")}</p>
						</Fragment>
					),
					btnText: t("tutorial.button_text.next"),
				},
				{
					imgUrl: `${process.env.STATIC_URL}/static/video/tutorial/marketplace/marketplace_slide_02.mp4`,
					text: <p>{t("tutorial.marketplace.page2_disc")}</p>,
					btnText: t("tutorial.button_text.next"),
				},
				{
					imgUrl: `${process.env.STATIC_URL}/static/video/tutorial/marketplace/marketplace_slide_03.mp4`,
					text: <p>{t("tutorial.marketplace.page3_disc")}</p>,
					btnText: t("tutorial.button_text.next"),
				},
				{
					imgUrl: `${process.env.STATIC_URL}/static/video/tutorial/marketplace/marketplace_slide_04.mp4`,
					text: <p>{t("tutorial.marketplace.page4_disc")}</p>,
					btnText: t("tutorial.button_text.got_it"),
				},
			],
			merge: [
				{
					imgUrl: `${process.env.STATIC_URL}/static/video/tutorial/merge/merge_slide_01.mp4`,
					text: (
						<Fragment>
							<h5>{t("tutorial.merge.page1_welcome")}</h5>
							<p>{t("tutorial.merge.page1_disc")}</p>
						</Fragment>
					),
					btnText: t("tutorial.button_text.next"),
				},
				{
					imgUrl: `${process.env.STATIC_URL}/static/video/tutorial/merge/merge_slide_02.mp4`,
					text: <p>{t("tutorial.merge.page2_disc")}</p>,
					btnText: t("tutorial.button_text.next"),
				},
				{
					imgUrl: `${process.env.STATIC_URL}/static/video/tutorial/merge/merge_slide_03.mp4`,
					text: <p>{t("tutorial.merge.page3_disc")}</p>,
					btnText: t("tutorial.button_text.next"),
				},
				{
					imgUrl: `${process.env.STATIC_URL}/static/video/tutorial/merge/merge_slide_04.mp4`,
					text: <p>{t("tutorial.merge.page4_disc")}</p>,
					btnText: t("tutorial.button_text.got_it"),
				},
			],
		};
		return categories[tutorialCategories];
	};

	updateTutorial = async (tutorialCategories) => {
		const { setGameTutorial, isViewedTutorial } = this.props;
		try {
			const json = await fetchWithToken("/api/profile/user-tutorial-status", {
				method: "POST",
				body: JSON.stringify({ [tutorialCategories]: true }),
				signal: this.signal,
			});
			if (!json.success) {
				return false;
			}
			setGameTutorial({ ...isViewedTutorial, [tutorialCategories]: true });
		} catch (e) {
			console.error(e);
		}
	};

	render() {
		const { isOpen, page } = this.state;
		const { tutorialCategories } = this.props;
		const currentCategories = this.modalBodyArray(tutorialCategories);
		const { imgUrl, text, btnText, redirectBtnText, redirectLink } = currentCategories[page];
		return (
			<Modal isOpen={isOpen} className="game-tutorial-modal" centered={true}>
				<img className="hamster-logo" src={hamsterLogo} alt="HamsterLogo" />
				<ModalBody className="tutorial-body" key={`${tutorialCategories}_${page}`}>
					<video className="tutorial-picture" loop={true} autoPlay={true} height={199} playsInline>
						<source src={imgUrl} type="video/mp4" />
					</video>
					<div className="tutorial-description">{text}</div>
					{page !== currentCategories.length - 1 && (
						<button onClick={this.nextPage} className="tree-dimensional-button close-menu-btn btn-default tutorial-button">
							<span>{btnText}</span>
						</button>
					)}
					{page === currentCategories.length - 1 && (
						<div className={`${redirectBtnText ? "tutorial-buttons-wrapper" : ""}`}>
							<button onClick={() => this.close(tutorialCategories)} className={`tree-dimensional-button close-menu-btn tutorial-button ${redirectBtnText ? "btn-default" : "btn-cyan"}`}>
								<span>{btnText}</span>
							</button>
							{!!redirectBtnText && (
								<button onClick={() => this.close(tutorialCategories, redirectLink)} className="tree-dimensional-button close-menu-btn btn-cyan tutorial-button">
									<span>{redirectBtnText}</span>
								</button>
							)}
						</div>
					)}
				</ModalBody>
			</Modal>
		);
	}
}

export default withTranslation("Game")(connect(mapStateToProps, mapDispatchToProps)(withRouter(TutorialModal)));
