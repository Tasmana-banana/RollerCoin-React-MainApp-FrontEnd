import React, { useState } from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { Modal, ModalBody } from "reactstrap";
import RollerCheckbox from "../SingleComponents/RollerCheckbox";
import RollerButton from "../SingleComponents/RollerButton";

import "../../assets/scss/Marketplace/ConfirmSellPriceModal.scss";

const ConfirmSellPriceModal = ({ isDisplayed, onPriceConfirmed, onPriceCancelled, data, item }) => {
	const { t } = useTranslation("Marketplace");
	const language = useSelector((state) => state.game.language);
	const [agreeValue, setAgreeValue] = useState(false);
	if (!isDisplayed && agreeValue) {
		setAgreeValue(false);
	}
	return (
		<Modal isOpen={isDisplayed} centered className="confirm-sell-price-modal">
			<ModalBody className="modal-body">
				<p className="title">{t("sell.confirmSellPriceModal.title")}</p>
				<p className="description">{t("sell.confirmSellPriceModal.description")}</p>
				<div className="info-container">
					<div className="info-divider"></div>
					<div className="info-row">
						{item.itemType !== "mutation_component" && <p className="info-desc">{item.name[language]}</p>}
						{item.itemType === "mutation_component" && (
							<p className="info-desc">
								<span style={{ color: `#${item.rarityGroup?.baseHexColor || "ffffff"}` }}>{item.rarityGroup?.title[language]} </span>
								{item.name[language]}
							</p>
						)}
						<p className="info-val">
							{data.perItemPrice} {data.currency.toUpperCase()}
						</p>
					</div>
					<div className="info-divider"></div>
					<div className="info-row">
						<p className="info-desc">{t("sell.quantity")}</p>
						<p className="info-val">{data.quantity}</p>
					</div>
					<div className="info-divider"></div>
					<div className="info-row">
						<p className="info-desc">{t("sell.fee")}</p>
						<p className="info-val">
							{data.fee} {data.currency.toUpperCase()}
						</p>
					</div>
					<div className="info-divider"></div>
					<div className="info-row">
						<p className="info-desc">{t("sell.buyerPays")}</p>
						<p className="info-val">
							{data.buyerPays} {data.currency.toUpperCase()}
						</p>
					</div>
					<p className="you-receive-container">
						<span className="you-receive-desc">{t("sell.youReceive")}</span>
						<span className="you-receive-val">
							≈ {data.youReceive} {data.exchangeCurrency.toUpperCase()}
						</span>
					</p>
					<RollerCheckbox
						className="agreement"
						title={
							<span>
								{t("sell.confirmSellPriceModal.agreement.agree")}
								<a href="/terms" target="_blank">
									{t("sell.confirmSellPriceModal.agreement.terms")}
								</a>
							</span>
						}
						value="agreement"
						isChecked={agreeValue}
						handleChange={() => setAgreeValue(!agreeValue)}
					/>
				</div>
				<div className="buttons">
					<RollerButton disabled={!agreeValue} text={t("sell.confirmSellPriceModal.btnSell")} color="cyan" action={onPriceConfirmed} width={100} />
					<RollerButton text={t("sell.confirmSellPriceModal.btnCancel")} color="default" action={onPriceCancelled} width={100} />
				</div>
			</ModalBody>
		</Modal>
	);
};

ConfirmSellPriceModal.propTypes = {
	isDisplayed: PropTypes.bool.isRequired,
	onPriceConfirmed: PropTypes.func.isRequired,
	onPriceCancelled: PropTypes.func.isRequired,
	data: PropTypes.object.isRequired,
	item: PropTypes.object.isRequired,
};

export default ConfirmSellPriceModal;
