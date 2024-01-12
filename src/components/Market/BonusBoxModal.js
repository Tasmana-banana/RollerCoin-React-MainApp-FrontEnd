import React, { Component, Fragment } from "react";
import { Modal, ModalBody } from "reactstrap";
import Spritesheet from "react-responsive-spritesheet";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import getPrefixPower from "../../services/getPrefixPower";

import "../../assets/scss/Market/BonusBoxModal.scss";
import closeImage from "../../assets/img/header/close_menu.svg";
import rltLootbox from "../../assets/img/market/lootboxes/winnings/rlt_lootboxes.gif";
import rstLootbox from "../../assets/img/market/lootboxes/winnings/rst_lootboxes.gif";
import ethLootbox from "../../assets/img/market/lootboxes/winnings/eth_lootboxes.gif";
import bnbLootbox from "../../assets/img/market/lootboxes/winnings/bnb_lootboxes.gif";
import dogeLootbox from "../../assets/img/market/lootboxes/winnings/doge_lootboxes.gif";
import powerLootbox from "../../assets/img/market/lootboxes/winnings/power_lootboxes.png";
import cartIcon from "../../assets/img/cart.svg";

class BonusBoxModal extends Component {
	static propTypes = {
		t: PropTypes.func.isRequired,
		isOpen: PropTypes.bool.isRequired,
		closeModal: PropTypes.func.isRequired,
		boxContent: PropTypes.object.isRequired,
		language: PropTypes.string.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			isBackLightEnable: false,
			isBonusEnable: false,
			isTextEnable: false,
		};
		this.animationConfig = [
			{
				frame: 27,
				callback: () => this.enableEffect("isBackLightEnable"),
			},
			{
				frame: 33,
				callback: () => this.enableEffect("isBonusEnable"),
			},
			{
				frame: 37,
				callback: () => this.enableEffect("isTextEnable"),
			},
		];
	}

	enableEffect = (name) => {
		if (!this.state[name]) {
			this.setState({ [name]: true });
		}
	};

	skipAnimation = (spriteSheet) => {
		spriteSheet.goToAndPlay(50);
		this.setState({
			isBackLightEnable: true,
			isBonusEnable: true,
			isTextEnable: true,
		});
	};

	render() {
		const { isOpen, closeModal, boxContent, language, t } = this.props;
		const { isBackLightEnable, isBonusEnable, isTextEnable } = this.state;
		const { hashDetail, power } = getPrefixPower(boxContent.power);

		return (
			<Modal isOpen={isOpen} toggle={closeModal} centered={true} className="box-present-modal">
				<ModalBody className="present-modal-wrapper">
					<div className="present-modal-close">
						<button className="tree-dimensional-button close-menu-btn btn-default" onClick={closeModal}>
							<span className="close-btn-text">
								<img src={closeImage} width="12" height="12" alt="Close modal window" />
							</span>
						</button>
					</div>
					<div className="lootbox-block">
						<div className={`bonus-info ${isTextEnable ? "enable" : ""}`}>
							<h2 className="info-title" style={{ color: `#${boxContent.baseColor}` }}>
								{["RLT", "RST", "ETH", "BNB", "DOGE"].includes(boxContent.type) && `${boxContent.amount} ${boxContent.type}`}
								{boxContent.type === "power" && (
									<Fragment>
										<span>+{boxContent.amount} Gh/s</span>
										<br />
										<span>{boxContent.ttl} days</span>
									</Fragment>
								)}
								{(["miner", "rack", "mutation_component"].includes(boxContent.type) && boxContent.name[language]) || boxContent.name.en}
							</h2>
							{boxContent.type === "miner" && <p className="info-description">{`${power} ${hashDetail}`}</p>}
							{["mutation_component", "battery"].includes(boxContent.type) && <p className="info-description">x{boxContent.amount}</p>}
						</div>
						<div className={`background-light ${isBackLightEnable ? "enable" : ""}`}>
							<img
								className="light"
								src={`${process.env.STATIC_URL}/static/img/market/lootboxes/presentation/back_light/_${boxContent.baseColor}.svg?v=1.0.0`}
								alt={boxContent.baseColor}
							/>
						</div>
						<div className={`lootbox-bonus ${boxContent.type === "mutation_component" ? "component" : ""} ${boxContent.type === "power" ? "power" : ""} ${isBonusEnable ? "enable" : ""}`}>
							{boxContent.type === "miner" && (
								<img className="bonus" src={`${process.env.STATIC_URL}/static/img/market/miners/${boxContent.filename}.gif?v=${boxContent.img_ver}`} alt={boxContent.itemId} />
							)}
							{boxContent.type === "rack" && (
								<img className="bonus" src={`${process.env.STATIC_URL}/static/img/market/lootboxes/winnings/${boxContent.itemId}.png`} alt={boxContent.itemId} />
							)}
							{boxContent.type === "mutation_component" && (
								<img className="bonus" src={`${process.env.STATIC_URL}/static/img/storage/mutation_components/${boxContent.itemId}.png?v=1.0.1`} alt={boxContent.itemId} />
							)}
							{boxContent.type === "RLT" && <img className="bonus" src={rltLootbox} alt="RLT image" />}
							{boxContent.type === "RST" && <img className="bonus" src={rstLootbox} alt="RST image" />}
							{boxContent.type === "ETH" && <img className="bonus" src={ethLootbox} alt="ETH image" />}
							{boxContent.type === "BNB" && <img className="bonus" src={bnbLootbox} alt="BNB image" />}
							{boxContent.type === "DOGE" && <img className="bonus" src={dogeLootbox} alt="DOGE image" />}
							{boxContent.type === "power" && <img className="bonus" src={powerLootbox} alt="power image" />}
							{boxContent.type === "battery" && (
								<img className="bonus" src={`${process.env.STATIC_URL}/static/img/market/batteries/${boxContent.itemId}.png`} width={120} height={97} alt={boxContent.itemId} />
							)}
						</div>
						<div className="lootbox-sprite-block">
							<Spritesheet
								className="lootbox-sprite"
								image={`${process.env.STATIC_URL}/static/img/market/lootboxes/presentation/sprites/${boxContent.lootBoxId}_${boxContent.baseColor}.png?v=1.0.1`}
								widthFrame={430}
								heightFrame={430}
								steps={52}
								fps={12}
								isResponsive={false}
								loop={true}
								onLoopComplete={(spriteSheet) => spriteSheet.setStartAt(30)}
								onEnterFrame={this.animationConfig}
								onClick={(spriteSheet) => this.skipAnimation(spriteSheet)}
							/>
						</div>
						<div className={`collect-button ${isTextEnable ? "enable" : ""}`}>
							<button type="button" className="tree-dimensional-button btn-gold w-100" onClick={closeModal}>
								<span className="with-horizontal-image flex-lg-row button-text-wrapper">
									<img src={cartIcon} alt="cart" />
									<span className="btn-text">{t("market.collect")}</span>
								</span>
							</button>
						</div>
					</div>
				</ModalBody>
			</Modal>
		);
	}
}

export default withTranslation("Game")(BonusBoxModal);
