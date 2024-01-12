import React, { useEffect, useRef, useState } from "react";
import { Row } from "reactstrap";
import PropTypes from "prop-types";
import fetchWithToken from "../../../services/fetchWithToken";
import scrollToElement from "../../../services/scrollToElement";
import MergeSearchAndSortBar from "./MergeSearchAndSortBar";
import MarketPagination from "../../Market/MarketPagination";
import CraftingCard from "./CraftingCard";
import CraftingModal from "./CraftingModal";

import "../../../assets/scss/Storage/Merge/MergeMinersPage.scss";

import loaderImg from "../../../assets/img/loader_sandglass.gif";

const MINERS_SORT_OPTIONS = [
	{
		label: "levelHigh",
		value: {
			sort: "level",
			sort_direction: -1,
		},
	},
	{
		label: "levelLow",
		value: {
			sort: "level",
			sort_direction: 1,
		},
	},
	{
		label: "powerHigh",
		value: {
			sort: "power",
			sort_direction: -1,
		},
	},
	{
		label: "powerLow",
		value: {
			sort: "power",
			sort_direction: 1,
		},
	},
	{
		label: "dateNew",
		value: {
			sort: "created",
			sort_direction: -1,
		},
	},
	{
		label: "dateOld",
		value: {
			sort: "created",
			sort_direction: 1,
		},
	},
];

const defaultOptions = {
	sort: MINERS_SORT_OPTIONS[0].value.sort,
	sort_direction: MINERS_SORT_OPTIONS[0].value.sort_direction,
	skip: 0,
	limit: 6,
};

const MergeMinersPage = ({ wsReact, refreshAllData }) => {
	const [isLoading, setIsLoading] = useState(false);
	const [items, setItems] = useState([]);
	const [options, setOptions] = useState(defaultOptions);
	const [currentPageNumber, setCurrentPageNumber] = useState(1);
	const [pagesQty, setPagesQty] = useState(0);
	const [paginationType, setPaginationType] = useState("all"); // all, page, more
	const [currentRecipeID, setCurrentRecipeID] = useState("");
	const [craftConfirmationID, setCraftConfirmationID] = useState("");
	const [isShowComponentsModal, setIsShowComponentsModal] = useState(false);
	const controller = useRef(null);
	const signal = useRef(null);

	useEffect(async () => {
		return () => {
			if (controller.current) {
				controller.current.abort();
			}
		};
	}, []);

	useEffect(async () => {
		await fetchData();
	}, [options, currentPageNumber]);

	const createSignalAndController = () => {
		if (controller.current) {
			controller.current.abort();
		}
		controller.current = new AbortController();
		signal.current = controller.current.signal;
	};

	const searchAndSortHandler = async (newOptions) => {
		setOptions(newOptions);
		setPaginationType("all");
		setCurrentPageNumber(1);
		setPagesQty(0);
	};

	const paginationHandler = (newOptions, newPaginationType, currentPage) => {
		setOptions(newOptions);
		setPaginationType(newPaginationType);
		setCurrentPageNumber(currentPage);
		if (newPaginationType !== "more") {
			scrollToElement(".user-parts-list", -20);
		}
	};

	const toggleShowComponentsModal = (id) => {
		setIsShowComponentsModal(!isShowComponentsModal);
		setCurrentRecipeID(id || "");
	};

	const craftConfirmationHandler = (id) => {
		setCraftConfirmationID(id || "");
	};

	const fetchData = async () => {
		setIsLoading(true);
		const apiUrl = `/api/storage/crafting-list?item_type=miner&sort=${options.sort}&sort_direction=${options.sort_direction}&skip=${options.skip}&limit=${options.limit}${
			options.search ? `&search=${options.search}` : ""
		}`;
		createSignalAndController();
		try {
			const json = await fetchWithToken(apiUrl, {
				method: "GET",
				signal: signal.current,
			});
			if (!json.success) {
				return false;
			}
			const receivedItems = paginationType === "more" ? [...items, ...json.data.items] : json.data.items;
			setItems(receivedItems);
			setPagesQty(Math.ceil(json.data.total_count / options.limit));
		} catch (e) {
			console.error(e);
		} finally {
			setIsLoading(false);
		}
	};

	const refreshMainData = async () => {
		if (paginationType === "more") {
			setOptions({ ...options, skip: 0 });
			setPaginationType("all");
			setCurrentPageNumber(1);
		}
		await refreshAllData();
		await fetchData();
		refreshBalance();
	};

	const refreshBalance = () => {
		wsReact.send(
			JSON.stringify({
				cmd: "balance_request",
			})
		);
	};

	return (
		<div className="merge-miners-page">
			<MergeSearchAndSortBar options={options} sortOptions={MINERS_SORT_OPTIONS} searchAndSortHandler={searchAndSortHandler} />
			{!!items && !!items.length && (
				<Row>
					{items.map((item) => (
						<CraftingCard
							item={item}
							key={item.id}
							toggleShowComponentsModal={toggleShowComponentsModal}
							refreshMainData={refreshMainData}
							craftConfirmationHandler={craftConfirmationHandler}
							craftConfirmationID={craftConfirmationID}
						/>
					))}
				</Row>
			)}
			{isShowComponentsModal && (
				<CraftingModal recipeID={currentRecipeID} isShowComponentsModal={isShowComponentsModal} toggleShowComponentsModal={toggleShowComponentsModal} refreshMainData={refreshMainData} />
			)}
			{!!pagesQty && <MarketPagination pagesQty={pagesQty} paginationType={paginationType} currentPageNumber={currentPageNumber} options={options} productsUpdate={paginationHandler} />}
			{isLoading && (
				<div className="storage-preloader-layer">
					<img src={loaderImg} height="126" width="126" className="loader-img" alt="preloader" />
				</div>
			)}
		</div>
	);
};

MergeMinersPage.propTypes = {
	wsReact: PropTypes.object.isRequired,
	refreshAllData: PropTypes.func.isRequired,
};

export default MergeMinersPage;
