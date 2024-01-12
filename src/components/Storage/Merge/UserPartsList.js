import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { LazyLoadImage } from "react-lazy-load-image-component";
import SimpleBar from "simplebar-react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import fetchWithToken from "../../../services/fetchWithToken";
import { RARITY_DATA_BY_LEVEL } from "../../../constants/Storage";

import "simplebar-react/dist/simplebar.min.css";
import "../../../assets/scss/Storage/Merge/UserPartsList.scss";

import loaderImg from "../../../assets/img/loader_sandglass.gif";

const partsTypesSortPattern = {
	fan: 0,
	wire: 1,
	hashboard: 2,
};

const UserPartsList = ({ isRefreshPartsData }) => {
	const { t } = useTranslation("Storage");
	const language = useSelector((state) => state.game.language);
	const isMobile = useSelector((state) => state.game.isMobile);
	const [partsList, setPartsList] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const controller = useRef(null);
	const signal = useRef(null);

	useEffect(async () => {
		controller.current = new AbortController();
		signal.current = controller.current.signal;
		await partsData();
		return () => {
			if (controller.current) {
				controller.current.abort();
			}
		};
	}, [isRefreshPartsData]);

	const createSignalAndController = () => {
		if (controller.current) {
			controller.current.abort();
		}
		controller.current = new AbortController();
		signal.current = controller.current.signal;
	};

	const sortPartsList = (parts) => parts.sort((a, b) => partsTypesSortPattern[a.type] - partsTypesSortPattern[b.type]);

	const partsData = async () => {
		setIsLoading(true);
		createSignalAndController();
		try {
			const json = await fetchWithToken("/api/storage/crafting-list-components", {
				method: "GET",
				signal: signal.current,
			});
			if (!json.success) {
				return false;
			}
			const sortedRarityList = json.data.sort((a, b) => a.rarity_group.level - b.rarity_group.level);
			const sortedPartsList = sortedRarityList.map((group) => ({ ...group, items: sortPartsList(group.items) }));
			setPartsList(sortedPartsList);
		} catch (e) {
			console.error(e);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="user-parts-list">
			<p className="user-parts-title">{t("main.availableParts")}</p>
			{isLoading && (
				<div className="parts-list-preloader">
					<img src={loaderImg} height={63} width={63} className="loader-img" alt="preloader" />
				</div>
			)}
			{!isLoading && !!partsList.length && (
				<SimpleBar autoHide={false}>
					<div className={`user-parts-wrapper ${isMobile ? "with-scroll" : ""}`}>
						{partsList.map(({ rarity_group: rarityGroup, items }) => (
							<div key={rarityGroup.title.en || rarityGroup.title.en} className="user-parts-group-wrapper">
								<p className="parts-group-title">
									{rarityGroup.title[language] || rarityGroup.title.en}
									{!!rarityGroup.base_color_hex && (
										<span className="ml-1" style={{ color: `#${rarityGroup.base_color_hex}` }}>
											{RARITY_DATA_BY_LEVEL[rarityGroup.level].roman}
										</span>
									)}
								</p>
								<div className="parts-items-wrapper">
									{items.map((item) => (
										<div key={item._id} className="part-item">
											<div className="part-item-image-wrapper">
												<LazyLoadImage
													alt={item.name[language] || item.name.en}
													height={32}
													width={32}
													src={`${process.env.STATIC_URL}/static/img/storage/mutation_components/${item._id}.png?v=1.0.1`}
													threshold={100}
													className="part-image"
												/>
											</div>
											<p className="user-parts-quantity">{item.count || "-"}</p>
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				</SimpleBar>
			)}
		</div>
	);
};

UserPartsList.propTypes = {
	isRefreshPartsData: PropTypes.bool.isRequired,
	refreshPartsData: PropTypes.func.isRequired,
};

export default UserPartsList;
