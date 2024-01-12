/* eslint-disable no-await-in-loop */
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Row, Col } from "reactstrap";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import CraftOfferCard from "./CraftOfferCard";
import InfoBlockWithIcon from "../../SingleComponents/InfoBlockWithIcon";
import CountdownTimer from "./CountdownTimer";
import fetchWithToken from "../../../services/fetchWithToken";

import "../../../assets/scss/Market/MarketCraftOffer/main.scss";

import craftOfferBtnIcon from "../../../assets/img/market/crafting_offer_btn_icon.svg";
import loaderImg from "../../../assets/img/loader_sandglass.gif";

const renderToast = (text, icon) => (
	<div className="content-with-image">
		<img src={`/static/img/icon/${icon}.svg`} alt={icon} />
		<span>{text}</span>
	</div>
);

const CraftOffer = ({ isMobile, wsReact }) => {
	const { t } = useTranslation("Game");
	const language = useSelector((state) => state.game.language);
	const [isLoading, setIsLoading] = useState(false);
	const [items, setItems] = useState([]);
	const [previousItems, setPreviousItems] = useState([]);
	const [endEventDate, setEndEventDate] = useState(new Date().toISOString());
	const [offerTitle, setOfferTitle] = useState({ en: "Crafting offer", cn: "Crafting offer" });

	const signals = {};
	const controllers = {};

	useEffect(async () => {
		await getCraftOffers();
	}, []);

	const refreshBalance = () => {
		wsReact.send(
			JSON.stringify({
				cmd: "balance_request",
			})
		);
	};

	const createSignalAndController = (id) => {
		if (controllers[id]) {
			controllers[id].abort();
		}
		controllers[id] = new AbortController();
		signals[id] = controllers[id].signal;
	};

	const getCraftOffers = async () => {
		setIsLoading(true);
		createSignalAndController("offers");
		const apiUrl = "/api/market/crafting-offers/list";

		try {
			const offers = await fetchWithToken(apiUrl, {
				method: "GET",
				signal: signals.offers,
			});
			setItems(offers.data.offer.recipes);
			setPreviousItems(offers.data.restCrafts);
			setEndEventDate(offers.data.offer.to);
			setOfferTitle(offers.data.offer.title);
		} catch (err) {
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	};

	const moveMinerToInventory = async (minerID) => {
		createSignalAndController("moveMinerToInventory");
		const json = await fetchWithToken(`/api/game/move-miner-to-inventory`, {
			method: "POST",
			body: JSON.stringify({ miner_id: minerID }),
			signal: signals.moveMinerToInventory,
		});
		if (!json.success) {
			throw new Error(json.error);
		}
	};

	const craftRecipe = async (id, minersToMoveIds) => {
		setIsLoading(true);
		if (minersToMoveIds.length) {
			for (let i = 0; i < minersToMoveIds.length; i += 1) {
				await moveMinerToInventory(minersToMoveIds[i]);
			}
		}

		createSignalAndController("craftRecipe");
		const apiUrl = "/api/market/crafting-offers/add-crafting-task";

		try {
			const response = await fetchWithToken(apiUrl, {
				method: "POST",
				body: JSON.stringify({ mutation_id: id }),
				signal: signals.craftRecipe,
			});
			if (!response.success) {
				return toast(renderToast(response.error, "error_notice"));
			}
			const craftItems = items.map((item) => {
				if (item._id === id) {
					item.progress.is_in_progress = true;
				}
				return item;
			});
			setItems(craftItems);
			toast(renderToast("Craft successfully started!", "success_notice"));
			refreshBalance();
		} catch (err) {
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	};

	const claimRecipe = async ({ mutationId, offerId, isFree = false }) => {
		setIsLoading(true);
		createSignalAndController("claimRecipe");
		const apiUrl = "/api/market/crafting-offers/claim-task";
		try {
			const response = await fetchWithToken(apiUrl, {
				method: "POST",
				signal: signals.claimRecipe,
				body: JSON.stringify({ mutation_id: mutationId, offer_id: offerId, is_free: isFree }),
			});

			if (!response.success) {
				return toast(renderToast(response.error, "error_notice"));
			}
			toast(renderToast("Miner successfully crafted and moved to Storage", "success_notice"));
			refreshBalance();
			await getCraftOffers();
		} catch (err) {
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="crafting-wrapper">
			{!isLoading && <InfoBlockWithIcon tName="Game" message="craftingOfferInfoMessage" obj="infoHints" showButtons />}
			{!!items && !!items.length && (
				<div className="crafting-offers">
					{isMobile && (
						<div className="crafting-title-mobile">
							<h1 className="crafting-title">{offerTitle[language] || offerTitle.en}</h1>
						</div>
					)}
					<div className="crafting-title-block">
						{!isMobile && <h1 className="crafting-title">{offerTitle[language] || offerTitle.en}</h1>}
						<CountdownTimer date={endEventDate} />
					</div>

					<Row className="products-wrapper">
						{items.map((item) => (
							<CraftOfferCard key={item._id} item={item} craftRecipe={craftRecipe} claimRecipe={claimRecipe} getCraftOffers={getCraftOffers} isOnlyOne={items.length === 1} />
						))}
					</Row>
				</div>
			)}

			{!!previousItems && !!previousItems.length && (
				<div className="crafting-offers previous-crafting">
					<div className="crafting-title-block">
						<h2 className="crafting-title">{t("market.craftingOffer.previousOfferTitle")}</h2>
					</div>

					{!isMobile && (
						<div className="substrate-wrapper">
							<Row className="substrate-row">
								<Col xs={12} lg={4} className="substrate-card-wrapper">
									<div className="substrate-card-container">
										<img src={craftOfferBtnIcon} alt="" width={64} />
									</div>
								</Col>
								<Col xs={12} lg={4} className="substrate-card-wrapper">
									<div className="substrate-card-container">
										<img src={craftOfferBtnIcon} alt="" width={64} />
									</div>
								</Col>
								<Col xs={12} lg={4} className="substrate-card-wrapper">
									<div className="substrate-card-container">
										<img src={craftOfferBtnIcon} alt="" width={64} />
									</div>
								</Col>
							</Row>
						</div>
					)}

					<Row className="products-wrapper">
						{previousItems.map((item) => (
							<CraftOfferCard key={item._id} item={item} craftRecipe={craftRecipe} claimRecipe={claimRecipe} getCraftOffers={getCraftOffers} />
						))}
					</Row>
				</div>
			)}

			{isLoading && (
				<div className="crafting-preloader-layer">
					<img src={loaderImg} height="126" width="126" className="loader-img" alt="preloader" />
				</div>
			)}
		</div>
	);
};

CraftOffer.propTypes = {
	isMobile: PropTypes.bool.isRequired,
	wsReact: PropTypes.object.isRequired,
};

export default CraftOffer;
