import React, { useState, Fragment, useEffect } from "react";
import PropTypes from "prop-types";
import qs from "qs";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Row } from "reactstrap";
import SpecialSortAndFilter from "./SpecialSortAndFilter";
import SpecialEventProductCard from "./SpecialEventProductCard";
import SpecialEventPagination from "./SpecialEventPagination";
import RollerButton from "../../SingleComponents/RollerButton";
import getLanguagePrefix from "../../../services/getLanguagePrefix";
import fetchWithToken from "../../../services/fetchWithToken";
import { ITEM_TYPE } from "../../../constants/Game/itemTypes";
import { BLOCK_TYPES } from "../../../constants/SystemSaleEvent";

import "../../../assets/scss/SystemSaleEvent/SpecialEventProducts.scss";

import emptyProducts from "../../../assets/img/system_sale_event/special_empty_products.png";
import minerIcon from "../../../assets/img/market/miner-active-nav.svg";
import loaderImg from "../../../assets/img/loader_sandglass.gif";

const SpecialEventProducts = ({ userItems, setUserItems, burningItems, maxAmountProductToBurn, handleControlBurningItems, isStartBurnProcessing }) => {
	const { t } = useTranslation("SystemSaleEvent");
	const history = useHistory();
	const isMobile = useSelector((state) => state.game.isMobile);
	const language = useSelector((state) => state.game.language);
	const defaultLimit = isMobile ? 6 : 9;
	const [itemType] = useState(ITEM_TYPE.MINER);
	const [isLoading, setIsLoading] = useState(true);
	const [isMaxSlotsFilled, setIsMaxSlotFilled] = useState(false);

	const [options, setOptions] = useState({
		sort: "power",
		sort_direction: -1,
		skip: 0,
		limit: defaultLimit,
		type: ITEM_TYPE.MINER,
	});
	const [totalPage, setTotalPage] = useState(0);
	const [currentPageNumber, setCurrentPageNumber] = useState(1);
	const [sortOptions, setSortOptions] = useState([
		{
			// index: 0 <= DEFAULT
			label: "powerHigh",
			value: {
				sort: "power",
				sort_direction: -1,
			},
		},
		{
			// index: 1
			label: "powerLow",
			value: {
				sort: "power",
				sort_direction: 1,
			},
		},
		{
			// index: 2
			label: "powerPercentHigh",
			value: {
				sort: "bonus",
				sort_direction: -1,
			},
		},
		{
			// index: 3
			label: "powerPercentLow",
			value: {
				sort: "bonus",
				sort_direction: 1,
			},
		},
		{
			// index: 4
			label: "rewardCountHigh",
			value: {
				sort: "points",
				sort_direction: -1,
			},
		},
		{
			// index: 5
			label: "rewardCountLow",
			value: {
				sort: "points",
				sort_direction: 1,
			},
		},
	]);
	const controllers = {};
	const signals = {};

	useEffect(() => {
		return () => {
			Object.keys(controllers).forEach((key) => {
				if (controllers[key]) {
					controllers[key].abort();
				}
			});
		};
	}, []);

	useEffect(async () => {
		await getUserProducts();
	}, [options]);

	useEffect(() => {
		if (isStartBurnProcessing) {
			setCurrentPageNumber(1);
			setOptions({ ...options, skip: 0 });
		}
	}, [isStartBurnProcessing]);

	useEffect(() => {
		if (burningItems.length === maxAmountProductToBurn || isStartBurnProcessing) {
			return setIsMaxSlotFilled(true);
		}
		setIsMaxSlotFilled(false);
	}, [burningItems, isStartBurnProcessing]);

	const createSignalAndController = (id) => {
		if (controllers[id]) {
			controllers[id].abort();
		}
		controllers[id] = new AbortController();
		signals[id] = controllers[id].signal;
	};

	const getUserProducts = async () => {
		setIsLoading(true);
		createSignalAndController("getUserProducts");
		try {
			const queryParams = {
				...options,
			};
			const json = await fetchWithToken(`/api/system-sales-events/list?${qs.stringify(queryParams)}`, {
				method: "GET",
				signal: signals.getUserProducts,
			});
			if (!json.success) {
				return false;
			}
			setTotalPage(Math.ceil(json.data.total / json.data.limit));
			if (burningItems.length) {
				const burningItemsUserIds = burningItems.map((item) => item.user_item_id);
				return setUserItems(
					json.data.items.map((item) => {
						if (burningItemsUserIds.includes(item.user_item_id)) {
							return { ...item, burning: true };
						}
						return item;
					})
				);
			}
			setUserItems(json.data.items);
		} catch (err) {
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	};

	const paginationAndSortSearchProductsUpdater = (currentOptions, currentPage) => {
		setCurrentPageNumber(currentPage || currentPageNumber);
		setOptions(currentOptions);
	};

	const handleControlToBurn = (itemEl) => {
		const newBurningItems = [...burningItems];
		if (burningItems.length === maxAmountProductToBurn || isStartBurnProcessing) {
			return false;
		}

		newBurningItems.push(itemEl);
		const newItems = userItems.map((item) => {
			if (item.user_item_id === itemEl.user_item_id) {
				return { ...item, burning: true };
			}
			return item;
		});
		setUserItems(newItems);
		handleControlBurningItems(newBurningItems);
	};

	return (
		<Fragment>
			<SpecialSortAndFilter
				sortAndSearchHandler={paginationAndSortSearchProductsUpdater}
				options={options}
				sortOptionsList={sortOptions}
				isDisabledPanel={!userItems.length}
				isLoading={isLoading}
			/>

			<div className="special-products-wrapper">
				{isLoading && (
					<div className="products-preloader-layer">
						<img src={loaderImg} height="126" width="126" className="loader-img" alt="preloader" />
					</div>
				)}
				{!isLoading && (
					<Fragment>
						{!userItems.length && (
							<div className="special-empty-products">
								<img src={emptyProducts} alt="Empty user products" />
								<h3 className="special-empty-title">{t("specialEventProducts.emptyTitle")}</h3>
								<p className="special-empty-text">{t("specialEventProducts.emptyText")}</p>
								<RollerButton
									text={t("specialEventProducts.emptyBtnText")}
									icon={minerIcon}
									color="cyan"
									size="medium"
									className="special-empty-btn"
									action={() => history.push(`${getLanguagePrefix(language)}/game/market/miners`)}
								/>
							</div>
						)}
						{!!userItems.length && (
							<Fragment>
								<div className="special-products-info">
									<p className="special-info-text">{t("specialEventProducts.infoText")}</p>
									{isMobile && (
										<div className="special-slots-block">
											<span>{burningItems.length}</span>/<span>{maxAmountProductToBurn}</span>
										</div>
									)}
								</div>
								<Row className="special-products-list">
									{userItems.map((item) => (
										<SpecialEventProductCard
											key={item.user_item_id}
											item={item}
											itemType={itemType}
											blockType={BLOCK_TYPES.PRODUCTS}
											handleControlToBurn={handleControlToBurn}
											isMaxSlotsFilled={isMaxSlotsFilled}
										/>
									))}
								</Row>
								{!isLoading && totalPage > 1 && (
									<SpecialEventPagination productsUpdate={paginationAndSortSearchProductsUpdater} options={options} currentPageNumber={currentPageNumber} pagesQty={totalPage} />
								)}
							</Fragment>
						)}
					</Fragment>
				)}
			</div>
		</Fragment>
	);
};

SpecialEventProducts.propTypes = {
	burningItems: PropTypes.array.isRequired,
	handleControlBurningItems: PropTypes.func.isRequired,
	userItems: PropTypes.array.isRequired,
	setUserItems: PropTypes.func.isRequired,
	maxAmountProductToBurn: PropTypes.number.isRequired,
	isStartBurnProcessing: PropTypes.bool.isRequired,
};

export default SpecialEventProducts;
